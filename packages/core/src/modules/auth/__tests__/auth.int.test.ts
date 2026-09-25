// Auth flows over HTTP against Postgres, Valkey and Mailpit (`pnpm services:up`, migrations applied).
import { randomUUID } from 'node:crypto';

import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  createDb,
  createErrorHandler,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  loadConfig,
} from '../../../platform';
import { createAuthModule } from '../index';
import { clearEmails, latestEmail, linkPath, totp } from './helpers';

const base = loadConfig();
// The breached-password check calls an external API; it is covered by the config tests.
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const mailer = createMailer({ smtpUrl: config.mail.smtpUrl, from: config.mail.from, logger });
const events = createEventBus<Record<string, unknown>>({ logger });
const emitted: { name: string; payload: unknown }[] = [];
for (const name of ['user.signed_up', 'user.signed_in', 'user.password_changed']) {
  events.on(name, (payload) => {
    emitted.push({ name, payload });
  });
}

const { auth, router } = createAuthModule({ config, db, kv, mailer, logger, events });
const app = express();
// Tests give each client its own X-Forwarded-For; trust it from the local test client.
app.set('trust proxy', 'loopback');
app.use(router);
app.use(createErrorHandler(logger));

const run = randomUUID().slice(0, 8);
let ip = 0;
/** A client with its own cookie jar and IP, so rate limits don't leak between tests. */
function client() {
  const agent = request.agent(app);
  const clientIp = `10.${run.charCodeAt(0) % 250}.${Math.floor(++ip / 250)}.${ip % 250}`;
  const withHeaders = <T extends request.Test>(t: T) =>
    t.set('Origin', config.appUrl).set('X-Forwarded-For', clientIp);
  return {
    post: (path: string, body?: object) => withHeaders(agent.post(path)).send(body),
    get: (path: string) => withHeaders(agent.get(path)),
  };
}
const email = (label: string) => `${label}-${run}@example.test`;
const PASSWORD = 'correct horse battery staple';

async function signUp(label: string) {
  const c = client();
  const address = email(label);
  const res = await c.post('/api/auth/sign-up/email', {
    name: 'Test User',
    email: address,
    password: PASSWORD,
    timezone: 'Asia/Kolkata',
  });
  expect(res.status, JSON.stringify(res.body)).toBe(200);
  // Wait for the background verification email, then clear it, so later reads see only new mail.
  await latestEmail(address);
  await clearEmails(address);
  return { c, address, userId: (res.body as { user: { id: string } }).user.id };
}

beforeEach(() => {
  emitted.length = 0;
});

afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { slug: { endsWith: `-${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
  mailer.close();
});

describe('sign up and email verification', () => {
  it('creates a UUIDv7 user with our fields, signs in, and emails a verification link', async () => {
    const { c, address, userId } = await signUp('signup');
    expect(userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    expect(emitted.map((e) => e.name)).toEqual(
      expect.arrayContaining(['user.signed_up', 'user.signed_in']),
    );

    const session = await c.get('/api/auth/get-session');
    expect(session.body).toMatchObject({
      user: {
        email: address,
        emailVerified: false,
        locale: 'en',
        timezone: 'Asia/Kolkata',
        isPlatformAdmin: false,
      },
    });

    const resend = await c.post('/api/auth/send-verification-email', { email: address });
    expect(resend.status).toBe(200);
    const mail = await latestEmail(address);
    expect(mail.subject).toBe('Verify your email for Socioboard');
    const verify = await c.get(linkPath(mail.text));
    expect([200, 302]).toContain(verify.status);
    const user = await db.client.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.emailVerified).toBe(true);
  });

  it('rejects short passwords and duplicate emails, and ignores isPlatformAdmin from the client', async () => {
    const c = client();
    const short = await c.post('/api/auth/sign-up/email', {
      name: 'x',
      email: email('short'),
      password: 'short123',
    });
    expect(short.status).toBe(400);

    // Better Auth drops fields marked input: false; what matters is that nothing stores them.
    const sneaky = await c.post('/api/auth/sign-up/email', {
      name: 'x',
      email: email('sneaky'),
      password: PASSWORD,
      isPlatformAdmin: true,
    });
    expect([200, 400]).toContain(sneaky.status);
    const stored = await db.client.user.findUnique({ where: { email: email('sneaky') } });
    expect(stored?.isPlatformAdmin ?? false).toBe(false);
    if (sneaky.status === 200) expect(stored).not.toBeNull();

    await signUp('dupe');
    const dupe = await client().post('/api/auth/sign-up/email', {
      name: 'x',
      email: email('dupe'),
      password: PASSWORD,
    });
    expect(dupe.status).toBe(422);
  });
});

describe('sign in', () => {
  it('accepts the right password only', async () => {
    const { address } = await signUp('signin');
    const c = client();
    const wrong = await c.post('/api/auth/sign-in/email', {
      email: address,
      password: 'wrong password!!',
    });
    expect(wrong.status).toBe(401);
    const ok = await c.post('/api/auth/sign-in/email', { email: address, password: PASSWORD });
    expect(ok.status).toBe(200);
    expect((await c.get('/api/auth/get-session')).body).toMatchObject({ user: { email: address } });
  });

  it('rate-limits password attempts: 10 per minute per IP', async () => {
    const c = client();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push(
        (
          await c.post('/api/auth/sign-in/email', {
            email: email('nobody'),
            password: 'x'.repeat(12),
          })
        ).status,
      );
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe('client IP for rate limits', () => {
  it('ignores X-Forwarded-For from clients that are not trusted proxies', async () => {
    // Same auth instance, but an app that trusts no proxy: rotating the header must not help.
    const direct = express();
    direct.set('trust proxy', false);
    direct.use(router);
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await request(direct)
        .post('/api/auth/sign-in/email')
        .set('Origin', config.appUrl)
        .set('X-Forwarded-For', `198.51.100.${String(i)}`)
        .send({ email: email('spoof'), password: 'x'.repeat(12) });
      statuses.push(res.status);
    }
    expect(statuses[10]).toBe(429);
  });
});

describe('password reset', () => {
  it('resets by email link, signs out other sessions and emits password_changed', async () => {
    const { c: oldSession, address, userId } = await signUp('reset');
    await clearEmails(address);
    const c = client();
    const ask = await c.post('/api/auth/request-password-reset', {
      email: address,
      redirectTo: '/reset-password',
    });
    expect(ask.status).toBe(200);

    const mail = await latestEmail(address);
    expect(mail.subject).toBe('Reset your Socioboard password');
    // The link validates the token, then redirects to the web page with ?token=…
    const landing = await c.get(linkPath(mail.text));
    const token = new URL(landing.headers.location ?? '', config.appUrl).searchParams.get('token');
    expect(token).toBeTruthy();

    const newPassword = 'another long passphrase';
    const reset = await c.post('/api/auth/reset-password', { token, newPassword });
    expect(reset.status).toBe(200);
    expect(emitted).toContainEqual({ name: 'user.password_changed', payload: { userId } });
    expect((await oldSession.get('/api/auth/get-session')).body).toBeNull();

    const signIn = await client().post('/api/auth/sign-in/email', {
      email: address,
      password: newPassword,
    });
    expect(signIn.status).toBe(200);
  });
});

describe('password change', () => {
  it('changes the password when signed in and emits password_changed only on success', async () => {
    const { c, userId } = await signUp('change');
    emitted.length = 0;
    const wrong = await c.post('/api/auth/change-password', {
      currentPassword: 'not my password!!',
      newPassword: 'a brand new passphrase',
    });
    expect(wrong.status).toBe(400);
    expect(emitted.filter((e) => e.name === 'user.password_changed')).toHaveLength(0);

    const ok = await c.post('/api/auth/change-password', {
      currentPassword: PASSWORD,
      newPassword: 'a brand new passphrase',
    });
    expect(ok.status).toBe(200);
    expect(emitted).toContainEqual({ name: 'user.password_changed', payload: { userId } });
  });
});

describe('magic link', () => {
  it('signs in from the emailed link', async () => {
    const { address } = await signUp('magic');
    await clearEmails(address);
    const c = client();
    const ask = await c.post('/api/auth/sign-in/magic-link', { email: address, callbackURL: '/' });
    expect(ask.status).toBe(200);
    const mail = await latestEmail(address);
    expect(mail.subject).toBe('Your Socioboard sign-in link');
    await c.get(linkPath(mail.text));
    expect((await c.get('/api/auth/get-session')).body).toMatchObject({ user: { email: address } });
  });
});

describe('two-factor authentication', () => {
  it('enables TOTP, then requires a code at the next sign-in', async () => {
    const { c, address } = await signUp('twofa');
    const enable = await c.post('/api/auth/two-factor/enable', { password: PASSWORD });
    expect(enable.status).toBe(200);
    const { totpURI, backupCodes } = enable.body as { totpURI: string; backupCodes: string[] };
    expect(backupCodes.length).toBeGreaterThan(0);
    const secret = new URL(totpURI).searchParams.get('secret') ?? '';
    expect(new URL(totpURI).searchParams.get('issuer')).toBe('Socioboard');

    const confirm = await c.post('/api/auth/two-factor/verify-totp', { code: totp(secret) });
    expect(confirm.status).toBe(200);

    const next = client();
    const signIn = await next.post('/api/auth/sign-in/email', {
      email: address,
      password: PASSWORD,
    });
    expect(signIn.body).toMatchObject({ twoFactorRedirect: true });
    expect((await next.get('/api/auth/get-session')).body).toBeNull();

    const wrong = await next.post('/api/auth/two-factor/verify-totp', { code: '000000' });
    expect(wrong.status).toBe(401);
    const right = await next.post('/api/auth/two-factor/verify-totp', { code: totp(secret) });
    expect(right.status).toBe(200);
    expect((await next.get('/api/auth/get-session')).body).toMatchObject({
      user: { email: address, twoFactorEnabled: true },
    });
  });
});

describe('workspaces through Better Auth', () => {
  it('creates a workspace server-side with the caller as owner', async () => {
    const { c, userId } = await signUp('owner');
    const cookie = (await c.get('/api/auth/get-session')).request.cookies;
    const ws = await auth.api.createOrganization({
      body: { name: 'Acme', slug: `acme-${run}`, timezone: 'Europe/Berlin' },
      headers: new Headers({ cookie }),
    });
    expect(ws.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    const member = await db.client.member.findFirstOrThrow({ where: { workspaceId: ws.id } });
    expect(member).toMatchObject({ userId, role: 'owner' });
  });

  it('does not expose Better Auth organization endpoints over HTTP', async () => {
    const { c } = await signUp('blocked');
    const res = await c.post('/api/auth/organization/create', {
      name: 'x',
      slug: `x-${run}`,
      timezone: 'UTC',
    });
    expect(res.status).toBe(404);
    expect(await db.client.workspace.count({ where: { slug: `x-${run}` } })).toBe(0);
  });
});
