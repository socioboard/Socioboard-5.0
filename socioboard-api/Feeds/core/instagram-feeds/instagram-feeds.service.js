import config from 'config';
import Validate from './instagram-feeds.validate.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import InstaMongoPostModel from '../../../Common/Mongoose/models/instagram-posts.js';
import InstaBusinessMongoPostModel from '../../../Common/Mongoose/models/instagram-business-posts.js';
import FeedsLibs from '../../../Common/Models/feeds.model.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
import FacebookHelper from '../../../Common/Cluster/facebook.cluster.js';
import InstaConnect from '../../../Common/Cluster/instagram.cluster.js';
import logger from './../../resources/log/logger.log.js'

const accountUpdateTable = db.social_account_feeds_updates;
import {
  ErrorResponse,
  SuccessResponse,
  SuccessResponsePublishLimit,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';

const feedsLibs = new FeedsLibs();

 class FeedsService {
  constructor() {
    Object.assign(this, userTeamAccounts);
    this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
    this.instagramConnect = new InstaConnect(config.get('instagram_api'));
}

   /**
 * TODO To Fetch the Instagram Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */
  async getInstaFeeds(req, res, next) {
    try {
      const { accountId, teamId, pageId } = req.query;
      const { value, error } = Validate.validateAccountIdTeamId({accountId, teamId, pageId});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(5,accountId,req.body.userScopeId,teamId);
      const feeds = await  this.getRecentInstaFeeds(req.body.userScopeId,accountId,teamId,pageId)
      const data = { socialAccountDetails, feeds };
      return SuccessResponse(res, data);
    } catch (err) {
      logger.error(`Error while get getInstaFeeds ${err.message}`);
      return CatchResponse(res, err.message);
    }
  }

  /**
 * TODO To Fetch the Instagram Business Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Business Feeds
 */
  async getInstaBusinessFeeds(req, res, next) {
    try {
      const { accountId, teamId, pageId } = req.query;
      const { value, error } = Validate.validateAccountIdTeamId({accountId, teamId, pageId});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(12,accountId,req.body.userScopeId,teamId);
      const feeds = await  this.getRecentInstaBusinessFeeds(req.body.userScopeId,accountId,teamId,pageId);
      const SocialAccountStats = await feedsLibs.socialAccountStats(accountId);
      const data = { socialAccountDetails, SocialAccountStats,feeds };
      return SuccessResponse(res, data);
    } catch (err) {
      logger.error(`Error while get getInstaBusinessFeeds ${err.message}`);
      return CatchResponse(res, err.message);
    }
  }
  
  /**
 * TODO To Fetch the Instagram Business Publish Limit
 * Function to Fetch the Instagram Business Publish Limit
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Publish limit
 */
  async getInstaBusinessPublishLimit(req, res, next) {
    try {
         const accountIds=req.body
         const {  teamId } = req.query;
         const { value, error } = Validate.validateAccountIdsTeamId({accountIds,teamId});
       if (error) return ValidateErrorResponse(res, error.details[0].message);
       
        const list = await accountIds.map(async(t) => {
           let socialAccountDetails = await userTeamAccounts.getSocialAccount(12,t,req.body.userScopeId,teamId);
           let limit= await this.facebookHelper.getInstaBusinessPublishLimit(socialAccountDetails.social_id,socialAccountDetails.access_token)                  
           let msg={
             accountId:t,
             first_name:socialAccountDetails.first_name,
             limit
              }
              return msg;
        });
        const data = await Promise.all(list);
        return SuccessResponse(res, data);
     } catch (err) {
      logger.error(`Error while get getInstaBusinessFeeds ${err.message}`);
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Get Recent Insta Feeds 
   * Function To Get Insta Feeds
   * @param {number} accountId - Insta Id
   * @param {number} userId -User Id
   * @param {number} teamId -Team Id
   * @param {number} pageId -Pagination Id
   * @returns {object} InstaBusiness  feeds
   */
  async getRecentInstaFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return this.isNeedToFetchRecentPost(
        accountId,
        config.get('instagram_api.update_time_frequency_value'),
        config.get('instagram_api.update_time_frequency_factor')
      )
        .then(isRunRecentPost => {
          if (isRunRecentPost) {
            let socialAccountInfo = {},feeds = [];
            return this.getSocialAccount(5,accountId,userId,teamId)
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
                      return this.instagramConnect
                      .getInstagramFeeds(
                        socialAccountInfo.access_token,
                        socialAccountInfo.social_id
                      )
                      .then((response)=>{
                        feeds=response.feeds;
                       const instaObject = new InstaMongoPostModel();
                       return instaObject.insertManyPosts(response)
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
                  logger.error(`Error while fetching getRecentInstaFeeds ${error.message}`)
                    throw error;
                  })
              )
              .catch(error => {
                logger.error(`Error while fetching getRecentInstaFeeds outter catch ${error.message}`)
                throw error;
              });
          }
        })
        .then(() => this.getInstaFeedsFromDB(userId, accountId, teamId, pageId))
        .then(feeds => resolve(feeds))
        .catch(error => {
          reject(error);
        });
    });
  }
  /**
   * TODO To Get Recent Insta Business Feeds 
   * Function To Get Insta Business  Feeds
   * @param {number} accountId - Insta Business Id.
   * @param {number} userId -User Id
   * @param {number} teamId -Team Id
   * @param {number} pageId -Pagination Id
   * @returns {object} InstaBusiness  feeds
   */
  async getRecentInstaBusinessFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return this.isNeedToFetchRecentPost(
        accountId,
        config.get('instagram_api.update_time_frequency_value'),
        config.get('instagram_api.update_time_frequency_factor')
      )
        .then(isRunRecentPost => {
            if (isRunRecentPost) {
            let socialAccountInfo = {};
            let feeds = [];
            return this.getSocialAccount(12, accountId, userId, teamId)
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
                      return this.facebookHelper.getMediasFromInstagram(
                        socialAccountInfo.access_token,
                        socialAccountInfo.social_id
                      )
                      .then((response)=>{
                        feeds=response.feeds;
                       const instaObject = new InstaBusinessMongoPostModel();
                       return instaObject.insertManyPosts(response.feeds)
                      })

                    }
                  });
              })
               .then(() =>
                this.createOrEditLastUpdateTime(
                  accountId,
                  socialAccountInfo.social_id
                )
                .then(async()=>{
                  let profile_pic= await this.facebookHelper.getRecentInstaProfilePicture(socialAccountInfo.access_token)                  
                  this.updateProfilePicture(profile_pic,socialAccountInfo.social_id)
                })

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
        .then(() => this.getInstaBusinessFeedsFromDB(userId, accountId, teamId, pageId))
        .then(feeds => resolve(feeds))
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO To Get Recent Insta Feeds from DB
   * Function To Get Insta Feeds from DB
   * @param {number} accountId - Insta  Id.
   * @param {number} userId -User Id
   * @param {number} teamId -Team Id
   * @param {number} pageId -Pagination Id
   * @returns {object} InstaBusiness  feeds
   */
 async getInstaFeedsFromDB(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
            return this.getSocialAccount(5, accountId, userId, teamId)
                .then((socialAccount) => {
                    let offset = (pageId - 1) * config.get('perPageLimit');
                    const instaObject = new InstaMongoPostModel();
                return instaObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
                })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                  logger.error(`Error while getting getInstaFeedsFromDB ${error.message}`)
                   reject(error);
                });
              });
  }
  /**
   * TODO To Get Recent Insta Business Feeds from DB
   * Function To Get Insta Business  Feeds from DB
   * @param {number} accountId - Insta Business Id.
   * @param {number} userId -User Id
   * @param {number} teamId -Team Id
   * @param {number} pageId -Pagination Id
   * @returns {object} InstaBusiness  feeds
   */
 async getInstaBusinessFeedsFromDB(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
            return this.getSocialAccount(12, accountId, userId, teamId)
                .then((socialAccount) => {
                    let offset = (pageId - 1) * config.get('perPageLimit');
                    let InstagramBusinessMongoPostModelObject = new InstaBusinessMongoPostModel();
                    return InstagramBusinessMongoPostModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
                })
                .then(response=>resolve(response))
                .catch((error) => {
                  logger.error(`Error while getting getInstaBusinessFeedsFromDB ${error.message}`)
                  reject(error);
                });
              });
  }

}



export default new FeedsService();
