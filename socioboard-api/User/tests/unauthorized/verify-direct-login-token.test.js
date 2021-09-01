import request from 'supertest';
import { SERVER, VERIFY_DIRECT_LOGIN_TOKEN } from '../constants';
import { getDirectLoginValidateToken } from '../service';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'verifyDirectLoginToken',
  email: 'verifyDirectLoginToken@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser({
    ...user,
    firstName: 'test',
    lastName: 'test',
    dateOfBirth: '1970-01-01',
    profilePicture: 'https://i.imgur.com/fdzLeWY.png',
    phoneCode: '+91',
    phoneNo: '1234567890',
    country: 'in',
    timeZone: '+5:30',
    aboutMe: 'test',
  });
});

describe('Verify direct login token', () => {
  test('If query params are missing', async () => {
    await request(SERVER)
      .get(VERIFY_DIRECT_LOGIN_TOKEN)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are valid', async () => {
    const { direct_login_validate_token: token } = await getDirectLoginValidateToken(user.email);

    await request(SERVER)
      .get(VERIFY_DIRECT_LOGIN_TOKEN)
      .query({
        email: user.email,
        activationToken: token,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
