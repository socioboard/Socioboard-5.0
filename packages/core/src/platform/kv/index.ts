import { Redis } from 'ioredis';

/**
 * Small key-value store on Valkey/Redis (REDIS_URL): auth sessions cache, rate-limit counters.
 * Values are strings; callers serialize.
 */
export interface Kv {
  get(key: string): Promise<string | null>;
  /** Reads and removes a key atomically (one-time tokens). */
  getAndDelete(key: string): Promise<string | null>;
  /** `ttlSec` sets an expiry; omit it for keys that never expire. */
  set(key: string, value: string, ttlSec?: number): Promise<void>;
  delete(key: string): Promise<void>;
  /** Increments a counter, starting its expiry window on first use; returns the new count. */
  incr(key: string, windowSec: number): Promise<number>;
  close(): void;
}

export function createKv({ url, prefix = 'sb:' }: { url: string; prefix?: string }): Kv {
  const client = new Redis(url, { keyPrefix: prefix, maxRetriesPerRequest: 3, lazyConnect: true });
  return {
    get: (key) => client.get(key),
    getAndDelete: (key) => client.getdel(key),
    async set(key, value, ttlSec) {
      if (ttlSec && ttlSec > 0) await client.set(key, value, 'EX', Math.ceil(ttlSec));
      else await client.set(key, value);
    },
    async delete(key) {
      await client.del(key);
    },
    async incr(key, windowSec) {
      const [[, count]] = (await client.multi().incr(key).expire(key, windowSec, 'NX').exec()) as [
        [Error | null, number],
        [Error | null, number],
      ];
      return count;
    },
    close: () => {
      client.disconnect();
    },
  };
}
