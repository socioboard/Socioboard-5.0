import request from 'supertest';
import {
  SEARCH_TEAM, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testSearchTeam',
  email: 'testSearchTeam@testtest.com',
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

describe('Search team', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(SEARCH_TEAM)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .post(SEARCH_TEAM)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided, but user do not have any team', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'DeleteSearchTeam',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await teamLibs.deleteTeam(createdTeam.dataValues.team_id);

    await request(SERVER)
      .post(SEARCH_TEAM)
      .query({
        teamName: createdTeam.dataValues.team_name,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided, but user do not have any team', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'SearchTeam',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await request(SERVER)
      .post(SEARCH_TEAM)
      .query({
        teamName: createdTeam.dataValues.team_name,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
