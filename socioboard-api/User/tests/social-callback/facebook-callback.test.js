import request from 'supertest';
import { FACEBOOK_CALLBACK, SERVER } from '../constants';

describe('Facebook callback', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(FACEBOOK_CALLBACK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are valid', async () => {
    await request(SERVER)
      .get(FACEBOOK_CALLBACK)
      .query({
        code: '1234567890',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
