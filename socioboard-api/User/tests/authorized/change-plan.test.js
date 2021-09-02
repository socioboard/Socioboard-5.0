import request from 'supertest';
import { CHANGE_PLAN, SERVER } from '../constants';

describe('Change plan', () => {
  test('If access token is not provided', () => {
    request(SERVER)
      .post(CHANGE_PLAN)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
