// The real API app (createApiApp): wiring that only shows up when everything is put together.
import { ErrorEnvelope } from '@socioboard/contracts';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createWorkspaceAuthPort } from '../modules/auth';
import { createTestApp } from '../testing';

const t = createTestApp();
afterAll(async () => {
  await t.cleanup();
});

describe('createApiApp', () => {
  it('mounts every contract route', () => {
    expect(t.missingRoutes).toEqual([]);
  });

  it('tells the sign-in screens which options this server offers, without signing in', async () => {
    const res = await request(t.app).get('/api/v1/auth/options').set('Origin', t.config.appUrl);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      socialProviders: [
        ...(t.config.auth.google ? ['google'] : []),
        ...(t.config.auth.microsoft ? ['microsoft'] : []),
      ],
      // The test app turns verification off.
      emailVerificationRequired: false,
    });
  });

  it('reports real dependency health at /api/health', async () => {
    const res = await request(t.app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      checks: { db: 'ok', valkey: 'ok', storage: t.platform.storage ? 'ok' : 'disabled' },
    });
    expect((await request(t.app).get('/api/health/live')).status).toBe(200);
  });

  it('records sign-ups in the audit log and sends rate-limit headers', async () => {
    const u = await t.signUp('wired');
    const audit = await t.db.client.auditLog.findMany({ where: { actorUserId: u.userId } });
    expect(audit.map((a) => a.action)).toContain('user.signed_up');
    const me = await u.get('/api/v1/me');
    expect(me.headers['ratelimit-limit']).toBe(String(t.config.api.rateLimitPerMin));
    expect(me.headers['x-request-id']).toBeTruthy();
  });

  it('answers a slug taken inside Better Auth with 409 SLUG_TAKEN, not a server error', async () => {
    const u = await t.signUp('slug-race');
    const first = await u.post('/api/v1/workspaces', {
      name: t.workspaceName('one'),
      timezone: 'UTC',
    });
    const { slug } = first.body as { slug: string };
    // Skip our own pre-check, as a concurrent request would: Better Auth rejects the duplicate.
    const port = createWorkspaceAuthPort(t.authModule.auth);
    await expect(
      port.createWorkspace({
        headers: new Headers({ cookie: u.cookieHeader() }),
        name: t.workspaceName('two'),
        slug,
        timezone: 'UTC',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'SLUG_TAKEN' });
    const res = await u.post('/api/v1/workspaces', {
      name: t.workspaceName('three'),
      slug,
      timezone: 'UTC',
    });
    expect(ErrorEnvelope.parse(res.body).error.code).toBe('SLUG_TAKEN');
  });
});
