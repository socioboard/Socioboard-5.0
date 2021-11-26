import request from 'supertest';
import { BITLY_ARCHIVE_LINK, SERVER } from '../constants.js';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import TeamLibs from '../../../Common/Models/team.model.js';
import BitlyCluster from '../../../Common/Cluster/bitly.cluster.js';
import BITLY_CONSTANTS from '../../../Common/Constants/bitly.constants.js';
import TestModel from '../mocks/test.model.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamLibs = new TeamLibs();

describe('Bitly archive link test', () => {
  let accessToken = '';
  let bitlyAccount;
  let teamId;

  const user = {
    username: 'testArchiveLink',
    email: 'testArchiveLink@testtesttestabcd.com',
    password: 'String_12345',
  };

  beforeAll(async () => {
    await TestModel.createPlans();

    const newUser = await unauthorizedLibs.registerUser(user);

    const authorized = await unauthorizedLibs.getUserAccessToken(
      newUser.userInfo.user.dataValues.user_id,
      newUser.userInfo.activations.dataValues.id,
    );

    const availableTeam = await teamLibs.teamForUser(newUser.userInfo.user.dataValues.user_id);

    teamId = availableTeam.Team[0].team_id;

    const bitlyProfile = await BitlyCluster.addBitlyProfile(
      BITLY_CONSTANTS.ACCOUNT_TYPE, teamId, BITLY_CONSTANTS.ACCOUNT_DETAILS.CODE,
    );

    const addedProfile = await teamLibs.addProfiles(
      newUser.userInfo.user.dataValues.user_id,
      newUser.userInfo.user.dataValues.user_name,
      bitlyProfile);

    bitlyAccount = addedProfile;

    accessToken = authorized.accessToken;
  })

  afterAll((done) => {
    TestModel.clearDb().then(() => done()).catch((error) => done(error));
  })

  test('Negative - (access token is missing)', async () => {
    await request(SERVER)
      .delete(BITLY_ARCHIVE_LINK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(401));
  });

  test('Negative - (invalid body params)', async () => {
    await request(SERVER)
      .delete(BITLY_ARCHIVE_LINK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .query({
        accountId: bitlyAccount.profileDetails.account_id,
        teamId,
        bitlink: 'bit.ly/demo-bitlink-forbidden'
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.code).toBe(400);
      });
  });

  test('Negative - (invalid body params)', async () => {
    await request(SERVER)
      .delete(BITLY_ARCHIVE_LINK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .query({
        accountId: bitlyAccount.profileDetails.account_id,
        teamId,
        bitlink: 'bit.ly/test'
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.code).toBe(400);
      });
  });

  test('Positive', async () => {
    await request(SERVER)
      .delete(BITLY_ARCHIVE_LINK)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-access-token', accessToken)
      .query({
        accountId: bitlyAccount.profileDetails.account_id,
        teamId,
        bitlink: 'bit.ly/demo-bitlink'
      })
      .expect(200)
      .expect(({ body }) => expect(body.code).toBe(200));
  });
});
