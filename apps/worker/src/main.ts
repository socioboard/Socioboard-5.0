import { bootstrap, createPlatform, onShutdown, workspacePurgeQueue } from '@socioboard/core';

const { config, logger } = bootstrap('worker');
const platform = createPlatform(config, logger);

// Queue processors, one per module that owns background work.
const purge = workspacePurgeQueue(platform);
platform.queues.startWorker(purge);
// Nightly at 03:00 UTC; upserting keeps a single schedule however many workers start.
await platform.queues
  .get(purge)
  .upsertJobScheduler('nightly', { pattern: '0 3 * * *', tz: 'UTC' }, { name: 'purge' });

logger.info('worker started');

onShutdown(logger, async () => {
  await platform.close();
});
