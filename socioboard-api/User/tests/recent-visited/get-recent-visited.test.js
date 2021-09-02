import request from 'supertest';
import { GET_RECENT_VISITED, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';

const unauthorizedLibs = new UnauthorizedLibs();

let accessToken = '';

const user = {
  username: 'testGetRecentVisited',
  email: 'testGetRecentVisited@testtest.com',
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

describe('Get recent visited', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(GET_RECENT_VISITED)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided', async () => {
    await request(SERVER)
      .post(GET_RECENT_VISITED)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });

  test('If query params are provided', async () => {
    await request(SERVER)
      .post(GET_RECENT_VISITED)
      .query({
        skip: 0,
        limit: 100,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
