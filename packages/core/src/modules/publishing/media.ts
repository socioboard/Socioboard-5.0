import { ProviderError, type PublishMedia } from '@socioboard/providers';
import type { NetworkId } from '@socioboard/contracts';
import sharp from 'sharp';

import type { Db, Storage } from '../../platform';
import type { MediaUrlSigner } from '../media';

/** How long the worker has to read a file from its signed storage URL (big videos included). */
const READ_TTL_SEC = 2 * 60 * 60;
const IMAGE_MAX_BYTES = 25 * 1024 * 1024;

/** Networks that take only JPEG images (Instagram); other image types are converted for them. */
const JPEG_ONLY: ReadonlySet<NetworkId> = new Set(['instagram']);

/**
 * media-prepare, inline in the publish job: the post's files as the network needs them, each
 * with a URL the worker reads it from (to upload it) and, when configured, a signed public
 * address the network can fetch it from. Converted copies are stored once per file and reused.
 */
export async function prepareMedia(
  deps: { db: Db; storage: Storage | undefined; mediaUrls: MediaUrlSigner },
  workspaceId: string,
  network: NetworkId,
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
    let key = m.storageKey;
    let mime = m.mime;
    let sizeBytes = m.sizeBytes;
    if (m.kind !== 'video' && JPEG_ONLY.has(network) && m.mime !== 'image/jpeg') {
      key = `${m.storageKey.replace(/\/[^/]+$/, '')}/variants/jpeg.jpg`;
      mime = 'image/jpeg';
      const existing = await storage.head(key);
      if (existing) {
        sizeBytes = existing.size;
      } else {
        // GIFs keep their first frame; transparency goes on white (JPEG has none).
        const jpeg = await sharp(await storage.getBytes(m.storageKey, IMAGE_MAX_BYTES))
          .flatten({ background: '#ffffff' })
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer();
        await storage.put(key, jpeg, 'image/jpeg');
        sizeBytes = jpeg.length;
      }
    }
    prepared.push({
      id: m.id,
      kind: m.kind,
      mime,
      sizeBytes,
      width: m.width,
      height: m.height,
      durationSec: m.durationSec,
      altText: m.altText,
      readUrl: await storage.presignGet(key, READ_TTL_SEC),
      publicUrl: deps.mediaUrls.sign(key),
    });
  }
  return prepared;
}
