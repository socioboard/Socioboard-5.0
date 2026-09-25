import {
  MEDIA_MIME_KINDS,
  MULTIPART_PART_BYTES,
  MULTIPART_THRESHOLD_BYTES,
  type CreateUploadBody,
  type ListMediaQuery,
  type MediaAsset,
  type MediaAssetDetails,
  type MediaFolder,
  type MediaMime,
  type UpdateFolderBody,
  type UpdateMediaBody,
  type UploadInstructions,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';
import type { z } from 'zod';

import {
  afterCursor,
  AppError,
  createUrlSigner,
  decodeCursor,
  newId,
  notFound,
  toPage,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type Logger,
  type MemberContext,
  type Storage,
} from '../../platform';
import type { MediaEvents } from './events';

export interface MediaServiceDeps {
  db: Db;
  storage: Storage | undefined;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  /** Queues background processing (thumbnail, dimensions) for a completed upload. */
  enqueueProcessing(assetId: string): Promise<void>;
}

const UPLOAD_TTL_SEC = 60 * 60;
const EXTENSIONS: Record<MediaMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

/** Where an asset's files live; everything for one workspace sits under one prefix. */
export const mediaKeys = (workspaceId: string, assetId: string, mime: MediaMime) => ({
  original: `workspaces/${workspaceId}/media/${assetId}/original.${EXTENSIONS[mime]}`,
  thumbnail: `workspaces/${workspaceId}/media/${assetId}/thumb.webp`,
});

type AssetRow = Prisma.MediaAssetGetPayload<{
  include: { uploadedBy: { select: { id: true; name: true } } };
}>;
const withUploader = { uploadedBy: { select: { id: true, name: true } } } as const;

export function createMediaService(deps: MediaServiceDeps) {
  const { db, storage, clock, logger } = deps;
  const events = typedEvents<MediaEvents>(deps.events);
  const signUrl = createUrlSigner(storage);
  const requireStorage = () => {
    if (!storage) {
      throw new AppError(
        503,
        'STORAGE_NOT_CONFIGURED',
        'File storage is not configured on this server',
      );
    }
    return storage;
  };

  async function toAsset(a: AssetRow): Promise<MediaAsset> {
    return {
      id: a.id,
      name: a.name,
      kind: a.kind,
      mime: a.mime as MediaMime,
      sizeBytes: a.sizeBytes,
      width: a.width,
      height: a.height,
      durationSec: a.durationSec,
      status: a.status,
      source: a.source,
      altText: a.altText,
      folderId: a.folderId,
      thumbnailUrl: await signUrl(a.thumbnailKey),
      uploadedBy: a.uploadedBy,
      createdAt: a.createdAt.toISOString(),
    };
  }

  const scoped = (member: MemberContext) => db.forWorkspace(member.workspaceId);

  async function findAsset(member: MemberContext, assetId: string) {
    const asset = await scoped(member).mediaAsset.findFirst({
      where: { id: assetId, deletedAt: null },
      include: withUploader,
    });
    if (!asset) throw notFound('MEDIA_NOT_FOUND', 'Media not found');
    return asset;
  }

  async function assertFolder(member: MemberContext, folderId: string) {
    const folder = await scoped(member).mediaFolder.findUnique({ where: { id: folderId } });
    if (!folder) throw notFound('FOLDER_NOT_FOUND', 'Folder not found');
    return folder;
  }

  // ---------------------------------------------------------------- uploads

  async function createUpload(
    caller: AuthContext,
    member: MemberContext,
    body: z.infer<typeof CreateUploadBody>,
  ): Promise<{ asset: MediaAsset; upload: UploadInstructions; expiresAt: string }> {
    const store = requireStorage();
    if (body.folderId) await assertFolder(member, body.folderId);
    const id = newId();
    const keys = mediaKeys(member.workspaceId, id, body.mime);
    const multipart = body.sizeBytes > MULTIPART_THRESHOLD_BYTES;
    const uploadId = multipart ? await store.createMultipart(keys.original, body.mime) : null;

    const asset = await scoped(member).mediaAsset.create({
      data: {
        id,
        workspaceId: member.workspaceId,
        name: body.fileName,
        folderId: body.folderId ?? null,
        kind: MEDIA_MIME_KINDS[body.mime],
        mime: body.mime,
        storageKey: keys.original,
        sizeBytes: body.sizeBytes,
        status: 'uploading',
        uploadId,
        uploadedById: caller.user.id,
      },
      include: withUploader,
    });

    let upload: UploadInstructions;
    if (uploadId) {
      const count = Math.ceil(body.sizeBytes / MULTIPART_PART_BYTES);
      const parts = await Promise.all(
        Array.from({ length: count }, async (_, i) => ({
          partNumber: i + 1,
          url: await store.presignPart(keys.original, uploadId, i + 1, UPLOAD_TTL_SEC),
        })),
      );
      upload = { type: 'multipart', partSize: MULTIPART_PART_BYTES, parts };
    } else {
      upload = {
        type: 'single',
        url: await store.presignPut(keys.original, body.mime, {
          expiresInSec: UPLOAD_TTL_SEC,
          contentLength: body.sizeBytes,
        }),
        headers: { 'Content-Type': body.mime },
      };
    }
    return {
      asset: await toAsset(asset),
      upload,
      expiresAt: new Date(clock.now().getTime() + UPLOAD_TTL_SEC * 1000).toISOString(),
    };
  }

  async function completeUpload(
    member: MemberContext,
    assetId: string,
    parts: { partNumber: number; etag: string }[] | undefined,
  ): Promise<MediaAsset> {
    const store = requireStorage();
    const asset = await findAsset(member, assetId);
    if (asset.status !== 'uploading') {
      throw unprocessable('UPLOAD_ALREADY_COMPLETED', 'This upload was already completed');
    }
    if (asset.uploadId) {
      if (!parts)
        throw unprocessable('PARTS_REQUIRED', 'A multipart upload needs the ETag of each part');
      await store
        .completeMultipart(asset.storageKey, asset.uploadId, parts)
        .catch((err: unknown) => {
          logger.warn({ err, assetId }, 'multipart completion failed');
          throw unprocessable('UPLOAD_INCOMPLETE', 'Some parts are missing or do not match');
        });
    }

    // The declared size and type were checked when the upload started; make sure the file matches.
    const info = await store.head(asset.storageKey);
    if (info?.size !== asset.sizeBytes || info.contentType !== asset.mime) {
      await scoped(member).mediaAsset.update({
        where: { id: asset.id },
        data: { status: 'failed', uploadId: null },
      });
      if (info) await store.delete(asset.storageKey).catch(() => undefined);
      throw unprocessable(
        'UPLOAD_INVALID',
        'The uploaded file is missing or does not match what was declared',
      );
    }

    // Only one caller moves it to processing, even if "complete" is sent twice at once.
    const moved = await scoped(member).mediaAsset.updateMany({
      where: { id: asset.id, status: 'uploading' },
      data: { status: 'processing', uploadId: null },
    });
    if (moved.count === 1) await deps.enqueueProcessing(asset.id);
    return toAsset(await findAsset(member, asset.id));
  }

  // ---------------------------------------------------------------- assets

  async function list(member: MemberContext, query: z.infer<typeof ListMediaQuery>) {
    const where: Prisma.MediaAssetWhereInput = {
      deletedAt: null,
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.folderId ? { folderId: query.folderId === 'root' ? null : query.folderId } : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.cursor ? afterCursor(decodeCursor(query.cursor)) : {}),
    };
    const rows = await scoped(member).mediaAsset.findMany({
      where,
      include: withUploader,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const page = toPage(rows, query.limit);
    return { items: await Promise.all(page.items.map(toAsset)), nextCursor: page.nextCursor };
  }

  async function get(member: MemberContext, assetId: string): Promise<MediaAssetDetails> {
    const asset = await findAsset(member, assetId);
    const viewable = asset.status === 'ready' || asset.status === 'processing';
    return { ...(await toAsset(asset)), url: viewable ? await signUrl(asset.storageKey) : null };
  }

  async function update(
    member: MemberContext,
    assetId: string,
    body: z.infer<typeof UpdateMediaBody>,
  ): Promise<MediaAsset> {
    const asset = await findAsset(member, assetId);
    if (body.folderId) await assertFolder(member, body.folderId);
    const data: Prisma.MediaAssetUncheckedUpdateInput = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined),
    );
    const updated = await scoped(member).mediaAsset.update({
      where: { id: asset.id },
      data,
      include: withUploader,
    });
    return toAsset(updated);
  }

  async function remove(caller: AuthContext, member: MemberContext, assetId: string) {
    const asset = await findAsset(member, assetId);
    // Phase 1 adds: refuse while a scheduled post uses the asset (MEDIA_IN_USE).
    await scoped(member).mediaAsset.update({
      where: { id: asset.id },
      data: { deletedAt: clock.now() },
    });
    await events.emit('media.deleted', {
      workspaceId: member.workspaceId,
      assetId: asset.id,
      userId: caller.user.id,
    });
  }

  // ---------------------------------------------------------------- folders

  const toFolder = (f: {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: Date;
  }): MediaFolder => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    createdAt: f.createdAt.toISOString(),
  });

  async function listFolders(member: MemberContext): Promise<MediaFolder[]> {
    const folders = await scoped(member).mediaFolder.findMany({ orderBy: { name: 'asc' } });
    return folders.map(toFolder);
  }

  async function createFolder(
    member: MemberContext,
    body: { name: string; parentId?: string | undefined },
  ) {
    if (body.parentId) await assertFolder(member, body.parentId);
    const folder = await scoped(member).mediaFolder.create({
      data: {
        id: newId(),
        workspaceId: member.workspaceId,
        name: body.name,
        parentId: body.parentId ?? null,
      },
    });
    return toFolder(folder);
  }

  async function updateFolder(
    member: MemberContext,
    folderId: string,
    body: z.infer<typeof UpdateFolderBody>,
  ) {
    const folder = await assertFolder(member, folderId);
    if (body.parentId) {
      // Refuse moving a folder into itself or one of its own subfolders.
      let cursor: string | null = body.parentId;
      while (cursor) {
        if (cursor === folder.id)
          throw unprocessable('FOLDER_CYCLE', 'A folder cannot be moved into itself');
        cursor = (await assertFolder(member, cursor)).parentId;
      }
    }
    const data: Prisma.MediaFolderUncheckedUpdateInput = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined),
    );
    return toFolder(await scoped(member).mediaFolder.update({ where: { id: folder.id }, data }));
  }

  /** Deletes a folder; its assets and subfolders move up to its parent (or the root). */
  async function deleteFolder(member: MemberContext, folderId: string) {
    const folder = await assertFolder(member, folderId);
    await db.client.$transaction(async (tx) => {
      const where = { workspaceId: member.workspaceId, folderId: folder.id };
      await tx.mediaAsset.updateMany({ where, data: { folderId: folder.parentId } });
      await tx.mediaFolder.updateMany({
        where: { workspaceId: member.workspaceId, parentId: folder.id },
        data: { parentId: folder.parentId },
      });
      await tx.mediaFolder.delete({ where: { id: folder.id, workspaceId: member.workspaceId } });
    });
  }

  return {
    createUpload,
    completeUpload,
    list,
    get,
    update,
    remove,
    listFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}

export type MediaService = ReturnType<typeof createMediaService>;
