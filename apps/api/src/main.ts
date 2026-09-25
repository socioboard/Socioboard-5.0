import { bootstrap, createApiApp, createPlatform, onShutdown } from '@socioboard/core';

import { createDocsRouter } from './docs';

const { config, logger } = bootstrap('api');
const platform = createPlatform(config, logger);

const { app, missingRoutes } = createApiApp(platform, {
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
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  await platform.close();
});
