// P3-B4: Pinterest specifics the contract doesn't cover. Errors: what each Pinterest answer makes
// the publishing worker do. Sign-in: no PKCE, the app's id and secret as HTTP Basic, scopes
// however Pinterest writes them, refresh tokens replaced on every refresh, the sandbox host.
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../../errors';
import { createHttpClient } from '../../http';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type { TokenSet } from '../../types';
import { pinterestError } from '../errors';
import {
  createPinterestAdapters,
  PINTEREST_API,
  PINTEREST_SANDBOX_API,
  PINTEREST_SCOPES,
} from '../index';

const CALLBACK = 'https://app.test/api/oauth/pinterest/callback';
const tokens: TokenSet = {
  accessToken: 'pina-access',
  refreshToken: 'pinr-refresh',
  expiresAt: null,
  scopes: [...PINTEREST_SCOPES],
};

function login(calls: RecordedCall[], sandbox = false) {
  const replay = replayFetch(calls);
  const [adapter] = createPinterestAdapters({
    pinterest: { clientId: 'client', clientSecret: 'secret' },
    sandbox,
    fetch: replay.fetch,
  }).logins;
  if (!adapter) throw new Error('pinterest login missing');
  return { adapter, replay };
}

/** Plays one recorded answer through the shared HTTP client, as the adapters receive it. */
async function answer(call: RecordedCall) {
  const http = createHttpClient({ name: 'Pinterest', fetch: replayFetch([call]).fetch });
  return http.request({ method: call.method, url: call.url });
}

const one = (name: string): RecordedCall => {
  const [call] = fixture('pinterest', name);
  if (!call) throw new Error(`empty fixture ${name}`);
  return call;
};

describe('errors', () => {
  it('a refused token means signing in again', async () => {
    const err = pinterestError(await answer(one('error-invalid-token')), 'reading the account');
    expect(err).toMatchObject({
      kind: 'auth',
      status: 401,
      networkCode: '2',
      message: 'Pinterest: Authentication failed.',
    });
  });

  it('a rate limit waits what Retry-After says, else leaves the wait to the worker', async () => {
    const plain = pinterestError(await answer(one('error-rate-limit')), 'posting');
    expect(plain).toMatchObject({ kind: 'rate_limited', retryAfterSec: null });
    const told = pinterestError(
      await answer({ ...one('error-rate-limit'), headers: { 'retry-after': '60' } }),
      'posting',
    );
    expect(told.retryAfterSec).toBe(60);
  });

  it('a server error is tried again; other refusals fail with Pinterest’s words', async () => {
    expect(pinterestError(await answer(one('error-server')), 'posting').kind).toBe('retryable');
    const gone = pinterestError(
      await answer({
        method: 'POST',
        url: `${PINTEREST_API}/pins`,
        status: 404,
        response: { code: 404, message: 'Board not found.' },
      }),
      'posting',
    );
    expect(gone).toMatchObject({ kind: 'content', message: 'Pinterest: Board not found.' });
  });

  it('an answer without a message still says what failed', async () => {
    const err = pinterestError(
      await answer({ method: 'POST', url: `${PINTEREST_API}/pins`, status: 502, response: '' }),
      'posting',
    );
    expect(err).toMatchObject({
      kind: 'retryable',
      message: 'Pinterest posting failed (HTTP 502)',
      networkCode: null,
    });
  });
});

describe('sign-in', () => {
  it('asks for exactly the scopes publishing needs, without PKCE or an account picker', () => {
    const { adapter } = login([]);
    const url = new URL(adapter.getAuthUrl({ state: 'st', redirectUri: CALLBACK }));
    expect(`${url.origin}${url.pathname}`).toBe('https://www.pinterest.com/oauth/');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'client',
      redirect_uri: CALLBACK,
      state: 'st',
      scope: 'user_accounts:read,boards:read,boards:write,pins:read,pins:write',
    });
    expect(adapter).toMatchObject({ usesPkce: false, supportsAccountSelection: false });
  });

  it('exchanges the code with HTTP Basic and reads comma-separated scopes', async () => {
    const { adapter, replay } = login(fixture('pinterest', 'token-exchange'));
    const before = Date.now();
    const set = await adapter.exchangeCode({ code: 'pin-code', redirectUri: CALLBACK });
    expect(replay.mismatches).toEqual([]);
    expect(set).toMatchObject({
      accessToken: 'pina-access',
      refreshToken: 'pinr-refresh',
      scopes: [...PINTEREST_SCOPES],
    });
    // 30 days.
    expect(set.expiresAt?.getTime()).toBeGreaterThanOrEqual(before + 2_592_000_000);
    // The secret goes only in the header, never in the form.
    expect(replay.seen[0]?.body).not.toHaveProperty('client_secret');
  });

  it('a code Pinterest refuses means signing in again', async () => {
    const { adapter } = login([{ ...one('error-invalid-grant'), body: { code: 'old' } }]);
    const err = await adapter
      .exchangeCode({ code: 'old', redirectUri: CALLBACK })
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');
  });

  it('refreshing returns the new refresh token, which replaces the old one', async () => {
    const { adapter, replay } = login(fixture('pinterest', 'token-refresh'));
    const set = await adapter.refresh?.(tokens);
    expect(replay.mismatches).toEqual([]);
    expect(set).toMatchObject({
      accessToken: 'pina-access-2',
      refreshToken: 'pinr-refresh-2',
      scopes: [...PINTEREST_SCOPES],
    });
  });

  it('a refresh without a new refresh token keeps the old one and its scopes', async () => {
    const { adapter } = login([
      {
        method: 'POST',
        url: `${PINTEREST_API}/oauth/token`,
        status: 200,
        response: { access_token: 'pina-access-3', expires_in: 2592000, token_type: 'bearer' },
      },
    ]);
    const set = await adapter.refresh?.(tokens);
    expect(set).toMatchObject({
      accessToken: 'pina-access-3',
      refreshToken: 'pinr-refresh',
      scopes: tokens.scopes,
    });
  });

  it('an expired refresh token, or none at all, means signing in again', async () => {
    const refused = await login(fixture('pinterest', 'error-invalid-grant'))
      .adapter.refresh?.(tokens)
      .catch((e: unknown) => e);
    expect(isProviderError(refused) && refused.kind).toBe('auth');
    const none = await login([])
      .adapter.refresh?.({ ...tokens, refreshToken: null })
      .catch((e: unknown) => e);
    expect(isProviderError(none) && none.kind).toBe('auth');
  });

  it('lists the account itself: business name, username, avatar', async () => {
    const { adapter } = login(fixture('pinterest', 'user-account'));
    expect(await adapter.listAssets(tokens)).toEqual([
      {
        network: 'pinterest',
        externalId: '2783136121146311751',
        displayName: 'Kenya Roast Co.',
        username: 'kenyaroast',
        avatarUrl: 'https://i.pinimg.com/600x600_R/fake/avatar.jpg',
        token: null,
        meta: { accountType: 'BUSINESS' },
        unavailableReason: null,
      },
    ]);
  });

  it('a personal account is named by its username', async () => {
    const [call] = fixture('pinterest', 'user-account');
    if (!call) throw new Error('empty fixture');
    const { adapter } = login([
      {
        ...call,
        response: { id: '99', username: 'priya', account_type: 'PINNER', business_name: null },
      },
    ]);
    expect(await adapter.getIdentity(tokens)).toEqual({
      externalUserId: '99',
      displayName: 'priya',
      avatarUrl: null,
    });
  });

  it('an account whose token can’t create pins is listed as missing a permission', async () => {
    const { adapter } = login(fixture('pinterest', 'user-account'));
    const [asset] = await adapter.listAssets({
      ...tokens,
      scopes: ['user_accounts:read', 'boards:read', 'pins:read'],
    });
    expect(asset?.unavailableReason).toBe('missing_permission');
  });

  it('in the sandbox, tokens and the account come from the sandbox host', async () => {
    const exchange = one('token-exchange');
    const account = one('user-account');
    const { adapter, replay } = login(
      [
        { ...exchange, url: `${PINTEREST_SANDBOX_API}/oauth/token` },
        { ...account, url: `${PINTEREST_SANDBOX_API}/user_account` },
      ],
      true,
    );
    const set = await adapter.exchangeCode({ code: 'pin-code', redirectUri: CALLBACK });
    await adapter.getIdentity(set);
    expect(replay.mismatches).toEqual([]);
    // The consent page itself stays on pinterest.com.
    expect(adapter.getAuthUrl({ state: 's', redirectUri: CALLBACK })).toMatch(
      /^https:\/\/www\.pinterest\.com\/oauth\//,
    );
  });
});
