// P3-B4: Pinterest specifics the contract doesn't cover. Errors: what each Pinterest answer makes
// the publishing worker do. Sign-in: no PKCE, the app's id and secret as HTTP Basic, scopes
// however Pinterest writes them, refresh tokens replaced on every refresh, the sandbox host.
// Pins: the board, title and alt text checks, single and carousel pins, the board list, deleting.
// Videos: their limits, the upload, waiting for Pinterest's processing and what happens if it fails.
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../../errors';
import { createHttpClient } from '../../http';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type {
  AccountCredentials,
  ContentInput,
  PublishInput,
  PublishMedia,
  TokenSet,
} from '../../types';
import { pinterestError } from '../errors';
import {
  createPinterestAdapters,
  PINTEREST_API,
  PINTEREST_MAX_CHARS,
  PINTEREST_SANDBOX_API,
  PINTEREST_SCOPES,
  PinterestIssueCode,
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

const account: AccountCredentials = {
  externalId: '2783136121146311751',
  accessToken: 'pina-access',
  meta: {},
};

function pins(calls: RecordedCall[], sandbox = false) {
  const replay = replayFetch(calls);
  // Video uploads wait for Pinterest's processing: instantly here, noting each wait.
  const waits: number[] = [];
  const network = createPinterestAdapters({
    pinterest: { clientId: 'client', clientSecret: 'secret' },
    sandbox,
    fetch: replay.fetch,
    videoOptions: {
      sleep: (ms) => {
        waits.push(ms);
        return Promise.resolve();
      },
    },
  }).networks.find((n) => n.id === 'pinterest');
  if (!network) throw new Error('pinterest network missing');
  return { network, replay, waits };
}

const image = (id: string, extra: Partial<PublishMedia> = {}): PublishMedia => ({
  id,
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 12,
  width: 1000,
  height: 1500,
  durationSec: null,
  altText: null,
  readUrl: `https://storage.test/media/${id}.jpg`,
  publicUrl: null,
  ...extra,
});

/** The image download each publish starts with (12 bytes from our storage). */
const download = (id: string): RecordedCall => ({
  method: 'GET',
  url: `https://storage.test/media/${id}.jpg`,
  status: 200,
  responseBytes: 12,
});
const created = (url = `${PINTEREST_API}/pins`): RecordedCall => ({
  method: 'POST',
  url,
  status: 201,
  response: { id: '813744226420795884' },
});

const valid: PublishInput = {
  text: 'Fresh roast today',
  media: [image('m1')],
  link: null,
  firstComment: null,
  options: { pinterest: { boardId: '549755885175' } },
};
const codes = (input: ContentInput) =>
  pins([])
    .network.validate(input)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code);

describe('validate', () => {
  it('a pin with a board and a photo is fine', () => {
    expect(codes(valid)).toEqual([]);
  });

  it('a pin needs a board', () => {
    const issues = pins([]).network.validate({ ...valid, options: {} });
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: PinterestIssueCode.PINTEREST_BOARD_REQUIRED,
        field: 'options',
      }),
    );
    expect(codes({ ...valid, options: { pinterest: { title: 'No board' } } })).toContain(
      PinterestIssueCode.PINTEREST_BOARD_REQUIRED,
    );
  });

  it('a title can be up to 100 characters', () => {
    const titled = (title: string) => ({
      ...valid,
      options: { pinterest: { boardId: '549755885175', title } },
    });
    expect(codes(titled('a'.repeat(100)))).toEqual([]);
    expect(codes(titled('a'.repeat(101)))).toEqual([PinterestIssueCode.PINTEREST_TITLE_TOO_LONG]);
  });

  it('a pin needs a photo; text alone is not a pin', () => {
    expect(codes({ ...valid, media: [] })).toEqual(['MEDIA_REQUIRED']);
  });

  it('a carousel holds up to 5 photos', () => {
    const photos = (n: number) => Array.from({ length: n }, (_, i) => image(`m${String(i)}`));
    expect(codes({ ...valid, media: photos(5) })).toEqual([]);
    expect(codes({ ...valid, media: photos(6) })).toEqual(['TOO_MANY_MEDIA']);
  });

  it('the description can be up to 800 characters, alt text up to 500', () => {
    expect(codes({ ...valid, text: 'a'.repeat(PINTEREST_MAX_CHARS) })).toEqual([]);
    expect(codes({ ...valid, text: 'a'.repeat(PINTEREST_MAX_CHARS + 1) })).toEqual([
      'TEXT_TOO_LONG',
    ]);
    const alt = pins([]).network.validate({
      ...valid,
      media: [image('m1', { altText: 'a'.repeat(501) })],
    });
    expect(alt).toEqual([
      expect.objectContaining({
        code: PinterestIssueCode.PINTEREST_ALT_TEXT_TOO_LONG,
        mediaId: 'm1',
      }),
    ]);
  });
});

describe('publishing', () => {
  it('2–5 photos become one carousel pin, in order, without alt text', async () => {
    const { network, replay } = pins([download('a'), download('b'), download('c'), created()]);
    const result = await network.publish(
      { ...valid, media: [image('a', { altText: 'first' }), image('b'), image('c')] },
      account,
    );
    expect(replay.mismatches).toEqual([]);
    expect(result).toEqual({
      externalId: '813744226420795884',
      permalink: 'https://www.pinterest.com/pin/813744226420795884/',
      warnings: [],
    });
    const body = replay.seen[3]?.body ?? {};
    const item = { content_type: 'image/jpeg', data: 'BwcHBwcHBwcHBwcH' };
    expect(JSON.parse(body.media_source ?? '{}')).toEqual({
      source_type: 'multiple_image_base64',
      items: [item, item, item],
    });
    expect(body).not.toHaveProperty('alt_text');
  });

  it('one photo carries its alt text and type; blank title and text are left out', async () => {
    const { network, replay } = pins([download('m1'), created()]);
    await network.publish(
      {
        ...valid,
        text: '  ',
        media: [image('m1', { mime: 'image/png', altText: 'A bag of beans' })],
        options: { pinterest: { boardId: '549755885175', title: ' ' } },
      },
      account,
    );
    const body = replay.seen[1]?.body ?? {};
    expect(Object.keys(body).sort()).toEqual(['alt_text', 'board_id', 'media_source']);
    expect(body.alt_text).toBe('"A bag of beans"');
    expect(JSON.parse(body.media_source ?? '{}')).toMatchObject({
      source_type: 'image_base64',
      content_type: 'image/png',
    });
  });

  it('an answer without a pin id fails rather than pretending it worked', async () => {
    const { network } = pins([download('m1'), { ...created(), response: {} }]);
    const err = await network.publish(valid, account).catch((e: unknown) => e);
    expect(isProviderError(err)).toBe(true);
  });

  it('in the sandbox, pins go to the sandbox host', async () => {
    const sandboxPin = created(`${PINTEREST_SANDBOX_API}/pins`);
    const { network, replay } = pins([download('m1'), sandboxPin], true);
    await network.publish(valid, account);
    expect(replay.mismatches).toEqual([]);
  });

  it('deleting a pin, or one already gone, succeeds; a refused token means signing in again', async () => {
    const del = (status: number, response: unknown = '') =>
      pins([
        { method: 'DELETE', url: `${PINTEREST_API}/pins/813744226420795884`, status, response },
      ]).network.deletePost?.('813744226420795884', account);
    await expect(del(204)).resolves.toBeUndefined();
    await expect(del(404, { code: 404, message: 'Pin not found.' })).resolves.toBeUndefined();
    const err = await del(401, { code: 2, message: 'Authentication failed.' })?.catch(
      (e: unknown) => e,
    );
    expect(isProviderError(err) && err.kind).toBe('auth');
  });
});

describe('boards', () => {
  it('lists public and protected boards, never secret ones', async () => {
    const { network, replay } = pins(fixture('pinterest', 'boards'));
    expect(await network.optionChoices?.(account)).toEqual({
      network: 'pinterest',
      boards: [
        { id: '549755885175', name: 'Coffee', privacy: 'public' },
        { id: '549755885176', name: 'Wholesale', privacy: 'protected' },
      ],
    });
    expect(replay.mismatches).toEqual([]);
  });

  it('follows the bookmark to the next page, and stops after 10 pages', async () => {
    const page = (n: number, bookmark: string | null): RecordedCall => ({
      method: 'GET',
      url: `${PINTEREST_API}/boards`,
      ...(n > 0 ? { query: { bookmark: `b${String(n)}` } } : {}),
      status: 200,
      response: {
        items: [{ id: String(n), name: `Board ${String(n)}`, privacy: 'PUBLIC' }],
        bookmark,
      },
    });
    const two = pins([page(0, 'b1'), page(1, null)]);
    const choices = await two.network.optionChoices?.(account);
    expect(choices?.network === 'pinterest' && choices.boards.map((b) => b.id)).toEqual(['0', '1']);
    expect(two.replay.mismatches).toEqual([]);

    const endless = pins(Array.from({ length: 10 }, (_, n) => page(n, `b${String(n + 1)}`)));
    const many = await endless.network.optionChoices?.(account);
    expect(many?.network === 'pinterest' && many.boards).toHaveLength(10);
    expect(endless.replay.remaining()).toEqual([]);
  });

  it('in the sandbox, an empty page with a bookmark still leads to the boards after it', async () => {
    // Pinterest's sandbox filters production boards out of each page after fetching it, so a
    // page can come back empty with a bookmark (developers.pinterest.com, Sandbox, 2026-10-09).
    const { network, replay } = pins(
      [
        {
          method: 'GET',
          url: `${PINTEREST_SANDBOX_API}/boards`,
          status: 200,
          response: { items: [], bookmark: 'b1' },
        },
        {
          method: 'GET',
          url: `${PINTEREST_SANDBOX_API}/boards`,
          query: { bookmark: 'b1' },
          status: 200,
          response: {
            items: [{ id: '7', name: 'Sandbox board', privacy: 'PUBLIC' }],
            bookmark: null,
          },
        },
      ],
      true,
    );
    expect(await network.optionChoices?.(account)).toEqual({
      network: 'pinterest',
      boards: [{ id: '7', name: 'Sandbox board', privacy: 'public' }],
    });
    expect(replay.mismatches).toEqual([]);
  });

  it('a refused token while listing boards means signing in again', async () => {
    const { network } = pins([
      {
        method: 'GET',
        url: `${PINTEREST_API}/boards`,
        status: 401,
        response: { code: 2, message: 'Authentication failed.' },
      },
    ]);
    const err = await network.optionChoices?.(account).catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');
  });
});

describe('video pins', () => {
  const video = (extra: Partial<PublishMedia> = {}) =>
    image('v1', {
      kind: 'video',
      mime: 'video/mp4',
      sizeBytes: 24,
      durationSec: 20,
      readUrl: 'https://storage.test/media/v1.mp4',
      ...extra,
    });
  const videoPin: PublishInput = { ...valid, text: '', media: [video()] };
  const MEDIA = `${PINTEREST_API}/media/5149421785858431`;
  const status = (value: string): RecordedCall => ({
    method: 'GET',
    url: MEDIA,
    status: 200,
    response: { media_id: '5149421785858431', media_type: 'video', status: value },
  });
  /** The video fixture's first three calls: register, read from our storage, upload. */
  const uploaded = () => fixture('pinterest', 'video-pin').slice(0, 3);

  it('one MP4, MOV or M4V video of 4 seconds to 5 minutes is fine', () => {
    expect(codes(videoPin)).toEqual([]);
    expect(codes({ ...videoPin, media: [video({ mime: 'video/quicktime' })] })).toEqual([]);
  });

  it('other video types, two videos, or a video with photos are refused', () => {
    expect(codes({ ...videoPin, media: [video({ mime: 'video/webm' })] })).toEqual([
      PinterestIssueCode.PINTEREST_VIDEO_FORMAT,
    ]);
    expect(codes({ ...videoPin, media: [video(), video({ id: 'v2' })] })).toEqual([
      'TOO_MANY_MEDIA',
    ]);
    expect(codes({ ...videoPin, media: [video(), image('m1')] })).toEqual(['MEDIA_MIXED']);
  });

  it('a video shorter than 4 seconds, longer than 5 minutes or over 500 MB is refused', () => {
    expect(codes({ ...videoPin, media: [video({ durationSec: 3 })] })).toEqual(['VIDEO_TOO_SHORT']);
    expect(codes({ ...videoPin, media: [video({ durationSec: 301 })] })).toEqual([
      'VIDEO_TOO_LONG',
    ]);
    expect(codes({ ...videoPin, media: [video({ sizeBytes: 501 * 1024 * 1024 })] })).toEqual([
      'VIDEO_TOO_LARGE',
    ]);
  });

  it('registers, uploads, waits until processed, then pins it with a frame as its cover', async () => {
    const { network, replay, waits } = pins(fixture('pinterest', 'video-pin'));
    const result = await network.publish(videoPin, account);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
    expect(result.externalId).toBe('813744226420795999');
    // The upload carries every signed parameter as given, the file last, and no Bearer token.
    const upload = replay.seen[2];
    expect(Object.keys(upload?.body ?? {})).toEqual([
      'x-amz-date',
      'x-amz-signature',
      'x-amz-security-token',
      'x-amz-algorithm',
      'key',
      'policy',
      'x-amz-credential',
      'Content-Type',
      'file',
    ]);
    // 5 s before the first check, then ×1.5.
    expect(waits).toEqual([5000, 7500]);
  });

  it('a video Pinterest fails to process fails the post, saying what to do', async () => {
    const { network } = pins([...uploaded(), status('failed')]);
    const err = await network.publish(videoPin, account).catch((e: unknown) => e);
    expect(err).toMatchObject({ kind: 'content' });
    expect(isProviderError(err) && err.message).toContain('Check it plays');
  });

  it('still processing after the last check is tried again later, with waits capped at 30 s', async () => {
    const checks = Array.from({ length: 15 }, () => status('processing'));
    const { network, waits } = pins([...uploaded(), ...checks]);
    const err = await network.publish(videoPin, account).catch((e: unknown) => e);
    expect(err).toMatchObject({ kind: 'retryable' });
    expect(waits).toHaveLength(15);
    expect(Math.max(...waits)).toBe(30_000);
  });

  it('a refused upload to Pinterest’s storage is tried again', async () => {
    const [register, read] = uploaded();
    if (!register || !read) throw new Error('fixture');
    const { network } = pins([
      register,
      read,
      {
        method: 'POST',
        url: 'https://pinterest-media-upload.s3-accelerate.amazonaws.com/',
        status: 403,
        response: '<Error><Code>AccessDenied</Code></Error>',
      },
    ]);
    const err = await network.publish(videoPin, account).catch((e: unknown) => e);
    expect(err).toMatchObject({ kind: 'retryable', status: 403 });
  });
});
