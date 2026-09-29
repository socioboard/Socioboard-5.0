import { TargetOverride, type NetworkId, type PublishError } from '@socioboard/contracts';
import { Prisma } from '@socioboard/db';
import {
  isProviderError,
  ProviderError,
  type AccountCredentials,
  type Registry,
} from '@socioboard/providers';

import {
  defineQueue,
  newId,
  typedEvents,
  type Clock,
  type Db,
  type EventBus,
  type Job,
  type Logger,
  type Storage,
} from '../../platform';
import { resolveContent } from '../posts';
import type { PublishingEvents } from './events';
import { prepareMedia } from './media';

export interface PublishDeps {
  db: Db;
  storage: Storage | undefined;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  registry: Registry;
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

/** Waits what the network asked for, else 30 s, 1 min, 2 min, 4 min between tries. */
export function publishBackoff(attemptsMade: number, err?: Error): number {
  if (err instanceof ProviderError && err.retryAfterSec !== null) {
    return Math.max(1, err.retryAfterSec) * 1000;
  }
  return BACKOFF_BASE_MS * 2 ** Math.max(0, attemptsMade - 1);
}

const WAITING = ['pending', 'scheduled', 'publishing'] as const;

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
    include: { post: true, account: true },
  });
  // Deleted, cancelled, already done or already posted: nothing to do (idempotency).
  if (!target || target.externalPostId || !(WAITING as readonly string[]).includes(target.status)) {
    return;
  }

  // Claim this try: only one run moves the attempt counter, so two jobs can't both post.
  const attemptNo = target.attempts + 1;
  const claimed = await ws.postTarget.updateMany({
    where: { id: target.id, attempts: target.attempts, externalPostId: null },
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
  const network = target.account.network;

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
    const content = resolveContent(
      target.post,
      TargetOverride.nullable().catch(null).parse(target.override),
    );
    const media = await prepareMedia(deps, data.workspaceId, network, content.mediaIds);
    const { credentials } = await deps.getCredentials(data.workspaceId, target.account.id);
    const result = await registry.network(network).publish({ ...content, media }, credentials);

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
      (failure.kind === 'retryable' || failure.kind === 'rate_limited') && !attempt.isLast;
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
    (job: Job<PublishJobData>) =>
      publishTarget(deps, job.data, {
        isLast: job.attemptsMade + 1 >= (job.opts.attempts ?? PUBLISH_ATTEMPTS),
      }),
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
