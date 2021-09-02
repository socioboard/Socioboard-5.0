import request from 'supertest';
import { GET_PLAN_DETAILS, SERVER } from '../constants';

describe('Get plan details', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(GET_PLAN_DETAILS)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
