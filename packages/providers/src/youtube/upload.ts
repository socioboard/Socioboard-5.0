import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { AccountCredentials, PublishMedia } from '../types';
import { youtubeError } from './errors';

export const YOUTUBE_UPLOAD_API = 'https://www.googleapis.com/upload/youtube/v3/videos';

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  privacy: 'public' | 'unlisted' | 'private';
  tags: string[];
  madeForKids: boolean;
}

interface YouTubeVideoResource {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
  };
}

/**
 * Uploads a video to YouTube using Google's Resumable Upload protocol.
 * 1. POST to /upload/youtube/v3/videos with uploadType=resumable and metadata in body.
 * 2. Get upload URI from Location header.
 * 3. PUT video bytes to upload URI.
 */
export async function uploadYouTubeVideo(
  http: HttpClient,
  media: PublishMedia,
  metadata: YouTubeVideoMetadata,
  account: AccountCredentials,
): Promise<string> {
  const bearer = { authorization: `Bearer ${account.accessToken}` };

  // 1. Download video bytes
  const bytes = await http.download(media.readUrl, {
    maxBytes: media.sizeBytes || 256 * 1024 * 1024,
  });

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
        categoryId: '22', // People & Blogs (standard default)
      },
      status: {
        privacyStatus: metadata.privacy,
        selfDeclaredMadeForKids: metadata.madeForKids,
      },
    },
    headers: {
      ...bearer,
      'x-upload-content-type': media.mime !== '' ? media.mime : 'video/*',
      'x-upload-content-length': String(bytes.byteLength),
    },
  });

  if (!initRes.ok) {
    throw youtubeError(initRes, 'initiating video upload');
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    // If the API directly completed (some mock environments)
    if (initRes.body.id) return initRes.body.id;
    throw new ProviderError({
      kind: 'retryable',
      message: 'YouTube did not provide a resumable upload location',
    });
  }

  // 3. Upload video bytes to the session location
  const uploadRes = await http.request<YouTubeVideoResource>({
    method: 'PUT',
    url: uploadUrl,
    bytes,
    headers: {
      'content-type': media.mime !== '' ? media.mime : 'video/mp4',
      'content-range': `bytes 0-${bytes.byteLength - 1}/${bytes.byteLength}`,
    },
    timeoutMs: 300_000,
  });

  if (!uploadRes.ok || !uploadRes.body.id) {
    throw youtubeError(uploadRes, 'uploading video bytes');
  }

  return uploadRes.body.id;
}
