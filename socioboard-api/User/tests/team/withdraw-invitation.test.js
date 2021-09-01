import request from 'supertest';
import {
  SERVER,
  WITHDRAW_INVITATION,
} from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testWithdrawInvitation',
  email: 'testWithdrawInvitation@testtest.com',
  password: 'String_12345',
  firstName: 'socio',
  lastName: 'board',
  dateOfBirth: '1997-09-07',
  profilePicture: 'https://i.imgur.com/fdzLeWY.png',
  phoneCode: '+91',
  phoneNo: '1324575248',
  country: 'in',
  timeZone: '+5:30',
  aboutMe: 'A business person',
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

describe('Withdraw invitation', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .delete(WITHDRAW_INVITATION)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided without query params', async () => {
    await request(SERVER)
      .delete(WITHDRAW_INVITATION)
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
      .delete(WITHDRAW_INVITATION)
      .query({
        teamId: createTeam.dataValues.team_id,
        Email: user.email,
      })
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
