import { describe, expect, it } from 'vitest';

import { ProviderError } from '../../errors';
import { createHttpClient, type HttpClient, type HttpRequest, type HttpResponse } from '../../http';
import { replayFetch, type RecordedCall } from '../../testing/replay';
import type { PublishInput, PublishMedia, TokenSet } from '../../types';
import {
  createYouTubeAdapters,
  queryUploadStatus,
  uploadYouTubeVideo,
  YOUTUBE_MAX_TITLE_CHARS,
  YOUTUBE_RATE_LIMITS,
  YouTubeIssueCode,
} from '../index';

const video: PublishMedia = {
  id: 'v1',
  kind: 'video',
  mime: 'video/mp4',
  sizeBytes: 1024,
  width: 1920,
  height: 1080,
  durationSec: 10,
  altText: null,
  readUrl: 'https://storage.test/v.mp4',
  publicUrl: 'https://media.test/v.mp4',
};

const photo: PublishMedia = {
  id: 'p1',
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 1024,
  width: 1080,
  height: 1080,
  durationSec: null,
  altText: null,
  readUrl: 'https://storage.test/p.jpg',
  publicUrl: 'https://media.test/p.jpg',
};

describe('YouTube adapter', () => {
  const { logins, networks } = createYouTubeAdapters({
    youtube: { clientId: 'client', clientSecret: 'secret' },
  });
  const [login] = logins;
  const [network] = networks;

  if (!login || !network) throw new Error('adapters missing');

  describe('sign-in and scopes', () => {
    it('provides auth URL with offline access, pkce and required scopes', () => {
      const url = new URL(
        login.getAuthUrl({
          state: 'st1',
          redirectUri: 'http://localhost:5173/callback',
          forceAccountSelection: true,
          pkce: { challenge: 'challenge-code', verifier: 'verifier-code' },
        }),
      );
      expect(url.searchParams.get('access_type')).toBe('offline');
      expect(url.searchParams.get('prompt')).toContain('select_account');
      expect(url.searchParams.get('scope')).toContain('youtube.upload');
      expect(url.searchParams.get('scope')).toContain('youtube.readonly');
      expect(url.searchParams.get('code_challenge')).toBe('challenge-code');
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('refreshes expired tokens preserving existing refresh token', async () => {
      const calls: RecordedCall[] = [
        {
          method: 'POST',
          url: 'https://oauth2.googleapis.com/token',
          status: 200,
          response: {
            access_token: 'new-access-token',
            expires_in: 3600,
            scope: 'https://www.googleapis.com/auth/youtube.upload',
          },
        },
      ];
      const [customLogin] = createYouTubeAdapters({
        youtube: { clientId: 'client', clientSecret: 'secret' },
        fetch: replayFetch(calls).fetch,
      }).logins;
      if (!customLogin?.refresh) throw new Error('customLogin.refresh missing');

      const tokens: TokenSet = {
        accessToken: 'old-access',
        refreshToken: 'my-refresh-token',
        expiresAt: new Date(Date.now() - 10_000),
        scopes: ['https://www.googleapis.com/auth/youtube.upload'],
      };

      const refreshed = await customLogin.refresh(tokens);
      expect(refreshed.accessToken).toBe('new-access-token');
      expect(refreshed.refreshToken).toBe('my-refresh-token');
      expect(refreshed.scopes).toContain('https://www.googleapis.com/auth/youtube.upload');
    });

    it('lists channel assets and reads identity', async () => {
      const channelCall: RecordedCall = {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/channels',
        query: { part: 'snippet', mine: 'true' },
        status: 200,
        response: {
          items: [
            {
              id: 'UC_TEST_CHANNEL_123',
              snippet: {
                title: 'Test Channel Name',
                description: 'Channel bio',
                customUrl: '@testchannel',
                thumbnails: {
                  default: { url: 'https://yt.test/avatar.jpg' },
                },
              },
            },
          ],
        },
      };

      const [customLogin] = createYouTubeAdapters({
        youtube: { clientId: 'client', clientSecret: 'secret' },
        fetch: replayFetch([channelCall, channelCall]).fetch,
      }).logins;
      if (!customLogin) throw new Error('customLogin missing');

      const tokens: TokenSet = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600_000),
        scopes: [],
      };

      const identity = await customLogin.getIdentity(tokens);
      expect(identity).toEqual({
        externalUserId: 'UC_TEST_CHANNEL_123',
        displayName: 'Test Channel Name',
        avatarUrl: 'https://yt.test/avatar.jpg',
      });

      const assets = await customLogin.listAssets(tokens);
      expect(assets).toHaveLength(1);
      expect(assets[0]).toMatchObject({
        externalId: 'UC_TEST_CHANNEL_123',
        network: 'youtube',
        displayName: 'Test Channel Name',
        username: '@testchannel',
        avatarUrl: 'https://yt.test/avatar.jpg',
      });
    });
  });

  describe('validation', () => {
    it('validates video is required emitting MEDIA_REQUIRED_VIDEO', () => {
      const textOnly: PublishInput = {
        text: 'Hello world',
        media: [],
        link: null,
        firstComment: null,
        options: {},
      };
      const issues = network.validate(textOnly);
      expect(issues.some((i) => i.code === 'MEDIA_REQUIRED_VIDEO')).toBe(true);
    });

    it('rejects photos and mixed media', () => {
      const imagePost: PublishInput = {
        text: 'Look at this photo',
        media: [photo],
        link: null,
        firstComment: null,
        options: {},
      };
      const issues = network.validate(imagePost);
      expect(issues.some((i) => i.code === 'MEDIA_KIND_NOT_SUPPORTED')).toBe(true);
    });

    it('validates title and description for forbidden angle brackets (< and >)', () => {
      const angleBracketTitle: PublishInput = {
        text: 'Clean description',
        media: [video],
        link: null,
        firstComment: null,
        options: {
          youtube: {
            title: 'Invalid <Title>',
          },
        },
      };
      const titleIssues = network.validate(angleBracketTitle);
      expect(titleIssues.some((i) => i.code === YouTubeIssueCode.TITLE_INVALID_CHARS)).toBe(true);

      const angleBracketDesc: PublishInput = {
        text: 'Description with <script> tag',
        media: [video],
        link: null,
        firstComment: null,
        options: {
          youtube: {
            title: 'Clean Title',
          },
        },
      };
      const descIssues = network.validate(angleBracketDesc);
      expect(descIssues.some((i) => i.code === YouTubeIssueCode.DESC_INVALID_CHARS)).toBe(true);
    });

    it('validates title length limits', () => {
      const longTitlePost: PublishInput = {
        text: 'Video description',
        media: [video],
        link: null,
        firstComment: null,
        options: {
          youtube: {
            title: 'a'.repeat(YOUTUBE_MAX_TITLE_CHARS + 1),
          },
        },
      };
      const issues = network.validate(longTitlePost);
      expect(issues.some((i) => i.code === YouTubeIssueCode.TITLE_TOO_LONG)).toBe(true);
    });

    it('validates tags length limits', () => {
      const longTagsPost: PublishInput = {
        text: 'Video description',
        media: [video],
        link: null,
        firstComment: null,
        options: {
          youtube: {
            title: 'Valid title',
            tags: [
              'a'.repeat(100),
              'b'.repeat(100),
              'c'.repeat(100),
              'd'.repeat(100),
              'e'.repeat(100),
              'f'.repeat(50),
            ],
          },
        },
      };
      const issues = network.validate(longTagsPost);
      expect(issues.some((i) => i.code === YouTubeIssueCode.TAGS_TOO_LONG)).toBe(true);
    });
  });

  describe('rate limits', () => {
    it('models ~6 uploads/day perApp for the default 10k quota units', () => {
      expect(YOUTUBE_RATE_LIMITS.perApp).toEqual([{ max: 6, perSec: 24 * 3600 }]);
      expect(YOUTUBE_RATE_LIMITS.perAccount).toEqual([{ max: 6, perSec: 24 * 3600 }]);
    });
  });

  describe('resumable chunked upload & duplicate prevention', () => {
    it('starts upload, handles 308 resume, and returns video ID on completion', async () => {
      const totalBytes = 1024;
      const uploadUrl = 'https://upload.google.com/sessions/s1';

      const calls: RecordedCall[] = [
        // 1. Session initiation
        {
          method: 'POST',
          url: 'https://www.googleapis.com/upload/youtube/v3/videos',
          query: { uploadType: 'resumable', part: 'snippet,status' },
          status: 200,
          headers: { location: uploadUrl },
          response: {},
        },
        // 2. Download chunk 1 (0 to 512)
        {
          method: 'GET',
          url: 'https://storage.test/v.mp4',
          status: 206,
          responseBytes: 512,
        },
        // 3. PUT chunk 1 -> Google answers 308 Resume Incomplete
        {
          method: 'PUT',
          url: uploadUrl,
          status: 308,
          headers: { range: 'bytes=0-511' },
          response: {},
        },
        // 4. Download chunk 2 (512 to 1024)
        {
          method: 'GET',
          url: 'https://storage.test/v.mp4',
          status: 206,
          responseBytes: 512,
        },
        // 5. PUT chunk 2 -> Google answers 200 OK with video resource
        {
          method: 'PUT',
          url: uploadUrl,
          status: 200,
          response: { id: 'yt-completed-video-123' },
        },
      ];

      const http = createHttpClient({ name: 'YouTube', fetch: replayFetch(calls).fetch });
      const videoId = await uploadYouTubeVideo(
        http,
        { ...video, sizeBytes: totalBytes },
        {
          title: 'My Video',
          description: 'Description',
          privacy: 'public',
          tags: ['tag1'],
          madeForKids: false,
        },
        { accessToken: 'token', externalId: 'ch1', meta: {} },
        { chunkSize: 512 },
      );

      expect(videoId).toBe('yt-completed-video-123');
    });

    it('fails cleanly with retryable error when Google provides no Location header', async () => {
      const calls: RecordedCall[] = [
        {
          method: 'POST',
          url: 'https://www.googleapis.com/upload/youtube/v3/videos',
          query: { uploadType: 'resumable', part: 'snippet,status' },
          status: 200,
          headers: {}, // Missing location
          response: {},
        },
      ];

      const http = createHttpClient({ name: 'YouTube', fetch: replayFetch(calls).fetch });
      await expect(
        uploadYouTubeVideo(
          http,
          video,
          {
            title: 'My Video',
            description: 'Desc',
            privacy: 'unlisted',
            tags: [],
            madeForKids: false,
          },
          { accessToken: 'token', externalId: 'ch1', meta: {} },
        ),
      ).rejects.toThrow('YouTube did not provide a resumable upload location');
    });

    it('prevents posting duplicate video: asks session status on timeout and returns completed video ID', async () => {
      const totalBytes = 512;
      const uploadUrl = 'https://upload.google.com/sessions/duplicate-check';

      // Status check call: PUT with Content-Range: bytes */512 returns 200 if already complete
      const statusCall: RecordedCall = {
        method: 'PUT',
        url: uploadUrl,
        requestHeaders: {
          'content-range': `bytes */${totalBytes}`,
        },
        status: 200,
        response: { id: 'yt-already-uploaded-456' },
      };

      const http = createHttpClient({ name: 'YouTube', fetch: replayFetch([statusCall]).fetch });
      const status = await queryUploadStatus(http, uploadUrl, totalBytes);

      expect(status.complete).toBe(true);
      expect(status.videoId).toBe('yt-already-uploaded-456');
    });

    it('queryUploadStatus parses Range header on 308 answer to continue upload', async () => {
      const totalBytes = 2048;
      const uploadUrl = 'https://upload.google.com/sessions/partial';

      const statusCall: RecordedCall = {
        method: 'PUT',
        url: uploadUrl,
        requestHeaders: {
          'content-range': `bytes */${totalBytes}`,
        },
        status: 308,
        headers: { range: 'bytes=0-1023' },
        response: {},
      };

      const http = createHttpClient({ name: 'YouTube', fetch: replayFetch([statusCall]).fetch });
      const status = await queryUploadStatus(http, uploadUrl, totalBytes);

      expect(status.complete).toBe(false);
      expect(status.nextOffset).toBe(1024);
    });

    it('stops after three retryable chunk failures without upload progress', async () => {
      const totalBytes = 512;
      const uploadUrl = 'https://upload.google.com/sessions/no-progress';
      let chunkAttempts = 0;
      let statusChecks = 0;
      const http: HttpClient = {
        request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
          if (request.method === 'POST') {
            return Promise.resolve({
              status: 200,
              ok: true,
              headers: new Headers({ location: uploadUrl }),
              body: {} as T,
            });
          }
          if (request.headers?.['content-range'] === `bytes */${totalBytes}`) {
            statusChecks += 1;
            return Promise.resolve({
              status: 308,
              ok: false,
              headers: new Headers(),
              body: {} as T,
            });
          }
          chunkAttempts += 1;
          return Promise.reject(
            new ProviderError({
              kind: 'retryable',
              message: 'YouTube did not answer in time',
            }),
          );
        },
        download() {
          return Promise.resolve(new Uint8Array(totalBytes));
        },
        withFile() {
          return Promise.reject(new Error('unexpected file-backed upload'));
        },
      };

      await expect(
        uploadYouTubeVideo(
          http,
          { ...video, sizeBytes: totalBytes },
          {
            title: 'My Video',
            description: 'Description',
            privacy: 'private',
            tags: [],
            madeForKids: false,
          },
          { accessToken: 'token', externalId: 'ch1', meta: {} },
          { chunkSize: totalBytes },
        ),
      ).rejects.toMatchObject({ kind: 'retryable', message: 'YouTube did not answer in time' });
      expect(chunkAttempts).toBe(3);
      expect(statusChecks).toBe(3);
    });

    it('does not turn a non-provider chunk failure into a status check', async () => {
      const totalBytes = 512;
      const uploadUrl = 'https://upload.google.com/sessions/programming-error';
      const programmingError = new TypeError('broken request construction');
      let statusChecks = 0;
      const http: HttpClient = {
        request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
          if (request.method === 'POST') {
            return Promise.resolve({
              status: 200,
              ok: true,
              headers: new Headers({ location: uploadUrl }),
              body: {} as T,
            });
          }
          if (request.headers?.['content-range'] === `bytes */${totalBytes}`) statusChecks += 1;
          return Promise.reject(programmingError);
        },
        download() {
          return Promise.resolve(new Uint8Array(totalBytes));
        },
        withFile() {
          return Promise.reject(new Error('unexpected file-backed upload'));
        },
      };

      await expect(
        uploadYouTubeVideo(
          http,
          { ...video, sizeBytes: totalBytes },
          {
            title: 'My Video',
            description: 'Description',
            privacy: 'private',
            tags: [],
            madeForKids: false,
          },
          { accessToken: 'token', externalId: 'ch1', meta: {} },
          { chunkSize: totalBytes },
        ),
      ).rejects.toBe(programmingError);
      expect(statusChecks).toBe(0);
    });
  });

  describe('options choices', () => {
    it('answers option choices with privacy levels', async () => {
      const choices = await network.optionChoices?.({
        externalId: 'channel-1',
        accessToken: 'token',
        meta: {},
      });
      expect(choices).toEqual({
        network: 'youtube',
        privacyLevels: ['public', 'unlisted', 'private'],
      });
    });
  });
});
