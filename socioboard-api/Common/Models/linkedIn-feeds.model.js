import UserTeamAccount from '../Shared/user-team-accounts.shared.js';
import LinkedInConnect from '../Cluster/linkedin.cluster.js';
import LinkedInPostMongoModels from '../Mongoose/models/linkedIn-post.js';
import config from 'config';
import db from '../Sequelize-cli/models/index.js';
import logger from '../../Feeds/resources/Log/logger.log.js';
const accountUpdateTable = db.social_account_feeds_updates;
import moment from 'moment';

class LinkedInFeedModel {
  constructor() {
    Object.assign(this, UserTeamAccount);
    this.linkedInConnect = new LinkedInConnect(config.get('linkedIn_api'));
  }

  /**
   * TODO To Get Recent LinkedIn Page Feeds
   * Function To Get Recent LinkedIn Page Feeds
   * @param  {number} accountId -LinkedIn page Id.
   * @param {number} userId -User Id
   * @param {number} teamId -Team Id
   * @param {number} pageId -Pagination Id
   * @returns {object} LinkedIn page feeds
   */
  async getRecentLinkedInFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return this.isNeedToFetchRecentPost(
        accountId,
        config.get('linkedIn_api.update_time_frequency_value'),
        config.get('linkedIn_api.update_time_frequency_factor')
      )
        .then(isRunRecentPost => {
          if (isRunRecentPost) {
            let socialAccountInfo = {};
            let feeds = [];
            return this.getSocialAccount([7], accountId, userId, teamId)
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
                      return this.fetchAllLinkedInPost(
                        socialAccountInfo.social_id,
                        socialAccountInfo.access_token
                      );
                    }
                  });
              })
              .then(() =>
                this.createOrEditLastUpdateTime(
                  accountId,
                  socialAccountInfo.social_id
                )
                  .then(() => {
                    return this.linkedInConnect.linkedInPageStats(
                      socialAccountInfo.social_id,
                      socialAccountInfo.access_token
                    );
                  })
                  .then(updateDetails => {
                    this.createOrUpdateFriendsList(
                      socialAccountInfo.account_id,
                      updateDetails
                    );
                  })
                  .then(() => feeds)
                  .catch(error => {
                    throw error;
                  })
              )
              .catch(error => {
                throw error;
              });
          }
        })
        .then(() => this.getLinkedInFeeds(userId, accountId, teamId, pageId))
        .then(feeds => resolve(feeds))
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO To Get Recent LinkedIn Page Feeds With Pagination
   * Function To Get Recent LinkedIn Page Feeds With Pagination
   * @param  {number} social_id -LinkedIn page Id.
   * @param {number} access_token -LinkedIn Page Access Token
   * @returns {object} LinkedIn page feeds
   */
  async fetchAllLinkedInPost(social_id, access_token) {
    let resultTotal = await this.fetchAllLinkedInPostloop(
      social_id,
      access_token,
      0
    );
    let loopNumber = 0;
    if (resultTotal > 100) loopNumber = resultTotal / 100;
    if (loopNumber >= 1)
      for (let i = 1; i < loopNumber; i++) {
        await this.fetchAllLinkedInPostloop(social_id, access_token, i);
      }
    return;
  }

  /**
   * TODO To Get Recent LinkedIn Page Feeds With Pagination And Store It In Mongo Db
   * Function To Get Recent LinkedIn Page Feeds With Pagination And Store It In Mongo Db
   * @param  {number} social_id -LinkedIn page Id.
   * @param {number} access_token -LinkedIn Page Access Token
   * @param {number} start -Pagination
   * @returns {object} LinkedIn page feeds
   */
  fetchAllLinkedInPostloop(social_id, access_token, start) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.linkedInConnect.getCompanyFeeds(
          social_id,
          access_token,
          start
        );
        logger.info(`fetched count : ${JSON.stringify(response)}`);
        let linkedInPostMongoModel = new LinkedInPostMongoModels();
        let insertedData = linkedInPostMongoModel.insertManyPosts(
          response.feeds
        );
        logger.info(`Element : ${JSON.stringify(insertedData)}`);
        resolve(response.total);
      } catch (error) {
        logger.error(`Error on fetching post details ${JSON.stringify(error)}`);
      }
    });
  }

  /**
   * TODO To Get Recent LinkedIn Page Feeds From Mongo Db
   * Function To Get Recent LinkedIn Page Feeds From Mongo Db
   * @param  {number} accountId -LinkedIn page Id.
   * @param {number} userId -User id
   * @param {number} pageId -Pagination Id
   * @param {number} teamId -Team Id
   * @returns {object} LinkedIn page feeds
   */
  getLinkedInFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return this.getSocialAccount([7], accountId, userId, teamId)
        .then(socialAccountDetails => {
          let offset = (pageId - 1) * config.get('perPageLimit');
          let linkedInPostMongoModel = new LinkedInPostMongoModels();
          return linkedInPostMongoModel.getSocialAccountPosts(
            socialAccountDetails.social_id,
            offset,
            pageId * config.get('perPageLimit')
          );
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO To Get Recent LinkedIn Follower Stats
   * Function To Get Recent LinkedIn Follower Stats
   * @param  {number} social_id -LinkedIn page Id.
   * @param {string} access_token -Access Token
   * @param {object} filerTime -Time
   * @returns {object} LinkedIn Follower Stats
   */
  async getFollowerStats(social_id, access_token, filerTime) {
    try {
      let data = this.linkedInConnect.getFollowerStats(
        social_id,
        access_token,
        filerTime
      );
      return data;
    } catch (error) {}
  }

  /**
   * TODO To Get Recent LinkedIn Page Stats
   * Function To Get Recent LinkedIn Page Stats
   * @param  {number} social_id -LinkedIn page Id.
   * @param {string} access_token -Access Token
   * @param {object} filerTime -Time
   * @returns {object} LinkedIn Page Stats
   */
  async getPageStats(social_id, access_token, filerTime) {
    try {
      let data = this.linkedInConnect.getPageStats(
        social_id,
        access_token,
        filerTime
      );
      return data;
    } catch (error) {}
  }

  /**
   * TODO To Get Time in milliseconds based on filter
   * Function To Get Time in milliseconds based on filter
   * @param  {number} filterPeriod -Filter type.
   * @param {date} since -Start date
   * @param {date} untill -End Date
   * @returns {object} Start and end date with milliseconds
   */
  async getFilteredPeriod(filterPeriod, since, untill) {
    return new Promise((resolve, reject) => {
      switch (Number(filterPeriod)) {
        case 1:
          since = moment().utc().startOf('day').valueOf();
          untill = moment().utc().add(1, 'day').endOf('day').valueOf();
          break;
        case 2:
          since = moment().utc().subtract(1, 'days').startOf('day').valueOf();
          untill = moment()
            .utc()
            .add(1, 'day')
            .subtract(1, 'days')
            .endOf('day')
            .valueOf();
          break;
        case 3:
          since = moment().utc().subtract(6, 'days').startOf('day').valueOf();
          untill = moment().utc().add(1, 'day').endOf('day').valueOf();
          break;
        case 4:
          since = moment().utc().subtract(31, 'days').startOf('day').valueOf();
          untill = moment().utc().add(1, 'day').valueOf();
          break;
        case 5:
          since = moment().utc().startOf('month').valueOf();
          untill = moment().utc().add(1, 'day').valueOf();
          break;
        case 6:
          since = moment()
            .utc()
            .startOf('month')
            .subtract(1, 'days')
            .startOf('month')
            .valueOf();
          untill = moment()
            .utc()
            .startOf('month')
            .subtract(1, 'days')
            .endOf('month')
            .valueOf();
          break;
        case 7:
          if (filterPeriod == 7) {
            if (!since || !untill) throw new Error('Invalid Inputs');
            else {
              since = moment(since)
                .utc()
                .add(1, 'day')
                .startOf('day')
                .valueOf();
              untill = moment(untill)
                .utc()
                .add(2, 'day')
                .endOf('day')
                .valueOf();
            }
          }
          break;
        default:
          throw new Error('please choose valid filter type');
      }
      if (since <= untill) {
        resolve({since, untill});
      } else {
        throw new Error(
          'Check range values.since should be lesser than or equals to until'
        );
      }
    });
  }
}
export default LinkedInFeedModel;
