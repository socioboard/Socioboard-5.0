import request from 'supertest';
import { LOGIN, SERVER } from '../constants';
import { activateUserByEmail } from '../service';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

const user = {
  username: 'testLogin',
  email: 'testLogin@test.com',
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

describe('Check login', () => {
  test('If user exist and email not yet validated', async () => {
    await request(SERVER)
      .post(LOGIN)
      .send(user)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If user exist and email validated', async () => {
    await activateUserByEmail(user.email);

    await request(SERVER)
      .post(LOGIN)
      .send(user)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If request user is not exist', async () => {
    await request(SERVER)
      .post(LOGIN)
      .send({
        username: 'loginNotExist',
        email: 'test-login-not-exist@test.com',
        password: 'String_12345',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If request user is not valid', async () => {
    await request(SERVER)
      .post(LOGIN)
      .send({
        username: 'loginNotExist',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
