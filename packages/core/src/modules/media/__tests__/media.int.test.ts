// Media routes over HTTP against Postgres and Valkey; upload flows also need S3/MinIO.
import { randomUUID } from 'node:crypto';

import {
  CreateUploadResponse,
  ErrorEnvelope,
  MediaAsset,
  MediaAssetDetails,
  MediaFolder,
  page,
} from '@socioboard/contracts';
import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createApiRouter,
  createDb,
  createErrorHandler,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  createStorage,
  loadConfig,
  originCheck,
  session,
  systemClock,
} from '../../../platform';
import { createAuthModule, createWorkspaceAuthPort } from '../../auth';
import {
  createMembershipLookup,
  createWorkspaceService,
  registerWorkspaceRoutes,
} from '../../workspaces';
import { createMediaService, processMedia, registerMediaRoutes } from '../index';

const base = loadConfig();
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 4, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const storage = config.storage ? createStorage(config.storage) : undefined;
const events = createEventBus<Record<string, unknown>>({ logger });
const mailer = createMailer({ smtpUrl: undefined, from: 'x', logger });
const authModule = createAuthModule({ config, db, kv, mailer, logger, events });
const lookupMembership = createMembershipLookup(db);
const api = createApiRouter({ lookupMembership });
const queued: string[] = [];
registerWorkspaceRoutes(
  api,
  createWorkspaceService({
    db,
    authPort: createWorkspaceAuthPort(authModule.auth),
    storage,
    mailer,
    events,
    clock: systemClock,
    logger,
    appUrl: config.appUrl,
    requireVerifiedEmail: false,
  }),
);
registerMediaRoutes(
  api,
  createMediaService({
    db,
    storage,
    clock: systemClock,
    logger,
    events,
    enqueueProcessing: (assetId) => {
      queued.push(assetId);
      return Promise.resolve();
    },
  }),
);
const jobDeps = { db, storage, logger, events, tools: config.media };

const app = express();
app.set('trust proxy', 'loopback');
app.use(authModule.router);
app.use(express.json());
app.use('/api/v1', originCheck(config.appUrl), session(authModule.resolveSession));
app.use(api.router);
app.use(createErrorHandler(logger));

const run = randomUUID().slice(0, 8);
let ipCounter = 0;
type Browser = ReturnType<typeof browser>;
function browser() {
  const agent = request.agent(app);
  const ip = `10.66.${String(Math.floor(++ipCounter / 250))}.${String(ipCounter % 250)}`;
  const h = <T extends request.Test>(t: T) =>
    t.set('Origin', config.appUrl).set('X-Forwarded-For', ip);
  return {
    get: (p: string) => h(agent.get(p)),
    post: (p: string, body?: object) => h(agent.post(p)).send(body),
    patch: (p: string, body?: object) => h(agent.patch(p)).send(body),
    delete: (p: string) => h(agent.delete(p)),
  };
}
const code = (res: request.Response) => ErrorEnvelope.parse(res.body).error.code;

async function user(label: string) {
  const b = browser();
  const res = await b.post('/api/auth/sign-up/email', {
    name: label,
    email: `${label}-${run}@example.test`,
    password: 'a long enough password',
  });
  expect(res.status).toBe(200);
  return b;
}
async function workspace(owner: Browser) {
  const res = await owner.post('/api/v1/workspaces', { name: `M${run} ws`, timezone: 'UTC' });
  expect(res.status).toBe(201);
  return (res.body as { id: string }).id;
}
async function addMember(owner: Browser, wid: string, label: string, role: string) {
  const b = await user(label);
  const inv = await owner.post(`/api/v1/workspaces/${wid}/invitations`, {
    email: `${label}-${run}@example.test`,
    role,
  });
  await b.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  return b;
}
/** An asset row inserted directly, for tests that don't need a real file. */
async function seedAsset(workspaceId: string, name: string, extra: Record<string, unknown> = {}) {
  return db.client.mediaAsset.create({
    data: {
      workspaceId,
      name,
      kind: 'image',
      mime: 'image/png',
      storageKey: `test/${run}/${randomUUID()}`,
      sizeBytes: 10,
      status: 'ready',
      ...extra,
    },
  });
}

let owner: Browser;
let wid: string;
beforeAll(async () => {
  await db.client.user.create({
    data: { name: 'Guard', email: `guard-${run}@example.test`, isPlatformAdmin: true },
  });
  owner = await user('media-owner');
  wid = await workspace(owner);
});
afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { name: { startsWith: `M${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
  storage?.close();
});

describe('folders', () => {
  it('nests folders, refuses cycles, and moves contents up when a folder is deleted', async () => {
    const f = (body: object) => owner.post(`/api/v1/workspaces/${wid}/media/folders`, body);
    const campaigns = MediaFolder.parse((await f({ name: 'Campaigns' })).body);
    const summer = MediaFolder.parse((await f({ name: 'Summer', parentId: campaigns.id })).body);
    const june = MediaFolder.parse((await f({ name: 'June', parentId: summer.id })).body);

    const cycle = await owner.patch(`/api/v1/workspaces/${wid}/media/folders/${campaigns.id}`, {
      parentId: june.id,
    });
    expect(code(cycle)).toBe('FOLDER_CYCLE');
    const self = await owner.patch(`/api/v1/workspaces/${wid}/media/folders/${summer.id}`, {
      parentId: summer.id,
    });
    expect(code(self)).toBe('FOLDER_CYCLE');

    const asset = await seedAsset(wid, 'in-summer.png', { folderId: summer.id });
    expect(
      (await owner.delete(`/api/v1/workspaces/${wid}/media/folders/${summer.id}`)).status,
    ).toBe(204);
    const folders = z
      .object({ items: z.array(MediaFolder) })
      .parse((await owner.get(`/api/v1/workspaces/${wid}/media/folders`)).body).items;
    expect(folders.find((x) => x.id === june.id)?.parentId).toBe(campaigns.id);
    expect(folders.some((x) => x.id === summer.id)).toBe(false);
    const moved = await db.client.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
    expect(moved.folderId).toBe(campaigns.id);
  });

  it('never touches folders of another workspace', async () => {
    const otherOwner = await user('folder-other');
    const otherWs = await workspace(otherOwner);
    const theirs = MediaFolder.parse(
      (await otherOwner.post(`/api/v1/workspaces/${otherWs}/media/folders`, { name: 'Theirs' }))
        .body,
    );
    expect(
      (await owner.patch(`/api/v1/workspaces/${wid}/media/folders/${theirs.id}`, { name: 'x' }))
        .status,
    ).toBe(404);
    expect(
      (await owner.delete(`/api/v1/workspaces/${wid}/media/folders/${theirs.id}`)).status,
    ).toBe(404);
    expect(
      code(
        await owner.post(`/api/v1/workspaces/${wid}/media/folders`, {
          name: 'x',
          parentId: theirs.id,
        }),
      ),
    ).toBe('FOLDER_NOT_FOUND');
  });
});

describe('listing, details, update, delete', () => {
  it('filters, searches and pages newest first', async () => {
    const ws = await workspace(owner);
    const folder = MediaFolder.parse(
      (await owner.post(`/api/v1/workspaces/${ws}/media/folders`, { name: 'F' })).body,
    );
    await seedAsset(ws, 'beach-sunset.png', { createdAt: new Date('2026-01-01T00:00:01Z') });
    await seedAsset(ws, 'launch-video.mp4', {
      kind: 'video',
      mime: 'video/mp4',
      createdAt: new Date('2026-01-01T00:00:02Z'),
    });
    await seedAsset(ws, 'Beach-party.png', {
      folderId: folder.id,
      source: 'ai',
      createdAt: new Date('2026-01-01T00:00:03Z'),
    });
    await seedAsset(ws, 'deleted.png', { deletedAt: new Date() });
    const Page = page(MediaAsset);
    const list = async (qs: string) =>
      Page.parse((await owner.get(`/api/v1/workspaces/${ws}/media?${qs}`)).body);

    expect((await list('')).items.map((a) => a.name)).toEqual([
      'Beach-party.png',
      'launch-video.mp4',
      'beach-sunset.png',
    ]);
    expect((await list('kind=video')).items.map((a) => a.name)).toEqual(['launch-video.mp4']);
    expect((await list('source=ai')).items).toHaveLength(1);
    expect((await list(`folderId=${folder.id}`)).items.map((a) => a.name)).toEqual([
      'Beach-party.png',
    ]);
    expect((await list('folderId=root')).items).toHaveLength(2);
    expect((await list('q=beach')).items).toHaveLength(2);

    const first = await list('limit=2');
    expect(first.items).toHaveLength(2);
    const second = await list(`limit=2&cursor=${first.nextCursor ?? ''}`);
    expect(second.items.map((a) => a.name)).toEqual(['beach-sunset.png']);
    expect(second.nextCursor).toBeNull();
    expect(code(await owner.get(`/api/v1/workspaces/${ws}/media?cursor=nonsense`))).toBe(
      'INVALID_CURSOR',
    );
  });

  it('updates name, alt text and folder; deletes softly; respects roles', async () => {
    const asset = await seedAsset(wid, 'old-name.png');
    const upd = await owner.patch(`/api/v1/workspaces/${wid}/media/${asset.id}`, {
      name: 'new-name.png',
      altText: 'A blue square',
    });
    expect(MediaAsset.parse(upd.body)).toMatchObject({
      name: 'new-name.png',
      altText: 'A blue square',
    });

    const viewer = await addMember(owner, wid, 'media-viewer', 'viewer');
    expect((await viewer.get(`/api/v1/workspaces/${wid}/media/${asset.id}`)).status).toBe(200);
    expect(
      (await viewer.patch(`/api/v1/workspaces/${wid}/media/${asset.id}`, { name: 'x' })).status,
    ).toBe(403);
    expect(
      (
        await viewer.post(`/api/v1/workspaces/${wid}/media/uploads`, {
          fileName: 'a.png',
          mime: 'image/png',
          sizeBytes: 5,
        })
      ).status,
    ).toBe(403);
    expect((await viewer.delete(`/api/v1/workspaces/${wid}/media/${asset.id}`)).status).toBe(403);

    expect((await owner.delete(`/api/v1/workspaces/${wid}/media/${asset.id}`)).status).toBe(204);
    expect(code(await owner.get(`/api/v1/workspaces/${wid}/media/${asset.id}`))).toBe(
      'MEDIA_NOT_FOUND',
    );
  });

  it('hides assets of other workspaces', async () => {
    const outsider = await user('media-outsider');
    const theirWs = await workspace(outsider);
    const theirs = await seedAsset(theirWs, 'theirs.png');
    expect((await owner.get(`/api/v1/workspaces/${wid}/media/${theirs.id}`)).status).toBe(404);
    expect((await outsider.get(`/api/v1/workspaces/${wid}/media`)).status).toBe(404);
  });
});

describe('uploads', () => {
  it.runIf(!storage)('reports that storage is not configured', async () => {
    const res = await owner.post(`/api/v1/workspaces/${wid}/media/uploads`, {
      fileName: 'a.png',
      mime: 'image/png',
      sizeBytes: 100,
    });
    expect(code(res)).toBe('STORAGE_NOT_CONFIGURED');
  });

  it.runIf(storage)('uploads an image, completes it, processes it and serves it', async () => {
    const file = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: '#ff6600' },
    })
      .png()
      .toBuffer();
    const start = CreateUploadResponse.parse(
      (
        await owner.post(`/api/v1/workspaces/${wid}/media/uploads`, {
          fileName: 'Launch banner.png',
          mime: 'image/png',
          sizeBytes: file.length,
        })
      ).body,
    );
    expect(start.asset.status).toBe('uploading');
    if (start.upload.type !== 'single') throw new Error('expected a single upload');
    const put = await fetch(start.upload.url, {
      method: 'PUT',
      body: file,
      headers: start.upload.headers,
    });
    expect(put.status).toBe(200);

    const done = await owner.post(
      `/api/v1/workspaces/${wid}/media/uploads/${start.asset.id}/complete`,
      {},
    );
    expect(MediaAsset.parse(done.body).status).toBe('processing');
    expect(queued).toContain(start.asset.id);
    expect(
      code(
        await owner.post(`/api/v1/workspaces/${wid}/media/uploads/${start.asset.id}/complete`, {}),
      ),
    ).toBe('UPLOAD_ALREADY_COMPLETED');

    await processMedia(jobDeps, start.asset.id, true);
    const details = MediaAssetDetails.parse(
      (await owner.get(`/api/v1/workspaces/${wid}/media/${start.asset.id}`)).body,
    );
    expect(details).toMatchObject({
      status: 'ready',
      width: 1200,
      height: 800,
      name: 'Launch banner.png',
    });
    const thumb = await fetch(details.thumbnailUrl ?? '');
    expect((await sharp(Buffer.from(await thumb.arrayBuffer())).metadata()).width).toBe(480);
    const original = await fetch(details.url ?? '');
    expect(Buffer.from(await original.arrayBuffer()).equals(file)).toBe(true);
  });

  it.runIf(storage)('uploads a large file in parts', async () => {
    const size = 17 * 1024 * 1024; // above the 16 MB threshold: two parts
    const start = CreateUploadResponse.parse(
      (
        await owner.post(`/api/v1/workspaces/${wid}/media/uploads`, {
          fileName: 'clip.mp4',
          mime: 'video/mp4',
          sizeBytes: size,
        })
      ).body,
    );
    if (start.upload.type !== 'multipart') throw new Error('expected a multipart upload');
    expect(start.upload.parts).toHaveLength(2);
    const data = Buffer.alloc(size, 3);
    const parts = [];
    for (const part of start.upload.parts) {
      const from = (part.partNumber - 1) * start.upload.partSize;
      const res = await fetch(part.url, {
        method: 'PUT',
        body: data.subarray(from, from + start.upload.partSize),
      });
      parts.push({ partNumber: part.partNumber, etag: res.headers.get('etag') ?? '' });
    }
    expect(
      code(
        await owner.post(`/api/v1/workspaces/${wid}/media/uploads/${start.asset.id}/complete`, {}),
      ),
    ).toBe('PARTS_REQUIRED');
    const done = await owner.post(
      `/api/v1/workspaces/${wid}/media/uploads/${start.asset.id}/complete`,
      { parts },
    );
    expect(MediaAsset.parse(done.body)).toMatchObject({ status: 'processing', kind: 'video' });
    // The bytes aren't a real video: processed as on a server without ffprobe, it still becomes
    // ready, just without duration or thumbnail (with ffprobe installed it would fail to read them).
    await processMedia(
      { ...jobDeps, tools: { ffmpegPath: 'no-such-ffmpeg', ffprobePath: 'no-such-ffprobe' } },
      start.asset.id,
      true,
    );
    const after = await db.client.mediaAsset.findUniqueOrThrow({ where: { id: start.asset.id } });
    expect(after.status).toBe('ready');
  });

  it.runIf(storage)(
    'rejects completion when the file is missing or not what was declared',
    async () => {
      const declare = (fileName: string) =>
        owner.post(`/api/v1/workspaces/${wid}/media/uploads`, {
          fileName,
          mime: 'image/png',
          sizeBytes: 10,
        });

      const missing = CreateUploadResponse.parse((await declare('never-uploaded.png')).body);
      expect(
        code(
          await owner.post(
            `/api/v1/workspaces/${wid}/media/uploads/${missing.asset.id}/complete`,
            {},
          ),
        ),
      ).toBe('UPLOAD_INVALID');
      expect(
        (await db.client.mediaAsset.findUniqueOrThrow({ where: { id: missing.asset.id } })).status,
      ).toBe('failed');

      // Right size but not a PNG: accepted by S3 (only length and type header are signed), then
      // processing fails and the asset is marked failed on the last attempt.
      const fake = CreateUploadResponse.parse((await declare('fake.png')).body);
      if (fake.upload.type !== 'single') throw new Error('expected a single upload');
      await fetch(fake.upload.url, {
        method: 'PUT',
        body: Buffer.from('0123456789'),
        headers: fake.upload.headers,
      });
      await owner.post(`/api/v1/workspaces/${wid}/media/uploads/${fake.asset.id}/complete`, {});
      await expect(processMedia(jobDeps, fake.asset.id, true)).rejects.toThrow();
      expect(
        (await db.client.mediaAsset.findUniqueOrThrow({ where: { id: fake.asset.id } })).status,
      ).toBe('failed');
    },
  );
});
