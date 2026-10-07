// Queue slots and "Add to queue" (P2-B3) against Postgres and Valkey: an account's posting times,
// its next slots with what's in them, and posts placed in the next free slot, never two in one.
import { ErrorEnvelope, Post, QueueSlots } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { MemberContext } from '../../../platform';
import { createTestApp } from '../../../testing';
import { createCalendarEntries } from '../calendar';
import { createQueueSlotService } from '../queue-slots';
import { wallClock } from '../time';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let contributor: Browser;
let ws = '';
const acc = { a: '', b: '', gone: '' };
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;
const slotsUrl = (accountId: string) => `${base()}/accounts/${accountId}/queue-slots`;
const everyDay = (time: string) => [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, time }));

beforeAll(async () => {
  owner = await t.signUp('q-owner');
  contributor = await t.signUp('q-contrib');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Q'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const inv = await owner.post(`${base()}/invitations`, {
    email: t.email('q-contrib'),
    role: 'contributor',
  });
  await contributor.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-q-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  const account = (externalId: string, status: 'active' | 'disconnected' = 'active') =>
    t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: status === 'active' ? login.id : null,
        network: 'facebook_page',
        externalId,
        displayName: `Page ${externalId}`,
        status,
        assetTokenEnc: t.platform.crypto.encrypt(`page-token-${externalId}`),
      },
    });
  acc.a = (await account('201')).id;
  acc.b = (await account('202')).id;
  acc.gone = (await account('203', 'disconnected')).id;
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

async function draft(accounts: string[]) {
  const res = await owner.post(`${base()}/posts`, {
    text: 'Queued post',
    targets: accounts.map((accountId) => ({ accountId })),
  });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Post.parse(res.body);
}

describe('queue slots', () => {
  it('an account without slots: the workspace timezone, nothing upcoming', async () => {
    const res = await contributor.get(slotsUrl(acc.b));
    expect(res.status).toBe(200);
    expect(QueueSlots.parse(res.body)).toEqual({ timezone: 'UTC', slots: [], upcoming: [] });
  });

  it('replacing slots: sorted back, with the next 14 slot times in their timezone', async () => {
    const res = await owner.send('PUT', slotsUrl(acc.a), {
      timezone: 'Asia/Kolkata',
      slots: [
        { weekday: 3, time: '15:00' },
        { weekday: 1, time: '09:00' },
        ...everyDay('09:00').filter((s) => s.weekday !== 1),
      ],
    });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const body = QueueSlots.parse(res.body);
    expect(body.timezone).toBe('Asia/Kolkata');
    expect(body.slots.slice(0, 3)).toEqual([
      { weekday: 0, time: '09:00' },
      { weekday: 1, time: '09:00' },
      { weekday: 2, time: '09:00' },
    ]);
    expect(body.upcoming).toHaveLength(14);
    for (const u of body.upcoming) {
      const w = wallClock(Date.parse(u.at), 'Asia/Kolkata');
      expect([w.hour, w.minute]).toEqual(w.weekday === 3 && w.hour === 15 ? [15, 0] : [9, 0]);
      expect(Date.parse(u.at)).toBeGreaterThan(Date.now());
    }
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'queue_slots.updated', entityId: acc.a },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('skips a slot too close to fill, like "Add to queue" does', async () => {
    // Monday 08:59 in Kolkata: Monday's 09:00 is under 2 minutes away, so Tuesday's comes first.
    const view = createQueueSlotService({
      db: t.db,
      clock: { now: () => new Date('2027-01-04T03:29:00Z') },
      events: t.platform.events,
      entries: createCalendarEntries(t.db, undefined),
    });
    const member: MemberContext = { workspaceId: ws, memberId: '', role: 'owner' };
    const { upcoming } = await view.get(member, acc.a);
    expect(upcoming[0]?.at).toBe('2027-01-05T03:30:00.000Z');
  });

  it('needs accounts:manage to change; refuses disconnected accounts and repeated slots', async () => {
    const body = { timezone: 'UTC', slots: everyDay('10:00') };
    expect((await contributor.send('PUT', slotsUrl(acc.b), body)).status).toBe(403);
    const gone = await owner.send('PUT', slotsUrl(acc.gone), body);
    expect([gone.status, code(gone)]).toEqual([422, 'ACCOUNT_NOT_AVAILABLE']);
    const twice = await owner.send('PUT', slotsUrl(acc.b), {
      timezone: 'UTC',
      slots: [
        { weekday: 1, time: '10:00' },
        { weekday: 1, time: '10:00' },
      ],
    });
    expect(twice.status).toBe(400);
  });
});

describe('add to queue', () => {
  it('puts each account’s target in its next free slot; the next post gets the slot after', async () => {
    await owner.send('PUT', slotsUrl(acc.b), { timezone: 'UTC', slots: everyDay('08:00') });
    const first = await draft([acc.b]);
    const second = await draft([acc.b]);
    const a = Post.parse((await owner.post(`${base()}/posts/${first.id}/queue`)).body);
    const b = Post.parse((await owner.post(`${base()}/posts/${second.id}/queue`)).body);
    expect([a.status, b.status]).toEqual(['scheduled', 'scheduled']);
    const atA = Date.parse(a.targets[0]?.scheduledAt ?? '');
    const atB = Date.parse(b.targets[0]?.scheduledAt ?? '');
    expect(new Date(atA).getUTCHours()).toBe(8);
    expect(atB - atA).toBe(24 * 3600_000);

    // The queue view shows them in their slots.
    const view = QueueSlots.parse((await owner.get(slotsUrl(acc.b))).body);
    expect(view.upcoming[0]?.entries.map((e) => e.postId)).toEqual([first.id]);
    expect(view.upcoming[1]?.entries.map((e) => e.postId)).toEqual([second.id]);
    expect(view.upcoming[2]?.entries).toEqual([]);
    expect(view.upcoming[0]?.entries[0]).toMatchObject({
      text: 'Queued post',
      status: 'scheduled',
      recurring: false,
    });
  });

  it('two posts queued at the same moment never share a slot', async () => {
    await owner.send('PUT', slotsUrl(acc.b), { timezone: 'UTC', slots: everyDay('20:00') });
    const posts = await Promise.all([draft([acc.b]), draft([acc.b]), draft([acc.b])]);
    const results = await Promise.all(
      posts.map((p) => owner.post(`${base()}/posts/${p.id}/queue`)),
    );
    const times = results.map((r) => Post.parse(r.body).targets[0]?.scheduledAt);
    expect(new Set(times).size).toBe(3);
  });

  it('refuses, naming them, when accounts have no slots', async () => {
    await owner.send('PUT', slotsUrl(acc.b), { timezone: 'UTC', slots: [] });
    const post = await draft([acc.a, acc.b]);
    const res = await owner.post(`${base()}/posts/${post.id}/queue`);
    expect([res.status, code(res)]).toEqual([422, 'NO_QUEUE_SLOTS']);
    expect(ErrorEnvelope.parse(res.body).error.details).toEqual({ accountIds: [acc.b] });
    // Nothing was scheduled.
    const rows = await t.db.client.postTarget.findMany({ where: { postId: post.id } });
    expect(rows.map((r) => r.status)).toEqual(['pending', 'pending']);
  });

  it('needs posts:publish', async () => {
    const post = await draft([acc.a]);
    expect((await contributor.post(`${base()}/posts/${post.id}/queue`)).status).toBe(403);
  });
});
