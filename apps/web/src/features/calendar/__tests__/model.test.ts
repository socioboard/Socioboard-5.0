import { describe, expect, it } from 'vitest';
import { belongsToRange, calendarDate, composeAt, groupEntries, scheduleProblem } from '../model';
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
