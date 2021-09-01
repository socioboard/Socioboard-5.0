import request from 'supertest';
import {
  EDIT, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testEditTeam',
  email: 'testEditTeam@testtest.com',
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

describe('Edit team', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(EDIT)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided but request body is missing', async () => {
    await request(SERVER)
      .post(EDIT)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and request body are provided', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'editTeamTest',
      description: 'Short note about the team activity.',
      logoUrl: 'https://i.imgur.com/eRkLsuQ.png',
    });

    await request(SERVER)
      .post(EDIT)
      .query({
        teamId: createdTeam.dataValues.team_id,
      })
      .send({
        TeamInfo: {
          name: 'editedTestName',
          description: 'Short note about the team activity.',
          logoUrl: 'https://i.imgur.com/eRkLsuQ.png',
        },
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
