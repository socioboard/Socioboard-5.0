// P2-Q1 (docs/stages/phase-2.md): scheduled posts go out on time and exactly once while the api,
// the worker and Valkey are killed around their scheduled times. Real processes, real HTTP, real
// Postgres; the network is a ledger file that outlives every kill, so "exactly once" is counted at
// the network. Needs the dev compose's Postgres and Docker (for the suite's own Valkey).
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  createLogger,
  createPlatform,
  createPublishingServices,
  loadConfig,
  type Platform,
} from '@socioboard/core';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { Child, Client, freePort, ledger, until, Valkey } from './harness';
import { ledgerRegistry } from './network';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../.env', import.meta.url)));
} catch {
  // CI sets the environment itself.
}

const POSTS = 24;
const SPACING_MS = 4_000;
/** Scheduling needs 2 minutes' notice; the rest is room for the api to be killed and restarted. */
const LEAD_MS = 150_000;
/** Production reconciles every 5 minutes; the suite every 10 s, so it ends in minutes. */
const RECONCILE_MS = 10_000;
/** A post may go out this late after its time, given the crashes (a dead worker is noticed in 30-60 s). */
const MAX_LATE_MS = 3 * 60_000;
const LOST_TRACK = /lost track/i;

const run = randomUUID().slice(0, 8);
const dir = `${tmpdir()}/sb-chaos-${run}`;
const ledgerPath = `${dir}/ledger.jsonl`;
const prefix = `sb-chaos-${run}`;
const config = loadConfig();

let valkey: Valkey;
let api: Child;
let worker: Child;
let client: Client;
let platform: Platform;
let workspaceId = '';
let userId = '';
let accountId = '';

beforeAll(async () => {
  mkdirSync(dir, { recursive: true });
  valkey = new Valkey(await freePort(), run);
  valkey.start();
  await valkey.ready();
  const apiPort = await freePort();
  const env = {
    REDIS_URL: valkey.url,
    CHAOS_PREFIX: prefix,
    CHAOS_LEDGER: ledgerPath,
    CHAOS_API_PORT: String(apiPort),
    AUTH_BREACHED_PASSWORD_CHECK: 'false',
  };
  api = new Child('api.ts', env, dir, 'api listening');
  worker = new Child('worker.ts', env, dir, 'worker started');
  await Promise.all([api.start(), worker.start()]);
  client = new Client(`http://127.0.0.1:${String(apiPort)}`, config.appUrl);

  // The suite's own view of the same data, for the reconciler and the checks.
  platform = createPlatform(
    { ...config, redis: { url: valkey.url } },
    createLogger({ level: 'silent' }),
    { prefix },
  );
  const signUp = await client.call('POST', '/api/auth/sign-up/email', {
    name: 'Chaos',
    email: `chaos-${run}@example.test`,
    password: 'a long enough chaos password',
  });
  expect(signUp.status).toBe(200);
  userId = (signUp.body as { user: { id: string } }).user.id;
  const ws = await client.call('POST', '/api/v1/workspaces', {
    name: `Chaos ${run}`,
    timezone: 'UTC',
  });
  expect(ws.status).toBe(201);
  workspaceId = (ws.body as { id: string }).id;
  const login = await platform.db.client.socialConnection.create({
    data: {
      workspaceId,
      provider: 'facebook',
      externalUserId: `chaos-${run}`,
      displayName: 'Chaos',
      accessTokenEnc: platform.crypto.encrypt('chaos-user-token'),
    },
  });
  accountId = (
    await platform.db.client.socialAccount.create({
      data: {
        workspaceId,
        connectionId: login.id,
        network: 'facebook_page',
        externalId: `chaos-page-${run}`,
        displayName: 'Chaos Page',
        assetTokenEnc: platform.crypto.encrypt('chaos-page-token'),
      },
    })
  ).id;
});

afterAll(async () => {
  api.kill();
  worker.kill();
  if (workspaceId) await platform.db.client.workspace.delete({ where: { id: workspaceId } });
  if (userId) await platform.db.client.user.delete({ where: { id: userId } });
  await platform.close();
  valkey.remove();
});

it('every scheduled post goes out exactly once while the api, the worker and Valkey crash', async () => {
  const start = Date.now() + LEAD_MS;
  const posts: { id: string; text: string; at: Date }[] = [];
  const schedule = (id: string, at: Date) =>
    client.call('POST', `/api/v1/workspaces/${workspaceId}/posts/${id}/schedule`, {
      at: at.toISOString(),
    });
  const events: string[] = [];
  const note = (e: string) => events.push(`${new Date().toISOString()} ${e}`);

  // 1. Schedule, killing the api in the middle of two schedule requests: once the person tries
  //    again, once nobody does (the post may or may not have been scheduled).
  for (let i = 0; i < POSTS; i++) {
    const text = `chaos ${run} #${String(i)}`;
    const created = await client.call('POST', `/api/v1/workspaces/${workspaceId}/posts`, {
      text,
      targets: [{ accountId }],
    });
    expect(created.status).toBe(201);
    const id = (created.body as { id: string }).id;
    const at = new Date(start + i * SPACING_MS);
    posts.push({ id, text, at });
    if (i === 5 || i === 11) {
      const inFlight = schedule(id, at).catch(() => null);
      await sleep(i === 5 ? 10 : 40);
      api.kill();
      note(`api killed while scheduling #${String(i)}`);
      await inFlight;
      await api.start();
      if (i === 11) continue; // nobody tries again
    }
    const res = await schedule(id, at);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
  }

  // 2. Before the first post is due, Valkey crashes: every delayed job is gone. Only Postgres
  //    knows what's scheduled; reconcile rebuilds the jobs.
  valkey.kill();
  note('valkey killed (all jobs lost)');
  await sleep(2_000);
  valkey.restart();
  await valkey.ready();
  const { reconciler } = createPublishingServices(platform, {
    registry: ledgerRegistry(ledgerPath),
  });
  const reconciling = setInterval(() => {
    reconciler.run().catch(() => undefined);
  }, RECONCILE_MS);

  /** Each post: what the database says, and how often the network got it. */
  const verdict = async () => {
    const sent = new Map<string, number>();
    for (const s of ledger(ledgerPath)) sent.set(s.text, (sent.get(s.text) ?? 0) + 1);
    const targets = await platform.db.client.postTarget.findMany({
      where: { postId: { in: posts.map((p) => p.id) } },
    });
    const rows = posts.map((p) => {
      const t = targets.find((x) => x.postId === p.id);
      const lastError = (t?.lastError ?? null) as { message?: string } | null;
      return {
        post: p.text,
        status: t?.status,
        attempts: t?.attempts,
        sent: sent.get(p.text) ?? 0,
        lateMs: t?.publishedAt ? t.publishedAt.getTime() - p.at.getTime() : null,
        error: lastError?.message ?? null,
      };
    });
    writeFileSync(`${dir}/result.json`, JSON.stringify({ events, rows }, null, 2));
    return rows;
  };

  try {
    // 3. Around the scheduled times, one crash at a time, each recovered before the next: the
    //    api restarts, Valkey crashes while posts are going out, then the worker dies in the
    //    middle of sending, twice. (A dead worker and a lost Valkey at once leave a delivery for
    //    reconcile's 15-minute stuck rule, covered by its own tests.)
    await until('the first post to be due', () => Date.now() >= start + 4_000, LEAD_MS);
    api.kill();
    note('api killed around scheduled times');
    await api.start();

    const sentCount = () => ledger(ledgerPath).length;
    await until('send #3', () => sentCount() >= 3, 3 * 60_000);
    valkey.kill();
    note('valkey killed while sending');
    await sleep(2_000);
    valkey.restart();
    await valkey.ready();

    for (const after of [7, 15]) {
      await until(`send #${String(after + 1)}`, () => sentCount() > after, 3 * 60_000);
      // Mid-send: the network has the post, the worker hasn't recorded it.
      await sleep(300);
      worker.kill();
      note(`worker killed during send #${String(after + 1)}`);
      await sleep(3_000);
      await worker.start();
    }

    // 4. Everything settles: no target is left scheduled or publishing.
    await until(
      'every post to settle',
      async () =>
        (await platform.db.client.postTarget.count({
          where: {
            postId: { in: posts.map((p) => p.id) },
            status: { in: ['scheduled', 'publishing'] },
          },
        })) === 0,
      6 * 60_000,
    );
  } finally {
    clearInterval(reconciling);
    await verdict();
  }

  const rows = await verdict();

  // Never twice.
  expect(
    rows.filter((r) => r.sent > 1),
    `posts sent twice; details in ${dir}`,
  ).toEqual([]);
  for (const r of rows) {
    if (r.status === 'published') {
      // Published: exactly once, and on time given the crashes.
      expect(r.sent, r.post).toBe(1);
      expect(r.lateMs, r.post).toBeLessThan(MAX_LATE_MS);
    } else if (r.status === 'failed') {
      // Only a send cut off by a dead worker may stop: the network may have it, so it isn't
      // sent blindly again; it's failed for a person to check.
      expect(r.error, r.post).toMatch(LOST_TRACK);
    } else {
      // The schedule request the api died in, never retried: never scheduled, never sent.
      expect([r.status, r.sent], r.post).toEqual(['pending', 0]);
    }
  }
  // At most one stopped delivery per worker killed mid-send.
  expect(rows.filter((r) => r.status === 'failed').length).toBeLessThanOrEqual(2);
  expect(rows.filter((r) => r.status === 'published').length).toBeGreaterThanOrEqual(POSTS - 3);
  console.log(JSON.stringify({ events, rows }, null, 2));
});
