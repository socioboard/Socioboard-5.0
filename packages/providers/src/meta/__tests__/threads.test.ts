// P3-B10: the Threads login and network beyond the shared contract: the token exchange, every
// post shape (text with a link card, one file, a carousel), who can reply, the first comment as a
// reply, and Threads' way of counting emoji. Shapes follow the Threads API reference
// (graph.threads.net/v1.0, checked 2026-10-07).
import { describe, expect, it } from 'vitest';

import { isProviderError } from '../../errors';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import type { AccountCredentials, PublishInput, PublishMedia } from '../../types';
import { IssueCode } from '../../validation';
import { createMetaAdapters, THREADS_SCOPES, threadsTextLength } from '../index';

const TH = 'https://graph.threads.net/v1.0';
const ID = '25000000000000001';
const ACCOUNT: AccountCredentials = { externalId: ID, accessToken: 'THQ-long', meta: {} };

function setup(calls: RecordedCall[]) {
  const replay = replayFetch(calls);
  const meta = createMetaAdapters({
    threads: { appId: '770011', appSecret: 'th-secret' },
    fetch: replay.fetch,
    threadsOptions: { pollIntervalMs: 0, sleep: () => Promise.resolve() },
  });
  const login = meta.logins.find((l) => l.id === 'threads');
  const threads = meta.networks.find((n) => n.id === 'threads');
  if (!login || !threads) throw new Error('threads adapters missing');
  return { replay, login, threads };
}

const image = (id: string): PublishMedia => ({
  id,
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 300_000,
  width: 1080,
  height: 1080,
  durationSec: null,
  altText: null,
  readUrl: `https://storage.test/${id}.jpg`,
  publicUrl: `https://media.test/${id}.jpg`,
});
const post = (overrides: Partial<PublishInput> = {}): PublishInput => ({
  text: 'Fresh roast today',
  media: [],
  link: null,
  firstComment: null,
  options: {},
  ...overrides,
});
const ready = (id: string): RecordedCall => ({
  method: 'GET',
  url: `${TH}/${id}`,
  status: 200,
  response: { status: 'FINISHED', id },
});
const publishCall = (creation: string, id: string): RecordedCall => ({
  method: 'POST',
  url: `${TH}/${ID}/threads_publish`,
  body: { creation_id: creation },
  status: 200,
  response: { id },
});
const permalink = (id: string): RecordedCall => ({
  method: 'GET',
  url: `${TH}/${id}`,
  status: 200,
  response: { permalink: `https://www.threads.net/@halden.coffee/post/${id}`, id },
});
const container = (body: Record<string, string>, id: string): RecordedCall => ({
  method: 'POST',
  url: `${TH}/${ID}/threads`,
  body,
  status: 200,
  response: { id },
});

describe('Threads login', () => {
  it('asks threads.net for the profile, publishing and reply permissions', () => {
    const { login } = setup([]);
    const url = new URL(
      login.getAuthUrl({ state: 's1', redirectUri: 'https://app.test/api/oauth/threads/callback' }),
    );
    expect(url.origin + url.pathname).toBe('https://threads.net/oauth/authorize');
    expect(url.searchParams.get('client_id')).toBe('770011');
    expect(url.searchParams.get('scope')).toBe(THREADS_SCOPES.join(','));
    expect(url.searchParams.get('response_type')).toBe('code');
  });

  it('trades the code for a 60-day token', async () => {
    const { replay, login } = setup(fixture('meta', 'threads-login-exchange'));
    const tokens = await login.exchangeCode({
      code: 'AQB-threads-code',
      redirectUri: 'https://app.test/api/oauth/threads/callback',
    });
    expect(replay.mismatches).toEqual([]);
    expect(tokens.accessToken).toBe('THQ-long');
    expect(tokens.scopes).toEqual([...THREADS_SCOPES]);
    const days = ((tokens.expiresAt?.getTime() ?? 0) - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(59);
  });

  it('a refused code means signing in again', async () => {
    const { login } = setup([
      {
        method: 'POST',
        url: 'https://graph.threads.net/oauth/access_token',
        status: 400,
        response: {
          error_type: 'OAuthException',
          code: 400,
          error_message: 'Matching code was not found or was already used',
        },
      },
    ]);
    const err = await login
      .exchangeCode({ code: 'used', redirectUri: 'https://app.test/cb' })
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('auth');
    expect(isProviderError(err) && err.message).toBe(
      'Matching code was not found or was already used',
    );
  });

  it('refreshes a long-lived token for another 60 days', async () => {
    const { replay, login } = setup([
      {
        method: 'GET',
        url: 'https://graph.threads.net/refresh_access_token',
        query: { grant_type: 'th_refresh_token', access_token: 'THQ-long' },
        status: 200,
        response: { access_token: 'THQ-renewed', token_type: 'bearer', expires_in: 5183944 },
      },
    ]);
    const renewed = await login.refresh?.({
      accessToken: 'THQ-long',
      refreshToken: null,
      expiresAt: new Date(),
      scopes: [...THREADS_SCOPES],
    });
    expect(replay.mismatches).toEqual([]);
    expect(renewed?.accessToken).toBe('THQ-renewed');
  });
});

describe('Threads publishing', () => {
  it('a text post with a link uses Threads’ link card, and who can reply', async () => {
    const { replay, threads } = setup([
      container(
        {
          media_type: 'TEXT',
          text: 'New menu',
          link_attachment: 'https://halden.test/menu',
          reply_control: 'followers_only',
        },
        'c1',
      ),
      ready('c1'),
      publishCall('c1', 'm1'),
      permalink('m1'),
    ]);
    const result = await threads.publish(
      post({
        text: 'New menu',
        link: 'https://halden.test/menu',
        options: { threads: { replyControl: 'followers_only' } },
      }),
      ACCOUNT,
    );
    expect(replay.mismatches).toEqual([]);
    expect(result).toMatchObject({
      externalId: 'm1',
      permalink: 'https://www.threads.net/@halden.coffee/post/m1',
      warnings: [],
    });
  });

  it('one photo: the link goes at the end of the text (no card with media)', async () => {
    const { replay, threads } = setup([
      container(
        {
          media_type: 'IMAGE',
          image_url: 'https://media.test/a.jpg',
          text: 'Latte art\n\nhttps://halden.test',
        },
        'c1',
      ),
      ready('c1'),
      publishCall('c1', 'm1'),
      permalink('m1'),
    ]);
    await threads.publish(
      post({ text: 'Latte art', media: [image('a')], link: 'https://halden.test' }),
      ACCOUNT,
    );
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('several files make a carousel: items first, then the carousel with the text', async () => {
    const { replay, threads } = setup([
      container(
        { media_type: 'IMAGE', image_url: 'https://media.test/a.jpg', is_carousel_item: 'true' },
        'i1',
      ),
      container(
        { media_type: 'IMAGE', image_url: 'https://media.test/b.jpg', is_carousel_item: 'true' },
        'i2',
      ),
      ready('i1'),
      ready('i2'),
      container({ media_type: 'CAROUSEL', children: 'i1,i2', text: 'Two roasts' }, 'c1'),
      ready('c1'),
      publishCall('c1', 'm1'),
      permalink('m1'),
    ]);
    await threads.publish(post({ text: 'Two roasts', media: [image('a'), image('b')] }), ACCOUNT);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('the first comment is a reply to the post', async () => {
    const { replay, threads } = setup([
      container({ media_type: 'TEXT', text: 'Fresh roast today' }, 'c1'),
      ready('c1'),
      publishCall('c1', 'm1'),
      permalink('m1'),
      container({ media_type: 'TEXT', text: '#coffee', reply_to_id: 'm1' }, 'r1'),
      ready('r1'),
      publishCall('r1', 'm2'),
    ]);
    const result = await threads.publish(post({ firstComment: '#coffee' }), ACCOUNT);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('a reply Threads refuses leaves the post published, with a warning', async () => {
    const { threads } = setup([
      container({ media_type: 'TEXT', text: 'Fresh roast today' }, 'c1'),
      ready('c1'),
      publishCall('c1', 'm1'),
      permalink('m1'),
      {
        method: 'POST',
        url: `${TH}/${ID}/threads`,
        status: 400,
        response: { error: { message: '(#200) Requires threads_manage_replies', code: 200 } },
      },
    ]);
    const result = await threads.publish(post({ firstComment: '#coffee' }), ACCOUNT);
    expect(result.externalId).toBe('m1');
    expect(result.warnings).toEqual([
      "The first comment wasn't added: (#200) Requires threads_manage_replies",
    ]);
  });

  it('a container Threads can’t process is a content problem', async () => {
    const { threads } = setup([
      container({ media_type: 'IMAGE', image_url: 'https://media.test/a.jpg' }, 'c1'),
      {
        method: 'GET',
        url: `${TH}/c1`,
        status: 200,
        response: { status: 'ERROR', error_message: 'Unsupported image format', id: 'c1' },
      },
    ]);
    const err = await threads
      .publish(post({ text: '', media: [image('a')] }), ACCOUNT)
      .catch((e: unknown) => e);
    expect(isProviderError(err) && err.kind).toBe('content');
    expect(isProviderError(err) && err.message).toContain('Unsupported image format');
  });
});

describe('Threads validation', () => {
  it('counts an emoji as its UTF-8 bytes, as Threads does', () => {
    expect(threadsTextLength('abc')).toBe(3);
    expect(threadsTextLength('☕')).toBe(3);
    expect(threadsTextLength('😀')).toBe(4);
    const { threads } = setup([]);
    // 490 letters and 3 emoji: 493 characters, but 502 by Threads' count.
    const issues = threads.validate(post({ text: `${'a'.repeat(490)}😀😀😀` }));
    expect(issues.map((i) => i.code)).toContain(IssueCode.TEXT_TOO_LONG);
    expect(threads.validate(post({ text: 'a'.repeat(500) }))).toEqual([]);
  });

  it('refuses an empty post and warns that a link loses its card next to media', () => {
    const { threads } = setup([]);
    expect(threads.validate(post({ text: '' })).map((i) => i.code)).toContain(IssueCode.EMPTY_POST);
    const issues = threads.validate(post({ media: [image('a')], link: 'https://halden.test' }));
    expect(issues.map((i) => [i.severity, i.code])).toEqual([
      ['warning', IssueCode.LINK_CARD_DROPPED],
    ]);
  });

  it('takes up to 20 files', () => {
    const { threads } = setup([]);
    const many = Array.from({ length: 21 }, (_, i) => image(`m${String(i)}`));
    expect(threads.validate(post({ media: many })).map((i) => i.code)).toContain(
      IssueCode.TOO_MANY_MEDIA,
    );
  });
});
