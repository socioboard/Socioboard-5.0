import {
  auditPurgeQueue,
  bootstrap,
  createAuditLog,
  createPlatform,
  createPublishingServices,
  mediaProcessQueue,
  mediaPurgeQueue,
  onShutdown,
  registerAuditListeners,
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

// Queue processors, one per module that owns background work.
platform.queues.startWorker(mediaProcessQueue({ ...platform, tools: config.media }));
// Publishing: one job per post target (publish-now and retries from the API).
platform.queues.startWorker(createPublishingServices(platform).publishQueue);

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

const auditPurge = auditPurgeQueue({ audit, retentionDays: config.audit.retentionDays, logger });
platform.queues.startWorker(auditPurge);
await platform.queues
  .get(auditPurge)
  .upsertJobScheduler('nightly', { pattern: '30 3 * * *', tz: 'UTC' }, { name: 'purge' });

logger.info('worker started');
