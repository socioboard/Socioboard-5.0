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
  /** Appends to a list, (re)setting its expiry. */
  listPush(key: string, value: string, ttlSec: number): Promise<void>;
  /** The whole list, oldest first; empty when there is none. */
  listRange(key: string): Promise<string[]>;
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
      const results = await client.multi().incr(key).expire(key, windowSec, 'NX').exec();
      const [incrResult] = results ?? [];
      if (!incrResult) throw new Error(`kv.incr(${key}): transaction was aborted`);
      const [err, count] = incrResult;
      if (err) throw err;
      return Number(count);
    },
    async listPush(key, value, ttlSec) {
      await client.multi().rpush(key, value).expire(key, Math.ceil(ttlSec)).exec();
    },
    listRange: (key) => client.lrange(key, 0, -1),
    close: () => {
      client.disconnect();
    },
  };
}
