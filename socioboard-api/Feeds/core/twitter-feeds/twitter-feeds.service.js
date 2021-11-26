import config from 'config';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import validate from './twitter-feeds.validate.js';
import {
  SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import TwitterMongoPostModel from '../../../Common/Mongoose/models/twitter-posts.js';
import twitterUsersModel from '../../../Common/Mongoose/models/twitter-users.js';
import twitterCountriesModel from '../../../Common/Mongoose/models/twitter-countries.js';
import twitterTrendsModel from '../../../Common/Mongoose/models/twitter-trends.js';
import TwitterCluster from '../../../Common/Cluster/twitter.cluster.js';
import TWITTER_CONSTANTS from '../../../Common/Constants/twitter.constants.js';

const feedsLibs = new FeedsLibs();

const twitterCluster = new TwitterCluster({
  api_key: TWITTER_CONSTANTS.API_KEY,
  secret_key: TWITTER_CONSTANTS.API_SECRET,
  redirect_url: TWITTER_CONSTANTS.REDIRECT_URL,
});

class TwitterFeedService {
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

  async getTrends(creds, woeid) {
    try {
      const res = await twitterCluster.getTrends(creds, woeid);

      return res;
    } catch (error) {
      if (error.statusCode === 429) {
        const trends = await twitterTrendsModel.getTrendsByWoeid(woeid);

        if (trends) return trends.data;
      }

      throw error;
    }
  }

  async getTrendsFromDbByWoeid(woeid) {
    return twitterTrendsModel.getTrendsByWoeid(woeid);
  }

  async getTrendsAvailablePlaces(creds) {
    try {
      const res = await twitterCluster.getTrendsAvailable(creds);

      return res;
    } catch (error) {
      if (error.statusCode === 429) {
        return twitterCountriesModel.getAllCountries();
      }

      throw error;
    }
  }

  async getAvailableCountries(creds) {
    const response = await this.getTrendsAvailablePlaces(creds);

    return response.filter(
      (location) => location.placeType.code === TWITTER_CONSTANTS.COUNTRY_CODE,
    );
  }

  async getAvailableCountryByName(creds, name) {
    const response = await this.getAvailableCountries(creds);

    return this.findPlaceInResponseArray(response, name);
  }

  async getUserDetails({ creds, accountId, screen_name }) {
    const userFromDb = await twitterUsersModel.getAccountFriendByScreenName(accountId, screen_name);

    if (userFromDb) {
      return userFromDb.user;
    }

    return twitterCluster.getUserDetails(creds, { screen_name });
  }

  async getUserFollowers(creds, page = -1, count = 1) {
    let data = [];

    try {
      const res = await twitterCluster.getUserFollowers(creds, page);

      data = res.users;

      if (res.next_cursor_str !== '-1' && res.users && res.users.length > 0 && count <= 15) {
        const resNext = await this.getUserFollowers(creds, res.next_cursor_str, count += 1);

        data = [...data, ...resNext];
      }

      return data;
    } catch (error) {
      return data;
    }
  }

  async getUserFriends(creds, page = -1, count = 1) {
    let data = [];

    const res = await twitterCluster.getUserFriends(creds, page);

    data = res.users;

    if (res.next_cursor_str !== '-1' && res.users && res.users.length > 0 && count <= 15) {
      const resNext = await this.getUserFriends(creds, res.next_cursor_str, count += 1);

      data = [...data, ...resNext];
    }

    return data;
  }

  async searchTwitterUsers(creds, query) {
    return twitterCluster.searchTwitterUsers(creds, query);
  }

  getUserTweets(creds, args) {
    return twitterCluster.getUserTweetsByUserName(creds, args);
  }

  followUser(creds, args) {
    return twitterCluster.followUser(creds, args);
  }

  unfollowUser(creds, args) {
    return twitterCluster.unfollowUser(creds, args);
  }

  getAccountFriends(accountId, pagination) {
    return twitterUsersModel.getAccountFriends(accountId, pagination);
  }

  getAccountFriendById(accountId, userId) {
    return twitterUsersModel.getAccountFriendById(accountId, userId);
  }

  getAccountFollowers(accountId, pagination) {
    return twitterUsersModel.getAccountFollowers(accountId, pagination);
  }

  async addNewFriend(accountId, user) {
    const friend = { accountId, type: 'friend', user };

    const { id: userId } = user;

    const foundFriend = await twitterUsersModel.getAccountFriendById(accountId, userId);

    if (foundFriend) {
      return foundFriend;
    }

    return twitterUsersModel.insertAccountUsers(friend);
  }

  async deleteFriend(accountId, userId) {
    const deletedUser = await twitterUsersModel.deleteAccountFriend(accountId, userId);

    return deletedUser ? deletedUser._id : null;
  }

  async importTwitterFriends(accountId, friends) {
    const expandFriends = friends.map((user) => ({ accountId, type: 'friend', user }));

    await twitterUsersModel.deleteFriends(accountId);

    return twitterUsersModel.insertAccountUsers(expandFriends);
  }

  async importTwitterFollowers(accountId, followers) {
    const expandFriends = followers.map((user) => ({ accountId, type: 'follower', user }));

    await twitterUsersModel.deleteFollowers(accountId);

    return twitterUsersModel.insertAccountUsers(expandFriends);
  }

  async importTwitterCountries(countries) {
    const countriesFromDb = await twitterCountriesModel.getAllCountries();

    if (countries.length === countriesFromDb.length) return;

    const result = countries.filter(
      (country) => !countriesFromDb.some(({ woeid }) => country.woeid === woeid),
    );

    twitterCountriesModel.insertCountries(result);
  }

  async importTwitterTrends(woeid, data) {
    return twitterTrendsModel.updateOrInsertTrends(woeid, data);
  }

  findPlaceInResponseArray(places, name) {
    return places.find(({ name: placeName }) => placeName === name);
  }
}
export default new TwitterFeedService();
