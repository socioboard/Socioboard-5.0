// P2-Q2, part 1 (docs/backend/modules/scheduling.md, Rules): every clock change in every timezone
// in 2026–27, every quarter hour of the days it touches. Each wall-clock time must land where the
// walk of the real clock says (clock-oracle.ts): its first instant if the clock shows it, else
// moved forward by the gap. The same for daily repeating rules and weekly posting times across
// each change: one per day, in order, never two, never a day missed.
import { zonedTime } from '@socioboard/contracts';
import { occurrences, slotTimes } from '@socioboard/core';
import { describe, expect, it } from 'vitest';

import {
  changesIn,
  dayAt,
  expectedInstant,
  localMs,
  STEP,
  walkDay,
  type Day,
} from './clock-oracle';

const FROM = Date.UTC(2026, 0, 1);
const TO = Date.UTC(2028, 0, 1);
const QUARTERS = Array.from({ length: 96 }, (_, i) => i * 15);

const iso = (d: Day) =>
  `${String(d.year)}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const addDays = (d: Day, n: number): Day => {
  const x = new Date(Date.UTC(d.year, d.month - 1, d.day + n));
  return { year: x.getUTCFullYear(), month: x.getUTCMonth() + 1, day: x.getUTCDate() };
};

/** Every timezone the runtime knows, with the days a clock change touches in it. */
const changes = Intl.supportedValuesOf('timeZone').flatMap((zone) =>
  changesIn(zone, FROM, TO).map((at) => {
    // The day before the jump and the day after it (the same day, unless it's at midnight).
    const days = [dayAt(at - 60_000, zone), dayAt(at, zone)];
    const unique = days.filter((d, i) => days.findIndex((x) => iso(x) === iso(d)) === i);
    return { zone, at, days: unique };
  }),
);

describe('the clock changes found', () => {
  it('are many, and include the well-known ones', () => {
    const has = (zone: string, day: string) =>
      changes.some((c) => c.zone === zone && c.days.some((d) => iso(d) === day));
    expect(changes.length).toBeGreaterThan(200);
    expect(has('America/New_York', '2027-03-14')).toBe(true); // spring forward
    expect(has('America/New_York', '2026-11-01')).toBe(true); // fall back
    expect(has('Europe/London', '2026-10-25')).toBe(true);
    expect(has('Australia/Sydney', '2027-04-04')).toBe(true); // southern hemisphere
    expect(has('Australia/Lord_Howe', '2027-10-03')).toBe(true); // half an hour
    expect(changes.some((c) => c.zone === 'Asia/Kolkata')).toBe(false); // none
  });
});

describe('zonedTime on every clock-change day', () => {
  it('each quarter hour lands where the real clock says', () => {
    const wrong: string[] = [];
    let checked = 0;
    for (const c of changes) {
      for (const day of c.days) {
        const walk = walkDay(day, c.zone);
        for (const m of QUARTERS) {
          const got = zonedTime(
            day,
            { hour: Math.floor(m / 60), minute: m % 60 },
            c.zone,
          ).getTime();
          const want = expectedInstant(walk, day, m);
          checked++;
          if (got !== want) {
            wrong.push(
              `${c.zone} ${iso(day)} ${hhmm(m)}: ${new Date(got).toISOString()}, expected ${new Date(want).toISOString()}`,
            );
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(40_000);
    expect(wrong.slice(0, 20)).toEqual([]);
  });
});

describe('repeating rules and posting times across every change', () => {
  /** Walks are the slow part: one per zone and day. */
  const walks = new Map<string, ReturnType<typeof walkDay>>();
  const expected = (day: Day, zone: string, minutes: number) => {
    const key = `${zone} ${iso(day)}`;
    let walk = walks.get(key);
    if (!walk) {
      walk = walkDay(day, zone);
      walks.set(key, walk);
    }
    return expectedInstant(walk, day, minutes);
  };
  /**
   * Midnight, 09:00, and every quarter hour within 90 minutes of the jump on either clock: the
   * skipped or repeated times, wherever a zone puts its change (02:00, midnight, 03:00…).
   */
  const timesFor = (c: (typeof changes)[number]) => {
    const minuteOfDay = (local: number) => Math.floor((local % 86_400_000) / 60_000);
    const before = minuteOfDay(localMs(c.at - STEP, c.zone) + STEP);
    const after = minuteOfDay(localMs(c.at, c.zone));
    const lo = Math.min(before, after) - 90;
    const hi = Math.max(before, after) + 90;
    return [...new Set([0, 9 * 60, ...QUARTERS.filter((m) => m >= lo && m <= hi)])];
  };

  it('a daily rule: one occurrence a day, in order, each where the clock says', () => {
    const wrong: string[] = [];
    for (const c of changes) {
      const first = addDays(c.days[0] ?? dayAt(c.at, c.zone), -3);
      for (const m of timesFor(c)) {
        const rule = {
          frequency: 'daily' as const,
          interval: 1,
          time: hhmm(m),
          timezone: c.zone,
          startsOn: iso(first),
          ends: { type: 'after' as const, count: 7 },
        };
        const got = [...occurrences(rule)].map((d) => d.getTime());
        const want = Array.from({ length: 7 }, (_, i) => {
          const day = addDays(first, i);
          return expected(day, c.zone, m);
        });
        if (got.join() !== want.join()) wrong.push(`${c.zone} ${iso(first)} daily ${hhmm(m)}`);
        if (got.some((t, i) => i > 0 && t <= (got[i - 1] ?? 0))) {
          wrong.push(`${c.zone} ${iso(first)} daily ${hhmm(m)}: not in order`);
        }
      }
    }
    expect(wrong.slice(0, 20)).toEqual([]);
  });

  it('weekly posting times every day: one a day, in order, each where the clock says', () => {
    const wrong: string[] = [];
    for (const c of changes) {
      const first = addDays(c.days[0] ?? dayAt(c.at, c.zone), -3);
      for (const m of timesFor(c)) {
        const slots = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, time: hhmm(m) }));
        const from = new Date(expected(first, c.zone, 0));
        const got: number[] = [];
        for (const at of slotTimes(slots, c.zone, from)) {
          got.push(at.getTime());
          if (got.length === 7) break;
        }
        const want = Array.from({ length: 7 }, (_, i) => {
          const day = addDays(first, i);
          return expected(day, c.zone, m);
        });
        if (got.join() !== want.join()) wrong.push(`${c.zone} ${iso(first)} slots ${hhmm(m)}`);
      }
    }
    expect(wrong.slice(0, 20)).toEqual([]);
  });
});
