import {
  accountHealthQueue,
  auditPurgeQueue,
  bootstrap,
  createAuditLog,
  createPlatform,
  createNotifications,
  createPublishingServices,
  mediaProcessQueue,
  mediaPurgeQueue,
  onShutdown,
  reconcileQueue,
  recurringQueue,
  registerAuditListeners,
  registerNotificationListeners,
  tokenRefreshQueue,
  workspacePurgeQueue,
} from '@socioboard/core';

const { config, logger } = bootstrap('worker');
const platform = createPlatform(config, logger);
// Registered before anything starts, so a stop signal during startup still shuts down cleanly:
// workers finish their current jobs (up to 30 s), then connections close.
onShutdown(logger, async () => {
  await platform.close();
});
const audit = createAuditLog(platform);
registerAuditListeners(platform.events, audit, logger);
// Notifications: publishing and the account jobs emit here; emails go out from the
// `notifications` queue, grouped per burst.
const notifications = createNotifications(platform);
registerNotificationListeners(platform.events, notifications.service, platform.db, logger);
platform.queues.startWorker(notifications.emailQueue);

// Queue processors, one per module that owns background work.
platform.queues.startWorker(mediaProcessQueue({ ...platform, tools: config.media }));
// Publishing: one job per post target (publish-now, retries and scheduled posts from the API).
const publishing = createPublishingServices(platform);
platform.queues.startWorker(publishing.publishQueue);
// Repeating posts: hourly, each active rule's copies are created a week ahead.
const recurring = recurringQueue(publishing.recurrence);
platform.queues.startWorker(recurring);
await platform.queues
  .get(recurring)
  .upsertJobScheduler('hourly', { pattern: '5 * * * *', tz: 'UTC' }, { name: 'expand' });
// Every 5 minutes: rebuild publish jobs Valkey lost, stop deliveries stuck while publishing.
const reconcile = reconcileQueue(publishing.reconciler);
platform.queues.startWorker(reconcile);
await platform.queues
  .get(reconcile)
  .upsertJobScheduler('every-5-min', { pattern: '*/5 * * * *', tz: 'UTC' }, { name: 'run' });
// Social accounts: renew tokens before they expire (hourly), and check each login can still post
// to its accounts (daily); either marks what needs reconnecting.
const tokenRefresh = tokenRefreshQueue(publishing.socialAccounts);
platform.queues.startWorker(tokenRefresh);
await platform.queues
  .get(tokenRefresh)
  .upsertJobScheduler('hourly', { pattern: '20 * * * *', tz: 'UTC' }, { name: 'refresh' });
const accountHealth = accountHealthQueue(publishing.socialAccounts);
platform.queues.startWorker(accountHealth);
await platform.queues
  .get(accountHealth)
  .upsertJobScheduler('daily', { pattern: '0 4 * * *', tz: 'UTC' }, { name: 'check' });

const purge = workspacePurgeQueue(platform);
platform.queues.startWorker(purge);
// Nightly at 03:00 UTC; upserting keeps a single schedule however many workers start.
await platform.queues
  .get(purge)
  .upsertJobScheduler('nightly', { pattern: '0 3 * * *', tz: 'UTC' }, { name: 'purge' });

const mediaPurge = mediaPurgeQueue(platform);
platform.queues.startWorker(mediaPurge);
await platform.queues
  .get(mediaPurge)
  .upsertJobScheduler('nightly', { pattern: '15 3 * * *', tz: 'UTC' }, { name: 'purge' });

const notificationPurge = notifications.purgeQueue;
platform.queues.startWorker(notificationPurge);
await platform.queues
  .get(notificationPurge)
  .upsertJobScheduler('nightly', { pattern: '45 3 * * *', tz: 'UTC' }, { name: 'purge' });

const auditPurge = auditPurgeQueue({ audit, retentionDays: config.audit.retentionDays, logger });
platform.queues.startWorker(auditPurge);
await platform.queues
  .get(auditPurge)
  .upsertJobScheduler('nightly', { pattern: '30 3 * * *', tz: 'UTC' }, { name: 'purge' });

logger.info('worker started');
