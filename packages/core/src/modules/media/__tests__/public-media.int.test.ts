// Public media addresses: signed, expiring, and served (whole or by range) from storage.
import { randomUUID } from 'node:crypto';

import express from 'express';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createLogger, createStorage, loadConfig } from '../../../platform';
import { createMediaUrlSigner, createPublicMediaRouter } from '../public-media';

const config = loadConfig();
const storage = config.storage ? createStorage(config.storage) : undefined;
const signer = createMediaUrlSigner({ baseUrl: 'https://media.test/', secret: 'x'.repeat(32) });
const file = (url: string | null) => new URL(url ?? 'https://none/').pathname.slice(1);

afterAll(() => {
  storage?.close();
});

describe('signed public addresses', () => {
  it('are off when no public address is configured', () => {
    const off = createMediaUrlSigner({ baseUrl: undefined, secret: 'x'.repeat(32) });
    expect(off.sign('workspaces/w/media/a/original.jpg')).toBeNull();
  });

  it('name the stored file, keep its extension, and verify', () => {
    const url = signer.sign('workspaces/w/media/a/original.jpg');
    expect(url).toMatch(/^https:\/\/media\.test\/[\w-]+\.[\w-]+\.jpg$/);
    expect(signer.verify(file(url))).toBe('workspaces/w/media/a/original.jpg');
  });

  it('refuse anything changed, signed with another secret, or expired', () => {
    const f = file(signer.sign('workspaces/w/media/a/original.jpg'));
    const [payload = '', sig = ''] = f.split('.');
    const other = Buffer.from(
      JSON.stringify({ k: 'workspaces/other/secret.jpg', e: 9e9 }),
    ).toString('base64url');
    expect(signer.verify(`${other}.${sig}.jpg`)).toBeNull();
    // One character of the signature changed (always to a different one).
    const flipped = `${sig.slice(0, -1)}${sig.endsWith('A') ? 'B' : 'A'}`;
    expect(signer.verify(`${payload}.${flipped}.jpg`)).toBeNull();
    const stranger = createMediaUrlSigner({
      baseUrl: 'https://media.test',
      secret: 'y'.repeat(32),
    });
    expect(stranger.verify(f)).toBeNull();
    expect(signer.verify(f, Date.now() + 25 * 3600 * 1000)).toBeNull();
    expect(signer.verify('not-a-token')).toBeNull();
  });
});

describe.runIf(storage)('GET /public-media/:file', () => {
  const app = express();
  app.use(createPublicMediaRouter({ signer, storage, logger: createLogger({ level: 'silent' }) }));
  const key = `test/public-media/${randomUUID()}.jpg`;
  const bytes = Buffer.from(Array.from({ length: 1000 }, (_, i) => i % 256));

  it('serves the whole file, or the byte range asked for', async () => {
    await storage?.put(key, bytes, 'image/jpeg');
    const path = `/public-media/${file(signer.sign(key))}`;
    const whole = await request(app).get(path).buffer(true);
    expect(whole.status).toBe(200);
    expect(whole.headers['content-type']).toBe('image/jpeg');
    expect(Buffer.from(whole.body as Buffer).equals(bytes)).toBe(true);

    const part = await request(app).get(path).set('Range', 'bytes=100-199').buffer(true);
    expect(part.status).toBe(206);
    expect(part.headers['content-range']).toBe('bytes 100-199/1000');
    expect(Buffer.from(part.body as Buffer).equals(bytes.subarray(100, 200))).toBe(true);

    const head = await request(app).head(path);
    expect([head.status, head.headers['content-length']]).toEqual([200, '1000']);
    await storage?.delete(key);
  });

  it('answers a bare 404 for forged, expired or missing files', async () => {
    const expired = createMediaUrlSigner({ baseUrl: 'https://media.test', secret: 'x'.repeat(32) });
    const cases = [
      '/public-media/forged.token.jpg',
      `/public-media/${file(expired.sign(key, -60))}`,
      `/public-media/${file(signer.sign('test/public-media/missing.jpg'))}`,
    ];
    for (const path of cases) {
      const res = await request(app).get(path);
      expect([res.status, res.text], path).toEqual([404, '']);
    }
  });
});
