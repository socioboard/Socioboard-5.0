import { openAsBlob } from 'node:fs';

import type {
  ContentRules,
  NetworkCapabilities,
  PreviewSpec,
  ValidationIssue,
} from '@socioboard/contracts';

import { isProviderError, ProviderError } from '../errors';
import type { HttpClient, HttpRequest, HttpResponse, ProviderLogger } from '../http';
import type { ImagePrep, NetworkAdapter, PublishInput, PublishResult, RateLimits } from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import { tumblrError } from './errors';
import { TUMBLR_API } from './login';

const MB = 1024 * 1024;

/**
 * Maximum character limit for the single Tumblr text block this adapter creates.
 */
export const TUMBLR_MAX_CHARS = 4096;

/**
 * Tumblr post rules (checked 2026-10-12):
 * - This product accepts up to 10 images / photoset (10 MB each)
 * - Tumblr allows 10-minute / 500 MB videos; this product caps uploads at 100 MB
 * - Links can be standalone or attached
 */
export const TUMBLR_CAPABILITIES: NetworkCapabilities = {
  postTypes: ['text', 'link', 'image', 'carousel', 'video'],
  firstComment: false,
  altText: true,
};

export const TUMBLR_RULES: ContentRules = {
  maxChars: TUMBLR_MAX_CHARS,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: false,
    maxItems: 10,
    kinds: ['image', 'gif', 'video'],
    mixKinds: false,
    maxImageBytes: 10 * MB,
    imageAspectRatio: null,
    video: { minSec: 1, maxSec: 10 * 60, maxBytes: 100 * MB },
  },
  links: 'card',
};

export const TUMBLR_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxWidth: null,
  maxBytes: 10 * MB,
};

export const TUMBLR_RATE_LIMITS: RateLimits = {
  // Tumblr's daily publishing limits apply to a login, not each blog asset. The shared limiter
  // has no per-login bucket, so Tumblr's 429 response is the source of truth for those limits.
  perAccount: [],
  perApp: [
    { max: 1000, perSec: 3600 },
    { max: 5000, perSec: 24 * 3600 },
  ],
};

export const TUMBLR_PREVIEW: PreviewSpec = {
  truncateAt: 500,
  truncateLines: 6,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: true,
};

export interface TumblrNetworkConfig {
  http: HttpClient;
  logger?: ProviderLogger;
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  maxPollIntervalMs?: number;
  maxPollAttempts?: number;
}

interface PostResponse {
  meta?: { status: number; msg: string };
  response?: {
    id?: number | string;
    id_string?: string;
    state?: string;
    displayText?: string;
  };
}

interface PostsListResponse {
  meta?: { status: number; msg: string };
  response?: {
    posts?: {
      id?: number | string;
      id_string?: string;
      genesis_post_id?: string;
      post_url?: string;
      slug?: string;
    }[];
  };
}

interface NpfBlock {
  type: string;
  text?: string;
  media?: NpfMedia | NpfMedia[];
  alt_text?: string;
  url?: string;
}

interface NpfMedia {
  type: string;
  identifier: string;
  width?: number;
  height?: number;
}

interface UploadPart {
  identifier: string;
  filename: string;
  mime: string;
  readUrl: string;
  maxBytes: number;
  timeoutMs?: number;
}

interface NpfRow {
  blocks: number[];
  mode?: { type: 'weighted' };
}

const TUMBLR_VIDEO_TIMEOUT_MS = 10 * 60_000;
const TUMBLR_AMBIGUOUS_PUBLISH_MESSAGE =
  'Tumblr may have published this post but did not answer. Check your blog before trying again.';

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(/(?<![\p{L}\p{N}_])#([\p{L}\p{N}_]+)/gu)) {
    const tag = match[1];
    if (!tag || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }
  return tags;
}

async function requestPublish(
  http: HttpClient,
  request: HttpRequest,
): Promise<HttpResponse<PostResponse>> {
  try {
    return await http.request<PostResponse>(request);
  } catch (error) {
    if (isProviderError(error) && error.kind === 'retryable') {
      // This also covers failures before any bytes were sent (for example DNS or connection
      // refusal). Treating all no-response failures as ambiguous avoids a duplicate post.
      throw new ProviderError({
        kind: 'content',
        message: TUMBLR_AMBIGUOUS_PUBLISH_MESSAGE,
        cause: error,
      });
    }
    throw error;
  }
}

async function withUploads<T>(
  http: HttpClient,
  uploads: UploadPart[],
  form: FormData,
  index: number,
  use: (form: FormData) => Promise<T>,
): Promise<T> {
  const upload = uploads[index];
  if (!upload) return use(form);

  return http.withFile(
    upload.readUrl,
    {
      maxBytes: upload.maxBytes,
      ...(upload.timeoutMs === undefined ? {} : { timeoutMs: upload.timeoutMs }),
    },
    async (path) => {
      form.set(upload.identifier, await openAsBlob(path, { type: upload.mime }), upload.filename);
      return withUploads(http, uploads, form, index + 1, use);
    },
  );
}

function mediaFilename(identifier: string, mime: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
  };
  const subtype = mime.split('/')[1]?.replace(/[^a-z0-9]/gi, '');
  return `${identifier}.${extensions[mime] ?? subtype ?? 'bin'}`;
}

function photosetRows(blocks: NpfBlock[]): NpfRow[] {
  const rows: NpfRow[] = [];
  for (let index = 0; index < blocks.length;) {
    if (blocks[index]?.type !== 'image') {
      rows.push({ blocks: [index] });
      index += 1;
      continue;
    }
    const row: number[] = [];
    while (index < blocks.length && blocks[index]?.type === 'image' && row.length < 3) {
      row.push(index);
      index += 1;
    }
    rows.push({ blocks: row, ...(row.length > 1 ? { mode: { type: 'weighted' as const } } : {}) });
  }
  return rows;
}

export function createTumblrNetwork(config: TumblrNetworkConfig): NetworkAdapter {
  const {
    http,
    logger,
    sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    pollIntervalMs = 1000,
    maxPollIntervalMs = 5000,
    maxPollAttempts = 8,
  } = config;

  return {
    id: 'tumblr',
    displayName: 'Tumblr',
    capabilities: TUMBLR_CAPABILITIES,
    rules: TUMBLR_RULES,
    preview: TUMBLR_PREVIEW,
    rateLimits: TUMBLR_RATE_LIMITS,

    validate(input: PublishInput): ValidationIssue[] {
      const issues = checkRules(TUMBLR_RULES, input, 'Tumblr');
      const hasText = input.text.trim().length > 0;
      const hasMedia = input.media.length > 0;
      const hasLink = Boolean(input.link && input.link.trim().length > 0);

      if (!hasText && !hasMedia && !hasLink) {
        issues.push(
          issue(
            'error',
            IssueCode.EMPTY_POST,
            'Write text, attach media or add a link to publish.',
            {
              field: 'text',
            },
          ),
        );
      }

      return issues;
    },

    async publish(input: PublishInput, account): Promise<PublishResult> {
      const blogIdentifier = (account.meta.uuid as string | undefined) ?? account.externalId;
      const blocks: NpfBlock[] = [];
      const uploads: UploadPart[] = [];

      if (input.text.trim().length > 0) {
        blocks.push({
          type: 'text',
          text: input.text.trim(),
        });
      }

      for (const [index, media] of input.media.entries()) {
        const identifier = `media-${String(index)}`;
        if (media.kind === 'video') {
          uploads.push({
            identifier,
            filename: mediaFilename(identifier, media.mime),
            mime: media.mime,
            readUrl: media.readUrl,
            maxBytes: TUMBLR_RULES.media.video?.maxBytes ?? 100 * MB,
            timeoutMs: TUMBLR_VIDEO_TIMEOUT_MS,
          });
          blocks.push({
            type: 'video',
            media: {
              type: media.mime,
              identifier,
              ...(media.width === null ? {} : { width: media.width }),
              ...(media.height === null ? {} : { height: media.height }),
            },
          });
        } else {
          uploads.push({
            identifier,
            filename: mediaFilename(identifier, media.mime),
            mime: media.mime,
            readUrl: media.readUrl,
            maxBytes: TUMBLR_IMAGE_PREP.maxBytes,
          });
          blocks.push({
            type: 'image',
            media: [
              {
                type: media.mime,
                identifier,
                ...(media.width === null ? {} : { width: media.width }),
                ...(media.height === null ? {} : { height: media.height }),
              },
            ],
            ...(media.altText ? { alt_text: media.altText } : {}),
          });
        }
      }

      if (input.link && input.link.trim().length > 0) {
        blocks.push({
          type: 'link',
          url: input.link.trim(),
        });
      }

      const tags = extractTags(input.text);
      const payload: Record<string, unknown> = {
        content: blocks,
        state: 'published',
        ...(tags.length > 0 ? { tags } : {}),
        ...(input.media.filter((media) => media.kind !== 'video').length > 1
          ? { layout: [{ type: 'rows', display: photosetRows(blocks) }] }
          : {}),
      };

      const request = {
        method: 'POST' as const,
        url: `${TUMBLR_API}/v2/blog/${encodeURIComponent(blogIdentifier)}/posts`,
        headers: { authorization: `Bearer ${account.accessToken}` },
      };
      let res: HttpResponse<PostResponse>;
      if (uploads.length > 0) {
        const form = new FormData();
        form.set('json', JSON.stringify(payload));
        res = await withUploads(http, uploads, form, 0, (multipart) =>
          requestPublish(http, {
            ...request,
            multipart,
            ...(input.media.some((media) => media.kind === 'video')
              ? { timeoutMs: TUMBLR_VIDEO_TIMEOUT_MS }
              : {}),
          }),
        );
      } else {
        res = await requestPublish(http, { ...request, json: payload });
      }

      if (!res.ok || !res.body.response) {
        throw tumblrError(res, 'publishing post');
      }

      const postId =
        res.body.response.id_string ??
        (res.body.response.id !== undefined ? String(res.body.response.id) : null);

      if (!postId) {
        throw tumblrError(res, 'parsing post id');
      }

      let finalPostId = postId;
      let finalSlug: string | undefined;
      const blogName = (account.meta.blogName as string | undefined) ?? account.externalId;
      const hasVideo = input.media.some((media) => media.kind === 'video');

      if (hasVideo) {
        for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
          await sleep(Math.min(pollIntervalMs * 2 ** attempt, maxPollIntervalMs));
          try {
            const listRes = await http.request<PostsListResponse>({
              method: 'GET',
              url: `${TUMBLR_API}/v2/blog/${encodeURIComponent(blogIdentifier)}/posts`,
              // Tumblr can replace a video's creation ID after transcoding. The replacement
              // exposes that old ID as genesis_post_id, so search the newest posts for the link.
              // The API caps this response at 20, which can still miss a match on a very busy
              // blog; in that case we safely return the creation ID below.
              query: { limit: '20' },
              headers: { authorization: `Bearer ${account.accessToken}` },
            });
            if (!listRes.ok) {
              logger?.debug(
                { attempt: attempt + 1, status: listRes.status },
                'Tumblr video post lookup failed; retrying',
              );
              continue;
            }
            if (listRes.body.response?.posts) {
              const match = listRes.body.response.posts.find(
                (p) =>
                  p.genesis_post_id === postId ||
                  p.id_string === postId ||
                  (p.id !== undefined && String(p.id) === postId),
              );
              if (match) {
                finalPostId =
                  match.id_string ?? (match.id !== undefined ? String(match.id) : postId);
                finalSlug = match.slug;
                break;
              }
            }
          } catch (error) {
            logger?.debug(
              {
                attempt: attempt + 1,
                error: error instanceof Error ? error.message : String(error),
              },
              'Tumblr video post lookup failed; retrying',
            );
          }
        }
      }

      const slugPath = finalSlug ? `/${finalSlug}` : '';
      const permalink = `https://www.tumblr.com/${encodeURIComponent(blogName)}/${finalPostId}${slugPath}`;

      return {
        externalId: finalPostId,
        permalink,
        warnings: [],
      };
    },
  };
}
