import config from 'config';
import Validate from './tumblr-feeds.validate.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import { SuccessResponse, CatchResponse, ValidateErrorResponse, ErrorResponse } from '../../../Common/Shared/response.shared.js';
import TumblrMongoPostModel from '../../../Common/Mongoose/models/tumblr-post.js';
import TumblrConnect from '../../../Common/Cluster/tumblr.cluster.js';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import logger from './../../resources/log/logger.log.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
const accountUpdateTable = db.social_account_feeds_updates;

const feedsLibs = new FeedsLibs();




class FeedService{
  constructor() {
    Object.assign(this, userTeamAccounts);
  }
/**
 * TODO To Fetch the Tumblr  Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Tumblr Feeds
 */  
  async getTumblrFeeds(req,res,next){
    try {
      const { accountId, teamId, pageId } = req.query;
      const { value, error } = Validate.validateAccountIdTeamId({accountId, teamId, pageId});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(16,accountId,req.body.userScopeId,teamId);
      const feeds = await  this.getRecentTumblrFeeds(req.body.userScopeId,accountId,teamId,pageId);
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = { socialAccountDetails,SocialAccountStats,feeds };
      return SuccessResponse(res,data);
    } catch (err) {
      logger.error(`Error while getting the Tumblr Feeds ${err.message}`);
      return CatchResponse(res, err.message);
    }
 }
  
 /**
   * TODO To Get Recent Tumblr Feeds 
   * Function To Get Tumblr Feeds
   * @param {number} accountId - Tumblr Business Id.
   * @param {number} userId - User Id
   * @param {number} teamId - Team Id
   * @param {number} pageId - Pagination Id
   * @returns {object} Tumblr Feeds
   */
  async getRecentTumblrFeeds(userId, accountId, teamId, pageId) {
      return new Promise((resolve, reject) => {
      return this.isNeedToFetchRecentPost(
        accountId,
        config.get('tumblr_api.update_time_frequency_value'),
        config.get('tumblr_api.update_time_frequency_factor')
      )
      .then(isRunRecentPost => {
            if (isRunRecentPost) {
            let socialAccountInfo = {};
            let feeds = [];
            return this.getSocialAccount(16, accountId, userId, teamId)
              .then(socialAccountDetails => {
                socialAccountInfo = socialAccountDetails;
                return accountUpdateTable
                  .findOne({
                    where: {account_id: accountId},
                    attributes: ['updated_at'],
                    raw: true,
                  })
                  .then(updatedAccountData => {
                    if (updatedAccountData && updatedAccountData.updated_at) {
                    return TumblrConnect.getBlogPostDetails(config.get('tumblr_api.OAuth_consumer_Key'),socialAccountInfo.social_id)
                   .then((response)=>{
                    feeds.push(response)
                    logger.info(`Recent Tumblr Feed Fetched count from getRecentTumblrFeeds  : ${response.length}`);
                    let TumblrMongoPostModelObject = new TumblrMongoPostModel();
                    return TumblrMongoPostModelObject.insertManyPosts(response)
                    })

                    }
                  });
              })
               .then(() =>
                this.createOrEditLastUpdateTime(
                  accountId,
                  socialAccountInfo.social_id
                )
                .then(() => feeds)
                .catch(error => {
                  logger.error(`Error while fetching getRecentInstaBusinessFeeds ${error.message}`)
                  throw error;
                  })
              )
              .catch(error => {
                logger.error(`Error while fetching getRecentInstaBusinessFeeds ${error.message}`)
                throw error;
              });
          }
        })
        .then(() => this.getTumblrFeedsFromDB(userId, accountId, teamId, pageId))
        .then(feeds => {
           resolve(feeds)
          })
        .catch(error => {
          reject(error);
        });
    });

 }

 /**
   * TODO To Get Tumblr Feeds from DB
   * Function To Get Tumblr Feeds from DB
   * @param {number} accountId - Tumblr  Id.
   * @param {number} userId - User Id
   * @param {number} teamId - Team Id
   * @param {number} pageId - Pagination Id
   * @returns {object} Tumblr  feeds
   */
 async getTumblrFeedsFromDB(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
            return this.getSocialAccount(16, accountId, userId, teamId)
                .then((socialAccount) => {
                    let offset = (pageId - 1) * config.get('perPageLimit');
                    let TumblrMongoPostModelObject = new TumblrMongoPostModel();
                    return TumblrMongoPostModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
                })
                .then(response=>resolve(response))
                .catch((error) => {
                  logger.error(`Error while getting getTumblrFeedsFromDB ${error.message}`)
                  reject(error);
                });
              });
  }

}
export  default new FeedService()