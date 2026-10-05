// P2-I1: the web app reports its crashes to the API, once each, capped per page load, without
// query strings, and never errors the API already answered.
import { ClientErrorReport } from '@socioboard/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '../api';
import { createErrorReporter, installErrorReporting, toReport } from '../error-reporting';

function reporter(path = '/w/halden/calendar') {
  const sent: ClientErrorReport[] = [];
  let now = 0;
  const report = createErrorReporter({
    send: (r) => sent.push(r),
    now: () => now,
    path: () => path,
  });
  return {
    sent,
    report,
    later: (ms: number) => {
      now += ms;
    },
  };
}

describe('what a report says', () => {
  it('an Error: name, message, stack and the page, valid for the contract', () => {
    const err = new TypeError("Cannot read properties of undefined (reading 'id')");
    const r = toReport('error', err, '/w/halden/calendar');
    expect(ClientErrorReport.parse(r)).toMatchObject({
      kind: 'error',
      name: 'TypeError',
      message: "Cannot read properties of undefined (reading 'id')",
      path: '/w/halden/calendar',
    });
    expect(r?.stack).toContain('TypeError');
  });

  it('the query string and hash are dropped (reset links and OAuth carry tokens there)', () => {
    expect(toReport('error', new Error('x'), '/reset-password?token=abc#t')?.path).toBe(
      '/reset-password',
    );
  });

  it('anything thrown, cut to the contract’s limits', () => {
    const r = toReport('unhandledrejection', 'x'.repeat(5000), '/');
    expect(r?.message).toHaveLength(1000);
    expect(ClientErrorReport.safeParse(r).success).toBe(true);
    const long = new Error('boom');
    long.stack = 's'.repeat(20_000);
    expect(toReport('error', long, '/')?.stack).toHaveLength(8000);
  });

  it('errors the API answered are not reported (the API logged them)', () => {
    const answered = new ApiError(404, 'POST_NOT_FOUND', 'Not found', undefined);
    expect(toReport('unhandledrejection', answered, '/')).toBeNull();
  });

  it('an empty message is nothing to report', () => {
    expect(toReport('error', '   ', '/')).toBeNull();
  });

  it('browser noise that isn’t a bug is not reported', () => {
    for (const noise of [
      'ResizeObserver loop completed with undelivered notifications.',
      'ResizeObserver loop limit exceeded',
      'Script error.',
    ]) {
      expect(toReport('error', noise, '/')).toBeNull();
    }
    expect(toReport('error', 'Script error in calendar.tsx', '/')).not.toBeNull();
  });
});

describe('how often', () => {
  it('the same error once a minute', () => {
    const r = reporter();
    r.report('error', new Error('same'));
    r.report('error', new Error('same'));
    expect(r.sent).toHaveLength(1);
    r.later(61_000);
    r.report('error', new Error('same'));
    expect(r.sent).toHaveLength(2);
  });

  it('20 reports a page load at most', () => {
    const r = reporter();
    for (let i = 0; i < 30; i++) r.report('error', new Error(`error ${String(i)}`));
    expect(r.sent).toHaveLength(20);
  });

  it('a failing sender never throws into the page', () => {
    const report = createErrorReporter({
      send: () => {
        throw new Error('network');
      },
      path: () => '/',
    });
    expect(() => {
      report('error', new Error('x'));
    }).not.toThrow();
  });
});

describe('what is listened to', () => {
  it('uncaught errors and unhandled rejections', () => {
    const report = vi.fn();
    const target = new EventTarget() as unknown as Window;
    installErrorReporting(report, target);
    const err = new Error('uncaught');
    target.dispatchEvent(Object.assign(new Event('error'), { error: err, message: 'uncaught' }));
    target.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), { reason: 'rejected', promise: null }),
    );
    expect(report.mock.calls).toEqual([
      ['error', err],
      ['unhandledrejection', 'rejected'],
    ]);
  });
});
