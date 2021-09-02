import moment from 'moment';
import lodash from 'lodash';
import db from '../Sequelize-cli/models/index.js';
import CoreServices from '../Services/core.services.js';
import PublishedPostsMongoModel from '../Mongoose/models/published-posts.js';
import TeamInsightsMongoModel from '../Mongoose/models/team-insights.js';

const socialAccount = db.social_accounts;
const userTeamJoinTable = db.join_table_users_teams;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const accountFeedsUpdateTable = db.social_account_feeds_updates;
const coreServices = new CoreServices();
const teamInfo = db.team_informations;
const updateFriendsTable = db.social_account_friends_counts;

class UserAccountTeamLibs {
  isTeamValidForUser(userId, teamId) {
    return new Promise((resolve, reject) => userTeamJoinTable.findOne({
      where: {
        user_id: userId,
        team_id: teamId,
        left_from_team: false,
      },
      attributes: ['id', 'user_id'],
    })
      .then((result) => {
        if (result) resolve();
        else throw new Error('User not belongs to the team!');
      })
      .catch((error) => {
        reject(error);
      }));
  }

  isAccountValidForTeam(teamId, accountId) {
    return new Promise((resolve, reject) => teamSocialAccountJoinTable.findOne({
      where: {
        account_id: accountId,
        team_id: teamId,
        is_account_locked: 0,
      },
    })
      .then((result) => {
        if (result) resolve();
        else throw new Error('Account isnt belongs to team or account is locked for the team!');
      })
      .catch((error) => {
        reject(error);
      }));
  }

  isTeamAccountValidForUser(userId, teamId, accountId) {
    return new Promise((resolve, reject) => this.isTeamValidForUser(userId, teamId)
      .then(() => this.isAccountValidForTeam(teamId, accountId))
      .then(() => resolve())
      .catch((error) => { reject(error); }));
  }

  getUserTeams(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject(new Error('Invalid userId'));
      } else {
        return userTeamJoinTable.findAll({
          where: { user_id: userId, left_from_team: 0, invitation_accepted: 1 },
          attributes: ['id', 'team_id'],
        })
          .then((response) => {
            const teamIds = [];

            response.map((element) => {
              if (element.team_id) teamIds.push(element.team_id);
            });

            resolve(teamIds);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  getAccountsTeam(accountId) {
    return new Promise((resolve, reject) => teamSocialAccountJoinTable.findAll({
      where: {
        account_id: accountId,
        is_account_locked: false,
      },
      attributes: ['id', 'team_id'],
    }).then((teams) => {
      const teamIds = [];

      teams.map((element) => {
        if (element.team_id) teamIds.push(element.team_id);
      });
      resolve(teamIds);
    }).catch((error) => {
      reject(error);
    }));
  }

  isAccountValidForUser(userId, accountId) {
    return new Promise((resolve, reject) => {
      let accountTeams = [];
      let userTeams = [];

      return this.getUserTeams(userId)
        .then((userTeam) => {
          userTeams = userTeam;

          return this.getAccountsTeam(accountId);
        })
        .then((accountTeam) => {
          accountTeams = accountTeam;
          const intersectTeams = lodash.intersection(accountTeams, userTeams);

          resolve({ isValid: intersectTeams.length > 0, intersectTeams });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getSocialAccount(accountType, accountId, userId, teamId) {
    return new Promise((resolve, reject) => {
      if (!accountType || !accountId || !userId || !teamId) {
        reject(new Error('Please verify your inputs: 1. Account id, \n\r 2.Team id'));
      } else {
        return this.isTeamAccountValidForUser(userId, teamId, accountId)
          .then(() => socialAccount.findOne({
            where: {
              account_type: accountType,
              account_id: accountId,
            },
          }))
          .then((accountDetails) => {
            if (!accountDetails) {
              accountType = accountType instanceof Array ? accountType[0] : accountType;
              const networkName = coreServices.getNetworkName(accountType);

              throw new Error(`No profile found or account isn't ${networkName.toLowerCase()} profile.`);
            } else resolve(accountDetails);
          })
          .catch((error) => reject(error));
      }
    });
  }

  getArchivedAccountDetail(social_id) {
    // return .findAll({},where:{social_id })
    // social_id = ["1.0865079965475553e18","1.0778389380294533e18"]
    return new Promise((resolve, reject) => socialAccount.findAll({
      //  where: {
      //    social_id : {$in social_id}
      // }
      // attributes: ["id", 'team_id']
    })
      .then((response) => {
        const account = [];

        for (const count in response) {
          for (const id in social_id) {
            if (response[count].social_id == social_id[id]) {
              response[count].dataValues.status = 1;

              account.push(response[count]);
            }
          }
        }

        const data = {
          totalAccount: account.length,

          accountDetails: account,
        };

        resolve(data);
      })
      .catch((error) => reject(error)));
  }

  isNeedToFetchRecentPost(accountId, frequencyValue, frequencyFactor) {
    return new Promise((resolve, reject) => {
      if (!accountId || !frequencyValue || !frequencyFactor) {
        reject(new Error('Please verify account id valid or not!'));
      } else {
        return accountFeedsUpdateTable.findOne({
          where: {
            account_id: accountId,
          },
        })
          .then((result) => {
            if (!result) resolve(true);
            else {
              const difference = moment.tz(new Date(), 'GMT').diff(moment.tz(result.updated_at, 'GMT'), frequencyFactor);

              resolve(difference > frequencyValue);
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  createOrEditLastUpdateTime(accountId, socialId) {
    return new Promise((resolve, reject) => {
      if (!accountId) {
        reject(new Error('Please verify account id!'));
      } else {
        return accountFeedsUpdateTable.findOne({
          where: { account_id: accountId },
        })
          .then((result) => {
            if (!result) {
              return accountFeedsUpdateTable.create({
                account_id: accountId,
                social_id: socialId,
                updated_at: moment.utc().format(),
              });
            }

            return result.update({ updated_at: moment.utc().format() });
          })
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  }

  createOrUpdateTeamReport(teamId, update) {
    return new Promise((resolve, reject) => {
      if (!teamId) throw new Error('TeamId cant be null');
      else {
        let teamDetails = null;
        const SocialAccountStats = {};

        SocialAccountStats.facebookStats = [];
        SocialAccountStats.twitterStats = [];
        SocialAccountStats.instagramStats = [];
        SocialAccountStats.youtubeStats = [];
        let teamMembers = 0;
        let invitedList = 0;
        let socialProfiles = 0;
        let data = {};
        let updatedData = {};
        let teamname = null;
        let temalogo = null;
        let leftTeamMem = 0;

        return teamInfo.findAll({
          where: {
            team_id: teamId,
          },
          attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
          include: [{
            model: socialAccount,
            as: 'SocialAccount',
            attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
            through: {
              attributes: ['is_account_locked'],
            },
          }],
        })
          .then((teamSocialAccounts) => {
            teamDetails = teamSocialAccounts;
            console.log(`teamDetai12 ${JSON.stringify(teamDetails)}`);
            teamname = teamDetails[0].team_name;
            temalogo = teamDetails[0].team_logo;

            return userTeamJoinTable.findAll({
              where: {
                team_id: teamId,
              },
              attributes: ['id', 'team_id', 'invitation_accepted', 'left_from_team', 'permission', 'user_id'],
              raw: true,
            });
          })
          .then((teamMembersData) => {
            teamMembersData.forEach((element) => {
              if (element.invitation_accepted == true) {
                teamMembers += 1;
              }
              if (element.invitation_accepted == false) {
                invitedList += 1;
              }
              if (element.left_from_team == true) {
                leftTeamMem += 1;
              }
            });

            return Promise.all(teamDetails.map((accounts) => {
              socialProfiles = accounts.SocialAccount.length;

              return Promise.all(accounts.SocialAccount.map((account) => {
                let fields = [];

                switch (Number(account.account_type)) {
                  case 1:
                    fields = ['account_id', 'friendship_count', 'page_count'];
                    break;
                  case 4:
                    fields = ['account_id', 'follower_count', 'following_count', 'total_like_count', 'total_post_count'];
                    break;
                  case 5:
                    fields = ['account_id', 'friendship_count', 'follower_count', 'following_count', 'total_post_count'];
                    break;
                  case 9:
                    fields = ['account_id', 'subscription_count', 'total_post_count'];
                    break;
                  default:
                    break;
                }
                if (fields.length > 0) {
                  return updateFriendsTable.findOne({
                    where: { account_id: account.account_id },
                    attributes: fields,
                    raw: true,
                  })
                    .then((resultData) => {
                      const data = resultData;

                      switch (Number(account.account_type)) {
                        case 1:
                          SocialAccountStats.facebookStats.push({ facebookStats: data });
                          break;
                        case 4:
                          SocialAccountStats.twitterStats.push({ twitterStats: data });
                          break;
                        case 5:
                          SocialAccountStats.instagramStats.push({ instagramStats: data });
                          break;
                        case 9:
                          SocialAccountStats.youtubeStats.push({ youtubeStats: data });
                          break;
                        default:
                          break;
                      }
                    })
                    .catch((error) => {
                      throw error;
                    });
                }
              }));
            }));
          })
          .then(() => {
            const publishedPostsMongoModelObject = new PublishedPostsMongoModel();

            return publishedPostsMongoModelObject.getTeamPublishedCount(teamId);
          })
          .then((publishedCount) => {
            const datas = [];

            data = {
              teamId,
              insights: {
                teamName: teamname,
                teamLogo: temalogo,
                teamMembersCount: teamMembers,
                invitedList,
                leftTeamMem,
                socialProfilesCount: socialProfiles,
                publishCount: publishedCount,
                SocialAccountStats,
              },
            };
            datas.push(data);
            updatedData = [{
              teamName: teamname,
              teamLogo: temalogo,
              teamMembersCount: teamMembers,
              invitedList,
              leftTeamMem,
              socialProfilesCount: socialProfiles,
              publishCount: publishedCount,
              SocialAccountStats,
            }];
            const teamInsightsMongoModelObject = new TeamInsightsMongoModel();
            // insertInsights(data) then addTeamInsights(teamId, updatedData)
            // update or insert, Update status is', update, 'update data is \n\n', updatedData;

            if (!update || update == null || update == false) return teamInsightsMongoModelObject.insertInsights(datas);

            return teamInsightsMongoModelObject.addTeamInsights(teamId, updatedData);
          })
          .then(() => {
            resolve(updatedData);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  createOrUpdateFriendsList(accountId, data) {
    return new Promise((resolve, reject) => {
      if (!accountId || !data) {
        reject(new Error('Please verify account id or data to update!'));
      } else {
        // Fetching details of friends stats of an account
        return updateFriendsTable.findOne({
          where: { account_id: accountId },
        })
          .then((result) => {
            if (!result) {
              // If not found, Adding details to that table
              return updateFriendsTable.create({
                account_id: accountId,
                friendship_count: data.friendship_count == undefined ? null : data.friendship_count,
                follower_count: data.follower_count == undefined ? null : data.follower_count,
                following_count: data.following_count == undefined ? null : data.following_count,
                page_count: data.page_count == undefined ? null : data.page_count,
                group_count: data.group_count == undefined ? null : data.group_count,
                board_count: data.board_count == undefined ? null : data.board_count,
                subscription_count: data.subscription_count == undefined ? null : data.subscription_count,
                total_like_count: data.total_like_count == undefined ? null : data.total_like_count,
                total_post_count: data.total_post_count == undefined ? null : data.total_post_count,
                bio_text: data.bio_text ? data.bio_text : null,
                profile_picture: data.profile_picture ? data.profile_picture : null,
                cover_picture: data.cover_picture ? data.cover_picture : null,
                updated_date: moment.utc().format(),
              });
            }

            return result.update({
              friendship_count: data.friendship_count == undefined ? null : data.friendship_count,
              follower_count: data.follower_count == undefined ? null : data.follower_count,
              following_count: data.following_count == undefined ? null : data.following_count,
              page_count: data.page_count == undefined ? null : data.page_count,
              group_count: data.group_count == undefined ? null : data.group_count,
              board_count: data.board_count == undefined ? null : data.board_count,
              subscription_count: data.subscription_count == undefined ? null : data.subscription_count,
              total_like_count: data.total_like_count == undefined ? null : data.total_like_count,
              total_post_count: data.total_post_count == undefined ? null : data.total_post_count,
              bio_text: data.bio_text ? data.bio_text : null,
              profile_picture: data.profile_picture ? data.profile_picture : null,
              cover_picture: data.cover_picture ? data.cover_picture : null,
              updated_date: moment.utc().format(),
            });
          })
          .then((data) => resolve(data))
          .catch((error) => reject(error));
      }
    });
  }
}

export default UserAccountTeamLibs;
