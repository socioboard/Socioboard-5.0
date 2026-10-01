import { TargetOverride, type NetworkId, type PublishError } from '@socioboard/contracts';
import { Prisma } from '@socioboard/db';
import {
  isProviderError,
  ProviderError,
  type AccountCredentials,
  type RateLimits,
  type Registry,
} from '@socioboard/providers';

import {
  defineQueue,
  DelayedError,
  newId,
  typedEvents,
  type Clock,
  type Db,
  type EventBus,
  type Job,
  type Logger,
  type RateBucket,
  type RateLimiter,
  type Storage,
} from '../../platform';
import { resolveContent } from '../posts';
import type { MediaUrlSigner } from '../media';
import type { PublishingEvents } from './events';
import { prepareMedia } from './media';

export interface PublishDeps {
  db: Db;
  storage: Storage | undefined;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  registry: Registry;
  /** Per-account and per-app publishing limits, shared by every worker. */
  rateLimiter: RateLimiter;
  /** media: signed public addresses for networks that fetch files themselves. */
  mediaUrls: MediaUrlSigner;
  /** social-accounts: the token to publish with. */
  getCredentials(
    workspaceId: string,
    accountId: string,
  ): Promise<{ network: NetworkId; credentials: AccountCredentials }>;
  /** social-accounts: the network refused the login's token. */
  markReauthRequired(workspaceId: string, connectionId: string, reason: string): Promise<void>;
  /** posts: the post's status from its targets. */
  recomputeStatus(workspaceId: string, postId: string): Promise<void>;
}

export interface PublishJobData {
  workspaceId: string;
  targetId: string;
  /**
   * Set on scheduled jobs: the target's schedule version when the job was queued. A reschedule,
   * unschedule or publish-now bumps the version, so an older job finds nothing to do.
   */
  scheduleVersion?: number;
}

/** docs/backend/modules/publishing.md: retry with backoff, at most 5 tries. */
export const PUBLISH_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 30_000;

/**
 * Deterministic job id: the same target and try can only be queued once, so a repeated
 * publish-now (or a double click) never posts twice. A retry after a failure is a new try.
 */
export const publishJobId = (targetId: string, tries: number) =>
  `publish-${targetId}-${String(tries)}`;

/** A scheduled target's delayed job: one per schedule version (scheduling, P2-B2). */
export const scheduledJobId = (targetId: string, version: number) =>
  `publish-${targetId}-v${String(version)}`;

/** Waits what the network asked for, else 30 s, 1 min, 2 min, 4 min between tries. */
export function publishBackoff(attemptsMade: number, err?: Error): number {
  if (err instanceof ProviderError && err.retryAfterSec !== null) {
    return Math.max(1, err.retryAfterSec) * 1000;
  }
  return BACKOFF_BASE_MS * 2 ** Math.max(0, attemptsMade - 1);
}

const WAITING = ['pending', 'scheduled', 'publishing'] as const;

/** Rate-limit buckets: one account, and every account on one login's OAuth app. */
export const accountRateKey = (accountId: string) => `publish:account:${accountId}`;
export const appRateKey = (provider: string) => `publish:app:${provider}`;

function rateBuckets(limits: RateLimits, accountId: string, provider: string): RateBucket[] {
  return [
    { key: accountRateKey(accountId), windows: limits.perAccount },
    { key: appRateKey(provider), windows: limits.perApp },
  ];
}

/**
 * A scheduled post goes out at most this late; past it, it fails with a message instead (the
 * `reconcile` job's rule after an outage, and a rate limit's when it would hold a post longer).
 */
export const MAX_LATE_MINUTES = 60;

/** Spreads out jobs held back by the same limit, so they don't all wake at the same moment. */
const RATE_JITTER_MS = 1000;

/**
 * Thrown by publishTarget when a rate limit holds the target back: the job waits until `until`
 * (epoch ms) without using up a try. Nothing was claimed or recorded.
 */
export class PublishDeferred extends Error {
  constructor(readonly until: number) {
    super('Held back by a rate limit');
    this.name = 'PublishDeferred';
  }
}

/**
 * publish: sends one target to its network (publishing.md, "Publish processor steps").
 * Throws only to ask BullMQ for another try; every final outcome is recorded and returns.
 */
export async function publishTarget(
  deps: PublishDeps,
  data: PublishJobData,
  attempt: { isLast: boolean },
): Promise<void> {
  const { db, logger, clock, registry } = deps;
  const events = typedEvents<PublishingEvents>(deps.events);
  const ws = db.forWorkspace(data.workspaceId);

  const target = await ws.postTarget.findUnique({
    where: { id: data.targetId },
    include: {
      post: true,
      account: { include: { connection: { select: { provider: true } } } },
    },
  });
  // Deleted, cancelled, already done or already posted: nothing to do (idempotency).
  if (!target || target.externalPostId || !(WAITING as readonly string[]).includes(target.status)) {
    return;
  }
  // A deleted workspace never publishes (its scheduled posts are cancelled when it's deleted;
  // this covers a job already queued or running then).
  const workspace = await db.client.workspace.findUnique({
    where: { id: data.workspaceId },
    select: { deletedAt: true },
  });
  if (!workspace || workspace.deletedAt) return;
  const scheduled = data.scheduleVersion !== undefined;
  // A scheduled job for an older version (moved, unscheduled or sent now since); and a scheduled
  // target only goes out through its own scheduled job.
  if (scheduled ? target.scheduleVersion !== data.scheduleVersion : target.status === 'scheduled') {
    return;
  }

  // Rate limits: wait for room without using a try. Skipped when this try fails without calling
  // the network anyway (account needs reconnecting, network off). Each try counts once, however
  // often its job runs.
  const network = target.account.network;
  const provider = target.account.connection?.provider;
  // Set when a limit would hold a scheduled post past MAX_LATE_MINUTES: it fails instead.
  let tooLate = false;
  if (target.account.status === 'active' && provider && registry.isEnabled(network)) {
    const wait = await deps.rateLimiter.take(
      rateBuckets(registry.network(network).rateLimits, target.account.id, provider),
      `${target.id}:${String(target.attempts + 1)}`,
    );
    if (wait > 0) {
      const until = clock.now().getTime() + wait + Math.floor(Math.random() * RATE_JITTER_MS);
      const latest =
        scheduled && target.scheduledAt
          ? target.scheduledAt.getTime() + MAX_LATE_MINUTES * 60_000
          : Infinity;
      if (until <= latest) {
        logger.info({ targetId: target.id, network, waitMs: wait }, 'publish held by a rate limit');
        throw new PublishDeferred(until);
      }
      tooLate = true;
    }
  }

  // Claim this try: only one run moves the attempt counter, so two jobs can't both post. A
  // scheduled job also claims its version, so a reschedule committing meanwhile wins or loses
  // as a whole.
  const attemptNo = target.attempts + 1;
  const claimed = await ws.postTarget.updateMany({
    where: {
      id: target.id,
      attempts: target.attempts,
      externalPostId: null,
      ...(scheduled
        ? { scheduleVersion: data.scheduleVersion, status: { in: ['scheduled', 'publishing'] } }
        : {}),
    },
    data: { status: 'publishing', attempts: attemptNo },
  });
  if (claimed.count === 0) return;
  const attemptId = newId();
  await ws.publishAttempt.create({
    data: {
      id: attemptId,
      workspaceId: data.workspaceId,
      postTargetId: target.id,
      attemptNo,
      startedAt: clock.now(),
    },
  });

  try {
    if (target.account.status !== 'active' || !target.account.connectionId) {
      throw new ProviderError({
        kind: 'auth',
        message:
          target.account.status === 'disconnected'
            ? 'This account is disconnected'
            : (target.account.statusReason ?? 'Reconnect this account to post to it'),
      });
    }
    if (!registry.isEnabled(network)) {
      throw new ProviderError({
        kind: 'content',
        message: 'This network is not enabled on this server',
      });
    }
    if (tooLate) {
      throw new ProviderError({
        kind: 'rate_limited',
        message: `${registry.network(network).displayName} limits how often this account can post, and this post would have gone out over an hour late. Pick a new time.`,
      });
    }
    const content = resolveContent(
      target.post,
      TargetOverride.nullable().catch(null).parse(target.override),
    );
    const adapter = registry.network(network);
    const media = await prepareMedia(deps, data.workspaceId, adapter.imagePrep, content.mediaIds);
    const { credentials } = await deps.getCredentials(data.workspaceId, target.account.id);
    const result = await adapter.publish({ ...content, media }, credentials);

    // Saved at once: from here on, a re-run sees externalPostId and never posts again.
    await ws.postTarget.update({
      where: { id: target.id },
      data: {
        status: 'published',
        externalPostId: result.externalId,
        permalink: result.permalink,
        publishedAt: clock.now(),
        lastError: Prisma.DbNull,
      },
    });
    await ws.publishAttempt.update({
      where: { id: attemptId },
      data: {
        outcome: 'published',
        finishedAt: clock.now(),
        // Things that went wrong without failing the post (e.g. the first comment).
        message: result.warnings.length ? result.warnings.join('\n') : null,
      },
    });
    await deps.recomputeStatus(data.workspaceId, target.postId);
    await events.emit('target.published', {
      workspaceId: data.workspaceId,
      postId: target.postId,
      targetId: target.id,
      network,
      externalPostId: result.externalId,
    });
  } catch (err) {
    const failure = isProviderError(err)
      ? err
      : new ProviderError({
          kind: 'retryable',
          message: 'Something went wrong while publishing',
          cause: err,
        });
    if (!isProviderError(err))
      logger.error({ err, targetId: target.id }, 'publish failed unexpectedly');
    const willRetry =
      !tooLate &&
      (failure.kind === 'retryable' || failure.kind === 'rate_limited') &&
      !attempt.isLast;
    const lastError: PublishError = {
      kind: failure.kind,
      networkCode: failure.networkCode,
      message: failure.message,
    };
    await ws.publishAttempt.update({
      where: { id: attemptId },
      data: {
        outcome: willRetry ? 'will_retry' : 'failed',
        finishedAt: clock.now(),
        errorKind: failure.kind,
        networkCode: failure.networkCode,
        message: failure.message,
      },
    });
    await ws.postTarget.update({
      where: { id: target.id },
      data: {
        status: willRetry ? 'publishing' : 'failed',
        lastError: lastError,
      },
    });
    if (
      failure.kind === 'auth' &&
      target.account.connectionId &&
      target.account.status === 'active'
    ) {
      await deps.markReauthRequired(data.workspaceId, target.account.connectionId, failure.message);
    }
    // Our own limit (tooLate) didn't ask the network anything: nothing to pause.
    if (failure.kind === 'rate_limited' && !tooLate) {
      // The network asked us to slow down: hold back everything on that limit (this account,
      // or the whole app) for as long as this target waits, not only this target.
      const key =
        failure.limitScope === 'app' && provider
          ? appRateKey(provider)
          : accountRateKey(target.account.id);
      await deps.rateLimiter.pause(key, publishBackoff(attemptNo, failure)).catch((e: unknown) => {
        logger.warn({ err: e, key }, 'could not pause a rate limit');
      });
    }
    await deps.recomputeStatus(data.workspaceId, target.postId);
    if (willRetry) throw failure;
    await events.emit('target.failed', {
      workspaceId: data.workspaceId,
      postId: target.postId,
      targetId: target.id,
      network,
      errorKind: failure.kind,
      message: failure.message,
    });
  }
}

export const publishQueue = (deps: PublishDeps) =>
  defineQueue<PublishJobData>(
    'publish',
    async (job: Job<PublishJobData>, token?: string) => {
      try {
        await publishTarget(deps, job.data, {
          isLast: job.attemptsMade + 1 >= (job.opts.attempts ?? PUBLISH_ATTEMPTS),
        });
      } catch (err) {
        // Held back by a rate limit: wait, keeping every try.
        if (err instanceof PublishDeferred) {
          await job.moveToDelayed(err.until, token);
          throw new DelayedError();
        }
        throw err;
      }
    },
    {
      jobDefaults: { attempts: PUBLISH_ATTEMPTS, backoff: { type: 'custom' } },
      worker: {
        concurrency: 10,
        settings: {
          backoffStrategy: (attemptsMade, _type, err) => publishBackoff(attemptsMade, err),
        },
      },
    },
  );
