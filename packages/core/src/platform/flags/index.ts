import { createHash } from 'node:crypto';

import { z } from 'zod';

import type { Clock } from '../clock';
import type { Db } from '../db';
import type { Logger } from '../logger';

/** Who a flag is on for when enabled (FeatureFlag.rules); `{}` means everyone. */
const FlagRules = z
  .object({
    workspaceIds: z.array(z.string()).optional(),
    percent: z.number().min(0).max(100).optional(),
  })
  .catch({ workspaceIds: [] });
type FlagRules = z.infer<typeof FlagRules>;

/** Who is asking: a flag can be on for some workspaces, or a share of them (or of users). */
export interface FlagContext {
  workspaceId?: string | undefined;
  userId?: string | undefined;
}

export interface Flags {
  /**
   * Whether `key` is on for this context. Off when the flag doesn't exist or is disabled. When
   * enabled: on for everyone with no rules; else on for the listed workspaces, and for `percent`
   * of workspaces (or users, without one), each always landing in the same bucket.
   */
  isOn(key: string, ctx?: FlagContext): Promise<boolean>;
}

/** Flags are read from Postgres at most this often per process (platform.md). */
export const FLAGS_CACHE_MS = 30_000;

/** 0–99, stable for a flag and a subject, so raising `percent` only ever adds subjects. */
export function bucketOf(key: string, subject: string): number {
  return createHash('sha256').update(`${key}:${subject}`).digest().readUInt32BE(0) % 100;
}

export function decide(rules: FlagRules, key: string, ctx: FlagContext): boolean {
  const { workspaceIds, percent } = rules;
  if (workspaceIds === undefined && percent === undefined) return true;
  if (ctx.workspaceId && workspaceIds?.includes(ctx.workspaceId)) return true;
  const subject = ctx.workspaceId ?? ctx.userId;
  return percent !== undefined && subject !== undefined && bucketOf(key, subject) < percent;
}

/** `platform/flags`: FeatureFlag rows, cached for 30 s; a failed read keeps the last ones. */
export function createFlags({
  db,
  clock,
  logger,
}: {
  db: Db;
  clock: Clock;
  logger: Logger;
}): Flags {
  let cache: Map<string, FlagRules | null> | null = null;
  let loadedAt = 0;
  let loading: Promise<void> | null = null;

  async function load() {
    try {
      const rows = await db.client.featureFlag.findMany({
        select: { key: true, enabled: true, rules: true },
      });
      // Disabled flags are kept as null: off whatever the rules say.
      cache = new Map(rows.map((r) => [r.key, r.enabled ? FlagRules.parse(r.rules) : null]));
      loadedAt = clock.now().getTime();
    } catch (err) {
      logger.warn({ err }, 'reading feature flags failed; using the last ones');
      // Tried again after the cache period, not on every call while the database is down.
      cache ??= new Map();
      loadedAt = clock.now().getTime();
    }
  }

  return {
    async isOn(key, ctx = {}) {
      if (!cache || clock.now().getTime() - loadedAt >= FLAGS_CACHE_MS) {
        loading ??= load().finally(() => {
          loading = null;
        });
        await loading;
      }
      const rules = cache?.get(key);
      return rules ? decide(rules, key, ctx) : false;
    },
  };
}
