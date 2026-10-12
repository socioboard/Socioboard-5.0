import { openAsBlob } from 'node:fs';

import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { AccountCredentials, PublishMedia } from '../types';
import { pinterestError } from './errors';

const MB = 1024 * 1024;

/**
 * Video Pins (help.pinterest.com "Review Pin specs", checked 2026-10-09): 4 seconds to 5 minutes;
 * the 15 minutes and 2 GB often quoted are Pinterest's ad specs. The 100 MB is ours: sending the
 * form holds the whole file in memory (see `uploadVideo`), and the publishing worker runs 10 jobs
 * at once, so this keeps a few video pins together from exhausting it.
 */
export const PINTEREST_VIDEO = { minSec: 4, maxSec: 5 * 60, maxBytes: 100 * MB };

/** The video types Pinterest's upload takes (.mp4, .mov, .m4v). */
export const PINTEREST_VIDEO_MIMES: readonly string[] = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
];

/**
 * Waiting for Pinterest to process an upload: the first check after 5 s, then ×1.5 up to 30 s
 * apart, at most 15 checks (about 6 minutes). Status checks are reads, which Pinterest allows far
 * more of than writes, but Trial access counts every call against 1,000 a day for the whole app.
 */
export const PINTEREST_VIDEO_WAIT = { firstMs: 5_000, maxMs: 30_000, maxChecks: 15 };

/** How the video upload waits for Pinterest's processing; tests make it instant. */
export interface PinterestVideoOptions {
  sleep?: (ms: number) => Promise<void>;
  /** First wait between status checks (PINTEREST_VIDEO_WAIT.firstMs). */
  pollIntervalMs?: number;
  /** Status checks before the try gives up and is retried later (PINTEREST_VIDEO_WAIT.maxChecks). */
  maxChecks?: number;
}

/** Reading and sending a file this size can take a while; the default 60 s is for API calls. */
const TRANSFER_TIMEOUT_MS = 10 * 60_000;

interface Registered {
  media_id?: string;
  upload_url?: string;
  upload_parameters?: Record<string, string>;
}

interface MediaStatus {
  status?: 'registered' | 'processing' | 'succeeded' | 'failed';
}

/**
 * Uploads one video and waits until Pinterest has processed it; returns the `media_id` the pin is
 * created with (`media_source.source_type: 'video_id'`). Called by pins.ts `publish`. Pinterest's
 * steps (developers.pinterest.com, "Create boards and Pins", checked 2026-10-09):
 * 1. register: `POST /media` → `media_id`, an `upload_url` (Pinterest's storage) and its
 *    `upload_parameters` (a signed form);
 * 2. upload: a multipart POST to `upload_url` with every parameter as given and the file last as
 *    `file`; it carries its own signature, so no Bearer token; 204 when stored. The download goes
 *    to a temporary local copy (`http.withFile`) rather than memory, and the form reads it with
 *    `openAsBlob`. Sending still holds the file in memory once: Node's fetch reads the whole body
 *    before it's sent, for FormData and for a streamed body alike (measured 2026-10-12, Node 24:
 *    a 600 MB upload grew memory by ~600 MB; node:http with `pipeline` by 13 MB). Hence the
 *    100 MB cap (PINTEREST_VIDEO); a streamed upload outside fetch would lift it;
 * 3. wait: `GET /media/{id}` until `succeeded` (PINTEREST_VIDEO_WAIT). `failed` fails the post;
 *    still processing after the last check is retried later, which uploads again.
 */
export async function uploadVideo(
  http: HttpClient,
  api: string,
  account: AccountCredentials,
  media: PublishMedia,
  options: PinterestVideoOptions = {},
): Promise<string> {
  const auth = { authorization: `Bearer ${account.accessToken}` };
  const reg = await http.request<Registered>({
    method: 'POST',
    url: `${api}/media`,
    headers: auth,
    json: { media_type: 'video' },
  });
  const { media_id: id, upload_url: uploadUrl, upload_parameters: params } = reg.body;
  if (!reg.ok || !id || !uploadUrl) throw pinterestError(reg, 'video upload');

  const up = await http.withFile(
    media.readUrl,
    { maxBytes: PINTEREST_VIDEO.maxBytes, timeoutMs: TRANSFER_TIMEOUT_MS },
    async (path) => {
      const form = new FormData();
      for (const [key, value] of Object.entries(params ?? {})) form.append(key, value);
      // A Blob backed by the file; fetch still reads all of it into memory to send it.
      form.append('file', await openAsBlob(path, { type: media.mime }), 'video');
      return http.request({
        method: 'POST',
        url: uploadUrl,
        multipart: form,
        timeoutMs: TRANSFER_TIMEOUT_MS,
      });
    },
  );
  // Pinterest's storage answers in its own (XML) words. Only its own failures (5xx) can pass on
  // a later try; a refusal (bad signature 403, too large 413, malformed 400) would repeat. No
  // answer at all (a timeout) is already `retryable` from the HTTP client.
  if (!up.ok) {
    throw new ProviderError({
      kind: up.status >= 500 ? 'retryable' : 'content',
      message: `Pinterest's video storage refused the upload (HTTP ${String(up.status)})`,
      status: up.status,
    });
  }

  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const maxChecks = options.maxChecks ?? PINTEREST_VIDEO_WAIT.maxChecks;
  let wait = options.pollIntervalMs ?? PINTEREST_VIDEO_WAIT.firstMs;
  for (let check = 1; ; check++) {
    // Wait first: a video is never processed the moment it's stored.
    await sleep(wait);
    const res = await http.request<MediaStatus>({
      url: `${api}/media/${encodeURIComponent(id)}`,
      headers: auth,
    });
    if (!res.ok) throw pinterestError(res, 'video processing');
    if (res.body.status === 'succeeded') return id;
    if (res.body.status === 'failed') {
      throw new ProviderError({
        kind: 'content',
        message: "Pinterest couldn't process the video. Check it plays, then upload it again.",
      });
    }
    if (check >= maxChecks) {
      throw new ProviderError({
        kind: 'retryable',
        message: 'Pinterest is still processing the video',
      });
    }
    wait = Math.min(wait * 1.5, PINTEREST_VIDEO_WAIT.maxMs);
  }
}
