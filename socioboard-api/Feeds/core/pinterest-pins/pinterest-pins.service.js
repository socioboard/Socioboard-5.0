import config from 'config';
import Validate from './pinterest-pins.validate.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import {
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import PinterestMongoPinsModel from '../../../Common/Mongoose/models/pinterest-pins.js';
import PinterestConnect from '../../../Common/Cluster/pinterest.newcluster.js';
import logger from './../../resources/log/logger.log.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
const accountUpdateTable = db.social_account_feeds_updates;
const Pincluster = new PinterestConnect();
class FeedService {
  constructor() {
    Object.assign(this, userTeamAccounts);
  }

  /**
   * TODO To Fetch the Pinterest Pins for specific Boards
   * Function to Fetch Pinterest Pins for specific Boards
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns  Pinterest Pins for specific Boards
   */
  async getPinterestPins(req, res, next) {
    try {
      const {accountId, boardId, teamId, pageId} = req.query;
      const {value, error} = Validate.validatePinterstAcc({
        accountId,
        boardId,
        teamId,
        pageId,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        11,
        accountId,
        req.body.userScopeId,
        teamId
      );
      const pins = await this.getPins(
        req.body.userScopeId,
        accountId,
        boardId,
        teamId,
        pageId
      );
      const data = {socialAccountDetails, pins};
      return SuccessResponse(res, data);
    } catch (err) {
      logger.error(`Error while getting the Pinterest Pins ${err.message}`);
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Get Recent Pinterest Pins
   * Function To Get Recent Pinterest Pins
   * @param {number} userId - User Id
   * @param {number} accountId - Pinterest Id.
   * @param {number} boardId - Board Id.
   * @param {number} teamId - Team Id
   * @param {number} pageId - Pagination Id
   * @returns {object} Pinterest Pins
   */
  async getPins(userId, accountId, boardId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return userTeamAccounts
        .isNeedToFetchRecentPin(
          accountId,
          boardId,
          config.get('pinterest.update_time_frequency_value'),
          config.get('pinterest.update_time_frequency_factor')
        )
        .then(isRunRecentPost => {
          if (isRunRecentPost) {
            let socialAccountInfo = {};
            let feeds = [];
            return this.getSocialAccount(11, accountId, userId, teamId)
              .then(socialAccountDetails => {
                socialAccountInfo = socialAccountDetails;
                return accountUpdateTable
                  .findOne({
                    where: {account_id: accountId, boardId},
                    attributes: ['updated_at'],
                    raw: true,
                  })
                  .then(updatedAccountData => {
                    if (updatedAccountData && updatedAccountData.updated_at) {
                      return Pincluster.getBoardPins(
                        socialAccountInfo.social_id,
                        boardId,
                        socialAccountInfo.access_token
                      )
                        .then(response => {
                          feeds.push(response);
                          let PinterestModel = new PinterestMongoPinsModel();
                          return PinterestModel.insertManyPins(response);
                        })
                        .catch(error => {
                          reject(error);
                        });
                    }
                  });
              })
              .then(() =>
                this.createOrEditPinUpdateTime(
                  accountId,
                  socialAccountInfo.social_id,
                  boardId
                )
                  .then(() => feeds)
                  .catch(error => {
                    logger.error(
                      `Error while fetching Recent pinterest Pins ${error.message}`
                    );
                    reject(error);
                  })
              )
              .catch(error => {
                logger.error(`Error while fetching getPins ${error.message}`);
                reject(error);
              });
          }
        })
        .then(() =>
          this.getPinsFromDB(userId, accountId, boardId, teamId, pageId)
        )
        .then(feeds => {
          resolve(feeds);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO To Get Recent Pinterest Pins
   * Function To Get Pinterest Pins
   * @param {number} userId - User Id
   * @param {number} accountId - Pinterest Id.
   * @param {number} boardId - Board Id.
   * @param {number} teamId - Team Id
   * @param {number} pageId - Pagination Id
   * @returns {object} Pinterest Pins
   */
  async getPinsFromDB(userId, accountId, boardId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      return this.getSocialAccount(11, accountId, userId, teamId)
        .then(socialAccount => {
          let offset = (pageId - 1) * config.get('perPageLimit');
          let PinterestModel = new PinterestMongoPinsModel();
          return PinterestModel.getPinterestPins(
            socialAccount.social_id,
            boardId,
            offset,
            config.get('perPageLimit')
          );
        })
        .then(response => resolve(response))
        .catch(error => {
          logger.error(`Error while getting getPinsFromDB ${error.message}`);
          reject(error);
        });
    });
  }
}
export default new FeedService();
