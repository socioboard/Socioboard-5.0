// First-user bootstrap needs an empty install, so it runs in its own temporary database.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createDb,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  loadConfig,
  type Db,
} from '../../../platform';
import { createAuthModule } from '../index';
import { promoteFirstUser } from '../bootstrap';

const config = loadConfig();
const logger = createLogger({ level: 'silent' });
const admin = createDb({ url: config.db.url, poolSize: 1, scopedModels: [] });
const dbName = `sb_test_bootstrap_${randomUUID().slice(0, 8)}`;
const url = new URL(config.db.url);
url.pathname = `/${dbName}`;
let db: Db;

beforeAll(async () => {
  await admin.client.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
  const dbPackage = fileURLToPath(new URL('../../../../../db', import.meta.url));
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: dbPackage,
    env: { ...process.env, DATABASE_URL: url.toString() },
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  db = createDb({ url: url.toString(), poolSize: 4, scopedModels: [] });
}, 120_000);

afterAll(async () => {
  await db.close();
  await admin.client.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await admin.close();
});

const newUser = (label: string, createdAt: Date) =>
  db.client.user.create({ data: { name: label, email: `${label}@example.test`, createdAt } });

describe('promoteFirstUser', () => {
  it('makes the first real sign-up on an empty install platform admin, and nobody after', async () => {
    const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
    const { auth } = createAuthModule({
      config: { ...config, auth: { ...config.auth, breachedPasswordCheck: false } },
      db,
      kv,
      mailer: createMailer({ smtpUrl: undefined, from: 'x', logger }),
      logger,
      events: createEventBus({ logger }),
    });
    const signUp = (label: string) =>
      auth.api.signUpEmail({
        body: { name: label, email: `${label}@example.test`, password: 'a long enough password' },
      });
    await signUp('founder');
    await signUp('colleague');
    const users = await db.client.user.findMany({ orderBy: { createdAt: 'asc' } });
    expect(users.map((u) => [u.email, u.isPlatformAdmin])).toEqual([
      ['founder@example.test', true],
      ['colleague@example.test', false],
    ]);
    kv.close();
    await db.client.user.deleteMany();
  });

  it('makes exactly one admin when the first two sign-ups race', async () => {
    const first = await newUser('first', new Date('2026-01-01T00:00:00Z'));
    const second = await newUser('second', new Date('2026-01-01T00:00:01Z'));
    const results = await Promise.all([
      promoteFirstUser(db, second.id, logger),
      promoteFirstUser(db, first.id, logger),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const admins = await db.client.user.findMany({ where: { isPlatformAdmin: true } });
    expect(admins.map((a) => a.email)).toEqual(['first@example.test']);
  });

  it('never promotes later sign-ups, even if the admin flag is removed', async () => {
    await db.client.user.updateMany({ data: { isPlatformAdmin: false } });
    const late = await newUser('late', new Date('2026-06-01T00:00:00Z'));
    expect(await promoteFirstUser(db, late.id, logger)).toBe(false);
    expect(await db.client.user.count({ where: { isPlatformAdmin: true } })).toBe(0);
  });
});
