// The reconcile job (P2-B5) against Postgres and Valkey: Postgres is the source of truth, so a
// scheduled target whose job Valkey lost gets it back; one far overdue fails instead of going out
// hours late; a target stuck `publishing` with nothing working on it is stopped, never retried
// blindly. No worker runs here, so queued jobs stay where the reconciler put them.
import { Post } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { publishJobId, scheduledJobId } from '../../publishing';

const t = createTestApp();
const services = createPublishingServices(t.platform, { registry: t.networks.registry });
const queue = t.platform.queues.get(services.publishQueue);
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
  /** A target that started publishing (attempt 1 running) `minutesAgo` minutes ago. */
  async function publishing(minutesAgo: number) {
    const created = await owner.post(`${base()}/posts`, {
      text: 'Stuck',
      targets: [{ accountId: account }],
    });
    const post = Post.parse(created.body);
    const target = await t.db.client.postTarget.findFirstOrThrow({ where: { postId: post.id } });
    await t.db.client.postTarget.update({
      where: { id: target.id },
      data: { status: 'publishing', attempts: 1 },
    });
    await t.db.client.publishAttempt.create({
      data: {
        workspaceId: ws,
        postTargetId: target.id,
        attemptNo: 1,
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
});
