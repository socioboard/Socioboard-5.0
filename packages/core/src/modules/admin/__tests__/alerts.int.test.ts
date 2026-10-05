// P2-I1 built-in alerts (docs/backend/modules/admin.md#alerts-p2-i1) against Postgres and Valkey:
// failed deliveries over the threshold, a queue whose oldest job doesn't move, a delayed job past
// its time (read from BullMQ's own score), one process per round, an hour's quiet, and only
// platform admins emailed. Failures are seeded on Pinterest, which no other test publishes to;
// queues use this run's own prefix, where no worker runs.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';
import { defineQueue, type Clock, type MailMessage, type Mailer } from '../../../platform';
import { ALERT_CHECK_MS, createOpsAlerts, type OpsAlertsDeps } from '../alerts';

const t = createTestApp();
const MIN = 60_000;
const base = Date.now();

let ws = '';
let adminEmail = '';
let ownerEmail = '';

const at = (offsetMs: number): Clock => ({ now: () => new Date(base + offsetMs) });
const queue = (name: string) => t.platform.queues.get(defineQueue(name, () => Promise.resolve()));

function mailbox(fail = false): Mailer & { sent: MailMessage[] } {
  const sent: MailMessage[] = [];
  return {
    sent,
    send: (m) =>
      fail ? Promise.reject(new Error('SMTP down')) : (sent.push(m), Promise.resolve()),
    verify: () => Promise.resolve(true),
    close: () => undefined,
  };
}

function alerts(overrides: Partial<OpsAlertsDeps> = {}) {
  return createOpsAlerts({
    db: t.db,
    kv: t.platform.kv,
    queues: t.platform.queues,
    mailer: mailbox(),
    clock: at(0),
    logger: t.platform.logger,
    appUrl: 'https://app.example.test',
    thresholds: { failedPublishes: 3, queueWaiting: 1000, queueLagMinutes: 10 },
    ...overrides,
  });
}

beforeAll(async () => {
  const admin = await t.signUp('alert-admin');
  const owner = await t.signUp('alert-owner');
  adminEmail = t.email('alert-admin');
  ownerEmail = t.email('alert-owner');
  await t.db.client.user.update({
    where: { id: admin.userId },
    data: { isPlatformAdmin: true, emailVerified: true },
  });
  await t.db.client.user.update({ where: { id: owner.userId }, data: { emailVerified: true } });
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Alerts'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const account = await t.db.client.socialAccount.create({
    data: { workspaceId: ws, network: 'pinterest', externalId: 'pin-1', displayName: 'Pins' },
  });
  for (let i = 0; i < 3; i++) {
    const post = await t.db.client.post.create({ data: { workspaceId: ws } });
    const target = await t.db.client.postTarget.create({
      data: { workspaceId: ws, postId: post.id, socialAccountId: account.id, status: 'failed' },
    });
    await t.db.client.publishAttempt.create({
      data: {
        workspaceId: ws,
        postTargetId: target.id,
        attemptNo: 1,
        outcome: 'failed',
        errorKind: 'content',
        finishedAt: new Date(base - (i + 1) * MIN),
      },
    });
  }
});

afterAll(async () => {
  await t.cleanup();
});

describe('what counts as wrong', () => {
  it('failed deliveries in the last 15 minutes, per network, from the threshold up', async () => {
    const found = (await alerts().evaluate()).find((a) => a.kind === 'publish_failures');
    expect(found?.rows).toContainEqual({ name: 'pinterest', detail: '3 failed' });
    expect(found?.path).toBe('/admin/publishing');
    // Twenty minutes on, the same failures are outside the window.
    const later = await alerts({
      clock: at(20 * MIN),
      thresholds: { failedPublishes: 1, queueWaiting: 1000, queueLagMinutes: 10 },
    }).evaluate();
    const rows = later.find((a) => a.kind === 'publish_failures')?.rows ?? [];
    expect(rows.find((r) => r.name === 'pinterest')).toBeUndefined();
  });

  it('a high threshold stays quiet', async () => {
    const quiet = await alerts({
      thresholds: { failedPublishes: 1_000_000, queueWaiting: 1000, queueLagMinutes: 10 },
    }).evaluate();
    expect(quiet.some((a) => a.kind === 'publish_failures')).toBe(false);
  });

  it('a delayed job past its time by the lag: no worker is promoting jobs', async () => {
    await queue('publish').add('scheduled', {}, { delay: 60_000 });
    const onTime = await alerts({ clock: at(5 * MIN) }).evaluate();
    expect(onTime.some((a) => a.key === 'jobs_overdue:publish')).toBe(false);
    const late = await alerts({ clock: at(12 * MIN) }).evaluate();
    const overdue = late.find((a) => a.key === 'jobs_overdue:publish');
    expect(overdue?.summary).toMatch(/due 11 minutes ago/);
  });

  it('a waiting job that hasn’t moved for the lag', async () => {
    await queue('media-purge').add('purge', {});
    const first = await alerts({ clock: at(0) }).evaluate();
    expect(first.some((a) => a.key === 'queue_backlog:media-purge')).toBe(false);
    const stuck = await alerts({ clock: at(11 * MIN) }).evaluate();
    expect(stuck.find((a) => a.key === 'queue_backlog:media-purge')?.summary).toMatch(
      /hasn't been picked up for 11 minutes/,
    );
  });

  it('too many waiting, at once', async () => {
    await queue('audit-purge').addBulk([
      { name: 'a', data: {} },
      { name: 'b', data: {} },
    ]);
    const found = await alerts({
      thresholds: { failedPublishes: 3, queueWaiting: 2, queueLagMinutes: 10 },
    }).evaluate();
    expect(found.find((a) => a.key === 'queue_backlog:audit-purge')?.summary).toMatch(
      /^2 jobs are waiting/,
    );
  });
});

describe('sending', () => {
  // Each test runs in its own 5-minute slot, an hour past the seeding.
  const slot = (n: number) => at(60 * MIN + n * 5 * MIN);

  it('an email that couldn’t be sent is tried again next round', async () => {
    const down = mailbox(true);
    expect(await alerts({ clock: slot(0), mailer: down }).check()).toEqual([]);
    const up = mailbox();
    const sent = await alerts({ clock: slot(1), mailer: up }).check();
    expect(sent.length).toBeGreaterThan(0);
  });

  it('one process per round; each alert then quiet for an hour; only platform admins', async () => {
    const box = mailbox();
    // A queue no earlier test touched, so its alert is new: seen at slot 2, stuck by slot 5.
    await queue('notification-purge').add('purge', {});
    await alerts({ clock: slot(2), mailer: box }).evaluate(); // first sighting
    const first = await alerts({ clock: slot(5), mailer: box }).check();
    expect(first.map((a) => a.key)).toContain('queue_backlog:notification-purge');
    const to = box.sent.map((m) => m.to);
    expect(to).toContain(adminEmail);
    expect(to).not.toContain(ownerEmail);
    const mail = box.sent.find((m) => m.subject.includes('notification-purge'));
    expect(mail?.subject).toBe('Socioboard alert: The notification-purge queue is backed up');
    expect(mail?.text).toContain('https://app.example.test/admin/queues');

    // Same slot, another process (the api while the worker checks): it does nothing.
    expect(await alerts({ clock: slot(5), mailer: box }).check()).toEqual([]);
    // Next round: still wrong, but quiet for the hour.
    const next = await alerts({ clock: slot(6), mailer: box }).check();
    expect(next.map((a) => a.key)).not.toContain('queue_backlog:notification-purge');
  });

  it('a round another process took is skipped, even with a new alert due', async () => {
    await queue('recurring').add('expand', {});
    await alerts({ clock: slot(8) }).evaluate(); // first sighting
    // Another process (the worker, while this is the api) has taken round 11 already.
    const round = Math.floor(slot(11).now().getTime() / ALERT_CHECK_MS);
    await t.platform.kv.incr(`ops-alerts:slot:${String(round)}`, 600);
    const box = mailbox();
    expect(await alerts({ clock: slot(11), mailer: box }).check()).toEqual([]);
    expect(box.sent).toEqual([]);
    // The next round is free: the alert goes out then.
    const sent = await alerts({ clock: slot(12), mailer: box }).check();
    expect(sent.map((a) => a.key)).toContain('queue_backlog:recurring');
  });
});
