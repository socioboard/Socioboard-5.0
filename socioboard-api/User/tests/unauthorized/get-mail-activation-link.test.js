import request from 'supertest';
import { GET_MAIL_ACTIVATION_LINK, SERVER } from '../constants';

describe('Get mail activation link', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(GET_MAIL_ACTIVATION_LINK)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
