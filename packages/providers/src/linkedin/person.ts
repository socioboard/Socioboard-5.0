import type { ContentRules, PreviewSpec, ValidationIssue } from '@socioboard/contracts';

import type { HttpClient } from '../http';
import type { NetworkAdapter, RateLimits } from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import {
  createPost,
  deletePost,
  imageContent,
  LINKEDIN_IMAGE_PREP,
  LINKEDIN_MAX_IMAGES,
  LINKEDIN_VIDEO,
  linkedinPostText,
  uploadImage,
  uploadVideo,
  type LinkedInVideoOptions,
} from './posts';

/** LinkedIn's limit on a post's text. */
export const LINKEDIN_MAX_CHARS = 3000;

/**
 * LinkedIn profile posts: text, a link, up to 20 photos, or one video on its own. Links stay
 * clickable text, without a preview card (posts.ts, `linkedinPostText`). Photo size isn't checked
 * here: the worker fits each one to LINKEDIN_IMAGE_PREP before publishing. Videos go as uploaded
 * (MP4 or MOV; LinkedIn documents MP4, and says why if it refuses one).
 */
export const LINKEDIN_RULES: ContentRules = {
  maxChars: LINKEDIN_MAX_CHARS,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: false,
    maxItems: LINKEDIN_MAX_IMAGES,
    kinds: ['image', 'video'],
    mixKinds: false,
    maxImageBytes: LINKEDIN_IMAGE_PREP.maxBytes,
    imageAspectRatio: null,
    video: LINKEDIN_VIDEO,
  },
  links: 'text',
};

/**
 * "Share on LinkedIn" allows each member 150 calls a day and the app 100,000 (UTC days; checked
 * 2026-10-08). A text post is one call, a photo adds two (register, upload), a video a few more
 * (register, finalize, status checks), so we count 50 posts a day per profile and 30,000 for the
 * whole app. Posts with many photos use more of LinkedIn's allowance than that assumes; LinkedIn
 * then answers 429 and the worker waits.
 */
export const LINKEDIN_RATE_LIMITS: RateLimits = {
  perAccount: [{ max: 50, perSec: 24 * 3600 }],
  perApp: [{ max: 30_000, perSec: 24 * 3600 }],
};

export const LINKEDIN_PREVIEW: PreviewSpec = {
  // The feed shows about three lines (some 210 characters) before "…see more".
  truncateAt: 210,
  truncateLines: 3,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: false,
};

/** The `linkedin_person` network: posts as the member who signed in (`urn:li:person:<id>`). */
export function createLinkedInPerson(
  http: HttpClient,
  videoOptions: LinkedInVideoOptions = {},
): NetworkAdapter {
  return {
    id: 'linkedin_person',
    displayName: 'LinkedIn',
    capabilities: {
      // `carousel`: several photos in one post (LinkedIn's MultiImage).
      postTypes: ['text', 'link', 'image', 'carousel', 'video'],
      firstComment: false,
      altText: true,
    },
    rules: LINKEDIN_RULES,
    preview: LINKEDIN_PREVIEW,
    imagePrep: LINKEDIN_IMAGE_PREP,
    rateLimits: LINKEDIN_RATE_LIMITS,

    validate(input) {
      // Length is checked on what's sent: the text with its link added.
      const text = linkedinPostText(input);
      const issues: ValidationIssue[] = checkRules(LINKEDIN_RULES, { ...input, text }, 'LinkedIn', {
        imagesRefitted: true,
      });
      if (text === '' && input.media.length === 0) {
        issues.push(
          issue('error', IssueCode.EMPTY_POST, 'Add text, a link, a photo or a video.', {
            field: 'text',
          }),
        );
      }
      // A post holds one video. Photos with a video are already MEDIA_MIXED (checkRules).
      const videos = input.media.filter((m) => m.kind === 'video').length;
      if (videos > 1 && videos === input.media.length) {
        issues.push(
          issue('error', IssueCode.TOO_MANY_MEDIA, 'LinkedIn takes one video per post.', {
            field: 'media',
            params: { max: 1, actual: videos },
          }),
        );
      }
      return issues;
    },

    async publish(input, account) {
      const author = `urn:li:person:${account.externalId}`;
      const [video] = input.media.filter((m) => m.kind === 'video');
      if (video) {
        const urn = await uploadVideo(http, account, author, video, videoOptions);
        return createPost(http, account, author, {
          text: linkedinPostText(input),
          content: { media: { id: urn } },
        });
      }
      // One at a time; the post lists them in the composer's order (imageContent keeps it).
      const images: { urn: string; altText: string | null }[] = [];
      for (const m of input.media) {
        images.push({ urn: await uploadImage(http, account, author, m), altText: m.altText });
      }
      return createPost(http, account, author, {
        text: linkedinPostText(input),
        ...(images.length > 0 ? { content: imageContent(images) } : {}),
      });
    },

    deletePost(externalId, account) {
      return deletePost(http, externalId, account);
    },
  };
}
