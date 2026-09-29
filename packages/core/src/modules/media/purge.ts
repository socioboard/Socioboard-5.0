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

/** An asset's folder: original, thumbnail and converted copies all live under it. */
const assetFolder = (storageKey: string) => storageKey.replace(/[^/]+$/, '');

/**
 * media-purge (nightly): removes the stored files and rows of media deleted over 7 days ago, and
 * of uploads left in `uploading` for over a day (aborting their multipart upload so S3 frees the
 * parts). Files first, then the row, so a failure part-way leaves a row to retry next night.
 */
export async function purgeMedia({ db, storage, clock, logger }: MediaPurgeDeps) {
  if (!storage) return { deleted: 0, abandoned: 0 };
  const now = clock.now().getTime();
  const deletedBefore = new Date(now - DELETED_MEDIA_RETENTION_DAYS * DAY_MS);
  const startedBefore = new Date(now - ABANDONED_UPLOAD_HOURS * 60 * 60 * 1000);
  let deleted = 0;
  let abandoned = 0;

  for (;;) {
    const batch = await db.client.mediaAsset.findMany({
      where: {
        OR: [
          { deletedAt: { lt: deletedBefore } },
          { status: 'uploading', createdAt: { lt: startedBefore } },
        ],
      },
      select: { id: true, storageKey: true, uploadId: true, status: true, deletedAt: true },
      take: BATCH,
    });
    if (batch.length === 0) break;
    for (const asset of batch) {
      try {
        if (asset.uploadId) {
          await storage.abortMultipart(asset.storageKey, asset.uploadId).catch(() => undefined);
        }
        await storage.deletePrefix(assetFolder(asset.storageKey));
        await db.client.mediaAsset.delete({ where: { id: asset.id } });
        if (asset.deletedAt) deleted += 1;
        else abandoned += 1;
      } catch (err) {
        // Left for next night; don't let one file stop the rest.
        logger.warn({ err, assetId: asset.id }, 'media purge: could not remove an asset');
        return { deleted, abandoned, failed: true };
      }
    }
    if (batch.length < BATCH) break;
  }
  if (deleted + abandoned > 0) logger.info({ deleted, abandoned }, 'media purged');
  return { deleted, abandoned };
}

export const mediaPurgeQueue = (deps: MediaPurgeDeps) =>
  defineQueue<Record<string, never>, { deleted: number; abandoned: number }>(
    'media-purge',
    () => purgeMedia(deps),
    { worker: { concurrency: 1 } },
  );
