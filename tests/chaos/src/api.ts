// The API for the chaos suite: the real app (createApiApp), against the suite's own Valkey and key
// prefix, with the ledger network. The suite kills it while posts are being scheduled.
import { bootstrap, createApiApp, createPlatform, onShutdown } from '@socioboard/core';

import { ledgerRegistry } from './network';

const { config, logger } = bootstrap('chaos-api');
const platform = createPlatform(config, logger, { prefix: process.env.CHAOS_PREFIX ?? 'sb-chaos' });
const { app } = createApiApp(platform, {
  registry: ledgerRegistry(process.env.CHAOS_LEDGER ?? ''),
  requireVerifiedEmail: false,
});
const port = Number(process.env.CHAOS_API_PORT ?? 3100);
const server = app.listen(port, '127.0.0.1', () => {
  logger.info({ port }, 'api listening');
});
onShutdown(logger, async () => {
  server.close();
  await platform.close();
});
