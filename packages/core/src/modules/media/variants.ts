import sharp from 'sharp';

import type { Storage } from '../../platform';

/** What a network accepts for images (a network adapter's `imagePrep`). */
export interface ImageSpec {
  mimes: readonly string[];
  /** Widest image the network takes; null for any width. */
  maxWidth: number | null;
  maxBytes: number;
}

export interface StoredImage {
  storageKey: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
}

/** Uploads are at most 20 MB; read a little more to be safe. */
const READ_MAX_BYTES = 25 * 1024 * 1024;
const QUALITIES = [88, 72, 56];

/**
 * prepareVariant for images (docs/backend/modules/media.md): the original when it already fits
 * the network, else a JPEG copy that does: turned upright (EXIF orientation), no wider than
 * `maxWidth`, quality stepped down (then the size, in one informed step) until under `maxBytes`. The copy is
 * stored once next to the original, named after the spec, and reused by later posts.
 * Videos pass through untouched: no phase 1 network needs a transcode (ffmpeg joins with the
 * networks that do).
 */
export async function prepareImageVariant(
  storage: Storage,
  image: StoredImage,
  spec: ImageSpec,
): Promise<StoredImage> {
  const fits =
    spec.mimes.includes(image.mime) &&
    image.sizeBytes <= spec.maxBytes &&
    (spec.maxWidth === null || image.width === null || image.width <= spec.maxWidth);
  if (fits) return image;

  const folder = image.storageKey.replace(/[^/]+$/, '');
  const key = `${folder}variants/jpeg-w${String(spec.maxWidth ?? 0)}-b${String(spec.maxBytes)}.jpg`;
  const existing = await storage.head(key);
  if (existing) {
    const size = await sharp(await storage.getBytes(key, spec.maxBytes)).metadata();
    return {
      storageKey: key,
      mime: 'image/jpeg',
      sizeBytes: existing.size,
      width: size.width,
      height: size.height,
    };
  }

  const original = await storage.getBytes(image.storageKey, READ_MAX_BYTES);
  let width = spec.maxWidth ?? undefined;
  // A few qualities per size; if still too big, shrink in one step by what the gap implies
  // (JPEG size grows about with the pixel count), so even a hard case takes a handful of encodes.
  for (let round = 0; round < 4; round++) {
    let last = { bytes: 0, width: 0 };
    for (const quality of QUALITIES) {
      const { data, info } = await sharp(original)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        // Transparency goes on white: JPEG has none.
        .flatten({ background: '#ffffff' })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      if (data.length <= spec.maxBytes) {
        await storage.put(key, data, 'image/jpeg');
        return {
          storageKey: key,
          mime: 'image/jpeg',
          sizeBytes: data.length,
          width: info.width,
          height: info.height,
        };
      }
      last = { bytes: data.length, width: info.width };
    }
    width = Math.max(320, Math.floor(last.width * Math.sqrt(spec.maxBytes / last.bytes) * 0.9));
  }
  throw new Error(`Could not fit the image under ${String(spec.maxBytes)} bytes`);
}
