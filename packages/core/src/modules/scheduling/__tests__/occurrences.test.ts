import { RecurrenceRule, type RecurrenceRuleInput } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import { nextOccurrence, occurrences, occurrencesBetween, toRRule } from '../occurrences';
import { wallClock } from '../time';

const rule = (r: Partial<RecurrenceRuleInput>) =>
  RecurrenceRule.parse({ time: '09:00', timezone: 'UTC', startsOn: '2026-10-01', ...r });
const first = (r: RecurrenceRule, n: number) => {
  const out: string[] = [];
  for (const at of occurrences(r)) {
    out.push(at.toISOString().slice(0, 16));
    if (out.length === n) break;
  }
  return out;
};

describe('occurrences', () => {
  it('daily, every n days', () => {
    expect(first(rule({ frequency: 'daily', interval: 3 }), 3)).toEqual([
      '2026-10-01T09:00',
      '2026-10-04T09:00',
      '2026-10-07T09:00',
    ]);
  });

  it('weekly on chosen days, every other week (weeks start on Monday)', () => {
    // 1 October 2026 is a Thursday. Mondays and Thursdays, every 2 weeks.
    expect(first(rule({ frequency: 'weekly', weekdays: [1, 4], interval: 2 }), 4)).toEqual([
      '2026-10-01T09:00',
      '2026-10-12T09:00',
      '2026-10-15T09:00',
      '2026-10-26T09:00',
    ]);
  });

  it('monthly on a day, skipping months without it; -1 is the last day', () => {
    expect(first(rule({ frequency: 'monthly', monthDay: 31, startsOn: '2026-01-15' }), 3)).toEqual([
      '2026-01-31T09:00',
      '2026-03-31T09:00',
      '2026-05-31T09:00',
    ]);
    expect(first(rule({ frequency: 'monthly', monthDay: -1, startsOn: '2026-01-15' }), 3)).toEqual([
      '2026-01-31T09:00',
      '2026-02-28T09:00',
      '2026-03-31T09:00',
    ]);
  });

  it('ends on a date (inclusive) or after a count', () => {
    const until = rule({ frequency: 'daily', ends: { type: 'on', date: '2026-10-03' } });
    expect([...occurrences(until)]).toHaveLength(3);
    const counted = rule({ frequency: 'daily', ends: { type: 'after', count: 2 } });
    expect([...occurrences(counted)].map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2026-10-01',
      '2026-10-02',
    ]);
    // Counted from the start: past occurrences count too.
    expect(nextOccurrence(counted, new Date('2026-10-02T10:00:00Z'))).toBeNull();
  });

  it('keeps the wall-clock time across daylight saving', () => {
    const berlin = rule({
      frequency: 'weekly',
      weekdays: [1],
      timezone: 'Europe/Berlin',
      startsOn: '2026-10-19',
    });
    const times = first(berlin, 2);
    expect(times).toEqual(['2026-10-19T07:00', '2026-10-26T08:00']);
    for (const at of occurrences(berlin)) {
      expect(wallClock(at.getTime(), 'Europe/Berlin')).toMatchObject({ hour: 9, minute: 0 });
      if (at > new Date('2027-01-01')) break;
    }
  });

  it('a rule that can never fall on a day ends instead of looping forever', () => {
    // The 31st, every 12 months, from February: February never has a 31st.
    const never = rule({
      frequency: 'monthly',
      monthDay: 31,
      interval: 12,
      startsOn: '2026-02-01',
    });
    expect(nextOccurrence(never, new Date('2026-02-01T00:00:00Z'))).toBeNull();
  });

  it('jumps to a far date instead of walking from the start', () => {
    const daily = rule({ frequency: 'daily', startsOn: '2000-01-01' });
    const started = performance.now();
    const next = nextOccurrence(daily, new Date('2026-10-01T10:00:00Z'));
    expect(next?.toISOString()).toBe('2026-10-02T09:00:00.000Z');
    expect(performance.now() - started).toBeLessThan(50);
    const weekly = rule({
      frequency: 'weekly',
      weekdays: [3],
      interval: 2,
      startsOn: '2000-01-05',
    });
    // 5 January 2000 was a Wednesday; every other Wednesday since.
    const w = nextOccurrence(weekly, new Date('2026-10-01T00:00:00Z'));
    const weeks =
      (Date.parse(w?.toISOString() ?? '') - Date.parse('2000-01-05T09:00:00Z')) / (7 * 86_400_000);
    expect(weeks % 2).toBe(0);
    const monthly = rule({
      frequency: 'monthly',
      monthDay: 15,
      interval: 5,
      startsOn: '2000-01-15',
    });
    const m = nextOccurrence(monthly, new Date('2026-10-01T00:00:00Z'));
    const months = ((m?.getUTCFullYear() ?? 0) - 2000) * 12 + (m?.getUTCMonth() ?? 0);
    expect(months % 5).toBe(0);
  });

  it('within a window', () => {
    const daily = rule({ frequency: 'daily' });
    const found = occurrencesBetween(
      daily,
      new Date('2026-10-03T00:00:00Z'),
      new Date('2026-10-05T23:59:59Z'),
    );
    expect(found.map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
    ]);
  });
});

describe('toRRule', () => {
  it('writes the rule as RFC 5545', () => {
    expect(toRRule(rule({ frequency: 'weekly', weekdays: [1, 3], interval: 2 }))).toBe(
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;BYHOUR=9;BYMINUTE=0',
    );
    expect(
      toRRule(rule({ frequency: 'monthly', monthDay: -1, ends: { type: 'after', count: 6 } })),
    ).toBe('FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=-1;BYHOUR=9;BYMINUTE=0;COUNT=6');
    expect(toRRule(rule({ frequency: 'daily', ends: { type: 'on', date: '2027-01-31' } }))).toBe(
      'FREQ=DAILY;INTERVAL=1;BYHOUR=9;BYMINUTE=0;UNTIL=20270131T235959',
    );
  });
});
