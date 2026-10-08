import type { Post, Recurrence } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import {
  dateBounds,
  defaultEndDate,
  defaultWhen,
  hasSeveralTimes,
  initialForm,
  instantOf,
  problemOf,
  ruleOf,
  scheduledAt,
  weekdaysOf,
  whenOf,
  type ScheduleForm,
} from '../schedule';

const NOW = new Date('2026-10-05T10:07:00Z');

const form = (over: Partial<ScheduleForm> = {}): ScheduleForm => ({
  when: { date: '2026-10-06', time: '09:00' },
  repeat: 'none',
  interval: 1,
  weekdays: null,
  monthDay: 'same',
  ends: 'never',
  endDate: '',
  count: 10,
  ...over,
});

const postWith = (
  targets: { status: string; scheduledAt: string | null }[],
  status = 'scheduled',
) => ({ status, targets }) as unknown as Post;

describe('the workspace’s clock', () => {
  it('a day and time there is one instant, whatever the browser’s timezone', () => {
    expect(instantOf({ date: '2026-10-06', time: '09:00' }, 'UTC').toISOString()).toBe(
      '2026-10-06T09:00:00.000Z',
    );
    expect(instantOf({ date: '2026-10-06', time: '09:00' }, 'Asia/Kolkata').toISOString()).toBe(
      '2026-10-06T03:30:00.000Z',
    );
    // Summer time in Lisbon (+1), winter time in January (+0).
    expect(instantOf({ date: '2026-07-01', time: '09:00' }, 'Europe/Lisbon').toISOString()).toBe(
      '2026-07-01T08:00:00.000Z',
    );
    expect(instantOf({ date: '2027-01-11', time: '09:00' }, 'Europe/Lisbon').toISOString()).toBe(
      '2027-01-11T09:00:00.000Z',
    );
  });

  it('and back: an instant as that clock shows it', () => {
    expect(whenOf('2026-10-05T20:00:00.000Z', 'Asia/Kolkata')).toEqual({
      date: '2026-10-06',
      time: '01:30',
    });
  });

  it('a time the clocks skip moves forward by the gap, as the server does', () => {
    // 29 March 2026 in Lisbon: 01:00 jumps to 02:00.
    const at = instantOf({ date: '2026-03-29', time: '01:30' }, 'Europe/Lisbon');
    expect(whenOf(at, 'Europe/Lisbon')).toEqual({ date: '2026-03-29', time: '02:30' });
  });
});

describe('what the dialog opens on', () => {
  it('keeps a calendar proposal in the workspace timezone, with a saved schedule taking priority', () => {
    const input = {
      initialAt: '2026-10-07T03:30:00Z',
      post: undefined,
      recurrence: null,
      review: { needed: false, latest: null },
      now: NOW,
      timeZone: 'Asia/Kolkata',
    };
    expect(initialForm(input).when).toEqual({ date: '2026-10-07', time: '09:00' });
    expect(
      initialForm({
        ...input,
        post: postWith([{ status: 'scheduled', scheduledAt: '2026-10-09T08:30:00Z' }]),
      }).when,
    ).toEqual({ date: '2026-10-09', time: '14:00' });
  });
  it('a proposed time that has passed is ignored: it opens an hour from now instead', () => {
    expect(
      initialForm({
        initialAt: '2026-10-05T09:00:00Z',
        post: undefined,
        recurrence: null,
        now: NOW,
        timeZone: 'UTC',
      }).when,
    ).toEqual(defaultWhen(NOW, 'UTC'));
  });
  it('an hour from now, on the next quarter of an hour', () => {
    expect(defaultWhen(NOW, 'UTC')).toEqual({ date: '2026-10-05', time: '11:15' });
    expect(defaultWhen(new Date('2026-10-05T10:00:00Z'), 'UTC')).toEqual({
      date: '2026-10-05',
      time: '11:00',
    });
    // Late in the evening, that's tomorrow on the workspace's clock.
    expect(defaultWhen(new Date('2026-10-05T18:00:00Z'), 'Asia/Kolkata')).toEqual({
      date: '2026-10-06',
      time: '00:30',
    });
  });

  it('days from today to a year ahead, on the workspace’s clock', () => {
    expect(dateBounds(new Date('2026-10-05T20:00:00Z'), 'Asia/Kolkata')).toEqual({
      min: '2026-10-06',
      max: '2027-10-06',
    });
  });

  it('a scheduled post starts from its time; one that repeats, from its rule', () => {
    const scheduled = postWith([{ status: 'scheduled', scheduledAt: '2026-10-09T14:30:00.000Z' }]);
    expect(
      initialForm({ post: scheduled, recurrence: null, now: NOW, timeZone: 'UTC' }),
    ).toMatchObject({ when: { date: '2026-10-09', time: '14:30' }, repeat: 'none' });

    const recurrence: Recurrence = {
      active: true,
      nextRunAt: '2026-10-12T09:00:00.000Z',
      rule: {
        frequency: 'monthly',
        interval: 2,
        monthDay: -1,
        time: '09:00',
        timezone: 'UTC',
        startsOn: '2026-09-01',
        ends: { type: 'after', count: 6 },
      },
    };
    expect(initialForm({ post: undefined, recurrence, now: NOW, timeZone: 'UTC' })).toMatchObject({
      when: { date: '2026-09-01', time: '09:00' },
      repeat: 'monthly',
      interval: 2,
      monthDay: 'last',
      ends: 'after',
      count: 6,
    });
    // A rule that was stopped doesn't count.
    expect(
      initialForm({
        post: undefined,
        recurrence: { ...recurrence, active: false },
        now: NOW,
        timeZone: 'UTC',
      }).repeat,
    ).toBe('none');
  });
});

describe('a post’s schedule', () => {
  it('is its scheduled accounts’ time: the earliest when they differ', () => {
    const post = postWith([
      { status: 'scheduled', scheduledAt: '2026-10-09T14:30:00.000Z' },
      { status: 'scheduled', scheduledAt: '2026-10-08T14:30:00.000Z' },
      { status: 'cancelled', scheduledAt: '2026-10-01T14:30:00.000Z' },
    ]);
    expect(scheduledAt(post)).toBe('2026-10-08T14:30:00.000Z');
    expect(hasSeveralTimes(post)).toBe(true);
    expect(hasSeveralTimes(postWith([{ status: 'scheduled', scheduledAt: 'x' }]))).toBe(false);
    expect(scheduledAt(postWith([{ status: 'pending', scheduledAt: null }]))).toBeNull();
    expect(scheduledAt(undefined)).toBeNull();
  });
});

describe('what stops the form', () => {
  it('a one-time schedule must be 2 minutes to a year ahead', () => {
    const at = (iso: string) => form({ when: whenOf(iso, 'UTC') });
    expect(problemOf(at('2026-10-05T10:08:00Z'), NOW, 'UTC')).toBe('tooSoon');
    expect(problemOf(at('2026-10-05T10:09:00Z'), NOW, 'UTC')).toBeNull();
    expect(problemOf(at('2027-10-05T10:07:00Z'), NOW, 'UTC')).toBeNull();
    expect(problemOf(at('2027-10-05T10:08:00Z'), NOW, 'UTC')).toBe('tooFar');
  });

  it('a repeating post may start at a time already past: its next date is the first', () => {
    expect(
      problemOf(form({ when: { date: '2026-10-05', time: '08:00' }, repeat: 'daily' }), NOW, 'UTC'),
    ).toBeNull();
  });

  it('its end must be whole: a date on or after the start, or 1 to 365 times', () => {
    const repeat = (over: Partial<ScheduleForm>) =>
      problemOf(form({ repeat: 'weekly', ...over }), NOW, 'UTC');
    expect(repeat({ ends: 'on', endDate: '' })).toBe('endDateMissing');
    expect(repeat({ ends: 'on', endDate: '2026-10-05' })).toBe('endsBeforeStart');
    expect(repeat({ ends: 'on', endDate: '2026-10-06' })).toBeNull();
    expect(repeat({ ends: 'after', count: 0 })).toBe('count');
    expect(repeat({ ends: 'after', count: 366 })).toBe('count');
    expect(repeat({ ends: 'after', count: 2.5 })).toBe('count');
    expect(repeat({ ends: 'after', count: Number.NaN })).toBe('count');
    expect(repeat({ ends: 'after', count: 365 })).toBeNull();
    // An end that isn't used isn't checked.
    expect(repeat({ ends: 'never', endDate: '2020-01-01', count: 0 })).toBeNull();
  });
});

describe('the rule sent to the API', () => {
  it('daily: no weekdays or month day', () => {
    expect(ruleOf(form({ repeat: 'daily', interval: 3 }), 'Europe/Lisbon')).toEqual({
      frequency: 'daily',
      interval: 3,
      time: '09:00',
      timezone: 'Europe/Lisbon',
      startsOn: '2026-10-06',
      ends: { type: 'never' },
    });
  });

  it('weekly: the chosen day’s weekday until others are picked', () => {
    // 6 October 2026 is a Tuesday.
    expect(weekdaysOf(form({ repeat: 'weekly' }))).toEqual([2]);
    expect(ruleOf(form({ repeat: 'weekly' }), 'UTC')).toMatchObject({ weekdays: [2] });
    expect(ruleOf(form({ repeat: 'weekly', weekdays: [1, 4] }), 'UTC')).toMatchObject({
      frequency: 'weekly',
      weekdays: [1, 4],
    });
    expect(ruleOf(form({ repeat: 'weekly' }), 'UTC')).not.toHaveProperty('monthDay');
  });

  it('monthly: the chosen day’s number, or -1 for the last day', () => {
    expect(ruleOf(form({ repeat: 'monthly' }), 'UTC')).toMatchObject({ monthDay: 6 });
    expect(ruleOf(form({ repeat: 'monthly', monthDay: 'last' }), 'UTC')).toMatchObject({
      monthDay: -1,
    });
    expect(ruleOf(form({ repeat: 'monthly' }), 'UTC')).not.toHaveProperty('weekdays');
  });

  it('its end: a date or a number of times', () => {
    expect(
      ruleOf(form({ repeat: 'daily', ends: 'on', endDate: '2026-12-31' }), 'UTC').ends,
    ).toEqual({ type: 'on', date: '2026-12-31' });
    expect(ruleOf(form({ repeat: 'daily', ends: 'after', count: 5 }), 'UTC').ends).toEqual({
      type: 'after',
      count: 5,
    });
  });

  it('“ends on” starts a month after the chosen day', () => {
    expect(defaultEndDate(form())).toBe('2026-11-05');
  });

  it('a form that doesn’t repeat has no rule', () => {
    expect(() => ruleOf(form(), 'UTC')).toThrow();
  });
});
