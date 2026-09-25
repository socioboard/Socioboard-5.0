// Workspaces, members and invitations over HTTP against Postgres, Valkey and Mailpit.
import { randomUUID } from 'node:crypto';

import {
  ErrorEnvelope,
  Invitation,
  InvitationPreview,
  Member,
  WorkspaceWithRole,
} from '@socioboard/contracts';
import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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
import { createAuthModule, createWorkspaceAuthPort } from '../../auth';
import { clearEmails, latestEmail, linkPath } from '../../../testing';
import {
  createMembershipLookup,
  createWorkspaceService,
  maskEmail,
  purgeDeletedWorkspaces,
  registerWorkspaceRoutes,
  slugify,
} from '../index';

const base = loadConfig();
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
if (!config.mail.smtpUrl) throw new Error('These tests need Mailpit (SMTP_URL)');
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 4, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const mailer = createMailer({ smtpUrl: config.mail.smtpUrl, from: config.mail.from, logger });
const storage = config.storage ? createStorage(config.storage) : undefined;
const events = createEventBus<Record<string, unknown>>({ logger });
const emitted: string[] = [];
for (const name of [
  'workspace.created',
  'workspace.deleted',
  'member.invited',
  'member.joined',
  'member.role_changed',
  'member.removed',
  'workspace.ownership_transferred',
]) {
  events.on(name, () => {
    emitted.push(name);
  });
}
const authModule = createAuthModule({ config, db, kv, mailer, logger, events });
const lookupMembership = createMembershipLookup(db);
const api = createApiRouter({ lookupMembership });
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
    requireVerifiedEmail: true,
  }),
);
const app = express();
app.set('trust proxy', 'loopback');
app.use(authModule.router);
app.use(express.json());
app.use('/api/v1', originCheck(config.appUrl), session(authModule.resolveSession));
app.use(api.router);
app.use(createErrorHandler(logger));

const run = randomUUID().slice(0, 8);
const email = (label: string) => `${label}-${run}@example.test`;
const PASSWORD = 'a long enough password';
let ipCounter = 0;
type Browser = ReturnType<typeof browser>;
function browser() {
  const agent = request.agent(app);
  const ip = `10.99.${String(Math.floor(++ipCounter / 250))}.${String(ipCounter % 250)}`;
  const h = <T extends request.Test>(t: T) =>
    t.set('Origin', config.appUrl).set('X-Forwarded-For', ip);
  return {
    get: (p: string) => h(agent.get(p)),
    post: (p: string, body?: object) => h(agent.post(p)).send(body),
    patch: (p: string, body?: object) => h(agent.patch(p)).send(body),
    delete: (p: string, body?: object) => h(agent.delete(p)).send(body),
  };
}
const code = (res: request.Response) => ErrorEnvelope.parse(res.body).error.code;

/** Signs up; verifies the email through the real emailed link unless told not to. */
async function user(label: string, { verified = true } = {}) {
  const b = browser();
  const res = await b.post('/api/auth/sign-up/email', {
    name: label,
    email: email(label),
    password: PASSWORD,
  });
  expect(res.status).toBe(200);
  const mail = await latestEmail(email(label));
  await clearEmails(email(label));
  if (verified) await b.get(linkPath(mail.text));
  return b;
}
async function workspace(owner: Browser, name: string) {
  const res = await owner.post('/api/v1/workspaces', { name, timezone: 'Asia/Kolkata' });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return WorkspaceWithRole.parse(res.body);
}
async function invite(owner: Browser, wid: string, label: string, role = 'editor') {
  const res = await owner.post(`/api/v1/workspaces/${wid}/invitations`, {
    email: email(label),
    role,
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Invitation.parse(res.body);
}
async function members(b: Browser, wid: string) {
  return z
    .object({ items: z.array(Member) })
    .parse((await b.get(`/api/v1/workspaces/${wid}/members`)).body).items;
}
const memberOf = async (b: Browser, wid: string, label: string) =>
  (await members(b, wid)).find((m) => m.user.email === email(label));

// An existing platform admin, so none of this file's users is promoted by the first-user bootstrap.
beforeAll(async () => {
  await db.client.user.create({
    data: { name: 'Guard', email: email('guard'), isPlatformAdmin: true },
  });
});
afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { name: { startsWith: `T${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
  mailer.close();
  storage?.close();
});
const T = (name: string) => `T${run} ${name}`;

describe('helpers', () => {
  it('slugify and maskEmail', () => {
    expect(slugify('Acme Marketing Team!')).toBe('acme-marketing-team');
    expect(slugify('Café Crème')).toBe('cafe-creme');
    expect(slugify('!!')).toBe('workspace');
    expect(maskEmail('chethan@example.com')).toBe('c•••n@example.com');
    expect(maskEmail('ab@example.com')).toBe('a•••@example.com');
  });
});

describe('create, read, update', () => {
  it('requires a verified email to create a workspace', async () => {
    const b = await user('unverified', { verified: false });
    const res = await b.post('/api/v1/workspaces', { name: T('x'), timezone: 'UTC' });
    expect(res.status).toBe(403);
    expect(code(res)).toBe('EMAIL_NOT_VERIFIED');
  });

  it('creates with a generated slug, handles taken slugs, and lists and reads it', async () => {
    const owner = await user('creator');
    const ws = await workspace(owner, T('Acme'));
    expect(ws).toMatchObject({
      myRole: 'owner',
      timezone: 'Asia/Kolkata',
      requireReviewForAll: false,
    });
    expect(ws.slug).toMatch(/^t[0-9a-f]{8}-acme/);
    expect(emitted).toContain('workspace.created');

    const again = await workspace(owner, T('Acme'));
    expect(again.slug).not.toBe(ws.slug);
    const taken = await owner.post('/api/v1/workspaces', {
      name: 'x',
      slug: ws.slug,
      timezone: 'UTC',
    });
    expect(taken.status).toBe(409);
    expect(code(taken)).toBe('SLUG_TAKEN');

    const list = z
      .object({ items: z.array(WorkspaceWithRole) })
      .parse((await owner.get('/api/v1/workspaces')).body);
    expect(list.items.map((w) => w.id)).toEqual(expect.arrayContaining([ws.id, again.id]));
    expect((await owner.get(`/api/v1/workspaces/${ws.id}`)).body).toMatchObject({ id: ws.id });
  });

  it('lets owner/admin update settings, not editors; slugs stay unique', async () => {
    const owner = await user('updater');
    const ws = await workspace(owner, T('Settings'));
    const other = await workspace(owner, T('Other'));
    const res = await owner.patch(`/api/v1/workspaces/${ws.id}`, {
      name: T('Renamed'),
      timezone: 'Europe/Berlin',
      requireReviewForAll: true,
    });
    expect(WorkspaceWithRole.parse(res.body)).toMatchObject({
      name: T('Renamed'),
      timezone: 'Europe/Berlin',
      requireReviewForAll: true,
    });
    expect((await owner.patch(`/api/v1/workspaces/${ws.id}`, { slug: other.slug })).status).toBe(
      409,
    );

    const editor = await user('settings-editor');
    const inv = await invite(owner, ws.id, 'settings-editor');
    await editor.post(`/api/v1/invitations/${inv.id}/accept`);
    const denied = await editor.patch(`/api/v1/workspaces/${ws.id}`, { name: 'x' });
    expect(denied.status).toBe(403);
  });

  it.runIf(!storage)('reports that logo upload needs storage', async () => {
    const owner = await user('logo-nostorage');
    const ws = await workspace(owner, T('Logo'));
    const res = await owner.post(`/api/v1/workspaces/${ws.id}/logo-upload`, {
      mime: 'image/png',
      sizeBytes: 10,
    });
    expect(res.status).toBe(503);
  });

  it.runIf(storage)('uploads and sets a logo, refusing keys from another workspace', async () => {
    const owner = await user('logo');
    const ws = await workspace(owner, T('Logo'));
    const other = await workspace(owner, T('Logo other'));
    const png = Buffer.alloc(64, 1);
    const ticket = (
      await owner.post(`/api/v1/workspaces/${other.id}/logo-upload`, {
        mime: 'image/png',
        sizeBytes: png.length,
      })
    ).body as { uploadUrl: string; key: string };
    await fetch(ticket.uploadUrl, {
      method: 'PUT',
      body: png,
      headers: { 'content-type': 'image/png' },
    });
    const wrong = await owner.patch(`/api/v1/workspaces/${ws.id}`, { logoKey: ticket.key });
    expect(wrong.status).toBe(422);
    const ok = await owner.patch(`/api/v1/workspaces/${other.id}`, { logoKey: ticket.key });
    expect(WorkspaceWithRole.parse(ok.body).logoUrl).toContain(ticket.key.split('/').pop());
  });
});

describe('invitations', () => {
  it('invites by email, shows a safe public preview, and joins on accept', async () => {
    const owner = await user('inviter');
    const ws = await workspace(owner, T('Team'));
    const invitee = await user('invitee');
    const inv = await invite(owner, ws.id, 'invitee', 'editor');
    expect(inv).toMatchObject({ email: email('invitee'), role: 'editor', status: 'pending' });

    const mail = await latestEmail(email('invitee'));
    expect(mail.subject).toContain(T('Team'));
    expect(mail.text).toContain(`${config.appUrl}/invite/${inv.id}`);

    const listed = (await owner.get(`/api/v1/workspaces/${ws.id}/invitations`)).body as {
      items: { id: string }[];
    };
    expect(listed.items.map((i) => i.id)).toContain(inv.id);

    const preview = InvitationPreview.parse(
      (await request(app).get(`/api/v1/invitations/${inv.id}`)).body,
    );
    expect(preview).toMatchObject({
      workspace: { name: T('Team') },
      role: 'editor',
      status: 'pending',
      invitedByName: 'inviter',
    });
    expect(preview.emailHint).not.toContain(`invitee-${run}`);

    const accepted = await invitee.post(`/api/v1/invitations/${inv.id}/accept`);
    expect(accepted.status).toBe(200);
    expect(WorkspaceWithRole.parse(accepted.body)).toMatchObject({ id: ws.id, myRole: 'editor' });
    expect(emitted).toContain('member.joined');
    expect((await members(owner, ws.id)).map((m) => m.role).sort()).toEqual(['editor', 'owner']);
    expect((await invitee.post(`/api/v1/invitations/${inv.id}/accept`)).status).toBe(422);
  });

  it('refuses duplicates: existing members and pending invitations', async () => {
    const owner = await user('dup-owner');
    const ws = await workspace(owner, T('Dup'));
    await invite(owner, ws.id, 'dup-invitee');
    const again = await owner.post(`/api/v1/workspaces/${ws.id}/invitations`, {
      email: email('dup-invitee'),
      role: 'viewer',
    });
    expect(code(again)).toBe('ALREADY_INVITED');
    const self = await owner.post(`/api/v1/workspaces/${ws.id}/invitations`, {
      email: email('dup-owner'),
      role: 'viewer',
    });
    expect(code(self)).toBe('ALREADY_MEMBER');
    const asOwner = await owner.post(`/api/v1/workspaces/${ws.id}/invitations`, {
      email: email('x'),
      role: 'owner',
    });
    expect(asOwner.status).toBe(400);
  });

  it('only the invited, verified address can accept', async () => {
    const owner = await user('guarded-owner');
    const ws = await workspace(owner, T('Guarded'));
    const inv = await invite(owner, ws.id, 'guarded-target');

    const stranger = await user('guarded-stranger');
    const byStranger = await stranger.post(`/api/v1/invitations/${inv.id}/accept`);
    expect(byStranger.status).toBe(404);

    const unverified = await user('guarded-target', { verified: false });
    const byUnverified = await unverified.post(`/api/v1/invitations/${inv.id}/accept`);
    expect(byUnverified.status).toBe(403);
    expect(code(byUnverified)).toBe('EMAIL_NOT_VERIFIED');
    expect(await memberOf(owner, ws.id, 'guarded-target')).toBeUndefined();
  });

  it('handles revoked, expired and declined invitations', async () => {
    const owner = await user('states-owner');
    const ws = await workspace(owner, T('States'));
    const target = await user('states-target');

    const revoked = await invite(owner, ws.id, 'states-target');
    expect(
      (await owner.delete(`/api/v1/workspaces/${ws.id}/invitations/${revoked.id}`)).status,
    ).toBe(204);
    expect(code(await target.post(`/api/v1/invitations/${revoked.id}/accept`))).toBe(
      'INVITATION_REVOKED',
    );

    const expired = await invite(owner, ws.id, 'states-target');
    await db.client.invitation.update({
      where: { id: expired.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(code(await target.post(`/api/v1/invitations/${expired.id}/accept`))).toBe(
      'INVITATION_EXPIRED',
    );

    const declined = await invite(owner, ws.id, 'states-target');
    expect((await target.post(`/api/v1/invitations/${declined.id}/decline`)).status).toBe(204);
    expect(code(await target.post(`/api/v1/invitations/${declined.id}/accept`))).toBe(
      'INVITATION_DECLINED',
    );
  });
});

describe('members and roles', () => {
  async function team() {
    const owner = await user(`team-owner-${String(++ipCounter)}`);
    const ws = await workspace(owner, T('Roles'));
    const join = async (label: string, role: string) => {
      const b = await user(label);
      const inv = await invite(owner, ws.id, label, role);
      await b.post(`/api/v1/invitations/${inv.id}/accept`);
      return b;
    };
    const suffix = String(ipCounter);
    const admin = await join(`team-admin-${suffix}`, 'admin');
    const editor = await join(`team-editor-${suffix}`, 'editor');
    const ids = Object.fromEntries((await members(owner, ws.id)).map((m) => [m.role, m.id]));
    return { owner, admin, editor, ws, ids: ids as Record<'owner' | 'admin' | 'editor', string> };
  }

  it('changes roles, but never the owner and never to owner', async () => {
    const { owner, admin, editor, ws, ids } = await team();
    const promoted = await owner.patch(`/api/v1/workspaces/${ws.id}/members/${ids.editor}`, {
      role: 'viewer',
    });
    expect(Member.parse(promoted.body).role).toBe('viewer');
    const ownerChange = await admin.patch(`/api/v1/workspaces/${ws.id}/members/${ids.owner}`, {
      role: 'viewer',
    });
    expect(code(ownerChange)).toBe('CANNOT_CHANGE_OWNER');
    expect(
      (await editor.patch(`/api/v1/workspaces/${ws.id}/members/${ids.admin}`, { role: 'viewer' }))
        .status,
    ).toBe(403);
    expect(
      (await owner.patch(`/api/v1/workspaces/${ws.id}/members/${ids.admin}`, { role: 'owner' }))
        .status,
    ).toBe(400);
  });

  it('lets members leave, managers remove, and the owner neither', async () => {
    const { owner, admin, editor, ws, ids } = await team();
    expect((await editor.delete(`/api/v1/workspaces/${ws.id}/members/${ids.admin}`)).status).toBe(
      403,
    );
    expect((await editor.delete(`/api/v1/workspaces/${ws.id}/members/${ids.editor}`)).status).toBe(
      204,
    );
    expect((await editor.get(`/api/v1/workspaces/${ws.id}`)).status).toBe(404);
    expect(code(await admin.delete(`/api/v1/workspaces/${ws.id}/members/${ids.owner}`))).toBe(
      'OWNER_CANNOT_LEAVE',
    );
    expect(code(await owner.delete(`/api/v1/workspaces/${ws.id}/members/${ids.owner}`))).toBe(
      'OWNER_CANNOT_LEAVE',
    );
    expect((await owner.delete(`/api/v1/workspaces/${ws.id}/members/${ids.admin}`)).status).toBe(
      204,
    );
    expect(emitted).toContain('member.removed');
  });

  it('transfers ownership only from the owner, only to an admin', async () => {
    const { owner, admin, ws, ids } = await team();
    expect(
      code(
        await admin.post(`/api/v1/workspaces/${ws.id}/transfer-ownership`, { memberId: ids.admin }),
      ),
    ).toBe('OWNER_ONLY');
    expect(
      code(
        await owner.post(`/api/v1/workspaces/${ws.id}/transfer-ownership`, {
          memberId: ids.editor,
        }),
      ),
    ).toBe('TARGET_NOT_ADMIN');
    expect(
      (await owner.post(`/api/v1/workspaces/${ws.id}/transfer-ownership`, { memberId: ids.admin }))
        .status,
    ).toBe(204);
    const roles = Object.fromEntries((await members(admin, ws.id)).map((m) => [m.id, m.role]));
    expect(roles[ids.admin]).toBe('owner');
    expect(roles[ids.owner]).toBe('admin');
  });

  it('never reaches members or invitations of another workspace', async () => {
    const a = await team();
    const b = await team();
    const res = await a.owner.patch(`/api/v1/workspaces/${a.ws.id}/members/${b.ids.editor}`, {
      role: 'viewer',
    });
    expect(code(res)).toBe('MEMBER_NOT_FOUND');
    expect(
      (await a.owner.delete(`/api/v1/workspaces/${a.ws.id}/members/${b.ids.editor}`)).status,
    ).toBe(404);
    const invB = await invite(b.owner, b.ws.id, `cross-${run}`);
    expect(
      (await a.owner.delete(`/api/v1/workspaces/${a.ws.id}/invitations/${invB.id}`)).status,
    ).toBe(404);
    expect((await a.owner.get(`/api/v1/workspaces/${b.ws.id}/members`)).status).toBe(404);
  });
});

describe('delete and purge', () => {
  it('needs the exact name, is owner-only, and hides the workspace and its invitations', async () => {
    const owner = await user('deleter');
    const ws = await workspace(owner, T('Doomed'));
    const inv = await invite(owner, ws.id, 'doomed-invitee');
    expect(code(await owner.delete(`/api/v1/workspaces/${ws.id}`, { confirmName: 'nope' }))).toBe(
      'CONFIRMATION_MISMATCH',
    );
    expect(
      (await owner.delete(`/api/v1/workspaces/${ws.id}`, { confirmName: T('Doomed') })).status,
    ).toBe(204);
    expect((await owner.get(`/api/v1/workspaces/${ws.id}`)).status).toBe(404);
    expect((await request(app).get(`/api/v1/invitations/${inv.id}`)).status).toBe(404);
    const row = await db.client.invitation.findUniqueOrThrow({ where: { id: inv.id } });
    expect(row.status).toBe('canceled');
    expect(emitted).toContain('workspace.deleted');
  });

  it('purges only workspaces deleted more than 30 days ago', async () => {
    const owner = await user('purger');
    const old = await workspace(owner, T('Old'));
    const recent = await workspace(owner, T('Recent'));
    const day = 24 * 60 * 60 * 1000;
    await db.client.workspace.update({
      where: { id: old.id },
      data: { deletedAt: new Date(Date.now() - 31 * day) },
    });
    await db.client.workspace.update({
      where: { id: recent.id },
      data: { deletedAt: new Date(Date.now() - 29 * day) },
    });
    await purgeDeletedWorkspaces({ db, storage, clock: systemClock, logger });
    expect(await db.client.workspace.findUnique({ where: { id: old.id } })).toBeNull();
    expect(await db.client.workspace.findUnique({ where: { id: recent.id } })).not.toBeNull();
    expect(await db.client.member.count({ where: { workspaceId: old.id } })).toBe(0);
  });
});
