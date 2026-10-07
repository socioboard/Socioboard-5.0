// The `token-refresh` and `account-health` jobs (P2-B7) against Postgres, with fake network logins
// (testing/fake-networks.ts): logins and accounts are written straight to the database, so each
// test sets exactly the tokens, expiries and check times it needs.
import type { Prisma } from '@socioboard/db';
import { ProviderError, type ProviderAsset } from '@socioboard/providers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp, fakePage, type FakePerson } from '../../../testing';
import type { SocialAccountEvents } from '../events';

const t = createTestApp();
const { facebook, instagram } = t.networks;
const accounts = createPublishingServices(t.platform, {
  registry: t.networks.registry,
}).socialAccounts;
const crypto = t.platform.crypto;
const DAY = 86_400_000;
const fromNow = (ms: number) => new Date(Date.now() + ms);

let ws = '';
const refresh = () => accounts.refreshExpiringTokens({ workspaceId: ws });
const health = () => accounts.checkHealth({ workspaceId: ws });

const reauthEvents: SocialAccountEvents['account.reauth_required'][] = [];
t.platform.events.on('account.reauth_required', (p) => {
  reauthEvents.push(p as SocialAccountEvents['account.reauth_required']);
});

const igAsset = (id: string, extra: Partial<ProviderAsset> = {}): ProviderAsset => ({
  ...fakePage(id, `ig ${id}`),
  network: 'instagram',
  token: null,
  meta: { via: 'instagram' },
  ...extra,
});

function person(id: string, assets: ProviderAsset[]): FakePerson {
  return {
    identity: { externalUserId: id, displayName: id, avatarUrl: null },
    scopes: ['pages_show_list', 'pages_manage_posts', 'instagram_business_content_publish'],
    assets,
  };
}

/** A login as stored after signing in as `code`, with accounts for the given assets. */
async function login(
  provider: 'facebook' | 'instagram',
  code: string,
  opts: { expiresAt?: Date | null; lastCheckedAt?: Date | null; assets?: ProviderAsset[] } = {},
) {
  const c = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider,
      externalUserId: `${provider}-${code}`,
      displayName: code === 'priya' ? 'Priya' : code,
      accessTokenEnc: crypto.encrypt(`token-${code}`),
      tokenExpiresAt: opts.expiresAt ?? null,
      scopes: ['pages_show_list'],
      lastCheckedAt: opts.lastCheckedAt === undefined ? new Date() : opts.lastCheckedAt,
    },
  });
  const rows = [];
  for (const a of opts.assets ?? []) {
    rows.push(
      await t.db.client.socialAccount.create({
        data: {
          workspaceId: ws,
          connectionId: c.id,
          network: a.network,
          externalId: a.externalId,
          displayName: a.displayName,
          assetTokenEnc: a.token ? crypto.encrypt(a.token.accessToken) : null,
          assetTokenExpiresAt: a.token?.expiresAt ?? null,
          meta: a.meta as Prisma.InputJsonValue,
        },
      }),
    );
  }
  return { id: c.id, accounts: rows };
}

const connection = (id: string) =>
  t.db.client.socialConnection.findUniqueOrThrow({ where: { id } });
const account = (id: string) => t.db.client.socialAccount.findUniqueOrThrow({ where: { id } });

beforeAll(async () => {
  const owner = await t.signUp('jobs-owner');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Jobs'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
});

beforeEach(async () => {
  facebook.people.clear();
  instagram.people.clear();
  instagram.refreshed.length = 0;
  reauthEvents.length = 0;
  // Each test sees only its own logins.
  await t.db.client.socialAccount.deleteMany({ where: { workspaceId: ws } });
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } });
});

afterAll(async () => {
  await t.db.client.socialAccount.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

describe('token-refresh', () => {
  it('renews an Instagram sign-in within 72 hours of expiring, and only that one', async () => {
    instagram.people.set('ana', person('ana', [igAsset('ig-ana')]));
    instagram.people.set('ben', person('ben', [igAsset('ig-ben')]));
    const soon = await login('instagram', 'ana', { expiresAt: fromNow(2 * DAY) });
    const later = await login('instagram', 'ben', { expiresAt: fromNow(10 * DAY) });

    expect(await refresh()).toMatchObject({ refreshed: 1, reauth: 0, failed: 0 });
    const renewed = await connection(soon.id);
    expect(crypto.decrypt(renewed.accessTokenEnc)).toBe('token-ana~1');
    expect(renewed.tokenExpiresAt?.getTime()).toBeGreaterThan(Date.now() + 59 * DAY);
    expect(renewed.status).toBe('active');
    expect(instagram.refreshed.map((x) => x.accessToken)).toEqual(['token-ana']);
    expect(crypto.decrypt((await connection(later.id)).accessTokenEnc)).toBe('token-ben');
    // Renewed: nothing more to do next hour.
    expect(await refresh()).toMatchObject({ refreshed: 0 });
  });

  it('a renewal the network refuses needs reconnecting, announced once per account', async () => {
    instagram.people.set('ana', person('ana', [igAsset('ig-ana')]));
    const c = await login('instagram', 'ana', {
      expiresAt: fromNow(DAY),
      assets: [igAsset('ig-ana')],
    });
    instagram.failNext.refresh = new ProviderError({ kind: 'auth', message: 'Token revoked' });
    expect(await refresh()).toMatchObject({ refreshed: 0, reauth: 1 });
    expect(await connection(c.id)).toMatchObject({
      status: 'reauth_required',
      statusReason: 'Instagram didn’t renew the sign-in: Token revoked',
    });
    expect((await account(c.accounts[0]?.id ?? '')).status).toBe('reauth_required');
    expect(reauthEvents.map((e) => e.accountId)).toEqual([c.accounts[0]?.id]);
    // A login needing reconnecting isn't tried again.
    expect(await refresh()).toMatchObject({ refreshed: 0, reauth: 0 });
    expect(reauthEvents).toHaveLength(1);
  });

  it('a network that doesn’t answer: tried next hour, unless the sign-in already expired', async () => {
    instagram.people.set('ana', person('ana', []));
    instagram.people.set('ben', person('ben', []));
    const live = await login('instagram', 'ana', { expiresAt: fromNow(DAY) });
    instagram.failNext.refresh = new ProviderError({ kind: 'retryable', message: 'Timeout' });
    expect(await refresh()).toMatchObject({ failed: 1, reauth: 0 });
    expect((await connection(live.id)).status).toBe('active');

    await t.db.client.socialConnection.delete({ where: { id: live.id } });
    const gone = await login('instagram', 'ben', { expiresAt: fromNow(-DAY) });
    instagram.failNext.refresh = new ProviderError({ kind: 'retryable', message: 'Timeout' });
    expect(await refresh()).toMatchObject({ reauth: 1 });
    expect((await connection(gone.id)).status).toBe('reauth_required');
  });

  it('a Facebook sign-in can’t be renewed: once expired, only what posts with it stops', async () => {
    const page = fakePage('101', 'Halden Coffee');
    const tokenless = fakePage('102', 'No token', { token: null });
    const c = await login('facebook', 'priya', {
      expiresAt: fromNow(-60_000),
      assets: [page, tokenless],
    });
    expect(await refresh()).toMatchObject({ refreshed: 0, reauth: 1 });
    expect(await connection(c.id)).toMatchObject({
      status: 'reauth_required',
      statusReason: 'The Facebook sign-in expired',
    });
    const [withToken, withoutToken] = c.accounts;
    // The Page's own token doesn't expire with the login's: it keeps posting.
    expect((await account(withToken?.id ?? '')).status).toBe('active');
    expect((await account(withoutToken?.id ?? '')).status).toBe('reauth_required');
    expect(reauthEvents.map((e) => e.accountId)).toEqual([withoutToken?.id]);
  });

  it('a Facebook sign-in about to expire is left alone: nothing can renew it yet', async () => {
    const c = await login('facebook', 'priya', { expiresAt: fromNow(DAY) });
    expect(await refresh()).toEqual({ refreshed: 0, assetsRefreshed: 0, reauth: 0, failed: 0 });
    expect((await connection(c.id)).status).toBe('active');
  });

  it('asset tokens about to expire are fetched again through their login', async () => {
    const expiring = fakePage('101', 'Halden Coffee', {
      token: { accessToken: 'page-token-101', expiresAt: fromNow(DAY) },
    });
    facebook.people.set(
      'priya',
      person('priya', [
        fakePage('101', 'Halden Coffee', {
          token: { accessToken: 'page-token-101-new', expiresAt: fromNow(60 * DAY) },
        }),
      ]),
    );
    const c = await login('facebook', 'priya', { assets: [expiring] });
    expect(await refresh()).toMatchObject({ assetsRefreshed: 1 });
    const row = await account(c.accounts[0]?.id ?? '');
    expect(crypto.decrypt(row.assetTokenEnc ?? '')).toBe('page-token-101-new');
    expect(row.assetTokenExpiresAt?.getTime()).toBeGreaterThan(Date.now() + 59 * DAY);
  });
});

describe('account-health', () => {
  it('brings names and tokens up to date and records the check', async () => {
    facebook.people.set(
      'priya',
      person('priya', [
        fakePage('101', 'Halden Coffee & Co', {
          token: { accessToken: 'page-token-101-v2', expiresAt: null },
        }),
      ]),
    );
    const c = await login('facebook', 'priya', {
      lastCheckedAt: null,
      assets: [fakePage('101', 'Halden Coffee')],
    });
    expect(await health()).toEqual({ checked: 1, reauth: 0, failed: 0 });
    const row = await account(c.accounts[0]?.id ?? '');
    expect(row).toMatchObject({ status: 'active', displayName: 'Halden Coffee & Co' });
    expect(crypto.decrypt(row.assetTokenEnc ?? '')).toBe('page-token-101-v2');
    expect((await connection(c.id)).lastCheckedAt?.getTime()).toBeGreaterThan(Date.now() - 60_000);
    // Checked today: left for tomorrow.
    expect(await health()).toEqual({ checked: 0, reauth: 0, failed: 0 });
  });

  it('accounts the login can no longer post to need reconnecting, with the reason', async () => {
    facebook.people.set(
      'priya',
      person('priya', [
        fakePage('101', 'Still here'),
        fakePage('102', 'Lost access', { unavailableReason: 'missing_permission' }),
        // 103 is no longer listed at all.
      ]),
    );
    const c = await login('facebook', 'priya', {
      lastCheckedAt: fromNow(-2 * DAY),
      assets: [fakePage('101', 'Still here'), fakePage('102', 'x'), fakePage('103', 'Gone')],
    });
    expect(await health()).toMatchObject({ checked: 1 });
    const [kept, noPermission, gone] = await Promise.all(c.accounts.map((a) => account(a.id)));
    expect(kept?.status).toBe('active');
    expect(noPermission).toMatchObject({
      status: 'reauth_required',
      statusReason: 'Priya no longer has permission to post here',
    });
    expect(gone).toMatchObject({
      status: 'reauth_required',
      statusReason: 'Priya can no longer reach this account on Facebook',
    });
    // The login itself still works.
    expect((await connection(c.id)).status).toBe('active');
    expect(reauthEvents.map((e) => e.accountId).sort()).toEqual(
      [noPermission?.id, gone?.id].sort(),
    );
  });

  it('an account that came back is active again', async () => {
    facebook.people.set('priya', person('priya', [fakePage('101', 'Halden Coffee')]));
    const c = await login('facebook', 'priya', {
      lastCheckedAt: null,
      assets: [fakePage('101', 'Halden Coffee')],
    });
    const id = c.accounts[0]?.id ?? '';
    await t.db.client.socialAccount.update({
      where: { id },
      data: { status: 'reauth_required', statusReason: 'Priya no longer has permission' },
    });
    await health();
    expect(await account(id)).toMatchObject({ status: 'active', statusReason: null });
  });

  it('a login the network refuses needs reconnecting with all its accounts', async () => {
    facebook.people.set('priya', person('priya', [fakePage('101', 'Halden Coffee')]));
    const c = await login('facebook', 'priya', {
      lastCheckedAt: null,
      assets: [fakePage('101', 'Halden Coffee')],
    });
    facebook.failNext.listAssets = new ProviderError({ kind: 'auth', message: 'Session expired' });
    expect(await health()).toEqual({ checked: 0, reauth: 1, failed: 0 });
    expect((await connection(c.id)).statusReason).toBe(
      'Facebook refused the sign-in: Session expired',
    );
    expect((await account(c.accounts[0]?.id ?? '')).status).toBe('reauth_required');
  });

  it('a network that doesn’t answer changes nothing, and is checked again next run', async () => {
    facebook.people.set('priya', person('priya', [fakePage('101', 'Halden Coffee')]));
    const c = await login('facebook', 'priya', {
      lastCheckedAt: null,
      assets: [fakePage('101', 'Halden Coffee')],
    });
    facebook.failNext.listAssets = new ProviderError({ kind: 'retryable', message: 'Timeout' });
    expect(await health()).toEqual({ checked: 0, reauth: 0, failed: 1 });
    expect(await connection(c.id)).toMatchObject({ status: 'active', lastCheckedAt: null });
    expect((await account(c.accounts[0]?.id ?? '')).status).toBe('active');
    expect(await health()).toEqual({ checked: 1, reauth: 0, failed: 0 });
  });

  it('skips logins already needing reconnecting, and deleted workspaces', async () => {
    facebook.people.set('priya', person('priya', []));
    const c = await login('facebook', 'priya', { lastCheckedAt: null });
    await t.db.client.socialConnection.update({
      where: { id: c.id },
      data: { status: 'reauth_required' },
    });
    expect(await health()).toEqual({ checked: 0, reauth: 0, failed: 0 });
    await t.db.client.socialConnection.update({ where: { id: c.id }, data: { status: 'active' } });
    await t.db.client.workspace.update({ where: { id: ws }, data: { deletedAt: new Date() } });
    try {
      expect(await health()).toEqual({ checked: 0, reauth: 0, failed: 0 });
      expect(await refresh()).toEqual({ refreshed: 0, assetsRefreshed: 0, reauth: 0, failed: 0 });
    } finally {
      await t.db.client.workspace.update({ where: { id: ws }, data: { deletedAt: null } });
    }
  });
});

describe('renewing before publishing (getCredentials)', () => {
  const MIN = 60_000;
  const igLogin = async (code: string, expiresAt: Date) => {
    instagram.people.set(code, person(code, [igAsset(`ig-${code}`)]));
    const c = await login('instagram', code, { expiresAt, assets: [igAsset(`ig-${code}`)] });
    return { connectionId: c.id, accountId: c.accounts[0]?.id ?? '' };
  };

  it('a login token running out within 10 minutes is renewed first; a later one is left', async () => {
    const soon = await igLogin('cara', fromNow(5 * MIN));
    const { credentials } = await accounts.getCredentials(ws, soon.accountId);
    expect(credentials.accessToken).toBe('token-cara~1');
    expect((await connection(soon.connectionId)).tokenExpiresAt?.getTime()).toBeGreaterThan(
      Date.now() + 59 * DAY,
    );

    const later = await igLogin('dev', fromNow(2 * 60 * MIN));
    expect((await accounts.getCredentials(ws, later.accountId)).credentials.accessToken).toBe(
      'token-dev',
    );
    expect(instagram.refreshed.map((x) => x.accessToken)).toEqual(['token-cara']);
  });

  it('two publishes at once renew it once: the second waits and uses the new token', async () => {
    const both = await igLogin('eli', fromNow(2 * MIN));
    // The network takes a moment, as a real one does, so the two renewals overlap.
    instagram.delays.refreshMs = 300;
    const [a, b] = await Promise.all([
      accounts.getCredentials(ws, both.accountId),
      accounts.getCredentials(ws, both.accountId),
    ]);
    // X accepts each refresh token once: a second renewal would have used a spent one.
    instagram.delays.refreshMs = 0;
    expect(instagram.refreshed.map((x) => x.accessToken)).toEqual(['token-eli']);
    expect([a.credentials.accessToken, b.credentials.accessToken]).toEqual([
      'token-eli~1',
      'token-eli~1',
    ]);
  });

  it('a renewal the network refuses: the account needs reconnecting and the publish fails as auth', async () => {
    const refused = await igLogin('fay', fromNow(MIN));
    instagram.failNext.refresh = new ProviderError({ kind: 'auth', message: 'Token revoked' });
    const err = await accounts.getCredentials(ws, refused.accountId).catch((e: unknown) => e);
    expect(err instanceof ProviderError && err.kind).toBe('auth');
    expect((await account(refused.accountId)).status).toBe('reauth_required');
  });

  it("a network that doesn't answer: a token still valid is used; an expired one waits", async () => {
    const valid = await igLogin('gus', fromNow(3 * MIN));
    instagram.failNext.refresh = new ProviderError({ kind: 'retryable', message: 'Timeout' });
    expect((await accounts.getCredentials(ws, valid.accountId)).credentials.accessToken).toBe(
      'token-gus',
    );

    const expired = await igLogin('hal', fromNow(-MIN));
    instagram.failNext.refresh = new ProviderError({ kind: 'retryable', message: 'Timeout' });
    const err = await accounts.getCredentials(ws, expired.accountId).catch((e: unknown) => e);
    expect(err instanceof ProviderError && err.kind).toBe('retryable');
    expect((await account(expired.accountId)).status).toBe('active');
  });
});
