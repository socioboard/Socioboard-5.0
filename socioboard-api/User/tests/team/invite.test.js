import request from 'supertest';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';
import { INVITE, SERVER } from '../constants';
import { activateUserByEmail } from '../service';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

const user = {
  username: 'testInviteTeam',
  email: 'testInviteTeam@testest.com',
  password: 'String_12345',
};

const invitedUser = {
  username: 'invitedUser',
  email: 'inviteduser@testtest.com',
  password: 'String_12345',
};

let accessToken = 0;
let userId = 0;

beforeAll(async () => {
  const newUser = await unauthorizedLibs.registerUser(user);

  const authorized = await unauthorizedLibs.getUserAccessToken(
    newUser.userInfo.user.dataValues.user_id,
    newUser.userInfo.activations.dataValues.id,
  );

  accessToken = authorized.accessToken;
  userId = newUser.userInfo.user.dataValues.user_id;
});

describe('Invite', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(INVITE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided but request params are missing', async () => {
    await request(SERVER)
      .post(INVITE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token and request body are provided', async () => {
    await unauthorizedLibs.registerUser(invitedUser);
    await activateUserByEmail(invitedUser.email);

    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'InviteTeamTest',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .post(INVITE)
      .query({
        teamId: createdTeam.dataValues.team_id,
        email: user.email,
        Permission: 2,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));

    await request(SERVER)
      .post(INVITE)
      .query({
        teamId: createdTeam.dataValues.team_id,
        email: 'foobar@testtest.com',
        Permission: 2,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });
});
