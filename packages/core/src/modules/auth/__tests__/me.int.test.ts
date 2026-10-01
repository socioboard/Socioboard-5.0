// /api/v1/me routes through the full pipeline, against Postgres, Valkey (and S3/MinIO if set).
import { randomUUID } from 'node:crypto';

import { ErrorEnvelope, Me, SessionInfo } from '@socioboard/contracts';
import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

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
  session,
  systemClock,
} from '../../../platform';
import { createMembershipLookup } from '../../workspaces';
import { createAuthModule, createMeService, registerAuthRoutes } from '../index';

const base = loadConfig();
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const storage = config.storage ? createStorage(config.storage) : undefined;
const authModule = createAuthModule({
  config,
  db,
  kv,
  mailer: createMailer({ smtpUrl: undefined, from: 'x', logger }),
  logger,
  events: createEventBus({ logger }),
});
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
  { socialProviders: [], emailVerificationRequired: false },
);

const app = express();
app.set('trust proxy', 'loopback');
app.use(authModule.router);
app.use(express.json());
app.use('/api/v1', originCheck(config.appUrl), session(authModule.resolveSession));
app.use(api.router);
app.use(createErrorHandler(logger));

const run = randomUUID().slice(0, 8);
const PASSWORD = 'a long enough password';
let n = 0;
const email = (label: string) => `${label}-${run}@example.test`;

/** A browser: its own cookies, its own IP, and the app's Origin on every request. */
function browser() {
  const agent = request.agent(app);
  const ip = `10.88.${String(Math.floor(++n / 250))}.${String(n % 250)}`;
  const h = <T extends request.Test>(t: T) =>
    t.set('Origin', config.appUrl).set('X-Forwarded-For', ip);
  return {
    get: (p: string) => h(agent.get(p)),
    post: (p: string, body?: object) => h(agent.post(p)).send(body),
    patch: (p: string, body?: object) => h(agent.patch(p)).send(body),
    delete: (p: string) => h(agent.delete(p)),
    cookieHeader: () =>
      agent.jar
        .getCookies({ domain: '127.0.0.1', path: '/', secure: false, script: false })
        .toValueString(),
  };
}

async function signUp(label: string) {
  const b = browser();
  const res = await b.post('/api/auth/sign-up/email', {
    name: 'Test User',
    email: email(label),
    password: PASSWORD,
    timezone: 'Asia/Kolkata',
  });
  expect(res.status).toBe(200);
  return b;
}
const me = async (b: ReturnType<typeof browser>) => Me.parse((await b.get('/api/v1/me')).body);
const code = (res: request.Response) => ErrorEnvelope.parse(res.body).error.code;

async function createWorkspace(b: ReturnType<typeof browser>, slug: string) {
  const ws = await authModule.auth.api.createOrganization({
    body: { name: slug, slug: `${slug}-${run}`, timezone: 'UTC' },
    headers: new Headers({ cookie: b.cookieHeader() }),
  });
  return ws.id;
}

afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { slug: { endsWith: `-${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
  storage?.close();
});

describe('GET/PATCH /api/v1/me', () => {
  it('requires a session', async () => {
    expect((await browser().get('/api/v1/me')).status).toBe(401);
  });

  it('returns the profile with no workspaces yet', async () => {
    const b = await signUp('profile');
    const body = await me(b);
    expect(body.user).toMatchObject({
      email: email('profile'),
      name: 'Test User',
      timezone: 'Asia/Kolkata',
      locale: 'en',
      avatarUrl: null,
      twoFactorEnabled: false,
    });
    expect(body.memberships).toEqual([]);
    expect(body.activeWorkspaceId).toBeNull();
  });

  it('updates name, timezone and locale, and keeps the session copy current', async () => {
    const b = await signUp('update');
    const res = await b.patch('/api/v1/me', {
      name: 'Chethan S',
      timezone: 'Europe/Berlin',
      locale: 'en-GB',
    });
    expect(res.status).toBe(200);
    expect(Me.parse(res.body).user).toMatchObject({
      name: 'Chethan S',
      timezone: 'Europe/Berlin',
      locale: 'en-GB',
    });
    const sessionView = await b.get('/api/auth/get-session');
    expect(sessionView.body).toMatchObject({ user: { name: 'Chethan S' } });
  });

  it('validates the body', async () => {
    const b = await signUp('invalid');
    expect((await b.patch('/api/v1/me', {})).status).toBe(400);
    const badTz = await b.patch('/api/v1/me', { timezone: 'Mars/Olympus' });
    expect(badTz.status).toBe(400);
    expect(JSON.stringify(badTz.body)).toContain('"body","timezone"');
  });
});

describe('active workspace', () => {
  it('lists memberships, switches the active one and ignores deleted workspaces', async () => {
    const b = await signUp('active');
    const first = await createWorkspace(b, 'first');
    const second = await createWorkspace(b, 'second');
    let body = await me(b);
    expect(body.memberships.map((m) => m.workspace.id)).toEqual([first, second]);
    expect(body.memberships.every((m) => m.role === 'owner')).toBe(true);
    // Each workspace's timezone comes along: scheduled times are shown and picked in it.
    await db.client.workspace.update({ where: { id: second }, data: { timezone: 'Asia/Tokyo' } });
    const zones = await db.client.workspace.findMany({
      where: { id: { in: [first, second] } },
      select: { id: true, timezone: true },
    });
    expect(
      (await me(b)).memberships.map((m) => [m.workspace.id, m.workspace.timezone]).sort(),
    ).toEqual(zones.map((z) => [z.id, z.timezone]).sort());
    expect(zones.find((z) => z.id === second)?.timezone).toBe('Asia/Tokyo');
    expect(body.activeWorkspaceId).toBe(second);

    expect((await b.post('/api/v1/me/active-workspace', { workspaceId: first })).status).toBe(204);
    expect((await me(b)).activeWorkspaceId).toBe(first);

    await db.client.workspace.update({ where: { id: first }, data: { deletedAt: new Date() } });
    body = await me(b);
    expect(body.memberships.map((m) => m.workspace.id)).toEqual([second]);
    expect(body.activeWorkspaceId).toBeNull();
  });

  it('refuses a workspace the caller does not belong to (404)', async () => {
    const owner = await signUp('other-owner');
    const theirs = await createWorkspace(owner, 'theirs');
    const b = await signUp('outsider');
    const res = await b.post('/api/v1/me/active-workspace', { workspaceId: theirs });
    expect(res.status).toBe(404);
    expect(code(res)).toBe('WORKSPACE_NOT_FOUND');
  });
});

describe('sessions', () => {
  it('lists sessions, marks the current one, and revokes another', async () => {
    const laptop = await signUp('sessions');
    const phone = browser();
    await phone.post('/api/auth/sign-in/email', { email: email('sessions'), password: PASSWORD });

    const list = z
      .object({ items: z.array(SessionInfo) })
      .parse((await laptop.get('/api/v1/me/sessions')).body);
    expect(list.items).toHaveLength(2);
    expect(list.items.filter((s) => s.current)).toHaveLength(1);
    const other = list.items.find((s) => !s.current);

    expect((await laptop.delete(`/api/v1/me/sessions/${other?.id ?? ''}`)).status).toBe(204);
    expect((await phone.get('/api/auth/get-session')).body).toBeNull();
    expect((await laptop.get('/api/v1/me')).status).toBe(200);
  });

  it("returns 404 for another user's session and for unknown ids", async () => {
    const victim = await signUp('victim');
    const victimSessions = z
      .object({ items: z.array(SessionInfo) })
      .parse((await victim.get('/api/v1/me/sessions')).body).items;
    const attacker = await signUp('attacker');
    const res = await attacker.delete(`/api/v1/me/sessions/${victimSessions[0]?.id ?? ''}`);
    expect(res.status).toBe(404);
    expect(code(res)).toBe('SESSION_NOT_FOUND');
    expect((await victim.get('/api/v1/me')).status).toBe(200);
  });
});

describe('avatar', () => {
  it.runIf(!storage)('reports that storage is not configured', async () => {
    const b = await signUp('nostorage');
    const res = await b.post('/api/v1/me/avatar-upload', { mime: 'image/png', sizeBytes: 100 });
    expect(res.status).toBe(503);
    expect(code(res)).toBe('STORAGE_NOT_CONFIGURED');
  });

  it.runIf(storage)(
    'uploads with a size-locked URL, attaches it, and refuses keys that are not the caller’s',
    async () => {
      const b = await signUp('avatar');
      const png = Buffer.alloc(100, 7);
      const ticket = (
        await b.post('/api/v1/me/avatar-upload', { mime: 'image/png', sizeBytes: png.length })
      ).body as { uploadUrl: string; key: string };

      // A different size than signed is refused by S3 itself.
      const tooBig = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        body: Buffer.alloc(5000, 7),
        headers: { 'content-type': 'image/png' },
      });
      expect(tooBig.ok).toBe(false);

      const ok = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        body: png,
        headers: { 'content-type': 'image/png' },
      });
      expect(ok.status).toBe(200);

      const saved = await b.patch('/api/v1/me', { avatarKey: ticket.key });
      expect(saved.status).toBe(200);
      expect(Me.parse(saved.body).user.avatarUrl).toContain(ticket.key.split('/').pop());

      const other = await signUp('avatar-thief');
      const stolen = await other.patch('/api/v1/me', { avatarKey: ticket.key });
      expect(stolen.status).toBe(422);
      expect(code(stolen)).toBe('AVATAR_NOT_UPLOADED');

      const removed = await b.patch('/api/v1/me', { avatarKey: null });
      expect(Me.parse(removed.body).user.avatarUrl).toBeNull();
    },
  );
});
