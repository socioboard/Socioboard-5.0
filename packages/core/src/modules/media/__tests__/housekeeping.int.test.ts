// P1-B10: fitting images to each network, and the nightly media-purge. Needs storage (MinIO or
// S3); without it only the storage guard runs.
import { FACEBOOK_IMAGE_PREP, INSTAGRAM_IMAGE_PREP } from '@socioboard/providers';
import sharp, { type Sharp } from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';
import { newId, systemClock } from '../../../platform';
import { mediaKeys } from '../service';
import { prepareImageVariant, type StoredImage } from '../variants';
import { purgeMedia } from '../purge';
import { purgeDeletedWorkspaces } from '../../workspaces';

const t = createTestApp();
const storage = t.platform.storage;
let ws = '';
/** The storage, inside suites that only run when it is configured. */
function need() {
  if (!storage) throw new Error('storage is not configured');
  return storage;
}

beforeAll(async () => {
  const owner = await t.signUp('hk-owner');
  ws = (
    (
      await owner.post('/api/v1/workspaces', {
        name: t.workspaceName('Housekeeping'),
        timezone: 'UTC',
      })
    ).body as { id: string }
  ).id;
});

afterAll(async () => {
  await t.cleanup();
});

describe('storage', () => {
  it.runIf(storage)('refuses to delete by a prefix that isn’t a whole folder', async () => {
    for (const prefix of ['', 'w', 'workspaces', 'workspaces/']) {
      await expect(storage?.deletePrefix(prefix)).rejects.toThrow(/Refusing/);
    }
  });
});

describe.runIf(storage)('fitting images to a network', () => {
  const store = async (name: string, image: Sharp, mime: string): Promise<StoredImage> => {
    const bytes = await image.toBuffer();
    const meta = await sharp(bytes).metadata();
    const key = `workspaces/${ws}/media/${newId()}/${name}`;
    await storage?.put(key, bytes, mime);
    return {
      storageKey: key,
      mime,
      sizeBytes: bytes.length,
      width: meta.width,
      height: meta.height,
    };
  };
  const solid = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: '#c86' } });

  it('leaves an image that already fits as it is', async () => {
    const image = await store('original.jpg', solid(1080, 1080).jpeg(), 'image/jpeg');
    expect(await prepareImageVariant(need(), image, INSTAGRAM_IMAGE_PREP)).toBe(image);
  });

  it('converts formats the network doesn’t take (WebP for Facebook) to JPEG', async () => {
    const image = await store('original.webp', solid(800, 600).webp(), 'image/webp');
    const fitted = await prepareImageVariant(need(), image, FACEBOOK_IMAGE_PREP);
    expect(fitted).toMatchObject({ mime: 'image/jpeg', width: 800, height: 600 });
    expect(fitted.storageKey).toMatch(/\/variants\/jpeg-w0-b\d+\.jpg$/);
    const bytes = await need().getBytes(fitted.storageKey, 10 * 1024 * 1024);
    expect((await sharp(bytes).metadata()).format).toBe('jpeg');
  });

  it('shrinks to the widest the network takes, keeping the shape', async () => {
    const image = await store('original.jpg', solid(3024, 4032).jpeg(), 'image/jpeg');
    const fitted = await prepareImageVariant(need(), image, INSTAGRAM_IMAGE_PREP);
    expect([fitted.width, fitted.height]).toEqual([1440, 1920]);
  });

  it('brings a big image under the size limit, and makes the copy only once', async () => {
    // Noise doesn't compress: a large PNG that stays large as a JPEG at high quality.
    const noise = Buffer.from(
      Array.from({ length: 2000 * 1500 * 3 }, () => Math.floor(Math.random() * 256)),
    );
    const image = await store(
      'original.png',
      sharp(noise, { raw: { width: 2000, height: 1500, channels: 3 } }).png(),
      'image/png',
    );
    const spec = { mimes: ['image/jpeg'], maxWidth: null, maxBytes: 400 * 1024 };
    const fitted = await prepareImageVariant(need(), image, spec);
    expect(fitted.sizeBytes).toBeLessThanOrEqual(spec.maxBytes);
    const head = await need().head(fitted.storageKey);
    const again = await prepareImageVariant(need(), image, spec);
    expect(again).toEqual(fitted);
    expect(await need().head(fitted.storageKey)).toEqual(head);
  });

  it('turns phone photos upright (EXIF orientation)', async () => {
    // Stored 400×200 with "rotate 90°": it shows as 200×400.
    const image = await store(
      'original.png',
      solid(400, 200).withMetadata({ orientation: 6 }).png(),
      'image/png',
    );
    const fitted = await prepareImageVariant(need(), image, INSTAGRAM_IMAGE_PREP);
    expect([fitted.width, fitted.height]).toEqual([200, 400]);
  });
});

describe.runIf(storage)('media-purge', () => {
  const clock = { now: () => new Date() };
  const days = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000);

  async function asset(extra: {
    deletedAt?: Date;
    status?: 'uploading' | 'ready';
    createdAt?: Date;
    multipart?: boolean;
  }) {
    const id = newId();
    const keys = mediaKeys(ws, id, 'image/jpeg');
    const uploadId = extra.multipart
      ? await need().createMultipart(keys.original, 'image/jpeg')
      : null;
    if (!extra.multipart) {
      await need().put(keys.original, Buffer.from('original'), 'image/jpeg');
      await need().put(keys.thumbnail, Buffer.from('thumb'), 'image/webp');
      await need().put(
        keys.original.replace(/[^/]+$/, 'variants/jpeg-w1440-b1.jpg'),
        Buffer.from('v'),
        'image/jpeg',
      );
    }
    await t.db.client.mediaAsset.create({
      data: {
        id,
        workspaceId: ws,
        name: 'x.jpg',
        kind: 'image',
        mime: 'image/jpeg',
        storageKey: keys.original,
        thumbnailKey: extra.multipart ? null : keys.thumbnail,
        sizeBytes: 8,
        status: extra.status ?? 'ready',
        uploadId,
        deletedAt: extra.deletedAt ?? null,
        ...(extra.createdAt ? { createdAt: extra.createdAt } : {}),
      },
    });
    return { id, keys };
  }
  const exists = async (key: string) => Boolean(await need().head(key));
  const row = (id: string) => t.db.client.mediaAsset.findUnique({ where: { id } });

  it('removes files and rows deleted over a week ago, keeps recent ones and live media', async () => {
    const old = await asset({ deletedAt: days(8) });
    const recent = await asset({ deletedAt: days(2) });
    const live = await asset({});
    const result = await purgeMedia({ ...t.platform, clock });
    expect(result.deleted).toBeGreaterThanOrEqual(1);
    expect(await row(old.id)).toBeNull();
    // Original, thumbnail and converted copy: the whole folder.
    expect(await exists(old.keys.original)).toBe(false);
    expect(await exists(old.keys.thumbnail)).toBe(false);
    expect(await exists(old.keys.original.replace(/[^/]+$/, 'variants/jpeg-w1440-b1.jpg'))).toBe(
      false,
    );
    expect(await row(recent.id)).not.toBeNull();
    expect(await exists(recent.keys.original)).toBe(true);
    expect(await row(live.id)).not.toBeNull();
  });

  it('cleans up uploads abandoned for over a day, aborting their multipart upload', async () => {
    const abandoned = await asset({ status: 'uploading', createdAt: days(2), multipart: true });
    const inProgress = await asset({ status: 'uploading', multipart: true });
    const result = await purgeMedia({ ...t.platform, clock });
    expect(result.abandoned).toBeGreaterThanOrEqual(1);
    expect(await row(abandoned.id)).toBeNull();
    expect(await row(inProgress.id)).not.toBeNull();
  });

  it('a deleted workspace takes all its files with it, converted copies included', async () => {
    const owner = await t.signUp('hk-gone');
    const gone = (
      (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Gone'), timezone: 'UTC' }))
        .body as { id: string }
    ).id;
    const key = `workspaces/${gone}/media/${newId()}/variants/jpeg-w0-b1.jpg`;
    await need().put(key, Buffer.from('v'), 'image/jpeg');
    await t.db.client.workspace.update({ where: { id: gone }, data: { deletedAt: days(31) } });
    await purgeDeletedWorkspaces({ ...t.platform, clock: systemClock });
    expect(await exists(key)).toBe(false);
  });
});
