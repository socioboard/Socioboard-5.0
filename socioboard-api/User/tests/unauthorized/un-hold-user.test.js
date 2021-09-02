import request from 'supertest';
import { SERVER, UN_HOLD_USER } from '../constants';

describe('Un hold user', () => {
  test('If request body is missing', async () => {
    await request(SERVER)
      .post(UN_HOLD_USER)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
