// Posts over HTTP against Postgres: drafts, targets and overrides, validation through the real
// Meta network adapters, editing rules, lists and history.
import {
  ErrorEnvelope,
  page,
  Post,
  PostDetails,
  ValidatePostResponse,
} from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let editor: Browser;
let contributor: Browser;
let viewer: Browser;
let ws = '';
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const acc = { fb: '', ig: '', gone: '', stale: '' };
const media = { square: '', tall: '', processing: '', deleted: '' };

beforeAll(async () => {
  owner = await t.signUp('po-owner');
  editor = await t.signUp('po-editor');
  contributor = await t.signUp('po-contrib');
  viewer = await t.signUp('po-viewer');
  const created = await owner.post('/api/v1/workspaces', {
    name: t.workspaceName('Posts'),
    timezone: 'UTC',
  });
  ws = (created.body as { id: string }).id;
  for (const [who, role, label] of [
    [editor, 'editor', 'po-editor'],
    [contributor, 'contributor', 'po-contrib'],
    [viewer, 'viewer', 'po-viewer'],
  ] as const) {
    const inv = await owner.post(`${base()}/invitations`, { email: t.email(label), role });
    await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  }

  const db = t.db.client;
  const login = await db.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: 'fb-po',
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('token'),
    },
  });
  const account = (network: 'facebook_page' | 'instagram', name: string, status = 'active') =>
    db.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network,
        externalId: `${name}-${ws}`,
        displayName: name,
        status: status as 'active',
      },
    });
  acc.fb = (await account('facebook_page', 'Halden Coffee')).id;
  acc.ig = (await account('instagram', 'halden.coffee')).id;
  acc.gone = (await account('facebook_page', 'Old Page', 'disconnected')).id;
  acc.stale = (await account('facebook_page', 'Stale Page', 'reauth_required')).id;

  const asset = (name: string, extra: object) =>
    db.mediaAsset.create({
      data: {
        workspaceId: ws,
        name,
        kind: 'image',
        mime: 'image/jpeg',
        storageKey: `test/${ws}/${name}`,
        sizeBytes: 200_000,
        width: 1080,
        height: 1080,
        status: 'ready',
        ...extra,
      },
    });
  media.square = (await asset('square.jpg', {})).id;
  media.tall = (await asset('tall.jpg', { height: 1920 })).id;
  media.processing = (await asset('busy.jpg', { status: 'processing' })).id;
  media.deleted = (await asset('gone.jpg', { deletedAt: new Date() })).id;
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

async function createPost(who: Browser, body: object) {
  const res = await who.post(`${base()}/posts`, body);
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Post.parse(res.body);
}

describe('creating drafts', () => {
  it('starts empty, as a draft by the caller', async () => {
    const post = await createPost(contributor, {});
    expect(post).toMatchObject({ status: 'draft', text: '', mediaIds: [], targets: [] });
    expect(post.author?.name).toBe('po-contrib');
  });

  it('viewers can read but not create', async () => {
    expect((await viewer.post(`${base()}/posts`, {})).status).toBe(403);
    expect((await viewer.get(`${base()}/posts`)).status).toBe(200);
  });

  it('saves targets with their overrides and shows each account', async () => {
    const post = await createPost(owner, {
      text: 'Fresh roast today',
      mediaIds: [media.square],
      firstComment: '#coffee',
      targets: [
        { accountId: acc.fb },
        {
          accountId: acc.ig,
          override: { text: 'Fresh roast ☕', options: { instagram: { format: 'feed' } } },
        },
      ],
    });
    expect(post.targets.map((x) => [x.account.displayName, x.status, x.override?.text])).toEqual([
      ['Halden Coffee', 'pending', undefined],
      ['halden.coffee', 'pending', 'Fresh roast ☕'],
    ]);
  });

  it('refuses references it can’t use', async () => {
    const cases: [object, number, string][] = [
      [{ targets: [{ accountId: acc.gone }] }, 422, 'ACCOUNT_NOT_AVAILABLE'],
      [
        { targets: [{ accountId: '01890a5d-ac96-774b-bcce-b302099a8057' }] },
        404,
        'ACCOUNT_NOT_FOUND',
      ],
      [{ mediaIds: [media.deleted] }, 404, 'MEDIA_NOT_FOUND'],
      [
        {
          targets: [
            { accountId: acc.fb, override: { options: { instagram: { format: 'reel' } } } },
          ],
        },
        422,
        'OPTIONS_NOT_FOR_NETWORK',
      ],
    ];
    for (const [body, status, expected] of cases) {
      const res = await owner.post(`${base()}/posts`, body);
      expect([res.status, code(res)], JSON.stringify(body)).toEqual([status, expected]);
    }
  });
});

describe('validation', () => {
  const validate = async (body: object) => {
    const res = await editor.post(`${base()}/posts/validate`, {
      text: '',
      mediaIds: [],
      link: null,
      firstComment: null,
      targets: [],
      ...body,
    });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    return ValidatePostResponse.parse(res.body);
  };
  const codes = (r: ValidatePostResponse, accountId: string) =>
    r.targets.find((x) => x.accountId === accountId)?.issues.map((i) => i.code);

  it('needs at least one account', async () => {
    expect((await validate({ text: 'Hi' })).issues.map((i) => i.code)).toEqual(['NO_ACCOUNTS']);
  });

  it('checks each network’s own rules on the content it will get', async () => {
    const r = await validate({
      text: 'x'.repeat(2201),
      targets: [{ accountId: acc.fb }, { accountId: acc.ig }],
    });
    expect(r.targets.map((x) => x.network)).toEqual(['facebook_page', 'instagram']);
    expect(codes(r, acc.fb)).toEqual([]);
    expect(codes(r, acc.ig)).toEqual(['TEXT_TOO_LONG', 'MEDIA_REQUIRED']);

    // A shorter Instagram override and a photo fix it for Instagram only.
    const fixed = await validate({
      text: 'x'.repeat(2201),
      mediaIds: [media.square],
      targets: [{ accountId: acc.fb }, { accountId: acc.ig, override: { text: 'Short' } }],
    });
    expect(codes(fixed, acc.ig)).toEqual([]);
  });

  it('checks media: shape per network, still processing, deleted', async () => {
    const r = await validate({
      text: 'Hi',
      mediaIds: [media.tall, media.processing, media.deleted],
      targets: [{ accountId: acc.fb }, { accountId: acc.ig }],
    });
    expect(codes(r, acc.fb)).toEqual(['MEDIA_NOT_READY', 'MEDIA_NOT_FOUND']);
    // 1080×1920 is taller than Instagram's 4:5 feed limit.
    expect(codes(r, acc.ig)).toEqual(['MEDIA_NOT_READY', 'MEDIA_NOT_FOUND', 'ASPECT_RATIO']);
    const issue = r.targets[1]?.issues.find((i) => i.code === 'ASPECT_RATIO');
    expect(issue).toMatchObject({ severity: 'error', field: 'media', mediaId: media.tall });
  });

  it('flags accounts that can’t post, and warnings don’t count as errors', async () => {
    const r = await validate({
      text: 'Hi',
      link: 'https://halden.test',
      mediaIds: [media.square],
      targets: [{ accountId: acc.stale }, { accountId: acc.gone }, { accountId: acc.ig }],
    });
    expect(codes(r, acc.stale)).toContain('ACCOUNT_NEEDS_RECONNECT');
    expect(codes(r, acc.gone)).toContain('ACCOUNT_NOT_AVAILABLE');
    expect(r.targets[2]?.issues).toEqual([
      expect.objectContaining({ code: 'LINK_NOT_CLICKABLE', severity: 'warning' }),
    ]);
  });
});

describe('editing and deleting', () => {
  it('authors edit their own posts; approvers can edit anyone’s', async () => {
    const mine = await createPost(contributor, { text: 'mine' });
    const theirs = await createPost(editor, { text: 'theirs' });
    expect(
      (await contributor.send('PATCH', `${base()}/posts/${mine.id}`, { text: 'mine, edited' }))
        .status,
    ).toBe(200);
    const denied = await contributor.send('PATCH', `${base()}/posts/${theirs.id}`, { text: 'x' });
    expect([denied.status, code(denied)]).toEqual([403, 'NOT_POST_AUTHOR']);
    expect(
      (await editor.send('PATCH', `${base()}/posts/${mine.id}`, { text: 'approved edit' })).status,
    ).toBe(200);
    expect((await contributor.send('DELETE', `${base()}/posts/${theirs.id}`)).status).toBe(403);
  });

  it('replacing the accounts keeps the ones that stay and their history', async () => {
    const post = await createPost(owner, {
      text: 'Hi',
      targets: [{ accountId: acc.fb }, { accountId: acc.ig, override: { text: 'IG' } }],
    });
    const fbTarget = post.targets[0]?.id;
    const res = await owner.send('PATCH', `${base()}/posts/${post.id}`, {
      targets: [{ accountId: acc.fb, override: { text: 'FB only' } }, { accountId: acc.stale }],
    });
    expect(res.status).toBe(200);
    const updated = Post.parse(res.body);
    expect(updated.targets.map((x) => [x.account.id, x.override?.text])).toEqual([
      [acc.fb, 'FB only'],
      [acc.stale, undefined],
    ]);
    expect(updated.targets[0]?.id).toBe(fbTarget);
    // Clearing an override.
    const cleared = await owner.send('PATCH', `${base()}/posts/${post.id}`, {
      targets: [{ accountId: acc.fb, override: null }],
    });
    expect(Post.parse(cleared.body).targets[0]?.override).toBeNull();
  });

  it('a post that is being or was published can’t be changed or deleted', async () => {
    const post = await createPost(owner, { text: 'Hi', targets: [{ accountId: acc.fb }] });
    await t.db.client.postTarget.updateMany({
      where: { postId: post.id },
      data: { status: 'published', externalPostId: '101_1', publishedAt: new Date() },
    });
    const edit = await owner.send('PATCH', `${base()}/posts/${post.id}`, { text: 'changed' });
    expect([edit.status, code(edit)]).toEqual([422, 'POST_NOT_EDITABLE']);
    const del = await owner.send('DELETE', `${base()}/posts/${post.id}`);
    expect([del.status, code(del)]).toEqual([422, 'POST_NOT_DELETABLE']);
  });

  it('an edit that races a starting publish waits for it, then refuses', async () => {
    const post = await createPost(owner, { text: 'race', targets: [{ accountId: acc.fb }] });
    let release: () => void = () => undefined;
    const held = new Promise<void>((r) => (release = r));
    let locked: () => void = () => undefined;
    const lockTaken = new Promise<void>((r) => (locked = r));
    // Plays publish-now (P1-B7): takes the post lock, marks the target publishing, commits later.
    const publish = t.db.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${post.id}::uuid FOR UPDATE`;
      await tx.postTarget.updateMany({
        where: { postId: post.id },
        data: { status: 'publishing' },
      });
      locked();
      await held;
    });
    await lockTaken;
    // Sent now (supertest only sends on then): its early check still sees "pending", so the
    // edit must wait for the lock and check again.
    const edit = owner
      .send('PATCH', `${base()}/posts/${post.id}`, { text: 'changed mid-publish' })
      .then((r) => r);
    await new Promise((r) => setTimeout(r, 300));
    release();
    await publish;
    const res = await edit;
    expect([res.status, code(res)]).toEqual([422, 'POST_NOT_EDITABLE']);
    const row = await t.db.client.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(row.text).toBe('race');
  });

  it('deletes drafts, with an audit entry', async () => {
    const post = await createPost(owner, { text: 'bye' });
    expect((await owner.send('DELETE', `${base()}/posts/${post.id}`)).status).toBe(204);
    expect((await owner.get(`${base()}/posts/${post.id}`)).status).toBe(404);
    const audit = await t.db.client.auditLog.findMany({
      where: { workspaceId: ws, entityId: post.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(audit.map((a) => a.action)).toEqual(['post.created', 'post.deleted']);
  });

  it('duplicates as a new draft, without disconnected accounts or deleted files', async () => {
    const post = await createPost(owner, {
      text: 'Copy me',
      mediaIds: [media.square],
      targets: [{ accountId: acc.fb }, { accountId: acc.ig }],
    });
    await t.db.client.socialAccount.update({
      where: { id: acc.ig },
      data: { status: 'disconnected' },
    });
    await t.db.client.mediaAsset.update({
      where: { id: media.square },
      data: { deletedAt: new Date() },
    });
    try {
      const res = await contributor.post(`${base()}/posts/${post.id}/duplicate`);
      expect(res.status).toBe(201);
      const copy = Post.parse(res.body);
      expect(copy).toMatchObject({ status: 'draft', text: 'Copy me', mediaIds: [] });
      expect(copy.id).not.toBe(post.id);
      expect(copy.author?.name).toBe('po-contrib');
      expect(copy.targets.map((x) => x.account.id)).toEqual([acc.fb]);
    } finally {
      await t.db.client.socialAccount.update({ where: { id: acc.ig }, data: { status: 'active' } });
      await t.db.client.mediaAsset.update({
        where: { id: media.square },
        data: { deletedAt: null },
      });
    }
  });
});

describe('reading', () => {
  it('lists newest first with filters and cursor paging', async () => {
    const a = await createPost(editor, { text: 'list-a', targets: [{ accountId: acc.ig }] });
    const b = await createPost(editor, { text: 'list-b' });
    const byAccount = await editor.get(`${base()}/posts?accountId=${acc.ig}`);
    const items = page(Post).parse(byAccount.body).items;
    expect(items.map((p) => p.id)).toContain(a.id);
    expect(items.map((p) => p.id)).not.toContain(b.id);

    const first = page(Post).parse((await editor.get(`${base()}/posts?limit=1`)).body);
    expect(first.items[0]?.id).toBe(b.id);
    const second = page(Post).parse(
      (await editor.get(`${base()}/posts?limit=1&cursor=${first.nextCursor ?? ''}`)).body,
    );
    expect(second.items[0]?.id).toBe(a.id);

    const drafts = page(Post).parse(
      (await editor.get(`${base()}/posts?status=draft&status=failed`)).body,
    );
    expect(drafts.items.every((p) => p.status === 'draft' || p.status === 'failed')).toBe(true);
  });

  it('shows each target’s publishing history, newest attempt first', async () => {
    const post = await createPost(owner, { text: 'Hi', targets: [{ accountId: acc.fb }] });
    const targetId = post.targets[0]?.id ?? '';
    await t.db.client.publishAttempt.createMany({
      data: [
        {
          workspaceId: ws,
          postTargetId: targetId,
          attemptNo: 1,
          outcome: 'will_retry',
          errorKind: 'retryable',
          networkCode: '2',
          message: 'Meta had a hiccup',
          finishedAt: new Date(),
        },
        {
          workspaceId: ws,
          postTargetId: targetId,
          attemptNo: 2,
          outcome: 'published',
          finishedAt: new Date(),
        },
      ],
    });
    const details = PostDetails.parse((await viewer.get(`${base()}/posts/${post.id}`)).body);
    expect(
      details.targets[0]?.history.map((h) => [h.attemptNo, h.outcome, h.error?.message]),
    ).toEqual([
      [2, 'published', undefined],
      [1, 'will_retry', 'Meta had a hiccup'],
    ]);
  });
});

describe('media in use', () => {
  it('a file a scheduled or publishing post uses can’t be deleted; a draft doesn’t block', async () => {
    const shared = await t.db.client.mediaAsset.create({
      data: {
        workspaceId: ws,
        name: 'in-use.jpg',
        kind: 'image',
        mime: 'image/jpeg',
        storageKey: `test/${ws}/in-use`,
        sizeBytes: 1000,
        status: 'ready',
      },
    });
    const viaOverride = await t.db.client.mediaAsset.create({
      data: {
        workspaceId: ws,
        name: 'override.jpg',
        kind: 'image',
        mime: 'image/jpeg',
        storageKey: `test/${ws}/override`,
        sizeBytes: 1000,
        status: 'ready',
      },
    });
    const post = await createPost(owner, {
      text: 'Uses files',
      mediaIds: [shared.id],
      targets: [{ accountId: acc.ig, override: { mediaIds: [viaOverride.id] } }],
    });
    const del = (id: string) => owner.send('DELETE', `${base()}/media/${id}`);
    // While a post is only a draft, its files can be deleted (its validation flags them later).
    const draftOnly = await t.db.client.mediaAsset.create({
      data: {
        workspaceId: ws,
        name: 'draft-only.jpg',
        kind: 'image',
        mime: 'image/jpeg',
        storageKey: `test/${ws}/draft-only`,
        sizeBytes: 1000,
        status: 'ready',
      },
    });
    await createPost(owner, {
      text: 'draft',
      mediaIds: [draftOnly.id],
      targets: [{ accountId: acc.fb }],
    });
    expect((await del(draftOnly.id)).status).toBe(204);
    await t.db.client.postTarget.updateMany({
      where: { postId: post.id },
      data: { status: 'scheduled' },
    });
    for (const id of [shared.id, viaOverride.id]) {
      const res = await del(id);
      expect([res.status, code(res)]).toEqual([409, 'MEDIA_IN_USE']);
    }
    await t.db.client.postTarget.updateMany({
      where: { postId: post.id },
      data: { status: 'published' },
    });
    expect((await del(shared.id)).status).toBe(204);
  });
});

describe('status follows the targets', () => {
  it('disconnecting an account cancels its waiting target and updates the post', async () => {
    const post = await createPost(owner, {
      text: 'Hi',
      targets: [{ accountId: acc.fb }, { accountId: acc.stale }],
    });
    const [fb, stale] = post.targets;
    await t.db.client.postTarget.update({
      where: { id: fb?.id ?? '' },
      data: { status: 'published', externalPostId: '101_9', publishedAt: new Date() },
    });
    await t.db.client.postTarget.update({
      where: { id: stale?.id ?? '' },
      data: { status: 'pending' },
    });
    await t.db.client.post.update({ where: { id: post.id }, data: { status: 'publishing' } });

    expect((await owner.send('DELETE', `${base()}/accounts/${acc.stale}`)).status).toBe(204);
    const after = Post.parse((await owner.get(`${base()}/posts/${post.id}`)).body);
    expect(after.targets.map((x) => x.status)).toEqual(['published', 'cancelled']);
    expect(after.status).toBe('published');
  });
});
