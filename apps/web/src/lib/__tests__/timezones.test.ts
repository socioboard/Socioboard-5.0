import { describe, expect, it } from 'vitest';

import { timezoneOptions } from '../timezones';

// A fixed winter date, so offsets don't move with daylight saving time.
const JANUARY = new Date('2026-01-15T12:00:00Z');

describe('timezoneOptions', () => {
  const options = timezoneOptions(['Asia/Calcutta'], JANUARY);
  const find = (value: string) => options.find((o) => o.value === value);

  it('lists every zone the browser knows, plus UTC and the zones asked for', () => {
    expect(options.length).toBeGreaterThan(300);
    expect(find('UTC')).toMatchObject({ label: 'UTC', hint: 'GMT+0' });
    expect(find('Asia/Calcutta')).toBeDefined();
    expect(new Set(options.map((o) => o.value)).size).toBe(options.length);
  });

  it('labels by city with today’s name, and searches by region and long name', () => {
    expect(find('Asia/Calcutta')).toMatchObject({ label: 'Kolkata', hint: 'GMT+5:30' });
    expect(find('Asia/Calcutta')?.keywords).toMatch(/Calcutta/);
    expect(find('Asia/Calcutta')?.keywords).toMatch(/India Standard Time/);
    expect(find('America/New_York')).toMatchObject({ label: 'New York', hint: 'GMT-5' });
    expect(find('America/New_York')?.keywords).toMatch(/America/);
  });

  it('sorts west to east', () => {
    const index = (value: string) => options.findIndex((o) => o.value === value);
    expect(index('America/New_York')).toBeLessThan(index('UTC'));
    expect(index('UTC')).toBeLessThan(index('Asia/Calcutta'));
    expect(index('Asia/Calcutta')).toBeLessThan(index('Asia/Tokyo'));
  });

  it('skips an ID the browser can’t use', () => {
    expect(
      timezoneOptions(['Mars/Olympus_Mons'], JANUARY).some((o) => o.value.startsWith('Mars')),
    ).toBe(false);
  });
});
