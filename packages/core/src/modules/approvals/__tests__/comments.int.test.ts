// Comments and review notifications (P4-B3) against Postgres: anyone who can see a post comments
// on it, one level deep, @mentioning members who can see it; only authors edit or delete their
// comments; review steps and comments notify the right people, and never someone who can't see
// the post (P4-B4).
import {
  ErrorEnvelope,
  type Mentionable,
  type Post,
  type PostComment,
} from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestApp } from '../../../testing';

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

async function join(who: Browser, name: string, role: 'editor' | 'contributor' | 'viewer') {
  const inv = await owner.post(`${base()}/invitations`, { email: t.email(name), role });
  await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
}

async function draft(who: Browser, accountId = account) {
  const res = await who.post(`${base()}/posts`, { text: 'Fresh roast', targets: [{ accountId }] });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as Post;
}

async function comment(
  who: Browser,
  postId: string,
  body: string,
  extra: { parentId?: string; mentionIds?: string[] } = {},
) {
  const res = await who.post(`${base()}/posts/${postId}/comments`, { body, ...extra });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as PostComment;
}

const thread = async (who: Browser, postId: string) =>
  ((await who.get(`${base()}/posts/${postId}/comments`)).body as { items: PostComment[] }).items;

/** The user's notifications about this post, as [type, title]. */
async function heard(who: Browser, postId: string) {
  const rows = await t.db.client.notification.findMany({
    where: { userId: who.userId, workspaceId: ws },
    orderBy: { createdAt: 'asc' },
    select: { type: true, title: true, params: true },
  });
  return rows
    .filter((r) => (r.params as { postId?: string }).postId === postId)
    .map((r) => [r.type, r.title]);
}

beforeAll(async () => {
  owner = await t.signUp('cm-owner');
  editor = await t.signUp('cm-editor');
  contributor = await t.signUp('cm-contrib');
  viewer = await t.signUp('cm-viewer');
  limited = await t.signUp('cm-limited');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('CM'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-cm-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  [account, other] = (await Promise.all(
    ['701', '702'].map(
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
  await join(editor, 'cm-editor', 'editor');
  await join(contributor, 'cm-contrib', 'contributor');
  await join(viewer, 'cm-viewer', 'viewer');
  await join(limited, 'cm-limited', 'editor');
  // An editor who only has the other account: can't see posts to `account`.
  const member = await t.db.client.member.findFirstOrThrow({
    where: { workspaceId: ws, userId: limited.userId },
  });
  const set = await owner.send('PUT', `${base()}/members/${member.id}/account-access`, {
    accountIds: [other],
  });
  expect(set.status, JSON.stringify(set.body)).toBe(200);
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

describe('comments', () => {
  it('threads one level deep, with mentions by name; viewers comment too', async () => {
    const post = await draft(contributor);
    const first = await comment(editor, post.id, 'Love it @cm-contrib', {
      mentionIds: [contributor.userId],
    });
    expect(first).toMatchObject({
      parentId: null,
      author: { id: editor.userId, name: 'cm-editor' },
      mentions: [{ id: contributor.userId, name: 'cm-contrib' }],
      editedAt: null,
    });
    const second = await comment(viewer, post.id, 'Second thought');
    const reply = await comment(contributor, post.id, 'Thanks!', { parentId: first.id });
    // A reply to a reply joins the thread.
    const nested = await comment(owner, post.id, 'Agreed', { parentId: reply.id });
    expect(nested.parentId).toBe(first.id);

    expect((await thread(viewer, post.id)).map((c) => c.id)).toEqual([
      first.id,
      reply.id,
      nested.id,
      second.id,
    ]);
  });

  it('only members who can see the post can be mentioned', async () => {
    const post = await draft(contributor);
    const people = (
      (await contributor.get(`${base()}/posts/${post.id}/mentionable`)).body as {
        items: Mentionable[];
      }
    ).items.map((p) => p.id);
    expect(people).toEqual(
      expect.arrayContaining([owner.userId, editor.userId, viewer.userId, contributor.userId]),
    );
    expect(people).not.toContain(limited.userId);

    const refused = await editor.post(`${base()}/posts/${post.id}/comments`, {
      body: 'Hey',
      mentionIds: [limited.userId],
    });
    expect([refused.status, code(refused)]).toEqual([422, 'MENTION_NOT_ALLOWED']);
    // And the limited member can't read or comment on it at all.
    expect((await limited.get(`${base()}/posts/${post.id}/comments`)).status).toBe(404);
    const theirs = await limited.post(`${base()}/posts/${post.id}/comments`, { body: 'Hi' });
    expect(theirs.status).toBe(404);
  });

  it('authors edit and delete their own; a deleted comment with replies stays', async () => {
    const post = await draft(contributor);
    const top = await comment(editor, post.id, 'Top');
    const reply = await comment(contributor, post.id, 'Reply', { parentId: top.id });

    const notMine = await contributor.send('PATCH', `${base()}/comments/${top.id}`, {
      body: 'Hijack',
    });
    expect([notMine.status, code(notMine)]).toEqual([403, 'NOT_COMMENT_AUTHOR']);
    const edited = await editor.send('PATCH', `${base()}/comments/${top.id}`, { body: 'Top!' });
    expect(edited.status, JSON.stringify(edited.body)).toBe(200);
    expect((edited.body as PostComment).body).toBe('Top!');
    expect((edited.body as PostComment).editedAt).not.toBeNull();

    expect((await editor.send('DELETE', `${base()}/comments/${top.id}`)).status).toBe(204);
    const after = await thread(owner, post.id);
    expect(after.map((c) => [c.id, c.body, c.author, c.deletedAt !== null])).toEqual([
      [top.id, '', null, true],
      [reply.id, 'Reply', expect.objectContaining({ id: contributor.userId }), false],
    ]);
    const gone = await editor.send('PATCH', `${base()}/comments/${top.id}`, { body: 'Back' });
    expect(gone.status).toBe(404);

    // The last reply going takes the deleted parent with it.
    expect((await contributor.send('DELETE', `${base()}/comments/${reply.id}`)).status).toBe(204);
    expect(await thread(owner, post.id)).toEqual([]);
  });

  it('comments go with their post', async () => {
    const post = await draft(contributor);
    await comment(editor, post.id, 'Bye');
    expect((await contributor.send('DELETE', `${base()}/posts/${post.id}`)).status).toBe(204);
    expect(await t.db.client.postComment.count({ where: { postId: post.id } })).toBe(0);
  });
});

describe('notifications', () => {
  it('review steps notify approvers who can see the post, then its author', async () => {
    const post = await draft(contributor);
    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    await vi.waitFor(async () => {
      expect(await heard(editor, post.id)).toEqual([
        ['review_requested', 'cm-contrib sent a post for review'],
      ]);
    });
    expect(await heard(owner, post.id)).toEqual([
      ['review_requested', 'cm-contrib sent a post for review'],
    ]);
    // Not the one who sent it, a viewer (can't approve) or an editor who can't see it.
    expect(await heard(contributor, post.id)).toEqual([]);
    expect(await heard(viewer, post.id)).toEqual([]);
    expect(await heard(limited, post.id)).toEqual([]);

    await editor.post(`${base()}/posts/${post.id}/request-changes`, { note: 'Shorter' });
    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    await editor.post(`${base()}/posts/${post.id}/approve`, {});
    await vi.waitFor(async () => {
      expect(await heard(contributor, post.id)).toEqual([
        ['changes_requested', 'cm-editor asked for changes to your post'],
        ['post_approved', 'cm-editor approved your post'],
      ]);
    });
  });

  it('a comment notifies the author and earlier commenters; a mention instead of that', async () => {
    const post = await draft(contributor);
    await comment(viewer, post.id, 'First');
    await comment(editor, post.id, 'Hi @cm-owner', { mentionIds: [owner.userId] });
    await vi.waitFor(async () => {
      expect(await heard(owner, post.id)).toEqual([
        ['mentioned', 'cm-editor mentioned you in a comment'],
      ]);
    });
    expect(await heard(contributor, post.id)).toEqual([
      ['post_commented', 'cm-viewer commented on your post'],
      ['post_commented', 'cm-editor commented on your post'],
    ]);
    expect(await heard(viewer, post.id)).toEqual([
      ['post_commented', 'cm-editor commented on a post you commented on'],
    ]);
    // Never yourself, nor someone who can't see the post.
    expect(await heard(editor, post.id)).toEqual([]);
    expect(await heard(limited, post.id)).toEqual([]);

    // A new comment notifies earlier commenters; editing it to mention someone notifies only
    // the newly mentioned.
    const before = (await heard(viewer, post.id)).length;
    const mine = await comment(owner, post.id, 'Noted');
    await owner.send('PATCH', `${base()}/comments/${mine.id}`, {
      body: 'Noted @cm-viewer',
      mentionIds: [viewer.userId],
    });
    await owner.send('PATCH', `${base()}/comments/${mine.id}`, {
      body: 'Noted, @cm-viewer',
      mentionIds: [viewer.userId],
    });
    await vi.waitFor(async () => {
      expect((await heard(viewer, post.id)).slice(before)).toEqual([
        ['post_commented', 'cm-owner commented on a post you commented on'],
        ['mentioned', 'cm-owner mentioned you in a comment'],
      ]);
    });
  });
});
