import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { defineRoute } from './route';

export const MediaKind = z.enum(['image', 'video', 'gif']);
export type MediaKind = z.infer<typeof MediaKind>;

/** Allowed upload types and the kind each becomes (docs/backend/modules/media.md). */
export const MEDIA_MIME_KINDS = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'video/mp4': 'video',
  'video/quicktime': 'video',
} as const satisfies Record<string, MediaKind>;
export const MediaMime = z.enum(
  Object.keys(MEDIA_MIME_KINDS) as [
    keyof typeof MEDIA_MIME_KINDS,
    ...(keyof typeof MEDIA_MIME_KINDS)[],
  ],
);
export type MediaMime = z.infer<typeof MediaMime>;

const MB = 1024 * 1024;
/** Default size limits; a self-hosted install may configure others, and the API has the final say. */
export const MEDIA_MAX_BYTES: Record<MediaKind, number> = {
  image: 20 * MB,
  gif: 20 * MB,
  video: 1024 * MB,
};
/** Files larger than this upload in parts (resumable, parallel); smaller ones in one PUT. */
export const MULTIPART_THRESHOLD_BYTES = 16 * MB;
export const MULTIPART_PART_BYTES = 16 * MB;

export const MediaSource = z.enum(['upload', 'ai', 'discovery']);
/** uploading → processing (after complete) → ready | failed. */
export const MediaStatus = z.enum(['uploading', 'processing', 'ready', 'failed']);

export const MediaAsset = z.object({
  id: Id,
  name: z.string(),
  kind: MediaKind,
  mime: MediaMime,
  sizeBytes: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  durationSec: z.number().nullable(),
  status: MediaStatus,
  source: MediaSource,
  altText: z.string().nullable(),
  folderId: Id.nullable(),
  /** Short-lived signed URLs; objects are private. Null until processing makes them. */
  thumbnailUrl: z.url().nullable(),
  uploadedBy: z.object({ id: Id, name: z.string() }).nullable(),
  createdAt: IsoDateTime,
});
export type MediaAsset = z.infer<typeof MediaAsset>;

/** Details add a signed URL for viewing the full file. */
export const MediaAssetDetails = MediaAsset.extend({ url: z.url().nullable() });
export type MediaAssetDetails = z.infer<typeof MediaAssetDetails>;

const FileName = z.string().trim().min(1).max(255);

export const CreateUploadBody = z
  .object({
    fileName: FileName,
    mime: MediaMime,
    sizeBytes: z.number().int().positive(),
    folderId: Id.optional(),
  })
  .superRefine((b, ctx) => {
    const kind = MEDIA_MIME_KINDS[b.mime];
    if (b.sizeBytes > MEDIA_MAX_BYTES[kind]) {
      ctx.addIssue({
        code: 'custom',
        path: ['sizeBytes'],
        message: `Too large: ${kind} files can be up to ${MEDIA_MAX_BYTES[kind] / MB} MB`,
      });
    }
  });

/** How the browser sends the file: one PUT, or a PUT per part (then complete with ETags). */
export const UploadInstructions = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('single'),
    url: z.url(),
    /** Send exactly these headers with the PUT. */
    headers: z.record(z.string(), z.string()),
  }),
  z.object({
    type: z.literal('multipart'),
    partSize: z.number().int(),
    parts: z.array(z.object({ partNumber: z.number().int().min(1), url: z.url() })),
  }),
]);
export type UploadInstructions = z.infer<typeof UploadInstructions>;

export const CreateUploadResponse = z.object({
  asset: MediaAsset,
  upload: UploadInstructions,
  expiresAt: IsoDateTime,
});

export const CompleteUploadBody = z.object({
  /** Multipart only: the ETag S3 returned for each part. */
  parts: z
    .array(z.object({ partNumber: z.number().int().min(1), etag: z.string().min(1) }))
    .min(1)
    .optional(),
});

export const ListMediaQuery = PageQuery.extend({
  kind: MediaKind.optional(),
  source: MediaSource.optional(),
  /** A folder id, or "root" for assets in no folder. Omit for all assets. */
  folderId: z.union([Id, z.literal('root')]).optional(),
  /** Matches the file name. */
  q: z.string().trim().min(1).max(100).optional(),
});

export const UpdateMediaBody = z
  .object({
    name: FileName,
    altText: z.string().trim().max(1000).nullable(),
    folderId: Id.nullable(),
  })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

export const MediaFolder = z.object({
  id: Id,
  name: z.string(),
  parentId: Id.nullable(),
  createdAt: IsoDateTime,
});
export type MediaFolder = z.infer<typeof MediaFolder>;

const FolderName = z.string().trim().min(1).max(80);
export const CreateFolderBody = z.object({ name: FolderName, parentId: Id.optional() });
export const UpdateFolderBody = z
  .object({ name: FolderName, parentId: Id.nullable() })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

const workspaceParams = z.object({ workspaceId: Id });
const assetParams = workspaceParams.extend({ assetId: Id });
const folderParams = workspaceParams.extend({ folderId: Id });

// Folder routes are listed before `/media/:assetId` so a router matches them first.
export const mediaRoutes = {
  createUpload: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/media/uploads',
    access: 'media:upload',
    summary: 'Start an upload: creates the asset and returns presigned URLs',
    params: workspaceParams,
    body: CreateUploadBody,
    responses: { 201: CreateUploadResponse },
  }),
  completeUpload: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/media/uploads/:assetId/complete',
    access: 'media:upload',
    summary: 'Confirm the file is uploaded; queues processing',
    params: assetParams,
    body: CompleteUploadBody,
    responses: { 200: MediaAsset },
  }),

  listFolders: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/media/folders',
    access: 'media:read',
    summary: 'All media folders of the workspace',
    params: workspaceParams,
    responses: { 200: z.object({ items: z.array(MediaFolder) }) },
  }),
  createFolder: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/media/folders',
    access: 'media:upload',
    summary: 'Create a folder',
    params: workspaceParams,
    body: CreateFolderBody,
    responses: { 201: MediaFolder },
  }),
  updateFolder: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/media/folders/:folderId',
    access: 'media:upload',
    summary: 'Rename or move a folder',
    params: folderParams,
    body: UpdateFolderBody,
    responses: { 200: MediaFolder },
  }),
  deleteFolder: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/media/folders/:folderId',
    access: 'media:upload',
    summary: 'Delete a folder; its assets and subfolders move to its parent',
    params: folderParams,
    responses: { 204: null },
  }),

  listMedia: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/media',
    access: 'media:read',
    summary: 'List assets, newest first (filter by kind, source, folder, name)',
    params: workspaceParams,
    query: ListMediaQuery,
    responses: { 200: page(MediaAsset) },
  }),
  getMedia: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/media/:assetId',
    access: 'media:read',
    summary: 'Asset details with a signed view URL',
    params: assetParams,
    responses: { 200: MediaAssetDetails },
  }),
  updateMedia: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/media/:assetId',
    access: 'media:upload',
    summary: 'Rename, set alt text or move to a folder',
    params: assetParams,
    body: UpdateMediaBody,
    responses: { 200: MediaAsset },
  }),
  deleteMedia: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/media/:assetId',
    access: 'media:upload',
    summary: 'Delete an asset (blocked while a scheduled post uses it)',
    params: assetParams,
    responses: { 204: null },
  }),
};
