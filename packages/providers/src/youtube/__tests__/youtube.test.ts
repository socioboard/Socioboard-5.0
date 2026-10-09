import { describe, expect, it } from 'vitest';

import type { PublishInput, PublishMedia } from '../../types';
import { createYouTubeAdapters, YOUTUBE_MAX_TITLE_CHARS, YouTubeIssueCode } from '../index';

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

  it('provides auth URL with offline access and required scopes', () => {
    const url = new URL(
      login.getAuthUrl({
        state: 'st1',
        redirectUri: 'http://localhost:5173/callback',
        forceAccountSelection: true,
      }),
    );
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toContain('select_account');
    expect(url.searchParams.get('scope')).toContain('youtube.upload');
  });

  it('validates video is required and images are rejected', () => {
    const textOnly: PublishInput = {
      text: 'Hello world',
      media: [],
      link: null,
      firstComment: null,
      options: {},
    };
    const issues1 = network.validate(textOnly);
    expect(issues1.some((i) => i.code === 'MEDIA_REQUIRED')).toBe(true);

    const imagePost: PublishInput = {
      text: 'Look at this photo',
      media: [photo],
      link: null,
      firstComment: null,
      options: {},
    };
    const issues2 = network.validate(imagePost);
    expect(issues2.some((i) => i.code === 'MEDIA_KIND_NOT_SUPPORTED')).toBe(true);
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
