// The real API app (createApiApp) for integration tests, with test-only settings.
import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { createApiApp } from '../app';
import { createLogger, createPlatform, loadConfig } from '../platform';

export interface TestAppOptions {
  /** Defaults to false, so tests can create workspaces without clicking email links. */
  requireVerifiedEmail?: boolean;
}

export function createTestApp({ requireVerifiedEmail = false }: TestAppOptions = {}) {
  const base = loadConfig();
  // No calls to the breached-password API from tests.
  const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
  const run = randomUUID().slice(0, 8);
  // Own key/queue prefix, so tests never touch dev data or each other's rate-limit counters.
  const platform = createPlatform(config, createLogger({ level: 'silent' }), {
    prefix: `sb-test-${run}`,
  });
  const { app, authModule, missingRoutes } = createApiApp(platform, { requireVerifiedEmail });
  const { db } = platform;

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
      /** The browser's cookies as a Cookie header, for server-side Better Auth calls. */
      cookieHeader: () =>
        agent.jar
          .getCookies({ domain: '127.0.0.1', path: '/', secure: false, script: false })
          .toValueString(),
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
    if (res.status !== 200) throw new Error(`sign-up failed: ${String(res.status)}`);
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
    await platform.close();
  }

  /** Prefix for workspace names created in this run, so cleanup finds them. */
  const workspaceName = (name: string) => `T${run} ${name}`;

  return {
    app,
    config,
    db,
    platform,
    authModule,
    missingRoutes,
    browser,
    signUp,
    email,
    workspaceName,
    cleanup,
  };
}
