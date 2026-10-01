import { describe, expect, it } from 'vitest';

import {
  addDays,
  parseLocalDate,
  parseTime,
  toLocalDate,
  toTimeOfDay,
  wallClock,
  weekdayOf,
  zonedTime,
} from '../index';

// The daylight-saving cases are covered where the server uses them
// (packages/core/src/modules/scheduling/__tests__/time.test.ts); this checks what the browser
// relies on: the same instants, and the text forms the API takes.
describe('wall-clock time in a timezone', () => {
  it('an instant on a timezone’s clock, and back', () => {
    const at = zonedTime({ year: 2026, month: 10, day: 6 }, { hour: 9, minute: 0 }, 'Asia/Kolkata');
    expect(at.toISOString()).toBe('2026-10-06T03:30:00.000Z');
    expect(wallClock(at.getTime(), 'Asia/Kolkata')).toEqual({
      year: 2026,
      month: 10,
      day: 6,
      hour: 9,
      minute: 0,
      weekday: 2,
    });
    // The same instant is still the 5th in Los Angeles.
    expect(wallClock(at.getTime(), 'America/Los_Angeles')).toMatchObject({ day: 5, hour: 20 });
  });

  it('a skipped time moves forward by the gap; a repeated one uses the first', () => {
    // Berlin, 29 March 2026: 02:00 → 03:00. 25 October 2026: 03:00 → 02:00.
    expect(
      zonedTime(
        { year: 2026, month: 3, day: 29 },
        { hour: 2, minute: 30 },
        'Europe/Berlin',
      ).toISOString(),
    ).toBe('2026-03-29T01:30:00.000Z');
    expect(
      zonedTime(
        { year: 2026, month: 10, day: 25 },
        { hour: 2, minute: 30 },
        'Europe/Berlin',
      ).toISOString(),
    ).toBe('2026-10-25T00:30:00.000Z');
  });

  it('calendar days and times as the API’s text forms', () => {
    expect(toLocalDate({ year: 2026, month: 3, day: 9 })).toBe('2026-03-09');
    expect(toLocalDate({ year: 987, month: 12, day: 31 })).toBe('0987-12-31');
    expect(parseLocalDate('2026-03-09')).toEqual({ year: 2026, month: 3, day: 9 });
    expect(toTimeOfDay({ hour: 7, minute: 5 })).toBe('07:05');
    expect(toTimeOfDay({ hour: 23, minute: 59 })).toBe('23:59');
    expect(parseTime('07:05')).toEqual({ hour: 7, minute: 5 });
  });

  it('days add across months and years; weekdays count from Sunday', () => {
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
    expect(addDays({ year: 2028, month: 3, day: 1 }, -1)).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    expect(weekdayOf({ year: 2026, month: 10, day: 4 })).toBe(0);
    expect(weekdayOf({ year: 2026, month: 10, day: 6 })).toBe(2);
  });
});
