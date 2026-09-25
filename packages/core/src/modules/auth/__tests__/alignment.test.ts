// Keeps Better Auth's view of the world in line with ours: its tables must exist in our Prisma
// schema, and its workspace role rules must match the permissions map in @socioboard/contracts.
import { readFileSync } from 'node:fs';

import { can, ROLES, type Permission } from '@socioboard/contracts';
import { getAuthTables } from 'better-auth/db';
import { describe, expect, it } from 'vitest';

import {
  createDb,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  loadConfig,
} from '../../../platform';
import { createAuthModule, workspaceRoles } from '../index';

const config = loadConfig({
  DATABASE_URL: 'postgresql://u:p@localhost:1/none',
  REDIS_URL: 'redis://localhost:1',
  ENCRYPTION_KEYS: `k1:${Buffer.alloc(32, 1).toString('base64')}`,
  AUTH_SECRET: 'x'.repeat(32),
});
const logger = createLogger({ level: 'silent' });
// Nothing here connects: the Prisma client and Valkey client connect lazily.
const { auth } = createAuthModule({
  config,
  logger,
  db: createDb({ url: config.db.url, poolSize: 1, scopedModels: [] }),
  kv: createKv({ url: config.redis.url }),
  mailer: createMailer({ smtpUrl: undefined, from: 'x', logger }),
  events: createEventBus({ logger }),
});

const schema = readFileSync(
  new URL('../../../../../db/prisma/schema.prisma', import.meta.url),
  'utf8',
);
const columns = new Map(
  [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)].map(([, name, body]) => [
    (name ?? '').toLowerCase(),
    new Set([...(body ?? '').matchAll(/^\s+(\w+)\s+\S/gm)].map((m) => m[1])),
  ]),
);

describe('Better Auth alignment', () => {
  it('finds every table and column it needs in schema.prisma', () => {
    const missing: string[] = [];
    for (const table of Object.values(getAuthTables(auth.options))) {
      const cols = columns.get(table.modelName.toLowerCase());
      if (!cols) {
        missing.push(table.modelName);
        continue;
      }
      for (const [key, field] of Object.entries(table.fields)) {
        const name = field.fieldName ?? key;
        if (!cols.has(name)) missing.push(`${table.modelName}.${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('gives each role the same workspace powers as our permissions map', () => {
    const checks: [Record<string, string[]>, Permission][] = [
      [{ organization: ['update'] }, 'workspace:update'],
      [{ organization: ['delete'] }, 'workspace:delete'],
      [{ invitation: ['create'] }, 'members:manage'],
      [{ invitation: ['cancel'] }, 'members:manage'],
      [{ member: ['update'] }, 'members:manage'],
      [{ member: ['delete'] }, 'members:manage'],
    ];
    for (const role of ROLES) {
      for (const [request, permission] of checks) {
        const betterAuth = workspaceRoles[role].authorize(request).success;
        expect(betterAuth, `${role} ${JSON.stringify(request)}`).toBe(can(role, permission));
      }
    }
  });
});
