import moment from 'moment';
import config from 'config';
import _ from 'underscore';
import NetworkInsightValidate from './network-insight.validate.js';
import { ValidateErrorResponse, SuccessResponse, CatchResponse } from '../../../Common/Shared/response.shared.js';
import UserTeamAccountLibs from '../../../Common/Shared/user-team-accounts-libs.shared.js';
import TeamInsights from '../../../Common/Mongoose/models/team-insights.js';
import TwitterInsights from '../../../Common/Mongoose/models/twitter-insights.js';
import FacebookHelper from '../../../Common/Cluster/facebook.cluster.js';
import GoogleHelper from '../../../Common/Cluster/google.cluster.js';
import LinkedInHelper from '../../../Common/Cluster/linkedin.cluster.js';

class NetworkService {
  constructor() {
    this.userTeamAccountLibs = new UserTeamAccountLibs();
    this.teamInsights = new TeamInsights();
    this.twitterInsights = new TwitterInsights();
    this.facebookHelper = new FacebookHelper();
    this.googleHelper = new GoogleHelper(config.get('google_api'));
    this.LinkedInHelper = new LinkedInHelper(config.get('linkedIn_api'));
  }

  async getTeamInsights(req, res, next) {
    try {
      const { teamId, filterPeriod } = req.query;
      const { value, error } = NetworkInsightValidate.validateTeam({ teamId, filterPeriod });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const dates = await this.getFilteredPeriod(filterPeriod, req.query.since, req.query.until);
      const checkTeamValid = await this.userTeamAccountLibs.isTeamValidForUser(req.body.userScopeId, teamId);
      const getUpdateTeamDetail = await this.userTeamAccountLibs.createOrUpdateTeamReport(teamId, false);
      const response = await this.teamInsights.getInsights(teamId, dates.since, dates.untill);

      if (response.length <= 0) throw new Error('Sorry, No Team-Reports available in this Time Period');
      const InsightResult = response;
      // res.send(response)
      const twitterInsights = {};
      const instagramBusinessInsights = {};
      const facebookInsights = {};
      const youtubeInsights = {};
      const teamMembstats = {};
      const Facebook = [];
      const Twitter = [];
      const InstagramBusiness = [];
      const Youtube = [];

      return Promise.all(response.map((eachDay) => {
        // Intitializing with 0
        twitterInsights.follower_count = 0; twitterInsights.following_count = 0; twitterInsights.total_like_count = 0; twitterInsights.total_post_count = 0;
        instagramBusinessInsights.friendship_count = 0; instagramBusinessInsights.follower_count = 0; instagramBusinessInsights.following_count = 0; instagramBusinessInsights.total_post_count = 0;
        facebookInsights.friendship_count = 0; facebookInsights.page_count = 0;
        youtubeInsights.subscription_count = 0; youtubeInsights.total_post_count = 0;
        teamMembstats.teamMembersCount = eachDay.teamMembersCount;
        teamMembstats.teamName = eachDay.teamName;
        teamMembstats.teamLogo = eachDay.teamLogo;
        teamMembstats.invitedList = eachDay.invitedList;
        teamMembstats.leftTeamMem = eachDay.leftTeamMem;
        teamMembstats.socialProfilesCount = eachDay.socialProfilesCount;

        const account_type = [1, 4, 5, 9];

        return Promise.all(account_type.map((account) => {
          switch (Number(account)) {
            case 1:
              var facebookTemp = {};

              eachDay.SocialAccountStats[0].facebookStats.forEach((facebook) => {
                facebookTemp.facebookInsights = {};
                facebookTemp.facebookInsights.friendship_count = facebookInsights.friendship_count += facebook.facebookStats.friendship_count;
                facebookTemp.facebookInsights.page_count = facebookInsights.page_count += facebook.facebookStats.page_count;
                facebookTemp.facebookInsights.date = facebookInsights.date = eachDay.date;
              });
              Facebook.push({ facebookInsights: facebookTemp.facebookInsights });
              break;
            case 4:
              var twitterTemp = {};

              eachDay.SocialAccountStats[0].twitterStats.forEach((twitter) => {
                twitterTemp.twitterInsights = {};
                twitterTemp.twitterInsights.follower_count = twitterInsights.follower_count += twitter.twitterStats.follower_count;
                twitterTemp.twitterInsights.following_count = twitterInsights.following_count += twitter.twitterStats.following_count;
                twitterTemp.twitterInsights.total_like_count = twitterInsights.total_like_count += twitter.twitterStats.total_like_count;
                twitterTemp.twitterInsights.total_post_count = twitterInsights.total_post_count += twitter.twitterStats.total_post_count;
                twitterTemp.twitterInsights.date = twitterInsights.date = eachDay.date;
              });
              Twitter.push({ twitterInsights: twitterTemp.twitterInsights });
              break;
            case 5:
              var instgramBusinessTemp = {};

              eachDay.SocialAccountStats[0].instagramStats.forEach((instaBusiness) => {
                instgramBusinessTemp.instagramBusinessInsights = {};
                instgramBusinessTemp.instagramBusinessInsights.friendship_count = instagramBusinessInsights.friendship_count += instaBusiness.instagramStats.friendship_count;
                instgramBusinessTemp.instagramBusinessInsights.follower_count = instagramBusinessInsights.follower_count += instaBusiness.instagramStats.follower_count;
                instgramBusinessTemp.instagramBusinessInsights.following_count = instagramBusinessInsights.following_count += instaBusiness.instagramStats.following_count;
                instgramBusinessTemp.instagramBusinessInsights.total_post_count = instagramBusinessInsights.total_post_count += instaBusiness.instagramStats.total_post_count;
                instgramBusinessTemp.instagramBusinessInsights.date = instagramBusinessInsights.date = InsightResult[0].date;
              });
              InstagramBusiness.push({ instagramBusinessInsights: instgramBusinessTemp.instagramBusinessInsights });
              break;
            case 9:
              var youtubeTemp = {};

              eachDay.SocialAccountStats[0].youtubeStats.forEach((youtube) => {
                youtubeTemp.youtubeInsights = {};
                youtubeTemp.youtubeInsights.subscription_count = youtubeInsights.subscription_count += youtube.youtubeStats.subscription_count;
                youtubeTemp.youtubeInsights.total_post_count = youtubeInsights.total_post_count += youtube.youtubeStats.total_post_count;
                youtubeTemp.youtubeInsights.date = youtubeInsights.date = InsightResult[0].date;
              });
              Youtube.push({ youtubeInsights: youtubeTemp.youtubeInsights });
              break;
            default:
              break;
          }
        }));
      }))
        .then(() => {
          res.send({
            TeamMemberStats: teamMembstats,
            Facebook,
            Twitter,
            InstagramBusiness,
            Youtube,
          });
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getTwitterInsights(req, res, next) {
    try {
      const { accountId, teamId, filterPeriod } = req.query;
      const { value, error } = NetworkInsightValidate.validateTwtInsight({ accountId, teamId, filterPeriod });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const getSocialAccDetails = await this.userTeamAccountLibs.getSocialAccount(4, accountId, req.body.userScopeId, teamId);
      const dates = await this.getFilteredPeriod(filterPeriod, req.query.since, req.query.until);
      const twitterInsight = await this.twitterInsights.getInsightsDaywise(accountId, dates.since, dates.untill);
      const data = await this.formatDate(twitterInsight, dates.since, dates.untill);
      const stats = await this.twitterInsights.getInsightsStats(accountId, dates.since, dates.untill);

      data ? SuccessResponse(res, { data, stats }) : CatchResponse(res, 'Error in fethcing the Twitter Insight');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getTwitterStats(req, res, next) {
    try {
      const { accountId, teamId, filterPeriod } = req.query;
      const { value, error } = NetworkInsightValidate.validateTwtInsight({ accountId, teamId, filterPeriod });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const getSocialAccDetails = await this.userTeamAccountLibs.getSocialAccount(4, accountId, req.body.userScopeId, teamId);
      const dates = await this.getFilteredPeriod(filterPeriod, req.query.since, req.query.until);
      const response = await this.twitterInsights.getInsightsStats(accountId, dates.since, dates.untill);

      response ? SuccessResponse(res, response) : CatchResponse(res, 'Error in fethcing the Twitter Insight');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getFacebookInsights(req, res, next) {
    try {
      const { accountId, teamId, filterPeriod } = req.query;
      const { value, error } = NetworkInsightValidate.validateTwtInsight({ accountId, teamId, filterPeriod });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const getSocialAccDetails = await this.userTeamAccountLibs.getSocialAccount(2, accountId, req.body.userScopeId, teamId);
      const dates = await this.getFilteredPeriod(filterPeriod, req.query.since, req.query.until);
      const response = await this.facebookHelper.fbPageInsights(getSocialAccDetails.access_token, getSocialAccDetails.social_id, dates.since, dates.untill, filterPeriod);

      if (response.data.length < 1) throw new Error("Sorry, Account isn't active for specified time span");
      response.error ? CatchResponse(res, response.error) : SuccessResponse(res, response);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getYouTubeInsights(req, res, next) {
    try {
      const {accountId, teamId, filterPeriod} = req.query;
      const {value, error} = NetworkInsightValidate.validateTwtInsight({
        accountId,
        teamId,
        filterPeriod,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const getSocialAccDetails =
        await this.userTeamAccountLibs.getSocialAccount(
          9,
          accountId,
          req.body.userScopeId,
          teamId
        );
      const dates = await this.getFilteredPeriod(
        filterPeriod,
        req.query.since,
        req.query.until
      ); // modification required
      const data = await this.googleHelper.youtubeInsights(
        getSocialAccDetails.refresh_token,
        encodeURIComponent(getSocialAccDetails.social_id),
        dates.since,
        dates.untill
      );
      if (data?.error)
        return ErrorResponse(
          res,
          data?.error?.message ?? 'Error in fethcing the Youutbe Insight'
        );
      const response = await this.parseYoutubeData(data);

      response
        ? SuccessResponse(res, response)
        : CatchResponse(res, 'Error in fethcing the Youutbe Insight');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getLinkedInInsights(req, res, next) {
    try {
      const { accountId, teamId, filterPeriod } = req.query;
      const { value, error } = NetworkInsightValidate.validateTwtInsight({ accountId, teamId, filterPeriod });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const getSocialAccDetails = await this.userTeamAccountLibs.getSocialAccount(9, accountId, req.body.userScopeId, teamId);
      const dates = await this.getFilteredPeriod(filterPeriod, req.query.since, req.query.until); // modification required
      const response = await this.LinkedInHelper.getCompanyInsights(getSocialAccDetails.access_token, encodeURIComponent(getSocialAccDetails.social_id), dates.since, dates.untill);

      response ? SuccessResponse(res, response) : CatchResponse(res, 'Error in fethcing the Youutbe Insight');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getFilteredPeriod(filterPeriod, since, untill) {
    return new Promise((resolve, reject) => {
      switch (Number(filterPeriod)) {
        case 1:
          since = moment().startOf('day');
          untill = moment().endOf('day');
          break;
        case 2:
          since = moment().subtract(1, 'days').startOf('day');
          untill = moment().subtract(1, 'days').endOf('day');
          break;
        case 3:
          since = moment().subtract(6, 'days').startOf('day');
          untill = moment().endOf('day');
          break;
        case 4:
          since = moment().subtract(30, 'days').startOf('day');
          untill = moment();
          break;
        case 5:
          since = moment().startOf('month');
          untill = moment();
          break;
        case 6:
          since = moment().startOf('month').subtract(1, 'days').startOf('month');
          untill = moment().startOf('month').subtract(1, 'days').endOf('month');
          break;
        case 7:
          if (filterPeriod == 7) {
            if (!since || !untill) throw new Error('Invalid Inputs');
            else {
              since = moment(since).startOf('day');
              untill = moment(untill).endOf('day');
            }
          }
          break;
        default:
          throw new Error('please choose valid filter type');
      }
      if (since <= untill) {
        resolve({ since, untill });
      } else {
        reject('Check range values.since should be lesser than or equals to until');
      }
    });
  }

  async formatDate(twitterInsights, since, untill) {
    const day = 1000 * 60 * 60 * 24;
    let date1; let
      date2;

    date1 = new Date(since);
    date2 = new Date(untill);

    const dates = [];
    const totalPost = 0; const totalpostFailed = 0; const
      totalschedulePosts = 0;
    const diff = (date2.getTime() - date1.getTime()) / day;

    for (let i = 0; i <= diff; i++) {
      const xx = date1.getTime() + day * i;
      const yy = new Date(xx);

      dates.push(yy);
      // console.log(yy.getFullYear() + "-" + (yy.getMonth() + 1) + "-" + yy.getDate());
    }
    const daywisesData = [];

    for (const count in dates) {
      const daywises = {
        date: (`${dates[count].getFullYear()}-${(`0${dates[count].getMonth() + 1}`).slice(-2)}-${(`0${dates[count].getDate()}`).slice(-2)}`),
        followerCount: 0,
        followingCount: 0,
        favouritesCount: 0,
        postsCount: 0,
        userMentions: 0,
        retweetCount: 0,
      };

      daywisesData.push(daywises);
    }
    for (const d in daywisesData) {
      for (const c in twitterInsights) {
        if (daywisesData[d].date == twitterInsights[c].date) {
          daywisesData[d].followerCount = twitterInsights[c].followerCount;
          daywisesData[d].followingCount = twitterInsights[c].followingCount;
          daywisesData[d].favouritesCount = twitterInsights[c].favouritesCount;
          daywisesData[d].postsCount = twitterInsights[c].postsCount;
          daywisesData[d].userMentions = twitterInsights[c].userMentions;
          daywisesData[d].retweetCount = twitterInsights[c].retweetCount;
        }
      }
    }

    return daywisesData;
  }

  async parseYoutubeData(youtubeInsightData) {
    const headers = _.pluck(youtubeInsightData.columnHeaders, 'name');
    const result = [];

    for (const itr of youtubeInsightData.rows) {
      const data = {};

      for (let i = 0; i < itr.length; i++) {
        data[`${headers[i]}`] = itr[i];
      }
      result.push(data);
    }
    const data = await this.getTotalData(result);

    return data;
  }

  async parseYoutubeDataOld(youtubeInsightData) {
    const keyValue = []; const
      data = [];

    youtubeInsightData.columnHeaders.map((x) => { keyValue.push(x.name); });
    youtubeInsightData.rows.map((x) => {
      const value = {};
      let i = 0;

      x.map((y) => {
        value[keyValue[i++]] = y;
      });
      data.push(value);
    });

    return data;
  }

  async getTotalData(result) {
    let totalAverageViewDuration = 0;
    let totalLikes = 0;
    let totalDislikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSubscribersGained = 0;
    let totalSubscribersLost = 0;
    let totalViews = 0;
    const daywises = [];

    result.map((x) => {
      totalAverageViewDuration += x.averageViewDuration,
      totalLikes += x.likes,
      totalDislikes += x.dislikes,
      totalComments += x.comments,
      totalShares += x.shares,
      totalSubscribersGained += x.subscribersGained,
      totalSubscribersLost += x.subscribersLost,
      totalViews += x.views;
      daywises.push(x);
    });

    return {
      total: {
        totalAverageViewDuration,
        totalLikes,
        totalDislikes,
        totalComments,
        totalShares,
        totalSubscribersGained,
        totalSubscribersLost,
        totalViews,
      },
      daywises,
    };
  }
}

export default new NetworkService();
