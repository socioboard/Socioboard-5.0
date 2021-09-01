import request from 'supertest';
import {
  SERVER,
  UNLOCK_TEAM,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testUnLockTeam',
  email: 'testUnLockTeam@testtest.com',
  password: 'String_12345',
};

const supportUser = {
  username: 'testUnLockTeamSupport',
  email: 'testUnLockTeamSupport@testtest.com',
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

describe('Unlock team', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .put(UNLOCK_TEAM)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .put(UNLOCK_TEAM)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided, but user try unlock the team where he is not admin', async () => {
    const createdUser = await unauthorizedLibs.registerUser(supportUser);

    const createdTeam = await teamLibs.createTeam(createdUser.userInfo.user.dataValues.user_id, {
      name: 'LockSecondTeam',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .put(UNLOCK_TEAM)
      .send([
        createdTeam.dataValues.team_id,
      ])
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided, but team do not exist', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'DeletedLockTeam',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await teamLibs.deleteTeam(createdTeam.dataValues.team_id);

    await request(SERVER)
      .put(UNLOCK_TEAM)
      .send([
        createdTeam.dataValues.team_id,
      ])
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If access token and query params are provided', async () => {
    const createdTeam = await teamLibs.createTeam(
      userId,
      {
        name: 'UnLockTeam',
        description: 'test test',
        logoUrl: 'google.com',
      },
    );

    await request(SERVER)
      .put(UNLOCK_TEAM)
      .send([
        createdTeam.dataValues.team_id,
      ])
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
