import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';
import {
  bootstrap,
  createApiRouter,
  createAuthModule,
  createErrorHandler,
  createMembershipLookup,
  createMeService,
  createPlatform,
  notFoundHandler,
  onShutdown,
  originCheck,
  registerAuthRoutes,
  rateLimit,
  requestId,
  requestLogger,
  session,
} from '@socioboard/core';
import express from 'express';

const { config, logger } = bootstrap('api');
const platform = createPlatform(config, logger);

const authModule = createAuthModule(platform);
const lookupMembership = createMembershipLookup(platform.db);
const api = createApiRouter({ lookupMembership });
registerAuthRoutes(
  api,
  createMeService({
    auth: authModule.auth,
    db: platform.db,
    storage: platform.storage,
    lookupMembership,
    clock: platform.clock,
    logger,
  }),
);

const app = express();
app.disable('x-powered-by');
// One rule for the client IP, used by every rate limit (ours and Better Auth's): TRUST_PROXY.
app.set('trust proxy', config.api.trustedProxies);

// Global pipeline (docs/backend/README.md#middleware-chain).
app.use('/api', requestId, requestLogger(logger));
// Better Auth reads the raw body and has its own rate limits, so it comes before the JSON parser.
app.use(authModule.router);
app.use(express.json({ limit: '1mb' }));
app.use(
  '/api/v1',
  originCheck(config.appUrl),
  rateLimit({ kv: platform.kv, name: 'api', windowSec: 60, max: config.api.rateLimitPerMin }),
  session(authModule.resolveSession),
);
app.use(api.router);

// Liveness only; P0-B11 adds db, Valkey and storage checks.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', notFoundHandler);
app.use(createErrorHandler(logger));

const contractRoutes = Object.values(apiRoutes).flatMap(
  (m) => Object.values(m) as RouteDefinition[],
);
const missing = contractRoutes.filter((r) => !api.mounted.has(r));
if (missing.length > 0) {
  logger.warn(
    { missing: missing.length, total: contractRoutes.length },
    'contract routes not implemented yet',
  );
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
