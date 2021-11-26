import BitlyService from './bitly.service.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import BITLY_CONSTANTS from '../../../Common/Constants/bitly.constants.js';
import {
  SuccessResponse,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';
import {
  bitlyBasicSchema,
  getPlatformLimitsSchema,
  shortenLinkSchema,
  getLinksByGroupSchema,
  archiveLinkSchema,
} from './bitly.validate.js';

/**
 * TODO To Fetch the Bitly Feeds
 * Function to Fetch the Bitly Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns Bitly Feeds
 */
class BitlyController {
  async getAccountDetails(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary = 'Returns information for the current authenticated user.' */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Bitly account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId } = await bitlyBasicSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const userData = await BitlyService.getAccountDetails(accessToken);

      SuccessResponse(res, userData);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getGroups(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary = 'Returns a list of groups in the organization' */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Bitly account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId } = await bitlyBasicSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const groupsList = await BitlyService.getGroups(accessToken);

      SuccessResponse(res, groupsList);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getPlatformLimits(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary =
          'Fetch all platform limits and counts available for an organization' */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Bitly account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.parameters['path'] = {
        in: 'query',
        description: 'The specific path for which information is requested',
        required: false
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { path, accountId, teamId } = await getPlatformLimitsSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const platformLimits = await BitlyService.getPlatformLimits(accessToken, path);

      SuccessResponse(res, platformLimits);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async shortenLink(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary = 'Converts a long url to a Bitlink' */
    /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Shorten link params',
          schema: {
            $accountId: 1,
            $teamId: 1,
            $long_url: 'https://socioboard.com'
          }
       }
    */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const validatedBody = await shortenLinkSchema.validateAsync(req.body);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        validatedBody.accountId,
        req.body.userScopeId,
        validatedBody.teamId,
      );

      const { default_group_guid: groupGuid } = await BitlyService.getAccountDetails(accessToken);

      const shortenLinkOptions = {
        long_url: validatedBody.long_url,
        group_guid: groupGuid,
      };

      const shortLink = await BitlyService.shortenLink(accessToken, shortenLinkOptions);

      SuccessResponse(res, shortLink);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getGroupLinks(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary =
          'Returns a paginated collection of Bitlinks for a group.' */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Bitly account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.parameters['group_guid'] = {
        in: 'query',
        description: 'A GUID for a Bitly group',
        required: true
       }
       #swagger.parameters['size'] = {
        in: 'query',
        description: 'The quantity of items to be be returned',
        default: 50,
       }
       #swagger.parameters['page'] = {
        in: 'query',
        description: 'Integer specifying the numbered result at which to start',
        default: 1,
       }
       #swagger.parameters['archived'] = {
        in: 'query',
        description: 'Whether or not to include archived bitlinks',
        default: 'off',
        enum: ['off', 'on', 'both']
       }
       #swagger.requestBody = {
        hidden: true
       }
        */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const validatedQuery = await getLinksByGroupSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        validatedQuery.accountId,
        req.body.userScopeId,
        validatedQuery.teamId,
      );

      const linksByGroup = await BitlyService.getLinksByGroup(
        accessToken, validatedQuery,
      );

      SuccessResponse(res, linksByGroup);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async archiveLink(req, res) {
    /* #swagger.tags = ['Bitly Feeds']
        #swagger.summary = 'Archived the specified link.' */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Bitly account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.parameters['bitlink'] = {
          in: 'query',
          description: 'A Bitlink made of the domain and hash',
          required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId, bitlink } = await archiveLinkSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        BITLY_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const archivedLink = await BitlyService.archiveLink(accessToken, bitlink);

      SuccessResponse(res, archivedLink);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }
}

export default new BitlyController();
