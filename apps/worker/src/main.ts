import {
  auditPurgeQueue,
  bootstrap,
  createAuditLog,
  createPlatform,
  mediaProcessQueue,
  onShutdown,
  registerAuditListeners,
  workspacePurgeQueue,
} from '@socioboard/core';

const { config, logger } = bootstrap('worker');
const platform = createPlatform(config, logger);
const audit = createAuditLog(platform);
registerAuditListeners(platform.events, audit, logger);

// Queue processors, one per module that owns background work.
platform.queues.startWorker(mediaProcessQueue({ ...platform, tools: config.media }));

const purge = workspacePurgeQueue(platform);
platform.queues.startWorker(purge);
// Nightly at 03:00 UTC; upserting keeps a single schedule however many workers start.
await platform.queues
  .get(purge)
  .upsertJobScheduler('nightly', { pattern: '0 3 * * *', tz: 'UTC' }, { name: 'purge' });

const auditPurge = auditPurgeQueue({ audit, retentionDays: config.audit.retentionDays, logger });
platform.queues.startWorker(auditPurge);
await platform.queues
  .get(auditPurge)
  .upsertJobScheduler('nightly', { pattern: '30 3 * * *', tz: 'UTC' }, { name: 'purge' });

logger.info('worker started');

onShutdown(logger, async () => {
  await platform.close();
});
