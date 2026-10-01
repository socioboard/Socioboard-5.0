// The weekly digest (P2-B12) against Postgres and Valkey, with the clock set by hand: Monday from
// 08:00 in the subscriber's timezone, once, with each active workspace's week, and nothing for a
// quiet week or for people who didn't turn it on.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { MailMessage } from '../../../platform';
import { createTestApp } from '../../../testing';
import { localTime, sendDigests } from '../index';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Monday 4 March 2030, 08:30 in Kolkata (UTC+5:30). */
const MONDAY_0830_IST = Date.UTC(2030, 2, 4, 3, 0);
let now = MONDAY_0830_IST;

const sent: MailMessage[] = [];
let failSends = false;
const deps = {
  db: t.db,
  kv: t.platform.kv,
  clock: { now: () => new Date(now) },
  logger: t.platform.logger,
  appUrl: 'https://app.example.test',
  mailer: {
    send: (m: MailMessage) => {
      if (failSends) return Promise.reject(new Error('SMTP down'));
      sent.push(m);
      return Promise.resolve();
    },
    verify: () => Promise.resolve(true),
    close: () => undefined,
  },
};

let reader: Browser;
let quietOne: Browser;
let notSubscribed: Browser;
let busy = '';
let busySlug = '';
const mine = () =>
  sent.filter((m) =>
    [t.email('dg-reader'), t.email('dg-quiet'), t.email('dg-none')].includes(m.to),
  );
const subscribe = (who: Browser) =>
  who.send('PUT', '/api/v1/me/notification-preferences', {
    items: [{ type: 'digest', email: true }],
  });

beforeAll(async () => {
  reader = await t.signUp('dg-reader');
  quietOne = await t.signUp('dg-quiet');
  notSubscribed = await t.signUp('dg-none');
  for (const who of [reader, quietOne, notSubscribed]) {
    await t.db.client.user.update({
      where: { id: who.userId },
      data: { timezone: 'Asia/Kolkata' },
    });
  }
  await subscribe(reader);
  await subscribe(quietOne);

  const created = (
    await reader.post('/api/v1/workspaces', {
      name: t.workspaceName('Busy'),
      timezone: 'UTC',
    })
  ).body as { id: string; slug: string };
  ({ id: busy, slug: busySlug } = created);
  // A quiet workspace: in nobody's digest.
  await reader.post('/api/v1/workspaces', { name: t.workspaceName('Quiet'), timezone: 'UTC' });
  await quietOne.post('/api/v1/workspaces', { name: t.workspaceName('Q2'), timezone: 'UTC' });
  const inv = await reader.post(`/api/v1/workspaces/${busy}/invitations`, {
    email: t.email('dg-none'),
    role: 'viewer',
  });
  await notSubscribed.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);

  const account = await t.db.client.socialAccount.create({
    data: { workspaceId: busy, network: 'facebook_page', externalId: 'dg-1', displayName: 'Dg' },
  });
  await t.db.client.socialAccount.create({
    data: {
      workspaceId: busy,
      network: 'instagram',
      externalId: 'dg-2',
      displayName: 'Dg ig',
      status: 'reauth_required',
    },
  });
  const target = async (data: object) => {
    const post = await t.db.client.post.create({ data: { workspaceId: busy } });
    return t.db.client.postTarget.create({
      data: { workspaceId: busy, postId: post.id, socialAccountId: account.id, ...data },
    });
  };
  const at = (ms: number) => new Date(MONDAY_0830_IST + ms);
  await target({ status: 'published', publishedAt: at(-DAY) });
  await target({ status: 'published', publishedAt: at(-3 * DAY) });
  await target({ status: 'published', publishedAt: at(-9 * DAY) }); // the week before
  const failed = await target({ status: 'failed' });
  await t.db.client
    .$executeRaw`UPDATE "PostTarget" SET "updatedAt" = ${at(-2 * DAY)} WHERE id = ${failed.id}::uuid`;
  await target({ status: 'scheduled', scheduledAt: at(2 * DAY) });
  await target({ status: 'scheduled', scheduledAt: at(10 * DAY) }); // after next week
});

afterAll(async () => {
  await t.cleanup();
});

describe('weekly digest', () => {
  it('Monday 08:30 their time: the active workspace’s week, once', async () => {
    await sendDigests(deps);
    expect(mine().map((m) => m.to)).toEqual([t.email('dg-reader')]);
    const [email] = mine();
    expect(email?.subject).toBe('Your week on Socioboard: 2 published, 1 failed');
    expect(email?.text).toContain('2 posts published, 1 post scheduled for the next 7 days.');
    expect(email?.text).toContain("1 post couldn't be published.");
    expect(email?.text).toContain('1 account needs reconnecting.');
    expect(email?.text).toContain(`https://app.example.test/w/${busySlug}/calendar`);
    expect(email?.text).not.toContain('Quiet');

    // The next hour, and the one after: not again.
    now += HOUR;
    await sendDigests(deps);
    expect(mine()).toHaveLength(1);
  });

  it('not before 08:00 their time, and not on other days', async () => {
    sent.length = 0;
    const others = { ...deps, clock: { now: () => new Date(MONDAY_0830_IST + 7 * DAY - HOUR) } };
    await sendDigests(others);
    expect(mine()).toHaveLength(0);
    const sunday = { ...deps, clock: { now: () => new Date(MONDAY_0830_IST + 6 * DAY) } };
    await sendDigests(sunday);
    expect(mine()).toHaveLength(0);
  });

  it('a failed send is tried again by the next run that Monday', async () => {
    sent.length = 0;
    const nextMonday = MONDAY_0830_IST + 7 * DAY;
    const at = (ms: number) => ({ ...deps, clock: { now: () => new Date(nextMonday + ms) } });
    failSends = true;
    try {
      await sendDigests(at(0));
    } finally {
      failSends = false;
    }
    expect(mine()).toHaveLength(0);
    await sendDigests(at(HOUR));
    expect(mine().map((m) => m.to)).toEqual([t.email('dg-reader')]);
  });

  it('reads the hour in their timezone; one Intl doesn’t know counts as UTC', () => {
    expect(localTime(new Date(MONDAY_0830_IST), 'Asia/Kolkata')).toEqual({
      weekday: 'Mon',
      hour: 8,
      date: '2030-03-04',
    });
    expect(localTime(new Date(MONDAY_0830_IST), 'Mars/Olympus')).toEqual({
      weekday: 'Mon',
      hour: 3,
      date: '2030-03-04',
    });
  });
});
