import request from 'supertest';
import { GET_PROFILE_REDIRECT_URL, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testGetProfileRedirectUrl',
  email: 'testGetProfileRedirectUrl@testtest.com',
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

describe('Get profile redirect url', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(GET_PROFILE_REDIRECT_URL)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided', async () => {
    await request(SERVER)
      .post(GET_PROFILE_REDIRECT_URL)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If query params are provided, without request body', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'GetProfileRedirectUrl',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .post(GET_PROFILE_REDIRECT_URL)
      .query({
        teamId: createdTeam.dataValues.team_id,
        network: 'Facebook',
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If query params are provided and request body include userScopeAvailableNetworks', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'GetProfileRedirectUrl',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .post(GET_PROFILE_REDIRECT_URL)
      .query({
        teamId: createdTeam.dataValues.team_id,
        network: 'Facebook',
      })
      .send({
        userScopeAvailableNetworks: 1,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
