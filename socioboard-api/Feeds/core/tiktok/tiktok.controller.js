import {BadRequestResponse, SuccessResponse} from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';

import TikTokService from './tiktok.service.js';
import TikTokValidator from './tiktok.validate.js';
import tikTokFilter from './tiktok.filter.js';
import TikTokHelpers from './tiktok.helpers.js';

import TIK_TOK_CONSTANTS from '../../../Common/Constants/tiktok.constants.js';
import RESPONSE_CONSTANTS from '../../../Common/Constants/response.constants.js';

/**
 * @class TikTokController
 */
class TikTokController {
  async getUserInfo(req, res) {
    /* #swagger.tags = ['TikTok Feeds']
          #swagger.summary =
            'Returns some basic information of a given TikTok user.',
    */
    /*
      #swagger.parameters['accountId'] = {
        in: 'query',
        type: 'number',
        required: true
      }
      #swagger.parameters['teamId'] = {
        in: 'query',
        type: 'number',
        required: true
      }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const {access_token, open_id} = TikTokHelpers.getRequestCreds(req.tikTokAccount);

      const {user} = await TikTokService.intercepted.getUserInfo(
        {
          access_token,
          open_id,
        },
        req.tikTokAccount,
      );

      return SuccessResponse(res, user);
    } catch (error) {
      return tikTokFilter(res, error);
    }
  }

  async getVideoList(req, res) {
    /* #swagger.tags = ['TikTok Feeds']
          #swagger.summary =
            "Return a paginated list of given user's public TikTok video posts.",
    */
    /*
      #swagger.parameters['accountId'] = {
        in: 'query',
        type: 'number',
        required: true
      }
      #swagger.parameters['teamId'] = {
        in: 'query',
        type: 'number',
        required: true
      }
      #swagger.parameters['cursor'] = {
        in: 'query',
        type: 'number',
        description: 'Cursor for pagination.',
        required: false
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        type: 'number',
        description: 'The maximum number of videos that will be returned from each page.
                      Default is 10. Maximum is 20.',
        required: false
      }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const creds = TikTokHelpers.getRequestCreds(req.tikTokAccount);

      const pagination = await TikTokValidator.paginationSchema(
        20,
        10,
      )(req.query);

      const list = await TikTokService.intercepted.getVideoList(
        {
          ...creds,
          pagination,
        },
        req.tikTokAccount,
      );

      const listWithConvertedDates = TikTokHelpers.convertVideoDates(list);

      return SuccessResponse(res, listWithConvertedDates);
    } catch (error) {
      return tikTokFilter(res, error);
    }
  }

  async uploadVideo(req, res) {
    /* #swagger.tags = ['TikTok Feeds']
          #swagger.summary =
            'Share videos into TikTok.',
    */
    /*
      #swagger.parameters['data'] = {
        in: 'body',
        description: 'Upload video params',
        schema: {
          accountIds: [1, 2, 3],
          teamId: 1,
          videoUrl: 'https://foo.bar/videos/demo.mp4',
        }
      }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const videoUrl = await TikTokValidator.shareUrlSchema(req.body.videoUrl);

      const remoteFileDetails = await TikTokService.getRemoteFileDetails(videoUrl);

      TikTokValidator.validateFile(remoteFileDetails, {
        size: TIK_TOK_CONSTANTS.VIDEO_SIZE,
        mimetypes: TIK_TOK_CONSTANTS.VIDEO_MIMETYPES,
      });

      await TikTokService.uploadVideoToManyAccounts(
        req.tikTokAccounts,
        videoUrl,
      );

      return SuccessResponse(res);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === RESPONSE_CONSTANTS.STATUS_CODES.BAD_REQUEST) {
        return BadRequestResponse(res, TIK_TOK_CONSTANTS.ERROR_MESSAGES.UPLOAD_VIDEO_ERROR);
      }

      return tikTokFilter(res, error);
    }
  }

  async uploadAudio(req, res) {
    /* #swagger.tags = ['TikTok Feeds']
          #swagger.summary =
            'Share audios into TikTok.',
    */
    /*
      #swagger.parameters['data'] = {
        in: 'body',
        description: 'Upload audio params',
        schema: {
          accountIds: [1, 2, 3],
          teamId: 1,
          audioUrl: 'https://foo.bar/audios/demo.mp3',
        }
      }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const audioUrl = await TikTokValidator.shareUrlSchema(req.body.audioUrl);

      const remoteFileDetails = await TikTokService.getRemoteFileDetails(audioUrl);

      TikTokValidator.validateFile(remoteFileDetails, {
        size: TIK_TOK_CONSTANTS.AUDIO_SIZE,
        mimetypes: TIK_TOK_CONSTANTS.AUDIO_MIMETYPES,
      });

      await TikTokService.uploadAudioToManyAccounts(
        req.tikTokAccounts,
        audioUrl,
      );

      return SuccessResponse(res);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === RESPONSE_CONSTANTS.STATUS_CODES.BAD_REQUEST) {
        return BadRequestResponse(res, TIK_TOK_CONSTANTS.ERROR_MESSAGES.UPLOAD_VIDEO_ERROR);
      }

      return tikTokFilter(res, error);
    }
  }

  /**
   * Validate if the requested account is TikTok account or not
   * @param {function} getter - Function which will parse request to get accountId and teamId
   * @returns {void|object} Continue request or return error data
   * @memberof TikTokController
   */
  getAddTikTokAccess(getter) {
    return async (req, res, next) => {
      try {
        const data = getter(req);

        const {accountId, teamId} = await TikTokValidator.tikTokBasicSchema(
          data,
        );

        req.tikTokAccount = await userTeamAccounts.getSocialAccount(
          TIK_TOK_CONSTANTS.ACCOUNT_TYPE,
          accountId,
          req.body.userScopeId,
          teamId,
        );

        return next();
      } catch (error) {
        return tikTokFilter(res, error);
      }
    };
  }

  /**
   * Validate if the requested accounts are TikTok accounts or not
   * @param {function} getter - Function which will parse request to get accountIds and teamId
   * @returns {void|object} Continue request or return error data
   * @memberof TikTokController
   */
  getAddTikTokManyAccess(getter) {
    return async (req, res, next) => {
      try {
        const data = getter(req);

        const {
          accountIds,
          teamId,
        } = await TikTokValidator.tikTokManyBasicSchema(
          data,
        );

        const {userScopeId: userId} = req.body;

        await userTeamAccounts.isTeamValidForUser(userId, teamId);

        const accounts = await userTeamAccounts.getManyTeamSocialAccounts(accountIds, teamId);

        if (accounts.length !== accountIds.length) {
          return BadRequestResponse(res, TIK_TOK_CONSTANTS.ERROR_MESSAGES.INVALID_ACCOUNT_IDS);
        }

        req.tikTokAccounts = await userTeamAccounts.getManySocialAccounts(accountIds);

        return next();
      } catch (error) {
        return tikTokFilter(res, error);
      }
    };
  }
}

export default new TikTokController();
