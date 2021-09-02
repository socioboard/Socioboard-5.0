import request from 'supertest';
import { DELETE_SOCIAL_PROFILE, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testDeleteSocialProfile',
  email: 'testDeleteSocialProfile@testtest.com',
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

describe('Delete social profile', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .delete(DELETE_SOCIAL_PROFILE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'DeleteSocialProfile',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .delete(DELETE_SOCIAL_PROFILE)
      .query({
        AccId: createdTeam.dataValues.team_id,
        teamId: createdTeam.dataValues.team_id,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
