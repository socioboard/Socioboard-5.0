import request from 'supertest';
import { SERVER, SOCIAL_LOGIN } from '../constants';

describe('Social login', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(SOCIAL_LOGIN)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are valid', async () => {
    await request(SERVER)
      .get(SOCIAL_LOGIN)
      .query({
        network: 'Facebook',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
