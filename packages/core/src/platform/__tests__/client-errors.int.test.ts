// P2-I1 `POST /client-errors` through the real app: anyone may report (sign-in pages crash too),
// but only from the app's origin, within the contract's sizes, without query strings, and 20 a
// minute per IP.
import { ErrorEnvelope } from '@socioboard/contracts';
import request from 'supertest';
import { afterAll, expect, it } from 'vitest';

import { createTestApp } from '../../testing';
import { CLIENT_ERRORS_PER_MIN } from '../http';

const t = createTestApp();
const PATH = '/api/v1/client-errors';
const report = {
  kind: 'error',
  name: 'TypeError',
  message: "Cannot read properties of undefined (reading 'id')",
  stack: 'TypeError: Cannot read properties of undefined\n    at Calendar (calendar.tsx:12:3)',
  path: '/w/halden/calendar',
};
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

afterAll(async () => {
  await t.cleanup();
});

it('signed out or in: 204', async () => {
  expect((await t.browser().post(PATH, report)).status).toBe(204);
  const someone = await t.signUp('client-errors');
  expect((await someone.post(PATH, { ...report, kind: 'render' })).status).toBe(204);
});

it('a path with a query string or a hash is refused (they can carry tokens)', async () => {
  const browser = t.browser();
  for (const path of ['/reset-password?token=abc', '/w/x#access_token=abc', 'calendar']) {
    const res = await browser.post(PATH, { ...report, path });
    expect([res.status, code(res)]).toEqual([400, 'VALIDATION_FAILED']);
  }
});

it('oversized reports are refused', async () => {
  const browser = t.browser();
  expect((await browser.post(PATH, { ...report, message: 'x'.repeat(1001) })).status).toBe(400);
  expect((await browser.post(PATH, { ...report, stack: 'x'.repeat(8001) })).status).toBe(400);
  expect((await browser.post(PATH, { ...report, kind: 'other' })).status).toBe(400);
});

it('another site can’t send them', async () => {
  const res = await request(t.app)
    .post(PATH)
    .set('Origin', 'https://evil.example')
    .set('X-Forwarded-For', '10.99.0.1')
    .send(report);
  expect(res.status).toBe(403);
});

it(`${String(CLIENT_ERRORS_PER_MIN)} a minute per IP, then 429`, async () => {
  const browser = t.browser();
  for (let i = 0; i < CLIENT_ERRORS_PER_MIN; i++) {
    expect((await browser.post(PATH, report)).status).toBe(204);
  }
  const over = await browser.post(PATH, report);
  expect([over.status, code(over)]).toEqual([429, 'RATE_LIMITED']);
});
