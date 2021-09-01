import request from 'supertest';
import {
  SERVER,
  UPDATE_RATINGS,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testUpdateRatings',
  email: 'testUpdateRatings@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  const newUser = await unauthorizedLibs.registerUser(user);

  const authorized = await unauthorizedLibs.getUserAccessToken(
    newUser.userInfo.user.dataValues.user_id,
    newUser.userInfo.activations.dataValues.id,
  );

  accessToken = authorized.accessToken;
  userId = newUser.userInfo.user.dataValues.user_id;
});

describe('Update ratings', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .put(UPDATE_RATINGS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided but request params are missing', async () => {
    await request(SERVER)
      .put(UPDATE_RATINGS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token is provided and query params are not valid', async () => {
    await request(SERVER)
      .put(UPDATE_RATINGS)
      .query({
        accountId: userId,
        rating: 5,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
