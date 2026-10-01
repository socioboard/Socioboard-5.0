import { Redis } from 'ioredis';

/** At most `max` uses in any `perSec` seconds (a moving window). */
export interface RateWindow {
  max: number;
  perSec: number;
}

/** One thing being limited (an account, an app) and its windows. */
export interface RateBucket {
  key: string;
  windows: readonly RateWindow[];
}

/**
 * Shared limits across every worker, kept in Valkey/Redis (REDIS_URL). Each bucket keeps a log of
 * recent uses per window, so a limit like "50 a day" holds over any 24 hours, not per calendar
 * day; and a bucket can be paused when the network itself asks us to slow down.
 */
export interface RateLimiter {
  /**
   * Takes one use in every bucket at once, or none. Returns 0 when taken, else how many ms until
   * one could be. `use` names this use: taking the same one again doesn't count twice.
   */
  take(buckets: readonly RateBucket[], use: string): Promise<number>;
  /** Nothing in the bucket is taken for `ms` (an existing longer pause stays). */
  pause(key: string, ms: number): Promise<void>;
  /** Ends a pause early (an admin "try now"; tests). */
  resume(key: string): Promise<void>;
  close(): void;
}

// KEYS: for each bucket, its pause key then one log key per window.
// ARGV: now (ms), use, then per bucket its window count, then per window max and length (ms).
// All checked before anything is added, so a use is taken everywhere or nowhere.
const TAKE = `
local now = tonumber(ARGV[1])
local use = ARGV[2]
local wait = 0
local k, a = 1, 3
local logs = {}
while k <= #KEYS do
  local paused = redis.call('PTTL', KEYS[k])
  if paused > wait then wait = paused end
  local n = tonumber(ARGV[a])
  k, a = k + 1, a + 1
  for _ = 1, n do
    local max, len = tonumber(ARGV[a]), tonumber(ARGV[a + 1])
    redis.call('ZREMRANGEBYSCORE', KEYS[k], '-inf', now - len)
    if not redis.call('ZSCORE', KEYS[k], use) then
      -- A log never holds more than max uses, so when full its oldest frees the next slot.
      if redis.call('ZCARD', KEYS[k]) >= max then
        local oldest = redis.call('ZRANGE', KEYS[k], 0, 0, 'WITHSCORES')
        local at = tonumber(oldest[2]) + len - now
        if at > wait then wait = at end
      end
    end
    logs[#logs + 1] = { KEYS[k], len }
    k, a = k + 1, a + 2
  end
end
if wait > 0 then return wait end
for _, log in ipairs(logs) do
  redis.call('ZADD', log[1], 'NX', now, use)
  redis.call('PEXPIRE', log[1], log[2])
end
return 0
`;

const PAUSE = `
if redis.call('PTTL', KEYS[1]) < tonumber(ARGV[1]) then
  redis.call('SET', KEYS[1], '1', 'PX', ARGV[1])
end
`;

export function createRateLimiter({
  url,
  prefix = 'sb:',
  now = Date.now,
}: {
  url: string;
  prefix?: string;
  /** Tests move time forward. */
  now?: () => number;
}): RateLimiter {
  const client = new Redis(url, { keyPrefix: prefix, maxRetriesPerRequest: 3, lazyConnect: true });
  return {
    async take(buckets, use) {
      const keys: string[] = [];
      const args: (string | number)[] = [now(), use];
      for (const b of buckets) {
        keys.push(`rate:${b.key}:paused`);
        args.push(b.windows.length);
        for (const w of b.windows) {
          keys.push(`rate:${b.key}:${String(w.max)}/${String(w.perSec)}s`);
          args.push(w.max, w.perSec * 1000);
        }
      }
      if (keys.length === 0) return 0;
      return Number(await client.eval(TAKE, keys.length, ...keys, ...args));
    },
    async pause(key, ms) {
      if (ms <= 0) return;
      await client.eval(PAUSE, 1, `rate:${key}:paused`, Math.ceil(ms));
    },
    async resume(key) {
      await client.del(`rate:${key}:paused`);
    },
    close() {
      client.disconnect();
    },
  };
}
