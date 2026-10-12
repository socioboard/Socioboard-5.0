import { ProviderError } from '../errors';
import type { HttpClient, HttpResponse } from '../http';
import type { AccountCredentials, PublishMedia } from '../types';
import { youtubeError } from './errors';

export const YOUTUBE_UPLOAD_API = 'https://www.googleapis.com/upload/youtube/v3/videos';

/**
 * Google Resumable Upload chunks must be multiples of 256 KB (except the last chunk).
 * 8 MB (32 * 256 KB) is an optimal balance between memory usage and HTTP round-trips.
 */
export const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024;

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  privacy: 'public' | 'unlisted' | 'private';
  tags: string[];
  madeForKids: boolean;
}

export interface YouTubeVideoResource {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
  };
}

export interface UploadOptions {
  chunkSize?: number;
  /** Resume an existing session URL if resuming after a crash/retry */
  existingSessionUrl?: string;
}

/**
 * Asks the upload session where it got to (PUT with Content-Range: bytes * / <size>).
 * Google responds with:
 * - 200/201 with the video resource if the entire file was already uploaded.
 * - 308 Resume Incomplete with Range header (e.g. `bytes=0-1048575`) if partially received.
 */
export async function queryUploadStatus(
  http: HttpClient,
  uploadUrl: string,
  totalBytes: number,
): Promise<{ complete: boolean; videoId?: string; nextOffset: number }> {
  const statusRes = await http.request<YouTubeVideoResource>({
    method: 'PUT',
    url: uploadUrl,
    headers: {
      'content-range': `bytes */${String(totalBytes)}`,
    },
    timeoutMs: 60_000,
  });

  if ((statusRes.status === 200 || statusRes.status === 201) && statusRes.body.id) {
    return { complete: true, videoId: statusRes.body.id, nextOffset: totalBytes };
  }

  if (statusRes.status === 308) {
    const rangeHeader = statusRes.headers.get('range');
    if (rangeHeader) {
      const match = /bytes=0-(\d+)/.exec(rangeHeader);
      if (match?.[1]) {
        return { complete: false, nextOffset: Number(match[1]) + 1 };
      }
    }
    return { complete: false, nextOffset: 0 };
  }

  if (!statusRes.ok) {
    throw youtubeError(statusRes, 'checking upload status');
  }

  return { complete: false, nextOffset: 0 };
}

/**
 * Uploads a video to YouTube using Google's Resumable Upload protocol in chunks:
 * 1. POST to /upload/youtube/v3/videos to initiate a session and get Location URI.
 * 2. Download and PUT video bytes in 8–16 MB chunks (multiple of 256 KB).
 * 3. Handle 308 Resume Incomplete answers and advance offset.
 * 4. If a chunk PUT times out or fails, query upload status before retrying to prevent duplicate videos.
 */
export async function uploadYouTubeVideo(
  http: HttpClient,
  media: PublishMedia,
  metadata: YouTubeVideoMetadata,
  account: AccountCredentials,
  options: UploadOptions = {},
): Promise<string> {
  const totalBytes = media.sizeBytes;
  if (!totalBytes || totalBytes <= 0) {
    throw new ProviderError({
      kind: 'content',
      message: 'Video file size is required for YouTube upload',
    });
  }

  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const bearer = { authorization: `Bearer ${account.accessToken}` };

  let uploadUrl = options.existingSessionUrl;
  let offset = 0;

  // 1. If an existing session URL was passed, query its status first
  if (uploadUrl) {
    const status = await queryUploadStatus(http, uploadUrl, totalBytes);
    if (status.complete && status.videoId) {
      return status.videoId;
    }
    offset = status.nextOffset;
  } else {
    // 2. Initiate resumable upload session
    const initRes = await http.request<{ id?: string }>({
      method: 'POST',
      url: YOUTUBE_UPLOAD_API,
      query: {
        uploadType: 'resumable',
        part: 'snippet,status',
      },
      json: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags.length > 0 ? metadata.tags : undefined,
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: metadata.privacy,
          selfDeclaredMadeForKids: metadata.madeForKids,
        },
      },
      headers: {
        ...bearer,
        'x-upload-content-type': media.mime !== '' ? media.mime : 'video/*',
        'x-upload-content-length': String(totalBytes),
      },
    });

    if (!initRes.ok) {
      throw youtubeError(initRes, 'initiating video upload');
    }

    const loc = initRes.headers.get('location');
    if (!loc) {
      if (initRes.body.id) return initRes.body.id;
      throw new ProviderError({
        kind: 'retryable',
        message: 'YouTube did not provide a resumable upload location',
      });
    }
    uploadUrl = loc;
  }

  // 3. Upload chunks
  while (offset < totalBytes) {
    const chunkEnd = Math.min(offset + chunkSize, totalBytes);
    const length = chunkEnd - offset;

    // Download only the current byte range into memory
    const chunk = await http.download(media.readUrl, {
      range: { start: offset, end: chunkEnd },
      maxBytes: length,
      timeoutMs: 120_000,
    });

    let uploadRes: HttpResponse<YouTubeVideoResource>;
    try {
      uploadRes = await http.request<YouTubeVideoResource>({
        method: 'PUT',
        url: uploadUrl,
        bytes: chunk,
        headers: {
          'content-type': media.mime !== '' ? media.mime : 'video/mp4',
          'content-range': `bytes ${String(offset)}-${String(chunkEnd - 1)}/${String(totalBytes)}`,
        },
        timeoutMs: 300_000,
      });
    } catch {
      // Timeout or network drop: check where Google got to before retrying to avoid posting duplicate videos
      const status = await queryUploadStatus(http, uploadUrl, totalBytes);
      if (status.complete && status.videoId) {
        return status.videoId;
      }
      offset = status.nextOffset;
      continue;
    }

    // Finished
    if (uploadRes.status === 200 || uploadRes.status === 201) {
      if (uploadRes.body.id) return uploadRes.body.id;
      throw new ProviderError({
        kind: 'retryable',
        message: 'YouTube upload completed without returning a video id',
      });
    }

    // 308 Resume Incomplete
    if (uploadRes.status === 308) {
      const rangeHeader = uploadRes.headers.get('range');
      if (rangeHeader) {
        const match = /bytes=0-(\d+)/.exec(rangeHeader);
        if (match?.[1]) {
          offset = Number(match[1]) + 1;
          continue;
        }
      }
      offset = chunkEnd;
      continue;
    }

    throw youtubeError(uploadRes, 'uploading video chunk');
  }

  // Final check if loop ended
  const finalStatus = await queryUploadStatus(http, uploadUrl, totalBytes);
  if (finalStatus.complete && finalStatus.videoId) {
    return finalStatus.videoId;
  }

  throw new ProviderError({
    kind: 'retryable',
    message: 'YouTube upload finished but video was not found',
  });
}
