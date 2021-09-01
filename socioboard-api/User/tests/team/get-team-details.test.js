import request from 'supertest';
import {
  GET_TEAM_DETAILS, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testGetTeamDetails',
  email: 'testGetTeamDetails@testtest.com',
  password: 'String_12345',
};

beforeAll(async () => {
  const createUser = await unauthorizedLibs.registerUser(user);

  const authorized = await unauthorizedLibs.getUserAccessToken(
    createUser.userInfo.user.dataValues.user_id,
    createUser.userInfo.activations.dataValues.id,
  );

  accessToken = authorized.accessToken;
  userId = createUser.userInfo.user.dataValues.user_id;
});

describe('Get team details', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .get(GET_TEAM_DETAILS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .get(GET_TEAM_DETAILS)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided, but is leaving user is admin', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'GetTeamDetails',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await request(SERVER)
      .get(GET_TEAM_DETAILS)
      .query({
        teamId: createdTeam.dataValues.team_id,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
