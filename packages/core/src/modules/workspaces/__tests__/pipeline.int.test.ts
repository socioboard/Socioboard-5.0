// The request pipeline with the real session resolver (Better Auth) and membership lookup.
import { randomUUID } from 'node:crypto';

import { defineRoute, Id } from '@socioboard/contracts';
import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createApiRouter,
  createDb,
  createErrorHandler,
  createEventBus,
  createKv,
  createLogger,
  createMailer,
  loadConfig,
  session,
} from '../../../platform';
import { createAuthModule } from '../../auth';
import { createMembershipLookup } from '../index';

const base = loadConfig();
const config = { ...base, auth: { ...base.auth, breachedPasswordCheck: false } };
const logger = createLogger({ level: 'silent' });
const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: WORKSPACE_SCOPED_MODELS });
const kv = createKv({ url: config.redis.url, prefix: `sb-test-${randomUUID()}:` });
const mailer = createMailer({ smtpUrl: undefined, from: 'x', logger });
const authModule = createAuthModule({
  config,
  db,
  kv,
  mailer,
  logger,
  events: createEventBus({ logger }),
});

const whoAmI = defineRoute({
  method: 'GET',
  path: '/api/v1/workspaces/:workspaceId/who-am-i',
  access: 'workspace:update',
  summary: 'test',
  params: z.object({ workspaceId: Id }),
  responses: {
    200: z.object({
      userId: z.string(),
      role: z.string(),
      activeWorkspaceId: z.string().nullable(),
    }),
  },
});
const api = createApiRouter({ lookupMembership: createMembershipLookup(db) });
api.route(whoAmI, ({ auth, member }) => ({
  userId: auth.user.id,
  role: member.role,
  activeWorkspaceId: auth.session.activeWorkspaceId,
}));

const app = express();
app.use(authModule.router);
app.use(express.json());
app.use('/api/v1', session(authModule.resolveSession));
app.use(api.router);
app.use(createErrorHandler(logger));

const run = randomUUID().slice(0, 8);
let n = 0;
async function signedIn(label: string) {
  const agent = request.agent(app);
  const ip = `10.77.${String(Math.floor(++n / 250))}.${String(n % 250)}`;
  const res = await agent
    .post('/api/auth/sign-up/email')
    .set('Origin', config.appUrl)
    .set('X-Forwarded-For', ip)
    .send({
      name: label,
      email: `${label}-${run}@example.test`,
      password: 'a long enough password',
    });
  expect(res.status).toBe(200);
  const cookie = res.headers['set-cookie'] as unknown as string[];
  return { agent, cookie, userId: (res.body as { user: { id: string } }).user.id };
}

let owner: Awaited<ReturnType<typeof signedIn>>;
let stranger: Awaited<ReturnType<typeof signedIn>>;
let workspaceId = '';

beforeAll(async () => {
  owner = await signedIn('owner');
  stranger = await signedIn('stranger');
  const ws = await authModule.auth.api.createOrganization({
    body: { name: 'Pipeline', slug: `pipeline-${run}`, timezone: 'UTC' },
    headers: new Headers({ cookie: owner.cookie.map((c) => c.split(';')[0]).join('; ') }),
  });
  workspaceId = ws.id;
});

afterAll(async () => {
  await db.client.workspace.deleteMany({ where: { slug: { endsWith: `-${run}` } } });
  await db.client.user.deleteMany({ where: { email: { endsWith: `-${run}@example.test` } } });
  await db.close();
  kv.close();
});

describe('request pipeline with real auth and membership', () => {
  it('lets the owner in, with the session and role resolved', async () => {
    const res = await owner.agent.get(`/api/v1/workspaces/${workspaceId}/who-am-i`);
    expect(res.status).toBe(200);
    // Creating a workspace makes it the active one; the renamed column round-trips.
    expect(res.body).toEqual({
      userId: owner.userId,
      role: 'owner',
      activeWorkspaceId: workspaceId,
    });
  });

  it('hides the workspace from a signed-in non-member and rejects anonymous calls', async () => {
    expect((await stranger.agent.get(`/api/v1/workspaces/${workspaceId}/who-am-i`)).status).toBe(
      404,
    );
    expect((await request(app).get(`/api/v1/workspaces/${workspaceId}/who-am-i`)).status).toBe(401);
  });

  it('treats a soft-deleted workspace as gone, even for its owner', async () => {
    await db.client.workspace.update({
      where: { id: workspaceId },
      data: { deletedAt: new Date() },
    });
    expect((await owner.agent.get(`/api/v1/workspaces/${workspaceId}/who-am-i`)).status).toBe(404);
    await db.client.workspace.update({ where: { id: workspaceId }, data: { deletedAt: null } });
  });
});
