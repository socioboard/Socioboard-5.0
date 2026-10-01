import { notificationEmail } from '@socioboard/emails';

import {
  defineQueue,
  type Clock,
  type Db,
  type Kv,
  type Logger,
  type Mailer,
} from '../../platform';
import type { EmailItem, NotificationService } from './service';

export type { EmailItem } from './service';

export interface NotificationEmailJob {
  userId: string;
  /** The Valkey list holding this email's items. */
  key: string;
}

/**
 * Notifications of one group (e.g. one post's failures) arriving within the same window become
 * one email, sent just after the window closes (docs: "Group bursts").
 */
export const EMAIL_WINDOW_MS = 2 * 60_000;
/** Time for the last item of a window to land before its email is sent. */
const EMAIL_SETTLE_MS = 5_000;
/** Items wait at most this long (the window, then retries on SMTP errors). */
const ITEMS_TTL_SEC = 24 * 3600;

const keyOf = (userId: string, group: string, window: number) =>
  `notify-email:${userId}:${group}:${String(window)}`;

/**
 * `queueEmail` for the notification service: adds the item to its window's list and makes sure
 * that window's email job exists (one job id per user, group and window; adding it again is a
 * no-op), delayed until the window closes.
 */
export function createEmailQueuer(deps: {
  kv: Kv;
  clock: Clock;
  enqueue(job: NotificationEmailJob, opts: { jobId: string; delay: number }): Promise<void>;
}) {
  return async (userId: string, group: string, item: EmailItem) => {
    const now = deps.clock.now().getTime();
    const window = Math.floor(now / EMAIL_WINDOW_MS);
    const key = keyOf(userId, group, window);
    await deps.kv.listPush(key, JSON.stringify(item), ITEMS_TTL_SEC);
    await deps.enqueue(
      { userId, key },
      {
        jobId: `email-${userId}-${group}-${String(window)}`.replaceAll(':', '-'),
        delay: (window + 1) * EMAIL_WINDOW_MS - now + EMAIL_SETTLE_MS,
      },
    );
  };
}

export interface SendEmailsDeps {
  db: Db;
  kv: Kv;
  mailer: Mailer;
  logger: Logger;
  notifications: Pick<NotificationService, 'preferencesOf'>;
  /** The web app's origin; links in emails point there. */
  appUrl: string;
}

/**
 * Sends one window's email. Items are read, not removed: a send that fails throws, and the retry
 * reads the same items (the window is closed, so none are added meanwhile); the list expires.
 * Types the user turned email off for since are left out.
 */
export async function sendNotificationEmail(deps: SendEmailsDeps, job: NotificationEmailJob) {
  const raw = await deps.kv.listRange(job.key);
  if (raw.length === 0) return;
  const user = await deps.db.client.user.findUnique({
    where: { id: job.userId },
    select: { email: true },
  });
  if (!user) return;
  const prefs = await deps.notifications.preferencesOf(job.userId);
  const items = raw
    .map((r) => JSON.parse(r) as EmailItem)
    .filter((i) => prefs.find((p) => p.type === i.type)?.email);
  const [first] = items;
  if (!first) return;
  const email = await notificationEmail({
    workspace: first.workspace,
    items: items.map((i) => ({ title: i.title, body: i.body })),
    url: new URL(first.link ?? '/', deps.appUrl).toString(),
  });
  await deps.mailer.send({ to: user.email, ...email });
  await deps.kv.delete(job.key);
}

/** `notifications`: sends grouped emails off the request path, retrying on SMTP errors. */
export const notificationEmailQueue = (deps: SendEmailsDeps) =>
  defineQueue<NotificationEmailJob>(
    'notifications',
    (job) => sendNotificationEmail(deps, job.data),
    { jobDefaults: { attempts: 5, backoff: { type: 'exponential', delay: 30_000 } } },
  );

/** `notification-purge`: nightly, deletes notifications past their retention. */
export const notificationPurgeQueue = (deps: {
  notifications: Pick<NotificationService, 'purgeExpired'>;
  logger: Logger;
}) =>
  defineQueue<Record<string, never>, number>(
    'notification-purge',
    async () => {
      const removed = await deps.notifications.purgeExpired();
      if (removed > 0) deps.logger.info({ removed }, 'old notifications deleted');
      return removed;
    },
    { worker: { concurrency: 1 } },
  );
