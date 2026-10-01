import {
  PublishError,
  PublishErrorKind,
  type AdminAccount,
  type HealthRange,
  type AdminOverview,
  type AdminTarget,
  type NetworkHealth,
  type NetworkId,
  type PublishingHealth,
} from '@socioboard/contracts';
import type {
  ListAttentionAccountsQuery,
  ListProblemTargetsQuery,
  PublishingHealthQuery,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';
import type { z } from 'zod';

import {
  afterCursor,
  conflict,
  decodeCursor,
  notFound,
  toPage,
  type AuthContext,
  type Clock,
  type Db,
  type Kv,
} from '../../platform';
import type { AuditLog } from '../audit';
import type { ScheduledJob } from '../posts';

const MINUTE = 60_000;
const DAY = 86_400_000;
/** A target `publishing` this long is stuck (the reconcile job's threshold). */
const STUCK_AFTER_MS = 15 * MINUTE;
/** "Accounts needing attention" on the overview: broken, or expiring within this long. */
const EXPIRING_SOON_MS = 7 * DAY;
/** Heavy aggregates are cached this long (admin.md, Rules). */
const CACHE_SEC = 60;
const RANGE_MS: Record<HealthRange, number> = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY };

export interface AdminServiceDeps {
  db: Db;
  kv: Kv;
  clock: Clock;
  audit: AuditLog;
  /** Every queue the worker runs, for the backlog counts. */
  queueCounts(): Promise<AdminOverview['queues']>;
  /** publishing: queue a try of a target now (publish-now's job id, per target and try). */
  enqueuePublish(job: { workspaceId: string; targetId: string; tries: number }): Promise<void>;
  /** publishing: drop a scheduled target's delayed job (best effort). */
  dropScheduledJobs(jobs: Pick<ScheduledJob, 'targetId' | 'version'>[]): Promise<void>;
  /** posts: a post's status from its targets. */
  recomputeStatus(workspaceId: string, postId: string): Promise<void>;
}

const targetInclude = {
  workspace: { select: { id: true, slug: true, name: true } },
  account: {
    select: { id: true, network: true, displayName: true, username: true, status: true },
  },
  history: { select: { startedAt: true }, orderBy: { attemptNo: 'desc' }, take: 1 },
} as const satisfies Prisma.PostTargetInclude;
type TargetRow = Prisma.PostTargetGetPayload<{ include: typeof targetInclude }>;

/**
 * The platform admin console, v1 (docs/backend/modules/admin.md): publishing across every
 * workspace. Reads never return tokens or post content; every write says why and is audited.
 */
export function createAdminService(deps: AdminServiceDeps) {
  const { db, kv, clock } = deps;

  const isStuck = (t: { status: string; updatedAt: Date }) =>
    t.status === 'publishing' && t.updatedAt.getTime() < clock.now().getTime() - STUCK_AFTER_MS;

  const toTarget = (t: TargetRow): AdminTarget => ({
    id: t.id,
    postId: t.postId,
    workspace: t.workspace,
    account: t.account,
    status: t.status,
    stuck: isStuck(t),
    scheduledAt: t.scheduledAt?.toISOString() ?? null,
    attempts: t.attempts,
    lastAttemptAt: t.history[0]?.startedAt.toISOString() ?? null,
    lastError: t.lastError === null ? null : (PublishError.safeParse(t.lastError).data ?? null),
  });

  /** Cached for CACHE_SEC: the console polls, the database shouldn't feel it. */
  async function cached<T>(key: string, build: () => Promise<T>): Promise<T> {
    const hit = await kv.get(`admin-cache:${key}`);
    if (hit) return JSON.parse(hit) as T;
    const value = await build();
    await kv.set(`admin-cache:${key}`, JSON.stringify(value), CACHE_SEC);
    return value;
  }

  /** Accounts that need reconnecting, or whose token (its own, else its login's) expires soon. */
  const attentionWhere = (
    state: 'expiring' | 'reauth_required' | undefined,
    before: Date,
  ): Prisma.SocialAccountWhereInput => {
    const expiring: Prisma.SocialAccountWhereInput = {
      status: 'active',
      OR: [
        { assetTokenEnc: { not: null }, assetTokenExpiresAt: { lte: before } },
        { assetTokenEnc: null, connection: { tokenExpiresAt: { lte: before } } },
      ],
    };
    const broken: Prisma.SocialAccountWhereInput = { status: 'reauth_required' };
    return {
      workspace: { deletedAt: null },
      ...(state === 'expiring' ? expiring : state === 'reauth_required' ? broken : {}),
      ...(state ? {} : { OR: [broken, expiring] }),
    };
  };

  // ---------------------------------------------------------------- reads

  function overview(): Promise<AdminOverview> {
    return cached('overview', async () => {
      const now = clock.now().getTime();
      const dayAgo = new Date(now - DAY);
      const [signups, active, published, failed, stuck, attention, queues] = await Promise.all([
        db.client.user.count({ where: { createdAt: { gte: dayAgo } } }),
        db.client.workspace.count({
          where: {
            deletedAt: null,
            postTargets: { some: { publishedAt: { gte: new Date(now - 30 * DAY) } } },
          },
        }),
        db.client.postTarget.count({ where: { publishedAt: { gte: dayAgo } } }),
        db.client.publishAttempt.count({
          where: { outcome: 'failed', finishedAt: { gte: dayAgo } },
        }),
        db.client.postTarget.count({
          where: {
            status: 'publishing',
            updatedAt: { lt: new Date(now - STUCK_AFTER_MS) },
            workspace: { deletedAt: null },
          },
        }),
        db.client.socialAccount.count({
          where: attentionWhere(undefined, new Date(now + EXPIRING_SOON_MS)),
        }),
        deps.queueCounts(),
      ]);
      return {
        generatedAt: new Date(now).toISOString(),
        signups24h: signups,
        activeWorkspaces30d: active,
        published24h: published,
        failed24h: failed,
        stuckTargets: stuck,
        accountsNeedingAttention: attention,
        queues,
      };
    });
  }

  function publishingHealth(
    query: z.infer<typeof PublishingHealthQuery>,
  ): Promise<PublishingHealth> {
    return cached(`health:${query.range}:${query.network ?? 'all'}`, async () => {
      const now = clock.now();
      const since = new Date(now.getTime() - RANGE_MS[query.range]);
      const network = query.network ?? null;
      // Final outcomes and retries per network, from the attempts (one row per try).
      const counts = await db.client.$queryRaw<
        { network: NetworkId; published: bigint; failed: bigint; retried: bigint }[]
      >`
        SELECT a.network,
          count(*) FILTER (WHERE pa.outcome = 'published') AS published,
          count(*) FILTER (WHERE pa.outcome = 'failed') AS failed,
          count(*) FILTER (WHERE pa.outcome = 'will_retry') AS retried
        FROM "PublishAttempt" pa
        JOIN "PostTarget" t ON t.id = pa."postTargetId"
        JOIN "SocialAccount" a ON a.id = t."socialAccountId"
        WHERE pa."finishedAt" >= ${since}
          AND (${network}::text IS NULL OR a.network::text = ${network}::text)
        GROUP BY a.network
        ORDER BY a.network`;
      const errors = await db.client.$queryRaw<
        {
          network: NetworkId;
          kind: string;
          networkCode: string | null;
          message: string;
          count: bigint;
        }[]
      >`
        SELECT network, kind, "networkCode", message, count FROM (
          SELECT a.network, pa."errorKind"::text AS kind, pa."networkCode",
            coalesce(pa.message, '') AS message, count(*) AS count,
            row_number() OVER (PARTITION BY a.network ORDER BY count(*) DESC, pa."errorKind"::text,
              coalesce(pa.message, '')) AS rank
          FROM "PublishAttempt" pa
          JOIN "PostTarget" t ON t.id = pa."postTargetId"
          JOIN "SocialAccount" a ON a.id = t."socialAccountId"
          WHERE pa.outcome = 'failed' AND pa."finishedAt" >= ${since}
            AND pa."errorKind" IS NOT NULL
            AND (${network}::text IS NULL OR a.network::text = ${network}::text)
          GROUP BY a.network, pa."errorKind", pa."networkCode", coalesce(pa.message, '')
        ) ranked
        WHERE rank <= 5
        ORDER BY network, count DESC, rank`;
      const networks: NetworkHealth[] = counts.map((c) => {
        const published = Number(c.published);
        const failed = Number(c.failed);
        return {
          network: c.network,
          published,
          failed,
          retried: Number(c.retried),
          successRate: published + failed > 0 ? published / (published + failed) : null,
          topErrors: errors
            .filter((e) => e.network === c.network)
            .map((e) => ({
              kind: PublishErrorKind.catch('retryable').parse(e.kind),
              networkCode: e.networkCode,
              message: e.message,
              count: Number(e.count),
            })),
        };
      });
      return { range: query.range, generatedAt: now.toISOString(), networks };
    });
  }

  async function listProblemTargets(query: z.infer<typeof ListProblemTargetsQuery>) {
    const stuckBefore = new Date(clock.now().getTime() - STUCK_AFTER_MS);
    const failed: Prisma.PostTargetWhereInput = { status: 'failed' };
    const stuck: Prisma.PostTargetWhereInput = {
      status: 'publishing',
      updatedAt: { lt: stuckBefore },
    };
    const rows = await db.client.postTarget.findMany({
      where: {
        AND: [
          { workspace: { deletedAt: null } },
          query.state === 'failed'
            ? failed
            : query.state === 'stuck'
              ? stuck
              : { OR: [failed, stuck] },
          query.workspaceId ? { workspaceId: query.workspaceId } : {},
          query.network ? { account: { network: query.network } } : {},
          query.errorKind ? { lastError: { path: ['kind'], equals: query.errorKind } } : {},
          query.cursor ? afterCursor(decodeCursor(query.cursor)) : {},
        ],
      },
      include: targetInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const page = toPage(rows, query.limit);
    return { items: page.items.map(toTarget), nextCursor: page.nextCursor };
  }

  async function listAttentionAccounts(query: z.infer<typeof ListAttentionAccountsQuery>) {
    const before = new Date(clock.now().getTime() + query.withinDays * DAY);
    const rows = await db.client.socialAccount.findMany({
      where: {
        AND: [
          attentionWhere(query.state, before),
          query.network ? { network: query.network } : {},
          query.cursor ? afterCursor(decodeCursor(query.cursor)) : {},
        ],
      },
      include: {
        workspace: { select: { id: true, slug: true, name: true } },
        connection: { select: { tokenExpiresAt: true } },
        _count: { select: { postTargets: { where: { status: 'scheduled' } } } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const page = toPage(rows, query.limit);
    const items: AdminAccount[] = page.items.map((a) => ({
      id: a.id,
      workspace: a.workspace,
      network: a.network,
      displayName: a.displayName,
      username: a.username,
      status: a.status,
      statusReason: a.statusReason,
      // The token it posts with: its own where it has one, else its login's.
      tokenExpiresAt:
        (a.assetTokenEnc ? a.assetTokenExpiresAt : a.connection?.tokenExpiresAt)?.toISOString() ??
        null,
      lastCheckedAt: a.lastCheckedAt?.toISOString() ?? null,
      scheduledTargets: a._count.postTargets,
    }));
    return { items, nextCursor: page.nextCursor };
  }

  // ---------------------------------------------------------------- actions

  async function findTarget(targetId: string) {
    const t = await db.client.postTarget.findUnique({
      where: { id: targetId },
      include: targetInclude,
    });
    if (!t) throw notFound('TARGET_NOT_FOUND', 'Target not found');
    return t;
  }

  const record = (caller: AuthContext, t: TargetRow, action: string, reason: string) =>
    deps.audit.record({
      workspaceId: t.workspaceId,
      actor: { userId: caller.user.id, type: 'admin' },
      action,
      entity: { type: 'post_target', id: t.id },
      diff: { reason, postId: t.postId, status: t.status },
    });

  /**
   * Publishes a failed or stuck target again, as a new try. A stuck one may already be on the
   * network (that's why reconcile never retries it); the admin decides, and says why.
   */
  async function retryTarget(caller: AuthContext, targetId: string, reason: string) {
    const t = await findTarget(targetId);
    const notRetryable = () =>
      conflict('TARGET_NOT_RETRYABLE', 'Only a failed or stuck delivery can be retried');
    if (t.status !== 'failed' && !isStuck(t)) throw notRetryable();
    const moved = await db.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${t.postId}::uuid FOR UPDATE`;
      return tx.postTarget.updateMany({
        where: { id: t.id, status: t.status, attempts: t.attempts },
        // Touching updatedAt restarts the stuck clock for this try.
        data: { status: 'publishing', updatedAt: clock.now() },
      });
    });
    if (moved.count === 0) throw notRetryable();
    try {
      await deps.enqueuePublish({ workspaceId: t.workspaceId, targetId: t.id, tries: t.attempts });
    } catch (err) {
      if (t.status === 'failed') {
        await db.client.postTarget.updateMany({
          where: { id: t.id, status: 'publishing' },
          data: { status: 'failed' },
        });
      }
      throw err;
    }
    await deps.recomputeStatus(t.workspaceId, t.postId);
    await record(caller, t, 'admin.target_retried', reason);
    return toTarget(await findTarget(t.id));
  }

  /** Stops a delivery that hasn't gone out: failed, stuck, scheduled or waiting. */
  async function cancelTarget(caller: AuthContext, targetId: string, reason: string) {
    const t = await findTarget(targetId);
    const cancellable =
      t.status === 'failed' || t.status === 'scheduled' || t.status === 'pending' || isStuck(t);
    if (!cancellable) {
      throw conflict(
        'TARGET_NOT_CANCELLABLE',
        t.status === 'publishing'
          ? 'This delivery is being published right now'
          : 'This delivery was already published or cancelled',
      );
    }
    const moved = await db.client.postTarget.updateMany({
      where: { id: t.id, status: t.status, updatedAt: t.updatedAt },
      data: { status: 'cancelled' },
    });
    if (moved.count === 0) {
      throw conflict('TARGET_NOT_CANCELLABLE', 'This delivery changed meanwhile; look again');
    }
    if (t.status === 'scheduled') {
      await deps.dropScheduledJobs([{ targetId: t.id, version: t.scheduleVersion }]);
    }
    await deps.recomputeStatus(t.workspaceId, t.postId);
    await record(caller, t, 'admin.target_cancelled', reason);
    return toTarget(await findTarget(t.id));
  }

  return {
    overview,
    publishingHealth,
    listProblemTargets,
    listAttentionAccounts,
    retryTarget,
    cancelTarget,
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
