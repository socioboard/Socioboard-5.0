import Validate from './linkedIn-feeds.validate.js';
import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import LinkedInFeedModel from '../../../Common/Models/linkedIn-feeds.model.js';
const linkedInFeedModel = new LinkedInFeedModel();
import FeedsLibs from '../../../Common/Models/feeds.model.js';
const feedsLibs = new FeedsLibs();
class LinkedInFeedsService {
  /**
   * TODO To Fetch the linkedIn Feeds
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns linkedIn Feeds
   */
  async getLinkedInFeeds(req, res, next) {
    try {
      const {accountId, teamId, pageId} = req.query;
      const {error} = Validate.validateAccountIdTeamId({
        accountId,
        teamId,
        pageId,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        7,
        accountId,
        req.body.userScopeId,
        teamId
      );
      let response = await linkedInFeedModel.getRecentLinkedInFeeds(
        req.body.userScopeId,
        req.query.accountId,
        req.query.teamId,
        req.query.pageId
      );
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = {socialAccountDetails, SocialAccountStats, feeds: response};
      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Fetch the linkedIn Follower Stats
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns linkedIn Follower Stats
   */
  async getFollowerStats(req, res, next) {
    try {
      const {accountId, teamId, filterPeriod, since, until} = req.query;
      const {error} = Validate.validateStats({
        accountId,
        teamId,
        filterPeriod,
        since,
        until,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        7,
        accountId,
        req.body.userScopeId,
        teamId
      );
      let filerTime = await linkedInFeedModel.getFilteredPeriod(
        filterPeriod,
        since,
        until
      );
      let followerStats = await linkedInFeedModel.getFollowerStats(
        socialAccountDetails.social_id,
        socialAccountDetails.access_token,
        filerTime
      );
      let parsedFollowerStats = await this.parsedFollowerStats(followerStats);
      return SuccessResponse(res, parsedFollowerStats);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Fetch the linkedIn Page Stats
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns linkedIn Page Stats
   */
  async getPageStats(req, res, next) {
    try {
      const {accountId, teamId, pageId, filterPeriod, since, until} = req.query;
      const {error} = Validate.validateStats({
        accountId,
        teamId,
        filterPeriod,
        since,
        until,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        7,
        accountId,
        req.body.userScopeId,
        teamId
      );
      let filerTime = await linkedInFeedModel.getFilteredPeriod(
        filterPeriod,
        since,
        until
      );
      let feedsStats = await linkedInFeedModel.getPageStats(
        socialAccountDetails.social_id,
        socialAccountDetails.access_token,
        filerTime
      );
      let parsedFeedsStats = await this.parsedFeedsStats(feedsStats);
      return SuccessResponse(res, parsedFeedsStats);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Parse The linkedIn Page Stats
   * @param {object} feedsStats -Page Stats statistics from linkedI
   * @return {object} Returns linkedIn Page Stats with parsed format
   */
  async parsedFeedsStats(feedsStats) {
    console.log(feedsStats, feedsStats?.elements);
    let data = [];
    feedsStats?.data?.elements?.map(x => {
      let feed = {};
      let date = new Date(x?.timeRange?.start);
      (feed.date = `${date?.getFullYear()}-${`0${date?.getMonth() + 1}`.slice(
        -2
      )}-${`0${date?.getDate()}`.slice(-2)}`),
        (feed.uniqueImpressionsCount =
          x?.totalShareStatistics?.uniqueImpressionsCount ?? 0),
        (feed.shareCount = x?.totalShareStatistics?.shareCount ?? 0),
        (feed.engagement = x?.totalShareStatistics?.engagement ?? 0),
        (feed.clickCount = x?.totalShareStatistics?.clickCount ?? 0),
        (feed.likeCount = x?.totalShareStatistics?.likeCount ?? 0),
        (feed.impressionCount = x?.totalShareStatistics?.impressionCount ?? 0),
        (feed.commentCount = x?.totalShareStatistics?.commentCount ?? 0);
      data.push(feed);
    });
    return data;
  }

  /**
   * TODO To Parse The linkedIn Follower Stats
   * @param {object} followerStats -Follower statistics from linkedI
   * @return {object} Returns linkedIn Follower Stats with parsed format
   */
  async parsedFollowerStats(followerStats) {
    let data = [];
    followerStats?.data?.elements?.map(x => {
      let feed = {};
      let date = new Date(x?.timeRange?.start);
      feed.organicFollowerGain = x?.followerGains?.organicFollowerGain ?? 0;
      feed.paidFollowerGain = x?.followerGains?.paidFollowerGain ?? 0;
      feed.totalFollower =
        Number(x?.followerGains?.organicFollowerGain ?? 0) +
        Number(x?.followerGains?.paidFollowerGain ?? 0);
      feed.date = `${date?.getFullYear()}-${`0${date?.getMonth() + 1}`.slice(
        -2
      )}-${`0${date?.getDate()}`.slice(-2)}`;
      data.push(feed);
    });
    return data;
  }
}
export default new LinkedInFeedsService();
