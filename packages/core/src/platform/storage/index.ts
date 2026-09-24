import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
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
  /** Single-request browser upload (small files). */
  presignPut(key: string, contentType: string, expiresInSec?: number): Promise<string>;
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
  });
  const Bucket = config.bucket;

  return {
    bucket: Bucket,

    presignPut: (key, contentType, expiresIn = FIFTEEN_MINUTES) =>
      getSignedUrl(client, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType }), {
        expiresIn,
      }),

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

    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
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
