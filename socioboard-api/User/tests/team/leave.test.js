import request from 'supertest';
import {
  LEAVE, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testLeaveTeam',
  email: 'testLeaveTeam@testtest.com',
  password: 'String_12345',
};

const newUser = {
  username: 'testLeaveTeamNewUser',
  email: 'testLeaveTeamNewUser@testtest.com',
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

describe('Leave team', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(LEAVE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .post(LEAVE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token and query params are provided, but is leaving user is admin', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'LeaveTeamFirstTest',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await request(SERVER)
      .post(LEAVE)
      .query({
        teamId: createdTeam.dataValues.team_id,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided', async () => {
    const createdUser = await unauthorizedLibs.registerUser(newUser);

    const createdTeam = await teamLibs.createTeam(createdUser.userInfo.user.dataValues.user_id, {
      name: 'LeaveTeam',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await teamLibs.addTeamMember(
      userId,
      createdTeam.dataValues.team_id,
      0,
    );

    await request(SERVER)
      .post(LEAVE)
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
