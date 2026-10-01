// The reconcile job (P2-B5) against Postgres and Valkey: Postgres is the source of truth, so a
// scheduled target whose job Valkey lost gets it back; one far overdue fails instead of going out
// hours late; a target stuck `publishing` with nothing working on it is stopped, never retried
// blindly. No worker runs here, so queued jobs stay where the reconciler put them.
import { Post } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { publishJobId, publishTarget, scheduledJobId, type PublishDeps } from '../../publishing';

const t = createTestApp();
const services = createPublishingServices(t.platform, { registry: t.networks.registry });
const queue = t.platform.queues.get(services.publishQueue);
const deps: PublishDeps = {
  ...t.platform,
  registry: t.networks.registry,
  mediaUrls: services.mediaUrls,
  getCredentials: services.socialAccounts.getCredentials,
  markReauthRequired: services.socialAccounts.markReauthRequired,
  recomputeStatus: services.posts.recomputeStatus,
};
const reconcile = () => services.reconciler.run({ workspaceId: ws });
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let ws = '';
let account = '';
const base = () => `/api/v1/workspaces/${ws}`;
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000);

beforeAll(async () => {
  owner = await t.signUp('rc-owner');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Rc'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-rc-${ws}`,
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
        externalId: '401',
        displayName: 'Halden Coffee',
        assetTokenEnc: t.platform.crypto.encrypt('page-token-401'),
      },
    })
  ).id;
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

/** A post scheduled an hour ahead through the API; returns its one target. */
async function scheduled() {
  const created = await owner.post(`${base()}/posts`, {
    text: 'Tasting tonight',
    targets: [{ accountId: account }],
  });
  const post = Post.parse(created.body);
  await owner.post(`${base()}/posts/${post.id}/schedule`, { at: minutesFromNow(60).toISOString() });
  return t.db.client.postTarget.findFirstOrThrow({ where: { postId: post.id } });
}

const setUpdatedAt = (targetId: string, at: Date) =>
  t.db.client.$executeRaw`UPDATE "PostTarget" SET "updatedAt" = ${at} WHERE id = ${targetId}::uuid`;

describe('scheduled targets', () => {
  it('a job Valkey lost is rebuilt, once', async () => {
    const target = await scheduled();
    const jobId = scheduledJobId(target.id, 1);
    await queue.remove(jobId);
    expect(await queue.getJob(jobId)).toBeUndefined();

    expect((await reconcile()).rebuilt).toBe(1);
    const job = await queue.getJob(jobId);
    expect(job?.data).toEqual({ workspaceId: ws, targetId: target.id, scheduleVersion: 1 });
    expect(job?.opts.delay).toBeGreaterThan(55 * 60_000);
    expect((await reconcile()).rebuilt).toBe(0);
  });

  it('a little overdue: sent now', async () => {
    const target = await scheduled();
    await queue.remove(scheduledJobId(target.id, 1));
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { scheduledAt: minutesFromNow(-10) },
    });
    expect((await reconcile()).rebuilt).toBe(1);
    expect((await queue.getJob(scheduledJobId(target.id, 1)))?.opts.delay).toBe(0);
  });

  it('far overdue: failed with a message, not posted hours late', async () => {
    const target = await scheduled();
    await queue.remove(scheduledJobId(target.id, 1));
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { scheduledAt: minutesFromNow(-120) },
    });
    expect((await reconcile()).missed).toBe(1);
    const after = await t.db.client.postTarget.findUniqueOrThrow({
      where: { id: target.id },
      include: { post: true },
    });
    expect(after.status).toBe('failed');
    expect(after.lastError).toMatchObject({ kind: 'retryable' });
    expect(after.post.status).toBe('failed');
    expect(await queue.getJob(scheduledJobId(target.id, 1))).toBeUndefined();
  });

  it('a target whose job is alive is left alone', async () => {
    await scheduled();
    expect(await reconcile()).toEqual({ rebuilt: 0, missed: 0, stuck: 0 });
  });
});

describe('targets stuck publishing', () => {
  /** A target publishing since `minutesAgo` minutes ago, on its `attempts`th try. */
  async function publishing(minutesAgo: number, attempts = 1) {
    const created = await owner.post(`${base()}/posts`, {
      text: 'Stuck',
      targets: [{ accountId: account }],
    });
    const post = Post.parse(created.body);
    const target = await t.db.client.postTarget.findFirstOrThrow({ where: { postId: post.id } });
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { status: 'publishing', attempts },
    });
    await t.db.client.publishAttempt.create({
      data: {
        workspaceId: ws,
        postTargetId: target.id,
        attemptNo: attempts,
        startedAt: minutesFromNow(-minutesAgo),
      },
    });
    await setUpdatedAt(target.id, minutesFromNow(-minutesAgo));
    return target;
  }

  it('stopped when nothing is working on it: failed, its attempt closed, never retried', async () => {
    const target = await publishing(20);
    expect((await reconcile()).stuck).toBe(1);
    const after = await t.db.client.postTarget.findUniqueOrThrow({
      where: { id: target.id },
      include: { history: true },
    });
    expect(after.status).toBe('failed');
    expect(after.history.map((h) => h.outcome)).toEqual(['failed']);
    // Nothing was queued to try again.
    expect(await queue.getJob(publishJobId(target.id, 1))).toBeUndefined();
  });

  it('left alone while a job waits to retry, or before 15 minutes', async () => {
    const retrying = await publishing(20);
    await queue.add(
      'publish',
      { workspaceId: ws, targetId: retrying.id },
      { jobId: publishJobId(retrying.id, 0), delay: 60_000 },
    );
    const recent = await publishing(5);
    expect((await reconcile()).stuck).toBe(0);
    for (const id of [retrying.id, recent.id]) {
      const row = await t.db.client.postTarget.findUniqueOrThrow({ where: { id } });
      expect(row.status).toBe('publishing');
    }
  });

  it('left alone on a later try: the job keeps the id it was queued with', async () => {
    // Queued at 0 attempts, now on its 3rd try, waiting out a long rate limit.
    const later = await publishing(40, 3);
    await queue.add(
      'publish',
      { workspaceId: ws, targetId: later.id },
      { jobId: publishJobId(later.id, 0), delay: 3_600_000 },
    );
    expect((await reconcile()).stuck).toBe(0);
    const row = await t.db.client.postTarget.findUniqueOrThrow({ where: { id: later.id } });
    expect(row.status).toBe('publishing');
  });
});

describe('a deleted workspace', () => {
  it('stops everything it had scheduled; a job already queued publishes nothing', async () => {
    const other = await owner.post('/api/v1/workspaces', {
      name: t.workspaceName('RcGone'),
      timezone: 'UTC',
    });
    const goneWs = (other.body as { id: string; name: string }).id;
    const goneName = (other.body as { name: string }).name;
    const goneAccount = await t.db.client.socialAccount.create({
      data: {
        workspaceId: goneWs,
        network: 'facebook_page',
        externalId: '499',
        displayName: 'Closing down',
      },
    });
    const created = await owner.post(`/api/v1/workspaces/${goneWs}/posts`, {
      text: 'Never',
      targets: [{ accountId: goneAccount.id }],
    });
    const post = Post.parse(created.body);
    await owner.post(`/api/v1/workspaces/${goneWs}/posts/${post.id}/schedule`, {
      at: minutesFromNow(60).toISOString(),
    });
    const repeating = Post.parse(
      (
        await owner.post(`/api/v1/workspaces/${goneWs}/posts`, {
          text: 'Weekly',
          targets: [{ accountId: goneAccount.id }],
        })
      ).body,
    );
    const day = new Date(Date.now() + 86_400_000);
    await owner.send('PUT', `/api/v1/workspaces/${goneWs}/posts/${repeating.id}/recurrence`, {
      frequency: 'weekly',
      weekdays: [day.getUTCDay()],
      time: '12:00',
      timezone: 'UTC',
      startsOn: day.toISOString().slice(0, 10),
    });
    const target = await t.db.client.postTarget.findFirstOrThrow({ where: { postId: post.id } });
    expect(target.status).toBe('scheduled');

    const res = await owner.send('DELETE', `/api/v1/workspaces/${goneWs}`, {
      confirmName: goneName,
    });
    expect(res.status, JSON.stringify(res.body)).toBe(204);

    const after = await t.db.client.postTarget.findUniqueOrThrow({ where: { id: target.id } });
    expect(after.status).toBe('cancelled');
    expect(await queue.getJob(scheduledJobId(target.id, 1))).toBeUndefined();
    const rule = await t.db.client.recurringRule.findFirstOrThrow({
      where: { postId: repeating.id },
    });
    expect(rule.active).toBe(false);
    expect(
      await t.db.client.postTarget.count({
        where: { workspaceId: goneWs, status: 'scheduled' },
      }),
    ).toBe(0);

    // Even a job that slipped through does nothing for a deleted workspace.
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { status: 'scheduled' },
    });
    await publishTarget(
      deps,
      { workspaceId: goneWs, targetId: target.id, scheduleVersion: 1 },
      { isLast: false },
    );
    expect(t.networks.published).toHaveLength(0);
    // And the reconcile job leaves it alone.
    expect(await services.reconciler.run({ workspaceId: goneWs })).toEqual({
      rebuilt: 0,
      missed: 0,
      stuck: 0,
    });
  });
});
