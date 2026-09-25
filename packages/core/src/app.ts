// The API's composition root: platform + modules + request pipeline, in one place. apps/api runs
// it; integration tests build the same app, so they exercise the real wiring.
import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';
import express, { type Express } from 'express';

import { createAuditLog, registerAuditListeners } from './modules/audit';
import {
  createAuthModule,
  createMeService,
  createWorkspaceAuthPort,
  registerAuthRoutes,
  type AuthModule,
} from './modules/auth';
import { createMediaService, mediaProcessQueue, registerMediaRoutes } from './modules/media';
import {
  createMembershipLookup,
  createWorkspaceService,
  registerWorkspaceRoutes,
} from './modules/workspaces';
import {
  createApiRouter,
  createErrorHandler,
  createHealth,
  notFoundHandler,
  originCheck,
  rateLimit,
  requestContext,
  requestId,
  requestLogger,
  session,
  type ApiRouter,
  type Health,
  type Platform,
} from './platform';

export interface ApiAppOptions {
  /** Defaults to "the server can send email" (SMTP configured). */
  requireVerifiedEmail?: boolean;
  /** Extra routes mounted before the 404 and error handlers (e.g. dev-only API docs). */
  extend?: (app: Express) => void;
}

export interface ApiApp {
  app: Express;
  api: ApiRouter;
  authModule: AuthModule;
  /** Health endpoints; the entrypoint marks it shutting down before closing the server. */
  health: Health;
  /** Contract routes that have no handler yet (should be empty). */
  missingRoutes: RouteDefinition[];
}

export function createApiApp(platform: Platform, options: ApiAppOptions = {}): ApiApp {
  const { config, logger } = platform;

  // Audit first, so it hears every event the modules emit.
  registerAuditListeners(platform.events, createAuditLog(platform), logger);

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
      requireVerifiedEmail: options.requireVerifiedEmail ?? Boolean(config.mail.smtpUrl),
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
  app.use('/api', requestId, requestContext, requestLogger(logger));
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

  const health = createHealth(platform);
  app.use(health.router);

  options.extend?.(app);
  app.use('/api', notFoundHandler);
  app.use(createErrorHandler(logger));

  const missingRoutes = Object.values(apiRoutes)
    .flatMap((m) => Object.values(m) as RouteDefinition[])
    .filter((r) => !api.mounted.has(r));

  return { app, api, authModule, health, missingRoutes };
}
