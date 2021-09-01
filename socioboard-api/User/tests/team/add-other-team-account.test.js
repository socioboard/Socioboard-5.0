import request from 'supertest';
import {
  ADD_OTHER_TEAM_ACCOUNT, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testAddOtherTeamAccount',
  email: 'testAddOtherTeamAccount@testtest.com',
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

describe('Add other team account', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(ADD_OTHER_TEAM_ACCOUNT)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .post(ADD_OTHER_TEAM_ACCOUNT)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token and query params are provided', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'AddOtherTeamAccount',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await request(SERVER)
      .post(ADD_OTHER_TEAM_ACCOUNT)
      .query({
        accountId: userId,
        teamId: createdTeam.dataValues.team_id,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
