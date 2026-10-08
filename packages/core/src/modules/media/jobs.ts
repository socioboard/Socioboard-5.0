import {
  defineQueue,
  typedEvents,
  type Db,
  type EventBus,
  type Job,
  type Logger,
  type Storage,
} from '../../platform';
import type { MediaEvents } from './events';
import {
  analyzeImage,
  analyzeVideo,
  ToolMissingError,
  withLocalCopy,
  type MediaInfo,
} from './processing';
import { mediaKeys } from './service';
import { MEDIA_MAX_BYTES, type MediaMime } from '@socioboard/contracts';

export interface MediaJobDeps {
  db: Db;
  storage: Storage | undefined;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  tools: { ffmpegPath: string; ffprobePath: string };
}

const IMAGE_MAX_BYTES = 25 * 1024 * 1024;
const ATTEMPTS = 3;

/**
 * media-process: reads dimensions (and duration for video), stores a WebP thumbnail and marks
 * the asset ready. After the last failed attempt the asset is marked failed. Re-running is safe.
 */
export async function processMedia(deps: MediaJobDeps, assetId: string, isLastAttempt: boolean) {
  const { db, storage, logger } = deps;
  const events = typedEvents<MediaEvents>(deps.events);
  const asset = await db.client.mediaAsset.findFirst({ where: { id: assetId, deletedAt: null } });
  if (asset?.status !== 'processing') return; // deleted, or already done
  if (!storage) throw new Error('Storage is not configured');

  try {
    let info: MediaInfo;
    if (asset.kind === 'video') {
      try {
        info = await withLocalCopy(
          await storage.presignGet(asset.storageKey, 15 * 60),
          MEDIA_MAX_BYTES.video,
          (path) => analyzeVideo(path, deps.tools),
        );
      } catch (err) {
        if (!(err instanceof ToolMissingError)) throw err;
        logger.warn({ assetId }, 'ffprobe missing: video kept without duration and thumbnail');
        info = { width: null, height: null, durationSec: null, thumbnail: null };
      }
    } else {
      info = await analyzeImage(await storage.getBytes(asset.storageKey, IMAGE_MAX_BYTES));
    }

    let thumbnailKey: string | null = null;
    if (info.thumbnail) {
      thumbnailKey = mediaKeys(asset.workspaceId, asset.id, asset.mime as MediaMime).thumbnail;
      await storage.put(thumbnailKey, info.thumbnail, 'image/webp');
    }
    await db.client.mediaAsset.update({
      where: { id: asset.id },
      data: {
        status: 'ready',
        width: info.width,
        height: info.height,
        durationSec: info.durationSec,
        thumbnailKey,
      },
    });
    await events.emit('media.ready', { workspaceId: asset.workspaceId, assetId: asset.id });
  } catch (err) {
    if (isLastAttempt) {
      await db.client.mediaAsset.update({ where: { id: asset.id }, data: { status: 'failed' } });
      await events.emit('media.failed', {
        workspaceId: asset.workspaceId,
        assetId: asset.id,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
}

export const mediaProcessQueue = (deps: MediaJobDeps) =>
  defineQueue<{ assetId: string }>(
    'media-process',
    (job: Job<{ assetId: string }>) =>
      processMedia(deps, job.data.assetId, job.attemptsMade + 1 >= (job.opts.attempts ?? ATTEMPTS)),
    { jobDefaults: { attempts: ATTEMPTS }, worker: { concurrency: 2 } },
  );
