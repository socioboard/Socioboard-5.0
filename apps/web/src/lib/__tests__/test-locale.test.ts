// The test setup pins the default locale (vitest.setup.ts), so date and number expectations hold on
// any machine.
import { describe, expect, it } from 'vitest';

import { formatDate } from '../format';
import { formatZoned } from '../time';

describe('the tests’ locale', () => {
  it('formats as an en-US browser does, whatever the machine is set to', () => {
    expect(new Intl.DateTimeFormat().resolvedOptions().locale).toBe('en-US');
    expect(formatDate('2026-09-28T10:00:00.000Z')).toBe('Sep 28, 2026');
    expect(formatZoned('2026-09-28T10:00:00.000Z', 'UTC', 'day')).toMatch(/Sep 28|Monday/);
    // An explicit locale still wins.
    expect(
      new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date('2026-09-28')),
    ).toBe('Sept');
  });
});
