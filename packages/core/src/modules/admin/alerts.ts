import { opsAlertEmail } from '@socioboard/emails';
import type { Redis } from 'ioredis';

import {
  defineQueue,
  type Clock,
  type Db,
  type Kv,
  type Logger,
  type Mailer,
  type Platform,
  type Queues,
} from '../../platform';
import { WORKER_QUEUES } from './queues';

const MINUTE = 60_000;
/** How often the checks run, in the api and in the worker (one of them does each round). */
export const ALERT_CHECK_MS = 5 * MINUTE;
/** Failed deliveries are counted over this window. */
const FAILURE_WINDOW_MS = 15 * MINUTE;
/** After an alert is sent, the same one stays quiet this long. */
const QUIET_SEC = 3600;
/** BullMQ stores a delayed job's due time in its score: timestamp × 0x1000 + a counter. */
const DELAYED_SCORE_UNIT = 0x1000;

export type OpsAlertKind = 'publish_failures' | 'queue_backlog' | 'jobs_overdue';

export interface OpsAlert {
  kind: OpsAlertKind;
  /** What the quiet hour is kept per: the kind, plus the queue for queue alerts. */
  key: string;
  title: string;
  summary: string;
  rows: { name: string; detail: string }[];
  /** Admin console page, e.g. /admin/publishing. */
  path: string;
}

export interface OpsAlertThresholds {
  /** Deliveries failed for good in 15 minutes. */
  failedPublishes: number;
  /** Jobs waiting in one queue. */
  queueWaiting: number;
  /** Minutes a queue's oldest waiting job may sit, or a delayed job may be overdue. */
  queueLagMinutes: number;
}

export interface OpsAlertsDeps {
  db: Db;
  kv: Kv;
  queues: Queues;
  mailer: Mailer;
  clock: Clock;
  logger: Logger;
  appUrl: string;
  thresholds: OpsAlertThresholds;
}

/**
 * Built-in alerts (docs/backend/modules/admin.md#alerts-p2-i1): publishing failing in bulk, a
 * queue backing up, jobs that should have run and didn't. Emailed to platform admins and logged,
 * with or without OpenObserve. Runs in the api and the worker, so a dead worker is still noticed.
 */
export function createOpsAlerts(deps: OpsAlertsDeps) {
  const { db, kv, queues, mailer, clock, logger, thresholds } = deps;
  const lagMs = thresholds.queueLagMinutes * MINUTE;
  const handles = () =>
    WORKER_QUEUES.map((name) => queues.get(defineQueue(name, () => Promise.resolve())));

  async function publishFailures(now: Date): Promise<OpsAlert[]> {
    const since = new Date(now.getTime() - FAILURE_WINDOW_MS);
    const rows = await db.client.$queryRaw<{ network: string; failed: bigint }[]>`
      SELECT a.network::text AS network, count(*) AS failed
      FROM "PublishAttempt" pa
      JOIN "PostTarget" t ON t.id = pa."postTargetId"
      JOIN "SocialAccount" a ON a.id = t."socialAccountId"
      WHERE pa.outcome = 'failed' AND pa."finishedAt" >= ${since}
      GROUP BY a.network
      ORDER BY count(*) DESC, a.network`;
    const failed = rows.reduce((n, r) => n + Number(r.failed), 0);
    if (failed < thresholds.failedPublishes) return [];
    return [
      {
        kind: 'publish_failures',
        key: 'publish_failures',
        title: 'Publishing is failing',
        summary: `${String(failed)} deliveries failed for good in the last 15 minutes (the alert starts at ${String(thresholds.failedPublishes)}).`,
        rows: rows.map((r) => ({ name: r.network, detail: `${String(r.failed)} failed` })),
        path: '/admin/publishing',
      },
    ];
  }

  /**
   * Per queue: too many waiting, the oldest waiting job not taken for `lagMs` (it is remembered
   * between checks, since BullMQ doesn't record when a job became ready), and the earliest delayed
   * job overdue by `lagMs` (workers promote delayed jobs, so none are running).
   */
  async function queueProblems(now: Date): Promise<OpsAlert[]> {
    const alerts: OpsAlert[] = [];
    for (const q of handles()) {
      // The raw ioredis client (BullMQ 6 types it narrowly, on the backend). A delayed job's due
      // time lives only in its score (a retry doesn't store it on the job); the wait list's
      // right end is the job taken next. The integration test checks both against BullMQ.
      const client = (await q.backend.client) as unknown as Pick<Redis, 'lindex' | 'zrange'>;
      const { wait, delayed } = q.keys;
      if (!wait || !delayed) continue;
      const [waiting, oldest, earliest] = await Promise.all([
        q.getWaitingCount(),
        client.lindex(wait, -1),
        client.zrange(delayed, 0, '0', 'WITHSCORES') as Promise<unknown[]>,
      ]);

      const seenKey = `ops-alerts:oldest:${q.name}`;
      let stalledMs = 0;
      if (oldest) {
        const seen = await kv.get(seenKey);
        const [seenId, seenAt] = seen?.split('|') ?? [];
        if (seenId === oldest && seenAt) stalledMs = now.getTime() - Number(seenAt);
        // Kept a day (replaced as soon as the oldest job changes), so a long stall reports its
        // real length when the hour's quiet ends.
        else await kv.set(seenKey, `${oldest}|${String(now.getTime())}`, 24 * QUIET_SEC);
      } else {
        await kv.delete(seenKey);
      }
      if (waiting >= thresholds.queueWaiting || stalledMs >= lagMs) {
        alerts.push({
          kind: 'queue_backlog',
          key: `queue_backlog:${q.name}`,
          title: `The ${q.name} queue is backed up`,
          summary:
            stalledMs >= lagMs
              ? `Its oldest waiting job hasn't been picked up for ${String(Math.round(stalledMs / MINUTE))} minutes: workers may be stuck or too few.`
              : `${String(waiting)} jobs are waiting (the alert starts at ${String(thresholds.queueWaiting)}).`,
          rows: [{ name: q.name, detail: `${String(waiting)} waiting` }],
          path: '/admin/queues',
        });
      }

      // RESP2 answers [member, score]; RESP3 answers [[member, score]].
      const first: unknown = earliest[0];
      const score: unknown = Array.isArray(first) ? first[1] : earliest[1];
      const dueAt = score === undefined ? null : Math.floor(Number(score) / DELAYED_SCORE_UNIT);
      if (dueAt !== null && now.getTime() - dueAt >= lagMs) {
        const late = Math.round((now.getTime() - dueAt) / MINUTE);
        alerts.push({
          kind: 'jobs_overdue',
          key: `jobs_overdue:${q.name}`,
          title: `Jobs in ${q.name} are overdue`,
          summary: `A job due ${String(late)} minutes ago hasn't started: no worker is running this queue. Scheduled posts aren't going out.`,
          rows: [{ name: q.name, detail: `due ${new Date(dueAt).toISOString()}` }],
          path: '/admin/queues',
        });
      }
    }
    return alerts;
  }

  /** What is wrong right now (no emails, no quiet hours). */
  async function evaluate(): Promise<OpsAlert[]> {
    const now = clock.now();
    const [failures, queueAlerts] = await Promise.all([publishFailures(now), queueProblems(now)]);
    return [...failures, ...queueAlerts];
  }

  async function send(alert: OpsAlert): Promise<void> {
    const admins = await db.client.user.findMany({
      where: { isPlatformAdmin: true, emailVerified: true },
      select: { email: true },
    });
    const email = await opsAlertEmail({
      title: alert.title,
      summary: alert.summary,
      rows: alert.rows,
      url: new URL(alert.path, deps.appUrl).toString(),
      actionLabel: alert.path === '/admin/publishing' ? 'Open publishing' : 'Open queues',
    });
    await Promise.all(admins.map((a) => mailer.send({ to: a.email, ...email })));
  }

  /**
   * One round: only the first process to reach this 5-minute slot runs it. Each alert is logged
   * and emailed, then quiet for an hour. Returns the alerts sent.
   */
  async function check(): Promise<OpsAlert[]> {
    const slot = Math.floor(clock.now().getTime() / ALERT_CHECK_MS);
    if ((await kv.incr(`ops-alerts:slot:${String(slot)}`, (ALERT_CHECK_MS / 1000) * 2)) !== 1) {
      return [];
    }
    const sent: OpsAlert[] = [];
    for (const alert of await evaluate()) {
      if ((await kv.incr(`ops-alerts:quiet:${alert.key}`, QUIET_SEC)) !== 1) continue;
      logger.error(
        { alert: { kind: alert.kind, key: alert.key, summary: alert.summary } },
        'ops alert',
      );
      try {
        await send(alert);
      } catch (err) {
        // Not emailed: no quiet hour, so the next round tries again.
        await kv.delete(`ops-alerts:quiet:${alert.key}`);
        logger.error({ err, alert: { kind: alert.kind } }, 'ops alert email failed');
        continue;
      }
      sent.push(alert);
    }
    return sent;
  }

  /** Checks every 5 minutes until the returned function is called; failures are logged. */
  function start(): () => void {
    const timer = setInterval(() => {
      check().catch((err: unknown) => {
        logger.error({ err }, 'ops alert check failed');
      });
    }, ALERT_CHECK_MS);
    timer.unref();
    return () => {
      clearInterval(timer);
    };
  }

  return { evaluate, check, start };
}

export type OpsAlerts = ReturnType<typeof createOpsAlerts>;

/** The alerts with the platform's clients and the configured thresholds (api and worker). */
export const opsAlertsFor = (platform: Platform): OpsAlerts =>
  createOpsAlerts({
    db: platform.db,
    kv: platform.kv,
    queues: platform.queues,
    mailer: platform.mailer,
    clock: platform.clock,
    logger: platform.logger,
    appUrl: platform.config.appUrl,
    thresholds: platform.config.alerts,
  });
