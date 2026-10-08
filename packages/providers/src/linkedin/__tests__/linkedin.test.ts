// P3-B1: LinkedIn specifics the contract doesn't cover. Errors: what each LinkedIn answer makes the
// publishing worker do (retry, wait, reconnect or fail with LinkedIn's words). Sign-in: no PKCE,
// 60-day tokens without refresh, scopes however LinkedIn writes them, the member's profile.
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../../errors';
import { createHttpClient } from '../../http';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type { ContentInput, ContentMedia, PublishInput, PublishMedia, TokenSet } from '../../types';
import { linkedinError } from '../errors';
import {
  createLinkedInAdapters,
  LINKEDIN_MAX_CHARS,
  LINKEDIN_SCOPES,
  LINKEDIN_VIDEO_WAIT,
  linkedinCommentary,
  linkedinPostText,
  unknownStatusWaitMs,
} from '../index';

const CALLBACK = 'https://app.test/api/oauth/linkedin/callback';
const tokens: TokenSet = {
  accessToken: 'li-access',
  refreshToken: null,
  expiresAt: null,
  scopes: ['openid', 'profile', 'w_member_social'],
};

function login(calls: RecordedCall[]) {
  const replay = replayFetch(calls);
  const [adapter] = createLinkedInAdapters({
    linkedin: { clientId: 'client', clientSecret: 'secret' },
    fetch: replay.fetch,
  }).logins;
  if (!adapter) throw new Error('linkedin login missing');
  return { adapter, replay };
}

/** Plays one recorded answer through the shared HTTP client, as the adapters receive it. */
async function answer(call: RecordedCall) {
  const http = createHttpClient({ name: 'LinkedIn', fetch: replayFetch([call]).fetch });
  return http.request({ method: call.method, url: call.url });
}

const one = (name: string): RecordedCall => {
  const [call] = fixture('linkedin', name);
  if (!call) throw new Error(`empty fixture ${name}`);
  return call;
};

describe('errors', () => {
  it('a refused or expired token means signing in again, also from the token endpoint', async () => {
    const expired = linkedinError(await answer(one('error-expired-token')), 'posting');
    expect(expired).toMatchObject({
      kind: 'auth',
      status: 401,
      message: 'LinkedIn: The token used in the request has expired',
    });
    const code = linkedinError(await answer(one('error-code-not-found')), 'sign-in');
    expect(code).toMatchObject({ kind: 'auth', networkCode: 'invalid_request' });
    expect(code.message).toContain('authorization code not found');
  });

  it('a rate limit waits what Retry-After says, else leaves the wait to the worker', async () => {
    const plain = linkedinError(await answer(one('error-rate-limit')), 'posting');
    expect(plain).toMatchObject({
      kind: 'rate_limited',
      retryAfterSec: null,
      limitScope: 'account',
    });
    const told = linkedinError(
      await answer({ ...one('error-rate-limit'), headers: { 'retry-after': '120' } }),
      'posting',
    );
    expect(told.retryAfterSec).toBe(120);
  });

  it('a duplicate post fails with LinkedIn’s words; a server error is tried again', async () => {
    const duplicate = linkedinError(await answer(one('error-duplicate')), 'posting');
    expect(duplicate).toMatchObject({ kind: 'content', status: 422 });
    expect(duplicate.message).toContain('duplicate');
    const server = linkedinError(await answer(one('error-server')), 'posting');
    expect(server).toMatchObject({ kind: 'retryable', networkCode: 'INTERNAL_ERROR' });
  });

  it('media not ready yet is tried again in 2 minutes; media that failed processing is not', async () => {
    const posts = 'https://api.linkedin.com/rest/posts';
    const waiting = linkedinError(
      await answer({
        method: 'POST',
        url: posts,
        status: 422,
        response: { status: 422, message: 'The video media is still processing' },
      }),
      'posting',
    );
    expect(waiting).toMatchObject({ kind: 'retryable', retryAfterSec: 120 });
    const failed = linkedinError(
      await answer({
        method: 'POST',
        url: posts,
        status: 400,
        response: {
          status: 400,
          code: 'MEDIA_ASSET_PROCESSING_FAILED',
          message: 'Media asset failed processing',
        },
      }),
      'posting',
    );
    expect(failed.kind).toBe('content');
  });

  it('the share limit for unverified members fails at once and says what to do', async () => {
    // A real answer (2026-10-08): a 429, but retrying in minutes can't help.
    const err = linkedinError(await answer(one('error-share-limit')), 'posting');
    expect(err).toMatchObject({ kind: 'content', status: 429 });
    expect(err.message).toContain('Verify the account on LinkedIn, or try again tomorrow');
  });

  it('a retired API version says Socioboard needs an update, without retrying', async () => {
    const err = linkedinError(await answer(one('error-version')), 'posting');
    expect(err).toMatchObject({ kind: 'content', status: 426, networkCode: 'NONEXISTENT_VERSION' });
    expect(err.message).toContain('Socioboard needs an update');
  });

  it('an answer without a message still says what failed', async () => {
    const err = linkedinError(
      await answer({
        method: 'POST',
        url: 'https://api.linkedin.com/rest/posts',
        status: 503,
        response: '',
      }),
      'posting',
    );
    expect(err).toMatchObject({
      kind: 'retryable',
      message: 'LinkedIn posting failed (HTTP 503)',
      networkCode: null,
    });
  });
});

describe('sign-in', () => {
  it('asks for the profile and posting scopes, with our callback and no PKCE', () => {
    const { adapter } = login([]);
    expect(adapter).toMatchObject({
      id: 'linkedin',
      usesPkce: false,
      networks: ['linkedin_person'],
    });
    // No programmatic refresh outside LinkedIn's partner programs: reconnect when it expires.
    expect('refresh' in adapter).toBe(false);
    const url = new URL(adapter.getAuthUrl({ state: 'st', redirectUri: CALLBACK }));
    expect(`${url.origin}${url.pathname}`).toBe('https://www.linkedin.com/oauth/v2/authorization');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'client',
      redirect_uri: CALLBACK,
      state: 'st',
      scope: 'openid profile w_member_social',
    });
  });

  it('exchanges the code with the client secret; the token lasts 60 days', async () => {
    const { adapter, replay } = login(fixture('linkedin', 'token-exchange'));
    const before = Date.now();
    const got = await adapter.exchangeCode({ code: 'li-code', redirectUri: CALLBACK });
    expect(got).toMatchObject({
      accessToken: 'li-access',
      refreshToken: null,
      scopes: ['openid', 'profile', 'w_member_social'],
    });
    const days = ((got.expiresAt?.getTime() ?? 0) - before) / 86_400_000;
    expect(Math.round(days)).toBe(60);
    expect(replay.mismatches).toEqual([]);
  });

  it('reads scopes space- or comma-separated, and all of them when LinkedIn leaves them out', async () => {
    const [call] = fixture('linkedin', 'token-exchange');
    if (!call) throw new Error('empty fixture');
    const scopesOf = async (scope: string | undefined) => {
      const { adapter } = login([
        { ...call, response: { access_token: 'li-access', expires_in: 5184000, scope } },
      ]);
      return (await adapter.exchangeCode({ code: 'li-code', redirectUri: CALLBACK })).scopes;
    };
    expect(await scopesOf('openid profile w_member_social')).toEqual([...LINKEDIN_SCOPES]);
    expect(await scopesOf('openid, profile')).toEqual(['openid', 'profile']);
    expect(await scopesOf(undefined)).toEqual([...LINKEDIN_SCOPES]);
  });

  it('a code LinkedIn refuses (expired, used, wrong callback) means signing in again', async () => {
    const { adapter } = login(fixture('linkedin', 'error-code-not-found'));
    const err = await adapter
      .exchangeCode({ code: 'li-code', redirectUri: CALLBACK })
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');

    const { adapter: again } = login([
      {
        method: 'POST',
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
        status: 400,
        response: {
          error: 'invalid_redirect_uri',
          error_description: 'Unable to retrieve access token',
        },
      },
    ]);
    const bad = await again
      .exchangeCode({ code: 'li-code', redirectUri: CALLBACK })
      .catch((e: unknown) => e);
    expect(isProviderError(bad) && bad.kind).toBe('auth');
  });

  it('lists the member’s profile, unavailable without the posting permission', async () => {
    const { adapter } = login(fixture('linkedin', 'userinfo'));
    expect(await adapter.listAssets(tokens)).toEqual([
      {
        network: 'linkedin_person',
        externalId: '782bbtaQ',
        displayName: 'Priya Raman',
        username: null,
        avatarUrl: 'https://media.licdn.com/dms/image/fake/profile-displayphoto-shrink_100_100/0/',
        token: null,
        meta: {},
        unavailableReason: null,
      },
    ]);
    const { adapter: readOnly } = login(fixture('linkedin', 'userinfo'));
    const [asset] = await readOnly.listAssets({ ...tokens, scopes: ['openid', 'profile'] });
    expect(asset?.unavailableReason).toBe('missing_permission');
  });

  it('builds the name from its parts when LinkedIn sends no full name', async () => {
    const { adapter } = login([
      {
        method: 'GET',
        url: 'https://api.linkedin.com/v2/userinfo',
        status: 200,
        response: { sub: 'abc', given_name: 'Priya', family_name: 'Raman' },
      },
    ]);
    expect(await adapter.getIdentity(tokens)).toEqual({
      externalUserId: 'abc',
      displayName: 'Priya Raman',
      avatarUrl: null,
    });
  });
});

function profile(calls: RecordedCall[]) {
  const replay = replayFetch(calls);
  const network = createLinkedInAdapters({
    linkedin: { clientId: 'client', clientSecret: 'secret' },
    fetch: replay.fetch,
  }).networks.find((n) => n.id === 'linkedin_person');
  if (!network) throw new Error('linkedin_person missing');
  return { network, replay };
}

const MB = 1024 * 1024;
const account = { externalId: '782bbtaQ', accessToken: 'li-access', meta: {} };
const post = (text: string, link: string | null = null): PublishInput => ({
  text,
  media: [],
  link,
  firstComment: null,
  options: {},
});
/** A 1 MB JPEG in our storage, ready to publish. */
const photo = (id: string, extra: Partial<PublishMedia> = {}): PublishMedia => ({
  id,
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: MB,
  width: 1200,
  height: 800,
  durationSec: null,
  altText: null,
  readUrl: `https://storage.test/${id}.jpg`,
  publicUrl: null,
  ...extra,
});

describe('text', () => {
  it('escapes what LinkedIn reads as markup, and keeps hashtags working', () => {
    // String.raw: each backslash below is one backslash LinkedIn receives.
    expect(
      linkedinCommentary(String.raw`Ask (us) [now] @team *bold* a_b ~x <y> {z} a|b C# \ `),
    ).toBe(String.raw`Ask \(us\) \[now\] \@team \*bold\* a\_b \~x \<y\> \{z\} a\|b C\# \\ `);
    expect(linkedinCommentary('#coffee lovers, #Kaffee2026 #café\n#next')).toBe(
      '#coffee lovers, #Kaffee2026 #café\n#next',
    );
    // A hashtag is `#` + letters and digits, so "#1" stays one; `_` ends it and is escaped.
    expect(linkedinCommentary('Price #1? Use #my_tag')).toBe(String.raw`Price #1? Use #my\_tag`);
  });

  it('a hashtag after punctuation is still a hashtag; one glued to a word is not (PR #463 review)', () => {
    expect(linkedinCommentary('Big news (#launch) today: "#socioboard"')).toBe(
      String.raw`Big news \(#launch\) today: "#socioboard"`,
    );
    expect(linkedinCommentary('[#beta], #one,#two')).toBe(String.raw`\[#beta\], #one,#two`);
    // C# is a language, not a hashtag; a_#x has "_" before the "#".
    expect(linkedinCommentary('We use C# and a_#x')).toBe(String.raw`We use C\# and a\_\#x`);
    // Unconfirmed whether LinkedIn takes "_" inside a hashtag, so it ends the tag and is escaped.
    expect(linkedinCommentary('#coffee_time')).toBe(String.raw`#coffee\_time`);
  });

  it('adds the link after the text unless the text has it', () => {
    expect(linkedinPostText({ text: ' Read this ', link: 'https://a.test/x' })).toBe(
      'Read this\n\nhttps://a.test/x',
    );
    expect(linkedinPostText({ text: 'See https://a.test/x', link: 'https://a.test/x' })).toBe(
      'See https://a.test/x',
    );
    expect(linkedinPostText({ text: '', link: 'https://a.test/x' })).toBe('https://a.test/x');
  });

  it('counts the added link in the length; something must be posted', () => {
    const { network } = profile([]);
    const codes = (input: ContentInput) => network.validate(input).map((i) => i.code);
    expect(codes(post('x'.repeat(LINKEDIN_MAX_CHARS)))).toEqual([]);
    expect(codes(post('x'.repeat(LINKEDIN_MAX_CHARS - 5), 'https://a.test'))).toEqual([
      'TEXT_TOO_LONG',
    ]);
    expect(codes(post('  '))).toEqual(['EMPTY_POST']);
    expect(codes(post('', 'https://a.test'))).toEqual([]);
  });

  it('takes up to 20 photos of any size (the worker fits them)', () => {
    const { network } = profile([]);
    const codes = (media: ContentMedia[]) =>
      network.validate({ ...post(''), media }).map((i) => i.code);
    // A photo alone is a post; a 30 MB one is fine, it's refitted to 10 MB before publishing.
    expect(codes([photo('m1', { sizeBytes: 30 * MB })])).toEqual([]);
    expect(codes(Array.from({ length: 20 }, (_, i) => photo(`m${String(i)}`)))).toEqual([]);
    expect(codes(Array.from({ length: 21 }, (_, i) => photo(`m${String(i)}`)))).toEqual([
      'TOO_MANY_MEDIA',
    ]);
  });
});

describe('publishing', () => {
  it('posts publicly as the member, with the version headers, and links to the post', async () => {
    const { network, replay } = profile(fixture('linkedin', 'post-created'));
    const result = await network.publish(post('Fresh roast today (Kenya) #coffee'), account);
    expect(result).toEqual({
      externalId: 'urn:li:share:7000000000000000001',
      permalink: 'https://www.linkedin.com/feed/update/urn:li:share:7000000000000000001/',
      warnings: [],
    });
    expect(replay.mismatches).toEqual([]);
    expect(replay.seen[0]?.body.distribution).toBe(
      JSON.stringify({
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      }),
    );
  });

  it('a post LinkedIn accepts without an id is not retried (it would post twice)', async () => {
    const [created] = fixture('linkedin', 'post-created');
    if (!created) throw new Error('empty fixture');
    const { network } = profile([{ ...created, headers: {} }]);
    const err = await network
      .publish(post('Fresh roast today (Kenya) #coffee'), account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('content');
  });

  it('deleting: done, or already gone', async () => {
    const urn = 'urn:li:share:7000000000000000001';
    const { network, replay } = profile(fixture('linkedin', 'post-deleted'));
    await network.deletePost?.(urn, account);
    expect(replay.mismatches).toEqual([]);
    const [deleted] = fixture('linkedin', 'post-deleted');
    if (!deleted) throw new Error('empty fixture');
    const { network: gone } = profile([{ ...deleted, status: 404, response: { status: 404 } }]);
    await expect(gone.deletePost?.(urn, account)).resolves.toBeUndefined();
  });
});

describe('photos', () => {
  const [init] = fixture('linkedin', 'image-initialized');
  const [put] = fixture('linkedin', 'image-uploaded');
  const [created] = fixture('linkedin', 'post-created');
  if (!init || !put || !created) throw new Error('empty fixture');

  /** Our storage answering with the photo's bytes. */
  const read = (id: string): RecordedCall => ({
    method: 'GET',
    url: `https://storage.test/${id}.jpg`,
    status: 200,
    responseBytes: 64,
  });
  /** LinkedIn registering a second photo, with its own upload URL and URN. */
  const second: RecordedCall[] = [
    {
      ...init,
      response: {
        value: {
          uploadUrl: 'https://www.linkedin.com/dms-uploads/C4E10AQFakeImg02/uploaded-image/0?ut=x',
          image: 'urn:li:image:C4E10AQFakeImg02',
        },
      },
    },
    read('m2'),
    { ...put, url: 'https://www.linkedin.com/dms-uploads/C4E10AQFakeImg02/uploaded-image/0' },
  ];
  const posted = (content: unknown): RecordedCall => ({
    ...created,
    body: { content: JSON.stringify(content) },
  });

  it('one photo: registered, uploaded with the token, then posted as media with its alt text', async () => {
    const { network, replay } = profile([
      init,
      read('m1'),
      { ...put, body: { bytes: '64' } },
      posted({ media: { id: 'urn:li:image:C4E10AQFakeImg01', altText: 'A flat white' } }),
    ]);
    const result = await network.publish(
      { ...post('New roast'), media: [photo('m1', { altText: ' A flat white ' })] },
      account,
    );
    expect(result.externalId).toBe('urn:li:share:7000000000000000001');
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('several photos, in order, as one MultiImage post; blank alt text is left out', async () => {
    const { network, replay } = profile([
      init,
      read('m1'),
      put,
      ...second,
      posted({
        multiImage: {
          images: [
            { id: 'urn:li:image:C4E10AQFakeImg01', altText: 'Beans' },
            { id: 'urn:li:image:C4E10AQFakeImg02' },
          ],
        },
      }),
    ]);
    await network.publish(
      {
        ...post('Two roasts'),
        media: [photo('m1', { altText: 'Beans' }), photo('m2', { altText: '  ' })],
      },
      account,
    );
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('a refused upload stops before posting, with LinkedIn’s reason', async () => {
    const { network, replay } = profile([
      init,
      read('m1'),
      { ...put, status: 403, response: { status: 403, message: 'Not the image owner' } },
    ]);
    const err = await network
      .publish({ ...post('New roast'), media: [photo('m1')] }, account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('content');
    expect(isProviderError(err) && err.message).toBe('LinkedIn: Not the image owner');
    expect(replay.remaining()).toEqual([]);
  });

  it('an expired token while registering means reconnecting, nothing uploaded', async () => {
    const { network, replay } = profile([
      { ...init, status: 401, response: { status: 401, message: 'Expired access token' } },
    ]);
    const err = await network
      .publish({ ...post('New roast'), media: [photo('m1')] }, account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');
    expect(replay.seen).toHaveLength(1);
  });
});

describe('video', () => {
  const [init] = fixture('linkedin', 'video-initialized');
  const parts = fixture('linkedin', 'video-parts-uploaded');
  const [finalized] = fixture('linkedin', 'video-finalized');
  const [processing, available] = fixture('linkedin', 'video-status');
  const [created] = fixture('linkedin', 'post-created');
  if (!init || !finalized || !processing || !available || !created) {
    throw new Error('empty fixture');
  }
  const clip = (extra: Partial<PublishMedia> = {}) =>
    photo('v1', {
      kind: 'video',
      mime: 'video/mp4',
      sizeBytes: 10,
      durationSec: 12,
      readUrl: 'https://storage.test/v1.mp4',
      ...extra,
    });
  /** Our storage answering one byte range of the video. */
  const range = (bytes: number): RecordedCall => ({
    method: 'GET',
    url: 'https://storage.test/v1.mp4',
    status: 200,
    responseBytes: bytes,
  });
  const [part0, part1] = parts;
  if (!part0 || !part1) throw new Error('empty fixture');
  const uploaded: RecordedCall[] = [init, range(6), part0, range(4), part1, finalized];

  /** The LinkedIn profile network with instant waits, recording every request's headers. */
  function videoProfile(calls: RecordedCall[]) {
    const replay = replayFetch(calls);
    const headers: Headers[] = [];
    const sleeps: number[] = [];
    const network = createLinkedInAdapters({
      linkedin: { clientId: 'client', clientSecret: 'secret' },
      fetch: (input, req) => {
        headers.push(new Headers(req?.headers));
        return replay.fetch(input, req);
      },
      videoOptions: {
        sleep: (ms) => {
          sleeps.push(ms);
          return Promise.resolve();
        },
      },
    }).networks.find((n) => n.id === 'linkedin_person');
    if (!network) throw new Error('linkedin_person missing');
    return { network, replay, headers, sleeps };
  }

  it('uploads in the parts LinkedIn asks for, without the token, finalizes, waits, then posts', async () => {
    const { network, replay, headers, sleeps } = videoProfile([
      ...uploaded,
      processing,
      available,
      {
        ...created,
        body: { content: JSON.stringify({ media: { id: 'urn:li:video:C5505AQFakeVid01' } }) },
      },
    ]);
    const result = await network.publish({ ...post('Roasting day'), media: [clip()] }, account);
    expect(result.externalId).toBe('urn:li:share:7000000000000000001');
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
    // The two part uploads (requests 3 and 5) carry no token; LinkedIn's video URLs refuse one.
    expect([headers[2]?.has('authorization'), headers[4]?.has('authorization')]).toEqual([
      false,
      false,
    ]);
    // Read from storage by byte range: [0, 5] and [6, 9].
    expect([headers[1]?.get('range'), headers[3]?.get('range')]).toEqual([
      'bytes=0-5',
      'bytes=6-9',
    ]);
    // 10 s before the first status check, 15 s before the second.
    expect(sleeps).toEqual([10_000, 15_000]);
  });

  it('a video LinkedIn fails to process is a content problem, with its reason', async () => {
    const { network } = videoProfile([
      ...uploaded,
      {
        ...processing,
        response: { status: 'PROCESSING_FAILED', processingFailureReason: 'Unsupported codec' },
      },
    ]);
    const err = await network
      .publish({ ...post('Roasting day'), media: [clip()] }, account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('content');
    expect(isProviderError(err) && err.message).toContain('Unsupported codec');
  });

  it('still processing after 10 checks, never more than a minute apart, is tried again later', async () => {
    // Each check is one of the member's 150 LinkedIn calls a day (PR #463 review).
    const { network, replay, sleeps } = videoProfile([
      ...uploaded,
      ...Array.from({ length: LINKEDIN_VIDEO_WAIT.maxChecks }, () => processing),
    ]);
    const err = await network
      .publish({ ...post('Roasting day'), media: [clip()] }, account)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('retryable');
    expect(
      replay.seen.filter((r) => r.method === 'GET' && r.url.pathname.includes('/rest/videos/')),
    ).toHaveLength(10);
    expect(replay.remaining()).toEqual([]);
    expect(sleeps).toEqual([
      10_000, 15_000, 22_500, 33_750, 50_625, 60_000, 60_000, 60_000, 60_000, 60_000,
    ]);
  });

  it('when LinkedIn won’t show the token the video’s status (403), it waits by size, then posts', async () => {
    const { network, replay, sleeps } = videoProfile([
      ...uploaded,
      { ...processing, status: 403, response: { status: 403, message: 'Not allowed' } },
      created,
    ]);
    // The publish fixture expects this text; the post goes out with the video.
    await network.publish(
      { ...post('Fresh roast today (Kenya) #coffee'), media: [clip()] },
      account,
    );
    expect(replay.remaining()).toEqual([]);
    // The first check's 10 s, then 10 s + 1 s per MB (this clip is under 1 MB).
    expect(sleeps).toEqual([10_000, 11_000]);
    expect([unknownStatusWaitMs(50 * MB), unknownStatusWaitMs(500 * MB)]).toEqual([
      60_000, 120_000,
    ]);
  });

  it('a post LinkedIn refuses because the video isn’t ready is tried again in 2 minutes', async () => {
    const { network } = videoProfile([
      ...uploaded,
      { ...processing, status: 403, response: { status: 403, message: 'Not allowed' } },
      {
        ...created,
        status: 400,
        headers: {},
        response: {
          status: 400,
          code: 'MEDIA_ASSET_WAITING_UPLOAD',
          message: 'Media asset is waiting upload',
        },
      },
    ]);
    const err = await network
      .publish({ ...post('Fresh roast today (Kenya) #coffee'), media: [clip()] }, account)
      .catch((e: unknown) => e);
    expect(err).toMatchObject({ kind: 'retryable', retryAfterSec: 120 });
  });

  it('one video, alone, 3 seconds to 30 minutes', () => {
    const { network } = profile([]);
    const codes = (media: ContentMedia[]) =>
      network.validate({ ...post('A clip'), media }).map((i) => i.code);
    expect(codes([clip()])).toEqual([]);
    expect(codes([clip(), clip({ id: 'v2' })])).toEqual(['TOO_MANY_MEDIA']);
    expect(codes([clip(), photo('m1')])).toEqual(['MEDIA_MIXED']);
    expect(codes([clip({ durationSec: 2 })])).toEqual(['VIDEO_TOO_SHORT']);
    expect(codes([clip({ durationSec: 31 * 60 })])).toEqual(['VIDEO_TOO_LONG']);
    expect(codes([clip({ sizeBytes: 600 * MB })])).toEqual(['VIDEO_TOO_LARGE']);
  });
});
