import request from 'supertest';
import { SERVER, UPDATE_PROFILE_DETAILS } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

let accessToken = '';

const user = {
  username: 'testUpdateUser',
  email: 'testUpdateUser@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  const newUser = await unauthorizedLibs.registerUser(user);

  const authorized = await unauthorizedLibs.getUserAccessToken(
    newUser.userInfo.user.dataValues.user_id,
    newUser.userInfo.activations.dataValues.id,
  );

  accessToken = authorized.accessToken;
});

describe('Update profile details', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(UPDATE_PROFILE_DETAILS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without request body', async () => {
    await request(SERVER)
      .post(UPDATE_PROFILE_DETAILS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If incorrect request body', async () => {
    await request(SERVER)
      .post(UPDATE_PROFILE_DETAILS)
      .send({
        test: '123',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If request body is correct', async () => {
    await request(SERVER)
      .post(UPDATE_PROFILE_DETAILS)
      .send({
        username: '123',
        firstName: 'socio',
        lastName: 'board',
        email: '2323@gmail.com',
        profilePicture: 'https://i.imgur.com/fdzLeWY.png',
        company: 'Globussoft Technologies',
        language: 'En',
        phoneCode: '+91',
        phoneNo: '1324575248',
        country: 'in',
        timeZone: '+5:30',
        company_name: 'SocioBoard',
        company_logo: 'default.jpg',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
