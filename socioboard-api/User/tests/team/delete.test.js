import request from 'supertest';
import {
  DELETE, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testDeleteTeam',
  email: 'testDeleteTeam@testtest.com',
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

describe('Delete team', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .delete(DELETE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided but request body is missing', async () => {
    await request(SERVER)
      .delete(DELETE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and request body are provided', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'deleteTeamTest',
      description: 'Short note about the team activity.',
      logoUrl: 'https://i.imgur.com/eRkLsuQ.png',
    });

    await request(SERVER)
      .delete(DELETE)
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
