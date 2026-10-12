import type {
  AccountOptionChoices,
  ContentRules,
  PreviewSpec,
  ValidationIssue,
} from '@socioboard/contracts';

import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type {
  AccountCredentials,
  NetworkAdapter,
  PublishInput,
  PublishResult,
  RateLimits,
} from '../types';
import { checkRules, issue } from '../validation';
import { youtubeError } from './errors';
import { uploadYouTubeVideo } from './upload';

const GB = 1024 * 1024 * 1024;

export const YOUTUBE_MAX_TITLE_CHARS = 100;
export const YOUTUBE_MAX_DESC_CHARS = 5000;
export const YOUTUBE_MAX_TAGS_CHARS = 500;

export const YOUTUBE_RULES: ContentRules = {
  maxChars: YOUTUBE_MAX_DESC_CHARS,
  maxHashtags: 60,
  maxMentions: null,
  media: {
    required: true,
    maxItems: 1,
    kinds: ['video'],
    mixKinds: false,
    maxImageBytes: 5 * 1024 * 1024,
    imageAspectRatio: null,
    video: { minSec: 1, maxSec: 12 * 3600, maxBytes: 128 * GB },
  },
  links: 'text',
};

export const YOUTUBE_RATE_LIMITS: RateLimits = {
  // Default Google Cloud project quota is 10,000 units/day. Each videos.insert
  // costs 1,600 units, allowing ~6 video uploads per day for the entire app until
  // Google approves a quota extension.
  perAccount: [{ max: 6, perSec: 24 * 3600 }],
  perApp: [{ max: 6, perSec: 24 * 3600 }],
};

export const YOUTUBE_PREVIEW: PreviewSpec = {
  truncateAt: 125,
  truncateLines: 3,
  captionPosition: 'below_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: false,
};

export const YouTubeIssueCode = {
  TITLE_REQUIRED: 'YOUTUBE_TITLE_REQUIRED',
  TITLE_TOO_LONG: 'YOUTUBE_TITLE_TOO_LONG',
  TITLE_INVALID_CHARS: 'YOUTUBE_TITLE_INVALID_CHARS',
  DESC_INVALID_CHARS: 'YOUTUBE_DESC_INVALID_CHARS',
  TAGS_TOO_LONG: 'YOUTUBE_TAGS_TOO_LONG',
} as const;

function resolveTitle(input: PublishInput): string {
  const optTitle = input.options.youtube?.title?.trim();
  if (optTitle && optTitle !== '') return optTitle;
  return input.text !== ''
    ? Array.from(input.text).slice(0, YOUTUBE_MAX_TITLE_CHARS).join('').trim()
    : '';
}

export function createYouTube(http: HttpClient): NetworkAdapter {
  return {
    id: 'youtube',
    displayName: 'YouTube',
    capabilities: {
      postTypes: ['video'],
      firstComment: false,
      altText: false,
    },
    rules: YOUTUBE_RULES,
    preview: YOUTUBE_PREVIEW,
    rateLimits: YOUTUBE_RATE_LIMITS,

    validate(input: PublishInput): ValidationIssue[] {
      const issues: ValidationIssue[] = checkRules(YOUTUBE_RULES, input, 'YouTube');

      const ytOptions = input.options.youtube;
      const title = resolveTitle(input);

      if (title === '' && input.media.length > 0) {
        issues.push(
          issue('error', YouTubeIssueCode.TITLE_REQUIRED, 'YouTube videos require a title.', {
            field: 'options',
          }),
        );
      }

      if (/[<>]/.test(title)) {
        issues.push(
          issue(
            'error',
            YouTubeIssueCode.TITLE_INVALID_CHARS,
            'YouTube video titles cannot contain < or >.',
            { field: 'options' },
          ),
        );
      }

      if (/[<>]/.test(input.text)) {
        issues.push(
          issue(
            'error',
            YouTubeIssueCode.DESC_INVALID_CHARS,
            'YouTube descriptions cannot contain < or >.',
            { field: 'text' },
          ),
        );
      }

      if (ytOptions?.title && ytOptions.title.length > YOUTUBE_MAX_TITLE_CHARS) {
        issues.push(
          issue(
            'error',
            YouTubeIssueCode.TITLE_TOO_LONG,
            `YouTube video title must be ${String(YOUTUBE_MAX_TITLE_CHARS)} characters or less.`,
            {
              field: 'options',
              params: {
                max: YOUTUBE_MAX_TITLE_CHARS,
                actual: ytOptions.title.length,
                over: ytOptions.title.length - YOUTUBE_MAX_TITLE_CHARS,
              },
            },
          ),
        );
      }

      if (ytOptions?.tags && ytOptions.tags.length > 0) {
        const totalTagsLen = ytOptions.tags.reduce((acc, tag) => acc + tag.length, 0);
        if (totalTagsLen > YOUTUBE_MAX_TAGS_CHARS) {
          issues.push(
            issue(
              'error',
              YouTubeIssueCode.TAGS_TOO_LONG,
              `Total tags length must be ${String(YOUTUBE_MAX_TAGS_CHARS)} characters or less.`,
              { field: 'options' },
            ),
          );
        }
      }

      return issues;
    },

    async publish(input: PublishInput, account: AccountCredentials): Promise<PublishResult> {
      const videoMedia = input.media.find((m) => m.kind === 'video');
      if (!videoMedia) {
        throw new ProviderError({
          kind: 'content',
          message: 'YouTube requires a video file to publish',
        });
      }

      const ytOptions = input.options.youtube;
      const title = resolveTitle(input);
      if (title === '') {
        throw new ProviderError({
          kind: 'content',
          message: 'YouTube requires a title to publish',
        });
      }
      const cleanTitle = title.replace(/[<>]/g, '');
      const cleanDesc = input.text.replace(/[<>]/g, '');
      const privacy = ytOptions?.privacy ?? 'private';
      const tags = ytOptions?.tags ?? [];
      const madeForKids = ytOptions?.madeForKids ?? false;

      const videoId = await uploadYouTubeVideo(
        http,
        videoMedia,
        {
          title: cleanTitle,
          description: cleanDesc,
          privacy,
          tags,
          madeForKids,
        },
        account,
      );

      return {
        externalId: videoId,
        permalink: `https://www.youtube.com/watch?v=${videoId}`,
        warnings: [],
      };
    },

    async deletePost(externalId: string, account: AccountCredentials): Promise<void> {
      const res = await http.request({
        method: 'DELETE',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        query: { id: externalId },
        headers: { authorization: `Bearer ${account.accessToken}` },
      });

      if (!res.ok && res.status !== 404) {
        throw youtubeError(res, 'deleting the video');
      }
    },

    optionChoices(_account: AccountCredentials): Promise<AccountOptionChoices> {
      return Promise.resolve({
        network: 'youtube',
        privacyLevels: ['public', 'unlisted', 'private'],
      });
    },
  };
}
