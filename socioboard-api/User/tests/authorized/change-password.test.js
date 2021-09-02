import request from 'supertest';
import { CHANGE_PASSWORD, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

let accessToken = '';

const user = {
  username: 'testChangePasswordUser',
  email: 'testChangePasswordUser@testtest.com',
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

describe('Change password', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(CHANGE_PASSWORD)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without request body', async () => {
    await request(SERVER)
      .post(CHANGE_PASSWORD)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If incorrect old password', async () => {
    await request(SERVER)
      .post(CHANGE_PASSWORD)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .send({
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If request body is correct', async () => {
    await request(SERVER)
      .post(CHANGE_PASSWORD)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .send({
        currentPassword: user.password,
        newPassword: 'newPassword',
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
