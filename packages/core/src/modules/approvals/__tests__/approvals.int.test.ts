// Approvals (P4-B2) against Postgres: contributors send drafts for review; approvers approve
// (optionally scheduling at once) or send them back; a post that needs review can't go out
// until approved; and editing an approved post without approve rights sends it back.
import { ErrorEnvelope, type Post, type ReviewItem, type ReviewStep } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let editor: Browser;
let contributor: Browser;
let ws = '';
let account = '';
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

async function join(who: Browser, name: string, role: 'editor' | 'contributor') {
  const inv = await owner.post(`${base()}/invitations`, { email: t.email(name), role });
  await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
}

async function draft(who: Browser, text = 'Fresh roast') {
  const res = await who.post(`${base()}/posts`, { text, targets: [{ accountId: account }] });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body as Post;
}

const status = async (postId: string) =>
  ((await owner.get(`${base()}/posts/${postId}`)).body as Post).status;

const reviewOf = async (who: Browser, postId: string) =>
  ((await who.get(`${base()}/posts/${postId}/review`)).body as { items: ReviewStep[] }).items;

beforeAll(async () => {
  owner = await t.signUp('ap-owner');
  editor = await t.signUp('ap-editor');
  contributor = await t.signUp('ap-contrib');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('AP'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-ap-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  account = (
    await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network: 'facebook_page',
        externalId: '601',
        displayName: 'Halden Coffee',
        status: 'active',
        assetTokenEnc: t.platform.crypto.encrypt('page-token-601'),
      },
    })
  ).id;
  await join(editor, 'ap-editor', 'editor');
  await join(contributor, 'ap-contrib', 'contributor');
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

describe('approvals', () => {
  it('a contributor submits; an editor approves and schedules in one go', async () => {
    const post = await draft(contributor);
    // Editors can't schedule a contributor's post before it is approved.
    const early = await editor.post(`${base()}/posts/${post.id}/schedule`, { at: inHours(3) });
    expect([early.status, code(early)]).toEqual([422, 'REVIEW_REQUIRED']);

    const sent = await contributor.post(`${base()}/posts/${post.id}/submit`, {
      note: 'Launch copy',
    });
    expect(sent.status, JSON.stringify(sent.body)).toBe(200);
    expect((sent.body as Post).status).toBe('in_review');
    const again = await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    expect([again.status, code(again)]).toEqual([409, 'POST_IN_REVIEW']);
    // Only approvers see the queue.
    expect((await contributor.get(`${base()}/reviews`)).status).toBe(403);
    const queue = (await editor.get(`${base()}/reviews`)).body as { items: ReviewItem[] };
    expect(queue.items.map((i) => i.post.id)).toContain(post.id);

    const at = inHours(3);
    const ok = await editor.post(`${base()}/posts/${post.id}/approve`, {
      note: 'Lovely',
      schedule: { at },
    });
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    expect((ok.body as Post).status).toBe('scheduled');
    expect((ok.body as Post).targets[0]?.scheduledAt).toBe(at);

    const steps = await reviewOf(contributor, post.id);
    expect(steps.map((s) => [s.action, s.note])).toEqual([
      ['submitted', 'Launch copy'],
      ['approved', 'Lovely'],
    ]);
    const decided = (await editor.get(`${base()}/reviews?status=decided`)).body as {
      items: ReviewItem[];
    };
    expect(decided.items[0]).toMatchObject({
      post: { id: post.id },
      latest: { action: 'approved' },
    });
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'post.approved', entityId: post.id },
    });
    expect(audit).not.toBeNull();
  });

  it('unscheduling an approved post keeps it approved', async () => {
    const post = await draft(contributor);
    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    await editor.post(`${base()}/posts/${post.id}/approve`, { schedule: { at: inHours(4) } });
    const res = await editor.post(`${base()}/posts/${post.id}/unschedule`);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(await status(post.id)).toBe('approved');
    // Still approved: it can be scheduled again without another review.
    const again = await editor.post(`${base()}/posts/${post.id}/schedule`, { at: inHours(5) });
    expect(again.status, JSON.stringify(again.body)).toBe(200);
  });

  it('changes requested send it back as a draft with the note; withdrawing too', async () => {
    const post = await draft(contributor);
    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    const noNote = await editor.post(`${base()}/posts/${post.id}/request-changes`, { note: ' ' });
    expect(noNote.status).toBe(400);
    const back = await editor.post(`${base()}/posts/${post.id}/request-changes`, {
      note: 'Shorter, please',
    });
    expect((back.body as Post).status).toBe('draft');
    const approveLate = await editor.post(`${base()}/posts/${post.id}/approve`, {});
    expect([approveLate.status, code(approveLate)]).toEqual([409, 'POST_NOT_IN_REVIEW']);

    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    // Only the author withdraws.
    const notMine = await editor.post(`${base()}/posts/${post.id}/withdraw`);
    expect([notMine.status, code(notMine)]).toEqual([403, 'NOT_POST_AUTHOR']);
    const out = await contributor.post(`${base()}/posts/${post.id}/withdraw`);
    expect((out.body as Post).status).toBe('draft');
    expect((await reviewOf(owner, post.id)).map((s) => s.action)).toEqual([
      'submitted',
      'changes_requested',
      'submitted',
      'withdrawn',
    ]);
  });

  it('editing an approved post without approve rights sends it back and unschedules it', async () => {
    const post = await draft(contributor, 'Before');
    await contributor.post(`${base()}/posts/${post.id}/submit`, {});
    await editor.post(`${base()}/posts/${post.id}/approve`, { schedule: { at: inHours(6) } });

    const edited = await contributor.send('PATCH', `${base()}/posts/${post.id}`, {
      text: 'After',
    });
    expect(edited.status, JSON.stringify(edited.body)).toBe(200);
    const after = edited.body as Post;
    expect(after.status).toBe('in_review');
    expect(after.targets[0]).toMatchObject({ status: 'pending', scheduledAt: null });
    expect((await reviewOf(owner, post.id)).at(-1)?.action).toBe('submitted');

    // An approver's edit keeps the approval.
    await editor.post(`${base()}/posts/${post.id}/approve`, {});
    const tweak = await editor.send('PATCH', `${base()}/posts/${post.id}`, { text: 'After!' });
    expect((tweak.body as Post).status).toBe('approved');
  });

  it('only a draft with accounts and no errors can be submitted, by its author', async () => {
    const empty = (await contributor.post(`${base()}/posts`, { text: 'No accounts yet' }))
      .body as Post;
    const none = await contributor.post(`${base()}/posts/${empty.id}/submit`, {});
    expect([none.status, code(none)]).toEqual([422, 'NO_ACCOUNTS']);

    const theirs = await draft(contributor);
    const notAuthor = await editor.post(`${base()}/posts/${theirs.id}/submit`, {});
    expect([notAuthor.status, code(notAuthor)]).toEqual([403, 'NOT_POST_AUTHOR']);
  });

  it("with review for every post, editors' own posts need someone else's approval", async () => {
    await t.db.client.workspace.update({ where: { id: ws }, data: { requireReviewForAll: true } });
    try {
      const post = await draft(editor);
      const now = await editor.post(`${base()}/posts/${post.id}/publish-now`);
      expect([now.status, code(now)]).toEqual([422, 'REVIEW_REQUIRED']);
      await editor.post(`${base()}/posts/${post.id}/submit`, {});
      const own = await editor.post(`${base()}/posts/${post.id}/approve`, {});
      expect([own.status, code(own)]).toEqual([403, 'CANNOT_APPROVE_OWN']);
      const ok = await owner.post(`${base()}/posts/${post.id}/approve`, {});
      expect((ok.body as Post).status).toBe('approved');
      const later = await editor.post(`${base()}/posts/${post.id}/schedule`, { at: inHours(7) });
      expect(later.status, JSON.stringify(later.body)).toBe(200);
    } finally {
      await t.db.client.workspace.update({
        where: { id: ws },
        data: { requireReviewForAll: false },
      });
    }
  });

  it('lists the queue longest-waiting first, and pages through it', async () => {
    const first = await draft(contributor, 'First');
    const second = await draft(contributor, 'Second');
    await contributor.post(`${base()}/posts/${first.id}/submit`, {});
    await contributor.post(`${base()}/posts/${second.id}/submit`, {});
    const page1 = (await owner.get(`${base()}/reviews?limit=1`)).body as {
      items: ReviewItem[];
      nextCursor: string | null;
    };
    const all: string[] = page1.items.map((i) => i.post.id);
    let cursor = page1.nextCursor;
    while (cursor) {
      const next = (await owner.get(`${base()}/reviews?limit=1&cursor=${cursor}`)).body as {
        items: ReviewItem[];
        nextCursor: string | null;
      };
      all.push(...next.items.map((i) => i.post.id));
      cursor = next.nextCursor;
    }
    expect(all.indexOf(first.id)).toBeLessThan(all.indexOf(second.id));
    expect(new Set(all).size).toBe(all.length);
    expect(page1.items[0]?.submittedBy?.name).toBe('ap-contrib');
  });
});
