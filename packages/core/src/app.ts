// The API's composition root: platform + modules + request pipeline, in one place. apps/api runs
// it; integration tests build the same app, so they exercise the real wiring.
import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';
import type { Registry } from '@socioboard/providers';
import express, { type Express } from 'express';

import { createAuditLog, registerAuditListeners } from './modules/audit';
import {
  createAuthModule,
  createMeService,
  createWorkspaceAuthPort,
  registerAuthRoutes,
  type AuthModule,
} from './modules/auth';
import {
  createMediaService,
  createPublicMediaRouter,
  mediaProcessQueue,
  registerMediaRoutes,
} from './modules/media';
import { createPublishingServices } from './domain';
import {
  createNotifications,
  registerNotificationListeners,
  registerNotificationRoutes,
} from './modules/notifications';
import { registerPostRoutes } from './modules/posts';
import { registerSchedulingRoutes } from './modules/scheduling';
import { createOAuthCallbackRouter, registerSocialAccountRoutes } from './modules/social-accounts';
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
  /** Network adapters; defaults to those configured in the environment (tests pass fakes). */
  registry?: Registry;
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
  // Notifications: events emitted here (e.g. a login refused while listing its Pages) notify too.
  const notifications = createNotifications(platform).service;
  registerNotificationListeners(platform.events, notifications, platform.db, logger);

  const authModule = createAuthModule(platform);
  // Verification can only be required when the server can send the email.
  const requireVerifiedEmail = options.requireVerifiedEmail ?? Boolean(config.mail.smtpUrl);
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
    {
      socialProviders: [
        ...(config.auth.google ? (['google'] as const) : []),
        ...(config.auth.microsoft ? (['microsoft'] as const) : []),
      ],
      emailVerificationRequired: requireVerifiedEmail,
    },
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
      requireVerifiedEmail,
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

  const { socialAccounts, posts, scheduling, queueSlots, recurrence, mediaUrls } =
    createPublishingServices(platform, {
      registry: options.registry,
    });
  registerSocialAccountRoutes(api, socialAccounts);
  registerPostRoutes(api, posts);
  registerSchedulingRoutes(api, scheduling, queueSlots, recurrence);
  registerNotificationRoutes(api, notifications);

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
  // Network sign-in comes back here (a browser redirect, not a JSON call): session, not origin check.
  app.use(
    '/api/oauth',
    rateLimit({ kv: platform.kv, name: 'oauth', windowSec: 60, max: 60 }),
    session(authModule.resolveSession),
  );
  app.use(createOAuthCallbackRouter(socialAccounts));

  // Media networks fetch themselves (media.<domain> points here); signed and expiring.
  app.use(
    '/public-media',
    rateLimit({ kv: platform.kv, name: 'public-media', windowSec: 60, max: 1200 }),
  );
  app.use(createPublicMediaRouter({ signer: mediaUrls, storage: platform.storage, logger }));

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
