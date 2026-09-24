import express from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ErrorEnvelope } from '@socioboard/contracts';

import { createErrorHandler, notFound, notFoundHandler } from '../http';

// Parsing with the shared schema also proves every response matches the contract.
const errorOf = (res: request.Response) => ErrorEnvelope.parse(res.body).error;

function app() {
  const logged: unknown[] = [];
  const logger = pino(
    { level: 'error' },
    { write: (line: string) => logged.push(JSON.parse(line)) },
  );
  const a = express();
  a.use(express.json());
  a.use((_req, res, next) => {
    res.locals.requestId = 'req-1';
    next();
  });
  a.get('/app-error', () => {
    throw notFound('POST_NOT_FOUND', 'Post not found');
  });
  a.get('/zod', () => z.object({ name: z.string() }).parse({}));
  a.get('/boom', () => {
    throw new Error('db password is hunter2');
  });
  a.post('/json', (_req, res) => res.json({ ok: true }));
  a.use(notFoundHandler);
  a.use(createErrorHandler(logger));
  return { a, logged };
}

describe('error handler', () => {
  it('returns the envelope for expected errors', async () => {
    const res = await request(app().a).get('/app-error');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'POST_NOT_FOUND', message: 'Post not found', requestId: 'req-1' },
    });
  });

  it('maps Zod errors to 400 VALIDATION_FAILED with field paths', async () => {
    const res = await request(app().a).get('/zod');
    expect(res.status).toBe(400);
    expect(errorOf(res)).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: { issues: [{ path: ['name'] }] },
    });
  });

  it('hides unknown errors from the client but logs them', async () => {
    const { a, logged } = app();
    const res = await request(a).get('/boom');
    expect(res.status).toBe(500);
    expect(errorOf(res).code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
    expect(logged).toHaveLength(1);
  });

  it('handles bad JSON bodies and unknown routes', async () => {
    const bad = await request(app().a)
      .post('/json')
      .set('content-type', 'application/json')
      .send('{oops');
    expect(bad.status).toBe(400);
    expect(errorOf(bad).code).toBe('INVALID_BODY');

    const missing = await request(app().a).get('/nope');
    expect(missing.status).toBe(404);
    expect(errorOf(missing).code).toBe('ROUTE_NOT_FOUND');
  });
});
