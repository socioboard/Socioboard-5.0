import { describe, expect, it, vi } from 'vitest';

import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type { AccountCredentials, PublishInput, PublishMedia } from '../../types';
import { IssueCode } from '../../validation';
import { createMetaAdapters, INSTAGRAM_SCOPES } from '../index';

const FB = 'https://graph.facebook.com/v25.0';
const IG = 'https://graph.instagram.com/v25.0';
const IG_ID = '17841400000000001';
/** Reached through a Facebook Page: publishes on graph.facebook.com with the Page token. */
const VIA_PAGE: AccountCredentials = {
  externalId: IG_ID,
  accessToken: 'EAA-page-101',
  meta: { via: 'facebook', pageId: '101' },
};
/** Signed in with Instagram Login: graph.instagram.com with the login's token. */
const VIA_IG: AccountCredentials = {
  externalId: '17841400000000009',
  accessToken: 'IGAA-long',
  meta: { via: 'instagram' },
};

function setup(calls: RecordedCall[]) {
  const replay = replayFetch(calls);
  const meta = createMetaAdapters({
    facebook: { appId: '1234567890', appSecret: 'app-secret' },
    instagram: { appId: '990011', appSecret: 'ig-secret' },
    fetch: replay.fetch,
    instagramOptions: { pollIntervalMs: 0, maxWaitMs: 60_000, sleep: () => Promise.resolve() },
  });
  const login = meta.logins.find((l) => l.id === 'instagram');
  const instagram = meta.networks.find((n) => n.id === 'instagram');
  if (!login || !instagram) throw new Error('instagram adapters missing');
  return { replay, login, instagram };
}

const image = (id: string, extra: Partial<PublishMedia> = {}): PublishMedia => ({
  id,
  kind: 'image',
  mime: 'image/jpeg',
  readUrl: `https://storage.test/${id}.jpg`,
  publicUrl: `https://media.test/${id}.jpg`,
  sizeBytes: 300_000,
  width: 1080,
  height: 1350,
  durationSec: null,
  altText: null,
  ...extra,
});
const video = (id: string, extra: Partial<PublishMedia> = {}): PublishMedia => ({
  ...image(id),
  kind: 'video',
  mime: 'video/mp4',
  readUrl: `https://storage.test/${id}.mp4`,
  publicUrl: `https://media.test/${id}.mp4`,
  width: 1080,
  height: 1920,
  durationSec: 20,
  ...extra,
});
const post = (extra: Partial<PublishInput> = {}): PublishInput => ({
  text: 'Fresh roast today #coffee',
  media: [image('a')],
  link: null,
  firstComment: null,
  options: {},
  ...extra,
});

/** Container created, then its status polled until FINISHED. */
function created(base: string, id: string, body: Record<string, string>, statuses = ['FINISHED']) {
  return [
    { method: 'POST', url: `${base}/${IG_ID}/media`, body, status: 200, response: { id } },
    ...statuses.map((status_code): RecordedCall => ({
      method: 'GET',
      url: `${base}/${id}`,
      query: { fields: 'status_code,status' },
      status: 200,
      response: { status_code, id },
    })),
  ] as RecordedCall[];
}
function published(
  base: string,
  creationId: string,
  mediaId: string,
  igId = IG_ID,
): RecordedCall[] {
  return [
    {
      method: 'POST',
      url: `${base}/${igId}/media_publish`,
      body: { creation_id: creationId },
      status: 200,
      response: { id: mediaId },
    },
    {
      method: 'GET',
      url: `${base}/${mediaId}`,
      query: { fields: 'permalink' },
      status: 200,
      response: { permalink: `https://www.instagram.com/p/${mediaId}/`, id: mediaId },
    },
  ];
}

describe('Instagram Login', () => {
  it('asks for the business scopes, and forces the account choice when adding another login', () => {
    const { login } = setup([]);
    const url = new URL(
      login.getAuthUrl({
        state: 's1',
        redirectUri: 'https://app.test/api/oauth/instagram/callback',
        forceAccountSelection: true,
      }),
    );
    expect(url.origin + url.pathname).toBe('https://www.instagram.com/oauth/authorize');
    expect(url.searchParams.get('scope')).toBe(INSTAGRAM_SCOPES.join(','));
    expect(url.searchParams.get('force_reauth')).toBe('true');
    expect(login.supportsAccountSelection).toBe(true);
    const first = new URL(
      login.getAuthUrl({
        state: 's1',
        redirectUri: 'https://app.test/api/oauth/instagram/callback',
      }),
    );
    expect(first.searchParams.has('force_reauth')).toBe(false);
  });

  it('trades the code for a 60-day token with the granted permissions', async () => {
    const { replay, login } = setup(fixture('meta', 'instagram-login-exchange'));
    const tokens = await login.exchangeCode({
      code: 'AQB-ig-code',
      redirectUri: 'https://app.test/api/oauth/instagram/callback',
    });
    expect(tokens).toMatchObject({
      accessToken: 'IGAA-long',
      scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
    });
    expect(replay.remaining()).toEqual([]);
  });

  it('refreshes a token', async () => {
    const { login } = setup([
      {
        method: 'GET',
        url: 'https://graph.instagram.com/refresh_access_token',
        query: { grant_type: 'ig_refresh_token', access_token: 'IGAA-long' },
        status: 200,
        response: { access_token: 'IGAA-new', expires_in: 5183944 },
      },
    ]);
    const tokens = { accessToken: 'IGAA-long', refreshToken: null, expiresAt: null, scopes: ['x'] };
    expect(await login.refresh?.(tokens)).toMatchObject({ accessToken: 'IGAA-new', scopes: ['x'] });
  });

  it('the login is the account: one asset, posting with the login token', async () => {
    const me: RecordedCall = {
      method: 'GET',
      url: `${IG}/me`,
      status: 200,
      // user_id as a JSON number, as Meta sends it: it must survive parsing exactly.
      response:
        '{"user_id":17841400000000009,"username":"halden.roastery","name":"Halden Roastery",' +
        '"profile_picture_url":"https://scontent.example.test/r.jpg"}',
    };
    const { replay, login } = setup([me, me]);
    const tokens = {
      accessToken: 'IGAA-long',
      refreshToken: null,
      expiresAt: null,
      scopes: ['instagram_business_basic'],
    };
    expect(await login.getIdentity(tokens)).toEqual({
      externalUserId: '17841400000000009',
      displayName: 'Halden Roastery',
      avatarUrl: 'https://scontent.example.test/r.jpg',
    });
    expect(await login.listAssets(tokens)).toEqual([
      {
        network: 'instagram',
        externalId: '17841400000000009',
        displayName: 'Halden Roastery',
        username: 'halden.roastery',
        avatarUrl: 'https://scontent.example.test/r.jpg',
        token: null,
        meta: { via: 'instagram' },
        // Publishing wasn't granted.
        unavailableReason: 'missing_permission',
      },
    ]);
    // graph.instagram.com calls carry no appsecret_proof.
    expect(replay.seen[0]?.url.searchParams.has('appsecret_proof')).toBe(false);
  });
});

describe('Instagram validation', () => {
  const { instagram } = setup([]);
  const codes = (input: PublishInput) =>
    instagram.validate(input).map((i) => `${i.severity}:${i.code}`);

  it('accepts a normal feed post and a carousel of images and videos', () => {
    expect(codes(post())).toEqual([]);
    expect(codes(post({ media: [image('a'), video('v'), image('b')] }))).toEqual([]);
  });

  it('needs media and keeps to the caption limits', () => {
    expect(codes(post({ media: [] }))).toEqual([`error:${IssueCode.MEDIA_REQUIRED}`]);
    expect(codes(post({ text: 'x'.repeat(2201) }))).toEqual([`error:${IssueCode.TEXT_TOO_LONG}`]);
    const tags = Array.from({ length: 31 }, (_, i) => `#t${String(i)}`).join(' ');
    expect(codes(post({ text: tags }))).toEqual([`error:${IssueCode.TOO_MANY_HASHTAGS}`]);
    const mentions = Array.from({ length: 21 }, (_, i) => `@u${String(i)}`).join(' ');
    expect(codes(post({ text: mentions }))).toEqual([`error:${IssueCode.TOO_MANY_MENTIONS}`]);
  });

  it('checks image shape between 4:5 and 1.91:1', () => {
    const tall = instagram.validate(post({ media: [image('t', { width: 1080, height: 1920 })] }));
    expect(tall).toEqual([
      expect.objectContaining({
        code: IssueCode.ASPECT_RATIO,
        mediaId: 't',
        params: { min: 0.8, max: 1.91, actual: 0.56 },
      }),
    ]);
    expect(codes(post({ media: [image('w', { width: 1910, height: 1000 })] }))).toEqual([]);
    expect(codes(post({ media: [image('g', { kind: 'gif', mime: 'image/gif' })] }))).toEqual([
      `error:${IssueCode.MEDIA_KIND_NOT_SUPPORTED}`,
    ]);
  });

  it('reels are one video of 3 s to 15 min', () => {
    const reel = { instagram: { format: 'reel' as const } };
    expect(codes(post({ options: reel, media: [video('v')] }))).toEqual([]);
    expect(codes(post({ options: reel, media: [image('a')] }))).toEqual([
      `error:${IssueCode.FORMAT_NEEDS_VIDEO}`,
    ]);
    expect(codes(post({ options: reel, media: [video('v', { durationSec: 2 })] }))).toEqual([
      `error:${IssueCode.VIDEO_TOO_SHORT}`,
    ]);
    expect(codes(post({ options: reel, media: [video('a'), video('b')] }))).toEqual([
      `error:${IssueCode.TOO_MANY_MEDIA}`,
    ]);
  });

  it('stories are one file of any shape, videos up to 60 s, and show no caption or comment', () => {
    const story = { instagram: { format: 'story' as const } };
    expect(
      codes(post({ options: story, text: '', media: [image('t', { width: 1080, height: 1920 })] })),
    ).toEqual([]);
    expect(
      codes(post({ options: story, text: '', media: [video('v', { durationSec: 61 })] })),
    ).toEqual([`error:${IssueCode.VIDEO_TOO_LONG}`]);
    expect(codes(post({ options: story, firstComment: 'hi' }))).toEqual([
      `warning:${IssueCode.STORY_NO_CAPTION}`,
      `warning:${IssueCode.STORY_NO_COMMENT}`,
    ]);
  });

  it('warns that links are not clickable', () => {
    expect(codes(post({ link: 'https://halden.test' }))).toEqual([
      `warning:${IssueCode.LINK_NOT_CLICKABLE}`,
    ]);
  });
});

describe('Instagram publishing', () => {
  it('publishes one image through the linked Page, with caption and alt text', async () => {
    const { replay, instagram } = setup([
      ...created(FB, 'c1', {
        image_url: 'https://media.test/a.jpg',
        alt_text: 'Latte art',
        caption: 'Fresh roast today #coffee',
      }),
      ...published(FB, 'c1', 'm1'),
    ]);
    const result = await instagram.publish(
      post({ media: [image('a', { altText: 'Latte art' })] }),
      VIA_PAGE,
    );
    expect(result).toEqual({
      externalId: 'm1',
      permalink: 'https://www.instagram.com/p/m1/',
      warnings: [],
    });
    expect(replay.seen[0]?.body.appsecret_proof).toBeTruthy();
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  /** Instagram's resumable upload of a video's bytes (accounts reached through a Page). */
  const uploaded = (id: string, file: string, bytes: number): RecordedCall[] => [
    { method: 'GET', url: `https://storage.test/${file}`, status: 200, responseBytes: bytes },
    {
      method: 'POST',
      url: `https://rupload.facebook.com/ig-api-upload/v25.0/${id}`,
      requestHeaders: {
        authorization: 'OAuth EAA-page-101',
        offset: '0',
        file_size: String(bytes),
      },
      body: { bytes: String(bytes) },
      status: 200,
      response: { success: true, message: 'Upload successful.' },
    },
  ];

  it('uploads a Page-linked account’s video as bytes, waits, then publishes it as a reel', async () => {
    const { replay, instagram } = setup([
      {
        method: 'POST',
        url: `${FB}/${IG_ID}/media`,
        body: { media_type: 'REELS', share_to_feed: 'true', upload_type: 'resumable' },
        status: 200,
        response: { id: 'c2' },
      },
      ...uploaded('c2', 'v.mp4', 5000),
      ...created(FB, 'c2', {}, ['IN_PROGRESS', 'IN_PROGRESS', 'FINISHED']).slice(1),
      ...published(FB, 'c2', 'm2'),
    ]);
    await instagram.publish(post({ media: [video('v')] }), VIA_PAGE);
    // No public address involved: Instagram never fetched our URL.
    expect(replay.seen.some((r) => r.body.video_url)).toBe(false);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('Instagram Login accounts’ videos are fetched from the public address', async () => {
    const { replay, instagram } = setup([
      {
        method: 'POST',
        url: `${IG}/${VIA_IG.externalId}/media`,
        body: { media_type: 'REELS', video_url: 'https://media.test/v.mp4' },
        status: 200,
        response: { id: 'c3' },
      },
      { method: 'GET', url: `${IG}/c3`, status: 200, response: { status_code: 'FINISHED' } },
      ...published(IG, 'c3', 'm3', VIA_IG.externalId),
    ]);
    await instagram.publish(post({ media: [video('v')] }), VIA_IG);
    expect(replay.mismatches).toEqual([]);
  });

  it('without a public address, images fail with a clear reason before calling Instagram', async () => {
    const { replay, instagram } = setup([]);
    await expect(
      instagram.publish(post({ media: [image('a', { publicUrl: null })] }), VIA_PAGE),
    ).rejects.toMatchObject({ kind: 'content', networkCode: 'media_public_url_missing' });
    expect(replay.seen).toHaveLength(0);
  });

  it('builds a carousel: creates every child first, waits for all, then the carousel', async () => {
    const child = (id: string, body: Record<string, string>) => created(FB, id, body, []);
    const status = (id: string, code = 'FINISHED'): RecordedCall => ({
      method: 'GET',
      url: `${FB}/${id}`,
      query: { fields: 'status_code,status' },
      status: 200,
      response: { status_code: code },
    });
    const { replay, instagram } = setup([
      ...child('k1', { is_carousel_item: 'true', image_url: 'https://media.test/a.jpg' }),
      ...child('k2', {
        is_carousel_item: 'true',
        media_type: 'VIDEO',
        upload_type: 'resumable',
      }),
      ...uploaded('k2', 'v.mp4', 5000),
      status('k1'),
      status('k2', 'IN_PROGRESS'),
      status('k2'),
      ...created(FB, 'k3', {
        media_type: 'CAROUSEL',
        children: 'k1,k2',
        caption: 'Fresh roast today #coffee',
      }),
      ...published(FB, 'k3', 'm3'),
    ]);
    await instagram.publish(post({ media: [image('a'), video('v')] }), VIA_PAGE);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('one wait covers the whole publish, not each carousel item', async () => {
    let now = 0;
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const poll = (id: string, code: string): RecordedCall => ({
      method: 'GET',
      url: `${FB}/${id}`,
      status: 200,
      response: { status_code: code },
    });
    const replay = replayFetch([
      ...created(FB, 'k1', { image_url: 'https://media.test/a.jpg' }, []),
      ...created(FB, 'k2', { image_url: 'https://media.test/b.jpg' }, []),
      poll('k1', 'IN_PROGRESS'), // t=0
      poll('k1', 'FINISHED'), // t=600
      poll('k2', 'IN_PROGRESS'), // t=600
      // t=1200: past the 1000 ms budget of the publish. With a wait per item, k2 would still
      // have until 1600 and poll again (an unexpected call here).
      poll('k2', 'IN_PROGRESS'),
    ]);
    const instagram = createMetaAdapters({
      facebook: { appId: '1', appSecret: 's' },
      fetch: replay.fetch,
      instagramOptions: {
        maxWaitMs: 1000,
        pollIntervalMs: 600,
        sleep: (ms) => {
          now += ms;
          return Promise.resolve();
        },
      },
    }).networks.find((n) => n.id === 'instagram');
    try {
      await expect(
        instagram?.publish(post({ media: [image('a'), image('b')] }), VIA_PAGE),
      ).rejects.toMatchObject({ kind: 'retryable', networkCode: 'container_timeout' });
    } finally {
      clock.mockRestore();
    }
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('publishes a story without its caption', async () => {
    const { replay, instagram } = setup([
      ...created(FB, 's1', { media_type: 'STORIES', image_url: 'https://media.test/a.jpg' }),
      ...published(FB, 's1', 'm4'),
    ]);
    await instagram.publish(post({ options: { instagram: { format: 'story' } } }), VIA_PAGE);
    expect(replay.seen[0]?.body.caption).toBeUndefined();
    expect(replay.mismatches).toEqual([]);
  });

  it('uses graph.instagram.com and the login token for Instagram Login accounts', async () => {
    const { replay, instagram } = setup([
      {
        method: 'POST',
        url: `${IG}/${VIA_IG.externalId}/media`,
        status: 200,
        response: { id: 'c5' },
      },
      {
        method: 'GET',
        url: `${IG}/c5`,
        status: 200,
        response: { status_code: 'FINISHED' },
      },
      ...published(IG, 'c5', 'm5', VIA_IG.externalId),
    ]);
    await instagram.publish(post(), VIA_IG);
    expect(replay.seen[0]?.body.access_token).toBe('IGAA-long');
    expect(replay.seen[0]?.body.appsecret_proof).toBeUndefined();
    expect(replay.mismatches).toEqual([]);
  });

  it('adds the first comment; a refused one is a warning', async () => {
    const { instagram } = setup([
      ...created(FB, 'c6', { image_url: 'https://media.test/a.jpg' }),
      ...published(FB, 'c6', 'm6'),
      {
        method: 'POST',
        url: `${FB}/m6/comments`,
        body: { message: '#latte' },
        status: 400,
        response: { error: { message: 'Comments are turned off', code: 100 } },
      },
    ]);
    const result = await instagram.publish(post({ firstComment: '#latte' }), VIA_PAGE);
    expect(result.warnings).toEqual(["The first comment wasn't added: Comments are turned off"]);
  });

  it('a container Instagram rejects fails the post with the reason', async () => {
    const { instagram } = setup(
      created(FB, 'c7', { image_url: 'https://media.test/a.jpg' }, ['ERROR']).map((c) =>
        c.method === 'GET'
          ? { ...c, response: { status_code: 'ERROR', status: 'Error: 2207026' } }
          : c,
      ),
    );
    await expect(instagram.publish(post(), VIA_PAGE)).rejects.toMatchObject({
      kind: 'content',
      message: "Instagram couldn't process this file: Error: 2207026",
    });
  });

  it('a container still processing after the wait is retried later', async () => {
    const replay = replayFetch(
      created(FB, 'c8', { image_url: 'https://media.test/a.jpg' }, ['IN_PROGRESS']),
    );
    const meta = createMetaAdapters({
      facebook: { appId: '1', appSecret: 's' },
      fetch: replay.fetch,
      instagramOptions: { maxWaitMs: 0, sleep: () => Promise.resolve() },
    });
    const instagram = meta.networks.find((n) => n.id === 'instagram');
    await expect(instagram?.publish(post(), VIA_PAGE)).rejects.toMatchObject({
      kind: 'retryable',
      networkCode: 'container_timeout',
    });
  });

  it('the 100-posts-a-day limit is a rate limit', async () => {
    const { instagram } = setup([
      ...created(FB, 'c9', { image_url: 'https://media.test/a.jpg' }),
      ...fixture('meta', 'instagram-publish-limit'),
    ]);
    await expect(instagram.publish(post(), VIA_PAGE)).rejects.toMatchObject({
      kind: 'rate_limited',
      networkCode: '9/2207042',
    });
  });

  it('refuses an account whose login is no longer configured', async () => {
    const replay = replayFetch([]);
    const onlyFacebook = createMetaAdapters({
      facebook: { appId: '1', appSecret: 's' },
      fetch: replay.fetch,
    }).networks.find((n) => n.id === 'instagram');
    await expect(onlyFacebook?.publish(post(), VIA_IG)).rejects.toMatchObject({ kind: 'auth' });
  });
});
