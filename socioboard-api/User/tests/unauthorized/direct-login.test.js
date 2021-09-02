import request from 'supertest';
import { DIRECT_LOGIN, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'directLogin',
  email: 'directLogin@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser(user);
});

describe('Direct login', () => {
  test('If request body is missing', async () => {
    await request(SERVER)
      .post(DIRECT_LOGIN)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If request body is valid', async () => {
    await request(SERVER)
      .post(DIRECT_LOGIN)
      .send({ email: user.email })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
