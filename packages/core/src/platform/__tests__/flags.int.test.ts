// Feature flags (P2-B11) against Postgres: who a flag is on for, and the 30-second cache.
import { randomUUID } from 'node:crypto';

import { afterAll, describe, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createDb } from '../db';
import { bucketOf, createFlags, decide, FLAGS_CACHE_MS } from '../flags';
import { createLogger } from '../logger';

const config = loadConfig();
const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: [] });
const run = randomUUID().slice(0, 8);
const key = (name: string) => `test-${run}.${name}`;
let now = Date.UTC(2030, 0, 1);
const flags = createFlags({
  db,
  clock: { now: () => new Date(now) },
  logger: createLogger({ level: 'silent' }),
});

afterAll(async () => {
  await db.client.featureFlag.deleteMany({ where: { key: { startsWith: `test-${run}.` } } });
  await db.close();
});

describe('who a flag is on for', () => {
  it('no rules: everyone; listed workspaces; a stable share by percent', () => {
    expect(decide({}, 'k', {})).toBe(true);
    expect(decide({ workspaceIds: ['w1'] }, 'k', { workspaceId: 'w1' })).toBe(true);
    expect(decide({ workspaceIds: ['w1'] }, 'k', { workspaceId: 'w2' })).toBe(false);
    expect(decide({ workspaceIds: ['w1'] }, 'k', {})).toBe(false);
    expect(decide({ percent: 100 }, 'k', { userId: 'u1' })).toBe(true);
    expect(decide({ percent: 0 }, 'k', { workspaceId: 'w1' })).toBe(false);
    // A percent needs someone to bucket.
    expect(decide({ percent: 100 }, 'k', {})).toBe(false);
    const subjects = Array.from({ length: 2000 }, (_, i) => `w${String(i)}`);
    const share = subjects.filter((s) => decide({ percent: 25 }, 'k', { workspaceId: s })).length;
    expect(share / subjects.length).toBeGreaterThan(0.2);
    expect(share / subjects.length).toBeLessThan(0.3);
    // Raising the percent keeps everyone who was in.
    const at25 = subjects.filter((s) => bucketOf('k', s) < 25);
    expect(at25.every((s) => decide({ percent: 50 }, 'k', { workspaceId: s }))).toBe(true);
  });
});

describe('reading flags', () => {
  it('unknown or disabled: off; enabled: by its rules', async () => {
    await db.client.featureFlag.createMany({
      data: [
        { key: key('off'), enabled: false, rules: {} },
        { key: key('all'), enabled: true, rules: {} },
        { key: key('one'), enabled: true, rules: { workspaceIds: ['w1'] } },
        { key: key('bad'), enabled: true, rules: { percent: 'lots' } },
      ],
    });
    now += FLAGS_CACHE_MS;
    expect(await flags.isOn(key('missing'))).toBe(false);
    expect(await flags.isOn(key('off'))).toBe(false);
    expect(await flags.isOn(key('all'))).toBe(true);
    expect(await flags.isOn(key('one'), { workspaceId: 'w1' })).toBe(true);
    expect(await flags.isOn(key('one'), { workspaceId: 'w2' })).toBe(false);
    // Rules that don't parse turn the flag on for nobody, not everyone.
    expect(await flags.isOn(key('bad'), { workspaceId: 'w1' })).toBe(false);
  });

  it('changes show after the cache period', async () => {
    await db.client.featureFlag.create({ data: { key: key('later'), enabled: false } });
    now += FLAGS_CACHE_MS;
    expect(await flags.isOn(key('later'))).toBe(false);
    await db.client.featureFlag.update({ where: { key: key('later') }, data: { enabled: true } });
    now += FLAGS_CACHE_MS - 1;
    expect(await flags.isOn(key('later'))).toBe(false);
    now += 1;
    expect(await flags.isOn(key('later'))).toBe(true);
  });
});
