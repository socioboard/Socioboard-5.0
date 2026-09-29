import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { ProviderError } from '../../errors';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type { ContentMedia, PublishInput, PublishMedia } from '../../types';
import { IssueCode } from '../../validation';
import { classifyGraphError, createMetaAdapters, FACEBOOK_SCOPES } from '../index';

const APP = { appId: '1234567890', appSecret: 'app-secret' };
const REDIRECT = 'https://app.test/api/oauth/facebook/callback';
const G = 'https://graph.facebook.com/v25.0';
const PAGE = { externalId: '101', accessToken: 'EAA-page-101', meta: {} };

function setup(calls: RecordedCall[], configId?: string) {
  const replay = replayFetch(calls);
  const meta = createMetaAdapters({
    facebook: { ...APP, configId },
    fetch: replay.fetch,
  });
  const [login] = meta.logins;
  const [page] = meta.networks;
  if (!login || !page) throw new Error('facebook adapters missing');
  return { replay, login, page };
}

const image = (id: string, extra: Partial<PublishMedia> = {}): PublishMedia => ({
  id,
  kind: 'image',
  mime: 'image/jpeg',
  url: `https://media.test/${id}.jpg`,
  sizeBytes: 200_000,
  width: 1080,
  height: 1080,
  durationSec: null,
  altText: null,
  ...extra,
});
const video = (id: string, extra: Partial<ContentMedia> = {}): PublishMedia => ({
  ...image(id),
  kind: 'video',
  mime: 'video/mp4',
  url: `https://media.test/${id}.mp4`,
  durationSec: 30,
  ...extra,
});
const post = (extra: Partial<PublishInput> = {}): PublishInput => ({
  text: 'Fresh roast today',
  media: [],
  link: null,
  firstComment: null,
  options: {},
  ...extra,
});
const permalink = (id: string, url = `https://www.facebook.com/${id}`): RecordedCall => ({
  method: 'GET',
  url: `${G}/${id}`,
  query: { fields: 'permalink_url' },
  status: 200,
  response: { permalink_url: url, id },
});

describe('Facebook login', () => {
  it('asks for the Login for Business configuration, or the scopes when none is set', () => {
    const withConfig = new URL(
      setup([], 'cfg-42').login.getAuthUrl({ state: 's1', redirectUri: REDIRECT }),
    );
    expect(withConfig.origin + withConfig.pathname).toBe(
      'https://www.facebook.com/v25.0/dialog/oauth',
    );
    expect(Object.fromEntries(withConfig.searchParams)).toEqual({
      client_id: APP.appId,
      redirect_uri: REDIRECT,
      state: 's1',
      response_type: 'code',
      config_id: 'cfg-42',
      auth_type: 'rerequest',
    });
    const withScopes = new URL(setup([]).login.getAuthUrl({ state: 's1', redirectUri: REDIRECT }));
    expect(withScopes.searchParams.get('scope')).toBe(FACEBOOK_SCOPES.join(','));
    expect(withScopes.searchParams.has('config_id')).toBe(false);
  });

  it('trades the code for a 60-day token and keeps only the permissions granted', async () => {
    const { replay, login } = setup(fixture('meta', 'oauth-exchange'));
    const tokens = await login.exchangeCode({ code: 'AQD-code', redirectUri: REDIRECT });
    expect(tokens.accessToken).toBe('EAA-long');
    expect(tokens.refreshToken).toBeNull();
    const days = ((tokens.expiresAt?.getTime() ?? 0) - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(59);
    expect(tokens.scopes).toContain('pages_manage_posts');
    expect(tokens.scopes).not.toContain('instagram_content_publish');
    // The app secret travels only to the token endpoint, never with a user token.
    const permissions = replay.seen[2]?.url;
    expect(permissions?.searchParams.has('client_secret')).toBe(false);
    expect(permissions?.searchParams.get('appsecret_proof')).toBe(
      createHmac('sha256', APP.appSecret).update('EAA-long').digest('hex'),
    );
    expect(replay.remaining()).toEqual([]);
  });

  it('treats a code Meta refuses as "sign in again"', async () => {
    const { login } = setup([
      {
        method: 'GET',
        url: `${G}/oauth/access_token`,
        status: 400,
        response: { error: { message: 'This authorization code has expired.', code: 100 } },
      },
    ]);
    await expect(login.exchangeCode({ code: 'old', redirectUri: REDIRECT })).rejects.toMatchObject({
      kind: 'auth',
      message: 'This authorization code has expired.',
    });
  });

  it('says who signed in', async () => {
    const { login } = setup([
      {
        method: 'GET',
        url: `${G}/me`,
        status: 200,
        response: {
          id: '9001',
          name: 'Priya Rao',
          picture: { data: { url: 'https://scontent.example.test/priya.jpg' } },
        },
      },
    ]);
    const tokens = { accessToken: 'EAA-long', refreshToken: null, expiresAt: null, scopes: [] };
    expect(await login.getIdentity(tokens)).toEqual({
      externalUserId: '9001',
      displayName: 'Priya Rao',
      avatarUrl: 'https://scontent.example.test/priya.jpg',
    });
  });

  it('lists Pages across result pages, with linked Instagram accounts and what can’t be used', async () => {
    const { replay, login } = setup(fixture('meta', 'me-accounts'));
    const tokens = {
      accessToken: 'EAA-long',
      refreshToken: null,
      expiresAt: null,
      scopes: ['pages_show_list', 'pages_manage_posts', 'instagram_basic'],
    };
    const assets = await login.listAssets(tokens);
    expect(assets.map((a) => [a.network, a.externalId, a.unavailableReason])).toEqual([
      ['facebook_page', '101', null],
      // instagram_content_publish wasn't granted.
      ['instagram', '17841400000000001', 'missing_permission'],
      // Only ANALYZE on this Page: can't post as it.
      ['facebook_page', '102', 'missing_permission'],
    ]);
    // The fixture's second Page name ends in a space, as a real one did.
    expect(assets[2]?.displayName).toBe('Halden Roastery');
    expect(assets[0]).toMatchObject({
      displayName: 'Halden Coffee',
      username: 'haldencoffee',
      token: { accessToken: 'EAA-page-101', expiresAt: null },
    });
    expect(assets[1]).toMatchObject({
      username: 'halden.coffee',
      token: { accessToken: 'EAA-page-101' },
      meta: { via: 'facebook', pageId: '101' },
    });
    // The paging URL carried the token; it is sent once, with a proof.
    const second = replay.seen[1]?.url;
    expect(second?.searchParams.getAll('access_token')).toEqual(['EAA-long']);
    expect(second?.searchParams.get('appsecret_proof')).toBeTruthy();
    expect(replay.remaining()).toEqual([]);
  });
});

describe('Facebook login: safety and edge cases', () => {
  const tokens = {
    accessToken: 'EAA-long',
    refreshToken: null,
    expiresAt: null,
    scopes: ['pages_show_list', 'pages_manage_posts'],
  };

  it('never follows a paging link to another host (the token would go with it)', async () => {
    const { replay, login } = setup([
      {
        method: 'GET',
        url: `${G}/me/accounts`,
        status: 200,
        response: {
          data: [
            { id: '101', name: 'Halden Coffee', access_token: 'EAA-page-101', tasks: ['MANAGE'] },
          ],
          paging: { next: 'https://evil.example.test/steal?access_token=EAA-long&after=x' },
        },
      },
    ]);
    await expect(login.listAssets(tokens)).rejects.toMatchObject({ kind: 'retryable' });
    expect(replay.seen.map((r) => r.url.host)).toEqual(['graph.facebook.com']);
  });

  it('a Page whose tasks Meta leaves out is offered, not blocked', async () => {
    const { login } = setup([
      {
        method: 'GET',
        url: `${G}/me/accounts`,
        status: 200,
        response: { data: [{ id: '103', name: 'No tasks', access_token: 'EAA-page-103' }] },
      },
    ]);
    const [page] = await login.listAssets(tokens);
    expect(page?.unavailableReason).toBeNull();
  });
});

describe('Facebook Page validation', () => {
  const { page } = setup([]);
  const codes = (input: PublishInput) => page.validate(input).map((i) => `${i.severity}:${i.code}`);

  it('accepts a normal post', () => {
    expect(page.validate(post({ media: [image('a'), image('b')] }))).toEqual([]);
  });

  it('needs something to post', () => {
    expect(codes(post({ text: '  ' }))).toEqual([`error:${IssueCode.EMPTY_POST}`]);
    expect(codes(post({ text: '', link: 'https://halden.test' }))).toEqual([]);
  });

  it('checks length, media count, kinds, sizes and video length', () => {
    expect(codes(post({ text: 'x'.repeat(63_207) }))).toEqual([`error:${IssueCode.TEXT_TOO_LONG}`]);
    const eleven = Array.from({ length: 11 }, (_, i) => image(String(i)));
    expect(codes(post({ media: eleven }))).toEqual([`error:${IssueCode.TOO_MANY_MEDIA}`]);
    expect(codes(post({ media: [image('a'), video('v')] }))).toEqual([
      `error:${IssueCode.MEDIA_MIXED}`,
    ]);
    expect(codes(post({ media: [image('g', { kind: 'gif', mime: 'image/gif' })] }))).toEqual([
      `error:${IssueCode.MEDIA_KIND_NOT_SUPPORTED}`,
    ]);
    const big = page.validate(post({ media: [image('big', { sizeBytes: 11 * 1024 * 1024 })] }));
    expect(big).toEqual([
      expect.objectContaining({ code: IssueCode.IMAGE_TOO_LARGE, mediaId: 'big', field: 'media' }),
    ]);
    expect(codes(post({ media: [video('long', { durationSec: 5 * 60 * 60 })] }))).toEqual([
      `error:${IssueCode.VIDEO_TOO_LONG}`,
    ]);
    // Unknown duration (no ffmpeg) is not held against the video.
    expect(codes(post({ media: [video('v', { durationSec: null })] }))).toEqual([]);
  });

  it('warns that a link card is dropped when media are attached', () => {
    expect(codes(post({ link: 'https://halden.test', media: [image('a')] }))).toEqual([
      `warning:${IssueCode.LINK_CARD_DROPPED}`,
    ]);
  });
});

describe('Facebook Page publishing', () => {
  it('posts text with a link card', async () => {
    const { replay, page } = setup([
      {
        method: 'POST',
        url: `${G}/101/feed`,
        body: { message: 'Fresh roast today', link: 'https://halden.test' },
        status: 200,
        response: { id: '101_555' },
      },
      permalink('101_555'),
    ]);
    const result = await page.publish(post({ link: 'https://halden.test' }), PAGE);
    expect(result).toEqual({
      externalId: '101_555',
      permalink: 'https://www.facebook.com/101_555',
      warnings: [],
    });
    expect(replay.seen[0]?.body.access_token).toBe('EAA-page-101');
    expect(replay.remaining()).toEqual([]);
  });

  it('posts one photo with its caption and alt text, adding the link to the caption', async () => {
    const { replay, page } = setup([
      {
        method: 'POST',
        url: `${G}/101/photos`,
        body: {
          url: 'https://media.test/a.jpg',
          caption: 'Fresh roast today\n\nhttps://halden.test',
          alt_text_custom: 'A cup of coffee',
        },
        status: 200,
        response: { id: '777', post_id: '101_777' },
      },
      permalink('101_777'),
    ]);
    const result = await page.publish(
      post({ link: 'https://halden.test', media: [image('a', { altText: 'A cup of coffee' })] }),
      PAGE,
    );
    expect(result.externalId).toBe('101_777');
    expect(replay.remaining()).toEqual([]);
  });

  it('posts several photos as one post, in order', async () => {
    const { replay, page } = setup([
      {
        method: 'POST',
        url: `${G}/101/photos`,
        body: { url: 'https://media.test/a.jpg', published: 'false' },
        status: 200,
        response: { id: 'p1' },
      },
      {
        method: 'POST',
        url: `${G}/101/photos`,
        body: { url: 'https://media.test/b.jpg', published: 'false' },
        status: 200,
        response: { id: 'p2' },
      },
      {
        method: 'POST',
        url: `${G}/101/feed`,
        body: {
          message: 'Fresh roast today',
          'attached_media[0]': '{"media_fbid":"p1"}',
          'attached_media[1]': '{"media_fbid":"p2"}',
        },
        status: 200,
        response: { id: '101_888' },
      },
      permalink('101_888'),
    ]);
    const result = await page.publish(post({ media: [image('a'), image('b')] }), PAGE);
    expect(result.externalId).toBe('101_888');
    expect(replay.mismatches).toEqual([]);
  });

  it('posts a video through graph-video from its public URL', async () => {
    const { replay, page } = setup([
      {
        method: 'POST',
        url: 'https://graph-video.facebook.com/v25.0/101/videos',
        body: { file_url: 'https://media.test/v.mp4', description: 'Fresh roast today' },
        status: 200,
        response: { id: 'vid9' },
      },
      permalink('vid9', '/haldencoffee/videos/vid9/'),
    ]);
    const result = await page.publish(post({ media: [video('v')] }), PAGE);
    expect(result).toMatchObject({
      externalId: 'vid9',
      permalink: 'https://www.facebook.com/haldencoffee/videos/vid9/',
    });
    expect(replay.mismatches).toEqual([]);
  });

  it('adds the first comment, and a refused comment is a warning, not a failure', async () => {
    const created: RecordedCall = {
      method: 'POST',
      url: `${G}/101/feed`,
      status: 200,
      response: { id: '101_1' },
    };
    const ok = setup([
      created,
      permalink('101_1'),
      {
        method: 'POST',
        url: `${G}/101_1/comments`,
        body: { message: '#coffee #roast' },
        status: 200,
        response: { id: 'c1' },
      },
    ]);
    expect(
      (await ok.page.publish(post({ firstComment: '#coffee #roast' }), PAGE)).warnings,
    ).toEqual([]);

    const refused = setup([
      created,
      permalink('101_1'),
      {
        method: 'POST',
        url: `${G}/101_1/comments`,
        status: 403,
        response: { error: { message: '(#200) Requires pages_manage_engagement', code: 200 } },
      },
    ]);
    const result = await refused.page.publish(post({ firstComment: '#coffee' }), PAGE);
    expect(result.externalId).toBe('101_1');
    expect(result.warnings).toEqual([
      "The first comment wasn't added: (#200) Requires pages_manage_engagement",
    ]);
  });

  it('still succeeds when the permalink lookup fails', async () => {
    const { page } = setup([
      { method: 'POST', url: `${G}/101/feed`, status: 200, response: { id: '101_2' } },
      { method: 'GET', url: `${G}/101_2`, status: 500, response: { error: { code: 2 } } },
    ]);
    expect((await page.publish(post(), PAGE)).permalink).toBe('https://www.facebook.com/101_2');
  });

  it.each([
    ['error-expired-token', 'auth', '190/463'],
    ['error-rate-limit', 'rate_limited', '32'],
    ['error-content', 'content', '100'],
    ['error-server', 'retryable', '2'],
  ])('classifies %s as %s', async (name, kind, networkCode) => {
    const { page } = setup(fixture('meta', name));
    const err = await page.publish(post(), PAGE).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ProviderError);
    expect(err).toMatchObject({ kind, networkCode });
  });

  it('shows Meta’s user-facing message when it gives one', async () => {
    const { page } = setup(fixture('meta', 'error-content'));
    await expect(page.publish(post(), PAGE)).rejects.toMatchObject({
      message: 'This post goes against our Community Standards.',
    });
  });

  it('deletes a post', async () => {
    const { replay, page } = setup([
      { method: 'DELETE', url: `${G}/101_1`, status: 200, response: { success: true } },
    ]);
    await page.deletePost?.('101_1', PAGE);
    expect(replay.remaining()).toEqual([]);
  });
});

describe('classifyGraphError', () => {
  it('reads permission errors as reconnect, and bodies without an error by status', () => {
    expect(classifyGraphError(403, { error: { code: 200, message: 'x' } }).kind).toBe('auth');
    expect(classifyGraphError(400, { error: { code: 613, message: 'x' } }).kind).toBe(
      'rate_limited',
    );
    expect(classifyGraphError(502, '<html>Bad gateway</html>')).toEqual({
      kind: 'retryable',
      networkCode: null,
      message: 'Meta answered HTTP 502',
    });
  });
});
