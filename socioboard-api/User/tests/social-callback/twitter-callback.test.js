import request from 'supertest';
import { SERVER, TWITTER_CALLBACK } from '../constants';

describe('Twitter callback', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(TWITTER_CALLBACK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are valid', async () => {
    await request(SERVER)
      .get(TWITTER_CALLBACK)
      .query({
        requestToken: '1234567890',
        requestSecret: '123321',
        verifier: '0000',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
