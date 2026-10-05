// P2-Q2, part 2: repeating posts through the real pipeline across clock changes. Rules are set
// through the API; the expansion (`sync`, what the hourly `recurring` job runs per rule) runs on
// fake dates before, during and after each change. Each copy must be the occurrence the real
// clock gives (clock-oracle.ts), once, with its target scheduled then and its job due then.
// Needs the dev compose's Postgres and Valkey.
import { Post } from '@socioboard/contracts';
import { createPublishingServices, scheduledJobId } from '@socioboard/core';
import { createTestApp } from '@socioboard/core/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  changesIn,
  dayAt,
  expectedInstant,
  localMs,
  STEP,
  walkDay,
  type Day,
} from './clock-oracle';

const t = createTestApp();
const MINUTE = 60_000;
const DAY = 86_400_000;

/** The expansion's clock, moved by the test. */
let now = 0;
const services = createPublishingServices(
  { ...t.platform, clock: { now: () => new Date(now) } },
  { registry: t.networks.registry },
);
const queue = t.platform.queues.get(services.publishQueue);

let owner: Awaited<ReturnType<typeof t.signUp>>;
let ws = '';
let accountId = '';

const iso = (d: Day) =>
  `${String(d.year)}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
const parse = (s: string): Day => {
  const [y, m, d] = s.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 1, day: d ?? 1 };
};
const addDays = (d: Day, n: number): Day => {
  const x = new Date(Date.UTC(d.year, d.month - 1, d.day + n));
  return { year: x.getUTCFullYear(), month: x.getUTCMonth() + 1, day: x.getUTCDate() };
};
const weekday = (d: Day) => new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();

beforeAll(async () => {
  owner = await t.signUp('dst');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('DST'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `dst-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  accountId = (
    await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network: 'facebook_page',
        externalId: `dst-page-${ws}`,
        displayName: 'Halden Coffee',
        assetTokenEnc: t.platform.crypto.encrypt('page-token'),
      },
    })
  ).id;
});

afterAll(async () => {
  await t.cleanup();
});

interface Scenario {
  name: string;
  zone: string;
  time: string;
  /** The clock-change day the expansion runs across (local date). */
  change: string;
  rule:
    | { frequency: 'daily' }
    | { frequency: 'weekly'; weekdays: number[] }
    | { frequency: 'monthly'; monthDay: number };
  /** Whether a day is one the rule falls on. */
  falls: (d: Day) => boolean;
}

/**
 * The zone's next clock change of a kind, at least 20 days ahead (so setting the rule through the
 * API, on the real clock, makes no copies yet), and a time inside its skipped or repeated stretch.
 * Found from the timezone database, so the test holds whatever year it runs in.
 */
function nextChange(zone: string, kind: 'skip' | 'repeat') {
  const from = Date.now() + 20 * DAY;
  const at = changesIn(zone, from, from + 400 * DAY).find((x) =>
    kind === 'skip'
      ? localMs(x, zone) > localMs(x - STEP, zone) + STEP
      : localMs(x, zone) < localMs(x - STEP, zone) + STEP,
  );
  if (at === undefined) throw new Error(`no ${kind} in ${zone} within 400 days`);
  const minuteOfDay = (local: number) => Math.floor((local % DAY) / MINUTE);
  const old = minuteOfDay(localMs(at - STEP, zone) + STEP);
  const fresh = minuteOfDay(localMs(at, zone));
  // The middle of the stretch, on a quarter hour: skipped [old, fresh), repeated [fresh, old).
  const [lo, hi] = kind === 'skip' ? [old, fresh] : [fresh, old];
  const mid = lo + Math.floor((hi - lo) / 2 / 15) * 15;
  const time = `${String(Math.floor(mid / 60)).padStart(2, '0')}:${String(mid % 60).padStart(2, '0')}`;
  return { change: iso(dayAt(at, zone)), time };
}

const daily = { rule: { frequency: 'daily' as const }, falls: () => true };
const skipNY = nextChange('America/New_York', 'skip');
const scenarios: Scenario[] = [
  { name: 'New York: a time the clock skips', zone: 'America/New_York', ...skipNY, ...daily },
  {
    name: 'New York: a time that happens twice',
    zone: 'America/New_York',
    ...nextChange('America/New_York', 'repeat'),
    ...daily,
  },
  {
    name: 'New York: 09:00 stays 09:00 local as the offset moves',
    zone: 'America/New_York',
    ...nextChange('America/New_York', 'repeat'),
    time: '09:00',
    ...daily,
  },
  {
    name: 'London: skipped in spring',
    zone: 'Europe/London',
    ...nextChange('Europe/London', 'skip'),
    ...daily,
  },
  {
    name: 'London: twice in autumn',
    zone: 'Europe/London',
    ...nextChange('Europe/London', 'repeat'),
    ...daily,
  },
  {
    name: 'Sydney, southern hemisphere: twice in April',
    zone: 'Australia/Sydney',
    ...nextChange('Australia/Sydney', 'repeat'),
    ...daily,
  },
  {
    name: 'Sydney: skipped in October',
    zone: 'Australia/Sydney',
    ...nextChange('Australia/Sydney', 'skip'),
    ...daily,
  },
  {
    name: 'Lord Howe Island, half-hour change: twice',
    zone: 'Australia/Lord_Howe',
    ...nextChange('Australia/Lord_Howe', 'repeat'),
    ...daily,
  },
  {
    name: 'Lord Howe Island: skipped',
    zone: 'Australia/Lord_Howe',
    ...nextChange('Australia/Lord_Howe', 'skip'),
    ...daily,
  },
  {
    name: 'Kolkata, no daylight saving: 09:00 every day',
    zone: 'Asia/Kolkata',
    time: '09:00',
    change: iso(dayAt(Date.now() + 30 * DAY, 'Asia/Kolkata')),
    ...daily,
  },
  {
    name: 'New York: weekly on the change’s weekday, at a skipped time',
    zone: 'America/New_York',
    ...skipNY,
    rule: { frequency: 'weekly', weekdays: [weekday(parse(skipNY.change))] },
    falls: (d) => weekday(d) === weekday(parse(skipNY.change)),
  },
  {
    name: 'New York: monthly on the change’s day of the month, at a skipped time',
    zone: 'America/New_York',
    ...skipNY,
    rule: { frequency: 'monthly', monthDay: parse(skipNY.change).day },
    falls: (d) => d.day === parse(skipNY.change).day,
  },
];

describe('repeating posts across a clock change', () => {
  it.each(scenarios)('$name', async (s) => {
    const change = parse(s.change);
    // Three days before the first expansion run: those occurrences are past and never made.
    const startsOn = addDays(change, -13);
    const created = await owner.post(`/api/v1/workspaces/${ws}/posts`, {
      text: `DST ${s.name}`,
      targets: [{ accountId }],
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const templateId = Post.parse(created.body).id;
    const set = await owner.send('PUT', `/api/v1/workspaces/${ws}/posts/${templateId}/recurrence`, {
      ...s.rule,
      interval: 1,
      time: s.time,
      timezone: s.zone,
      startsOn: iso(startsOn),
    });
    expect(set.status, JSON.stringify(set.body)).toBe(200);
    const rule = await t.db.client.recurringRule.findFirstOrThrow({
      where: { postId: templateId },
    });

    // The expansion runs on these days at noon UTC, from a week before the change to a week
    // after, with overlapping windows (each looks 7 days ahead), as the hourly job does.
    const runs = [-10, -8, -6, -3, -1, 0, 1, 2, 5, 9].map((n) =>
      Date.UTC(change.year, change.month - 1, change.day + n, 12),
    );
    const createdAt = new Map<number, number>();
    for (const run of runs) {
      now = run;
      const before = new Set(
        (
          await t.db.client.post.findMany({
            where: { recurringRuleId: rule.id },
            select: { occurrenceAt: true },
          })
        ).map((p) => p.occurrenceAt?.getTime()),
      );
      await services.recurrence.sync(ws, rule.id);
      for (const p of await t.db.client.post.findMany({
        where: { recurringRuleId: rule.id },
        select: { occurrenceAt: true },
      })) {
        const at = p.occurrenceAt?.getTime() ?? 0;
        if (!before.has(at)) createdAt.set(at, run);
      }
    }

    // What the real clock says: each day the rule falls on, from its start until the last run's
    // 7-day window ends, at its time (or moved forward by a skipped hour; the first of a
    // repeated one).
    const [h, m] = s.time.split(':').map(Number);
    const minutes = (h ?? 0) * 60 + (m ?? 0);
    const firstWindow = (runs[0] ?? 0) + 2 * MINUTE;
    const lastWindow = (runs.at(-1) ?? 0) + 7 * DAY;
    const expected: number[] = [];
    for (let d = startsOn; ; d = addDays(d, 1)) {
      const walk = walkDay(d, s.zone);
      const at = expectedInstant(walk, d, minutes);
      if (at > lastWindow) break;
      if (s.falls(d) && at > firstWindow) expected.push(at);
    }
    expect(expected.length).toBeGreaterThan(0);

    const copies = await t.db.client.post.findMany({
      where: { recurringRuleId: rule.id },
      include: { targets: true },
      orderBy: { occurrenceAt: 'asc' },
    });
    // Exactly those, once each.
    expect(copies.map((c) => c.occurrenceAt?.toISOString())).toEqual(
      expected.map((at) => new Date(at).toISOString()),
    );
    // On the change day itself, the copy is on that local day, at the rule's time or past a
    // skipped one.
    const onChange = copies.filter((c) => {
      const day = dayAt(c.occurrenceAt?.getTime() ?? 0, s.zone);
      return iso(day) === s.change;
    });
    if (s.falls(change)) expect(onChange).toHaveLength(1);
    for (const copy of copies) {
      const at = copy.occurrenceAt?.getTime() ?? 0;
      const [target] = copy.targets;
      // Its delivery is scheduled for the occurrence, and its job is due then (queued with the
      // delay from the run that made it).
      expect(target?.scheduledAt?.getTime()).toBe(at);
      expect(target?.status).toBe('scheduled');
      const job = await queue.getJob(scheduledJobId(target?.id ?? '', 1));
      expect(job?.data.scheduleVersion).toBe(1);
      expect(job?.opts.delay).toBe(at - (createdAt.get(at) ?? NaN));
    }
    // The rule knows its next run: the first occurrence past the last window.
    const after = await t.db.client.recurringRule.findUniqueOrThrow({ where: { id: rule.id } });
    const next = (() => {
      for (let d = startsOn; ; d = addDays(d, 1)) {
        const at = expectedInstant(walkDay(d, s.zone), d, minutes);
        if (s.falls(d) && at > lastWindow) return at;
      }
    })();
    expect(after.nextRunAt?.getTime()).toBe(next);
  });
});
