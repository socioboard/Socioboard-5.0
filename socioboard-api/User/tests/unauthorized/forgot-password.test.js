import request from 'supertest';
import { FORGOT_PASSWORD, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testForgotPassword',
  email: 'testForgotPassword@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser(user);
});

describe('Forgot password', () => {
  test('If request params are missing', async () => {
    await request(SERVER)
      .get(FORGOT_PASSWORD)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If email is exist in db', async () => {
    await request(SERVER)
      .get(FORGOT_PASSWORD)
      .query({
        email: user.email,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
