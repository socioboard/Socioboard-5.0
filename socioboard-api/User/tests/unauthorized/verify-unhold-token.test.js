import request from 'supertest';
import { SERVER, VERIFY_UN_HOLD_TOKEN } from '../constants';

describe('Verify un hold token', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(VERIFY_UN_HOLD_TOKEN)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
