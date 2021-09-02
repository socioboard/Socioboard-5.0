import request from 'supertest';
import { RESET_PASSWORD, SERVER } from '../constants';

describe('Reset password', () => {
  test('If request body is missing', async () => {
    await request(SERVER)
      .post(RESET_PASSWORD)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
