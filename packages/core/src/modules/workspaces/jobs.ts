import { defineQueue, type Clock, type Db, type Logger, type Storage } from '../../platform';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurgeDeps {
  db: Db;
  storage: Storage | undefined;
  clock: Clock;
  logger: Logger;
}

/**
 * Permanently removes workspaces deleted more than 30 days ago: their stored files first (logo,
 * media and thumbnails; the database cascade would leave them orphaned in S3), then the rows.
 * Runs nightly in the worker; safe to re-run.
 */
export async function purgeDeletedWorkspaces({ db, storage, clock, logger }: PurgeDeps) {
  const cutoff = new Date(clock.now().getTime() - THIRTY_DAYS_MS);
  const due = await db.client.workspace.findMany({
    where: { deletedAt: { lt: cutoff } },
    select: { id: true, logo: true },
  });
  for (const workspace of due) {
    if (storage) {
      const media = await db.client.mediaAsset.findMany({
        where: { workspaceId: workspace.id },
        select: { storageKey: true, thumbnailKey: true },
      });
      const keys = [workspace.logo, ...media.flatMap((m) => [m.storageKey, m.thumbnailKey])].filter(
        (k): k is string => Boolean(k),
      );
      for (const key of keys) await storage.delete(key);
    }
    await db.client.workspace.delete({ where: { id: workspace.id } });
    logger.info({ workspaceId: workspace.id }, 'workspace permanently deleted');
  }
  return due.length;
}

export const workspacePurgeQueue = (deps: PurgeDeps) =>
  defineQueue<Record<string, never>, number>(
    'workspace-purge',
    () => purgeDeletedWorkspaces(deps),
    {
      worker: { concurrency: 1 },
    },
  );
