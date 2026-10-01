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

  describe('social accounts and posts', () => {
    const connection = (workspaceId: string, externalUserId: string = randomUUID()) =>
      db.client.socialConnection.create({
        data: {
          workspaceId,
          provider: 'facebook',
          externalUserId,
          displayName: 'Priya',
          accessTokenEnc: 'v1.k1.x.y.z',
          connectedById: userId,
        },
      });
    const account = (workspaceId: string, connectionId: string | null) =>
      db.client.socialAccount.create({
        data: {
          workspaceId,
          connectionId,
          network: 'facebook_page',
          externalId: randomUUID(),
          displayName: 'Halden Coffee',
        },
      });

    it('allows one row per login and per asset in a workspace, and the same in another', async () => {
      const login = await connection(wsA, `fb-${run}`);
      await expect(connection(wsA, `fb-${run}`)).rejects.toMatchObject({ code: 'P2002' });
      await expect(connection(wsB, `fb-${run}`)).resolves.toBeTruthy();

      const page = await account(wsA, login.id);
      await expect(
        db.client.socialAccount.create({
          data: {
            workspaceId: wsA,
            network: 'facebook_page',
            externalId: page.externalId,
            displayName: 'again',
          },
        }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('rejects links across workspaces: account → login, target → post or account', async () => {
      const loginB = await connection(wsB);
      await expect(account(wsA, loginB.id)).rejects.toMatchObject({ code: 'P2003' });

      const accountB = await account(wsB, loginB.id);
      const postA = await db.client.post.create({ data: { workspaceId: wsA, authorId: userId } });
      await expect(
        db.client.postTarget.create({
          data: { workspaceId: wsA, postId: postA.id, socialAccountId: accountB.id },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
      const postB = await db.client.post.create({ data: { workspaceId: wsB, authorId: userId } });
      await expect(
        db.client.postTarget.create({
          data: { workspaceId: wsB, postId: postA.id, socialAccountId: accountB.id },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
      await expect(
        db.client.postTarget.create({
          data: { workspaceId: wsB, postId: postB.id, socialAccountId: accountB.id },
        }),
      ).resolves.toBeTruthy();
    });

    it('deleting a post deletes its targets and their history; a used account stays', async () => {
      const login = await connection(wsA);
      const page = await account(wsA, login.id);
      const post = await db.client.post.create({ data: { workspaceId: wsA, authorId: userId } });
      const target = await db.client.postTarget.create({
        data: { workspaceId: wsA, postId: post.id, socialAccountId: page.id },
      });
      await db.client.publishAttempt.create({
        data: { workspaceId: wsA, postTargetId: target.id, attemptNo: 1 },
      });
      // Accounts with post history are disconnected, never deleted.
      await expect(
        db.client.socialAccount.delete({ where: { id: page.id } }),
      ).rejects.toMatchObject({ code: 'P2003' });

      await db.client.post.delete({ where: { id: post.id } });
      expect(await db.client.postTarget.count({ where: { postId: post.id } })).toBe(0);
      expect(await db.client.publishAttempt.count({ where: { postTargetId: target.id } })).toBe(0);
    });

    it('removing a login needs its accounts detached first; the accounts stay', async () => {
      const login = await connection(wsA);
      const page = await account(wsA, login.id);
      await expect(
        db.client.socialConnection.delete({ where: { id: login.id } }),
      ).rejects.toMatchObject({ code: 'P2003' });

      await db.client.socialAccount.update({
        where: { id: page.id },
        data: { connectionId: null, status: 'disconnected' },
      });
      await db.client.socialConnection.delete({ where: { id: login.id } });
      expect(await db.client.socialAccount.count({ where: { id: page.id } })).toBe(1);
    });

    it('deletes a workspace with logins, accounts, posts and history in one go', async () => {
      const ws = await db.client.workspace.create({
        data: { name: 'gone2', slug: `gone2-${run}`, timezone: 'UTC' },
      });
      const login = await connection(ws.id);
      const page = await account(ws.id, login.id);
      const post = await db.client.post.create({ data: { workspaceId: ws.id } });
      const target = await db.client.postTarget.create({
        data: { workspaceId: ws.id, postId: post.id, socialAccountId: page.id },
      });
      await db.client.publishAttempt.create({
        data: { workspaceId: ws.id, postTargetId: target.id, attemptNo: 1 },
      });
      await db.client.oAuthState.create({
        data: {
          state: randomUUID(),
          workspaceId: ws.id,
          userId,
          provider: 'facebook',
          connectionId: login.id,
          expiresAt: new Date(Date.now() + 600_000),
        },
      });

      await db.client.workspace.delete({ where: { id: ws.id } });
      expect(await db.client.socialAccount.count({ where: { workspaceId: ws.id } })).toBe(0);
      expect(await db.client.postTarget.count({ where: { workspaceId: ws.id } })).toBe(0);
    });

    it('finds posts that use a media file (GIN index on mediaIds)', async () => {
      const media = await db.client.mediaAsset.create({ data: asset(wsA) });
      await db.client.post.create({
        data: { workspaceId: wsA, mediaIds: [media.id], text: `uses-${run}` },
      });
      const users = await db.client.post.findMany({ where: { mediaIds: { has: media.id } } });
      expect(users.map((p) => p.text)).toEqual([`uses-${run}`]);
    });

    describe('scheduling (phase 2)', () => {
      const rule = (workspaceId: string, postId: string) =>
        db.client.recurringRule.create({
          data: {
            workspaceId,
            postId,
            rule: { frequency: 'daily', time: '09:00', timezone: 'UTC', startsOn: '2030-01-01' },
            rrule: 'FREQ=DAILY',
            timezone: 'UTC',
            startsAt: new Date('2030-01-01T09:00:00Z'),
          },
        });

      it('a recurring rule belongs to one post of its own workspace, one rule per post', async () => {
        const postA = await db.client.post.create({ data: { workspaceId: wsA } });
        await expect(rule(wsB, postA.id)).rejects.toMatchObject({ code: 'P2003' });
        await rule(wsA, postA.id);
        await expect(rule(wsA, postA.id)).rejects.toMatchObject({ code: 'P2002' });
      });

      it('creates each occurrence post once; sent occurrences outlive their template', async () => {
        const template = await db.client.post.create({ data: { workspaceId: wsA } });
        const { id: ruleId } = await rule(wsA, template.id);
        const occurrenceAt = new Date('2030-01-02T09:00:00Z');
        const occurrence = await db.client.post.create({
          data: { workspaceId: wsA, recurringRuleId: ruleId, occurrenceAt },
        });
        await expect(
          db.client.post.create({
            data: { workspaceId: wsA, recurringRuleId: ruleId, occurrenceAt },
          }),
        ).rejects.toMatchObject({ code: 'P2002' });

        // Deleting the template removes its rule; the occurrence stays, still marked recurring.
        await db.client.post.delete({ where: { id: template.id } });
        expect(await db.client.recurringRule.count({ where: { id: ruleId } })).toBe(0);
        const kept = await db.client.post.findUnique({ where: { id: occurrence.id } });
        expect(kept?.recurringRuleId).toBe(ruleId);
      });

      it('queue slots: one per account, weekday and time, never on another workspace’s account', async () => {
        const accountB = await account(wsB, (await connection(wsB)).id);
        const slot = (workspaceId: string, socialAccountId: string) =>
          db.client.queueSlot.create({
            data: { workspaceId, socialAccountId, weekday: 1, time: '09:00', timezone: 'UTC' },
          });
        await expect(slot(wsA, accountB.id)).rejects.toMatchObject({ code: 'P2003' });
        await slot(wsB, accountB.id);
        await expect(slot(wsB, accountB.id)).rejects.toMatchObject({ code: 'P2002' });
      });

      it('scopes rules and slots to one workspace through forWorkspace', async () => {
        const accountB = await account(wsB, (await connection(wsB)).id);
        await db.client.queueSlot.create({
          data: {
            workspaceId: wsB,
            socialAccountId: accountB.id,
            weekday: 2,
            time: '10:30',
            timezone: 'UTC',
          },
        });
        const a = db.forWorkspace(wsA);
        expect(await a.queueSlot.count({ where: { socialAccountId: accountB.id } })).toBe(0);
        await expect(
          a.queueSlot.create({
            data: {
              workspaceId: wsB,
              socialAccountId: accountB.id,
              weekday: 3,
              time: '11:00',
              timezone: 'UTC',
            },
          }),
        ).rejects.toThrow(/another workspace/);
      });
    });
  });

  describe('notifications and flags (phase 2)', () => {
    it('a workspace’s notifications go with it; ones about the user alone stay', async () => {
      const ws = await db.client.workspace.create({
        data: { name: 'gone3', slug: `gone3-${run}`, timezone: 'UTC' },
      });
      const note = (workspaceId: string | null) =>
        db.client.notification.create({
          data: { userId, workspaceId, type: 'publish_failed', title: 't', body: 'b' },
        });
      const inWorkspace = await note(ws.id);
      const personal = await note(null);
      await db.client.workspace.delete({ where: { id: ws.id } });
      expect(await db.client.notification.count({ where: { id: inWorkspace.id } })).toBe(0);
      expect(await db.client.notification.count({ where: { id: personal.id } })).toBe(1);
    });

    it('one preference per user and type; one flag per key', async () => {
      const pref = { userId, type: 'publish_failed', inApp: true, email: false };
      await db.client.notificationPreference.create({ data: pref });
      await expect(db.client.notificationPreference.create({ data: pref })).rejects.toMatchObject({
        code: 'P2002',
      });
      const key = `test.flag-${run}`;
      await db.client.featureFlag.create({ data: { key } });
      await expect(db.client.featureFlag.create({ data: { key } })).rejects.toMatchObject({
        code: 'P2002',
      });
      await db.client.featureFlag.delete({ where: { key } });
    });
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
