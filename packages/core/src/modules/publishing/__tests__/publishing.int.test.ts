// Publishing end to end against Postgres and Valkey: publish-now queues a job per target, a real
// BullMQ worker runs it against a played network, and every outcome is recorded. Failure paths
// call the job function directly to walk through retries without waiting for backoff.
import { ErrorEnvelope, Post, PostDetails, ValidatePostResponse } from '@socioboard/contracts';
import { ProviderError } from '@socioboard/providers';
import sharp from 'sharp';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { mediaKeys } from '../../media';
import { newId } from '../../../platform';
import {
  prepareMedia,
  publishBackoff,
  publishJobId,
  publishTarget,
  type PublishDeps,
} from '../index';

const t = createTestApp();
const played = t.networks;
const services = createPublishingServices(t.platform, { registry: played.registry });
const deps: PublishDeps = {
  ...t.platform,
  registry: played.registry,
  mediaUrls: services.mediaUrls,
  getCredentials: services.socialAccounts.getCredentials,
  markReauthRequired: services.socialAccounts.markReauthRequired,
  recomputeStatus: services.posts.recomputeStatus,
};
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let editor: Browser;
let contributor: Browser;
let ws = '';
let connectionId = '';
const acc = { fb: '', ig: '' };
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

beforeAll(async () => {
  owner = await t.signUp('pub-owner');
  editor = await t.signUp('pub-editor');
  contributor = await t.signUp('pub-contrib');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Pub'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  for (const [who, role, label] of [
    [editor, 'editor', 'pub-editor'],
    [contributor, 'contributor', 'pub-contrib'],
  ] as const) {
    const inv = await owner.post(`${base()}/invitations`, { email: t.email(label), role });
    await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  }
  const crypto = t.platform.crypto;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-pub-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: crypto.encrypt('user-token'),
    },
  });
  connectionId = login.id;
  const account = (network: 'facebook_page' | 'instagram', externalId: string) =>
    t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId,
        network,
        externalId,
        displayName: network,
        assetTokenEnc: crypto.encrypt(`page-token-${externalId}`),
        meta: network === 'instagram' ? { via: 'facebook', pageId: '101' } : {},
      },
    });
  acc.fb = (await account('facebook_page', '101')).id;
  acc.ig = (await account('instagram', 'ig-1')).id;
  // The real worker, on this test run's own queue prefix.
  t.platform.queues.startWorker(services.publishQueue);
});

beforeEach(async () => {
  played.published.length = 0;
  played.publishAnswers.length = 0;
  await t.db.client.socialAccount.updateMany({
    where: { workspaceId: ws },
    data: { status: 'active', statusReason: null },
  });
  await t.db.client.socialConnection.update({
    where: { id: connectionId },
    data: { status: 'active' },
  });
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

async function draft(body: object, who: Browser = owner) {
  const res = await who.post(`${base()}/posts`, body);
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Post.parse(res.body);
}

/** Waits for the worker: until every target, and so the post, has a final status. */
async function settled(postId: string) {
  for (let i = 0; i < 100; i++) {
    const details = PostDetails.parse((await owner.get(`${base()}/posts/${postId}`)).body);
    // Targets first, then the post's status (the worker recomputes it right after).
    const targetsDone = details.targets.every((x) => !['pending', 'publishing'].includes(x.status));
    if (targetsDone && details.status !== 'publishing') return details;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('publishing did not finish');
}

describe('publish now', () => {
  it('publishes each target through the worker and records the outcome', async () => {
    const post = await draft({
      text: 'Fresh roast today',
      link: 'https://halden.test',
      firstComment: '#coffee',
      targets: [{ accountId: acc.fb }],
    });
    const res = await owner.post(`${base()}/posts/${post.id}/publish-now`);
    expect(res.status).toBe(202);
    expect(Post.parse(res.body).status).toBe('publishing');

    const done = await settled(post.id);
    expect(done.status).toBe('published');
    const [target] = done.targets;
    expect(target).toMatchObject({
      status: 'published',
      externalPostId: 'facebook_page-post-1',
      permalink: 'https://social.example.test/facebook_page-post-1',
      attempts: 1,
      lastError: null,
    });
    expect(target?.history.map((h) => h.outcome)).toEqual(['published']);
    // The network got the merged content and the Page's own token.
    expect(played.published[0]).toMatchObject({
      network: 'facebook_page',
      input: { text: 'Fresh roast today', link: 'https://halden.test', firstComment: '#coffee' },
      account: { externalId: '101', accessToken: 'page-token-101' },
    });
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'post.publish_requested', entityId: post.id },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('never posts twice: same Idempotency-Key, or a second click', async () => {
    const post = await draft({ text: 'Once', targets: [{ accountId: acc.fb }] });
    const url = `${base()}/posts/${post.id}/publish-now`;
    const first = await owner.post(url).set('Idempotency-Key', 'k-123');
    const replay = await owner.post(url).set('Idempotency-Key', 'k-123');
    expect([first.status, replay.status]).toEqual([202, 202]);
    await settled(post.id);
    const again = await owner.post(url);
    expect([again.status, code(again)]).toEqual([409, 'POST_ALREADY_SENT']);
    expect(played.published).toHaveLength(1);
  });

  it('refuses a post with errors and says what they are', async () => {
    // Instagram needs a photo or video.
    const post = await draft({
      text: 'No photo',
      targets: [{ accountId: acc.fb }, { accountId: acc.ig }],
    });
    const res = await owner.post(`${base()}/posts/${post.id}/publish-now`);
    expect([res.status, code(res)]).toEqual([422, 'POST_HAS_ERRORS']);
    const report = ValidatePostResponse.parse(
      (res.body as { error: { details: unknown } }).error.details,
    );
    expect(report.targets.find((x) => x.accountId === acc.ig)?.issues.map((i) => i.code)).toEqual([
      'MEDIA_REQUIRED',
    ]);
    // Nothing was sent to any network.
    expect(played.published).toHaveLength(0);
  });

  it('needs posts:publish, and respects workspaces that review everything', async () => {
    const post = await draft({ text: 'Mine', targets: [{ accountId: acc.fb }] }, contributor);
    expect((await contributor.post(`${base()}/posts/${post.id}/publish-now`)).status).toBe(403);
    await t.db.client.workspace.update({ where: { id: ws }, data: { requireReviewForAll: true } });
    try {
      const res = await editor.post(`${base()}/posts/${post.id}/publish-now`);
      expect([res.status, code(res)]).toEqual([422, 'REVIEW_REQUIRED']);
    } finally {
      await t.db.client.workspace.update({
        where: { id: ws },
        data: { requireReviewForAll: false },
      });
    }
  });
});

describe('the publish job', () => {
  /** A post with one target that publish-now has queued (without running the worker). */
  async function queued(accountId = acc.fb) {
    const post = await draft({ text: 'Job', targets: [{ accountId }] });
    const [target] = post.targets;
    if (!target) throw new Error('no target');
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { status: 'publishing' },
    });
    return { postId: post.id, targetId: target.id };
  }
  const run = (targetId: string, isLast = false) =>
    publishTarget(deps, { workspaceId: ws, targetId }, { isLast });
  const target = (id: string) => t.db.client.postTarget.findUniqueOrThrow({ where: { id } });

  it('retries temporary failures, then gives up after the last try', async () => {
    const { postId, targetId } = await queued();
    played.publishAnswers.push(
      new ProviderError({ kind: 'retryable', message: 'Meta had a hiccup', networkCode: '2' }),
      new ProviderError({ kind: 'rate_limited', message: 'Slow down', retryAfterSec: 60 }),
    );
    await expect(run(targetId)).rejects.toMatchObject({ kind: 'retryable' });
    expect(await target(targetId)).toMatchObject({ status: 'publishing', attempts: 1 });
    await expect(run(targetId, true)).resolves.toBeUndefined();
    expect(await target(targetId)).toMatchObject({
      status: 'failed',
      attempts: 2,
      lastError: { kind: 'rate_limited', networkCode: null, message: 'Slow down' },
    });
    const details = PostDetails.parse((await owner.get(`${base()}/posts/${postId}`)).body);
    expect(details.status).toBe('failed');
    expect(details.targets[0]?.history.map((h) => [h.attemptNo, h.outcome, h.error?.kind])).toEqual(
      [
        [2, 'failed', 'rate_limited'],
        [1, 'will_retry', 'retryable'],
      ],
    );
  });

  it('content errors fail at once, even with tries left', async () => {
    const { targetId } = await queued();
    played.publishAnswers.push(
      new ProviderError({
        kind: 'content',
        message: 'This post goes against our Community Standards.',
      }),
    );
    await expect(run(targetId)).resolves.toBeUndefined();
    expect(await target(targetId)).toMatchObject({ status: 'failed', attempts: 1 });
  });

  it('an auth error fails the target and marks the login for reconnecting', async () => {
    const { targetId } = await queued();
    played.publishAnswers.push(new ProviderError({ kind: 'auth', message: 'Session expired' }));
    await run(targetId);
    expect((await target(targetId)).status).toBe('failed');
    const accounts = await t.db.client.socialAccount.findMany({ where: { connectionId } });
    expect(new Set(accounts.map((a) => a.status))).toEqual(new Set(['reauth_required']));
    // The next post to that account fails without calling the network.
    const next = await queued();
    await run(next.targetId);
    expect(await target(next.targetId)).toMatchObject({
      status: 'failed',
      lastError: { kind: 'auth', message: 'Session expired' },
    });
    expect(played.published).toHaveLength(1);
  });

  it('is idempotent: a published target is never sent again, and two runs post once', async () => {
    const { targetId } = await queued();
    await Promise.all([run(targetId), run(targetId)]);
    await run(targetId);
    expect(played.published).toHaveLength(1);
    expect((await target(targetId)).status).toBe('published');
  });

  it('a success after a failed try clears the old error', async () => {
    const { targetId } = await queued();
    played.publishAnswers.push(new ProviderError({ kind: 'retryable', message: 'Blip' }));
    await expect(run(targetId)).rejects.toThrow();
    await run(targetId);
    expect(await target(targetId)).toMatchObject({ status: 'published', lastError: null });
  });

  it('waits what the network asks, else backs off 30 s, 1 min, 2 min…', () => {
    expect(
      publishBackoff(
        1,
        new ProviderError({ kind: 'rate_limited', message: 'x', retryAfterSec: 90 }),
      ),
    ).toBe(90_000);
    expect([1, 2, 3, 4].map((n) => publishBackoff(n))).toEqual([30_000, 60_000, 120_000, 240_000]);
    expect(publishJobId('t1', 0)).toBe('publish-t1-0');
  });

  it.runIf(t.platform.storage)(
    'gives Instagram JPEG copies of other images, made once',
    async () => {
      const storage = t.platform.storage;
      if (!storage) return;
      const id = newId();
      const key = mediaKeys(ws, id, 'image/png').original;
      const png = await sharp({
        create: { width: 1080, height: 1080, channels: 4, background: '#f80' },
      })
        .png()
        .toBuffer();
      await storage.put(key, png, 'image/png');
      await t.db.client.mediaAsset.create({
        data: {
          id,
          workspaceId: ws,
          name: 'square.png',
          kind: 'image',
          mime: 'image/png',
          storageKey: key,
          sizeBytes: png.length,
          width: 1080,
          height: 1080,
          status: 'ready',
        },
      });
      const post = await draft({
        text: 'Square',
        mediaIds: [id],
        targets: [{ accountId: acc.ig }],
      });
      await owner.post(`${base()}/posts/${post.id}/publish-now`);
      await settled(post.id);
      const media = played.published[0]?.input.media[0];
      expect(media).toMatchObject({ mime: 'image/jpeg' });
      const bytes = Buffer.from(await (await fetch(media?.readUrl ?? '')).arrayBuffer());
      expect((await sharp(bytes).metadata()).format).toBe('jpeg');
      // Made once: preparing again reuses the stored copy instead of converting again.
      const variantKey = new URL(media?.readUrl ?? '').pathname;
      const before = await storage.head(key.replace(/[^/]+$/, 'variants/jpeg.jpg'));
      const [again] = await prepareMedia(deps, ws, 'instagram', [id]);
      expect(new URL(again?.readUrl ?? '').pathname).toBe(variantKey);
      expect(await storage.head(key.replace(/[^/]+$/, 'variants/jpeg.jpg'))).toEqual(before);
    },
  );
});

describe('retry', () => {
  it('sends a failed target again as a new try', async () => {
    const post = await draft({ text: 'Again', targets: [{ accountId: acc.fb }] });
    played.publishAnswers.push(new ProviderError({ kind: 'content', message: 'Nope' }));
    await owner.post(`${base()}/posts/${post.id}/publish-now`);
    const failed = await settled(post.id);
    expect(failed.status).toBe('failed');
    const targetId = failed.targets[0]?.id ?? '';

    const res = await editor.post(`${base()}/posts/${post.id}/targets/${targetId}/retry`);
    expect(res.status).toBe(202);
    const done = await settled(post.id);
    expect(done.status).toBe('published');
    expect(done.targets[0]?.history.map((h) => h.outcome)).toEqual(['published', 'failed']);

    const notFailed = await editor.post(`${base()}/posts/${post.id}/targets/${targetId}/retry`);
    expect([notFailed.status, code(notFailed)]).toEqual([409, 'TARGET_NOT_FAILED']);
  });
});
