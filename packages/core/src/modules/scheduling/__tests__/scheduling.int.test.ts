// Scheduling against Postgres and Valkey (P2-B2): schedule, reschedule and unschedule keep each
// target's time and schedule version in Postgres and a delayed `publish` job per version in
// BullMQ. A job for an older version does nothing, so a post that moved never goes out twice.
import { ErrorEnvelope, Post, PostDetails } from '@socioboard/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { createPostService } from '../../posts';
import { publishTarget, scheduledJobId, type PublishDeps } from '../../publishing';

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
const queue = t.platform.queues.get(services.publishQueue);
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let contributor: Browser;
let ws = '';
const acc = { fb: '', fb2: '', ig: '' };
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const inMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

beforeAll(async () => {
  owner = await t.signUp('sch-owner');
  contributor = await t.signUp('sch-contrib');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Sch'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const inv = await owner.post(`${base()}/invitations`, {
    email: t.email('sch-contrib'),
    role: 'contributor',
  });
  await contributor.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-sch-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  const account = (network: 'facebook_page' | 'instagram', externalId: string) =>
    t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network,
        externalId,
        displayName: `${network} ${externalId}`,
        assetTokenEnc: t.platform.crypto.encrypt(`page-token-${externalId}`),
        meta: network === 'instagram' ? { via: 'facebook', pageId: '101' } : {},
      },
    });
  acc.fb = (await account('facebook_page', '101')).id;
  acc.fb2 = (await account('facebook_page', '102')).id;
  acc.ig = (await account('instagram', 'ig-1')).id;
  t.platform.queues.startWorker(services.publishQueue);
});

beforeEach(() => {
  played.published.length = 0;
  played.publishAnswers.length = 0;
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

async function draft(accounts: string[], text = 'Weekend tasting, Saturday at 10') {
  const res = await owner.post(`${base()}/posts`, {
    text,
    targets: accounts.map((accountId) => ({ accountId })),
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Post.parse(res.body);
}

async function details(postId: string) {
  return PostDetails.parse((await owner.get(`${base()}/posts/${postId}`)).body);
}

async function targetRows(postId: string) {
  return t.db.client.postTarget.findMany({ where: { postId }, orderBy: { id: 'asc' } });
}

/** The delayed job queued for a target's version, or null. */
const jobOf = (targetId: string, version: number) =>
  queue.getJob(scheduledJobId(targetId, version)).then((j) => j ?? null);

describe('schedule', () => {
  it('schedules every target: a version and a delayed job each, and the post is scheduled', async () => {
    const post = await draft([acc.fb, acc.fb2]);
    const at = inMinutes(60);
    const res = await owner.post(`${base()}/posts/${post.id}/schedule`, { at });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const body = Post.parse(res.body);
    expect(body.status).toBe('scheduled');
    expect(body.targets.map((x) => [x.status, x.scheduledAt])).toEqual([
      ['scheduled', at],
      ['scheduled', at],
    ]);

    for (const row of await targetRows(post.id)) {
      expect(row.scheduleVersion).toBe(1);
      const job = await jobOf(row.id, 1);
      expect(job?.data).toEqual({ workspaceId: ws, targetId: row.id, scheduleVersion: 1 });
      // Due in about an hour.
      expect(job?.opts.delay).toBeGreaterThan(59 * 60_000);
      expect(job?.opts.delay).toBeLessThanOrEqual(60 * 60_000);
    }
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'post.scheduled', entityId: post.id },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('takes per-target times; an unknown target is refused', async () => {
    const post = await draft([acc.fb, acc.fb2]);
    const [first] = post.targets;
    const shared = inMinutes(30);
    const own = inMinutes(90);
    const res = await owner.post(`${base()}/posts/${post.id}/schedule`, {
      at: shared,
      targets: [{ targetId: first?.id, at: own }],
    });
    expect(Post.parse(res.body).targets.map((x) => x.scheduledAt)).toEqual([own, shared]);

    const unknown = await owner.post(`${base()}/posts/${post.id}/schedule`, {
      at: inMinutes(30),
      targets: [{ targetId: acc.fb, at: own }],
    });
    expect([unknown.status, code(unknown)]).toEqual([404, 'TARGET_NOT_FOUND']);
  });

  it('refuses times too soon or too far, posts with errors, and roles without posts:publish', async () => {
    const post = await draft([acc.fb]);
    const url = `${base()}/posts/${post.id}/schedule`;
    const soon = await owner.post(url, { at: inMinutes(1) });
    expect([soon.status, code(soon)]).toEqual([422, 'SCHEDULE_TOO_SOON']);
    const far = await owner.post(url, { at: inMinutes(366 * 24 * 60) });
    expect([far.status, code(far)]).toEqual([422, 'SCHEDULE_TOO_FAR']);
    const contrib = await contributor.post(url, { at: inMinutes(60) });
    expect(contrib.status).toBe(403);

    // Instagram needs media: the post can't be scheduled until that's fixed.
    const noMedia = await draft([acc.ig]);
    const bad = await owner.post(`${base()}/posts/${noMedia.id}/schedule`, { at: inMinutes(60) });
    expect([bad.status, code(bad)]).toEqual([422, 'POST_HAS_ERRORS']);

    // Nothing was scheduled by the refused requests.
    expect((await targetRows(post.id)).map((r) => [r.status, r.scheduleVersion])).toEqual([
      ['pending', 0],
    ]);
  });

  it('respects workspaces that review every post', async () => {
    const post = await draft([acc.fb]);
    await t.db.client.workspace.update({ where: { id: ws }, data: { requireReviewForAll: true } });
    try {
      const res = await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
      expect([res.status, code(res)]).toEqual([422, 'REVIEW_REQUIRED']);
    } finally {
      await t.db.client.workspace.update({
        where: { id: ws },
        data: { requireReviewForAll: false },
      });
    }
  });

  it('scheduling again moves every target: new version, new job, the old job gone', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(120) });
    const [moved] = await targetRows(post.id);
    expect(moved?.scheduleVersion).toBe(2);
    expect(await jobOf(row?.id ?? '', 1)).toBeNull();
    expect(await jobOf(row?.id ?? '', 2)).not.toBeNull();
  });
});

describe('reschedule (calendar drag)', () => {
  it('moves one target; a stale previousAt is refused with the current time', async () => {
    const post = await draft([acc.fb, acc.fb2]);
    const at = inMinutes(60);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at });
    const [a, b] = await targetRows(post.id);
    const url = `${base()}/targets/${a?.id ?? ''}/schedule`;

    const to = inMinutes(180);
    const res = await owner.send('PATCH', url, { at: to, previousAt: at });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const moved = Post.parse(res.body).targets.find((x) => x.id === a?.id);
    expect(moved?.scheduledAt).toBe(to);
    // The other target stays where it was.
    expect(Post.parse(res.body).targets.find((x) => x.id === b?.id)?.scheduledAt).toBe(at);
    expect(await jobOf(a?.id ?? '', 1)).toBeNull();
    expect((await jobOf(a?.id ?? '', 2))?.opts.delay).toBeGreaterThan(179 * 60_000);

    // A second tab still showing the old time.
    const stale = await owner.send('PATCH', url, { at: inMinutes(240), previousAt: at });
    expect([stale.status, code(stale)]).toEqual([409, 'SCHEDULE_CHANGED']);
    expect(ErrorEnvelope.parse(stale.body).error.details).toEqual({ at: to });
  });

  it('refuses moving a target that is not scheduled', async () => {
    const post = await draft([acc.fb]);
    const [row] = await targetRows(post.id);
    const res = await owner.send('PATCH', `${base()}/targets/${row?.id ?? ''}/schedule`, {
      at: inMinutes(60),
      previousAt: inMinutes(30),
    });
    expect([res.status, code(res)]).toEqual([409, 'TARGET_NOT_SCHEDULED']);
  });
});

describe('unschedule', () => {
  it('takes targets back to waiting: draft again, jobs gone; twice is refused', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    const res = await owner.post(`${base()}/posts/${post.id}/unschedule`);
    expect(res.status).toBe(200);
    const body = Post.parse(res.body);
    expect(body.status).toBe('draft');
    expect(body.targets.map((x) => [x.status, x.scheduledAt])).toEqual([['pending', null]]);
    expect(await jobOf(row?.id ?? '', 1)).toBeNull();

    const again = await owner.post(`${base()}/posts/${post.id}/unschedule`);
    expect([again.status, code(again)]).toEqual([409, 'POST_NOT_SCHEDULED']);
  });
});

describe('publishing exactly once', () => {
  it('a job for an older version does nothing; the current one publishes once', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(120) });
    const [row] = await targetRows(post.id);
    const targetId = row?.id ?? '';

    await publishTarget(deps, { workspaceId: ws, targetId, scheduleVersion: 1 }, { isLast: false });
    expect(played.published).toHaveLength(0);
    // A publish-now style job (no version) never sends a scheduled target either.
    await publishTarget(deps, { workspaceId: ws, targetId }, { isLast: false });
    expect(played.published).toHaveLength(0);

    await publishTarget(deps, { workspaceId: ws, targetId, scheduleVersion: 2 }, { isLast: false });
    await publishTarget(deps, { workspaceId: ws, targetId, scheduleVersion: 2 }, { isLast: false });
    expect(played.published).toHaveLength(1);
    expect((await details(post.id)).status).toBe('published');
  });

  it('the real worker runs a scheduled job when it falls due', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    // Brings the delayed job forward instead of waiting an hour.
    await (await jobOf(row?.id ?? '', 1))?.promote();
    for (let i = 0; i < 100 && played.published.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(played.published).toHaveLength(1);
    for (let i = 0; i < 50; i++) {
      if ((await details(post.id)).status === 'published') break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect((await details(post.id)).targets[0]?.status).toBe('published');
  });

  it('publish now on a scheduled post sends it now; its scheduled job goes stale', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    const res = await owner.post(`${base()}/posts/${post.id}/publish-now`);
    expect(res.status, JSON.stringify(res.body)).toBe(202);
    expect(await jobOf(row?.id ?? '', 1)).toBeNull();
    for (let i = 0; i < 100 && played.published.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    // Even if the old job had already been picked up, it would find nothing to do.
    await publishTarget(
      deps,
      { workspaceId: ws, targetId: row?.id ?? '', scheduleVersion: 1 },
      { isLast: false },
    );
    expect(played.published).toHaveLength(1);
  });
});

describe('when queueing fails', () => {
  it('publish now on a scheduled post puts it back as it was, its job still valid', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    // The same posts service, with a queue that refuses the publish-now job.
    const broken = createPostService({
      ...t.platform,
      registry: played.registry,
      enqueuePublish: () => Promise.reject(new Error('queue down')),
      enqueueScheduled: () => Promise.resolve(),
      dropScheduledJobs: () => Promise.resolve(),
    });
    const auth = {
      user: {
        id: owner.userId,
        email: t.email('sch-owner'),
        name: 'Owner',
        emailVerified: true,
        isPlatformAdmin: false,
      },
      session: { id: 'test', activeWorkspaceId: ws },
    };
    const member = { workspaceId: ws, memberId: 'test', role: 'owner' as const, accountIds: null };
    await expect(broken.publishNow(auth, member, post.id, undefined)).rejects.toThrow('queue down');

    const [after] = await targetRows(post.id);
    expect([after?.status, after?.scheduleVersion]).toEqual(['scheduled', 1]);
    expect(after?.scheduledAt?.getTime()).toBe(row?.scheduledAt?.getTime());
    // Its delayed job is the one that will run.
    expect((await jobOf(row?.id ?? '', 1))?.data.scheduleVersion).toBe(1);
    await publishTarget(
      deps,
      { workspaceId: ws, targetId: row?.id ?? '', scheduleVersion: 1 },
      { isLast: false },
    );
    expect(played.published).toHaveLength(1);
  });
});

describe('editing a scheduled post', () => {
  it('an account added joins at the post’s time; a removed one’s job is dropped', async () => {
    const post = await draft([acc.fb]);
    const at = inMinutes(60);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at });
    const [first] = await targetRows(post.id);

    const res = await owner.send('PATCH', `${base()}/posts/${post.id}`, {
      targets: [{ accountId: acc.fb2, override: null }],
    });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const body = Post.parse(res.body);
    expect(body.status).toBe('scheduled');
    expect(body.targets.map((x) => [x.account.id, x.status, x.scheduledAt])).toEqual([
      [acc.fb2, 'scheduled', at],
    ]);
    const [joined] = await targetRows(post.id);
    expect((await jobOf(joined?.id ?? '', 1))?.data.scheduleVersion).toBe(1);
    expect(await jobOf(first?.id ?? '', 1)).toBeNull();
  });

  it('deleting a scheduled post drops its jobs', async () => {
    const post = await draft([acc.fb]);
    await owner.post(`${base()}/posts/${post.id}/schedule`, { at: inMinutes(60) });
    const [row] = await targetRows(post.id);
    const res = await owner.send('DELETE', `${base()}/posts/${post.id}`);
    expect(res.status).toBe(204);
    expect(await jobOf(row?.id ?? '', 1)).toBeNull();
  });
});
