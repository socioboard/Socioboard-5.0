import { ProviderError, type ImagePrep, type PublishMedia } from '@socioboard/providers';

import type { Db, Storage } from '../../platform';
import { prepareImageVariant, type MediaUrlSigner } from '../media';

/** How long the worker has to read a file from its signed storage URL (big videos included). */
const READ_TTL_SEC = 2 * 60 * 60;

/**
 * media-prepare, inline in the publish job: the post's files as the network needs them, each
 * with a URL the worker reads it from (to upload it) and, when configured, a signed public
 * address the network can fetch it from. Images that don't fit the network (format, width,
 * size) get a fitted copy (prepareImageVariant), made once and reused; videos pass through.
 */
export async function prepareMedia(
  deps: { db: Db; storage: Storage | undefined; mediaUrls: MediaUrlSigner },
  workspaceId: string,
  imagePrep: ImagePrep | undefined,
  mediaIds: string[],
): Promise<PublishMedia[]> {
  if (mediaIds.length === 0) return [];
  const { storage } = deps;
  if (!storage) {
    throw new ProviderError({
      kind: 'content',
      message: 'File storage is not configured on this server',
    });
  }
  const rows = await deps.db.forWorkspace(workspaceId).mediaAsset.findMany({
    where: { id: { in: mediaIds }, deletedAt: null },
  });
  const prepared: PublishMedia[] = [];
  for (const id of mediaIds) {
    const m = rows.find((r) => r.id === id);
    if (m?.status !== 'ready') {
      throw new ProviderError({
        kind: 'content',
        message: m ? 'A file is not ready to publish' : 'A file in this post was deleted',
      });
    }
    const file =
      m.kind !== 'video' && imagePrep
        ? await prepareImageVariant(
            storage,
            {
              storageKey: m.storageKey,
              mime: m.mime,
              sizeBytes: m.sizeBytes,
              width: m.width,
              height: m.height,
            },
            imagePrep,
          )
        : m;
    prepared.push({
      id: m.id,
      kind: m.kind,
      mime: file.mime,
      sizeBytes: file.sizeBytes,
      width: file.width,
      height: file.height,
      durationSec: m.durationSec,
      altText: m.altText,
      readUrl: await storage.presignGet(file.storageKey, READ_TTL_SEC),
      publicUrl: deps.mediaUrls.sign(file.storageKey),
    });
  }
  return prepared;
}
