import { weeklyDigestEmail, type DigestWorkspace } from '@socioboard/emails';

import {
  defineQueue,
  type Clock,
  type Db,
  type Kv,
  type Logger,
  type Mailer,
} from '../../platform';

const DAY = 86_400_000;
/** The digest goes out on Monday from 08:00 in the user's own timezone (P2-B12). */
export const DIGEST_WEEKDAY = 'Mon';
export const DIGEST_FROM_HOUR = 8;
/** Kept past the next Monday, so one Monday's digest is sent once. */
const SENT_TTL_SEC = 8 * 24 * 3600;

export interface DigestDeps {
  db: Db;
  kv: Kv;
  clock: Clock;
  mailer: Mailer;
  logger: Logger;
  /** The web app's origin; links in emails point there. */
  appUrl: string;
}

/** The user's local weekday, hour and date; UTC when their timezone isn't one Intl knows. */
export function localTime(now: Date, timezone: string | null) {
  const read = (tz: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return {
      weekday: part('weekday'),
      hour: Number(part('hour')),
      date: `${part('year')}-${part('month')}-${part('day')}`,
    };
  };
  try {
    return read(timezone ?? 'UTC');
  } catch {
    return read('UTC');
  }
}

/**
 * The `notification-digest` job (hourly): everyone who turned the weekly summary on gets it on
 * Monday from 08:00 their time, once: what went out in each of their workspaces in the last 7
 * days, what's scheduled for the next 7, and accounts needing reconnecting. Nothing to say, no
 * email. A send that fails is tried again by the next hourly run that Monday.
 */
export async function sendDigests(deps: DigestDeps) {
  const { db, kv, clock, logger } = deps;
  const now = clock.now();
  const report = { sent: 0, quiet: 0, failed: 0 };
  const subscribers = await db.client.notificationPreference.findMany({
    where: { type: 'digest', email: true },
    select: { user: { select: { id: true, name: true, email: true, timezone: true } } },
  });
  for (const { user } of subscribers) {
    const local = localTime(now, user.timezone);
    if (local.weekday !== DIGEST_WEEKDAY || local.hour < DIGEST_FROM_HOUR) continue;
    const sentKey = `digest-sent:${user.id}:${local.date}`;
    if (await kv.get(sentKey)) continue;

    const memberships = await db.client.member.findMany({
      where: { userId: user.id, workspace: { deletedAt: null } },
      select: { workspace: { select: { id: true, slug: true, name: true } } },
      orderBy: { workspace: { name: 'asc' } },
    });
    const weekAgo = new Date(now.getTime() - 7 * DAY);
    const weekAhead = new Date(now.getTime() + 7 * DAY);
    const workspaces: DigestWorkspace[] = [];
    for (const { workspace: w } of memberships) {
      const [published, failed, scheduled, needsReconnecting] = await Promise.all([
        db.client.postTarget.count({ where: { workspaceId: w.id, publishedAt: { gte: weekAgo } } }),
        db.client.postTarget.count({
          where: { workspaceId: w.id, status: 'failed', updatedAt: { gte: weekAgo } },
        }),
        db.client.postTarget.count({
          where: {
            workspaceId: w.id,
            status: 'scheduled',
            scheduledAt: { gte: now, lt: weekAhead },
          },
        }),
        db.client.socialAccount.count({ where: { workspaceId: w.id, status: 'reauth_required' } }),
      ]);
      if (published + failed + scheduled + needsReconnecting === 0) continue;
      workspaces.push({
        name: w.name,
        published,
        failed,
        scheduled,
        needsReconnecting,
        url: new URL(`/w/${w.slug}/calendar`, deps.appUrl).toString(),
      });
    }
    if (workspaces.length === 0) {
      report.quiet++;
      await kv.set(sentKey, 'quiet', SENT_TTL_SEC);
      continue;
    }
    try {
      const email = await weeklyDigestEmail({ name: user.name, workspaces });
      await deps.mailer.send({ to: user.email, ...email });
      await kv.set(sentKey, 'sent', SENT_TTL_SEC);
      report.sent++;
    } catch (err) {
      logger.warn({ err, userId: user.id }, 'weekly digest not sent; the next run retries');
      report.failed++;
    }
  }
  if (report.sent || report.failed) logger.info(report, 'weekly digests');
  return report;
}

/** `notification-digest` (hourly): the weekly summaries due this hour. */
export const notificationDigestQueue = (deps: DigestDeps) =>
  defineQueue(
    'notification-digest',
    async () => {
      await sendDigests(deps);
    },
    { worker: { concurrency: 1 } },
  );
