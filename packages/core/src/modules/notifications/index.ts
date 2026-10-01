// Public surface of the notifications module (docs/backend/modules/notifications.md).
import type { Platform } from '../../platform';
import {
  createEmailQueuer,
  notificationEmailQueue,
  notificationPurgeQueue,
  type NotificationEmailJob,
} from './emails';
import { notificationDigestQueue } from './digest';
import { createNotificationService, type NotificationService } from './service';

export {
  createEmailQueuer,
  EMAIL_WINDOW_MS,
  notificationEmailQueue,
  notificationPurgeQueue,
  sendNotificationEmail,
  type EmailItem,
  type NotificationEmailJob,
} from './emails';
export {
  DIGEST_FROM_HOUR,
  DIGEST_WEEKDAY,
  localTime,
  notificationDigestQueue,
  sendDigests,
  type DigestDeps,
} from './digest';
export { registerNotificationListeners } from './listeners';
export { registerNotificationRoutes } from './routes';
export {
  createNotificationService,
  DEFAULT_CHANNELS,
  NOTIFICATION_RETENTION_DAYS,
  type NotificationService,
  type NotifyInput,
} from './service';

/**
 * The service, its email queue and its purge queue, wired once per process: the API and the
 * worker both create notifications; only the worker runs the queues.
 */
export function createNotifications(platform: Platform): {
  service: NotificationService;
  emailQueue: ReturnType<typeof notificationEmailQueue>;
  purgeQueue: ReturnType<typeof notificationPurgeQueue>;
  digestQueue: ReturnType<typeof notificationDigestQueue>;
} {
  const { db, kv, clock, logger, mailer, realtime, queues, config } = platform;
  const queueEmail = createEmailQueuer({
    kv,
    clock,
    async enqueue(job: NotificationEmailJob, opts) {
      await queues.get(emailQueue).add('send', job, opts);
    },
  });
  const service = createNotificationService({ db, clock, logger, realtime, queueEmail });
  const emailQueue = notificationEmailQueue({
    db,
    kv,
    mailer,
    logger,
    notifications: service,
    appUrl: config.appUrl,
  });
  const purgeQueue = notificationPurgeQueue({ notifications: service, logger });
  const digestQueue = notificationDigestQueue({
    db,
    kv,
    clock,
    mailer,
    logger,
    appUrl: config.appUrl,
  });
  return { service, emailQueue, purgeQueue, digestQueue };
}
