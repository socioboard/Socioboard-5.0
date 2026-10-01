import type { NetworkId, PublishError } from '@socioboard/contracts';

import {
  defineQueue,
  typedEvents,
  type Clock,
  type Db,
  type EventBus,
  type Logger,
} from '../../platform';
import type { ScheduledJob } from '../posts';
import {
  MAX_LATE_MINUTES,
  PUBLISH_ATTEMPTS,
  publishJobId,
  scheduledJobId,
  type PublishingEvents,
} from '../publishing';

/** A job's state in BullMQ, or `unknown` when there is no such job. */
export type JobState =
  | 'active'
  | 'waiting'
  | 'waiting-children'
  | 'delayed'
  | 'prioritized'
  | 'completed'
  | 'failed'
  | 'unknown';

const LIVE: readonly JobState[] = [
  'active',
  'waiting',
  'waiting-children',
  'delayed',
  'prioritized',
];

export interface ReconcileDeps {
  db: Db;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  /** publishing: the state of a `publish` job by id. */
  jobState(jobId: string): Promise<JobState>;
  /** publishing: removes a finished job, so the same id can be queued again. */
  removeJob(jobId: string): Promise<void>;
  enqueueScheduled(jobs: ScheduledJob[]): Promise<void>;
  /** posts: the post's status from its targets. */
  recomputeStatus(workspaceId: string, postId: string): Promise<void>;
}

const MINUTE = 60_000;
/** Scheduled targets due within this window get their job checked. */
export const RECONCILE_WINDOW_HOURS = 48;
/** A scheduled target this late without a job is failed instead of sent hours late. */
export const MISSED_GRACE_MINUTES = MAX_LATE_MINUTES;
/** A target `publishing` this long with no job behind it is stuck. */
export const STUCK_AFTER_MINUTES = 15;
const BATCH = 5000;

export interface ReconcileReport {
  rebuilt: number;
  missed: number;
  stuck: number;
}

/**
 * `reconcile` (every 5 minutes; docs/backend/modules/scheduling.md): Postgres is the source of
 * truth, so jobs Valkey lost are rebuilt from it. Scheduled targets due within 48 hours get their
 * delayed job back; ones more than an hour overdue are failed rather than posted that late.
 * Targets stuck `publishing` with no job behind them are failed with a message saying so: the
 * network may or may not have the post, so they are never retried blindly.
 */
export function createReconciler(deps: ReconcileDeps) {
  const { db, clock, logger } = deps;
  const events = typedEvents<PublishingEvents>(deps.events);

  async function fail(
    target: { id: string; workspaceId: string; postId: string; network: NetworkId },
    from: 'scheduled' | 'publishing',
    guard: Record<string, unknown>,
    error: PublishError,
  ): Promise<boolean> {
    const ws = db.forWorkspace(target.workspaceId);
    const moved = await ws.postTarget.updateMany({
      where: { id: target.id, status: from, ...guard },
      data: { status: 'failed', lastError: error },
    });
    if (moved.count === 0) return false;
    await ws.publishAttempt.updateMany({
      where: { postTargetId: target.id, outcome: 'running' },
      data: {
        outcome: 'failed',
        finishedAt: clock.now(),
        errorKind: error.kind,
        message: error.message,
      },
    });
    await deps.recomputeStatus(target.workspaceId, target.postId);
    await events.emit('target.failed', {
      workspaceId: target.workspaceId,
      postId: target.postId,
      targetId: target.id,
      network: target.network,
      errorKind: error.kind,
      message: error.message,
    });
    return true;
  }

  /** `workspaceId` limits a run to one workspace (tests; an admin repair). */
  async function run({ workspaceId }: { workspaceId?: string } = {}): Promise<ReconcileReport> {
    const now = clock.now().getTime();
    const report: ReconcileReport = { rebuilt: 0, missed: 0, stuck: 0 };

    // 1. Scheduled targets due soon (or overdue): their delayed job must exist.
    const scheduled = await db.client.postTarget.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        workspace: { deletedAt: null },
        status: 'scheduled',
        scheduledAt: { lte: new Date(now + RECONCILE_WINDOW_HOURS * 60 * MINUTE) },
      },
      select: {
        id: true,
        workspaceId: true,
        postId: true,
        scheduledAt: true,
        scheduleVersion: true,
        account: { select: { network: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: BATCH,
    });
    for (const t of scheduled) {
      const at = t.scheduledAt;
      if (!at) continue;
      const jobId = scheduledJobId(t.id, t.scheduleVersion);
      const state = await deps.jobState(jobId);
      if (LIVE.includes(state)) continue;
      const target = { ...t, network: t.account.network };
      if (at.getTime() < now - MISSED_GRACE_MINUTES * MINUTE) {
        const failed = await fail(
          target,
          'scheduled',
          { scheduleVersion: t.scheduleVersion },
          {
            kind: 'retryable',
            networkCode: null,
            message:
              'This post missed its time while the service was unavailable; publish it again or pick a new time',
          },
        );
        if (failed) report.missed++;
        continue;
      }
      // Missing, or finished without sending (a finished job keeps its id for a day).
      if (state !== 'unknown') await deps.removeJob(jobId);
      await deps.enqueueScheduled([
        { workspaceId: t.workspaceId, targetId: t.id, version: t.scheduleVersion, at },
      ]);
      report.rebuilt++;
    }

    // 2. Targets stuck `publishing` with nothing working on them.
    const stuck = await db.client.postTarget.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        workspace: { deletedAt: null },
        status: 'publishing',
        updatedAt: { lt: new Date(now - STUCK_AFTER_MINUTES * MINUTE) },
      },
      select: {
        id: true,
        workspaceId: true,
        postId: true,
        attempts: true,
        scheduleVersion: true,
        account: { select: { network: true } },
      },
      take: BATCH,
    });
    for (const t of stuck) {
      // Publish-now and retries queue `publish-<id>-<attempts when queued>`, and one job makes
      // up to PUBLISH_ATTEMPTS tries, so its id can be any of the last few counts; scheduled
      // targets use `publish-<id>-v<version>`. Any of them alive (running, or waiting to retry,
      // even an hour for a rate limit) wins.
      const ids = [scheduledJobId(t.id, t.scheduleVersion)];
      for (let k = Math.max(0, t.attempts - PUBLISH_ATTEMPTS); k <= t.attempts; k++) {
        ids.push(publishJobId(t.id, k));
      }
      const states = await Promise.all(ids.map((id) => deps.jobState(id)));
      if (states.some((s) => LIVE.includes(s))) continue;
      const failed = await fail(
        { ...t, network: t.account.network },
        'publishing',
        { attempts: t.attempts },
        {
          kind: 'retryable',
          networkCode: null,
          message:
            'We lost track of this delivery and stopped it; check the account before publishing it again',
        },
      );
      if (failed) report.stuck++;
    }

    if (report.rebuilt || report.missed || report.stuck) {
      logger.info(report, 'reconcile repaired publishing state');
    }
    return report;
  }

  return { run };
}

export type Reconciler = ReturnType<typeof createReconciler>;

/** `reconcile` (every 5 minutes). */
export const reconcileQueue = (reconciler: Reconciler) =>
  defineQueue('reconcile', async () => {
    await reconciler.run();
  });
