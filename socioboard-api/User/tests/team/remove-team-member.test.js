import request from 'supertest';
import {
  REMOVE_TEAM_MEMBER, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testRemoveTeamMember',
  email: 'testRemoveTeamMember@testtest.com',
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

describe('Remove team member', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .delete(REMOVE_TEAM_MEMBER)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .delete(REMOVE_TEAM_MEMBER)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token and query params are provided', async () => {
    const createTeam = await teamLibs.createTeam(userId, {
      name: 'AcceptInvitationTeamTest',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .delete(REMOVE_TEAM_MEMBER)
      .query({
        teamId: createTeam.dataValues.team_id,
        memberId: user.email,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
