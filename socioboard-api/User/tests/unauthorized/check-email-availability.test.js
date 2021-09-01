import request from 'supertest';
import { CHECK_EMAIL_AVAILABILITY, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testCheckEmailAvailability',
  email: 'testCheckEmailAvailability@test.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser(user);
});

describe('Check email availability', () => {
  it('If user is not exist in db', async () => {
    await request(SERVER)
      .get(CHECK_EMAIL_AVAILABILITY)
      .query({
        email: 'not-exist@testtest.com',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If user exist in db', async () => {
    await request(SERVER)
      .get(CHECK_EMAIL_AVAILABILITY)
      .query({
        email: user.email,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If request params are missing', async () => {
    await request(SERVER)
      .get(CHECK_EMAIL_AVAILABILITY)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
