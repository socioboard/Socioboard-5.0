import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type {
  AccountCredentials,
  ContentInput,
  ImagePrep,
  PublishMedia,
  PublishResult,
} from '../types';
import { linkedinError } from './errors';
import { LINKEDIN_API } from './login';

// Publishing through LinkedIn's Posts API (learn.microsoft.com/linkedin, Posts API and "little Text
// Format", checked 2026-10-08), shared by the profile network (person.ts) and, later, company
// pages: the two differ only in the post's author URN.

/**
 * The API version sent on every REST call (`LinkedIn-Version`, YYYYMM). LinkedIn retires each
 * version about a year after release and then answers 426 (errors.ts); bump it after checking the
 * docs' migration notes. 202609 was the newest on 2026-10-08.
 */
export const LINKEDIN_VERSION = '202609';

/** Headers every versioned (`/rest`) call needs. */
export function restHeaders(account: AccountCredentials): Record<string, string> {
  return {
    authorization: `Bearer ${account.accessToken}`,
    'linkedin-version': LINKEDIN_VERSION,
    'x-restli-protocol-version': '2.0.0',
  };
}

/** Characters `little` reserves; each must be escaped with a backslash to stay plain text. */
const RESERVED = /[|{}@[\]()<>#\\*_~]/g;
/**
 * A hashtag as people type it: `#` and letters or digits, not glued to a word before it (so
 * `(#launch` and `"#launch"` are hashtags, `C#` isn't). It ends at anything else: `#coffee_time` is
 * the hashtag `#coffee` and an escaped `_time`, because whether LinkedIn's format takes an
 * unescaped `_` inside a hashtag isn't documented (it lists `_` as reserved).
 */
const HASHTAG = /(?<![\p{L}\p{N}_])#[\p{L}\p{N}]+/gu;

const escape = (text: string) => text.replace(RESERVED, (c) => `\\${c}`);

/**
 * The post's text in LinkedIn's `little` format. Unescaped reserved characters are read as markup:
 * a stray `(` or `[` can make LinkedIn cut the post short. Hashtags stay as typed, so they work;
 * mentions aren't offered, so every `@` is plain text.
 */
export function linkedinCommentary(text: string): string {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(HASHTAG)) {
    out += escape(text.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + escape(text.slice(last));
}

/**
 * The text LinkedIn receives, before escaping: the post's text, with its link added when the text
 * doesn't have it. LinkedIn's API doesn't fetch link previews (a card needs a title and a thumbnail
 * we'd have to supply), so the link stays clickable text.
 */
export function linkedinPostText(input: Pick<ContentInput, 'text' | 'link'>): string {
  const text = input.text.trim();
  if (!input.link || text.includes(input.link)) return text;
  return text === '' ? input.link : `${text}\n\n${input.link}`;
}

/** Where a post can be seen, from its URN (`urn:li:share:…` or `urn:li:ugcPost:…`). */
export const linkedinPermalink = (urn: string) => `https://www.linkedin.com/feed/update/${urn}/`;

const MB = 1024 * 1024;

/**
 * What we send LinkedIn's Images API: JPEG or PNG (it also takes GIF, not offered yet), under
 * 36,152,320 pixels. The worker fits other images to this before publishing. LinkedIn publishes
 * no byte limit; 10 MB is ours (as Facebook's), and 4,096 px wide keeps a 48-megapixel phone photo
 * under the pixel limit (the feed shows them at most about 1,200 px wide anyway).
 */
export const LINKEDIN_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png'],
  maxWidth: 4096,
  maxBytes: 10 * MB,
};

/** A post holds one photo, or 2–20 as LinkedIn's MultiImage. */
export const LINKEDIN_MAX_IMAGES = 20;

interface InitializedUpload {
  value?: { uploadUrl?: string; image?: string };
}

/**
 * Uploads one photo and returns its `urn:li:image:…` for the post. Two calls: register the upload
 * (owned by the post's author), then PUT the bytes to the URL LinkedIn gives, with the token (image
 * uploads need it; video uploads refuse it). LinkedIn processes the photo afterwards and a token
 * with only `w_member_social` can't ask how that went, so the post is created straight after.
 */
export async function uploadImage(
  http: HttpClient,
  account: AccountCredentials,
  owner: string,
  media: PublishMedia,
): Promise<string> {
  const init = await http.request<InitializedUpload>({
    method: 'POST',
    url: `${LINKEDIN_API}/rest/images`,
    query: { action: 'initializeUpload' },
    json: { initializeUploadRequest: { owner } },
    headers: restHeaders(account),
  });
  const uploadUrl = init.body.value?.uploadUrl;
  const image = init.body.value?.image;
  if (!init.ok || !uploadUrl || !image) throw linkedinError(init, 'photo upload');

  const bytes = await http.download(media.readUrl, { maxBytes: LINKEDIN_IMAGE_PREP.maxBytes });
  const put = await http.request({
    method: 'PUT',
    url: uploadUrl,
    bytes,
    headers: {
      authorization: `Bearer ${account.accessToken}`,
      'content-type': 'application/octet-stream',
    },
    timeoutMs: 120_000,
  });
  if (!put.ok) throw linkedinError(put, 'photo upload');
  return image;
}

/** LinkedIn's video limits (Videos API, checked 2026-10-08): 3 seconds to 30 minutes, up to 500 MB. */
export const LINKEDIN_VIDEO = { minSec: 3, maxSec: 30 * 60, maxBytes: 500 * MB };

/**
 * Waiting for LinkedIn to process a video. Every status check is one of the member's 150 calls a
 * day, and a try that gives up is retried from the upload (5 tries), so the checks are few and far
 * apart: 10 s, growing ×1.5 to at most 60 s, at most 10 per try (about 7.5 minutes). Worst case,
 * 5 tries × (10 checks + 3 upload calls + parts) ≈ 70 calls: half a day's allowance, not all of it.
 */
export const LINKEDIN_VIDEO_WAIT = { firstMs: 10_000, maxMs: 60_000, maxChecks: 10 };

/** How the video upload waits for LinkedIn's processing; tests make it instant. */
export interface LinkedInVideoOptions {
  sleep?: (ms: number) => Promise<void>;
  /** First wait between status checks (LINKEDIN_VIDEO_WAIT.firstMs). */
  pollIntervalMs?: number;
  /** Status checks before the try gives up and is retried later (LINKEDIN_VIDEO_WAIT.maxChecks). */
  maxChecks?: number;
}

/**
 * When LinkedIn won't say whether a video is processed (403), how long to wait before posting: 10 s
 * and 1 s per MB, at most 2 minutes. If it's still not ready, LinkedIn refuses the post and that
 * refusal is retried (errors.ts), so this only makes the first try more likely to work.
 */
export const unknownStatusWaitMs = (sizeBytes: number) =>
  Math.min(10_000 + Math.ceil(sizeBytes / MB) * 1000, 120_000);

interface InitializedVideo {
  value?: {
    video?: string;
    uploadToken?: string;
    uploadInstructions?: { uploadUrl: string; firstByte: number; lastByte: number }[];
  };
}

interface VideoStatus {
  status?: 'WAITING_UPLOAD' | 'PROCESSING' | 'AVAILABLE' | 'PROCESSING_FAILED';
  processingFailureReason?: string;
}

/**
 * Uploads one video and returns its `urn:li:video:…` once LinkedIn can show it:
 * 1. register it with its size; LinkedIn answers the parts to send (4 MB byte ranges, one URL each);
 * 2. PUT each part, read by byte range from our storage, *without* the token (LinkedIn's video
 *    upload URLs refuse it), keeping each answer's ETag: it identifies the part;
 * 3. finalize with the ETags in order;
 * 4. ask for its status until AVAILABLE, a few times and far apart (LINKEDIN_VIDEO_WAIT). If LinkedIn
 *    won't tell us (403: the token's `w_member_social` may not be allowed to read videos, as it
 *    can't read images), wait a time scaled to the file's size (`unknownStatusWaitMs`) and post.
 */
export async function uploadVideo(
  http: HttpClient,
  account: AccountCredentials,
  owner: string,
  media: PublishMedia,
  options: LinkedInVideoOptions = {},
): Promise<string> {
  const init = await http.request<InitializedVideo>({
    method: 'POST',
    url: `${LINKEDIN_API}/rest/videos`,
    query: { action: 'initializeUpload' },
    json: {
      initializeUploadRequest: {
        owner,
        fileSizeBytes: media.sizeBytes,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    },
    headers: restHeaders(account),
  });
  const video = init.body.value?.video;
  const parts = init.body.value?.uploadInstructions ?? [];
  if (!init.ok || !video || parts.length === 0) throw linkedinError(init, 'video upload');

  const etags: string[] = [];
  for (const part of parts) {
    const end = part.lastByte + 1;
    const chunk = await http.download(media.readUrl, {
      range: { start: part.firstByte, end },
      maxBytes: end - part.firstByte,
      timeoutMs: 120_000,
    });
    const put = await http.request({
      method: 'PUT',
      url: part.uploadUrl,
      bytes: chunk,
      headers: { 'content-type': 'application/octet-stream' },
      timeoutMs: 120_000,
    });
    // LinkedIn's sample sends the ETag bare; S3-style answers quote it. Finalize wants it bare.
    const etag = put.headers.get('etag')?.replace(/^"|"$/g, '');
    if (!put.ok || !etag) throw linkedinError(put, 'video upload');
    etags.push(etag);
  }

  const fin = await http.request({
    method: 'POST',
    url: `${LINKEDIN_API}/rest/videos`,
    query: { action: 'finalizeUpload' },
    json: {
      finalizeUploadRequest: {
        video,
        uploadToken: init.body.value?.uploadToken ?? '',
        uploadedPartIds: etags,
      },
    },
    headers: restHeaders(account),
  });
  if (!fin.ok) throw linkedinError(fin, 'video upload');

  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const maxChecks = options.maxChecks ?? LINKEDIN_VIDEO_WAIT.maxChecks;
  let wait = options.pollIntervalMs ?? LINKEDIN_VIDEO_WAIT.firstMs;
  for (let check = 1; ; check++) {
    // Wait first: a video is never processed the moment it's finalized.
    await sleep(wait);
    const res = await http.request<VideoStatus>({
      url: `${LINKEDIN_API}/rest/videos/${encodeURIComponent(video)}`,
      headers: restHeaders(account),
    });
    if (res.status === 403) {
      await sleep(unknownStatusWaitMs(media.sizeBytes));
      return video;
    }
    if (!res.ok) throw linkedinError(res, 'video processing');
    if (res.body.status === 'AVAILABLE') return video;
    if (res.body.status === 'PROCESSING_FAILED') {
      throw new ProviderError({
        kind: 'content',
        message: `LinkedIn couldn't process the video: ${res.body.processingFailureReason ?? 'no reason given'}`,
      });
    }
    if (check >= maxChecks) {
      throw new ProviderError({
        kind: 'retryable',
        message: 'LinkedIn is still processing the video',
      });
    }
    wait = Math.min(wait * 1.5, LINKEDIN_VIDEO_WAIT.maxMs);
  }
}

/** The post's `content` for its uploaded photos, alt text included where people wrote one. */
export function imageContent(
  images: { urn: string; altText: string | null }[],
): Record<string, unknown> {
  const item = (i: { urn: string; altText: string | null }) => ({
    id: i.urn,
    ...(i.altText?.trim() ? { altText: i.altText.trim() } : {}),
  });
  const [only] = images;
  if (only && images.length === 1) return { media: item(only) };
  return { multiImage: { images: images.map(item) } };
}

/**
 * Creates a public post on the main feed. `author` is `urn:li:person:<id>` for a profile or
 * `urn:li:organization:<id>` for a page; `content` is the uploaded media (`imageContent`).
 */
export async function createPost(
  http: HttpClient,
  account: AccountCredentials,
  author: string,
  post: { text: string; content?: Record<string, unknown> },
): Promise<PublishResult> {
  const res = await http.request({
    method: 'POST',
    url: `${LINKEDIN_API}/rest/posts`,
    json: {
      author,
      commentary: linkedinCommentary(post.text),
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      ...(post.content ? { content: post.content } : {}),
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    },
    headers: restHeaders(account),
  });
  if (!res.ok) throw linkedinError(res, 'posting');
  const urn = res.headers.get('x-restli-id');
  if (!urn) {
    // The post exists but we can't point to it. Not retryable: a retry would post it twice.
    throw new ProviderError({
      kind: 'content',
      message:
        'LinkedIn accepted the post without saying where it is; check the profile before posting it again',
      status: res.status,
    });
  }
  return { externalId: urn, permalink: linkedinPermalink(urn), warnings: [] };
}

/** Deletes a post; one that's already gone counts as deleted (LinkedIn's deletes are idempotent). */
export async function deletePost(
  http: HttpClient,
  urn: string,
  account: AccountCredentials,
): Promise<void> {
  const res = await http.request({
    method: 'DELETE',
    url: `${LINKEDIN_API}/rest/posts/${encodeURIComponent(urn)}`,
    headers: { ...restHeaders(account), 'x-restli-method': 'DELETE' },
  });
  if (!res.ok && res.status !== 404) throw linkedinError(res, 'deleting the post');
}
