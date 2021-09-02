import config from 'config';
import db from '../Sequelize-cli/models/index.js';
import PublishedPost from '../Mongoose/models/published-posts.js';
import logger from '../../Publish/resources/Log/logger.log.js';
import CoreServices from '../Services/core.services.js';
import UserTeamAccountLibs from '../Shared/user-team-accounts-libs.shared.js';

const socialAccount = db.social_accounts;
const scheduleDetails = db.users_schedule_details;
const Operator = db.Sequelize.Op;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;

class ReportModel {
  constructor() {
    this.coreServices = new CoreServices();
    this.userTeamAccountLibs = new UserTeamAccountLibs();
  }

  async getTodayPostedCount(userId, teamId, accountId) {
    try {
      const checkTeamValisForUser = await this.userTeamAccountLibs.isTeamAccountValidForUser(userId, teamId, accountId);
      const publishedPostObject = new PublishedPost();
      const postCount = await publishedPostObject.getTodayPostsCount(accountId);

      return postCount;
    } catch (error) {
      throw error;
    }
  }

  async getXDayPublishCount(userId, dayCount) {
    try {
      const reportDetails = [];
      const socialAcc = await socialAccount.findAll({
        where: {
          account_admin_id: userId,
          account_type: [2, 4, 6, 7, 11],
        },
      });

      if (!socialAcc) throw new Error('Sorry, You dont have any social profiles to fetch reports');
      else {
        logger.info(`Total account count : ${socialAcc.length}`);
        const publishedPostObject = new PublishedPost();
        const list = await socialAcc.map(async (account) => {
          const count = await publishedPostObject.getXdaysPostsCount(account.account_id, dayCount);
          const accountDetails = {
            accountId: account.account_id,
            accountType: account.account_type,
            firstName: account.first_name,
            lastName: account.last_name,
            network: this.coreServices.getNetworkName(account.account_type),
            publishedCount: count,
          };

          reportDetails.push(accountDetails);
        });
        const data = await Promise.all(list);

        return reportDetails;
      }
    } catch (error) {
      throw error;
    }
  }

  async getAccountwisePublishCount(userId) {
    try {
      const reportDetails = [];
      const socialAcc = await socialAccount.findAll({
        where: {
          account_admin_id: userId,
          account_type: [2, 4, 6, 7, 11],
        },
      });

      if (!socialAcc) throw new Error('Sorry, You dont have any social profiles to fetch reports');
      else {
        logger.info(`Total account count : ${socialAcc.length}`);
        const publishedPostObject = new PublishedPost();
        const list = await socialAcc.map(async (account) => {
          const count = await publishedPostObject.getAccountPublishCount(account.account_id);
          const accountDetails = {
            accountId: account.account_id,
            accountType: account.account_type,
            firstName: account.first_name,
            lastName: account.last_name,
            profilePicUrl: account.profile_pic_url,
            network: this.coreServices.getNetworkName(account.account_type),
            publishedCount: count,
          };

          reportDetails.push(accountDetails);
        });
        const data = await Promise.all(list);

        return reportDetails;
      }
    } catch (error) {
      throw error;
    }
  }

  async getSchedulePublishedReport(scheduleId, userId, pageId) {
    try {
      const publishedPostObject = new PublishedPost();
      const result = await scheduleDetails.findOne({ where: { schedule_id: scheduleId, user_id: userId } });

      if (!result) {
        throw new Error('Sorry, Cant able to get schedule report due following reason. 1.Invalid user Id, 2.Invalid schedule Id');
      } else {
        const publishedDetails = await publishedPostObject.getSchedulePublishedReport(result.mongo_schedule_id, ((pageId - 1) * config.get('perPageLimit')), config.get('perPageLimit'));

        if (publishedDetails) return publishedDetails;
      }
    } catch (error) {
      throw error;
    }
  }

  async getAccountPublishedReport(userId, accountId, teamId, pageId) {
    try {
      if (accountId != 0) {
        const checkTeamValid = await this.userTeamAccountLibs.isTeamValidForUser(userId, teamId);
        const accountValidTeam = await this.userTeamAccountLibs.isAccountValidForTeam(teamId, accountId);
        const publishedPostObject = new PublishedPost();
        const publishedDetails = await publishedPostObject.getAccountPublishedReport(accountId, teamId, ((pageId - 1) * config.get('perPageLimit')), config.get('perPageLimit'));

        return publishedDetails;
      }

      const checkTeamValid = await this.userTeamAccountLibs.isTeamValidForUser(userId, teamId);
      const publishedPostObject = new PublishedPost();
      const publishedDetails = await publishedPostObject.getAccountPublishedReport(0, teamId, ((pageId - 1) * config.get('perPageLimit')), config.get('perPageLimit'));

      return publishedDetails;
    } catch (error) {
      throw error;
    }
  }

  getTwitterMessage(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !userId || !teamId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamAccountValidForUser(userId, teamId, accountId)
          .then(() => socialAccount.findOne({
            where: {
              [Operator.and]: [{
                account_type: 4,
              }, {
                account_id: accountId,
              }],
            },
            attributes: ['account_id', 'social_id'],
          }))
          .then((socialAccount) => {
            if (socialAccount == null) throw new Error("No profile found or account isn't twitter profile.");
            else {
              const offset = (pageId - 1) * config.get('perPageLimit');
              const twitterMongoMessageModelObject = new TwitterMongoMessageModel();

              return twitterMongoMessageModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
            }
          })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  getMessageBetweenTwoUsers(accountId, receiverId, pageId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !receiverId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return socialAccount.findOne({
          where: {
            [Operator.and]: [{
              account_type: 4,
            }, {
              account_id: accountId,
            }],
          },
          attributes: ['account_id', 'social_id'],
        })
          .then((socialAccount) => {
            if (socialAccount == null) throw new Error("No profile found or account isn't twitter profile.");
            else {
              const offset = (pageId - 1) * config.get('perPageLimit');
              const twitterMongoMessageModelObject = new TwitterMongoMessageModel();

              return twitterMongoMessageModelObject.getMessageBetweenTwoUsers(socialAccount.social_id, receiverId, offset, config.get('perPageLimit'));
            }
          })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  getPreviouslyMessagedUsers(accountId, pageId) {
    return new Promise((resolve, reject) => {
      if (!accountId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return socialAccount.findOne({
          where: {
            [Operator.and]: [{
              account_type: 4,
            }, {
              account_id: accountId,
            }],
          },
          attributes: ['account_id', 'social_id', 'user_name'],
        })
          .then((socialAccount) => {
            if (socialAccount == null) throw new Error("No profile found or account isn't twitter profile.");
            else {
              const offset = (pageId - 1) * config.get('perPageLimit');
              const twitterMongoMessageModelObject = new TwitterMongoMessageModel();

              return twitterMongoMessageModelObject.getPreviouslyMessagedUsers(socialAccount.social_id, socialAccount.user_name, offset, config.get('perPageLimit'));
            }
          })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }
}

export default ReportModel;
