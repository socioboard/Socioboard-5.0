// A full API app for integration tests: the same wiring as apps/api, against the local services.
import { randomUUID } from 'node:crypto';

import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';

import {
  createAuthModule,
  createMeService,
  createWorkspaceAuthPort,
  registerAuthRoutes,
} from '../modules/auth';
import { createMediaService, registerMediaRoutes } from '../modules/media';
import {
  createMembershipLookup,
  createWorkspaceService,
  registerWorkspaceRoutes,
} from '../modules/workspaces';
import {
  createApiRouter,
  createDb,
  createErrorHandler,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  createStorage,
  loadConfig,
  originCheck,
  requestContext,
  session,
  systemClock,
} from '../platform';

export function createTestApp() {
  const base = loadConfig();
  const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
  const logger = createLogger({ level: 'silent' });
  const db = createDb({ url: config.db.url, poolSize: 4, scopedModels: WORKSPACE_SCOPED_MODELS });
  const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
  const storage = config.storage ? createStorage(config.storage) : undefined;
  const mailer = createMailer({ smtpUrl: undefined, from: 'x', logger });
  const events = createEventBus<Record<string, unknown>>({ logger });
  const authModule = createAuthModule({ config, db, kv, mailer, logger, events });
  const lookupMembership = createMembershipLookup(db);
  const api = createApiRouter({ lookupMembership });
  registerAuthRoutes(
    api,
    createMeService({
      auth: authModule.auth,
      db,
      storage,
      lookupMembership,
      clock: systemClock,
      logger,
    }),
  );
  registerWorkspaceRoutes(
    api,
    createWorkspaceService({
      db,
      authPort: createWorkspaceAuthPort(authModule.auth),
      storage,
      mailer,
      events,
      clock: systemClock,
      logger,
      appUrl: config.appUrl,
      requireVerifiedEmail: false,
    }),
  );
  registerMediaRoutes(
    api,
    createMediaService({
      db,
      storage,
      clock: systemClock,
      logger,
      events,
      enqueueProcessing: () => Promise.resolve(),
    }),
  );

  const app = express();
  app.set('trust proxy', 'loopback');
  app.use('/api', requestContext);
  app.use(authModule.router);
  app.use(express.json());
  app.use('/api/v1', originCheck(config.appUrl), session(authModule.resolveSession));
  app.use(api.router);
  app.use(createErrorHandler(logger));

  const run = randomUUID().slice(0, 8);
  let ipCounter = 0;

  /** A browser: own cookies, own IP, the app's Origin on every request. */
  function browser() {
    const agent = request.agent(app);
    const ip = `10.44.${String(Math.floor(++ipCounter / 250))}.${String(ipCounter % 250)}`;
    const h = <T extends request.Test>(t: T) =>
      t.set('Origin', config.appUrl).set('X-Forwarded-For', ip);
    return {
      send: (method: string, path: string, body?: object) => {
        const verbs = {
          GET: () => agent.get(path),
          POST: () => agent.post(path),
          PUT: () => agent.put(path),
          PATCH: () => agent.patch(path),
          DELETE: () => agent.delete(path),
        } as const;
        return h(verbs[method as keyof typeof verbs]()).send(body);
      },
      get: (path: string) => h(agent.get(path)),
      post: (path: string, body?: object) => h(agent.post(path)).send(body),
    };
  }
  const email = (label: string) => `${label}-${run}@example.test`;

  async function signUp(label: string) {
    const b = browser();
    const res = await b.post('/api/auth/sign-up/email', {
      name: label,
      email: email(label),
      password: 'a long enough password',
    });
    if (res.status !== 200) throw new Error(`sign-up failed: ${res.status}`);
    return { ...b, userId: (res.body as { user: { id: string } }).user.id };
  }

  async function cleanup() {
    const users = await db.client.user.findMany({
      where: { email: { endsWith: `-${run}@example.test` } },
      select: { id: true },
    });
    await db.client.workspace.deleteMany({ where: { name: { startsWith: `T${run}` } } });
    await db.client.auditLog.deleteMany({ where: { actorUserId: { in: users.map((u) => u.id) } } });
    await db.client.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await db.close();
    kv.close();
    storage?.close();
  }

  /** Prefix for workspace names created in this run, so cleanup finds them. */
  const workspaceName = (name: string) => `T${run} ${name}`;

  return { app, config, db, storage, browser, signUp, email, workspaceName, cleanup };
}
