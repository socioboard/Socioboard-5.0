import request from 'supertest';
import { getEmailActivationToken } from '../service';
import { SERVER, VERIFY_EMAIL } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testVerifyEmail',
  email: 'testVerifyEmail@test.com',
  password: 'String_12345',
};

beforeAll(async () => {
  await unauthorizedLibs.registerUser({
    ...user,
    firstName: 'verify',
    lastName: 'email',
    dateOfBirth: '1970-01-01',
    profilePicture: 'https://i.imgur.com/fdzLeWY.png',
    phoneCode: '+91',
    phoneNo: '1234567890',
    country: 'in',
    timeZone: '+5:30',
    aboutMe: 'test',
  });
});

describe('Verify email', () => {
  test('If request params are missing', async () => {
    await request(SERVER)
      .get(VERIFY_EMAIL)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If activation token is not valid', async () => {
    await request(SERVER)
      .get(VERIFY_EMAIL)
      .query({
        email: user.email,
        activationToken: '12345',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If valid email and valid activation token', async () => {
    const { email_validate_token: token } = await getEmailActivationToken(user.email);

    await request(SERVER)
      .get(VERIFY_EMAIL)
      .query({
        email: user.email,
        activationToken: token,
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
