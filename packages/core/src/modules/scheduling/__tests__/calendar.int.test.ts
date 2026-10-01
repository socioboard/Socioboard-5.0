// The calendar endpoint (P2-B9) against Postgres: targets whose time (published, else due, else
// last tried) falls in the range, in time order, filtered by account, status and label. Posts and
// targets are written straight to the database, so each case sets exactly the times it needs.
import { CALENDAR_MAX_ENTRIES, CalendarResponse, ErrorEnvelope } from '@socioboard/contracts';
import type { TargetStatus } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { newId } from '../../../platform';
import { createTestApp } from '../../../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let viewer: Browser;
let ws = '';
let fb = '';
let ig = '';
const label = newId();
const DAY = 86_400_000;
/** Range under test: a week starting at a fixed Monday. */
const FROM = new Date('2030-03-04T00:00:00Z');
const TO = new Date(FROM.getTime() + 7 * DAY);
const day = (n: number, hour = 9) => new Date(FROM.getTime() + n * DAY + hour * 3_600_000);

const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const calendar = async (query: string, who: Browser = owner) => {
  const res = await who.get(`/api/v1/workspaces/${ws}/calendar?${query}`);
  expect(res.status, JSON.stringify(res.body)).toBe(200);
  return CalendarResponse.parse(res.body);
};
const range = `from=${FROM.toISOString()}&to=${TO.toISOString()}`;

/** A post with one target, as the case needs it; returns the target id. */
async function target(
  name: string,
  data: {
    account?: string;
    status: TargetStatus;
    scheduledAt?: Date | null;
    publishedAt?: Date | null;
    tries?: Date[];
    labels?: string[];
    workspaceId?: string;
  },
) {
  const workspaceId = data.workspaceId ?? ws;
  const post = await t.db.client.post.create({
    data: { workspaceId, text: name, labelIds: data.labels ?? [] },
  });
  const row = await t.db.client.postTarget.create({
    data: {
      workspaceId,
      postId: post.id,
      socialAccountId: data.account ?? fb,
      status: data.status,
      scheduledAt: data.scheduledAt ?? null,
      publishedAt: data.publishedAt ?? null,
      attempts: data.tries?.length ?? 0,
    },
  });
  for (const [i, startedAt] of (data.tries ?? []).entries()) {
    await t.db.client.publishAttempt.create({
      data: { workspaceId, postTargetId: row.id, attemptNo: i + 1, startedAt, outcome: 'failed' },
    });
  }
  return row.id;
}

const named = (r: CalendarResponse) => r.items.map((e) => e.text);

beforeAll(async () => {
  owner = await t.signUp('cal-owner');
  viewer = await t.signUp('cal-viewer');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Cal'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const inv = await owner.post(`/api/v1/workspaces/${ws}/invitations`, {
    email: t.email('cal-viewer'),
    role: 'viewer',
  });
  await viewer.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  const account = (network: 'facebook_page' | 'instagram', externalId: string) =>
    t.db.client.socialAccount.create({
      data: { workspaceId: ws, network, externalId, displayName: externalId },
    });
  fb = (await account('facebook_page', 'cal-fb')).id;
  ig = (await account('instagram', 'cal-ig')).id;

  await target('scheduled wed', { status: 'scheduled', scheduledAt: day(2), labels: [label] });
  await target('scheduled mon ig', { account: ig, status: 'scheduled', scheduledAt: day(0, 8) });
  // Published: its time is when it went out, whatever was planned.
  await target('published tue', {
    status: 'published',
    scheduledAt: day(-3),
    publishedAt: day(1),
  });
  await target('published before', {
    status: 'published',
    scheduledAt: day(1),
    publishedAt: day(-1),
  });
  // A failed publish-now: its time is the last try.
  await target('failed thu', { status: 'failed', tries: [day(-2), day(3)] });
  await target('failed after', { status: 'failed', tries: [day(3), day(9)] });
  await target('publishing fri', { status: 'publishing', scheduledAt: day(4) });
  await target('cancelled sat', { status: 'cancelled', scheduledAt: day(5) });
  await target('draft', { status: 'pending' });
  await target('next week', { status: 'scheduled', scheduledAt: day(7) });
  // The range includes its start and excludes its end.
  await target('range start', { status: 'scheduled', scheduledAt: FROM });
  await target('range end', { status: 'scheduled', scheduledAt: TO });
  await target('published at range end', {
    status: 'published',
    scheduledAt: day(2),
    publishedAt: TO,
  });
  await target('last tried at range end', { status: 'failed', tries: [day(1), TO] });
});

afterAll(async () => {
  await t.cleanup();
});

describe('calendar', () => {
  it('everything with a time in the range, in time order; drafts and cancelled left out', async () => {
    const res = await calendar(range);
    expect(named(res)).toEqual([
      'range start',
      'scheduled mon ig',
      'published tue',
      'scheduled wed',
      'failed thu',
      'publishing fri',
    ]);
    expect(res.truncated).toBe(false);
    const wed = res.items.find((e) => e.text === 'scheduled wed');
    expect(wed).toMatchObject({
      status: 'scheduled',
      at: day(2).toISOString(),
      account: { id: fb, network: 'facebook_page' },
      labelIds: [label],
      recurring: false,
      mediaCount: 0,
    });
  });

  it('filters by account, status (repeatable) and label', async () => {
    expect(named(await calendar(`${range}&accountId=${ig}`))).toEqual(['scheduled mon ig']);
    expect(named(await calendar(`${range}&status=failed&status=published`))).toEqual([
      'published tue',
      'failed thu',
    ]);
    // Asked for by name, cancelled ones show.
    expect(named(await calendar(`${range}&status=cancelled`))).toEqual(['cancelled sat']);
    expect(named(await calendar(`${range}&labelId=${label}`))).toEqual(['scheduled wed']);
    expect(named(await calendar(`${range}&accountId=${fb}&accountId=${ig}`))).toHaveLength(6);
  });

  it('anyone who can read the calendar sees it', async () => {
    expect(named(await calendar(range, viewer))).toHaveLength(6);
  });

  it('refuses a backwards range or one over 62 days', async () => {
    const back = await owner.get(
      `/api/v1/workspaces/${ws}/calendar?from=${TO.toISOString()}&to=${FROM.toISOString()}`,
    );
    expect([back.status, code(back)]).toEqual([400, 'VALIDATION_FAILED']);
    const long = await owner.get(
      `/api/v1/workspaces/${ws}/calendar?from=${FROM.toISOString()}&to=${new Date(FROM.getTime() + 63 * DAY).toISOString()}`,
    );
    expect(long.status).toBe(400);
  });

  it(`at most ${String(CALENDAR_MAX_ENTRIES)} entries, saying there were more`, async () => {
    const other = (
      (await owner.post('/api/v1/workspaces', { name: t.workspaceName('CalBig'), timezone: 'UTC' }))
        .body as { id: string }
    ).id;
    const account = await t.db.client.socialAccount.create({
      data: { workspaceId: other, network: 'facebook_page', externalId: 'big', displayName: 'big' },
    });
    const n = CALENDAR_MAX_ENTRIES + 5;
    const posts = Array.from({ length: n }, () => ({ id: newId(), workspaceId: other, text: 'x' }));
    await t.db.client.post.createMany({ data: posts });
    await t.db.client.postTarget.createMany({
      data: posts.map((p, i) => ({
        workspaceId: other,
        postId: p.id,
        socialAccountId: account.id,
        status: 'scheduled' as const,
        scheduledAt: new Date(FROM.getTime() + i * 60_000),
      })),
    });
    const res = await owner.get(`/api/v1/workspaces/${other}/calendar?${range}`);
    const body = CalendarResponse.parse(res.body);
    expect(body.items).toHaveLength(CALENDAR_MAX_ENTRIES);
    expect(body.truncated).toBe(true);
    // The earliest ones.
    expect(body.items[0]?.at).toBe(FROM.toISOString());
  });
});
