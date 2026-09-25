import { bootstrap, closeServer, createApiApp, createPlatform, onShutdown } from '@socioboard/core';

import { createDocsRouter } from './docs';

const { config, logger } = bootstrap('api');
const platform = createPlatform(config, logger);

const { app, health, missingRoutes } = createApiApp(platform, {
  // API reference generated from the contracts: development only.
  extend: (a) => {
    if (!config.isProduction) a.use(createDocsRouter());
  },
});
if (missingRoutes.length > 0) {
  logger.warn({ missing: missingRoutes.length }, 'contract routes not implemented yet');
}

const server = app.listen(config.api.port, () => {
  logger.info({ port: config.api.port }, 'api listening');
});

onShutdown(logger, async () => {
  // Readiness turns 503 first, then in-flight requests get up to 25 s to finish.
  health.markShuttingDown();
  await closeServer(server);
  await platform.close();
});
