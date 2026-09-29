// Tenant isolation harness (P0-B9). A member of workspace B attacks workspace A through every
// route. Every contract route must be classified below, so new routes can't skip these checks.
import { ErrorEnvelope } from '@socioboard/contracts';
import type request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp, namedRoutes, PENDING_ROUTES } from '../testing';

const t = createTestApp();
type Ids = Record<'workspaceId' | 'memberId' | 'invitationId' | 'assetId' | 'folderId', string>;

/**
 * How each route relates to tenant data:
 * - workspace: acts on the :workspaceId only (outsider check)
 * - resource: names a workspace-owned object in its path (outsider + foreign-id checks)
 * - list: returns workspace-owned objects (outsider + "no foreign items" checks)
 * - bodyRef: a body field names a workspace-owned object (foreign-id check with that body)
 * - user: not workspace-scoped; foreign references are covered in explicit tests below
 */
type Kind =
  | { kind: 'workspace'; body?: (a: Ids) => object }
  | { kind: 'resource'; body?: (a: Ids) => object }
  | { kind: 'list'; idsOf: keyof Ids; query?: (a: Ids) => string }
  | { kind: 'bodyRef'; body: (a: Ids) => object }
  | { kind: 'user' };

const CLASSIFIED: Record<string, Kind> = {
  // auth (/me): not workspace-scoped
  getAuthOptions: { kind: 'user' },
  getMe: { kind: 'user' },
  updateMe: { kind: 'user' },
  createAvatarUpload: { kind: 'user' },
  setActiveWorkspace: { kind: 'user' },
  listSessions: { kind: 'user' },
  revokeSession: { kind: 'user' },
  // workspaces
  createWorkspace: { kind: 'user' },
  listWorkspaces: { kind: 'user' },
  getWorkspace: { kind: 'workspace' },
  updateWorkspace: { kind: 'workspace', body: () => ({ name: 'hijacked' }) },
  createLogoUpload: { kind: 'workspace', body: () => ({ mime: 'image/png', sizeBytes: 10 }) },
  deleteWorkspace: { kind: 'workspace', body: () => ({ confirmName: 'x' }) },
  transferOwnership: { kind: 'bodyRef', body: (a) => ({ memberId: a.memberId }) },
  listMembers: { kind: 'list', idsOf: 'memberId' },
  updateMember: { kind: 'resource', body: () => ({ role: 'viewer' }) },
  removeMember: { kind: 'resource' },
  createInvitation: {
    kind: 'workspace',
    body: () => ({ email: 'x@example.test', role: 'viewer' }),
  },
  listInvitations: { kind: 'list', idsOf: 'invitationId' },
  revokeInvitation: { kind: 'resource' },
  getInvitation: { kind: 'user' },
  acceptInvitation: { kind: 'user' },
  declineInvitation: { kind: 'user' },
  // media
  createUpload: {
    kind: 'bodyRef',
    body: (a) => ({ fileName: 'x.png', mime: 'image/png', sizeBytes: 10, folderId: a.folderId }),
  },
  completeUpload: { kind: 'resource', body: () => ({}) },
  listFolders: { kind: 'list', idsOf: 'folderId' },
  createFolder: { kind: 'bodyRef', body: (a) => ({ name: 'x', parentId: a.folderId }) },
  updateFolder: { kind: 'resource', body: () => ({ name: 'hijacked' }) },
  deleteFolder: { kind: 'resource' },
  listMedia: { kind: 'list', idsOf: 'assetId' },
  getMedia: { kind: 'resource' },
  updateMedia: { kind: 'resource', body: () => ({ name: 'hijacked' }) },
  deleteMedia: { kind: 'resource' },
};

// Routes still being built (no handler yet) join the checks when their task mounts them.
const routes = namedRoutes().filter(([name]) => !(name in PENDING_ROUTES));
const fillPath = (path: string, ids: Partial<Ids>) =>
  path.replace(/:([A-Za-z]+)/g, (_, name: string) => ids[name as keyof Ids] ?? name);
const code = (res: request.Response) => ErrorEnvelope.safeParse(res.body).data?.error.code;

let attacker: Awaited<ReturnType<typeof t.signUp>>;
let victim: Awaited<ReturnType<typeof t.signUp>>;
let a: Ids; // workspace A (the victim's) and objects inside it
let bWorkspace = '';
let bAsset = '';
let bFolder = '';

beforeAll(async () => {
  await t.db.client.user.create({
    data: { name: 'Guard', email: t.email('guard'), isPlatformAdmin: true },
  });
  victim = await t.signUp('victim');
  attacker = await t.signUp('attacker');
  const colleague = await t.signUp('colleague');

  const create = async (who: typeof victim, name: string) =>
    (
      (await who.post('/api/v1/workspaces', { name: t.workspaceName(name), timezone: 'UTC' }))
        .body as { id: string }
    ).id;
  const aWorkspace = await create(victim, 'A');
  bWorkspace = await create(attacker, 'B');

  // Inside A: a second member, a pending invitation, a folder and an asset.
  const inv = await victim.post(`/api/v1/workspaces/${aWorkspace}/invitations`, {
    email: t.email('colleague'),
    role: 'editor',
  });
  await colleague.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  const pending = await victim.post(`/api/v1/workspaces/${aWorkspace}/invitations`, {
    email: t.email('pending'),
    role: 'viewer',
  });
  const members = (await victim.get(`/api/v1/workspaces/${aWorkspace}/members`)).body as {
    items: { id: string; role: string }[];
  };
  const folder = await victim.post(`/api/v1/workspaces/${aWorkspace}/media/folders`, {
    name: 'A folder',
  });
  const asset = await t.db.client.mediaAsset.create({
    data: {
      workspaceId: aWorkspace,
      name: 'a.png',
      kind: 'image',
      mime: 'image/png',
      storageKey: `test/${aWorkspace}/a`,
      sizeBytes: 10,
      status: 'uploading',
    },
  });
  a = {
    workspaceId: aWorkspace,
    memberId: members.items.find((m) => m.role === 'editor')?.id ?? '',
    invitationId: (pending.body as { id: string }).id,
    folderId: (folder.body as { id: string }).id,
    assetId: asset.id,
  };

  // The attacker's own folder and asset, for "move my thing into their folder" attempts.
  bFolder = (
    (await attacker.post(`/api/v1/workspaces/${bWorkspace}/media/folders`, { name: 'B folder' }))
      .body as { id: string }
  ).id;
  bAsset = (
    await t.db.client.mediaAsset.create({
      data: {
        workspaceId: bWorkspace,
        name: 'b.png',
        kind: 'image',
        mime: 'image/png',
        storageKey: `test/${bWorkspace}/b`,
        sizeBytes: 10,
        status: 'ready',
      },
    })
  ).id;
});

afterAll(async () => {
  await t.cleanup();
});

describe('tenant isolation harness', () => {
  it('classifies every contract route', () => {
    const unclassified = routes.map(([name]) => name).filter((name) => !(name in CLASSIFIED));
    expect(unclassified, 'add new routes to CLASSIFIED').toEqual([]);
  });

  it('outsider: every workspace route on workspace A answers 404 WORKSPACE_NOT_FOUND', async () => {
    const failures: string[] = [];
    for (const [name, route] of routes) {
      const k = CLASSIFIED[name];
      if (!k || k.kind === 'user') continue;
      const body = 'body' in k ? k.body(a) : undefined;
      const res = await attacker.send(route.method, fillPath(route.path, a), body);
      if (res.status !== 404 || code(res) !== 'WORKSPACE_NOT_FOUND') {
        failures.push(`${name}: ${String(res.status)} ${code(res) ?? ''}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("foreign ids: A's objects addressed inside workspace B answer 404", async () => {
    const failures: string[] = [];
    for (const [name, route] of routes) {
      const k = CLASSIFIED[name];
      if (!k || (k.kind !== 'resource' && k.kind !== 'bodyRef')) continue;
      const body = k.body ? k.body(a) : undefined;
      const res = await attacker.send(
        route.method,
        fillPath(route.path, { ...a, workspaceId: bWorkspace }),
        body,
      );
      if (res.status !== 404) failures.push(`${name}: ${String(res.status)} ${code(res) ?? ''}`);
    }
    expect(failures).toEqual([]);
  });

  it("lists in workspace B never include A's objects, even when filtered by A's ids", async () => {
    const leaks: string[] = [];
    for (const [name, route] of routes) {
      const k = CLASSIFIED[name];
      if (k?.kind !== 'list') continue;
      for (const qs of ['', name === 'listMedia' ? `?folderId=${a.folderId}` : '']) {
        const res = await attacker.get(`${fillPath(route.path, { workspaceId: bWorkspace })}${qs}`);
        if (res.status !== 200 || JSON.stringify(res.body).includes(a[k.idsOf]))
          leaks.push(`${name}${qs}`);
      }
    }
    expect(leaks).toEqual([]);
  });

  it("can't move its own objects into A's folders", async () => {
    const asset = await attacker.send('PATCH', `/api/v1/workspaces/${bWorkspace}/media/${bAsset}`, {
      folderId: a.folderId,
    });
    expect(code(asset)).toBe('FOLDER_NOT_FOUND');
    const folder = await attacker.send(
      'PATCH',
      `/api/v1/workspaces/${bWorkspace}/media/folders/${bFolder}`,
      { parentId: a.folderId },
    );
    expect(code(folder)).toBe('FOLDER_NOT_FOUND');
  });

  it("user routes: can't activate, accept, decline or revoke A's things", async () => {
    expect(
      (await attacker.post('/api/v1/me/active-workspace', { workspaceId: a.workspaceId })).status,
    ).toBe(404);
    expect((await attacker.post(`/api/v1/invitations/${a.invitationId}/accept`)).status).toBe(404);
    expect((await attacker.post(`/api/v1/invitations/${a.invitationId}/decline`)).status).toBe(404);
    const victimSession = await t.db.client.session.findFirstOrThrow({
      where: { userId: victim.userId },
    });
    expect((await attacker.send('DELETE', `/api/v1/me/sessions/${victimSession.id}`)).status).toBe(
      404,
    );
  });

  it('database: nested connects and foreign keys across workspaces are rejected', async () => {
    const scopedB = t.db.forWorkspace(bWorkspace);
    await expect(
      scopedB.mediaAsset.update({ where: { id: bAsset }, data: { folderId: a.folderId } }),
    ).rejects.toMatchObject({ code: 'P2003' });
    await expect(
      scopedB.mediaAsset.update({
        where: { id: bAsset },
        data: {
          folder: { connect: { id_workspaceId: { id: a.folderId, workspaceId: a.workspaceId } } },
        },
      }),
    ).rejects.toMatchObject({ name: 'TenantScopeError' });
    // A's asset is invisible through B's scoped client, whatever the query.
    expect(await scopedB.mediaAsset.findUnique({ where: { id: a.assetId } })).toBeNull();
    expect(await scopedB.mediaAsset.count({ where: { id: a.assetId } })).toBe(0);
  });

  it('left workspace A exactly as it was', async () => {
    const ws = await t.db.client.workspace.findUniqueOrThrow({ where: { id: a.workspaceId } });
    expect(ws.name).toBe(t.workspaceName('A'));
    expect(ws.deletedAt).toBeNull();
    const member = await t.db.client.member.findUniqueOrThrow({ where: { id: a.memberId } });
    expect(member.role).toBe('editor');
    expect(
      (await t.db.client.invitation.findUniqueOrThrow({ where: { id: a.invitationId } })).status,
    ).toBe('pending');
    const folder = await t.db.client.mediaFolder.findUniqueOrThrow({ where: { id: a.folderId } });
    expect(folder.name).toBe('A folder');
    const asset = await t.db.client.mediaAsset.findUniqueOrThrow({ where: { id: a.assetId } });
    expect(asset).toMatchObject({ name: 'a.png', deletedAt: null, status: 'uploading' });
    // Nothing was moved or injected into A: still exactly its own asset, folder and two members.
    expect(await t.db.client.mediaAsset.count({ where: { workspaceId: a.workspaceId } })).toBe(1);
    expect(await t.db.client.mediaFolder.count({ where: { workspaceId: a.workspaceId } })).toBe(1);
    expect(await t.db.client.member.count({ where: { workspaceId: a.workspaceId } })).toBe(2);
    // …and B's own asset is still B's.
    const bRow = await t.db.client.mediaAsset.findUniqueOrThrow({ where: { id: bAsset } });
    expect(bRow.workspaceId).toBe(bWorkspace);
  });
});
