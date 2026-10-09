import type {
  ContentRules,
  NetworkCapabilities,
  PreviewSpec,
  ValidationIssue,
} from '@socioboard/contracts';

import type { HttpClient, HttpResponse } from '../http';
import type { ImagePrep, NetworkAdapter, PublishInput, PublishResult, RateLimits } from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import { tumblrError } from './errors';
import { TUMBLR_API } from './login';

const MB = 1024 * 1024;

/**
 * Maximum character limit for Tumblr text blocks.
 */
export const TUMBLR_MAX_CHARS = 4096;

/**
 * Tumblr post rules (checked 2026-10-09):
 * - Up to 10 images / photoset (10 MB each, GIF up to 10 MB)
 * - Single video up to 5 minutes / 500 MB
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
    video: { minSec: 1, maxSec: 5 * 60, maxBytes: 500 * MB },
  },
  links: 'card',
};

export const TUMBLR_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxWidth: null,
  maxBytes: 10 * MB,
};

export const TUMBLR_RATE_LIMITS: RateLimits = {
  perAccount: [{ max: 250, perSec: 24 * 3600 }],
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

interface BufferedUploadPart {
  identifier: string;
  filename: string;
  mime: string;
  bytes: Uint8Array;
}

interface FileUploadPart {
  identifier: string;
  filename: string;
  blob: Blob;
  cleanup: () => Promise<void>;
}

interface NpfRow {
  blocks: number[];
  mode?: { type: 'weighted' };
}

const TUMBLR_VIDEO_TIMEOUT_MS = 10 * 60_000;

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
  const { http } = config;

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
      const blogIdentifier = (account.meta.blogName as string | undefined) ?? account.externalId;
      const blocks: NpfBlock[] = [];
      const bufferedUploads: BufferedUploadPart[] = [];
      const fileUploads: FileUploadPart[] = [];

      try {
        if (input.text.trim().length > 0) {
          blocks.push({
            type: 'text',
            text: input.text.trim(),
          });
        }

        for (const [index, m] of input.media.entries()) {
          if (m.kind === 'video') {
            const identifier = `media-${String(index)}`;
            const file = await http.downloadFile(m.readUrl, {
              maxBytes: TUMBLR_RULES.media.video?.maxBytes ?? 500 * MB,
              type: m.mime,
              timeoutMs: TUMBLR_VIDEO_TIMEOUT_MS,
            });
            fileUploads.push({
              identifier,
              filename: mediaFilename(identifier, m.mime),
              blob: file.blob,
              cleanup: file.cleanup,
            });
            blocks.push({
              type: 'video',
              media: {
                type: m.mime,
                identifier,
                ...(m.width === null ? {} : { width: m.width }),
                ...(m.height === null ? {} : { height: m.height }),
              },
            });
          } else {
            const identifier = `media-${String(index)}`;
            const bytes = await http.download(m.readUrl, { maxBytes: TUMBLR_IMAGE_PREP.maxBytes });
            bufferedUploads.push({
              identifier,
              filename: mediaFilename(identifier, m.mime),
              mime: m.mime,
              bytes,
            });
            blocks.push({
              type: 'image',
              media: [
                {
                  type: m.mime,
                  identifier,
                  ...(m.width === null ? {} : { width: m.width }),
                  ...(m.height === null ? {} : { height: m.height }),
                },
              ],
              ...(m.altText ? { alt_text: m.altText } : {}),
            });
          }
        }

        if (input.link && input.link.trim().length > 0) {
          blocks.push({
            type: 'link',
            url: input.link.trim(),
          });
        }

        const payload: Record<string, unknown> = {
          content: blocks,
          state: 'published',
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
        if (bufferedUploads.length > 0 || fileUploads.length > 0) {
          const form = new FormData();
          form.set('json', JSON.stringify(payload));
          for (const upload of bufferedUploads) {
            form.set(
              upload.identifier,
              new Blob([upload.bytes], { type: upload.mime }),
              upload.filename,
            );
          }
          for (const upload of fileUploads) {
            form.set(upload.identifier, upload.blob, upload.filename);
          }
          res = await http.request<PostResponse>({
            ...request,
            multipart: form,
            ...(fileUploads.length > 0 ? { timeoutMs: TUMBLR_VIDEO_TIMEOUT_MS } : {}),
          });
        } else {
          res = await http.request<PostResponse>({ ...request, json: payload });
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

        const blogUrl = typeof account.meta.url === 'string' ? account.meta.url : null;
        const permalink = blogUrl
          ? `${blogUrl.replace(/\/$/, '')}/post/${postId}`
          : `https://${blogIdentifier}.tumblr.com/post/${postId}`;

        return {
          externalId: postId,
          permalink,
          warnings: [],
        };
      } finally {
        await Promise.all(fileUploads.map((upload) => upload.cleanup()));
      }
    },
  };
}
