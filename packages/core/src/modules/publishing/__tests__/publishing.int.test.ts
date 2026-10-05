// Publishing end to end against Postgres and Valkey: publish-now queues a job per target, a real
// BullMQ worker runs it against a played network, and every outcome is recorded. Failure paths
// call the job function directly to walk through retries without waiting for backoff.
import { ErrorEnvelope, Post, PostDetails, ValidatePostResponse } from '@socioboard/contracts';
import { FACEBOOK_RATE_LIMITS, INSTAGRAM_IMAGE_PREP, ProviderError } from '@socioboard/providers';
import sharp from 'sharp';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { mediaKeys } from '../../media';
import { newId } from '../../../platform';
import {
  accountRateKey,
  appRateKey,
  prepareMedia,
  publishBackoff,
  PublishDeferred,
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
  // A rate limit a test hit (and the pause it set) stays with that test.
  for (const key of [accountRateKey(acc.fb), accountRateKey(acc.ig), appRateKey('facebook')]) {
    await t.platform.rateLimiter.resume(key);
  }
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

  it('two requests with the same key at the same moment publish once, and both succeed', async () => {
    const post = await draft({ text: 'Double submit', targets: [{ accountId: acc.fb }] });
    const url = `${base()}/posts/${post.id}/publish-now`;
    // Sent together (supertest sends on then).
    const [a, b] = await Promise.all([
      owner
        .post(url)
        .set('Idempotency-Key', 'same-moment')
        .then((r) => r),
      owner
        .post(url)
        .set('Idempotency-Key', 'same-moment')
        .then((r) => r),
    ]);
    expect([a.status, b.status]).toEqual([202, 202]);
    await settled(post.id);
    expect(played.published).toHaveLength(1);
  });

  it('a key whose request failed can be used again once the problem is fixed', async () => {
    const post = await draft({
      text: 'Fix me',
      targets: [{ accountId: acc.fb }, { accountId: acc.ig }],
    });
    const url = `${base()}/posts/${post.id}/publish-now`;
    const first = await owner.post(url).set('Idempotency-Key', 'fix-and-retry');
    expect(code(first)).toBe('POST_HAS_ERRORS');
    // Drop the Instagram account (it needed a photo), then retry with the same key.
    await owner.send('PATCH', `${base()}/posts/${post.id}`, { targets: [{ accountId: acc.fb }] });
    const again = await owner.post(url).set('Idempotency-Key', 'fix-and-retry');
    expect(again.status).toBe(202);
    expect((await settled(post.id)).status).toBe('published');
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
      const [again] = await prepareMedia(deps, ws, INSTAGRAM_IMAGE_PREP, [id]);
      expect(new URL(again?.readUrl ?? '').pathname).toBe(variantKey);
      expect(again?.sizeBytes).toBe(media?.sizeBytes);
    },
  );
});

describe('rate limits', () => {
  const run = (targetId: string) =>
    publishTarget(deps, { workspaceId: ws, targetId }, { isLast: false });
  async function queued(accountId: string) {
    const post = await draft({ text: 'Limited', targets: [{ accountId }] });
    const [target] = post.targets;
    if (!target) throw new Error('no target');
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { status: 'publishing' },
    });
    return target.id;
  }
  const target = (id: string) => t.db.client.postTarget.findUniqueOrThrow({ where: { id } });
  const deferredBy = async (p: Promise<void>) => {
    const err = await p.then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(PublishDeferred);
    return (err as PublishDeferred).until - Date.now();
  };

  it('a Page at its limit waits for room, without using a try or calling the network', async () => {
    // Its own Page, so the full window doesn't hold back other tests.
    const full = await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId,
        network: 'facebook_page',
        externalId: '199',
        displayName: 'Busy Page',
        assetTokenEnc: t.platform.crypto.encrypt('page-token-199'),
      },
    });
    const [hourly] = FACEBOOK_RATE_LIMITS.perAccount;
    if (!hourly) throw new Error('no Facebook limit');
    const bucket = [{ key: accountRateKey(full.id), windows: FACEBOOK_RATE_LIMITS.perAccount }];
    for (let i = 0; i < hourly.max; i++) {
      expect(await t.platform.rateLimiter.take(bucket, `earlier-${String(i)}`)).toBe(0);
    }
    const id = await queued(full.id);
    const wait = await deferredBy(run(id));
    expect(wait).toBeGreaterThan((hourly.perSec - 60) * 1000);
    expect(await target(id)).toMatchObject({ status: 'publishing', attempts: 0 });
    expect(await t.db.client.publishAttempt.count({ where: { postTargetId: id } })).toBe(0);
    expect(played.published).toHaveLength(0);
    // Other Pages on the same login go on.
    const other = await queued(acc.fb);
    await run(other);
    expect((await target(other)).status).toBe('published');
  });

  it('a scheduled post a limit would hold over an hour fails, rather than going out late', async () => {
    const busy = await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId,
        network: 'facebook_page',
        externalId: '198',
        displayName: 'Busy Page 2',
        assetTokenEnc: t.platform.crypto.encrypt('page-token-198'),
      },
    });
    const bucket = [{ key: accountRateKey(busy.id), windows: FACEBOOK_RATE_LIMITS.perAccount }];
    for (let i = 0; i < (FACEBOOK_RATE_LIMITS.perAccount[0]?.max ?? 0); i++) {
      await t.platform.rateLimiter.take(bucket, `earlier-${String(i)}`);
    }
    const id = await queued(busy.id);
    await t.db.client.postTarget.update({
      where: { id },
      // Due a minute ago: the hour's wait would take it well past an hour late.
      data: { status: 'scheduled', scheduledAt: new Date(Date.now() - 60_000), scheduleVersion: 1 },
    });
    await publishTarget(
      deps,
      { workspaceId: ws, targetId: id, scheduleVersion: 1 },
      { isLast: false },
    );
    expect(await target(id)).toMatchObject({
      status: 'failed',
      attempts: 1,
      lastError: { kind: 'rate_limited' },
    });
    expect((await target(id)).lastError).toMatchObject({
      message: expect.stringContaining('over an hour late') as unknown,
    });
    expect(played.published).toHaveLength(0);
    // Our own limit asked the network nothing, so nothing was paused.
    const other = await queued(acc.fb);
    await run(other);
    expect((await target(other)).status).toBe('published');

    // Held for less than an hour past its time, it waits instead.
    const soon = await queued(busy.id);
    await t.db.client.postTarget.update({
      where: { id: soon },
      data: {
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 3 * 3_600_000),
        scheduleVersion: 1,
      },
    });
    await expect(
      publishTarget(
        deps,
        { workspaceId: ws, targetId: soon, scheduleVersion: 1 },
        { isLast: false },
      ),
    ).rejects.toBeInstanceOf(PublishDeferred);
  });

  it('a network’s "slow down" holds back that account for as long as it asked', async () => {
    const first = await queued(acc.fb);
    played.publishAnswers.push(
      new ProviderError({ kind: 'rate_limited', message: 'Page limit', retryAfterSec: 120 }),
    );
    await expect(run(first)).rejects.toMatchObject({ kind: 'rate_limited' });
    const next = await queued(acc.fb);
    const wait = await deferredBy(run(next));
    expect(wait).toBeGreaterThan(110_000);
    expect(wait).toBeLessThanOrEqual(121_000);
    expect((await target(next)).attempts).toBe(0);
    // Another account on the same app isn't held back.
    const ig = await queued(acc.ig);
    await run(ig);
    expect((await target(ig)).status).toBe('published');
    expect(played.published.map((p) => p.network)).toEqual(['facebook_page', 'instagram']);
  });

  it('the app’s own limit holds back every account on that login’s app', async () => {
    const first = await queued(acc.fb);
    played.publishAnswers.push(
      new ProviderError({
        kind: 'rate_limited',
        message: 'Application request limit reached',
        networkCode: '4',
        limitScope: 'app',
      }),
    );
    await expect(run(first)).rejects.toMatchObject({ kind: 'rate_limited' });
    for (const accountId of [acc.fb, acc.ig]) {
      const id = await queued(accountId);
      // Meta gave no time: held for this try's backoff.
      expect(await deferredBy(run(id))).toBeGreaterThan(25_000);
    }
    expect(played.published).toHaveLength(1);
  });

  it('the worker waits out a pause and keeps every try', async () => {
    await t.platform.rateLimiter.pause(accountRateKey(acc.fb), 1500);
    const post = await draft({ text: 'After the pause', targets: [{ accountId: acc.fb }] });
    expect((await owner.post(`${base()}/posts/${post.id}/publish-now`)).status).toBe(202);
    const [queuedTarget] = post.targets;
    if (!queuedTarget) throw new Error('no target');
    const job = () =>
      t.platform.queues.get(services.publishQueue).getJob(publishJobId(queuedTarget.id, 0));
    // The worker takes the job (active), finds the pause and parks it (delayed): wait for the
    // second step, not the first, or a slow machine looks in between.
    let state = await (await job())?.getState();
    for (let i = 0; i < 50 && state !== 'delayed'; i++) {
      await new Promise((r) => setTimeout(r, 20));
      state = await (await job())?.getState();
    }
    expect(state).toBe('delayed');
    expect(await target(queuedTarget.id)).toMatchObject({ status: 'publishing', attempts: 0 });

    const done = await settled(post.id);
    expect(done.targets[0]).toMatchObject({ status: 'published', attempts: 1 });
    expect(done.targets[0]?.history.map((h) => h.outcome)).toEqual(['published']);
    expect((await job())?.attemptsMade).toBeLessThanOrEqual(1);
  });
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
