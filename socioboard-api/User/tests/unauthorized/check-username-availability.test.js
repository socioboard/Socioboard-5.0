import request from 'supertest';
import { CHECK_USERNAME_AVAILABILITY, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testCheckUserAvailability',
  email: 'testCheckUserAvailability@test.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser(user);
});

describe('Check username availability', () => {
  test('If user is not exist in db', async () => {
    await request(SERVER)
      .get(CHECK_USERNAME_AVAILABILITY)
      .query({
        username: 'qwerty',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If user exist in db', async () => {
    await request(SERVER)
      .get(CHECK_USERNAME_AVAILABILITY)
      .query({
        username: user.username,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If empty query params', async () => {
    await request(SERVER)
      .get(CHECK_USERNAME_AVAILABILITY)
      .query({
        username: user.username,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
