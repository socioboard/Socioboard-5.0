// The audit write path end to end: HTTP actions → domain events → AuditLog rows.
import { randomUUID } from 'node:crypto';

import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createApiRouter,
  createDb,
  createErrorHandler,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  loadConfig,
  originCheck,
  requestContext,
  session,
  systemClock,
} from '../../../platform';
import { createAuthModule, createWorkspaceAuthPort } from '../../auth';
import {
  createMembershipLookup,
  createWorkspaceService,
  registerWorkspaceRoutes,
} from '../../workspaces';
import { createAuditLog, registerAuditListeners, type AuditLog } from '../index';

const base = loadConfig();
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 4, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const mailer = createMailer({ smtpUrl: undefined, from: 'x', logger });

/** A full app with the audit listeners on its bus; `audit` can be swapped to simulate failures. */
function buildApp(audit: AuditLog) {
  const events = createEventBus<Record<string, unknown>>({ logger });
  registerAuditListeners(events, audit, logger);
  const authModule = createAuthModule({ config, db, kv, mailer, logger, events });
  const api = createApiRouter({ lookupMembership: createMembershipLookup(db) });
  registerWorkspaceRoutes(
    api,
    createWorkspaceService({
      db,
      authPort: createWorkspaceAuthPort(authModule.auth),
      storage: undefined,
      mailer,
      events,
      clock: systemClock,
      logger,
      appUrl: config.appUrl,
      requireVerifiedEmail: false,
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
  return app;
}

const audit = createAuditLog({ db, clock: systemClock });
const app = buildApp(audit);
const run = randomUUID().slice(0, 8);
const email = (label: string) => `${label}-${run}@example.test`;
let n = 0;

function browser(target = app) {
  const agent = request.agent(target);
  const ip = `10.55.${String(Math.floor(++n / 250))}.${String(n % 250)}`;
  const h = <T extends request.Test>(t: T) =>
    t
      .set('Origin', config.appUrl)
      .set('X-Forwarded-For', ip)
      .set('User-Agent', `audit-test/${String(n)}`);
  return {
    ip,
    ua: `audit-test/${String(n)}`,
    post: (p: string, body?: object) => h(agent.post(p)).send(body),
    patch: (p: string, body?: object) => h(agent.patch(p)).send(body),
    delete: (p: string) => h(agent.delete(p)),
    get: (p: string) => h(agent.get(p)),
  };
}
async function signUp(label: string, target = app) {
  const b = browser(target);
  const res = await b.post('/api/auth/sign-up/email', {
    name: label,
    email: email(label),
    password: 'a long enough password',
  });
  expect(res.status).toBe(200);
  return { ...b, userId: (res.body as { user: { id: string } }).user.id };
}
const entries = (where: object) =>
  db.client.auditLog.findMany({ where, orderBy: { createdAt: 'asc' } });

beforeAll(async () => {
  await db.client.user.create({
    data: { name: 'Guard', email: email('guard'), isPlatformAdmin: true },
  });
});
afterAll(async () => {
  const users = await db.client.user.findMany({
    where: { email: { endsWith: `-${run}@example.test` } },
    select: { id: true },
  });
  await db.client.auditLog.deleteMany({ where: { actorUserId: { in: users.map((u) => u.id) } } });
  await db.client.workspace.deleteMany({ where: { name: { startsWith: `A${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
});

describe('audit write path', () => {
  it('records sign-up and sign-in with the client IP and user agent', async () => {
    const u = await signUp('signup');
    const rows = await entries({ actorUserId: u.userId });
    expect(rows.map((r) => r.action)).toEqual(
      expect.arrayContaining(['user.signed_up', 'user.signed_in']),
    );
    const signedUp = rows.find((r) => r.action === 'user.signed_up');
    expect(signedUp).toMatchObject({
      workspaceId: null,
      actorType: 'user',
      entityType: 'user',
      entityId: u.userId,
      ip: u.ip,
      userAgent: u.ua,
      diff: { email: email('signup') },
    });
  });

  it('records the workspace and membership lifecycle', async () => {
    const owner = await signUp('owner');
    const ws = await owner.post('/api/v1/workspaces', { name: `A${run} team`, timezone: 'UTC' });
    const wid = (ws.body as { id: string }).id;
    const invitee = await signUp('invitee');
    const inv = await owner.post(`/api/v1/workspaces/${wid}/invitations`, {
      email: email('invitee'),
      role: 'editor',
    });
    const invId = (inv.body as { id: string }).id;
    await invitee.post(`/api/v1/invitations/${invId}/accept`);
    const members = (await owner.get(`/api/v1/workspaces/${wid}/members`)).body as {
      items: { id: string; role: string }[];
    };
    const editor = members.items.find((m) => m.role === 'editor');
    await owner.patch(`/api/v1/workspaces/${wid}/members/${editor?.id ?? ''}`, { role: 'viewer' });
    await owner.delete(`/api/v1/workspaces/${wid}/members/${editor?.id ?? ''}`);

    const rows = await entries({ workspaceId: wid });
    expect(rows.map((r) => r.action)).toEqual([
      'workspace.created',
      'member.invited',
      'member.joined',
      'member.role_changed',
      'member.removed',
    ]);
    expect(rows.find((r) => r.action === 'member.invited')?.diff).toEqual({
      email: email('invitee'),
      role: 'editor',
    });
    expect(rows.find((r) => r.action === 'member.joined')?.actorUserId).toBe(invitee.userId);
    expect(rows.find((r) => r.action === 'member.role_changed')?.diff).toEqual({
      from: 'editor',
      to: 'viewer',
    });
    expect(rows.find((r) => r.action === 'member.removed')?.diff).toMatchObject({
      left: false,
      removedUserId: invitee.userId,
    });
    expect(rows.every((r) => r.ip !== null)).toBe(true);
  });

  it('strips secrets from details before storing', async () => {
    const u = await signUp('redact');
    await audit.record({
      workspaceId: null,
      actor: { userId: u.userId, type: 'system' },
      action: 'test.redaction',
      entity: { type: 'test', id: null },
      diff: {
        note: 'kept',
        accessToken: 'LEAK1',
        nested: { password: 'LEAK2', refresh_token: 'LEAK3' },
      },
      ip: null,
    });
    const [row] = await entries({ actorUserId: u.userId, action: 'test.redaction' });
    expect(JSON.stringify(row?.diff)).not.toMatch(/LEAK/);
    expect(row?.diff).toMatchObject({ note: 'kept', accessToken: '[redacted]' });
  });

  it('never fails the user action when the audit write fails', async () => {
    const broken: AuditLog = {
      record: () => Promise.reject(new Error('audit database down')),
      purgeExpired: () => Promise.resolve(0),
    };
    const u = await signUp('audit-down', buildApp(broken));
    expect(u.userId).toBeTruthy();
  });

  it('deletes only entries older than the retention period', async () => {
    const u = await signUp('retention');
    const day = 24 * 60 * 60 * 1000;
    for (const [action, age] of [
      ['test.old', 731],
      ['test.recent', 729],
    ] as const) {
      await db.client.auditLog.create({
        data: {
          actorUserId: u.userId,
          actorType: 'system',
          action,
          entityType: 'test',
          createdAt: new Date(Date.now() - age * day),
        },
      });
    }
    await audit.purgeExpired(730);
    const actions = (await entries({ actorUserId: u.userId, action: { startsWith: 'test.' } })).map(
      (r) => r.action,
    );
    expect(actions).toEqual(['test.recent']);
  });
});
