import type { ImageUploadTicket } from '@socioboard/contracts';

import { ApiError } from './api';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type ImageType = (typeof IMAGE_TYPES)[number];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function isImageType(type: string): type is ImageType {
  return (IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Uploads a small image (avatar, workspace logo) the way the API expects: ask for a presigned URL,
 * PUT the file straight to storage, and return the key to save with a PATCH. Checks type and size
 * first (the same limits the API enforces), so a wrong file fails fast with a clear message.
 */
export async function uploadImage(
  file: File,
  requestTicket: (request: { mime: ImageType; sizeBytes: number }) => Promise<ImageUploadTicket>,
): Promise<string> {
  if (!isImageType(file.type))
    throw new ApiError(400, 'IMAGE_TYPE', 'Unsupported image type', undefined);
  if (file.size > MAX_IMAGE_BYTES)
    throw new ApiError(413, 'IMAGE_TOO_LARGE', 'Image too large', undefined);
  const ticket = await requestTicket({ mime: file.type, sizeBytes: file.size });
  let res: Response;
  try {
    res = await fetch(ticket.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
  } catch {
    throw new ApiError(0, 'UPLOAD_FAILED', 'Upload failed', undefined);
  }
  if (!res.ok) throw new ApiError(res.status, 'UPLOAD_FAILED', 'Upload failed', undefined);
  return ticket.key;
}

/** What `<input type="file" accept>` should offer. */
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
