import { bootstrap, createPlatform, onShutdown } from '@socioboard/core';

const { config, logger } = bootstrap('worker');
const platform = createPlatform(config, logger);

// Queue processors are registered here as modules arrive (publishing in P1).

// Heartbeat: keeps the process alive while no processors exist, and logs lost Valkey connectivity.
const heartbeat = setInterval(() => {
  void platform.queues.ping().then((ok) => {
    if (!ok) logger.warn('Valkey/Redis unreachable');
  });
}, 30_000);

logger.info('worker started');

onShutdown(logger, async () => {
  clearInterval(heartbeat);
  await platform.close();
});
