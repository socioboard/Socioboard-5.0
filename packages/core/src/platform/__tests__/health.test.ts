import { createServer, request as httpRequest, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createHealth, type HealthDeps } from '../http';
import { closeServer } from '../process';

const up = () => ({ ping: vi.fn(() => Promise.resolve(true)) });
const down = () => ({ ping: vi.fn(() => Promise.resolve(false)) });

function appWith(deps: HealthDeps) {
  const health = createHealth({ cacheMs: 0, ...deps });
  const app = express();
  app.use(health.router);
  return { app, health };
}

describe('/api/health', () => {
  it('is ok when every dependency answers', async () => {
    const { app } = appWith({ db: up(), queues: up(), storage: up() });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', checks: { db: 'ok', valkey: 'ok', storage: 'ok' } });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('reports storage as disabled when it is not configured', async () => {
    const { app } = appWith({ db: up(), queues: up(), storage: undefined });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', checks: { storage: 'disabled' } });
  });

  it('stays in service (200, degraded) when only storage is down', async () => {
    const { app } = appWith({ db: up(), queues: up(), storage: down() });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'degraded', checks: { storage: 'down' } });
  });

  it.each([
    ['db', { db: down(), queues: up() }],
    ['valkey', { db: up(), queues: down() }],
  ])('is 503 when %s is down', async (name, deps) => {
    const { app } = appWith({ ...deps, storage: up() });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: 'down', checks: { [name]: 'down' } });
  });

  it('counts a ping that throws or hangs as down, without hanging the probe', async () => {
    const hung = { ping: () => new Promise<boolean>(() => undefined) };
    const throws = { ping: () => Promise.reject(new Error('connection refused: secret-host')) };
    const { app } = appWith({ db: hung, queues: throws, storage: undefined, timeoutMs: 50 });
    const started = Date.now();
    const res = await request(app).get('/api/health');
    expect(Date.now() - started).toBeLessThan(1_000);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: 'down',
      checks: { db: 'down', valkey: 'down', storage: 'disabled' },
    });
    expect(JSON.stringify(res.body)).not.toContain('secret-host');
  });

  it('reuses a result for cacheMs, so probes do not load the database', async () => {
    let now = 0;
    const db = up();
    const health = createHealth({
      db,
      queues: up(),
      storage: undefined,
      cacheMs: 5_000,
      now: () => now,
    });
    await Promise.all([health.check(), health.check()]);
    now = 4_999;
    await health.check();
    expect(db.ping).toHaveBeenCalledTimes(1);
    now = 5_000;
    await health.check();
    expect(db.ping).toHaveBeenCalledTimes(2);
  });

  it('turns 503 once shutting down; liveness stays 200', async () => {
    const { app, health } = appWith({ db: up(), queues: up(), storage: up() });
    health.markShuttingDown();
    const ready = await request(app).get('/api/health');
    expect(ready.status).toBe(503);
    expect(ready.body).toMatchObject({ status: 'down', shuttingDown: true });
    const live = await request(app).get('/api/health/live');
    expect(live.status).toBe(200);
  });

  it('liveness does not touch dependencies', async () => {
    const db = down();
    const { app } = appWith({ db, queues: down(), storage: undefined });
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(db.ping).not.toHaveBeenCalled();
  });
});

describe('closeServer', () => {
  function listen(handler: Parameters<typeof createServer>[1]) {
    const server = createServer(handler);
    return new Promise<{ server: Server; port: number }>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve({ server, port: (server.address() as AddressInfo).port });
      });
    });
  }
  const get = (port: number) =>
    new Promise<string>((resolve, reject) => {
      httpRequest({ port, host: '127.0.0.1', path: '/' }, (res) => {
        let body = '';
        res.on('data', (c: Buffer) => (body += c.toString()));
        res.on('end', () => {
          resolve(body);
        });
      })
        .on('error', reject)
        .end();
    });

  it('lets an in-flight request finish, then refuses new connections', async () => {
    const { server, port } = await listen((_req, res) => {
      setTimeout(() => res.end('done'), 200);
    });
    const inFlight = get(port);
    await new Promise((r) => setTimeout(r, 50));
    const started = Date.now();
    await closeServer(server, 5_000);
    await expect(inFlight).resolves.toBe('done');
    // Its keep-alive connection is closed right after, not left open until the keep-alive timeout.
    expect(Date.now() - started).toBeLessThan(1_000);
    await expect(get(port)).rejects.toThrow();
  });

  it('cuts requests still running after the grace period', async () => {
    const { server, port } = await listen(() => {
      // never answers
    });
    const inFlight = get(port).catch((err: unknown) => err);
    await new Promise((r) => setTimeout(r, 50));
    const started = Date.now();
    await closeServer(server, 100);
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(await inFlight).toBeInstanceOf(Error);
  });
});
