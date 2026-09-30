import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Config } from '../config';

export type StorageConfig = NonNullable<Config['storage']>;

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
  close(): void;
}

const FIFTEEN_MINUTES = 15 * 60;
const ONE_HOUR = 60 * 60;

/** S3 client for Amazon S3, or MinIO / any S3-compatible service via `endpoint`. */
export function createStorage(config: StorageConfig): Storage {
  const client = new S3Client({
    region: config.region,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    forcePathStyle: config.forcePathStyle,
    ...(config.credentials ? { credentials: config.credentials } : {}),
    // Checksums only where S3 requires them. By default the SDK signs a CRC32 of the request body
    // into presigned URLs, and for a URL signed before the upload that's the checksum of nothing:
    // AWS ignores it, but S3-compatible stores that check it (RustFS) refuse every browser upload.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  const Bucket = config.bucket;

  return {
    bucket: Bucket,

    presignPut: (key, contentType, { expiresInSec = FIFTEEN_MINUTES, contentLength } = {}) =>
      getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket,
          Key: key,
          ContentType: contentType,
          ...(contentLength === undefined ? {} : { ContentLength: contentLength }),
        }),
        // Sign the length header too, or S3 would accept any size.
        { expiresIn: expiresInSec, signableHeaders: new Set(['content-type', 'content-length']) },
      ),

    async createMultipart(key, contentType) {
      const res = await client.send(
        new CreateMultipartUploadCommand({ Bucket, Key: key, ContentType: contentType }),
      );
      if (!res.UploadId) throw new Error('S3 did not return an UploadId');
      return res.UploadId;
    },

    presignPart: (key, uploadId, partNumber, expiresIn = ONE_HOUR) =>
      getSignedUrl(
        client,
        new UploadPartCommand({ Bucket, Key: key, UploadId: uploadId, PartNumber: partNumber }),
        { expiresIn },
      ),

    async completeMultipart(key, uploadId, parts) {
      await client.send(
        new CompleteMultipartUploadCommand({
          Bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: [...parts]
              .sort((a, b) => a.partNumber - b.partNumber)
              .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
          },
        }),
      );
    },

    async abortMultipart(key, uploadId) {
      await client.send(new AbortMultipartUploadCommand({ Bucket, Key: key, UploadId: uploadId }));
    },

    presignGet: (key, expiresIn = ONE_HOUR) =>
      getSignedUrl(client, new GetObjectCommand({ Bucket, Key: key }), { expiresIn }),

    async head(key) {
      try {
        const res = await client.send(new HeadObjectCommand({ Bucket, Key: key }));
        return { size: res.ContentLength ?? 0, contentType: res.ContentType, etag: res.ETag };
      } catch (err) {
        if (err instanceof NotFound) return undefined;
        throw err;
      }
    },

    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }),
      );
    },

    async getBytes(key, maxBytes) {
      const res = await client.send(new GetObjectCommand({ Bucket, Key: key }));
      if ((res.ContentLength ?? 0) > maxBytes) {
        res.Body?.transformToWebStream()
          .cancel()
          .catch(() => undefined);
        throw new Error(`Object ${key} is larger than ${String(maxBytes)} bytes`);
      }
      if (!res.Body) throw new Error(`Object ${key} has no body`);
      return Buffer.from(await res.Body.transformToByteArray());
    },

    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
    },

    async deletePrefix(prefix) {
      // A slip here would empty the bucket: only whole folders, never "" or a bare word.
      if (!/^[^/]+\/.+\/$|^[^/]+\/$/.test(prefix) || prefix.length < 12) {
        throw new Error(`Refusing to delete by prefix "${prefix}"`);
      }
      let deleted = 0;
      let token: string | undefined;
      do {
        const page = await client.send(
          new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken: token }),
        );
        const keys = (page.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
        if (keys.length > 0) {
          await client.send(
            new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys, Quiet: true } }),
          );
          deleted += keys.length;
        }
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
      } while (token);
      return deleted;
    },

    async ping() {
      try {
        await client.send(new HeadBucketCommand({ Bucket }));
        return true;
      } catch {
        return false;
      }
    },

    close: () => {
      client.destroy();
    },
  };
}

/**
 * Turns a stored image reference into a URL the browser can load: storage keys become short-lived
 * signed URLs (objects are private); absolute URLs (e.g. a Google avatar) pass through; without
 * storage or a value, null.
 */
export function createUrlSigner(storage: Storage | undefined, expiresInSec = 60 * 60) {
  return async (value: string | null | undefined): Promise<string | null> => {
    if (!value) return null;
    if (/^https?:\/\//.test(value)) return value;
    return storage ? storage.presignGet(value, expiresInSec) : null;
  };
}
