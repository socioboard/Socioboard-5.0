import request from 'supertest';
import { DIRECT_LOGIN_MAIL, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'directLoginMail',
  email: 'directLoginMail@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser(user);
});

describe('Direct login mail', () => {
  test('If query params are provided', async () => {
    await request(SERVER)
      .get(DIRECT_LOGIN_MAIL)
      .query({
        email: user.email,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
