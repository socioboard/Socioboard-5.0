import { defineRoute, ErrorEnvelope, Id, type Role } from '@socioboard/contracts';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createApiRouter,
  createErrorHandler,
  rateLimit,
  requestId,
  session,
  type AuthContext,
  type MemberContext,
} from '../http';
import type { Kv } from '../kv';
import { createLogger } from '../logger';

const WS = '01890a5d-ac96-774b-bcce-b302099a8057';
const OTHER_WS = '01890a5d-ac96-774b-bcce-b302099a8058';
const logger = createLogger({ level: 'silent' });

/** In-memory Kv for counters. */
function memoryKv(): Kv {
  const counts = new Map<string, number>();
  return {
    get: () => Promise.resolve(null),
    getAndDelete: () => Promise.resolve(null),
    set: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    incr: (key) => {
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return Promise.resolve(n);
    },
    close: () => undefined,
  };
}

// "Sessions": the x-test-user header names a user; roles per workspace below.
const users: Record<string, Record<string, Role>> = {
  owner: { [WS]: 'owner' },
  viewer: { [WS]: 'viewer' },
  outsider: {},
};
const auth = (id: string): AuthContext => ({
  user: { id, email: `${id}@x.test`, name: id, emailVerified: true, isPlatformAdmin: false },
  session: { id: `s-${id}`, activeWorkspaceId: null },
});

const Item = z.object({ id: Id, name: z.string() });
const routes = {
  health: defineRoute({
    method: 'GET',
    path: '/api/v1/ping',
    access: 'public',
    summary: 'x',
    responses: { 200: z.object({ ok: z.boolean(), signedIn: z.boolean() }) },
  }),
  me: defineRoute({
    method: 'GET',
    path: '/api/v1/who',
    access: 'user',
    summary: 'x',
    responses: { 200: z.object({ id: z.string() }) },
  }),
  read: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/items',
    access: 'posts:read',
    summary: 'x',
    params: z.object({ workspaceId: Id }),
    query: z.object({ limit: z.coerce.number().int().max(100).default(25) }),
    responses: { 200: z.object({ limit: z.number(), role: z.string() }) },
  }),
  create: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/items',
    access: 'posts:create',
    summary: 'x',
    params: z.object({ workspaceId: Id }),
    body: z.object({ name: z.string().min(1) }),
    responses: { 201: Item },
  }),
  remove: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/items/:itemId',
    access: 'posts:create',
    summary: 'x',
    params: z.object({ workspaceId: Id, itemId: Id }),
    responses: { 204: null },
  }),
  broken: defineRoute({
    method: 'GET',
    path: '/api/v1/broken',
    access: 'public',
    summary: 'x',
    responses: { 200: Item },
  }),
};

function buildApp({ limit = 1000 } = {}) {
  const api = createApiRouter({
    lookupMembership: (userId, workspaceId): Promise<MemberContext | null> => {
      const role = users[userId]?.[workspaceId];
      return Promise.resolve(role ? { workspaceId, memberId: `m-${userId}`, role } : null);
    },
  });
  api.route(routes.health, ({ auth: who }) => ({ ok: true, signedIn: who !== null }));
  api.route(routes.me, ({ auth: who }) => ({ id: who.user.id }));
  api.route(routes.read, ({ query, member }) => ({ limit: query.limit, role: member.role }));
  // Returns an extra field that must never reach the client.
  api.route(routes.create, ({ body }) => ({
    id: WS,
    name: body.name,
    passwordHash: 'secret',
  }));
  api.route(routes.remove, () => undefined);
  api.route(routes.broken, () => ({ id: 'not-a-uuid', name: 'x' }));

  const app = express();
  app.set('trust proxy', 'loopback');
  app.use('/api', requestId);
  app.use(express.json());
  app.use(
    '/api/v1',
    rateLimit({ kv: memoryKv(), name: 't', windowSec: 60, max: limit }),
    session((headers) => {
      const id = headers.get('x-test-user');
      return Promise.resolve(id ? auth(id) : null);
    }),
  );
  app.use(api.router);
  app.use(createErrorHandler(logger));
  return { app, api };
}

const { app } = buildApp();
const as = (user: string | null) => ({
  get: (p: string) => (user ? request(app).get(p).set('x-test-user', user) : request(app).get(p)),
  post: (p: string, body: object) =>
    user
      ? request(app).post(p).set('x-test-user', user).send(body)
      : request(app).post(p).send(body),
  delete: (p: string) =>
    request(app)
      .delete(p)
      .set('x-test-user', user ?? ''),
});
const code = (res: request.Response) => ErrorEnvelope.parse(res.body).error.code;

describe('access', () => {
  it('serves public routes to anyone, knowing whether they are signed in', async () => {
    expect((await as(null).get('/api/v1/ping')).body).toEqual({ ok: true, signedIn: false });
    expect((await as('owner').get('/api/v1/ping')).body).toEqual({ ok: true, signedIn: true });
  });

  it('requires a session for user routes', async () => {
    const res = await as(null).get('/api/v1/who');
    expect(res.status).toBe(401);
    expect(code(res)).toBe('UNAUTHENTICATED');
    expect((await as('owner').get('/api/v1/who')).body).toEqual({ id: 'owner' });
  });

  it('hides workspaces the caller is not a member of (404, not 403)', async () => {
    const res = await as('outsider').get(`/api/v1/workspaces/${WS}/items`);
    expect(res.status).toBe(404);
    expect(code(res)).toBe('WORKSPACE_NOT_FOUND');
    const elsewhere = await as('owner').get(`/api/v1/workspaces/${OTHER_WS}/items`);
    expect(elsewhere.status).toBe(404);
  });

  it('checks the role against the route permission', async () => {
    expect((await as('viewer').get(`/api/v1/workspaces/${WS}/items`)).body).toEqual({
      limit: 25,
      role: 'viewer',
    });
    const res = await as('viewer').post(`/api/v1/workspaces/${WS}/items`, { name: 'x' });
    expect(res.status).toBe(403);
    expect(code(res)).toBe('FORBIDDEN');
  });

  it('checks membership before validating the body', async () => {
    const res = await as('outsider').post(`/api/v1/workspaces/${WS}/items`, {});
    expect(res.status).toBe(404);
  });
});

describe('validation', () => {
  it('rejects bad params, query and body with located issues', async () => {
    const badParam = await as('owner').get('/api/v1/workspaces/not-a-uuid/items');
    expect(badParam.status).toBe(400);
    expect(ErrorEnvelope.parse(badParam.body).error.details).toMatchObject({
      issues: [{ path: ['params', 'workspaceId'] }],
    });

    const badQuery = await as('owner').get(`/api/v1/workspaces/${WS}/items?limit=500`);
    expect(badQuery.status).toBe(400);
    expect(JSON.stringify(badQuery.body)).toContain('"query","limit"');

    const badBody = await as('owner').post(`/api/v1/workspaces/${WS}/items`, { name: '' });
    expect(badBody.status).toBe(400);
    expect(JSON.stringify(badBody.body)).toContain('"body","name"');
  });

  it('coerces query strings to the declared types', async () => {
    const res = await as('owner').get(`/api/v1/workspaces/${WS}/items?limit=50`);
    expect(res.body).toEqual({ limit: 50, role: 'owner' });
  });
});

describe('responses', () => {
  it('uses the contract status and strips fields the contract does not declare', async () => {
    const res = await as('owner').post(`/api/v1/workspaces/${WS}/items`, { name: 'Launch' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: WS, name: 'Launch' });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });

  it('sends 204 with no body', async () => {
    const res = await as('owner').delete(`/api/v1/workspaces/${WS}/items/${WS}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('turns a response that breaks the contract into a 500 without leaking it', async () => {
    const res = await as(null).get('/api/v1/broken');
    expect(res.status).toBe(500);
    expect(code(res)).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('not-a-uuid');
  });

  it('refuses to mount the same route twice', () => {
    const { api } = buildApp();
    expect(() => {
      api.route(routes.health, () => ({ ok: true, signedIn: false }));
    }).toThrow(/mounted twice/);
    expect(api.mounted.size).toBe(Object.keys(routes).length);
  });
});

describe('request id and rate limit', () => {
  it('returns a request id, reusing a well-formed incoming one', async () => {
    const fresh = await as(null).get('/api/v1/ping');
    expect(fresh.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    const reused = await request(app).get('/api/v1/ping').set('X-Request-Id', 'proxy-req-12345');
    expect(reused.headers['x-request-id']).toBe('proxy-req-12345');
    const junk = await request(app).get('/api/v1/ping').set('X-Request-Id', 'bad id <script>');
    expect(junk.headers['x-request-id']).not.toBe('bad id <script>');
    // Errors carry the id too, so a user's report can be matched to the logs.
    const err = await as(null).get('/api/v1/who');
    expect(ErrorEnvelope.parse(err.body).error.requestId).toBe(err.headers['x-request-id']);
  });

  it('limits requests per IP and says when to retry', async () => {
    const { app: limited } = buildApp({ limit: 3 });
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await request(limited).get('/api/v1/ping')).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
    const last = await request(limited).get('/api/v1/ping');
    expect(Number(last.headers['retry-after'])).toBeGreaterThan(0);
    expect(last.headers['ratelimit-limit']).toBe('3');
    expect(code(last)).toBe('RATE_LIMITED');
  });
});
