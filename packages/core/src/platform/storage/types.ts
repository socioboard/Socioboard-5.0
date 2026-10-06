import type { Readable } from 'node:stream';

export interface ObjectInfo {
  size: number;
  contentType: string | undefined;
  etag: string | undefined;
}

export interface Storage {
  readonly bucket: string;
  /**
   * Single-request browser upload (small files). With `contentLength`, the signature only accepts
   * a body of exactly that size, so a URL issued for a 2 MB image can't carry 1 GB.
   */
  presignPut(
    key: string,
    contentType: string,
    options?: { expiresInSec?: number; contentLength?: number },
  ): Promise<string>;
  /** Large files: start, presign each part, then complete (or abort). */
  createMultipart(key: string, contentType: string): Promise<string>;
  presignPart(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresInSec?: number,
  ): Promise<string>;
  completeMultipart(
    key: string,
    uploadId: string,
    parts: { partNumber: number; etag: string }[],
  ): Promise<void>;
  abortMultipart(key: string, uploadId: string): Promise<void>;
  /** Time-limited download URL; networks that pull media (Instagram, TikTok) fetch these. */
  presignGet(key: string, expiresInSec?: number): Promise<string>;
  head(key: string): Promise<ObjectInfo | undefined>;
  delete(key: string): Promise<void>;
  /**
   * Deletes every object whose key starts with `prefix` (an asset's folder: original, thumbnail,
   * converted copies; or a whole workspace); returns how many. `prefix` must end with "/".
   */
  deletePrefix(prefix: string): Promise<number>;
  /** Server-side write (thumbnails and other generated files). */
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Server-side read into memory; refuses objects larger than `maxBytes`. */
  getBytes(key: string, maxBytes: number): Promise<Buffer>;
  /** Bucket reachable with our credentials (health endpoint). */
  ping(): Promise<boolean>;
  /**
   * Set when browsers upload through our API instead of straight to storage (the NAS driver):
   * takes the body sent to a URL from presignPut/presignPart and answers its ETag, as S3 would.
   * Throws UploadRefused for a bad link or body.
   */
  acceptUpload?(
    token: string,
    body: Readable,
    headers: { contentType: string | undefined; contentLength: number | undefined },
  ): Promise<{ etag: string }>;
  close(): void;
}
