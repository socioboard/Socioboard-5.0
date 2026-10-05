// A worker for the chaos suite: the real publish queue (apps/worker's), against the suite's own
// Valkey and key prefix, with the ledger network. The suite kills it without warning.
import { bootstrap, createPlatform, createPublishingServices, onShutdown } from '@socioboard/core';

import { ledgerRegistry } from './network';

const { config, logger } = bootstrap('chaos-worker');
const platform = createPlatform(config, logger, { prefix: process.env.CHAOS_PREFIX ?? 'sb-chaos' });
onShutdown(logger, () => platform.close());
const publishing = createPublishingServices(platform, {
  registry: ledgerRegistry(process.env.CHAOS_LEDGER ?? ''),
});
platform.queues.startWorker(publishing.publishQueue);
logger.info('worker started');
