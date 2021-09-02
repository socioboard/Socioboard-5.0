import config from 'config';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import validate from './twitter-feeds.validate.js';
import {
  ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import TwitterMongoPostModel from '../../../Common/Mongoose/models/twitter-posts.js';

const feedsLibs = new FeedsLibs();

class TwitterFeedService {
  constructor() {
  }

  async getTweets(req, res, next) {
    try {
      const { teamId, accountId, pageId } = req.query;
      const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const socialAccountDetails = await userTeamAccounts.getSocialAccount(4, accountId, req.body.userScopeId, teamId);
      const firstName = socialAccountDetails.first_name;
      const profilePicUrl = socialAccountDetails.profile_pic_url;
      const offset = (pageId - 1) * config.get('perPageLimit');
      const twitterMongoPostModelObject = new TwitterMongoPostModel();
      const feeds = await twitterMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = { socialAccountDetails, SocialAccountStats, feeds };

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twitterLike(req, res, next) {
    try {
      const { teamId, accountId, tweetId } = req.query;
      const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twitterLike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twitterDislike(req, res, next) {
    try {
      const { teamId, accountId, tweetId } = req.query;
      const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twitterDislike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twitterComment(req, res, next) {
    try {
      const {
        teamId, accountId, tweetId, comment, username,
      } = req.query;
      const { value, error } = validate.validateCommentData({
        teamId, accountId, tweetId, comment, username,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twitterComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.query.comment, req.query.username, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twitterDeleteComment(req, res, next) {
    try {
      const { teamId, accountId, tweetId } = req.query;
      const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twitterDeleteComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twtRetweet(req, res, next) {
    try {
      const { teamId, accountId, tweetId } = req.query;
      const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twtRetweet(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twtUnretweet(req, res, next) {
    try {
      const { teamId, accountId, tweetId } = req.query;
      const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twtUnretweet(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async twtRetweetWithComment(req, res, next) {
    try {
      const {
        teamId, accountId, tweetId, comment, username,
      } = req.query;
      const { value, error } = validate.validateCommentData({
        teamId, accountId, tweetId, comment, username,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.twtRetweetWithComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.query.comment, req.query.username, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async fetchAllTweets(req, res, next) {
    try {
      const { teamId, accountId } = req.query;
      const { value, error } = validate.validateFetchTweet({ teamId, accountId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await feedsLibs.fetchAllTweets(req.body.userScopeId, req.query.accountId, req.query.teamId, req.body.language);

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }
}
export default new TwitterFeedService();
