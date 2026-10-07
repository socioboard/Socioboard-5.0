import type { ContentRules, PreviewSpec, ValidationIssue } from '@socioboard/contracts';

import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type {
  AccountCredentials,
  ContentInput,
  ImagePrep,
  NetworkAdapter,
  PublishMedia,
  PublishResult,
  RateLimits,
} from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import { xError } from './errors';
import { X_API } from './login';

const MB = 1024 * 1024;

/** X's limit on the weighted length of a post (premium accounts get more; we hold to 280). */
export const X_MAX_CHARS = 280;
/** Every link counts as this many characters, whatever its length (t.co wrapping). */
const URL_WEIGHT = 23;

/**
 * X posts (docs.x.com, checked 2026-10-06): up to 4 photos (5 MB each), or one GIF (15 MB), or one
 * video (20 minutes for ordinary accounts; our upload limit is 1 GB). The composer counts text by
 * code points; X weighs it (`xTextLength`), which `validate` checks.
 */
export const X_RULES: ContentRules = {
  maxChars: X_MAX_CHARS,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: false,
    maxItems: 4,
    kinds: ['image', 'gif', 'video'],
    mixKinds: false,
    maxImageBytes: 5 * MB,
    imageAspectRatio: null,
    video: { minSec: 0.5, maxSec: 20 * 60, maxBytes: 1024 * MB },
  },
  links: 'card',
};

/** X takes JPEG, PNG and WebP photos up to 5 MB; others are fitted before publishing. */
export const X_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: null,
  maxBytes: 5 * MB,
};

/**
 * Creating posts: 100 per 15 minutes per user, and X's daily cap of 2,400 per account. Pay per use
 * has no fixed app-wide cap; running out of credits answers 402 (held back app-wide).
 */
export const X_RATE_LIMITS: RateLimits = {
  perAccount: [
    { max: 100, perSec: 15 * 60 },
    { max: 2400, perSec: 24 * 3600 },
  ],
  perApp: [],
};

export const X_PREVIEW: PreviewSpec = {
  // Ordinary accounts can't exceed 280, so nothing is cut behind "Show more".
  truncateAt: null,
  truncateLines: null,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: true,
};

/**
 * What X charges per post on pay per use (developer-apps.md, checked 2026-10-06; X's price list
 * can change): a post with a link costs more. Recorded per attempt (`PublishAttempt.costUnits`,
 * US dollars).
 */
export const X_POST_COST_USD = 0.015;
export const X_LINK_POST_COST_USD = 0.2;

/** Issue codes of X's own (worded in the composer's locale). */
export const XIssueCode = {
  X_LINK_COST: 'X_LINK_COST',
  X_GIF_OR_VIDEO_ALONE: 'X_GIF_OR_VIDEO_ALONE',
} as const;

const URL_PATTERN = /\bhttps?:\/\/[^\s]+/gi;

/** Code point ranges X weighs as one character; everything else (CJK, emoji…) counts as two. */
const LIGHT_RANGES: [number, number][] = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

/** A post's length as X counts it (twitter-text v3): links 23 each, heavy characters 2. */
export function xTextLength(text: string): number {
  let length = 0;
  const withoutLinks = text.replace(URL_PATTERN, () => {
    length += URL_WEIGHT;
    return '';
  });
  for (const char of withoutLinks) {
    const cp = char.codePointAt(0) ?? 0;
    length += LIGHT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi) ? 1 : 2;
  }
  return length;
}

/** The text X receives: the post's text, with its link added when the text doesn't have it. */
export function xPostText(input: Pick<ContentInput, 'text' | 'link'>): string {
  const text = input.text.trim();
  if (!input.link || text.includes(input.link)) return text;
  return text === '' ? input.link : `${text}\n\n${input.link}`;
}

const hasLink = (text: string) => new RegExp(URL_PATTERN.source, 'i').test(text);

export interface XOptions {
  /** How often to ask whether an uploaded video is ready (tests make it instant). */
  pollIntervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
  /** Longest wait for X to process a video before the attempt is retried. */
  processingTimeoutMs?: number;
}

/** Chunk size for video and GIF uploads (X takes up to 5 MB per chunk). */
const CHUNK = 4 * MB;

export function createX(http: HttpClient, options: XOptions = {}): NetworkAdapter {
  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const bearer = (account: AccountCredentials) => ({
    authorization: `Bearer ${account.accessToken}`,
  });

  async function uploadSimple(m: PublishMedia, account: AccountCredentials) {
    const bytes = await http.download(m.readUrl, { maxBytes: X_IMAGE_PREP.maxBytes });
    const form = new FormData();
    form.set('media', new Blob([bytes], { type: m.mime }), 'media');
    form.set('media_category', 'tweet_image');
    const res = await http.request<{ data?: { id: string } }>({
      method: 'POST',
      url: `${X_API}/2/media/upload`,
      multipart: form,
      headers: bearer(account),
      timeoutMs: 120_000,
    });
    if (!res.ok || !res.body.data?.id) throw xError(res, 'photo upload');
    return res.body.data.id;
  }

  async function uploadChunked(m: PublishMedia, account: AccountCredentials) {
    const category = m.kind === 'gif' ? 'tweet_gif' : 'tweet_video';
    const init = await http.request<{ data?: { id: string } }>({
      method: 'POST',
      url: `${X_API}/2/media/upload/initialize`,
      json: { media_type: m.mime, total_bytes: m.sizeBytes, media_category: category },
      headers: bearer(account),
    });
    const id = init.body.data?.id;
    if (!init.ok || !id) throw xError(init, 'video upload');

    for (let start = 0, segment = 0; start < m.sizeBytes; start += CHUNK, segment++) {
      const end = Math.min(start + CHUNK, m.sizeBytes);
      const chunk = await http.download(m.readUrl, { range: { start, end }, maxBytes: CHUNK });
      const form = new FormData();
      form.set('segment_index', String(segment));
      form.set('media', new Blob([chunk]), 'chunk');
      const res = await http.request({
        method: 'POST',
        url: `${X_API}/2/media/upload/${id}/append`,
        multipart: form,
        headers: bearer(account),
        timeoutMs: 120_000,
      });
      if (!res.ok) throw xError(res, 'video upload');
    }

    interface Processing {
      state?: 'pending' | 'in_progress' | 'succeeded' | 'failed';
      check_after_secs?: number;
      error?: { message?: string };
    }
    const fin = await http.request<{ data?: { processing_info?: Processing } }>({
      method: 'POST',
      url: `${X_API}/2/media/upload/${id}/finalize`,
      headers: bearer(account),
    });
    if (!fin.ok) throw xError(fin, 'video upload');

    let info = fin.body.data?.processing_info;
    const deadline = Date.now() + (options.processingTimeoutMs ?? 10 * 60_000);
    while (info && info.state !== 'succeeded') {
      if (info.state === 'failed') {
        throw new ProviderError({
          kind: 'content',
          message: `X couldn't process the video: ${info.error?.message ?? 'no reason given'}`,
        });
      }
      if (Date.now() > deadline) {
        throw new ProviderError({ kind: 'retryable', message: 'X is still processing the video' });
      }
      await sleep(options.pollIntervalMs ?? Math.max(1, info.check_after_secs ?? 2) * 1000);
      const status = await http.request<{ data?: { processing_info?: Processing } }>({
        url: `${X_API}/2/media/upload`,
        query: { command: 'STATUS', media_id: id },
        headers: bearer(account),
      });
      if (!status.ok) throw xError(status, 'video processing');
      info = status.body.data?.processing_info;
    }
    return id;
  }

  return {
    id: 'x',
    displayName: 'X',
    capabilities: {
      postTypes: ['text', 'link', 'image', 'carousel', 'video'],
      firstComment: false,
      altText: false,
    },
    rules: X_RULES,
    preview: X_PREVIEW,
    imagePrep: X_IMAGE_PREP,
    rateLimits: X_RATE_LIMITS,

    validate(input) {
      // Length is X's weighted count of what's sent (the text with its link), checked below.
      const issues: ValidationIssue[] = checkRules(
        { ...X_RULES, maxChars: Number.MAX_SAFE_INTEGER },
        input,
        'X',
        { imagesRefitted: true },
      );
      const text = xPostText(input);
      const length = xTextLength(text);
      if (length > X_MAX_CHARS) {
        issues.push(
          issue(
            'error',
            IssueCode.TEXT_TOO_LONG,
            `X allows ${String(X_MAX_CHARS)} characters; this has ${String(length)} (links count as 23).`,
            {
              field: 'text',
              params: { max: X_MAX_CHARS, actual: length, over: length - X_MAX_CHARS },
            },
          ),
        );
      }
      if (text === '' && input.media.length === 0) {
        issues.push(
          issue('error', IssueCode.EMPTY_POST, 'Add text, a link, a photo or a video.', {
            field: 'text',
          }),
        );
      }
      const single = input.media.filter((m) => m.kind === 'gif' || m.kind === 'video');
      if (single.length > 0 && input.media.length > 1) {
        issues.push(
          issue(
            'error',
            XIssueCode.X_GIF_OR_VIDEO_ALONE,
            'On X a GIF or a video goes alone: no other files in the same post.',
            { field: 'media' },
          ),
        );
      }
      if (hasLink(text)) {
        issues.push(
          issue('warning', XIssueCode.X_LINK_COST, 'X charges more for posts with a link.', {
            field: input.link ? 'link' : 'text',
          }),
        );
      }
      return issues;
    },

    async publish(input, account) {
      const mediaIds: string[] = [];
      for (const m of input.media) {
        mediaIds.push(
          m.kind === 'image' ? await uploadSimple(m, account) : await uploadChunked(m, account),
        );
      }
      const text = xPostText(input);
      const res = await http.request<{ data?: { id: string } }>({
        method: 'POST',
        url: `${X_API}/2/tweets`,
        json: { text, ...(mediaIds.length > 0 ? { media: { media_ids: mediaIds } } : {}) },
        headers: bearer(account),
      });
      const id = res.body.data?.id;
      if (!res.ok || !id) throw xError(res, 'posting');
      const username = typeof account.meta.username === 'string' ? account.meta.username : null;
      return {
        externalId: id,
        permalink: username
          ? `https://x.com/${encodeURIComponent(username)}/status/${id}`
          : `https://x.com/i/web/status/${id}`,
        warnings: [],
        costUnits: hasLink(text) ? X_LINK_POST_COST_USD : X_POST_COST_USD,
      } satisfies PublishResult;
    },

    async deletePost(externalId, account) {
      const res = await http.request({
        method: 'DELETE',
        url: `${X_API}/2/tweets/${encodeURIComponent(externalId)}`,
        headers: bearer(account),
      });
      if (!res.ok && res.status !== 404) throw xError(res, 'deleting the post');
    },
  };
}
