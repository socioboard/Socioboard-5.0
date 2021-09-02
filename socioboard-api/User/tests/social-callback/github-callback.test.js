import request from 'supertest';
import { GITHUB_CALLBACK, SERVER } from '../constants';

describe('Github callback', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(GITHUB_CALLBACK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are valid', async () => {
    await request(SERVER)
      .get(GITHUB_CALLBACK)
      .query({
        code: '1234567890',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
