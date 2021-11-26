import config from 'config';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import validate from './facebook-feeds.validate.js';
import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import FacebookMongoPostModel from '../../../Common/Mongoose/models/facebook-posts.js';

const feedsLibs = new FeedsLibs();

class FeedsService {
  constructor() {}

  async getFacebookFeeds(req, res, next) {
    //  const { value, error } = validate.validatePassword(req.body)
    // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
    // const { currentPassword, } = req.body
    try {
      const {teamId, accountId, pageId} = req.query;
      const {value, error} = validate.validateAccountIdTeamId({
        teamId,
        accountId,
        pageId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        [1, 2, 3],
        accountId,
        req.body.userScopeId,
        teamId
      );
      const offset = (pageId - 1) * config.get('perPageLimit');
      const facebookMongoPostModelObject = new FacebookMongoPostModel();
      const feeds = await facebookMongoPostModelObject.getSocialAccountPosts(
        socialAccountDetails.social_id,
        offset,
        config.get('perPageLimit')
      );
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = {socialAccountDetails, SocialAccountStats, feeds};

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async facebookLike(req, res, next) {
    //  const { value, error } = validate.validatePassword(req.body)
    // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
    // const { currentPassword, } = req.body
    try {
      const {teamId, accountId, postId} = req.query;
      const {value, error} = validate.validateLikePost({
        teamId,
        accountId,
        postId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.facebookLike(
        req.body.userScopeId,
        accountId,
        teamId,
        postId
      );

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async facebookComment(req, res, next) {
    //  const { value, error } = validate.validatePassword(req.body)
    // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
    // const { currentPassword, } = req.body
    try {
      const {teamId, accountId, postId, comment} = req.query;
      const {value, error} = validate.validateCommentData({
        teamId,
        accountId,
        postId,
        comment,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.facebookComment(
        req.body.userScopeId,
        req.query.accountId,
        req.query.teamId,
        req.query.postId,
        req.query.comment
      );

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getRecentFbFeeds(req, res, next) {
    //  const { value, error } = validate.validatePassword(req.body)
    // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
    // const { currentPassword, } = req.body
    try {
      const {teamId, accountId, pageId} = req.query;
      const {error} = validate.validateAccountIdTeamId({
        teamId,
        accountId,
        pageId,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        [1, 2, 3],
        accountId,
        req.body.userScopeId,
        teamId
      );
      const response = await feedsLibs.getRecentFbFeeds(
        req.body.userScopeId,
        req.query.accountId,
        req.query.teamId,
        req.query.pageId
      );
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = {socialAccountDetails, SocialAccountStats, feeds: response};

      SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getRecentFbPageFeeds(req, res, next) {
    try {
      const {teamId, accountId, pageId} = req.query;
      const {value, error} = validate.validateAccountIdTeamId({
        teamId,
        accountId,
        pageId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        [1, 2, 3],
        accountId,
        req.body.userScopeId,
        teamId
      );
      const response = await feedsLibs.getRecentFbPageFeeds(
        req.body.userScopeId,
        req.query.accountId,
        req.query.teamId,
        req.query.pageId
      );
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = {socialAccountDetails, SocialAccountStats, feeds: response};

      SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }
}
export default new FeedsService();
