// P3-B2: X specifics the contract doesn't cover: sign-in with PKCE and rotating refresh tokens,
// X's weighted length, link costs, media rules, photo and chunked video uploads, credits running out.
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../../errors';
import { replayFetch, type RecordedCall } from '../../testing/replay';
import type { ContentMedia, PublishInput, PublishMedia, TokenSet } from '../../types';
import {
  createXAdapters,
  X_LINK_POST_COST_USD,
  X_POST_COST_USD,
  xPostText,
  xTextLength,
} from '../index';

const A = 'https://api.x.com';
const MB = 1024 * 1024;
const tokens: TokenSet = {
  accessToken: 'x-access',
  refreshToken: 'x-refresh',
  expiresAt: null,
  scopes: ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'],
};
const account = { externalId: '1700', accessToken: 'x-access', meta: { username: 'halden' } };

function adapters(calls: RecordedCall[]) {
  const replay = replayFetch(calls);
  const { logins, networks } = createXAdapters({
    x: { clientId: 'client', clientSecret: 'secret' },
    fetch: replay.fetch,
    xOptions: { pollIntervalMs: 0, sleep: () => Promise.resolve() },
  });
  const login = logins[0];
  const network = networks[0];
  if (!login || !network) throw new Error('x adapters missing');
  return { login, network, replay };
}

const post = (over: Partial<PublishInput> = {}): PublishInput => ({
  text: 'Fresh roast today',
  media: [],
  link: null,
  firstComment: null,
  options: {},
  ...over,
});
const file = (kind: ContentMedia['kind'], over: Partial<PublishMedia> = {}): PublishMedia => ({
  id: `${kind}-1`,
  kind,
  mime: kind === 'video' ? 'video/mp4' : kind === 'gif' ? 'image/gif' : 'image/jpeg',
  sizeBytes: 300_000,
  width: 1200,
  height: 800,
  durationSec: kind === 'video' ? 12 : null,
  altText: null,
  readUrl: `https://storage.test/${kind}`,
  publicUrl: null,
  ...over,
});
const codes = (input: PublishInput) =>
  adapters([])
    .network.validate(input)
    .map((i) => `${i.severity}:${i.code}`);

describe('sign-in', () => {
  it('asks for the scopes with PKCE (S256) and our callback', () => {
    const { login } = adapters([]);
    const url = new URL(
      login.getAuthUrl({
        state: 's1',
        redirectUri: 'https://app.test/api/oauth/x/callback',
        pkce: { verifier: 'v', challenge: 'chal' },
      }),
    );
    expect(url.origin + url.pathname).toBe('https://x.com/i/oauth2/authorize');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      response_type: 'code',
      client_id: 'client',
      state: 's1',
      code_challenge: 'chal',
      code_challenge_method: 'S256',
      scope: 'tweet.read tweet.write users.read media.write offline.access',
    });
    expect(() => login.getAuthUrl({ state: 's', redirectUri: 'https://app.test/cb' })).toThrow(
      /PKCE/,
    );
  });

  it('exchanges the code with the verifier, as a confidential client', async () => {
    const { login, replay } = adapters([
      {
        method: 'POST',
        url: `${A}/2/oauth2/token`,
        body: {
          grant_type: 'authorization_code',
          code: 'c1',
          code_verifier: 'v1',
          redirect_uri: 'https://app.test/cb',
          client_id: 'client',
        },
        requestHeaders: {
          authorization: `Basic ${Buffer.from('client:secret').toString('base64')}`,
        },
        status: 200,
        response: {
          token_type: 'bearer',
          expires_in: 7200,
          access_token: 'acc',
          refresh_token: 'ref',
          scope: 'tweet.read tweet.write users.read media.write offline.access',
        },
      },
    ]);
    const got = await login.exchangeCode({
      code: 'c1',
      redirectUri: 'https://app.test/cb',
      pkce: { verifier: 'v1', challenge: 'x' },
    });
    expect(replay.mismatches).toEqual([]);
    expect(got).toMatchObject({ accessToken: 'acc', refreshToken: 'ref' });
    expect(got.scopes).toContain('media.write');
    const minutes = ((got.expiresAt?.getTime() ?? 0) - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(119);
    expect(minutes).toBeLessThanOrEqual(120);
  });

  it('refreshing returns the new refresh token (X rotates them); a refused one means sign in again', async () => {
    const ok = adapters([
      {
        method: 'POST',
        url: `${A}/2/oauth2/token`,
        body: { grant_type: 'refresh_token', refresh_token: 'x-refresh' },
        status: 200,
        response: { access_token: 'acc2', refresh_token: 'ref2', expires_in: 7200 },
      },
    ]);
    const fresh = await ok.login.refresh?.(tokens);
    expect(fresh).toMatchObject({ accessToken: 'acc2', refreshToken: 'ref2' });
    // No scope in the answer: the old ones stay.
    expect(fresh?.scopes).toEqual(tokens.scopes);

    const refused = adapters([
      {
        method: 'POST',
        url: `${A}/2/oauth2/token`,
        status: 400,
        response: {
          error: 'invalid_request',
          error_description: 'Value passed for the token was invalid.',
        },
      },
    ]);
    const err = await refused.login.refresh?.(tokens).catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');
    const none = await adapters([])
      .login.refresh?.({ ...tokens, refreshToken: null })
      .catch((e: unknown) => e);
    expect(isProviderError(none) && none.kind).toBe('auth');
  });

  it('an account signed in without media or posting permission is listed but unavailable', async () => {
    const me = {
      method: 'GET' as const,
      url: `${A}/2/users/me`,
      status: 200,
      response: { data: { id: '1', name: 'N', username: 'n' } },
    };
    const { login } = adapters([me]);
    const [asset] = await login.listAssets({ ...tokens, scopes: ['tweet.read', 'users.read'] });
    expect(asset).toMatchObject({
      network: 'x',
      username: 'n',
      meta: { username: 'n' },
      unavailableReason: 'missing_permission',
      avatarUrl: null,
    });
  });
});

describe('length and rules', () => {
  it('weighs text as X does: links 23, CJK and emoji 2', () => {
    expect(xTextLength('hello')).toBe(5);
    expect(xTextLength('see https://example.com/a/very/long/path?with=query')).toBe(4 + 23);
    expect(xTextLength('日本')).toBe(4);
    expect(xTextLength('☕️ ok')).toBe(2 + 2 + 3);
    // Dashes and quotes weigh 1; X weighs the ellipsis (U+2026) 2.
    expect(xTextLength('é—’…')).toBe(5);
  });

  it('adds the link to the text unless the text already has it', () => {
    expect(xPostText({ text: 'New menu ', link: 'https://h.test/m' })).toBe(
      'New menu\n\nhttps://h.test/m',
    );
    expect(xPostText({ text: 'Menu: https://h.test/m', link: 'https://h.test/m' })).toBe(
      'Menu: https://h.test/m',
    );
    expect(xPostText({ text: '', link: 'https://h.test/m' })).toBe('https://h.test/m');
  });

  it('counts the added link in the limit, and warns that link posts cost more', () => {
    const almost = 'a'.repeat(260);
    expect(codes(post({ text: almost }))).toEqual([]);
    expect(codes(post({ text: almost, link: 'https://h.test/x' }))).toEqual([
      'error:TEXT_TOO_LONG',
      'warning:X_LINK_COST',
    ]);
    expect(codes(post({ text: 'see https://h.test' }))).toEqual(['warning:X_LINK_COST']);
  });

  it('up to 4 photos; a GIF or a video goes alone; something must be posted', () => {
    expect(
      codes(post({ media: [file('image'), file('image'), file('image'), file('image')] })),
    ).toEqual([]);
    expect(codes(post({ media: Array.from({ length: 5 }, () => file('image')) }))).toContain(
      'error:TOO_MANY_MEDIA',
    );
    expect(codes(post({ media: [file('gif'), file('image')] }))).toContain(
      'error:X_GIF_OR_VIDEO_ALONE',
    );
    expect(codes(post({ media: [file('video'), file('video')] }))).toContain(
      'error:X_GIF_OR_VIDEO_ALONE',
    );
    expect(codes(post({ text: '  ' }))).toEqual(['error:EMPTY_POST']);
  });
});

describe('publishing', () => {
  it('a photo: uploaded in one request, attached, and the cost recorded', async () => {
    const { network, replay } = adapters([
      { method: 'GET', url: 'https://storage.test/image', status: 200, responseBytes: 300_000 },
      {
        method: 'POST',
        url: `${A}/2/media/upload`,
        body: { media_category: 'tweet_image', media: 'file:media:300000' },
        requestHeaders: { authorization: 'Bearer x-access' },
        status: 200,
        response: { data: { id: 'm1', media_key: '3_m1' } },
      },
      {
        method: 'POST',
        url: `${A}/2/tweets`,
        body: { text: '"Fresh roast today"', media: '{"media_ids":["m1"]}' },
        status: 201,
        response: { data: { id: '99', text: 'Fresh roast today' } },
      },
    ]);
    const result = await network.publish(post({ media: [file('image')] }), account);
    expect(replay.mismatches).toEqual([]);
    expect(result).toEqual({
      externalId: '99',
      permalink: 'https://x.com/halden/status/99',
      warnings: [],
      costUnits: X_POST_COST_USD,
    });
  });

  it('a video: initialize, chunks of 4 MB, finalize, then waits until X has processed it', async () => {
    const size = 9 * MB;
    const { network, replay } = adapters([
      {
        method: 'POST',
        url: `${A}/2/media/upload/initialize`,
        body: {
          media_type: '"video/mp4"',
          total_bytes: String(size),
          media_category: '"tweet_video"',
        },
        status: 200,
        response: { data: { id: 'v1' } },
      },
      ...[0, 1, 2].flatMap((segment): RecordedCall[] => [
        {
          method: 'GET',
          url: 'https://storage.test/video',
          requestHeaders: {
            range: `bytes=${String(segment * 4 * MB)}-${String(Math.min((segment + 1) * 4 * MB, size) - 1)}`,
          },
          status: 206,
          responseBytes: segment < 2 ? 4 * MB : MB,
        },
        {
          method: 'POST',
          url: `${A}/2/media/upload/v1/append`,
          body: { segment_index: String(segment) },
          status: 204,
        },
      ]),
      {
        method: 'POST',
        url: `${A}/2/media/upload/v1/finalize`,
        status: 200,
        response: {
          data: { id: 'v1', processing_info: { state: 'pending', check_after_secs: 1 } },
        },
      },
      {
        method: 'GET',
        url: `${A}/2/media/upload`,
        query: { command: 'STATUS', media_id: 'v1' },
        status: 200,
        response: { data: { processing_info: { state: 'in_progress', check_after_secs: 1 } } },
      },
      {
        method: 'GET',
        url: `${A}/2/media/upload`,
        query: { command: 'STATUS', media_id: 'v1' },
        status: 200,
        response: { data: { processing_info: { state: 'succeeded' } } },
      },
      { method: 'POST', url: `${A}/2/tweets`, status: 201, response: { data: { id: '100' } } },
    ]);
    const result = await network.publish(
      post({ media: [file('video', { sizeBytes: size })] }),
      account,
    );
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
    expect(result.externalId).toBe('100');
  });

  it('a video X fails to process is a content problem, with its reason', async () => {
    const { network } = adapters([
      {
        method: 'POST',
        url: `${A}/2/media/upload/initialize`,
        status: 200,
        response: { data: { id: 'v2' } },
      },
      { method: 'GET', url: 'https://storage.test/video', status: 206, responseBytes: 1000 },
      { method: 'POST', url: `${A}/2/media/upload/v2/append`, status: 204 },
      {
        method: 'POST',
        url: `${A}/2/media/upload/v2/finalize`,
        status: 200,
        response: {
          data: {
            processing_info: {
              state: 'failed',
              error: { message: 'InvalidMedia: unsupported codec' },
            },
          },
        },
      },
    ]);
    const err = await network
      .publish(post({ media: [file('video', { sizeBytes: 1000 })] }), account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && [err.kind, err.message]).toEqual([
      'content',
      "X couldn't process the video: InvalidMedia: unsupported codec",
    ]);
  });

  it('a link post costs more; without a username the link still works', async () => {
    const { network } = adapters([
      {
        method: 'POST',
        url: `${A}/2/tweets`,
        body: { text: JSON.stringify('Menu\n\nhttps://h.test/m') },
        status: 201,
        response: { data: { id: '101' } },
      },
    ]);
    const result = await network.publish(post({ text: 'Menu', link: 'https://h.test/m' }), {
      ...account,
      meta: {},
    });
    expect(result.costUnits).toBe(X_LINK_POST_COST_USD);
    expect(result.permalink).toBe('https://x.com/i/web/status/101');
  });

  it("credits used up (402) hold back every account on the app; the rate limit waits until X's reset", async () => {
    const credits = await adapters([
      {
        method: 'POST',
        url: `${A}/2/tweets`,
        status: 402,
        response: {
          title: 'Payment Required',
          detail: 'Your enrolled account does not have any credits',
        },
      },
    ])
      .network.publish(post(), account)
      .catch((e: unknown) => e);
    expect(
      isProviderError(credits) && [credits.kind, credits.limitScope, credits.retryAfterSec],
    ).toEqual(['rate_limited', 'app', 3600]);

    const reset = Math.floor(Date.now() / 1000) + 600;
    const limited = await adapters([
      {
        method: 'POST',
        url: `${A}/2/tweets`,
        status: 429,
        headers: { 'x-rate-limit-reset': String(reset) },
        response: { title: 'Too Many Requests' },
      },
    ])
      .network.publish(post(), account)
      .catch((e: unknown) => e);
    expect(isProviderError(limited) && limited.kind).toBe('rate_limited');
    expect(isProviderError(limited) && limited.retryAfterSec).toBeGreaterThan(590);
    expect(isProviderError(limited) && limited.retryAfterSec).toBeLessThanOrEqual(601);
  });

  it('deleting: done, or already gone', async () => {
    const { network, replay } = adapters([
      {
        method: 'DELETE',
        url: `${A}/2/tweets/99`,
        status: 200,
        response: { data: { deleted: true } },
      },
      { method: 'DELETE', url: `${A}/2/tweets/98`, status: 404, response: { title: 'Not Found' } },
    ]);
    await network.deletePost?.('99', account);
    await network.deletePost?.('98', account);
    expect(replay.mismatches).toEqual([]);
  });
});
