// The shared rate limiter against Valkey/Redis (`pnpm services:up`), with time moved by hand.
import { randomUUID } from 'node:crypto';

import { afterAll, describe, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createRateLimiter } from '../queue';

const config = loadConfig();
let now = Date.UTC(2026, 9, 1, 9);
const limiter = createRateLimiter({
  url: config.redis.url,
  prefix: `sb-test-${randomUUID()}:`,
  now: () => now,
});
afterAll(() => {
  limiter.close();
});

const SECOND = 1000;
const perMinute = (max: number) => ({ max, perSec: 60 });
let n = 0;
/** A fresh bucket key per test. */
const key = () => `t${String(++n)}`;

describe('rate limiter', () => {
  it('holds a moving window: the oldest use frees the next slot', async () => {
    const b = [{ key: key(), windows: [perMinute(2)] }];
    expect(await limiter.take(b, 'a')).toBe(0);
    now += 10 * SECOND;
    expect(await limiter.take(b, 'b')).toBe(0);
    now += 10 * SECOND;
    // Full until `a` (taken 20 s ago) leaves the window.
    expect(await limiter.take(b, 'c')).toBe(40 * SECOND);
    now += 40 * SECOND;
    expect(await limiter.take(b, 'c')).toBe(0);
    // Now `b` is the oldest.
    expect(await limiter.take(b, 'd')).toBe(10 * SECOND);
  });

  it('a limit of one waits out the rest of the window', async () => {
    const b = [{ key: key(), windows: [perMinute(1)] }];
    expect(await limiter.take(b, 'a')).toBe(0);
    now += SECOND;
    expect(await limiter.take(b, 'b')).toBe(59 * SECOND);
  });

  it('counts the same use once, however often it is taken', async () => {
    const b = [{ key: key(), windows: [perMinute(2)] }];
    expect(await limiter.take(b, 'a')).toBe(0);
    expect(await limiter.take(b, 'a')).toBe(0);
    expect(await limiter.take(b, 'b')).toBe(0);
    expect(await limiter.take(b, 'c')).toBeGreaterThan(0);
    // `a` again still goes: it was already counted.
    expect(await limiter.take(b, 'a')).toBe(0);
  });

  it('takes from every bucket or none, and waits for the longest', async () => {
    const account = { key: key(), windows: [perMinute(5)] };
    const app = { key: key(), windows: [perMinute(1)] };
    expect(await limiter.take([account, app], 'a')).toBe(0);
    expect(await limiter.take([account, app], 'b')).toBe(60 * SECOND);
    // `b` wasn't counted on the account: four more fit there alone.
    for (const use of ['c', 'd', 'e', 'f']) expect(await limiter.take([account], use)).toBe(0);
    expect(await limiter.take([account], 'g')).toBe(60 * SECOND);
  });

  it('checks every window of a bucket', async () => {
    const b = [{ key: key(), windows: [perMinute(10), { max: 2, perSec: 3600 }] }];
    expect(await limiter.take(b, 'a')).toBe(0);
    expect(await limiter.take(b, 'b')).toBe(0);
    expect(await limiter.take(b, 'c')).toBe(3600 * SECOND);
  });

  it('a paused bucket takes nothing until the pause ends; a shorter pause never cuts it', async () => {
    const k = key();
    const b = [{ key: k, windows: [] }];
    expect(await limiter.take(b, 'a')).toBe(0);
    await limiter.pause(k, 30 * SECOND);
    await limiter.pause(k, 5 * SECOND);
    const wait = await limiter.take(b, 'b');
    // Real Valkey time runs the pause, so allow for the test's own delay.
    expect(wait).toBeGreaterThan(25 * SECOND);
    expect(wait).toBeLessThanOrEqual(30 * SECOND);
    await limiter.pause(k, 90 * SECOND);
    expect(await limiter.take(b, 'b')).toBeGreaterThan(85 * SECOND);
    // Other buckets go on.
    expect(await limiter.take([{ key: key(), windows: [] }], 'b')).toBe(0);
    await limiter.resume(k);
    expect(await limiter.take(b, 'b')).toBe(0);
  });

  it('nothing to limit: always taken', async () => {
    expect(await limiter.take([], 'a')).toBe(0);
  });
});
