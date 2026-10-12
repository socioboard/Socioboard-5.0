// Tasks (P4-B5) against Postgres: who creates, edits and deletes them; tasks about a post follow
// the post's account access (P4-B4); the order of the list; assigned, completed and due
// notifications; and the due reminder going out once.
import { ErrorEnvelope, type Post, type Task } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestApp } from '../../../testing';
import { createTaskService } from '../service';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let editor: Browser;
let contributor: Browser;
let viewer: Browser;
let limited: Browser;
let ws = '';
let account = '';
let other = '';
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

async function join(who: Browser, name: string, role: 'editor' | 'contributor' | 'viewer') {
  const inv = await owner.post(`${base()}/invitations`, { email: t.email(name), role });
  await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
}

async function draft(who: Browser, accountId = account) {
  const res = await who.post(`${base()}/posts`, {
    text: 'Autumn menu launch',
    targets: [{ accountId }],
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as Post;
}

async function task(who: Browser, body: Record<string, unknown>) {
  const res = await who.post(`${base()}/tasks`, body);
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as Task;
}

const list = async (who: Browser, query = '') =>
  ((await who.get(`${base()}/tasks${query}`)).body as { items: Task[]; nextCursor: string | null })
    .items;

/** The user's notifications about a task, as [type, title]. */
async function heard(who: Browser, taskId: string) {
  const rows = await t.db.client.notification.findMany({
    where: { userId: who.userId, workspaceId: ws },
    orderBy: { createdAt: 'asc' },
    select: { type: true, title: true, params: true },
  });
  return rows
    .filter((r) => (r.params as { taskId?: string }).taskId === taskId)
    .map((r) => [r.type, r.title]);
}

beforeAll(async () => {
  owner = await t.signUp('tk-owner');
  editor = await t.signUp('tk-editor');
  contributor = await t.signUp('tk-contrib');
  viewer = await t.signUp('tk-viewer');
  limited = await t.signUp('tk-limited');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('TK'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-tk-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  [account, other] = (await Promise.all(
    ['801', '802'].map(
      async (externalId) =>
        (
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
        ).id,
    ),
  )) as [string, string];
  await join(editor, 'tk-editor', 'editor');
  await join(contributor, 'tk-contrib', 'contributor');
  await join(viewer, 'tk-viewer', 'viewer');
  await join(limited, 'tk-limited', 'editor');
  const member = await t.db.client.member.findFirstOrThrow({
    where: { workspaceId: ws, userId: limited.userId },
  });
  await owner.send('PUT', `${base()}/members/${member.id}/account-access`, {
    accountIds: [other],
  });
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

describe('tasks', () => {
  it('a contributor creates a task about a post and gives it to an editor', async () => {
    const post = await draft(contributor);
    const made = await task(contributor, {
      title: 'Write the caption',
      description: 'Short and warm',
      postId: post.id,
      assigneeId: editor.userId,
      dueAt: inHours(48),
    });
    expect(made).toMatchObject({
      title: 'Write the caption',
      status: 'open',
      post: { id: post.id, excerpt: 'Autumn menu launch', gone: false },
      assignee: { id: editor.userId, name: 'tk-editor' },
      createdBy: { id: contributor.userId },
      completedAt: null,
    });
    await vi.waitFor(async () => {
      expect(await heard(editor, made.id)).toEqual([
        ['task_assigned', 'tk-contrib gave you a task'],
      ]);
    });
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'task.created', entityId: made.id },
    });
    expect(audit).not.toBeNull();
  });

  it('refuses assignees outside the workspace or who can’t see the post; viewers can’t create', async () => {
    const post = await draft(contributor);
    const stranger = await t.signUp('tk-stranger');
    const outside = await owner.post(`${base()}/tasks`, {
      title: 'x',
      assigneeId: stranger.userId,
    });
    expect([outside.status, code(outside)]).toEqual([422, 'ASSIGNEE_NOT_MEMBER']);
    const blind = await owner.post(`${base()}/tasks`, {
      title: 'x',
      postId: post.id,
      assigneeId: limited.userId,
    });
    expect([blind.status, code(blind)]).toEqual([422, 'ASSIGNEE_CANNOT_SEE_POST']);
    expect((await viewer.post(`${base()}/tasks`, { title: 'x' })).status).toBe(403);
  });

  it('an assignee changes only the status; done is stamped and notifies the creator', async () => {
    const made = await task(owner, { title: 'Check the photo', assigneeId: viewer.userId });
    const retitle = await viewer.send('PATCH', `${base()}/tasks/${made.id}`, { title: 'Mine' });
    expect([retitle.status, code(retitle)]).toEqual([403, 'TASK_STATUS_ONLY']);
    const notTheirs = await task(owner, { title: 'Someone else’s', assigneeId: editor.userId });
    const other = await viewer.send('PATCH', `${base()}/tasks/${notTheirs.id}`, {
      status: 'done',
    });
    expect([other.status, code(other)]).toEqual([403, 'TASK_STATUS_ONLY']);

    const done = await viewer.send('PATCH', `${base()}/tasks/${made.id}`, { status: 'done' });
    expect(done.status, JSON.stringify(done.body)).toBe(200);
    expect((done.body as Task).completedAt).not.toBeNull();
    await vi.waitFor(async () => {
      expect(await heard(owner, made.id)).toEqual([
        ['task_completed', 'tk-viewer finished a task you made'],
      ]);
    });
    const reopened = await viewer.send('PATCH', `${base()}/tasks/${made.id}`, {
      status: 'in_progress',
    });
    expect((reopened.body as Task).completedAt).toBeNull();
  });

  it('only its creator or someone who manages members deletes a task', async () => {
    const made = await task(contributor, { title: 'Delete me' });
    const byEditor = await editor.send('DELETE', `${base()}/tasks/${made.id}`);
    expect([byEditor.status, code(byEditor)]).toEqual([403, 'NOT_TASK_CREATOR']);
    expect((await owner.send('DELETE', `${base()}/tasks/${made.id}`)).status).toBe(204);
    const mine = await task(contributor, { title: 'Mine to delete' });
    expect((await contributor.send('DELETE', `${base()}/tasks/${mine.id}`)).status).toBe(204);
  });

  it('a task about a post a member can’t see is hidden from them', async () => {
    const post = await draft(owner);
    const hidden = await task(owner, { title: 'About the hidden post', postId: post.id });
    const open = await task(owner, { title: 'About nothing' });
    const theirs = (await list(limited)).map((x) => x.id);
    expect(theirs).toContain(open.id);
    expect(theirs).not.toContain(hidden.id);
    const patch = await limited.send('PATCH', `${base()}/tasks/${hidden.id}`, { status: 'done' });
    expect([patch.status, code(patch)]).toEqual([404, 'TASK_NOT_FOUND']);
  });

  it('lists not done first by due date, then done; filters by assignee, status and post', async () => {
    const post = await draft(owner);
    const later = await task(owner, { title: 'L', postId: post.id, dueAt: inHours(30) });
    const sooner = await task(owner, { title: 'S', postId: post.id, dueAt: inHours(3) });
    const undated = await task(owner, { title: 'U', postId: post.id });
    const finished = await task(owner, { title: 'D', postId: post.id, dueAt: inHours(1) });
    await owner.send('PATCH', `${base()}/tasks/${finished.id}`, { status: 'done' });
    expect((await list(owner, `?postId=${post.id}`)).map((x) => x.id)).toEqual([
      sooner.id,
      later.id,
      undated.id,
      finished.id,
    ]);
    // Paging keeps the order.
    const first = (await owner.get(`${base()}/tasks?postId=${post.id}&limit=3`)).body as {
      items: Task[];
      nextCursor: string;
    };
    const rest = await list(owner, `?postId=${post.id}&limit=3&cursor=${first.nextCursor}`);
    expect([...first.items, ...rest].map((x) => x.id)).toEqual([
      sooner.id,
      later.id,
      undated.id,
      finished.id,
    ]);
    expect((await list(owner, `?postId=${post.id}&status=done`)).map((x) => x.id)).toEqual([
      finished.id,
    ]);
    await owner.send('PATCH', `${base()}/tasks/${later.id}`, { assigneeId: contributor.userId });
    expect((await list(contributor, '?assignee=me')).map((x) => x.id)).toContain(later.id);
    expect((await owner.get(`${base()}/tasks?cursor=nope`)).status).toBe(400);
  });

  it('a task whose post was deleted stays, marked gone', async () => {
    const post = await draft(owner);
    const made = await task(owner, { title: 'Orphan', postId: post.id });
    await owner.send('DELETE', `${base()}/posts/${post.id}`);
    const [found] = (await list(owner)).filter((x) => x.id === made.id);
    expect(found?.post).toEqual({ id: post.id, excerpt: '', gone: true });
  });
});

describe('due reminders', () => {
  it('go to the assignee once, a day before; a new due date sends one again', async () => {
    const made = await task(owner, {
      title: 'Due soon',
      assigneeId: editor.userId,
      dueAt: inHours(5),
    });
    const notYet = await task(owner, {
      title: 'Due later',
      assigneeId: editor.userId,
      dueAt: inHours(30),
    });
    const tasks = createTaskService({
      ...t.platform,
      posts: { assertVisible: () => Promise.resolve() },
    });
    await tasks.remindDue();
    await tasks.remindDue();
    await vi.waitFor(async () => {
      expect(await heard(editor, made.id)).toEqual([
        ['task_assigned', 'tk-owner gave you a task'],
        ['task_due', 'A task of yours is due within a day'],
      ]);
    });
    expect((await heard(editor, notYet.id)).map(([type]) => type)).toEqual(['task_assigned']);

    await owner.send('PATCH', `${base()}/tasks/${made.id}`, { dueAt: inHours(6) });
    await tasks.remindDue();
    await vi.waitFor(async () => {
      expect((await heard(editor, made.id)).filter(([type]) => type === 'task_due')).toHaveLength(
        2,
      );
    });
  });
});
