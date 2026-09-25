import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';
import {
  bootstrap,
  createApiRouter,
  createAuthModule,
  createMediaService,
  createWorkspaceAuthPort,
  createWorkspaceService,
  createErrorHandler,
  createMembershipLookup,
  createMeService,
  createPlatform,
  mediaProcessQueue,
  notFoundHandler,
  onShutdown,
  originCheck,
  registerAuthRoutes,
  registerMediaRoutes,
  registerWorkspaceRoutes,
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
registerWorkspaceRoutes(
  api,
  createWorkspaceService({
    db: platform.db,
    authPort: createWorkspaceAuthPort(authModule.auth),
    storage: platform.storage,
    mailer: platform.mailer,
    events: platform.events,
    clock: platform.clock,
    logger,
    appUrl: config.appUrl,
    // Verification can only be required when the server can send the email.
    requireVerifiedEmail: Boolean(config.mail.smtpUrl),
  }),
);
const mediaProcess = mediaProcessQueue({ ...platform, tools: config.media });
registerMediaRoutes(
  api,
  createMediaService({
    db: platform.db,
    storage: platform.storage,
    clock: platform.clock,
    logger,
    events: platform.events,
    // One job per asset: completing the same upload twice can't queue it twice.
    enqueueProcessing: async (assetId) => {
      await platform.queues
        .get(mediaProcess)
        .add('process', { assetId }, { jobId: `media-${assetId}` });
    },
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
