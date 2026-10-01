// Seed data (P0-B10): seeded users can sign in and see the demo workspace with their role.
import { randomUUID } from 'node:crypto';

import { afterAll, describe, expect, it } from 'vitest';

import { seedDevData, type SeedResult } from '../seed';
import { createTestApp } from '../testing';

const t = createTestApp();
// As configured in dev: the breached-password check is on (the test app turns it off).
const platform = {
  ...t.platform,
  config: { ...t.config, auth: { ...t.config.auth, breachedPasswordCheck: true } },
};
const run = randomUUID().slice(0, 8);
const options = {
  password: 'seed password for tests',
  emailDomain: `seed-${run}.example.test`,
  workspaceSlug: `demo-${run}`,
  workspaceName: t.workspaceName('Demo'),
};

afterAll(async () => {
  const users = await t.db.client.user.findMany({
    where: { email: { endsWith: `@${options.emailDomain}` } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  await t.db.client.workspace.deleteMany({ where: { slug: options.workspaceSlug } });
  await t.db.client.auditLog.deleteMany({ where: { actorUserId: { in: ids } } });
  await t.db.client.user.deleteMany({ where: { id: { in: ids } } });
  await t.cleanup();
});

describe('seedDevData', () => {
  let first: SeedResult;

  // Draws and processes five sample images: slower than the default 5 s under a full run.
  it('creates one verified user per role and the demo workspace', async () => {
    first = await seedDevData(platform, options);
    expect(first.users.map((u) => [u.role, u.created])).toEqual([
      ['owner', true],
      ['admin', true],
      ['editor', true],
      ['contributor', true],
      ['viewer', true],
    ]);
    expect(first.workspace.created).toBe(true);

    const members = await t.db
      .forWorkspace(first.workspace.id)
      .member.findMany({ select: { role: true, user: { select: { email: true } } } });
    expect(Object.fromEntries(members.map((m) => [m.user.email, m.role]))).toEqual(
      Object.fromEntries(first.users.map((u) => [u.email, u.role])),
    );
    const verified = await t.db.client.user.count({
      where: { email: { endsWith: `@${options.emailDomain}` }, emailVerified: true },
    });
    expect(verified).toBe(5);
  }, 30_000);

  it('seeded users sign in with the seed password and see their role', async () => {
    const b = t.browser();
    const signIn = await b.post('/api/auth/sign-in/email', {
      email: `viewer@${options.emailDomain}`,
      password: options.password,
    });
    expect(signIn.status).toBe(200);
    const list = await b.get('/api/v1/workspaces');
    expect(list.status).toBe(200);
    const mine = (list.body as { items: { slug: string; myRole: string }[] }).items;
    expect(mine).toEqual([
      expect.objectContaining({ slug: options.workspaceSlug, myRole: 'viewer' }),
    ]);
  });

  it('adds sample media processed like a real upload (when storage is configured)', async () => {
    if (!t.platform.storage) {
      expect(first.media).toBe('no-storage');
      return;
    }
    expect(first.media).toBe(4);
    const assets = await t.db.forWorkspace(first.workspace.id).mediaAsset.findMany();
    expect(assets).toHaveLength(4);
    for (const a of assets) {
      expect(a.status).toBe('ready');
      expect(a.thumbnailKey).toBeTruthy();
      expect(a.width).toBeGreaterThan(0);
    }
    expect(assets.filter((a) => a.folderId)).toHaveLength(2);
  });

  it('adds paused sample accounts, a draft and a scheduled post', async () => {
    expect(first.posts).toBe(2);
    const ws = t.db.forWorkspace(first.workspace.id);
    const accounts = await ws.socialAccount.findMany({ orderBy: { network: 'asc' } });
    expect(accounts.map((a) => [a.network, a.status])).toEqual([
      ['facebook_page', 'paused'],
      ['instagram', 'paused'],
    ]);
    const posts = await ws.post.findMany({
      include: { targets: true },
      orderBy: { status: 'asc' },
    });
    expect(posts.map((p) => [p.status, p.targets.map((x) => x.status)])).toEqual([
      ['draft', ['pending', 'pending']],
      ['scheduled', ['scheduled', 'scheduled']],
    ]);
    const scheduledAt = posts[1]?.targets[0]?.scheduledAt?.getTime() ?? 0;
    expect(scheduledAt).toBeGreaterThan(Date.now());
  });

  it('gives the sample accounts weekday queue slots in the workspace timezone', async () => {
    expect(first.queueSlots).toBe(20);
    const slots = await t.db.forWorkspace(first.workspace.id).queueSlot.findMany();
    expect(new Set(slots.map((x) => x.time))).toEqual(new Set(['09:00', '15:00']));
    expect(new Set(slots.map((x) => x.weekday))).toEqual(new Set([1, 2, 3, 4, 5]));
    expect(slots.every((x) => x.timezone === 'UTC')).toBe(true);
  });

  it('running again adds nothing', async () => {
    const again = await seedDevData(platform, options);
    expect(again.users.every((u) => !u.created)).toBe(true);
    expect(again.workspace).toEqual({ ...first.workspace, created: false });
    expect(again.media).toBe(t.platform.storage ? 'exists' : 'no-storage');
    expect(again.posts).toBe('exists');
    expect(again.queueSlots).toBe('exists');
    expect(await t.db.forWorkspace(first.workspace.id).socialAccount.count()).toBe(2);
    const members = await t.db.forWorkspace(first.workspace.id).member.count();
    expect(members).toBe(5);
  });

  it('gives a password to a seeded user left without one by an interrupted run', async () => {
    const user = await t.db.client.user.findUniqueOrThrow({
      where: { email: `viewer@${options.emailDomain}` },
    });
    await t.db.client.account.deleteMany({ where: { userId: user.id } });
    await seedDevData(platform, options);
    const signIn = await t.browser().post('/api/auth/sign-in/email', {
      email: user.email,
      password: options.password,
    });
    expect(signIn.status).toBe(200);
  });

  it('completes sample media left unfinished by an interrupted run', async () => {
    if (!t.platform.storage) return;
    const scoped = t.db.forWorkspace(first.workspace.id);
    await scoped.mediaAsset.deleteMany({ where: { name: 'Logo loop.gif' } });
    const again = await seedDevData(platform, options);
    expect(again.media).toBe(1);
    const assets = await scoped.mediaAsset.findMany();
    expect(assets).toHaveLength(4);
    expect(assets.every((a) => a.status === 'ready')).toBe(true);
    expect(await scoped.mediaFolder.count()).toBe(1);
  });

  it('refuses to run in production', async () => {
    const production = { ...platform, config: { ...platform.config, isProduction: true } };
    await expect(seedDevData(production, options)).rejects.toThrow(/production/);
  });
});
