import request from 'supertest';
import {
  EDIT_MEMBER_PERMISSION, SERVER,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testEditPermission',
  email: 'testEditPermission@testtest.com',
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

describe('Edit member permission', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(EDIT_MEMBER_PERMISSION)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided but request body is missing', async () => {
    await request(SERVER)
      .post(EDIT_MEMBER_PERMISSION)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token and query params are provided', async () => {
    // const createTeam = await teamLibs.createTeam(userId, {
    //   name: 'LeaveTeam',
    //   description: 'test test',
    //   logoUrl: 'google.com',
    // });

    // await request(SERVER)
    //   .post(EDIT_MEMBER_PERMISSION)
    //   .query({
    //     teamId: createTeam.dataValues.team_id,
    //     memberId: userId,
    //     permission: 1,
    //   })
    //   .set('accept', 'application/json')
    //   .set('Content-Type', 'application/json')
    //   .set('x-access-token', accessToken)
    //   .expect(200)
    //   .expect(({ body }) => expect(body.code).toBe(200));
  });
});
