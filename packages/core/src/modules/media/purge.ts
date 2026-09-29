import { defineQueue, type Clock, type Db, type Logger, type Storage } from '../../platform';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Deleted media stays restorable-by-support for a week (docs/backend/modules/media.md). */
export const DELETED_MEDIA_RETENTION_DAYS = 7;
/** An upload not completed within a day was abandoned (closed tab, lost connection). */
export const ABANDONED_UPLOAD_HOURS = 24;
const BATCH = 200;

export interface MediaPurgeDeps {
  db: Db;
  storage: Storage | undefined;
  clock: Clock;
  logger: Logger;
}

/**
 * An asset's own folder (`workspaces/<ws>/media/<assetId>/`): original, thumbnail and converted
 * copies all live under it. Null for a key laid out any other way (a file straight under
 * `media/`, say), so a stray key can't widen the delete to other assets' files.
 */
function assetFolder(asset: { id: string; storageKey: string }): string | null {
  const folder = asset.storageKey.replace(/[^/]+$/, '');
  return folder.endsWith(`/${asset.id}/`) ? folder : null;
}

/**
 * media-purge (nightly): removes the stored files and rows of media deleted over 7 days ago, and
 * of uploads left in `uploading` for over a day (aborting their multipart upload so S3 frees the
 * parts). Files first, then the row, so a failure part-way leaves a row to retry next night.
 */
export async function purgeMedia({ db, storage, clock, logger }: MediaPurgeDeps) {
  if (!storage) return { deleted: 0, abandoned: 0, failed: 0 };
  const now = clock.now().getTime();
  const deletedBefore = new Date(now - DELETED_MEDIA_RETENTION_DAYS * DAY_MS);
  const startedBefore = new Date(now - ABANDONED_UPLOAD_HOURS * 60 * 60 * 1000);
  let deleted = 0;
  let abandoned = 0;
  // Assets that failed this run: skipped so one bad file doesn't hold up the rest every night.
  const failed: string[] = [];

  for (;;) {
    const batch = await db.client.mediaAsset.findMany({
      where: {
        id: { notIn: failed },
        OR: [
          { deletedAt: { lt: deletedBefore } },
          { status: 'uploading', createdAt: { lt: startedBefore } },
        ],
      },
      select: { id: true, storageKey: true, thumbnailKey: true, uploadId: true, deletedAt: true },
      take: BATCH,
    });
    if (batch.length === 0) break;
    for (const asset of batch) {
      try {
        if (asset.uploadId) {
          await storage.abortMultipart(asset.storageKey, asset.uploadId).catch(() => undefined);
        }
        const folder = assetFolder(asset);
        if (folder) await storage.deletePrefix(folder);
        else {
          for (const key of [asset.storageKey, asset.thumbnailKey]) {
            if (key) await storage.delete(key);
          }
        }
        await db.client.mediaAsset.delete({ where: { id: asset.id } });
        if (asset.deletedAt) deleted += 1;
        else abandoned += 1;
      } catch (err) {
        // Left for next night; the rest go ahead.
        failed.push(asset.id);
        logger.warn({ err, assetId: asset.id }, 'media purge: could not remove an asset');
      }
    }
    if (batch.length < BATCH) break;
  }
  if (deleted + abandoned + failed.length > 0) {
    logger.info({ deleted, abandoned, failed: failed.length }, 'media purged');
  }
  return { deleted, abandoned, failed: failed.length };
}

export const mediaPurgeQueue = (deps: MediaPurgeDeps) =>
  defineQueue<Record<string, never>, { deleted: number; abandoned: number; failed: number }>(
    'media-purge',
    () => purgeMedia(deps),
    { worker: { concurrency: 1 } },
  );
