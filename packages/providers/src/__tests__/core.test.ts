import { Network, type NetworkId } from '@socioboard/contracts';
import { describe, expect, it, vi } from 'vitest';

import {
  createHttpClient,
  createRegistry,
  kindFromStatus,
  NetworkNotEnabledError,
  ProviderError,
  redactUrl,
  retryAfterSec,
  type LoginAdapter,
  type NetworkAdapter,
} from '../index';
import { replayFetch } from '../testing/replay';

describe('ProviderError', () => {
  it('keeps what the worker decides on', () => {
    const err = new ProviderError({
      kind: 'rate_limited',
      message: 'Slow down',
      networkCode: '4',
      retryAfterSec: 30,
      status: 400,
    });
    expect(err).toBeInstanceOf(Error);
    expect(err).toMatchObject({ kind: 'rate_limited', networkCode: '4', retryAfterSec: 30 });
  });

  it('reads HTTP statuses the usual way', () => {
    expect(kindFromStatus(401)).toBe('auth');
    expect(kindFromStatus(429)).toBe('rate_limited');
    expect(kindFromStatus(400)).toBe('content');
    expect(kindFromStatus(503)).toBe('retryable');
  });
});

describe('http client', () => {
  it('never logs tokens, secrets or codes', () => {
    const url = redactUrl(
      'https://graph.facebook.com/v23.0/me?fields=id&access_token=EAAB123&client_secret=s&code=c&appsecret_proof=p',
    );
    expect(url).not.toMatch(/EAAB123|=s&|=c&|=p$/);
    expect(url).toContain('fields=id');
    expect(url).toContain('access_token=%5Bredacted%5D');
  });

  it('sends query, form and JSON bodies and parses JSON answers', async () => {
    const replay = replayFetch([
      {
        method: 'POST',
        url: 'https://api.example.test/v1/items',
        query: { fields: 'id' },
        body: { message: 'hi' },
        status: 200,
        response: { id: '1' },
      },
      {
        method: 'POST',
        url: 'https://api.example.test/v1/json',
        body: { count: '2' },
        status: 201,
        response: { ok: true },
      },
    ]);
    const http = createHttpClient({ name: 'example', fetch: replay.fetch });
    const form = await http.request<{ id: string }>({
      method: 'POST',
      url: 'https://api.example.test/v1/items',
      query: { fields: 'id', skip: undefined },
      form: { message: 'hi' },
    });
    expect(form).toMatchObject({ status: 200, ok: true, body: { id: '1' } });
    expect(replay.seen[0]?.url.searchParams.has('skip')).toBe(false);

    const json = await http.request({
      method: 'POST',
      url: 'https://api.example.test/v1/json',
      json: { count: 2 },
    });
    expect(json.status).toBe(201);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('keeps ids too large for a JS number exact, as strings', async () => {
    const replay = replayFetch([
      {
        method: 'GET',
        url: 'https://api.example.test/v1/me',
        status: 200,
        // Instagram user ids have 17 digits; as a JS number this one would become ...000008.
        response: '{"user_id":17841400000000009,"count":3,"ratio":1.5}',
      },
    ]);
    const http = createHttpClient({ name: 'example', fetch: replay.fetch });
    const res = await http.request({ url: 'https://api.example.test/v1/me' });
    expect(res.body).toEqual({ user_id: '17841400000000009', count: 3, ratio: 1.5 });
  });

  it('returns error answers for the adapter to read', async () => {
    const replay = replayFetch([
      {
        method: 'GET',
        url: 'https://api.example.test/v1/me',
        status: 400,
        response: { error: { code: 190 } },
      },
    ]);
    const http = createHttpClient({ name: 'example', fetch: replay.fetch });
    const res = await http.request({ url: 'https://api.example.test/v1/me' });
    expect(res).toMatchObject({ status: 400, ok: false, body: { error: { code: 190 } } });
  });

  it('turns no answer (timeout, connection failure) into a retryable error, logged without tokens', async () => {
    const logger = { debug: vi.fn(), warn: vi.fn() };
    const hang: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason as Error);
        });
      });
    const slow = createHttpClient({ name: 'example', fetch: hang, timeoutMs: 20, logger });
    const err = await slow
      .request({ url: 'https://api.example.test/v1/me?access_token=EAAB123' })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ProviderError);
    expect(err).toMatchObject({ kind: 'retryable', message: 'example did not answer in time' });
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('EAAB123');

    const down = createHttpClient({
      name: 'example',
      fetch: () => Promise.reject(new TypeError('fetch failed')),
    });
    await expect(down.request({ url: 'https://api.example.test/' })).rejects.toMatchObject({
      kind: 'retryable',
      message: 'Could not reach example',
    });
  });

  it('downloads files to upload: whole, by byte range, and within a size limit', async () => {
    const replay = replayFetch([
      { method: 'GET', url: 'https://storage.test/a.jpg', status: 200, responseBytes: 10 },
      {
        method: 'GET',
        url: 'https://storage.test/v.mp4',
        requestHeaders: { range: 'bytes=100-199' },
        status: 206,
        responseBytes: 100,
      },
      { method: 'GET', url: 'https://storage.test/big.jpg', status: 200, responseBytes: 50 },
      { method: 'GET', url: 'https://storage.test/gone.jpg', status: 404, response: 'no' },
    ]);
    const http = createHttpClient({ name: 'example', fetch: replay.fetch });
    expect((await http.download('https://storage.test/a.jpg')).byteLength).toBe(10);
    const chunk = await http.download('https://storage.test/v.mp4', {
      range: { start: 100, end: 200 },
    });
    expect(chunk.byteLength).toBe(100);
    await expect(
      http.download('https://storage.test/big.jpg', { maxBytes: 20 }),
    ).rejects.toMatchObject({
      kind: 'retryable',
      message: 'The file is larger than this upload allows',
    });
    await expect(http.download('https://storage.test/gone.jpg')).rejects.toMatchObject({
      kind: 'retryable',
      status: 404,
    });
    expect(replay.mismatches).toEqual([]);
  });

  it('reads Retry-After in seconds or as a date', () => {
    const now = Date.parse('2026-09-29T10:00:00Z');
    expect(retryAfterSec(new Headers({ 'retry-after': '30' }), now)).toBe(30);
    expect(
      retryAfterSec(new Headers({ 'retry-after': 'Tue, 29 Sep 2026 10:01:00 GMT' }), now),
    ).toBe(60);
    expect(retryAfterSec(new Headers(), now)).toBeNull();
  });
});

describe('replay', () => {
  it('reports calls the recording did not expect', async () => {
    const replay = replayFetch([]);
    const http = createHttpClient({ name: 'example', fetch: replay.fetch });
    await expect(http.request({ url: 'https://api.example.test/x' })).rejects.toThrow();
    expect(replay.mismatches).toEqual(['Unexpected call: GET https://api.example.test/x']);
  });
});

function network(id: NetworkId): NetworkAdapter {
  return {
    id,
    displayName: id,
    capabilities: { postTypes: ['text'], firstComment: false, altText: false },
    rules: {
      maxChars: 100,
      maxHashtags: null,
      maxMentions: null,
      media: {
        required: false,
        maxItems: 0,
        kinds: [],
        mixKinds: false,
        maxImageBytes: 1,
        imageAspectRatio: null,
        video: null,
      },
      links: 'text',
    },
    preview: {
      truncateAt: null,
      captionPosition: 'above_media',
      mediaLayout: 'grid',
      cropAspectRatio: null,
      linkCard: false,
    },
    validate: () => [],
    publish: () => Promise.reject(new Error('not in this test')),
  };
}

function login(id: LoginAdapter['id'], networks: NetworkId[]): LoginAdapter {
  return {
    id,
    networks,
    supportsAccountSelection: false,
    usesPkce: false,
    requiredScopes: [],
    getAuthUrl: () => 'https://example.test/auth',
    exchangeCode: () => Promise.reject(new Error('not in this test')),
    getIdentity: () => Promise.reject(new Error('not in this test')),
    listAssets: () => Promise.resolve([]),
  };
}

describe('registry', () => {
  const registry = createRegistry({
    logins: [login('facebook', ['facebook_page', 'instagram']), login('instagram', ['instagram'])],
    networks: [network('instagram'), network('facebook_page'), network('x')],
  });

  it('lists enabled networks in a fixed order, each with the logins that reach it', () => {
    const list = registry.networks();
    expect(list.map((n) => n.id)).toEqual(['facebook_page', 'instagram']);
    expect(list[1]?.logins.map((l) => l.provider)).toEqual(['facebook', 'instagram']);
    for (const n of list) expect(Network.safeParse(n).success).toBe(true);
  });

  it('refuses what is not configured', () => {
    // X has an adapter but no login configured.
    expect(registry.isEnabled('x')).toBe(false);
    expect(() => registry.network('x')).toThrow(NetworkNotEnabledError);
    expect(() => registry.login('linkedin')).toThrow(NetworkNotEnabledError);
    expect(registry.login('facebook').id).toBe('facebook');
  });
});
