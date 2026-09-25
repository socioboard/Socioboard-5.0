import {
  bootstrap,
  createAuthModule,
  createErrorHandler,
  createPlatform,
  notFoundHandler,
  onShutdown,
} from '@socioboard/core';
import express from 'express';

const { config, logger } = bootstrap('api');
const platform = createPlatform(config, logger);

const authModule = createAuthModule(platform);

const app = express();
app.disable('x-powered-by');
// Better Auth reads the raw request body, so its routes come before the JSON parser.
app.use(authModule.router);
app.use(express.json({ limit: '1mb' }));

// Liveness only; P0-B11 adds db, Valkey and storage checks, P0-B3 the full middleware chain.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', notFoundHandler);
app.use(createErrorHandler(logger));

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
