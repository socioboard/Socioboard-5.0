import request from 'supertest';
import { ADD_BULK_SOCIAL_PROFILE, SERVER } from '../constants';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

let accessToken = '';
let userId = 0;

const user = {
  username: 'testAddBulkSocialProfile',
  email: 'testAddBulkSocialProfile@testtest.com',
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

describe('Add bulk social profile', () => {
  test('If access token is not provided', async () => {
    await request(SERVER)
      .post(ADD_BULK_SOCIAL_PROFILE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('If access token is provided', async () => {
    await request(SERVER)
      .post(ADD_BULK_SOCIAL_PROFILE)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });

  test('If query params are provided', async () => {
    const createdTeam = await teamLibs.createTeam(userId, {
      name: 'AddBulkSocialProfile',
      description: 'test test',
      logoUrl: 'google.com',
    });

    await request(SERVER)
      .post(ADD_BULK_SOCIAL_PROFILE)
      .query({
        teamId: createdTeam.dataValues.team_id,
      })
      .send([
        {
          account_type: '1',
          user_name: 'socio123',
          first_name: 'socio',
          last_name: 'board',
          email: 'socioboard@socioboard.com',
          social_id: 'sb124234123',
          profile_pic_url: 'https://www.socioboard.com/contents/socioboard/images/Socioboard.png',
          cover_pic_url: 'https://www.socioboard.com/contents/socioboard/images/Socioboard.png',
          profile_url: 'https://www.socioboard.com/user/socioboard/socio123',
          access_token: 'Sifnjfdhfefdwndijvbufkjcvdbvivnriurhgueg8rgijvbciudwff3495ry748truiefeiuf4treugfeuyfr46rfufhdbfuy',
          refresh_token: 'SuewfefgEWFEFefdhfdfDVCverf4t34t$#FRCs4t84fgRSGRG4t43fF4t4',
          friendship_counts: '243',
          info: 'Build the success life with using Smart utils like sociobord for Social Networks',
        },
      ])
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(400));
  });
});
