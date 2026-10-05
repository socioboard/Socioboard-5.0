import { describe, expect, it } from 'vitest';
import {
  belongsToRange,
  calendarDate,
  composeAt,
  groupEntries,
  laneTime,
  openSlots,
  scheduleProblem,
  shortcutOf,
  swipeOf,
} from '../model';
import { ENTRY, SECOND, NOW } from './fixtures';

describe('calendar on the workspace clock', () => {
  it('rejects invalid or normalized link dates, including non-leap February', () => {
    for (const date of [
      '2026-02-29',
      '2026-02-31',
      '2026-13-01',
      '0000-01-01',
      '2026-01-01T12:00:00Z',
      2026,
    ])
      expect(calendarDate(date)).toBeUndefined();
    expect(calendarDate('2028-02-29')).toBe('2028-02-29');
  });
  it('groups only the same post at the same instant; separate mode keeps accounts apart', () => {
    const later = { ...SECOND, targetId: 'later', at: '2026-10-06T10:00:00Z' };
    const differentPost = { ...SECOND, postId: 'other', targetId: 'other' };
    expect(groupEntries([later, ENTRY, SECOND, differentPost])).toEqual([
      [ENTRY, SECOND],
      [differentPost],
      [later],
    ]);
    expect(groupEntries([ENTRY, SECOND], true)).toEqual([[ENTRY], [SECOND]]);
  });
  it('retains mixed delivery states on a grouped card', () => {
    expect(groupEntries([ENTRY, { ...SECOND, status: 'failed' }])[0]).toHaveLength(2);
  });
  it('uses 09:00 in Kolkata, not the browser clock, when starting from a date', () => {
    expect(composeAt('2026-10-06', 'Asia/Kolkata', NOW).toISOString()).toBe(
      '2026-10-06T03:30:00.000Z',
    );
    expect(composeAt('2026-10-05', 'Asia/Kolkata', NOW).toISOString()).toBe(
      '2026-10-05T11:00:00.000Z',
    );
  });
  it('retains the local 09:00 across a daylight-saving boundary', () => {
    expect(composeAt('2026-03-28', 'Europe/Berlin', NOW).toISOString()).toBe(
      '2026-03-28T08:00:00.000Z',
    );
    expect(composeAt('2026-03-29', 'Europe/Berlin', NOW).toISOString()).toBe(
      '2026-03-29T07:00:00.000Z',
    );
  });
  it('enforces the same minimum and maximum lead as the API, including boundaries', () => {
    expect(scheduleProblem(new Date(NOW.getTime() + 119_999), NOW)).toBe('tooSoon');
    expect(scheduleProblem(new Date(NOW.getTime() + 120_000), NOW)).toBeNull();
    expect(scheduleProblem(new Date(NOW.getTime() + 365 * 86_400_000), NOW)).toBeNull();
    expect(scheduleProblem(new Date(NOW.getTime() + 365 * 86_400_000 + 1), NOW)).toBe('tooFar');
  });
  it('removes a moved event at the exclusive range end', () => {
    expect(belongsToRange(ENTRY.at, ENTRY.at, '2026-10-07T00:00:00Z')).toBe(true);
    expect(belongsToRange('2026-10-07T00:00:00Z', ENTRY.at, '2026-10-07T00:00:00Z')).toBe(false);
  });
});

describe('hovering a week column', () => {
  it('reads the wall-clock time on the workspace clock, snapped to the quarter hour', () => {
    // 11:15–11:30 is the 45th quarter of the day; anywhere inside it is 11:15.
    expect(laneTime('2026-10-07', (11 * 60 + 15) / 1440, 'Asia/Kolkata').toISOString()).toBe(
      '2026-10-07T05:45:00.000Z',
    );
    expect(laneTime('2026-10-07', (11 * 60 + 29) / 1440, 'Asia/Kolkata').toISOString()).toBe(
      '2026-10-07T05:45:00.000Z',
    );
    expect(laneTime('2026-10-07', 0, 'UTC').toISOString()).toBe('2026-10-07T00:00:00.000Z');
    // The bottom edge is the day's last quarter, not the next day.
    expect(laneTime('2026-10-07', 1, 'UTC').toISOString()).toBe('2026-10-07T23:45:00.000Z');
    expect(laneTime('2026-10-07', -0.1, 'UTC').toISOString()).toBe('2026-10-07T00:00:00.000Z');
  });
  it('a time skipped by the clock change moves forward, as the server does', () => {
    // Berlin, 29 March 2026: 02:00 jumps to 03:00.
    expect(laneTime('2026-03-29', (2 * 60 + 30) / 1440, 'Europe/Berlin').toISOString()).toBe(
      '2026-03-29T01:30:00.000Z',
    );
  });
});

describe('keys', () => {
  const key = (k: string, over: Partial<Parameters<typeof shortcutOf>[0]> = {}) =>
    shortcutOf({
      key: k,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      defaultPrevented: false,
      target: document.body,
      ...over,
    });
  it('arrows, T, M, W and N, in either case', () => {
    expect(key('ArrowLeft')).toBe('previous');
    expect(key('ArrowRight')).toBe('next');
    expect(key('t')).toBe('today');
    expect(key('T')).toBe('today');
    expect(key('m')).toBe('month');
    expect(key('w')).toBe('week');
    expect(key('n')).toBe('new');
    expect(key('x')).toBeNull();
    expect(key('ArrowUp')).toBeNull();
  });
  it('not with a modifier, when already used, or from a document with nothing focused', () => {
    expect(key('n', { ctrlKey: true })).toBeNull();
    expect(key('n', { metaKey: true })).toBeNull();
    expect(key('ArrowLeft', { altKey: true })).toBeNull();
    expect(key('t', { defaultPrevented: true })).toBeNull();
    expect(key('t', { target: document })).toBe('today');
  });
  it('not while typing, in a dialog, menu or list, or on a dropdown', () => {
    for (const html of [
      '<input>',
      '<textarea></textarea>',
      '<div contenteditable="true"><span></span></div>',
      '<div role="dialog"><button></button></div>',
      '<div role="listbox"><div role="option"></div></div>',
      '<button role="combobox"></button>',
      '<div role="grid"><button></button></div>',
    ]) {
      document.body.innerHTML = html;
      const deepest =
        document.body.querySelector('span, button, [role=option], input, textarea') ??
        document.body.firstElementChild;
      expect(key('n', { target: deepest }), html).toBeNull();
    }
    document.body.innerHTML = '<button></button>';
    expect(key('n', { target: document.body.firstElementChild })).toBe('new');
    document.body.innerHTML = '';
  });
});

describe('swiping the agenda', () => {
  it('sideways far enough changes period; mostly vertical is a scroll', () => {
    expect(swipeOf(-80, 10)).toBe(1);
    expect(swipeOf(90, -20)).toBe(-1);
    expect(swipeOf(-40, 0)).toBeNull();
    expect(swipeOf(-80, 70)).toBeNull();
  });
});

describe('free posting times on the calendar', () => {
  const fb = { id: 'fb', name: 'Halden Coffee' };
  const ig = { id: 'ig', name: 'halden.coffee' };
  const from = '2026-10-05T00:00:00Z';
  const to = '2026-10-12T00:00:00Z';
  it('one per instant, with every account free then; slots with a post are left out', () => {
    expect(
      openSlots(
        [
          {
            account: fb,
            upcoming: [
              { at: '2026-10-06T05:30:00.000Z', entries: [] },
              { at: '2026-10-08T05:30:00.000Z', entries: [{}] },
            ],
          },
          { account: ig, upcoming: [{ at: '2026-10-06T05:30:00Z', entries: [] }] },
        ],
        from,
        to,
        NOW,
      ),
    ).toEqual([{ at: '2026-10-06T05:30:00.000Z', accounts: [fb, ig] }]);
  });
  it('only inside the range, and not in the next 2 minutes or the past', () => {
    const at = (iso: string) => ({ at: iso, entries: [] });
    expect(
      openSlots(
        [
          {
            account: fb,
            upcoming: [
              at('2026-10-05T10:01:00.000Z'),
              at('2026-10-05T10:03:00.000Z'),
              at('2026-10-12T00:00:00.000Z'),
              at('2026-10-04T23:59:00.000Z'),
            ],
          },
        ],
        from,
        to,
        NOW,
      ).map((s) => s.at),
    ).toEqual(['2026-10-05T10:03:00.000Z']);
  });
});
