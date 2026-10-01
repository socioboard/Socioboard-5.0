import { describe, expect, it } from 'vitest';

import { slotTimes, wallClock, zonedTime } from '../time';

const iso = (d: Date) => d.toISOString();
const day = (year: number, month: number, d: number) => ({ year, month, day: d });

describe('zonedTime: a wall-clock time in a timezone as an instant', () => {
  it('ordinary days, with and without daylight saving', () => {
    expect(iso(zonedTime(day(2026, 1, 15), { hour: 9, minute: 0 }, 'Europe/Berlin'))).toBe(
      '2026-01-15T08:00:00.000Z',
    );
    expect(iso(zonedTime(day(2026, 7, 15), { hour: 9, minute: 0 }, 'Europe/Berlin'))).toBe(
      '2026-07-15T07:00:00.000Z',
    );
    expect(iso(zonedTime(day(2026, 7, 15), { hour: 9, minute: 30 }, 'Asia/Kolkata'))).toBe(
      '2026-07-15T04:00:00.000Z',
    );
    expect(iso(zonedTime(day(2026, 3, 1), { hour: 23, minute: 45 }, 'UTC'))).toBe(
      '2026-03-01T23:45:00.000Z',
    );
  });

  it('a time the clock skips moves forward by the gap', () => {
    // Berlin, 29 March 2026: 02:00 → 03:00. 02:30 becomes 03:30 local (01:30 UTC).
    const skipped = zonedTime(day(2026, 3, 29), { hour: 2, minute: 30 }, 'Europe/Berlin');
    expect(iso(skipped)).toBe('2026-03-29T01:30:00.000Z');
    expect(wallClock(skipped.getTime(), 'Europe/Berlin')).toMatchObject({ hour: 3, minute: 30 });
    // New York, 8 March 2026: 02:00 → 03:00.
    const ny = zonedTime(day(2026, 3, 8), { hour: 2, minute: 15 }, 'America/New_York');
    expect(wallClock(ny.getTime(), 'America/New_York')).toMatchObject({ hour: 3, minute: 15 });
  });

  it('a time that happens twice uses the first', () => {
    // Berlin, 25 October 2026: 03:00 → 02:00. 02:30 happens at 00:30 and 01:30 UTC.
    expect(iso(zonedTime(day(2026, 10, 25), { hour: 2, minute: 30 }, 'Europe/Berlin'))).toBe(
      '2026-10-25T00:30:00.000Z',
    );
    // New York, 1 November 2026: 02:00 → 01:00. 01:30 EDT is 05:30 UTC.
    expect(iso(zonedTime(day(2026, 11, 1), { hour: 1, minute: 30 }, 'America/New_York'))).toBe(
      '2026-11-01T05:30:00.000Z',
    );
  });

  it('half-hour daylight saving (Lord Howe Island)', () => {
    // 4 October 2026: 02:00 → 02:30. 02:15 becomes 02:45.
    const t = zonedTime(day(2026, 10, 4), { hour: 2, minute: 15 }, 'Australia/Lord_Howe');
    expect(wallClock(t.getTime(), 'Australia/Lord_Howe')).toMatchObject({ hour: 2, minute: 45 });
  });
});

describe('slotTimes: weekly slots as instants', () => {
  it('keeps 09:00 at 09:00 local across a clock change', () => {
    // Mondays 09:00 in Berlin, from 16 March 2026 (UTC+1), past 29 March (UTC+2).
    const times = slotTimes(
      [{ weekday: 1, time: '09:00' }],
      'Europe/Berlin',
      new Date('2026-03-16T00:00:00Z'),
    );
    const first = [times.next().value, times.next().value, times.next().value].map((d) =>
      d ? iso(d) : null,
    );
    expect(first).toEqual([
      '2026-03-16T08:00:00.000Z',
      '2026-03-23T08:00:00.000Z',
      '2026-03-30T07:00:00.000Z',
    ]);
  });

  it('starts after `from` and walks days on the slots’ clock', () => {
    // 23:30 UTC on a Monday is already Tuesday 05:00 in Kolkata: Tuesday's 09:00 is next.
    const slots = [
      { weekday: 1, time: '09:00' },
      { weekday: 2, time: '09:00' },
    ];
    const next = slotTimes(slots, 'Asia/Kolkata', new Date('2026-03-16T23:30:00Z')).next().value;
    expect(next && iso(next)).toBe('2026-03-17T03:30:00.000Z');
  });

  it('a skipped slot lands after an earlier one that day, and never twice', () => {
    // Sunday 29 March 2026 in Berlin: 02:30 skips to 03:30, the same instant as the 03:30 slot.
    const slots = [
      { weekday: 0, time: '03:00' },
      { weekday: 0, time: '02:30' },
      { weekday: 0, time: '03:30' },
    ];
    const times = [...slotTimes(slots, 'Europe/Berlin', new Date('2026-03-29T00:00:00Z'), 0)].map(
      iso,
    );
    expect(times).toEqual(['2026-03-29T01:00:00.000Z', '2026-03-29T01:30:00.000Z']);
  });

  it('no slots, no times', () => {
    expect([...slotTimes([], 'UTC', new Date())]).toEqual([]);
  });
});
