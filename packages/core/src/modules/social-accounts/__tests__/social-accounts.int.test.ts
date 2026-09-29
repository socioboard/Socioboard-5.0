// Connecting social accounts over HTTP against Postgres and Valkey, with fake network logins
// (testing/fake-networks.ts) in front of the real Meta network adapters.
import {
  ConnectableAsset,
  ErrorEnvelope,
  Network,
  SocialAccount,
  SocialAccountDetails,
  SocialConnection,
} from '@socioboard/contracts';
import { ProviderError } from '@socioboard/providers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createTestApp, fakePage, type FakePerson } from '../../../testing';

const t = createTestApp();
const { facebook, instagram } = t.networks;
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let viewer: Browser;
let outsider: Browser;
let ws = '';
let slug = '';
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

function person(id: string, name: string, pages: ReturnType<typeof fakePage>[]): FakePerson {
  return {
    identity: { externalUserId: id, displayName: name, avatarUrl: null },
    scopes: [
      'pages_show_list',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
    ],
    assets: pages,
  };
}

/** Starts connecting as `who`, then plays the network sending the browser back. */
async function connect(
  who: Browser,
  providerCode: string,
  opts: { provider?: 'facebook' | 'instagram'; body?: object; query?: Record<string, string> } = {},
) {
  const provider = opts.provider ?? 'facebook';
  const started = await who.post(`${base()}/accounts/connect/${provider}`, opts.body ?? {});
  expect(started.status).toBe(200);
  const authUrl = new URL((started.body as { authUrl: string }).authUrl);
  const state = authUrl.searchParams.get('state') ?? '';
  const q = new URLSearchParams({ state, code: providerCode, ...opts.query });
  const back = await who.get(`/api/oauth/${provider}/callback?${q.toString()}`);
  expect(back.status).toBe(303);
  return { state, authUrl, location: new URL(back.headers.location ?? '') };
}

beforeAll(async () => {
  owner = await t.signUp('sa-owner');
  viewer = await t.signUp('sa-viewer');
  outsider = await t.signUp('sa-outsider');
  const created = await owner.post('/api/v1/workspaces', {
    name: t.workspaceName('Social'),
    timezone: 'UTC',
  });
  ({ id: ws, slug } = created.body as { id: string; slug: string });
  const inv = await owner.post(`${base()}/invitations`, {
    email: t.email('sa-viewer'),
    role: 'viewer',
  });
  await viewer.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
});

beforeEach(() => {
  facebook.people.clear();
  instagram.people.clear();
  facebook.people.set(
    'priya',
    person('fb-priya', 'Priya Rao', [
      fakePage('101', 'Halden Coffee'),
      {
        ...fakePage('ig-1', 'halden.coffee'),
        network: 'instagram',
        token: { accessToken: 'page-token-101', expiresAt: null },
        meta: { via: 'facebook', pageId: '101' },
      },
      fakePage('102', 'Halden Roastery', { unavailableReason: 'missing_permission' }),
    ]),
  );
  facebook.people.set('brand', person('fb-brand', 'Brand Admin', [fakePage('201', 'Brand Page')]));
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } });
  await t.cleanup();
});

describe('networks', () => {
  it('lists enabled networks with their rules and the logins that reach them', async () => {
    const res = await viewer.get('/api/v1/networks');
    expect(res.status).toBe(200);
    const { items } = z.object({ items: z.array(Network) }).parse(res.body);
    expect(items.map((n) => n.id)).toEqual(['facebook_page', 'instagram']);
    expect(items[1]?.logins).toEqual([
      { provider: 'facebook', supportsAccountSelection: false },
      { provider: 'instagram', supportsAccountSelection: true },
    ]);
    expect(items[1]?.rules.maxChars).toBe(2200);
  });

  it('needs sign-in', async () => {
    expect((await t.browser().get('/api/v1/networks')).status).toBe(401);
  });
});

describe('starting a connection', () => {
  it('only roles that may connect accounts can start', async () => {
    const res = await viewer.post(`${base()}/accounts/connect/facebook`, {});
    expect(res.status).toBe(403);
  });

  it('refuses logins this server has no keys for, and unknown ones', async () => {
    const linkedin = await owner.post(`${base()}/accounts/connect/linkedin`, {});
    expect([linkedin.status, code(linkedin)]).toEqual([404, 'NETWORK_NOT_ENABLED']);
    expect((await owner.post(`${base()}/accounts/connect/myspace`, {})).status).toBe(400);
  });

  it('returns the network sign-in URL with a one-time state and our callback', async () => {
    const res = await owner.post(`${base()}/accounts/connect/facebook`, {});
    const url = new URL((res.body as { authUrl: string }).authUrl);
    expect(url.searchParams.get('redirect_uri')).toBe(
      `${t.config.appUrl}/api/oauth/facebook/callback`,
    );
    const state = url.searchParams.get('state') ?? '';
    expect(state.length).toBeGreaterThanOrEqual(40);
    const row = await t.db.client.oAuthState.findUnique({ where: { state } });
    expect(row).toMatchObject({ workspaceId: ws, userId: owner.userId, provider: 'facebook' });
    expect((row?.expiresAt.getTime() ?? 0) - Date.now()).toBeGreaterThan(9 * 60_000);
  });

  it('asks for the account picker only where the network has one', async () => {
    await owner.post(`${base()}/accounts/connect/facebook`, { forceAccountSelection: true });
    expect(facebook.lastAuthUrl?.searchParams.has('force')).toBe(false);
    await owner.post(`${base()}/accounts/connect/instagram`, { forceAccountSelection: true });
    expect(instagram.lastAuthUrl?.searchParams.get('force')).toBe('true');
  });
});

describe('the OAuth callback', () => {
  it('saves the login with encrypted tokens and sends the browser to the asset picker', async () => {
    const { location } = await connect(owner, 'priya');
    expect(location.pathname).toBe(`/w/${slug}/accounts/connect/facebook`);
    expect(location.searchParams.get('result')).toBe('connected');
    const id = location.searchParams.get('connection') ?? '';
    const row = await t.db.client.socialConnection.findUniqueOrThrow({ where: { id } });
    expect(row).toMatchObject({
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: 'fb-priya',
      displayName: 'Priya Rao',
      connectedById: owner.userId,
      status: 'active',
    });
    expect(row.accessTokenEnc).toMatch(/^v1\./);
    expect(row.accessTokenEnc).not.toContain('token-priya');
    expect(t.platform.crypto.decrypt(row.accessTokenEnc)).toBe('token-priya');
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'connection.added', entityId: id },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('a state works once: a replayed callback is refused', async () => {
    const { state } = await connect(owner, 'priya');
    const again = await owner.get(`/api/oauth/facebook/callback?state=${state}&code=priya`);
    expect(new URL(again.headers.location ?? '').searchParams.get('connectError')).toBe(
      'OAUTH_STATE_INVALID',
    );
  });

  it('only the browser that started can finish', async () => {
    facebook.people.set('mallory', person('fb-mallory', 'Mallory', []));
    const res = await owner.post(`${base()}/accounts/connect/facebook`, {});
    const state = new URL((res.body as { authUrl: string }).authUrl).searchParams.get('state');
    // Another signed-in person (or no session at all) replays the callback.
    for (const who of [outsider, t.browser()]) {
      const back = await who.get(`/api/oauth/facebook/callback?state=${state ?? ''}&code=mallory`);
      const location = new URL(back.headers.location ?? '');
      expect(location.searchParams.get('error') ?? location.searchParams.get('connectError')).toBe(
        'OAUTH_STATE_INVALID',
      );
    }
    expect(
      await t.db.client.socialConnection.count({ where: { externalUserId: 'fb-mallory' } }),
    ).toBe(0);
  });

  it('a member who lost the right to connect can’t finish', async () => {
    facebook.people.set('mallory', person('fb-mallory', 'Mallory', []));
    const res = await owner.post(`${base()}/accounts/connect/facebook`, {});
    const state =
      new URL((res.body as { authUrl: string }).authUrl).searchParams.get('state') ?? '';
    // Pretend the viewer started it: viewers can't connect accounts.
    await t.db.client.oAuthState.update({ where: { state }, data: { userId: viewer.userId } });
    const back = await viewer.get(`/api/oauth/facebook/callback?state=${state}&code=mallory`);
    expect(new URL(back.headers.location ?? '').searchParams.get('error')).toBe(
      'OAUTH_STATE_INVALID',
    );
    expect(
      await t.db.client.socialConnection.count({ where: { externalUserId: 'fb-mallory' } }),
    ).toBe(0);
  });

  it('an expired state is refused', async () => {
    const res = await owner.post(`${base()}/accounts/connect/facebook`, {});
    const state =
      new URL((res.body as { authUrl: string }).authUrl).searchParams.get('state') ?? '';
    await t.db.client.oAuthState.update({
      where: { state },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const back = await owner.get(`/api/oauth/facebook/callback?state=${state}&code=priya`);
    expect(new URL(back.headers.location ?? '').searchParams.get('error')).toBe(
      'OAUTH_STATE_INVALID',
    );
  });

  it('turns cancelled consent, missing permissions and network failures into readable errors', async () => {
    const denied = await connect(owner, 'priya', { query: { error: 'access_denied' } });
    expect(denied.location.searchParams.get('error')).toBe('ACCESS_DENIED');

    facebook.people.set('stingy', { ...person('fb-stingy', 'Stingy', []), scopes: ['email'] });
    const stingy = await connect(owner, 'stingy');
    expect(stingy.location.searchParams.get('error')).toBe('MISSING_PERMISSIONS');

    facebook.failNext.exchange = new ProviderError({ kind: 'retryable', message: 'Meta is down' });
    const down = await connect(owner, 'priya');
    expect(down.location.searchParams.get('error')).toBe('NETWORK_ERROR');
  });

  it('the same login again says so; a different login is a second connection', async () => {
    const first = await connect(owner, 'brand');
    const again = await connect(owner, 'brand');
    expect(again.location.searchParams.get('result')).toBe('already_connected');
    expect(again.location.searchParams.get('connection')).toBe(
      first.location.searchParams.get('connection'),
    );
    const logins = await owner.get(`${base()}/connections?provider=facebook`);
    const names = z
      .object({ items: z.array(SocialConnection) })
      .parse(logins.body)
      .items.map((c) => c.displayName);
    expect(names).toEqual(expect.arrayContaining(['Priya Rao', 'Brand Admin']));
  });

  it('an unexpected failure still lands the browser in the app, not on a JSON error', async () => {
    // A malformed token answer (no scopes list) breaks the permission check itself.
    facebook.people.set('broken', {
      ...person('fb-broken', 'Broken', []),
      scopes: undefined as unknown as string[],
    });
    const { location } = await connect(owner, 'broken');
    expect(location.toString()).toBe(`${t.config.appUrl}/?connectError=NETWORK_ERROR`);
  });

  it('an unknown state sends the browser home with an error', async () => {
    const res = await owner.get('/api/oauth/facebook/callback?state=nope&code=x');
    expect(res.headers.location).toBe(`${t.config.appUrl}/?connectError=OAUTH_STATE_INVALID`);
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('picking and managing accounts', () => {
  let connectionId = '';
  const assetsOf = async (id: string) => {
    const res = await owner.get(`${base()}/connections/${id}/assets`);
    expect(res.status).toBe(200);
    return z.object({ items: z.array(ConnectableAsset) }).parse(res.body).items;
  };

  beforeAll(async () => {
    facebook.people.set('priya', person('fb-priya', 'Priya Rao', []));
    const { location } = await connect(owner, 'priya');
    connectionId = location.searchParams.get('connection') ?? '';
  });

  it('lists what the login can post to, including linked Instagram accounts', async () => {
    const items = await assetsOf(connectionId);
    expect(items.map((i) => [i.network, i.externalId, i.unavailableReason, i.account])).toEqual([
      ['facebook_page', '101', null, null],
      ['instagram', 'ig-1', null, null],
      ['facebook_page', '102', 'missing_permission', null],
    ]);
  });

  it('adds chosen assets as accounts, storing Page tokens encrypted', async () => {
    const res = await owner.post(`${base()}/connections/${connectionId}/assets`, {
      externalIds: ['101', 'ig-1'],
    });
    expect(res.status).toBe(201);
    const { items } = z.object({ items: z.array(SocialAccount) }).parse(res.body);
    expect(items.map((a) => [a.network, a.displayName, a.connection?.displayName])).toEqual([
      ['facebook_page', 'Halden Coffee', 'Priya Rao'],
      ['instagram', 'halden.coffee', 'Priya Rao'],
    ]);
    expect(JSON.stringify(res.body)).not.toContain('page-token');
    const row = await t.db.client.socialAccount.findFirstOrThrow({
      where: { workspaceId: ws, externalId: '101' },
    });
    expect(t.platform.crypto.decrypt(row.assetTokenEnc ?? '')).toBe('page-token-101');
    // The picker now marks them.
    expect((await assetsOf(connectionId))[0]?.account).toMatchObject({ status: 'active' });
  });

  it('refuses assets the login can’t post to, or doesn’t have', async () => {
    for (const externalIds of [['102'], ['999']]) {
      const res = await owner.post(`${base()}/connections/${connectionId}/assets`, { externalIds });
      expect([res.status, code(res)]).toEqual([422, 'ASSET_NOT_AVAILABLE']);
    }
  });

  it('a Page reachable by two logins is stored once; adding it through the other moves it', async () => {
    facebook.people.set(
      'brand',
      person('fb-brand', 'Brand Admin', [fakePage('101', 'Halden Coffee')]),
    );
    const brand = (await connect(owner, 'brand')).location.searchParams.get('connection') ?? '';
    const [page] = await assetsOf(brand);
    expect(page?.connectedVia).toEqual({ connectionId, displayName: 'Priya Rao' });
    await owner.post(`${base()}/connections/${brand}/assets`, { externalIds: ['101'] });
    const rows = await t.db.client.socialAccount.findMany({
      where: { workspaceId: ws, externalId: '101' },
    });
    expect(rows.map((r) => r.connectionId)).toEqual([brand]);
    // Back to Priya for the rest of the tests.
    await owner.post(`${base()}/connections/${connectionId}/assets`, { externalIds: ['101'] });
  });

  it('members who can read posts see the accounts; only managers see logins', async () => {
    const accounts = await viewer.get(`${base()}/accounts?network=facebook_page`);
    expect(accounts.status).toBe(200);
    expect(
      z
        .object({ items: z.array(SocialAccount) })
        .parse(accounts.body)
        .items.map((a) => a.network),
    ).not.toContain('instagram');
    expect((await viewer.get(`${base()}/connections`)).status).toBe(403);
    expect(
      (await viewer.post(`${base()}/connections/${connectionId}/assets`, { externalIds: ['101'] }))
        .status,
    ).toBe(403);
  });

  it('disconnecting cancels pending deliveries of scheduled posts, not drafts', async () => {
    const account = await t.db.client.socialAccount.findFirstOrThrow({
      where: { workspaceId: ws, externalId: '101' },
    });
    const makePost = async (status: 'draft' | 'scheduled') => {
      const post = await t.db.client.post.create({ data: { workspaceId: ws, status } });
      return t.db.client.postTarget.create({
        data: {
          workspaceId: ws,
          postId: post.id,
          socialAccountId: account.id,
          status: status === 'draft' ? 'pending' : 'scheduled',
        },
      });
    };
    const scheduled = await makePost('scheduled');
    const draft = await makePost('draft');

    const details = await owner.get(`${base()}/accounts/${account.id}`);
    expect(SocialAccountDetails.parse(details.body).pendingPostCount).toBe(1);

    expect((await owner.send('DELETE', `${base()}/accounts/${account.id}`)).status).toBe(204);
    const after = await t.db.client.postTarget.findMany({
      where: { id: { in: [scheduled.id, draft.id] } },
    });
    expect(after.find((x) => x.id === scheduled.id)?.status).toBe('cancelled');
    expect(after.find((x) => x.id === draft.id)?.status).toBe('pending');
    const list = await owner.get(`${base()}/accounts`);
    expect(JSON.stringify(list.body)).not.toContain(account.id);
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'account.disconnected', entityId: account.id },
    });
    expect(audit?.diff).toMatchObject({ cancelledTargets: 1 });

    // Adding it again brings the same account back.
    await owner.post(`${base()}/connections/${connectionId}/assets`, { externalIds: ['101'] });
    const back = await t.db.client.socialAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(back.status).toBe('active');
  });

  it('a login the network refuses is marked for reconnecting, with its accounts', async () => {
    facebook.failNext.listAssets = new ProviderError({ kind: 'auth', message: 'Session expired' });
    const res = await owner.get(`${base()}/connections/${connectionId}/assets`);
    expect([res.status, code(res)]).toEqual([409, 'CONNECTION_REAUTH_REQUIRED']);
    const accounts = await t.db.client.socialAccount.findMany({ where: { connectionId } });
    expect(new Set(accounts.map((a) => a.status))).toEqual(new Set(['reauth_required']));

    const other = await owner.get(`${base()}/connections/${connectionId}/assets`);
    expect(other.status).toBe(200);
    facebook.failNext.listAssets = new ProviderError({ kind: 'retryable', message: 'Down' });
    const down = await owner.get(`${base()}/connections/${connectionId}/assets`);
    expect([down.status, code(down)]).toEqual([502, 'NETWORK_ERROR']);
  });

  it('reconnecting must sign in as the same person, and revives the accounts', async () => {
    const started = await owner.post(`${base()}/connections/${connectionId}/reconnect`);
    const state = new URL((started.body as { authUrl: string }).authUrl).searchParams.get('state');
    const wrong = await owner.get(`/api/oauth/facebook/callback?state=${state ?? ''}&code=brand`);
    expect(new URL(wrong.headers.location ?? '').searchParams.get('error')).toBe(
      'RECONNECT_WRONG_ACCOUNT',
    );

    facebook.people.set(
      'priya',
      person('fb-priya', 'Priya Rao', [
        fakePage('101', 'Halden Coffee', {
          token: { accessToken: 'page-token-101-new', expiresAt: null },
        }),
      ]),
    );
    const again = await owner.post(`${base()}/connections/${connectionId}/reconnect`);
    const state2 = new URL((again.body as { authUrl: string }).authUrl).searchParams.get('state');
    const ok = await owner.get(`/api/oauth/facebook/callback?state=${state2 ?? ''}&code=priya`);
    expect(new URL(ok.headers.location ?? '').searchParams.get('result')).toBe('reconnected');
    const page = await t.db.client.socialAccount.findFirstOrThrow({
      where: { workspaceId: ws, externalId: '101' },
    });
    expect(page.status).toBe('active');
    expect(t.platform.crypto.decrypt(page.assetTokenEnc ?? '')).toBe('page-token-101-new');
  });

  it('removing a login disconnects its accounts but keeps them for history', async () => {
    const accounts = await t.db.client.socialAccount.findMany({ where: { connectionId } });
    expect((await owner.send('DELETE', `${base()}/connections/${connectionId}`)).status).toBe(204);
    expect(await t.db.client.socialConnection.count({ where: { id: connectionId } })).toBe(0);
    const after = await t.db.client.socialAccount.findMany({
      where: { id: { in: accounts.map((a) => a.id) } },
    });
    expect(after.map((a) => [a.status, a.connectionId, a.assetTokenEnc])).toEqual(
      accounts.map(() => ['disconnected', null, null]),
    );
    const details = await owner.get(`${base()}/accounts/${accounts[0]?.id ?? ''}`);
    expect(SocialAccountDetails.parse(details.body).connection).toBeNull();
  });
});
