// NAS storage (STORAGE_DRIVER=nas, platform/storage/nas.ts) against a fake NAS that behaves like
// the real one's API: uploads through our API with signed links, files sent on to the NAS, read
// back from its public URLs, and deleted one key at a time.
import { CreateUploadResponse, ErrorEnvelope, MediaAsset } from '@socioboard/contracts';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp, startFakeNas, type FakeNas } from '../../testing';
import type { Storage } from '../storage';

let nas: FakeNas;
let t: ReturnType<typeof createTestApp>;
let storage: Storage;
let owner: Awaited<ReturnType<ReturnType<typeof createTestApp>['signUp']>>;
let ws = '';
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
/** Where an upload link points, as a path the test app serves. */
const pathOf = (url: string) => new URL(url).pathname;
const MB = 1024 * 1024;

beforeAll(async () => {
  nas = await startFakeNas();
  t = createTestApp({
    storage: {
      driver: 'nas',
      apiUrl: nas.apiUrl,
      publicUrl: nas.publicUrl,
      token: nas.token,
      tempDir: undefined,
    },
  });
  if (!t.platform.storage) throw new Error('NAS storage was not set up');
  storage = t.platform.storage;
  owner = await t.signUp('nas-owner');
  const created = await owner.post('/api/v1/workspaces', {
    name: t.workspaceName('NAS'),
    timezone: 'UTC',
  });
  ws = (created.body as { id: string }).id;
});

afterAll(async () => {
  await t.db.client.storedObject.deleteMany({ where: { key: { startsWith: 'nas-test/' } } });
  await t.db.client.storedObject.deleteMany({
    where: { key: { startsWith: `workspaces/${ws}/` } },
  });
  await t.cleanup();
  await nas.close();
});

describe('the driver', () => {
  it('stores a file on the NAS and knows its size and type', async () => {
    await storage.put('nas-test/a/thumb.webp', Buffer.from('webp bytes'), 'image/webp');
    expect(nas.files.get('/socioboard-test/nas-test/a/thumb.webp')?.bytes.toString()).toBe(
      'webp bytes',
    );
    expect(await storage.head('nas-test/a/thumb.webp')).toMatchObject({
      size: 10,
      contentType: 'image/webp',
    });
    expect(await storage.head('nas-test/a/missing.webp')).toBeUndefined();
  });

  it('reads back through the public URL, which needs no token', async () => {
    const url = await storage.presignGet('nas-test/a/thumb.webp');
    expect(url).toBe(`${nas.publicUrl}/socioboard-test/nas-test/a/thumb.webp`);
    const res = await fetch(url);
    expect([res.status, res.headers.get('content-type'), await res.text()]).toEqual([
      200,
      'image/webp',
      'webp bytes',
    ]);
    expect((await storage.getBytes('nas-test/a/thumb.webp', 100)).toString()).toBe('webp bytes');
    await expect(storage.getBytes('nas-test/a/thumb.webp', 5)).rejects.toThrow(/larger/);
  });

  it('writing the same key again replaces it', async () => {
    await storage.put('nas-test/a/thumb.webp', Buffer.from('newer'), 'image/webp');
    expect((await storage.head('nas-test/a/thumb.webp'))?.size).toBe(5);
    expect((await storage.getBytes('nas-test/a/thumb.webp', 100)).toString()).toBe('newer');
  });

  it('deletes one file, or a folder key by key, and nothing next to it', async () => {
    await storage.put('nas-test/folder-b/original.jpg', Buffer.from('1'), 'image/jpeg');
    await storage.put('nas-test/folder-b/variants/x.jpg', Buffer.from('2'), 'image/jpeg');
    await storage.put('nas-test/folder-bb/original.jpg', Buffer.from('3'), 'image/jpeg');
    expect(await storage.deletePrefix('nas-test/folder-b/')).toBe(2);
    expect(nas.files.has('/socioboard-test/nas-test/folder-b/original.jpg')).toBe(false);
    expect(nas.files.has('/socioboard-test/nas-test/folder-b/variants/x.jpg')).toBe(false);
    expect(await storage.head('nas-test/folder-b/original.jpg')).toBeUndefined();
    expect(nas.files.has('/socioboard-test/nas-test/folder-bb/original.jpg')).toBe(true);
    await storage.delete('nas-test/folder-bb/original.jpg');
    expect(nas.files.has('/socioboard-test/nas-test/folder-bb/original.jpg')).toBe(false);
    // Deleting what isn't there is fine.
    await storage.delete('nas-test/folder-bb/original.jpg');
    await expect(storage.deletePrefix('nas-test')).rejects.toThrow(/Refusing/);
  });

  it('a failed upload to the NAS records nothing', async () => {
    nas.failNextUpload.status = 500;
    await expect(storage.put('nas-test/c/x.png', Buffer.from('x'), 'image/png')).rejects.toThrow(
      /NAS upload failed \(500\)/,
    );
    expect(await storage.head('nas-test/c/x.png')).toBeUndefined();
  });

  it('health: the NAS answers', async () => {
    expect(await storage.ping()).toBe(true);
    const health = await request(t.app).get('/api/health');
    expect((health.body as { checks: { storage: string } }).checks.storage).toBe('ok');
  });
});

describe('browser uploads through the API', () => {
  async function startUpload(fileName: string, mime: string, sizeBytes: number) {
    const res = await owner.post(`/api/v1/workspaces/${ws}/media/uploads`, {
      fileName,
      mime,
      sizeBytes,
    });
    expect(res.status).toBe(201);
    return CreateUploadResponse.parse(res.body);
  }
  const complete = (assetId: string, body: object = {}) =>
    owner.post(`/api/v1/workspaces/${ws}/media/uploads/${assetId}/complete`, body);

  it('a small file: one PUT to our own origin, then it is on the NAS', async () => {
    const png = Buffer.alloc(2048, 7);
    const { asset, upload } = await startUpload('logo.png', 'image/png', png.length);
    if (upload.type !== 'single') throw new Error('expected a single upload');
    expect(new URL(upload.url).origin).toBe(new URL(t.config.appUrl).origin);
    const put = await request(t.app)
      .put(pathOf(upload.url))
      .set('Content-Type', 'image/png')
      .send(png);
    expect(put.status).toBe(200);
    expect(put.headers.etag).toMatch(/^"[0-9a-f]{32}"$/);
    const done = await complete(asset.id);
    expect(done.status).toBe(200);
    expect(MediaAsset.parse(done.body).status).toBe('processing');
    const stored = nas.files.get(
      `/socioboard-test/workspaces/${ws}/media/${asset.id}/original.png`,
    );
    expect(stored?.bytes.equals(png)).toBe(true);
    expect(stored?.contentType).toBe('image/png');
  });

  it('a large file: parts with ETags, joined in order and sent once', async () => {
    const size = 17 * MB;
    const video = Buffer.alloc(size);
    for (let i = 0; i < size; i += 4096) video[i] = (i / 4096) % 251;
    const { asset, upload } = await startUpload('clip.mp4', 'video/mp4', size);
    if (upload.type !== 'multipart') throw new Error('expected a multipart upload');
    expect(upload.parts).toHaveLength(2);
    const parts = [];
    // Out of order, as parallel uploads arrive.
    for (const part of [...upload.parts].reverse()) {
      const start = (part.partNumber - 1) * upload.partSize;
      const res = await request(t.app)
        .put(pathOf(part.url))
        .send(video.subarray(start, start + upload.partSize));
      expect(res.status).toBe(200);
      parts.push({ partNumber: part.partNumber, etag: String(res.headers.etag) });
    }
    const uploadsBefore = nas.calls.filter((c) => c.endsWith('/upload')).length;
    expect((await complete(asset.id, { parts })).status).toBe(200);
    expect(nas.calls.filter((c) => c.endsWith('/upload')).length).toBe(uploadsBefore + 1);
    const stored = nas.files.get(
      `/socioboard-test/workspaces/${ws}/media/${asset.id}/original.mp4`,
    );
    expect(stored?.bytes.equals(video)).toBe(true);
  });

  it('a part that does not match its ETag fails the upload', async () => {
    const size = 17 * MB;
    const { asset, upload } = await startUpload('clip2.mp4', 'video/mp4', size);
    if (upload.type !== 'multipart') throw new Error('expected a multipart upload');
    const parts = [];
    for (const part of upload.parts) {
      const res = await request(t.app)
        .put(pathOf(part.url))
        .send(Buffer.alloc(9 * MB));
      parts.push({ partNumber: part.partNumber, etag: String(res.headers.etag) });
    }
    const wrong = parts.map((p, i) => (i === 0 ? { ...p, etag: '"0"' } : p));
    const res = await complete(asset.id, { parts: wrong });
    expect([res.status, code(res)]).toEqual([422, 'UPLOAD_INCOMPLETE']);
  });

  it('refuses forged, changed and mismatched uploads', async () => {
    const { upload } = await startUpload('a.png', 'image/png', 100);
    if (upload.type !== 'single') throw new Error('expected a single upload');
    const path = pathOf(upload.url);
    const [payload, sig] = path.split('/').pop()?.split('.') ?? [];
    const forged = `${path.slice(0, path.lastIndexOf('/'))}/${payload ?? ''}.${(sig ?? '').replace(/^./, (c) => (c === 'A' ? 'B' : 'A'))}`;
    const cases: [string, string, Buffer, number][] = [
      [forged, 'image/png', Buffer.alloc(100), 403],
      [path, 'image/jpeg', Buffer.alloc(100), 400],
      [path, 'image/png', Buffer.alloc(101), 400],
    ];
    for (const [p, type, body, status] of cases) {
      const res = await request(t.app).put(p).set('Content-Type', type).send(body);
      expect([res.status, (res.body as { error?: { code: string } }).error?.code]).toEqual([
        status,
        'UPLOAD_REFUSED',
      ]);
    }
    // Nothing reached the NAS from those.
    expect([...nas.files.keys()].some((k) => k.includes('/a.png'))).toBe(false);
  });
});
