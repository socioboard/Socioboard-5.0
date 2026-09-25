// Schema rules checked against the real database (`pnpm services:up` + migrations applied).
import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createDb } from '../db';
import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';

const config = loadConfig();
const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: WORKSPACE_SCOPED_MODELS });
const run = randomUUID().slice(0, 8);

let userId = '';
let wsA = '';
let wsB = '';

const asset = (workspaceId: string, extra: Record<string, unknown> = {}) => ({
  workspaceId,
  name: 'photo.jpg',
  kind: 'image' as const,
  mime: 'image/jpeg',
  storageKey: `test/${run}/${randomUUID()}`,
  sizeBytes: 1000,
  uploadedById: userId,
  ...extra,
});

beforeAll(async () => {
  const user = await db.client.user.create({
    data: { name: 'Test User', email: `schema-${run}@example.test` },
  });
  userId = user.id;
  const make = (slug: string) =>
    db.client.workspace.create({ data: { name: slug, slug: `${slug}-${run}`, timezone: 'UTC' } });
  wsA = (await make('ws-a')).id;
  wsB = (await make('ws-b')).id;
});

afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { slug: { endsWith: `-${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `${run}@example.test` } } });
  await db.close();
});

describe('database schema', () => {
  it('generates UUIDv7 ids', async () => {
    const { id } = await db.client.mediaAsset.create({ data: asset(wsA) });
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(userId[14]).toBe('7');
  });

  it('rejects linking an asset to another workspace’s folder', async () => {
    const folderB = await db.client.mediaFolder.create({ data: { workspaceId: wsB, name: 'B' } });
    await expect(
      db.client.mediaAsset.create({ data: asset(wsA, { folderId: folderB.id }) }),
    ).rejects.toMatchObject({ code: 'P2003' });
    await expect(
      db.client.mediaFolder.create({
        data: { workspaceId: wsA, name: 'child', parentId: folderB.id },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('blocks deleting a folder that still holds assets or subfolders', async () => {
    const folder = await db.client.mediaFolder.create({ data: { workspaceId: wsA, name: 'F' } });
    await db.client.mediaAsset.create({ data: asset(wsA, { folderId: folder.id }) });
    await expect(db.client.mediaFolder.delete({ where: { id: folder.id } })).rejects.toMatchObject({
      code: 'P2003',
    });
  });

  it('deletes a whole workspace with nested folders and assets in one go', async () => {
    const ws = await db.client.workspace.create({
      data: { name: 'gone', slug: `gone-${run}`, timezone: 'UTC' },
    });
    const parent = await db.client.mediaFolder.create({ data: { workspaceId: ws.id, name: 'p' } });
    const child = await db.client.mediaFolder.create({
      data: { workspaceId: ws.id, name: 'c', parentId: parent.id },
    });
    await db.client.mediaAsset.create({ data: asset(ws.id, { folderId: child.id }) });
    await db.client.member.create({ data: { workspaceId: ws.id, userId, role: 'owner' } });

    await db.client.workspace.delete({ where: { id: ws.id } });
    expect(await db.client.mediaAsset.count({ where: { workspaceId: ws.id } })).toBe(0);
    expect(await db.client.mediaFolder.count({ where: { workspaceId: ws.id } })).toBe(0);
    expect(await db.client.member.count({ where: { workspaceId: ws.id } })).toBe(0);
  });

  it('scopes queries to one workspace through forWorkspace', async () => {
    await db.client.mediaAsset.create({ data: asset(wsB, { name: 'b-only.jpg' }) });
    const a = db.forWorkspace(wsA);
    const names = (await a.mediaAsset.findMany()).map((m) => m.name);
    expect(names).not.toContain('b-only.jpg');
    const created = await a.mediaAsset.create({
      data: { ...asset(wsA), workspaceId: undefined } as never,
    });
    expect(created.workspaceId).toBe(wsA);
  });

  it('allows one membership per user and workspace', async () => {
    await db.client.member.create({ data: { workspaceId: wsA, userId, role: 'owner' } });
    await expect(
      db.client.member.create({ data: { workspaceId: wsA, userId, role: 'admin' } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('keeps uploads when the uploader’s account is deleted', async () => {
    const temp = await db.client.user.create({
      data: { name: 'Temp', email: `temp-${run}@example.test` },
    });
    const kept = await db.client.mediaAsset.create({
      data: asset(wsA, { uploadedById: temp.id }),
    });
    await db.client.user.delete({ where: { id: temp.id } });
    const after = await db.client.mediaAsset.findUnique({ where: { id: kept.id } });
    expect(after?.uploadedById).toBeNull();
  });
});
