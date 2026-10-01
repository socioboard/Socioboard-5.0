// The admin console v1 (P2-B10) against Postgres and Valkey: who gets in (platform admins with
// 2FA verified in this session), what they see across workspaces (never post content), and the
// audited retry and cancel. Activity is seeded on networks no other test publishes to (Snapchat,
// Tumblr), so counts are exact even with other test files running at the same time.
import {
  AdminAccountPage,
  AdminOverview,
  AdminTarget,
  AdminTargetPage,
  ErrorEnvelope,
  PublishingHealth,
} from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp, totp } from '../../../testing';
import { publishJobId } from '../../publishing';
import { twoFactorVerifiedKey } from '../../auth';
import { createPublishingServices } from '../../../domain';
import { WORKER_QUEUES } from '../index';

const t = createTestApp();
const PASSWORD = 'a long enough password';
const publishQueue = t.platform.queues.get(
  createPublishingServices(t.platform, { registry: t.networks.registry }).publishQueue,
);
type Browser = Awaited<ReturnType<typeof t.signUp>>;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const MIN = 60_000;
const DAY = 86_400_000;

let admin: Browser;
let owner: Browser;
let secret = '';
let ws = '';

/** Session id of a browser, as Better Auth reports it. */
async function sessionId(who: Browser) {
  const res = await who.get('/api/auth/get-session');
  return (res.body as { session: { id: string } }).session.id;
}

beforeAll(async () => {
  admin = await t.signUp('adm-staff');
  owner = await t.signUp('adm-owner');
  await t.db.client.user.update({ where: { id: admin.userId }, data: { isPlatformAdmin: true } });
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Adm'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
});

afterAll(async () => {
  await t.cleanup();
});

describe('who gets in', () => {
  it('signed out: 401; a workspace owner who isn’t a platform admin: 403', async () => {
    const anon = t.browser();
    expect((await anon.get('/api/admin/overview')).status).toBe(401);
    const res = await owner.get('/api/admin/overview');
    expect([res.status, code(res)]).toEqual([403, 'NOT_PLATFORM_ADMIN']);
  });

  it('a platform admin without 2FA is refused until it’s on and verified', async () => {
    const before = await admin.get('/api/admin/overview');
    expect([before.status, code(before)]).toEqual([403, 'ADMIN_2FA_REQUIRED']);
    const enable = await admin.post('/api/auth/two-factor/enable', { password: PASSWORD });
    secret = new URL((enable.body as { totpURI: string }).totpURI).searchParams.get('secret') ?? '';
    // Turned on but not confirmed yet: still refused.
    expect(code(await admin.get('/api/admin/overview'))).toBe('ADMIN_2FA_REQUIRED');
    const confirm = await admin.post('/api/auth/two-factor/verify-totp', { code: totp(secret) });
    expect(confirm.status).toBe(200);
    expect((await admin.get('/api/admin/overview')).status).toBe(200);
  });

  it('a session that didn’t pass 2FA must verify again (step up)', async () => {
    await t.platform.kv.delete(twoFactorVerifiedKey(await sessionId(admin)));
    expect(code(await admin.get('/api/admin/overview'))).toBe('ADMIN_2FA_REQUIRED');
    const again = await admin.post('/api/auth/two-factor/verify-totp', { code: totp(secret) });
    expect(again.status).toBe(200);
    expect((await admin.get('/api/admin/overview')).status).toBe(200);
  });

  it('signing in with the code gives a session that gets in', async () => {
    const other = t.browser();
    const signIn = await other.post('/api/auth/sign-in/email', {
      email: t.email('adm-staff'),
      password: PASSWORD,
    });
    expect(signIn.body).toMatchObject({ twoFactorRedirect: true });
    await other.post('/api/auth/two-factor/verify-totp', { code: totp(secret) });
    expect((await other.get('/api/admin/overview')).status).toBe(200);
  });

  it('2FA turned off: refused again', async () => {
    await t.db.client.user.update({
      where: { id: admin.userId },
      data: { twoFactorEnabled: false },
    });
    try {
      expect(code(await admin.get('/api/admin/overview'))).toBe('ADMIN_2FA_REQUIRED');
    } finally {
      await t.db.client.user.update({
        where: { id: admin.userId },
        data: { twoFactorEnabled: true },
      });
    }
  });

  it('Bull Board: the same guard; read-only, with every worker queue', async () => {
    expect((await t.browser().get('/api/admin/queues')).status).toBe(401);
    expect(code(await owner.get('/api/admin/queues'))).toBe('NOT_PLATFORM_ADMIN');
    const page = await admin.get('/api/admin/queues');
    expect(page.status).toBe(200);
    expect(page.text).toContain('<html');
    const api = await admin.get('/api/admin/queues/api/queues');
    expect(api.status).toBe(200);
    const queues = (api.body as { queues: { name: string; readOnlyMode: boolean }[] }).queues;
    expect(queues.map((q) => q.name).sort()).toEqual([...WORKER_QUEUES].sort());
    expect(queues.every((q) => q.readOnlyMode)).toBe(true);
  });
});

describe('publishing across workspaces', () => {
  const ids = {
    failed: '',
    stuck: '',
    scheduled: '',
    published: '',
    inFlight: '',
    account: '',
  };

  /** A target on the Snapchat account; returns its id. */
  async function target(text: string, data: object) {
    const post = await t.db.client.post.create({ data: { workspaceId: ws, text } });
    return (
      await t.db.client.postTarget.create({
        data: { workspaceId: ws, postId: post.id, socialAccountId: ids.account, ...data },
      })
    ).id;
  }
  const attempt = (postTargetId: string, attemptNo: number, data: object) =>
    t.db.client.publishAttempt.create({
      data: { workspaceId: ws, postTargetId, attemptNo, finishedAt: new Date(), ...data },
    });
  const ageUpdatedAt = (id: string, ms: number) =>
    t.db.client
      .$executeRaw`UPDATE "PostTarget" SET "updatedAt" = ${new Date(Date.now() - ms)} WHERE id = ${id}::uuid`;

  beforeAll(async () => {
    ids.account = (
      await t.db.client.socialAccount.create({
        data: {
          workspaceId: ws,
          network: 'snapchat',
          externalId: 'snap-1',
          displayName: 'Halden Snaps',
        },
      })
    ).id;
    ids.failed = await target('SECRET failed text', {
      status: 'failed',
      attempts: 2,
      lastError: { kind: 'content', networkCode: '100', message: 'Refused' },
    });
    await attempt(ids.failed, 1, { outcome: 'will_retry', errorKind: 'retryable' });
    await attempt(ids.failed, 2, {
      outcome: 'failed',
      errorKind: 'content',
      networkCode: '100',
      message: 'Refused',
    });
    ids.stuck = await target('SECRET stuck text', { status: 'publishing', attempts: 1 });
    await attempt(ids.stuck, 1, { outcome: 'running', finishedAt: null });
    await ageUpdatedAt(ids.stuck, 20 * MIN);
    ids.scheduled = await target('SECRET scheduled', {
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + DAY),
      scheduleVersion: 1,
    });
    ids.published = await target('SECRET published', {
      status: 'published',
      publishedAt: new Date(),
      attempts: 1,
    });
    await attempt(ids.published, 1, { outcome: 'published' });
    ids.inFlight = await target('SECRET in flight', { status: 'publishing', attempts: 1 });
  });

  it('overview: counts over the last day, every queue’s backlog, cached for a minute', async () => {
    // The access checks above cached one from before this data existed.
    await t.platform.kv.delete('admin-cache:overview');
    const res = await admin.get('/api/admin/overview');
    const o = AdminOverview.parse(res.body);
    expect(o.published24h).toBeGreaterThanOrEqual(1);
    expect(o.failed24h).toBeGreaterThanOrEqual(1);
    expect(o.stuckTargets).toBeGreaterThanOrEqual(1);
    expect(o.queues.map((q) => q.name)).toEqual([...WORKER_QUEUES]);
    const again = AdminOverview.parse((await admin.get('/api/admin/overview')).body);
    expect(again.generatedAt).toBe(o.generatedAt);
  });

  it('publishing health per network: outcomes, retries, success rate, top errors', async () => {
    const res = await admin.get('/api/admin/publishing/health?range=24h&network=snapchat');
    expect(PublishingHealth.parse(res.body).networks).toEqual([
      {
        network: 'snapchat',
        published: 1,
        failed: 1,
        retried: 1,
        successRate: 0.5,
        topErrors: [{ kind: 'content', networkCode: '100', message: 'Refused', count: 1 }],
      },
    ]);
  });

  it('failed and stuck deliveries, newest first, without the post’s content', async () => {
    const res = await admin.get(`/api/admin/publishing/failed?workspaceId=${ws}`);
    const page = AdminTargetPage.parse(res.body);
    expect(page.items.map((x) => x.id)).toEqual([ids.stuck, ids.failed]);
    expect(page.items.map((x) => x.stuck)).toEqual([true, false]);
    expect(page.items[1]).toMatchObject({
      attempts: 2,
      lastError: { kind: 'content', message: 'Refused' },
      account: { network: 'snapchat', displayName: 'Halden Snaps' },
    });
    expect(JSON.stringify(res.body)).not.toContain('SECRET');
    const failed = await admin.get(
      `/api/admin/publishing/failed?workspaceId=${ws}&state=failed&errorKind=content`,
    );
    expect(AdminTargetPage.parse(failed.body).items.map((x) => x.id)).toEqual([ids.failed]);
    const other = await admin.get(`/api/admin/publishing/failed?workspaceId=${ws}&network=x`);
    expect(AdminTargetPage.parse(other.body).items).toEqual([]);
  });

  it('retry: a failed or stuck delivery gets a new try, with the reason audited', async () => {
    const short = await admin.post(`/api/admin/publishing/targets/${ids.failed}/retry`, {
      reason: 'x',
    });
    expect(short.status).toBe(400);
    const res = await admin.post(`/api/admin/publishing/targets/${ids.failed}/retry`, {
      reason: 'Customer fixed the Page',
    });
    expect(res.status).toBe(202);
    expect(AdminTarget.parse(res.body)).toMatchObject({ status: 'publishing', stuck: false });
    expect(await publishQueue.getJob(publishJobId(ids.failed, 2))).toBeDefined();
    const entry = await t.db.client.auditLog.findFirst({
      where: { action: 'admin.target_retried', entityId: ids.failed },
    });
    expect(entry).toMatchObject({ actorUserId: admin.userId, actorType: 'admin' });
    expect(entry?.diff).toMatchObject({ reason: 'Customer fixed the Page' });
    // Now in flight: not again.
    const again = await admin.post(`/api/admin/publishing/targets/${ids.failed}/retry`, {
      reason: 'twice',
    });
    expect([again.status, code(again)]).toEqual([409, 'TARGET_NOT_RETRYABLE']);
    const stuck = await admin.post(`/api/admin/publishing/targets/${ids.stuck}/retry`, {
      reason: 'Checked the Page: not posted',
    });
    expect(stuck.status).toBe(202);
  });

  it('cancel: scheduled, failed or stuck; never published or in flight', async () => {
    const res = await admin.post(`/api/admin/publishing/targets/${ids.scheduled}/cancel`, {
      reason: 'Workspace asked to stop',
    });
    expect(res.status).toBe(200);
    expect(AdminTarget.parse(res.body).status).toBe('cancelled');
    for (const id of [ids.published, ids.inFlight, ids.scheduled]) {
      const r = await admin.post(`/api/admin/publishing/targets/${id}/cancel`, {
        reason: 'not this one',
      });
      expect([r.status, code(r)]).toEqual([409, 'TARGET_NOT_CANCELLABLE']);
    }
    const missing = await admin.post(
      '/api/admin/publishing/targets/01890a5d-ac96-774b-bcce-b302099a8057/cancel',
      { reason: 'missing' },
    );
    expect([missing.status, code(missing)]).toEqual([404, 'TARGET_NOT_FOUND']);
    expect(
      await t.db.client.auditLog.count({
        where: { action: 'admin.target_cancelled', entityId: ids.scheduled },
      }),
    ).toBe(1);
  });
});

describe('accounts needing attention', () => {
  const soon = new Date(Date.now() + 3 * DAY);
  const later = new Date(Date.now() + 20 * DAY);
  const names: Record<string, string> = {};

  beforeAll(async () => {
    const login = (name: string, tokenExpiresAt: Date | null) =>
      t.db.client.socialConnection.create({
        data: {
          workspaceId: ws,
          provider: 'facebook',
          externalUserId: `tumblr-${name}`,
          displayName: name,
          accessTokenEnc: t.platform.crypto.encrypt('token'),
          tokenExpiresAt,
        },
      });
    const account = async (
      name: string,
      data: {
        connectionId: string;
        status?: 'active' | 'reauth_required';
        asset?: Date | 'forever';
      },
    ) => {
      const row = await t.db.client.socialAccount.create({
        data: {
          workspaceId: ws,
          connectionId: data.connectionId,
          network: 'tumblr',
          externalId: name,
          displayName: name,
          status: data.status ?? 'active',
          statusReason: data.status === 'reauth_required' ? 'Session expired' : null,
          assetTokenEnc: data.asset ? t.platform.crypto.encrypt('asset') : null,
          assetTokenExpiresAt: data.asset instanceof Date ? data.asset : null,
        },
      });
      names[row.id] = name;
      return row;
    };
    const fine = await login('fine', null);
    const expiringLogin = await login('expiring-login', soon);
    const broken = await account('broken', { connectionId: fine.id, status: 'reauth_required' });
    await account('asset-soon', { connectionId: fine.id, asset: soon });
    await account('login-soon', { connectionId: expiringLogin.id });
    // Posts with its own token that doesn't expire: the login's expiry doesn't stop it.
    await account('own-token', { connectionId: expiringLogin.id, asset: 'forever' });
    await account('asset-later', { connectionId: fine.id, asset: later });
    const post = await t.db.client.post.create({ data: { workspaceId: ws } });
    await t.db.client.postTarget.create({
      data: {
        workspaceId: ws,
        postId: post.id,
        socialAccountId: broken.id,
        status: 'scheduled',
        scheduledAt: soon,
      },
    });
  });

  const list = async (query: string) => {
    const res = await admin.get(`/api/admin/accounts/expiring?network=tumblr&${query}`);
    return AdminAccountPage.parse(res.body).items;
  };
  const sorted = (items: { id: string }[]) => items.map((a) => names[a.id]).sort();

  it('broken, or expiring within the window by the token each one posts with', async () => {
    expect(sorted(await list(''))).toEqual(['asset-soon', 'broken', 'login-soon']);
    expect(sorted(await list('state=reauth_required'))).toEqual(['broken']);
    expect(sorted(await list('state=expiring'))).toEqual(['asset-soon', 'login-soon']);
    expect(sorted(await list('state=expiring&withinDays=30'))).toEqual([
      'asset-later',
      'asset-soon',
      'login-soon',
    ]);
  });

  it('says what each puts at risk, and when its token expires', async () => {
    const items = await list('');
    const broken = items.find((a) => names[a.id] === 'broken');
    expect(broken).toMatchObject({ statusReason: 'Session expired', scheduledTargets: 1 });
    const loginSoon = items.find((a) => names[a.id] === 'login-soon');
    expect(loginSoon?.tokenExpiresAt).toBe(soon.toISOString());
    expect(JSON.stringify(items)).not.toMatch(/Enc|accessToken/);
  });
});
