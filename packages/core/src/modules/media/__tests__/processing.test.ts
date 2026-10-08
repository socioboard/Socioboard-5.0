import sharp from 'sharp';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { decodeCursor, encodeCursor, toPage } from '../../../platform';
import { analyzeImage, analyzeVideo, withLocalCopy } from '../processing';

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#3366ff' } })
    .png()
    .toBuffer();

describe('analyzeImage', () => {
  it('reads dimensions and makes a WebP thumbnail that fits 480 px', async () => {
    const info = await analyzeImage(await png(1600, 900));
    expect(info).toMatchObject({ width: 1600, height: 900, durationSec: null });
    const thumb = await sharp(info.thumbnail ?? Buffer.alloc(0)).metadata();
    expect(thumb.format).toBe('webp');
    expect(thumb.width).toBe(480);
    expect(thumb.height).toBe(270);
  });

  it('does not enlarge small images', async () => {
    const info = await analyzeImage(await png(200, 100));
    const thumb = await sharp(info.thumbnail ?? Buffer.alloc(0)).metadata();
    expect([thumb.width, thumb.height]).toEqual([200, 100]);
  });

  it('reports the displayed size of a phone photo stored rotated (EXIF orientation 6)', async () => {
    // Stored landscape 400x300, but the camera says "rotate 90°": people see a 300x400 portrait.
    const rotated = await sharp(await png(400, 300))
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const info = await analyzeImage(rotated);
    expect([info.width, info.height]).toEqual([300, 400]);
    const thumb = await sharp(info.thumbnail ?? Buffer.alloc(0)).metadata();
    expect(thumb.height > thumb.width).toBe(true);
  });

  it('handles animated GIFs (first frame)', async () => {
    const gif = await sharp(await png(120, 80))
      .gif()
      .toBuffer();
    const info = await analyzeImage(gif);
    expect([info.width, info.height]).toEqual([120, 80]);
    expect(info.thumbnail).not.toBeNull();
  });

  it('rejects files that are not images', async () => {
    await expect(analyzeImage(Buffer.from('not an image'))).rejects.toThrow();
  });
});

describe('analyzeVideo', () => {
  it('reports a missing ffprobe clearly instead of crashing', async () => {
    await expect(
      analyzeVideo('http://localhost/none.mp4', {
        ffmpegPath: 'definitely-not-installed-ffmpeg',
        ffprobePath: 'definitely-not-installed-ffprobe',
      }),
    ).rejects.toMatchObject({ name: 'ToolMissingError' });
  });
});

describe('withLocalCopy', () => {
  // A stored file served over HTTP, as storage hands the worker a signed URL.
  const bytes = Buffer.from('a stored video, or close enough');
  const server = createServer((req, res) => {
    if (req.url === '/video.mp4') res.end(bytes);
    else res.writeHead(404).end();
  });
  let base = '';
  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
  });
  afterAll(() => {
    server.close();
  });

  it('hands over a local copy of the file, and removes it afterwards', async () => {
    let seen = '';
    const read = await withLocalCopy(`${base}/video.mp4`, 1000, (path) => {
      seen = path;
      return Promise.resolve(readFileSync(path));
    });
    expect(read.equals(bytes)).toBe(true);
    expect(existsSync(seen)).toBe(false);
  });

  it('refuses a file over the limit, and one that is not there', async () => {
    await expect(withLocalCopy(`${base}/video.mp4`, 10, () => Promise.resolve())).rejects.toThrow(
      /over 10 bytes/,
    );
    await expect(withLocalCopy(`${base}/gone.mp4`, 1000, () => Promise.resolve())).rejects.toThrow(
      /HTTP 404/,
    );
  });
});

describe('cursor pagination', () => {
  const id = '01890a5d-ac96-774b-bcce-b302099a8057';
  it('round-trips and rejects tampered cursors', () => {
    const at = new Date('2026-09-25T10:00:00.000Z');
    expect(decodeCursor(encodeCursor({ createdAt: at, id }))).toEqual({ createdAt: at, id });
    expect(() => decodeCursor('garbage')).toThrow(/cursor/);
    expect(() => decodeCursor(Buffer.from('2026-01-01|../../etc').toString('base64url'))).toThrow();
  });

  it('returns a next cursor only when there is another page', () => {
    const rows = [0, 1, 2].map((i) => ({ id, createdAt: new Date(1000 - i) }));
    expect(toPage(rows, 2).nextCursor).not.toBeNull();
    expect(toPage(rows.slice(0, 2), 2).nextCursor).toBeNull();
    expect(toPage(rows, 2).items).toHaveLength(2);
  });
});
