import Validate from './insta.feeds.validate.js';
import userTeamAccounts from '../../../Common/Shared/userTeamAccounts.shared.js';
import InstaMongoPostModel from '../../../Common/Mongoose/models/instagramposts.js';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import config from 'config';

const feedsLibs = new FeedsLibs();

/**
 * TODO To Fetch the Instagram Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */ class FeedsService {
  async getInstaFeeds(req, res, next) {
    try {
      const {accountId, teamId, pageId} = req.query;
      const {value, error} = Validate.validateAccountIdTeamId({
        accountId,
        teamId,
        pageId,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let socialAccountDetails = await userTeamAccounts.getSocialAccount(
        5,
        accountId,
        req.body.userScopeId,
        teamId
      );
      let offset = (pageId - 1) * config.get('perPageLimit');
      let instaObject = new InstaMongoPostModel();
      let feeds = await instaObject.getSocialAccountPosts(
        socialAccountDetails.social_id,
        offset,
        config.get('perPageLimit')
      );
      let data = {socialAccountDetails, feeds};
      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }
}
export default new FeedsService();
