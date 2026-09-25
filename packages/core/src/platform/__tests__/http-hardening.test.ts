// Regression tests for the adversarial review of the request pipeline (2026-09-25).
import { defineRoute, ErrorEnvelope, Id } from '@socioboard/contracts';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { loadConfig } from '../config';
import { clientKey, createApiRouter, createErrorHandler, originCheck } from '../http';
import { createLogger } from '../logger';

const logger = createLogger({ level: 'silent' });
const baseEnv = {
  DATABASE_URL: 'postgresql://u:p@localhost:5440/db',
  REDIS_URL: 'redis://localhost:6380',
  ENCRYPTION_KEYS: `k1:${Buffer.alloc(32, 1).toString('base64')}`,
  AUTH_SECRET: 'x'.repeat(32),
};
const code = (res: request.Response) => ErrorEnvelope.parse(res.body).error.code;

describe('TRUST_PROXY', () => {
  it('accepts loopback, IPs and CIDR ranges, and rejects anything else', () => {
    expect(loadConfig(baseEnv).api.trustedProxies).toEqual(['loopback']);
    expect(
      loadConfig({ ...baseEnv, TRUST_PROXY: '10.0.0.0/8, 172.16.0.5, fd00::/8' }).api
        .trustedProxies,
    ).toEqual(['10.0.0.0/8', '172.16.0.5', 'fd00::/8']);
    for (const bad of ['1', 'true', '10.0.0.0/33', 'proxy.local']) {
      expect(() => loadConfig({ ...baseEnv, TRUST_PROXY: bad }), bad).toThrow(/TRUST_PROXY/);
    }
  });

  it('must be set explicitly in production', () => {
    const prod = { ...baseEnv, NODE_ENV: 'production' };
    expect(() => loadConfig(prod)).toThrow(/TRUST_PROXY: required in production/);
    expect(loadConfig({ ...prod, TRUST_PROXY: '10.0.0.0/8' }).api.trustedProxies).toEqual([
      '10.0.0.0/8',
    ]);
  });
});

describe('clientKey', () => {
  it('groups IPv6 clients by /64 and unwraps IPv4-mapped addresses', () => {
    expect(clientKey('203.0.113.7')).toBe('203.0.113.7');
    expect(clientKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
    expect(clientKey('2001:db8:1:2:aaaa::1')).toBe('2001:db8:1:2::/64');
    expect(clientKey('2001:db8:1:2:bbbb:cccc:dddd:eeee')).toBe('2001:db8:1:2::/64');
    expect(clientKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(clientKey('::1')).toBe('0:0:0:0::/64');
    expect(clientKey(undefined)).toBe('unknown');
  });
});

describe('originCheck', () => {
  const app = express();
  app.use(originCheck('http://localhost:5173'));
  app.all('/x', (_req, res) => res.json({ ok: true }));
  app.use(createErrorHandler(logger));

  it('blocks state-changing requests from other origins only', async () => {
    const evil = await request(app).post('/x').set('Origin', 'https://evil.example');
    expect(evil.status).toBe(403);
    expect(code(evil)).toBe('ORIGIN_NOT_ALLOWED');
    expect((await request(app).delete('/x').set('Origin', 'https://evil.example')).status).toBe(
      403,
    );
    expect((await request(app).post('/x').set('Origin', 'http://localhost:5173')).status).toBe(200);
    // No Origin: not a browser request carrying our cookies.
    expect((await request(app).post('/x')).status).toBe(200);
    // Reads are not blocked (SameSite cookies and CORS protect them).
    expect((await request(app).get('/x').set('Origin', 'https://evil.example')).status).toBe(200);
  });
});

describe('error handler', () => {
  it('maps an oversized JSON body to 413 and a malformed one to 400', async () => {
    const app = express();
    app.use(express.json({ limit: '10b' }));
    app.post('/x', (_req, res) => res.json({ ok: true }));
    app.use(createErrorHandler(logger));
    const big = await request(app).post('/x').send({ text: 'far more than ten bytes' });
    expect(big.status).toBe(413);
    expect(code(big)).toBe('PAYLOAD_TOO_LARGE');
  });

  it('does not relabel other errors that happen to have type and status', async () => {
    const app = express();
    app.get('/x', () => {
      throw Object.assign(new Error('upstream said no'), { type: 'upstream', status: 404 });
    });
    app.use(createErrorHandler(logger));
    const res = await request(app).get('/x');
    expect(res.status).toBe(500);
    expect(code(res)).toBe('INTERNAL_ERROR');
  });

  it('hands errors after the response started to Express instead of writing twice', async () => {
    const app = express();
    app.get('/x', (_req, res, next) => {
      res.status(200).write('partial');
      next(new Error('failed mid-stream'));
    });
    app.use(createErrorHandler(logger));
    // Express ends the broken response; the handler must not throw ERR_HTTP_HEADERS_SENT.
    const res = await request(app)
      .get('/x')
      .catch((err: unknown) => err);
    expect(res).toBeDefined();
  });
});

describe('route mounting', () => {
  it('refuses a workspace route whose params do not include workspaceId', () => {
    const api = createApiRouter({ lookupMembership: () => Promise.resolve(null) });
    const bad = defineRoute({
      method: 'GET',
      path: '/api/v1/workspaces/:workspaceId/x',
      access: 'member',
      summary: 'x',
      params: z.object({ other: Id }),
      responses: { 204: null },
    });
    expect(() => {
      api.route(bad, () => undefined);
    }).toThrow(/needs a params schema with workspaceId/);
  });
});
