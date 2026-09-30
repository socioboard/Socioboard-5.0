import { describe, expect, it } from 'vitest';

import {
  apiRoutes,
  CalendarQuery,
  PutQueueSlotsBody,
  RecurrenceRule,
  RescheduleTargetBody,
  SchedulePostBody,
  TimeOfDay,
  type RouteDefinition,
} from '../index';

const A = '01890a5d-ac96-774b-bcce-b302099a8057';
const B = '01890a5d-ac96-774b-bcce-b302099a8058';
const AT = '2026-10-05T09:30:00.000Z';

describe('schedule', () => {
  it('takes one time, with optional per-target times', () => {
    expect(SchedulePostBody.parse({ at: AT })).toEqual({ at: AT, targets: [] });
    expect(SchedulePostBody.safeParse({ at: AT, targets: [{ targetId: A, at: AT }] }).success).toBe(
      true,
    );
  });

  it('refuses a target given twice, and times that are not UTC ISO', () => {
    const twice = { at: AT, targets: [A, A].map((targetId) => ({ targetId, at: AT })) };
    expect(SchedulePostBody.safeParse(twice).success).toBe(false);
    expect(SchedulePostBody.safeParse({ at: '2026-10-05 09:30' }).success).toBe(false);
    expect(SchedulePostBody.safeParse({ at: '2026-10-05T09:30:00+05:30' }).success).toBe(false);
  });

  it('a reschedule says where the target was, so a stale drag is refused', () => {
    expect(RescheduleTargetBody.safeParse({ at: AT }).success).toBe(false);
    expect(RescheduleTargetBody.safeParse({ at: AT, previousAt: AT }).success).toBe(true);
  });
});

describe('recurrence', () => {
  const base = { time: '09:00', timezone: 'Asia/Kolkata', startsOn: '2026-10-01' };

  it('daily needs nothing more and never ends by default', () => {
    expect(RecurrenceRule.parse({ ...base, frequency: 'daily' })).toEqual({
      ...base,
      frequency: 'daily',
      interval: 1,
      ends: { type: 'never' },
    });
  });

  it('weekly needs weekdays (sorted, no repeats); monthly needs a day of the month', () => {
    const weekly = RecurrenceRule.parse({ ...base, frequency: 'weekly', weekdays: [5, 1, 3] });
    expect(weekly.weekdays).toEqual([1, 3, 5]);
    expect(RecurrenceRule.safeParse({ ...base, frequency: 'weekly' }).success).toBe(false);
    expect(
      RecurrenceRule.safeParse({ ...base, frequency: 'weekly', weekdays: [1, 1] }).success,
    ).toBe(false);
    expect(RecurrenceRule.safeParse({ ...base, frequency: 'monthly', monthDay: -1 }).success).toBe(
      true,
    );
    expect(RecurrenceRule.safeParse({ ...base, frequency: 'monthly' }).success).toBe(false);
    for (const monthDay of [0, 32, -2]) {
      expect(
        RecurrenceRule.safeParse({ ...base, frequency: 'monthly', monthDay }).success,
        String(monthDay),
      ).toBe(false);
    }
  });

  it('refuses fields that do not belong to the frequency', () => {
    expect(RecurrenceRule.safeParse({ ...base, frequency: 'daily', weekdays: [1] }).success).toBe(
      false,
    );
    expect(
      RecurrenceRule.safeParse({ ...base, frequency: 'weekly', weekdays: [1], monthDay: 3 })
        .success,
    ).toBe(false);
  });

  it('checks the end, the time and the timezone', () => {
    const daily = { ...base, frequency: 'daily' };
    expect(
      RecurrenceRule.safeParse({ ...daily, ends: { type: 'on', date: '2026-09-30' } }).success,
    ).toBe(false);
    expect(
      RecurrenceRule.safeParse({ ...daily, ends: { type: 'on', date: '2026-10-01' } }).success,
    ).toBe(true);
    expect(RecurrenceRule.safeParse({ ...daily, ends: { type: 'after', count: 0 } }).success).toBe(
      false,
    );
    expect(RecurrenceRule.safeParse({ ...daily, interval: 13 }).success).toBe(false);
    expect(RecurrenceRule.safeParse({ ...daily, timezone: 'Mars/Olympus' }).success).toBe(false);
    for (const time of ['9:00', '24:00', '09:60', '09:00:00']) {
      expect(TimeOfDay.safeParse(time).success, time).toBe(false);
    }
  });
});

describe('calendar', () => {
  const range = { from: '2026-10-01T00:00:00.000Z', to: '2026-11-01T00:00:00.000Z' };

  it('reads repeated query params as lists', () => {
    expect(CalendarQuery.parse({ ...range, accountId: A }).accountId).toEqual([A]);
    expect(CalendarQuery.parse({ ...range, accountId: [A, B] }).accountId).toEqual([A, B]);
    expect(CalendarQuery.parse({ ...range, status: 'scheduled' }).status).toEqual(['scheduled']);
  });

  it('needs `to` after `from`, at most 62 days apart', () => {
    expect(CalendarQuery.safeParse({ from: range.to, to: range.from }).success).toBe(false);
    expect(CalendarQuery.safeParse({ from: range.from, to: range.from }).success).toBe(false);
    expect(
      CalendarQuery.safeParse({ from: range.from, to: '2026-12-02T00:00:00.000Z' }).success,
    ).toBe(true);
    expect(
      CalendarQuery.safeParse({ from: range.from, to: '2026-12-02T00:00:00.001Z' }).success,
    ).toBe(false);
  });
});

describe('queue slots', () => {
  it('replaces all slots in one timezone; the same slot twice is refused', () => {
    const slot = { weekday: 1, time: '09:00' };
    expect(PutQueueSlotsBody.safeParse({ timezone: 'UTC', slots: [] }).success).toBe(true);
    expect(PutQueueSlotsBody.safeParse({ timezone: 'UTC', slots: [slot] }).success).toBe(true);
    expect(PutQueueSlotsBody.safeParse({ timezone: 'UTC', slots: [slot, slot] }).success).toBe(
      false,
    );
    expect(
      PutQueueSlotsBody.safeParse({ timezone: 'UTC', slots: [{ weekday: 7, time: '09:00' }] })
        .success,
    ).toBe(false);
  });
});

describe('scheduling routes', () => {
  const routes = Object.values(apiRoutes.scheduling as Record<string, RouteDefinition>);

  it('changing a schedule needs posts:publish; reading needs calendar:read', () => {
    for (const r of routes) {
      const expected =
        r.method === 'GET'
          ? 'calendar:read'
          : r.path.endsWith('/queue-slots')
            ? 'accounts:manage'
            : 'posts:publish';
      expect(r.access, `${r.method} ${r.path}`).toBe(expected);
    }
  });
});
