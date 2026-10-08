// Member account access (P4-B4) against Postgres: a member limited to some accounts sees and
// posts to only those, everywhere (accounts, groups, posts, scheduling, calendar, queue), and
// anything else answers like another workspace's (404). Owners and admins always have them all.
import { ErrorEnvelope, type Post } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let editor: Browser;
let viewer: Browser;
let ws = '';
const members = { owner: '', editor: '', viewer: '' };
const acc = { a: '', b: '', c: '' };
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const access = (memberId: string) => `${base()}/members/${memberId}/account-access`;
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

async function join(who: Browser, name: string, role: 'editor' | 'viewer') {
  const inv = await owner.post(`${base()}/invitations`, { email: t.email(name), role });
  await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
}

async function createPost(who: Browser, accountIds: string[], text = 'Fresh roast') {
  const res = await who.post(`${base()}/posts`, {
    text,
    targets: accountIds.map((accountId) => ({ accountId })),
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as Post;
}

beforeAll(async () => {
  owner = await t.signUp('aa-owner');
  editor = await t.signUp('aa-editor');
  viewer = await t.signUp('aa-viewer');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('AA'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-aa-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  for (const [key, externalId] of [
    ['a', '501'],
    ['b', '502'],
    ['c', '503'],
  ] as const) {
    acc[key] = (
      await t.db.client.socialAccount.create({
        data: {
          workspaceId: ws,
          connectionId: login.id,
          network: 'facebook_page',
          externalId,
          displayName: `Page ${externalId}`,
          status: 'active',
          assetTokenEnc: t.platform.crypto.encrypt(`page-token-${externalId}`),
        },
      })
    ).id;
  }
  await join(editor, 'aa-editor', 'editor');
  await join(viewer, 'aa-viewer', 'viewer');
  const list = (await owner.get(`${base()}/members`)).body as {
    items: { id: string; role: string }[];
  };
  for (const role of ['owner', 'editor', 'viewer'] as const) {
    members[role] = list.items.find((m) => m.role === role)?.id ?? '';
  }
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

describe('member account access', () => {
  it('gives every account until limited, and limits only to accounts of this workspace', async () => {
    expect((await owner.get(access(members.editor))).body).toEqual({ accountIds: null });

    const set = await owner.send('PUT', access(members.editor), { accountIds: [acc.a, acc.b] });
    expect(set.status, JSON.stringify(set.body)).toBe(200);
    expect(set.body).toEqual({ accountIds: [acc.a, acc.b] });
    // Members can see their own access; only `members:manage` sees or changes others'.
    expect((await editor.get(access(members.editor))).body).toEqual({
      accountIds: [acc.a, acc.b],
    });
    expect((await editor.get(access(members.viewer))).status).toBe(403);
    expect((await editor.send('PUT', access(members.viewer), { accountIds: [] })).status).toBe(403);

    const foreign = await owner.send('PUT', access(members.editor), {
      accountIds: [acc.a, '0190f5e0-0000-7000-8000-000000000000'],
    });
    expect([foreign.status, code(foreign)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);
    // The failed change left the limit as it was.
    expect((await owner.get(access(members.editor))).body).toEqual({ accountIds: [acc.a, acc.b] });

    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'member.account_access_changed' },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit?.diff).toEqual({ accountIds: [acc.a, acc.b] });
  });

  it('refuses to limit owners and admins: they manage the accounts', async () => {
    const res = await owner.send('PUT', access(members.owner), { accountIds: [acc.a] });
    expect([res.status, code(res)]).toEqual([422, 'ROLE_HAS_ALL_ACCOUNTS']);
  });

  it('lists only the accounts and group members a limited member may use', async () => {
    const accounts = (await editor.get(`${base()}/accounts`)).body as { items: { id: string }[] };
    expect(accounts.items.map((a) => a.id).sort()).toEqual([acc.a, acc.b].sort());
    const other = await editor.get(`${base()}/accounts/${acc.c}`);
    expect([other.status, code(other)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);

    await owner.post(`${base()}/account-groups`, { name: 'Mixed', accountIds: [acc.b, acc.c] });
    await owner.post(`${base()}/account-groups`, { name: 'Only C', accountIds: [acc.c] });
    const groups = (await editor.get(`${base()}/account-groups`)).body as {
      items: { name: string; accountIds: string[] }[];
    };
    expect(groups.items).toEqual([expect.objectContaining({ name: 'Mixed', accountIds: [acc.b] })]);
  });

  it("can't post to other accounts, nor see or change posts that go to them", async () => {
    const refused = await editor.post(`${base()}/posts`, {
      text: 'Hi',
      targets: [{ accountId: acc.a }, { accountId: acc.c }],
    });
    expect([refused.status, code(refused)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);
    const check = await editor.post(`${base()}/posts/validate`, {
      text: 'Hi',
      mediaIds: [],
      link: null,
      firstComment: null,
      targets: [{ accountId: acc.c }],
    });
    expect([check.status, code(check)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);

    const mine = await createPost(editor, [acc.a], 'Only mine');
    const mixed = await createPost(owner, [acc.a, acc.c], 'Shared with C');
    const list = (await editor.get(`${base()}/posts`)).body as { items: Post[] };
    expect(list.items.map((p) => p.id)).toContain(mine.id);
    expect(list.items.map((p) => p.id)).not.toContain(mixed.id);

    const url = `${base()}/posts/${mixed.id}`;
    for (const res of [
      await editor.get(url),
      await editor.send('PATCH', url, { text: 'hijacked' }),
      await editor.send('DELETE', url),
      await editor.post(`${url}/duplicate`),
      await editor.post(`${url}/publish-now`),
      await editor.post(`${url}/schedule`, { at: inHours(2) }),
      await editor.post(`${url}/queue`),
      await editor.post(`${url}/unschedule`),
    ]) {
      expect([res.status, code(res)], JSON.stringify(res.body)).toEqual([404, 'POST_NOT_FOUND']);
    }
    // Owners see everything.
    expect((await owner.get(url)).status).toBe(200);
  });

  it('shows a limited member only their posts on the calendar and the queue', async () => {
    const mine = await createPost(owner, [acc.b], 'B alone');
    const mixed = await createPost(owner, [acc.b, acc.c], 'B and C');
    const at = inHours(5);
    for (const p of [mine, mixed]) {
      const res = await owner.post(`${base()}/posts/${p.id}/schedule`, { at });
      expect(res.status, JSON.stringify(res.body)).toBe(200);
    }
    const calendar = await editor.get(
      `${base()}/calendar?from=${encodeURIComponent(inHours(0))}&to=${encodeURIComponent(inHours(24))}`,
    );
    expect(calendar.status, JSON.stringify(calendar.body)).toBe(200);
    const ids = (calendar.body as { items: { postId: string }[] }).items.map((e) => e.postId);
    expect(ids).toContain(mine.id);
    expect(ids).not.toContain(mixed.id);

    const target = mixed.targets.find((x) => x.account.id === acc.b);
    const moved = await editor.send('PATCH', `${base()}/targets/${target?.id ?? ''}/schedule`, {
      at: inHours(6),
      previousAt: at,
    });
    expect([moved.status, code(moved)]).toEqual([404, 'POST_NOT_FOUND']);

    const slots = await editor.get(`${base()}/accounts/${acc.c}/queue-slots`);
    expect([slots.status, code(slots)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);
  });

  it('gives every account back with null, and limits viewers too', async () => {
    await owner.send('PUT', access(members.viewer), { accountIds: [acc.c] });
    const seen = (await viewer.get(`${base()}/accounts`)).body as { items: { id: string }[] };
    expect(seen.items.map((a) => a.id)).toEqual([acc.c]);

    const back = await owner.send('PUT', access(members.editor), { accountIds: null });
    expect(back.body).toEqual({ accountIds: null });
    const all = (await editor.get(`${base()}/accounts`)).body as { items: unknown[] };
    expect(all.items).toHaveLength(3);
  });

  it('limited to no accounts at all is still limited, not all', async () => {
    await owner.send('PUT', access(members.viewer), { accountIds: [] });
    expect((await owner.get(access(members.viewer))).body).toEqual({ accountIds: [] });
    const seen = (await viewer.get(`${base()}/accounts`)).body as { items: unknown[] };
    expect(seen.items).toEqual([]);
  });
});
