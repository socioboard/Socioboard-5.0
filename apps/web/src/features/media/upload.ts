import {
  apiRoutes,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_KINDS,
  MediaMime,
  type MediaAsset,
  type MediaKind,
} from '@socioboard/contracts';

import { api, ApiError } from '../../lib/api';

/** What `<input type="file" accept>` offers: the types the API takes. */
export const MEDIA_ACCEPT = Object.keys(MEDIA_MIME_KINDS).join(',');

/** A file we won't send, and why (shown on its tile with the limit). */
export type RejectReason = { code: 'type' } | { code: 'size'; kind: MediaKind; maxBytes: number };

/** Checks a file against the API's own limits before any request. */
export function checkFile(file: File): RejectReason | null {
  const mime = MediaMime.safeParse(file.type);
  if (!mime.success) return { code: 'type' };
  const kind = MEDIA_MIME_KINDS[mime.data];
  const maxBytes = MEDIA_MAX_BYTES[kind];
  return file.size > maxBytes ? { code: 'size', kind, maxBytes } : null;
}

/** Parts upload three at a time: faster than one, gentle on slow connections. */
const PART_CONCURRENCY = 3;

/**
 * Uploads one file into the workspace's media library: start the upload, PUT the bytes straight to
 * storage (one request, or 16 MB parts for large files), then confirm. `onProgress` gets 0–100.
 * Aborting `signal` stops the requests in flight; the half-made asset is cleaned up by the server's
 * nightly purge.
 */
export async function uploadMedia(
  workspaceId: string,
  file: File,
  options: {
    folderId?: string | undefined;
    onProgress: (percent: number) => void;
    signal: AbortSignal;
  },
): Promise<MediaAsset> {
  const { folderId, onProgress, signal } = options;
  const mime = MediaMime.parse(file.type);
  const started = await api(apiRoutes.media.createUpload, {
    params: { workspaceId },
    body: { fileName: file.name, mime, sizeBytes: file.size, ...(folderId ? { folderId } : {}) },
    signal,
  });
  const assetId = started.asset.id;
  const upload = started.upload;

  if (upload.type === 'single') {
    await put(upload.url, file, upload.headers, signal, (loaded) => {
      onProgress((loaded / file.size) * 100);
    });
    onProgress(100);
    return api(apiRoutes.media.completeUpload, {
      params: { workspaceId, assetId },
      body: {},
      signal,
    });
  }

  // Multipart: each part reports its own bytes; progress is their sum.
  const loaded = new Map<number, number>();
  const report = () => {
    let sum = 0;
    for (const bytes of loaded.values()) sum += bytes;
    onProgress((sum / file.size) * 100);
  };
  const queue = [...upload.parts];
  const done: { partNumber: number; etag: string }[] = [];
  const worker = async () => {
    for (let part = queue.shift(); part; part = queue.shift()) {
      const start = (part.partNumber - 1) * upload.partSize;
      const blob = file.slice(start, start + upload.partSize);
      const partNumber = part.partNumber;
      const etag = await put(part.url, blob, {}, signal, (bytes) => {
        loaded.set(partNumber, bytes);
        report();
      });
      // Storage must expose the ETag header to the browser (bucket CORS; docs/infra.md).
      if (!etag) throw new ApiError(0, 'UPLOAD_FAILED', 'Missing ETag', undefined);
      done.push({ partNumber, etag });
    }
  };
  await Promise.all(Array.from({ length: Math.min(PART_CONCURRENCY, queue.length) }, worker));
  done.sort((a, b) => a.partNumber - b.partNumber);
  return api(apiRoutes.media.completeUpload, {
    params: { workspaceId, assetId },
    body: { parts: done },
    signal,
  });
}

/** One PUT with upload progress (fetch can't report it); resolves with the ETag, if exposed. */
function put(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  signal: AbortSignal,
  onProgress: (loadedBytes: number) => void,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      onProgress(event.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.getResponseHeader('ETag'));
      else reject(new ApiError(xhr.status, 'UPLOAD_FAILED', 'Upload failed', undefined));
    };
    xhr.onerror = () => {
      reject(new ApiError(0, 'UPLOAD_FAILED', 'Upload failed', undefined));
    };
    xhr.onabort = () => {
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', () => {
      xhr.abort();
    });
    xhr.send(body);
  });
}
