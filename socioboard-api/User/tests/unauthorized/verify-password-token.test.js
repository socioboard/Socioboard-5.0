import request from 'supertest';
import { SERVER, VERIFY_PASSWORD_TOKEN } from '../constants';
import { getPasswordActivationToken } from '../service';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testVerifyPasswordToken',
  email: 'testVerifyPasswordToken@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  const newUser = await unauthorizedLibs.registerUser(user);

  await unauthorizedLibs.getUserAccessToken(
    newUser.userInfo.user.dataValues.user_id,
    newUser.userInfo.activations.dataValues.id,
  );
});

describe('Verify password token', () => {
  test('If request params are missing', async () => {
    await request(SERVER)
      .get(VERIFY_PASSWORD_TOKEN)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If activation token is not valid', async () => {
    await request(SERVER)
      .get(VERIFY_PASSWORD_TOKEN)
      .query({
        email: user.email,
        activationToken: '12345',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If valid email and valid activation token', async () => {
    const { forgot_password_validate_token: token } = await getPasswordActivationToken(user.email);

    await request(SERVER)
      .get(VERIFY_PASSWORD_TOKEN)
      .query({
        email: user.email,
        activationToken: token,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
