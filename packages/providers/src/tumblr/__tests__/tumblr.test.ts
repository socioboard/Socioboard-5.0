import { describe, expect, it, vi } from 'vitest';
import { isProviderError } from '../../errors';
import type { HttpClient, HttpRequest, HttpResponse } from '../../http';
import { fixture, replayFetch, type RecordedCall } from '../../testing/replay';
import { IssueCode } from '../../validation';
import { createTumblrAdapters } from '../index';
import { createTumblrNetwork } from '../tumblr';

describe('Tumblr adapter unit tests', () => {
  const callback = 'http://localhost:5173/api/oauth/tumblr/callback';
  const adapters = createTumblrAdapters({
    tumblr: { clientId: 'test-client', clientSecret: 'test-secret' },
  });
  const [network] = adapters.networks;
  const [login] = adapters.logins;
  const recordedLogin = (calls: RecordedCall[]) => {
    const replay = replayFetch(calls);
    const [adapter] = createTumblrAdapters({
      tumblr: { clientId: 'test-client', clientSecret: 'test-secret' },
      fetch: replay.fetch,
    }).logins;
    if (!adapter) throw new Error('login missing');
    return { adapter, replay };
  };

  it('returns empty adapters when config is omitted', () => {
    const empty = createTumblrAdapters({});
    expect(empty.logins).toEqual([]);
    expect(empty.networks).toEqual([]);
  });

  it('generates a valid OAuth 2.0 authorization URL', () => {
    if (!login) throw new Error('login missing');
    const authUrl = login.getAuthUrl({
      state: 'test-state-abc',
      redirectUri: callback,
    });
    const url = new URL(authUrl);
    expect(url.origin).toBe('https://www.tumblr.com');
    expect(url.pathname).toBe('/oauth2/authorize');
    expect(url.searchParams.get('client_id')).toBe('test-client');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('test-state-abc');
    expect(url.searchParams.get('redirect_uri')).toBe(callback);
    expect(url.searchParams.get('scope')).toContain('basic');
    expect(url.searchParams.get('scope')).toContain('write');
  });

  it('exchanges the authorization code for renewable OAuth tokens', async () => {
    const { adapter, replay } = recordedLogin(fixture('tumblr', 'token-exchange'));
    const before = Date.now();
    const tokens = await adapter.exchangeCode({ code: 'tumblr-code', redirectUri: callback });

    expect(tokens).toMatchObject({
      accessToken: 'tumblr-access',
      refreshToken: 'tumblr-refresh',
      scopes: ['basic', 'write', 'offline_access'],
    });
    expect(tokens.expiresAt?.getTime()).toBeGreaterThan(before);
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('classifies rejected Tumblr client credentials as an authentication failure', async () => {
    const { adapter, replay } = recordedLogin(fixture('tumblr', 'error-invalid-client'));
    const error = await adapter
      .exchangeCode({ code: 'tumblr-code', redirectUri: callback })
      .catch((caught: unknown) => caught);

    expect(isProviderError(error) && error.kind).toBe('auth');
    expect(isProviderError(error) && error.networkCode).toBe('invalid_client');
    expect(replay.mismatches).toEqual([]);
    expect(replay.remaining()).toEqual([]);
  });

  it('uploads photos as NPF multipart data referenced by identifier', async () => {
    let sent: HttpRequest | undefined;
    const downloaded: { url: string; maxBytes: number | undefined }[] = [];
    const http: HttpClient = {
      request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        sent = request;
        return Promise.resolve({
          status: 201,
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          body: { response: { id_string: '712345678901234567' } } as T,
        });
      },
      download(url, options) {
        downloaded.push({ url, maxBytes: options?.maxBytes });
        return Promise.resolve(new Uint8Array([1, 2, 3]));
      },
      downloadFile() {
        return Promise.reject(new Error('unexpected video download'));
      },
    };
    const tumblr = createTumblrNetwork({ http });

    await tumblr.publish(
      {
        text: 'Fresh roast today',
        media: [
          {
            id: 'photo-1',
            kind: 'image',
            mime: 'image/jpeg',
            sizeBytes: 3,
            width: 800,
            height: 600,
            durationSec: null,
            altText: 'Coffee being poured',
            readUrl: 'https://storage.test/photo.jpg',
            publicUrl: 'https://media.test/photo.jpg',
          },
        ],
        link: null,
        firstComment: null,
        options: {},
      },
      {
        externalId: 'haldenroasters',
        accessToken: 'tumblr-access',
        meta: { blogName: 'haldenroasters', url: 'https://haldenroasters.tumblr.com/' },
      },
    );

    expect(downloaded).toEqual([
      { url: 'https://storage.test/photo.jpg', maxBytes: 10 * 1024 * 1024 },
    ]);
    expect(sent?.json).toBeUndefined();
    expect(sent?.headers).toEqual({ authorization: 'Bearer tumblr-access' });
    const form = sent?.multipart;
    expect(form).toBeInstanceOf(FormData);
    const jsonPart = form?.get('json');
    if (!jsonPart) throw new Error('JSON multipart field missing');
    const jsonStr = typeof jsonPart === 'string' ? jsonPart : await (jsonPart as Blob).text();
    expect(JSON.parse(jsonStr)).toEqual({
      content: [
        { type: 'text', text: 'Fresh roast today' },
        {
          type: 'image',
          media: [
            {
              type: 'image/jpeg',
              identifier: 'media-0',
              width: 800,
              height: 600,
            },
          ],
          alt_text: 'Coffee being poured',
        },
      ],
      state: 'published',
    });
    const mediaPart = form?.get('media-0');
    if (!(mediaPart instanceof File)) throw new Error('Photo multipart field missing');
    expect(mediaPart.name).toBe('media-0.jpg');
    expect(mediaPart.type).toBe('image/jpeg');
    expect(new Uint8Array(await mediaPart.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('uploads videos as file-backed NPF multipart data', async () => {
    let sent: HttpRequest | undefined;
    const cleanup = vi.fn(() => Promise.resolve());
    const http: HttpClient = {
      request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        sent = request;
        return Promise.resolve({
          status: 201,
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          body: { response: { id_string: '712345678901234568' } } as T,
        });
      },
      download() {
        return Promise.reject(new Error('unexpected buffered download'));
      },
      downloadFile(
        url: string,
        options: { maxBytes: number; type: string; timeoutMs?: number },
      ) {
        expect(url).toBe('https://storage.test/video.mp4');
        expect(options).toEqual({
          maxBytes: 500 * 1024 * 1024,
          type: 'video/mp4',
          timeoutMs: 10 * 60_000,
        });
        return Promise.resolve({
          blob: new Blob([new Uint8Array([4, 5, 6])], { type: options.type }),
          cleanup,
        });
      },
    };
    const tumblr = createTumblrNetwork({ http });

    await tumblr.publish(
      {
        text: 'Behind the scenes',
        media: [
          {
            id: 'video-1',
            kind: 'video',
            mime: 'video/mp4',
            sizeBytes: 3,
            width: 1920,
            height: 1080,
            durationSec: 12,
            altText: null,
            readUrl: 'https://storage.test/video.mp4',
            publicUrl: null,
          },
        ],
        link: null,
        firstComment: null,
        options: {},
      },
      {
        externalId: 'haldenroasters',
        accessToken: 'tumblr-access',
        meta: { blogName: 'haldenroasters' },
      },
    );

    expect(sent?.timeoutMs).toBe(10 * 60_000);
    const form = sent?.multipart;
    const jsonPart = form?.get('json');
    if (!jsonPart) throw new Error('JSON multipart field missing');
    const jsonStr = typeof jsonPart === 'string' ? jsonPart : await (jsonPart as Blob).text();
    expect(JSON.parse(jsonStr)).toEqual({
      content: [
        { type: 'text', text: 'Behind the scenes' },
        {
          type: 'video',
          media: {
            type: 'video/mp4',
            identifier: 'media-0',
            width: 1920,
            height: 1080,
          },
        },
      ],
      state: 'published',
    });
    const mediaPart = form?.get('media-0');
    if (!(mediaPart instanceof File)) throw new Error('Video multipart field missing');
    expect(mediaPart.name).toBe('media-0.mp4');
    expect(mediaPart.type).toBe('video/mp4');
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('uploads multiple photos in order with a weighted photoset layout', async () => {
    let sent: HttpRequest | undefined;
    const http: HttpClient = {
      request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        sent = request;
        return Promise.resolve({
          status: 201,
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          body: { response: { id_string: '712345678901234569' } } as T,
        });
      },
      download(url) {
        return Promise.resolve(new Uint8Array([Number(url.at(-5))]));
      },
      downloadFile() {
        return Promise.reject(new Error('unexpected video download'));
      },
    };
    const tumblr = createTumblrNetwork({ http });

    await tumblr.publish(
      {
        text: 'Three new arrivals',
        media: [1, 2, 3].map((number) => ({
          id: `photo-${String(number)}`,
          kind: 'image' as const,
          mime: 'image/jpeg',
          sizeBytes: 1,
          width: 800,
          height: 600,
          durationSec: null,
          altText: `Arrival ${String(number)}`,
          readUrl: `https://storage.test/photo-${String(number)}.jpg`,
          publicUrl: null,
        })),
        link: 'https://example.test/arrivals',
        firstComment: null,
        options: {},
      },
      {
        externalId: 'haldenroasters',
        accessToken: 'tumblr-access',
        meta: { blogName: 'haldenroasters' },
      },
    );

    const form = sent?.multipart;
    const jsonPart = form?.get('json');
    if (!jsonPart) throw new Error('JSON multipart field missing');
    const jsonStr = typeof jsonPart === 'string' ? jsonPart : await (jsonPart as Blob).text();
    const payload = JSON.parse(jsonStr) as {
      content: NpfTestBlock[];
      layout: unknown;
    };
    expect(payload.content.map((block) => block.type)).toEqual([
      'text',
      'image',
      'image',
      'image',
      'link',
    ]);
    expect(payload.content.slice(1, 4).map((block) => block.media?.[0]?.identifier)).toEqual([
      'media-0',
      'media-1',
      'media-2',
    ]);
    expect(payload.layout).toEqual([
      {
        type: 'rows',
        display: [
          { blocks: [0] },
          { blocks: [1, 2, 3], mode: { type: 'weighted' } },
          { blocks: [4] },
        ],
      },
    ]);
    if (!form) throw new Error('Multipart form missing');
    expect([...form.keys()]).toEqual(['json', 'media-0', 'media-1', 'media-2']);
  });

  it('validates required text when there is no media or link', () => {
    if (!network) throw new Error('network missing');
    const issues = network.validate({
      text: '   ',
      media: [],
      link: null,
      firstComment: null,
      options: {},
    });
    expect(issues.some((i) => i.code === IssueCode.EMPTY_POST)).toBe(true);
  });

  it('allows empty text when an image is present', () => {
    if (!network) throw new Error('network missing');
    const issues = network.validate({
      text: '',
      media: [
        {
          id: 'm1',
          kind: 'image',
          mime: 'image/jpeg',
          sizeBytes: 1024 * 1024,
          width: 800,
          height: 600,
          durationSec: null,
          altText: 'Sample photo',
        },
      ],
      link: null,
      firstComment: null,
      options: {},
    });
    expect(issues.filter((i) => i.code === IssueCode.EMPTY_POST)).toHaveLength(0);
  });

  it('rejects post when image count exceeds 10 items', () => {
    if (!network) throw new Error('network missing');
    const media = Array.from({ length: 11 }, (_, idx) => ({
      id: `m${idx}`,
      kind: 'image' as const,
      mime: 'image/jpeg',
      sizeBytes: 500 * 1024,
      width: 800,
      height: 600,
      durationSec: null,
      altText: null,
    }));

    const issues = network.validate({
      text: 'Too many images',
      media,
      link: null,
      firstComment: null,
      options: {},
    });
    expect(issues.some((i) => i.code === IssueCode.TOO_MANY_MEDIA)).toBe(true);
  });
});

interface NpfTestBlock {
  type: string;
  media?: { identifier?: string }[];
}
