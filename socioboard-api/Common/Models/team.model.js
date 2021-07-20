import db from '../Sequelize-cli/models/index.js';
import AuthorizeServices from '../Services/authorize.services.js';
import config from 'config';
import TwtConnect from '../Cluster/twitter.cluster.js';
import CoreServices from '../Services/core.services.js';
import schedule from 'node-schedule';
import moment from 'moment';
import logger from '../../User/resources/Log/logger.log.js';
import FbConnect from '../Cluster/facebook.cluster.js';
import PinterestConnect from '../Cluster/pinterest.cluster.js';
import LinkedInConnect from '../Cluster/linkedin.cluster.js';
import GoogleConnect from '../Cluster/google.cluster.js';
import InstaConnect from '../Cluster/instagram.cluster.js';
import TwitterMongoPostModel from '../../Common/Mongoose/models/twitterposts.js';
import FacebookMongoPostModel from '../../Common/Mongoose/models/facebookposts.js';
import YoutubeMongoPostModel from '../../Common/Mongoose/models/youtubepost.js';
import InstagramMongoPostModel from '../../Common/Mongoose/models/instagramposts.js';
import sequelize from 'sequelize';
import UserTeamAccountLibs from './../Shared/userTeamAccountsLibs.shared.js';
import UserTeamAccount from './../Shared/userTeamAccounts.shared.js';
import NotificationServices from '../../Common/Shared/notifyServices.js'

const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const userRewardsModel = db.user_rewards;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const userTeamJoinTable = db.join_table_users_teams;
const updateFriendsTable = db.social_account_friends_counts;

class TeamLibs {
  constructor() {
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
    this.coreServices = new CoreServices(config.get('authorize'));

    this.fbConnect = new FbConnect(config.get('facebook_api'));
    this.pinterestConnect = new PinterestConnect(config.get('pinterest'));
    this.linkedInConnect = new LinkedInConnect(config.get('linkedIn_api'));
    this.instagramConnect = new InstaConnect(config.get('instagram_api'));

    this.googleConnect = new GoogleConnect(config.get('google_api'));
    Object.assign(this, UserTeamAccountLibs);
  }

  async getSocialProfiles(userId) {
    let res = await socialAccount.findAll({
      where: { account_admin_id: userId },
    });
    return res;
  }
  async getSocialProfilesById(userId, accountId) {
    let socialAccounts = {};
    let socialAccDetails = await socialAccount.findOne({
      where: { account_admin_id: userId, account_id: accountId },
    });
    let fields = [];
    if (!accountId) throw new error('Invalid account Id');
    switch (Number(socialAccDetails.account_type)) {
      case 1:
        fields = ['friendship_count', 'page_count', 'profile_picture'];
        break;
      case 2:
        fields = ['follower_count', 'total_like_count', 'profile_picture'];
        break;
      case 4:
        fields = [
          'follower_count',
          'following_count',
          'total_like_count',
          'total_post_count',
          'bio_text',
          'profile_picture',
        ];
        break;
      case 5:
        fields = [
          'friendship_count',
          'follower_count',
          'following_count',
          'total_post_count',
          'profile_picture',
        ];
        break;
      case 9:
        fields = ['subscription_count', 'total_post_count', 'profile_picture'];
        break;
      case 11:
        fields = [
          'follower_count',
          'following_count',
          'board_count',
          'bio_text',
          'profile_picture',
        ];
        break;
      case 12:
        fields = [
          'follower_count',
          'following_count',
          'total_post_count',
          'profile_picture',
        ];
        break;
      default:
        break;
    }
    if (fields) {
      let resultData = await updateFriendsTable.findOne({
        where: { account_id: socialAccDetails.account_id },
        attributes: fields,
      });
      socialAccDetails.dataValues.updatedDetails = JSON.parse(
        JSON.stringify(resultData)
      );
      socialAccounts = socialAccDetails.dataValues;
      return socialAccounts;
    } else socialAccounts = socialAccDetails.dataValues;
    return socialAccounts;
  }

  async updateRatings(accountId, rating) {
    // const promises = fruitsToGet.map(async fruit => {
    //     const numFruit = await getNumFruit(fruit)
    //     return numFruit
    //   })
    // let promises = await data.map(async itr => await this.updateRating(itr))
    // const res = await Promise.all(promises)
    // return res
    let response = await socialAccount.update(
      {
        rating: rating,
      },
      {
        where: { account_id: accountId },
        returning: true,
        plain: true,
      }
    );
    return response;
  }

  async updateRating(data) {
    let response = await socialAccount.update(
      {
        rating: data.rating,
      },
      {
        where: { account_id: data.accountId },
        returning: true,
        plain: true,
      }
    );
    return response;
  }

  async getSocialAccount(userId, accountId) {
    let accounts = await socialAccount.findAll({
      where: {
        account_id: accountId,
        account_admin_id: userId,
      },
      raw: true,
      attributes: ['account_id'],
    });
    return accounts;
  }
  async getTeamSocialAccount(account_id, account_type) {
    let query = {};
    query.account_id = { [Operator.in]: account_id };
    if (account_type != 0) query = { ...query, account_type };
    let accounts = await socialAccount.findAll({
      where: query,
      raw: true,
    });
    return accounts;
  }
  async getTeamSocialAccountCount(account_id) {
    let query = {};
    query.account_id = { [Operator.in]: account_id };
    let res = await socialAccount.findAll({
      where: query,
      attributes: [
        'account_type',
        [sequelize.fn('count', sequelize.col('account_type')), 'count'],
      ],
      group: ['account_type'],
      raw: true,
      order: sequelize.literal('count ASC'),
    });
    return res;
  }

  async lockProfile(accounts) {
    let result = await teamSocialAccountJoinTable.update(
      {
        is_account_locked: 1,
      },
      { where: { account_id: accounts.map(t => t.account_id) } }
    );
    return result;
  }

  async unlockProfiles(accounts) {
    let result = await teamSocialAccountJoinTable.update(
      {
        is_account_locked: 0,
      },
      { where: { account_id: accounts.map(t => t.account_id) } }
    );
    return result;
  }

  async getProfileRedirectUrl(
    userId,
    teamId,
    network,
    accessToken,
    userScopeAvailableNetworks
  ) {
    var resultJson = null;
    return new Promise((resolve, reject) => {
      // Checking user is belongs to the team or not
      return db.sequelize.transaction(t => {
        return teamInfo
          .findOne(
            {
              where: {
                [Operator.and]: [
                  {
                    team_admin_id: userId,
                  },
                  {
                    team_id: teamId,
                  },
                ],
              },
              attributes: ['team_id'],
            },
            { transaction: t }
          )

          .then(team => {
            var state = {
              teamId: teamId,
              network: network,
              accessToken: accessToken,
            };
            var encryptedState = this.authorizeServices.encrypt(
              JSON.stringify(state)
            );
            var redirectUrl = '';

            if (team == null) {
              throw new Error(
                "Team not found or You don't have access to add the profile to team"
              );
            } else {
              // swithing to whichever network is selected by user
              switch (network) {
                case 'Facebook':
                  if (userScopeAvailableNetworks.includes('1')) {
                    redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
                      config.get('profile_add_redirect_url')
                    )}&client_id=${config.get(
                      'facebook_api.app_id'
                    )}&state=${encryptedState}&scope=${config.get(
                      'facebook_api.profile_scopes'
                    )}`;
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to facebook.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'FacebookPage':
                case 'FacebookGroup':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('1')) {
                    redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
                      config.get('profile_add_redirect_url')
                    )}&client_id=${config.get(
                      'facebook_api.app_id'
                    )}&scope=${config.get('facebook_api.page_scopes')}`;
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to facebook.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'InstagramBusiness':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('12')) {
                    redirectUrl = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
                      config.get('profile_add_redirect_url')
                    )}&client_id=${config.get(
                      'facebook_api.app_id'
                    )}&scope=${config.get(
                      'instagram.business_account_scopes'
                    )}&state=${encryptedState}`;
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message:
                        'Navigated to facebook to add instagram account.',
                      navigateUrl: redirectUrl,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'Twitter':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('4')) {
                    return this.twtConnect
                      .requestToken()
                      .then(response => {
                        var state = {
                          teamId: teamId,
                          network: network,
                          accessToken: accessToken,
                          requestToken: response.requestToken,
                          requestSecret: response.requestSecret,
                        };
                        var encryptedState = this.authorizeServices.encrypt(
                          JSON.stringify(state)
                        );
                        resultJson = {
                          code: 200,
                          status: 'success',
                          message: response,
                          navigateUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${response.requestToken}`,
                          state: encryptedState,
                        };
                      })
                      .catch(error => {
                        resultJson = {
                          code: 400,
                          status: 'failed',
                          error: error.message,
                        };
                      });
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'LinkedIn':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('6')) {
                    redirectUrl =
                      this.linkedInConnect.getOAuthUrl(encryptedState);
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to linkedIn.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );

                  break;
                case 'LinkedInCompany':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('6')) {
                    redirectUrl =
                      this.linkedInConnect.getV1OAuthUrl(encryptedState);
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to linkedIn.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );

                  break;
                case 'Youtube':
                  // Validating that the user is having permisiion for this network or not by user plan
                  // if (userScopeAvailableNetworks.includes('9')) {
                  redirectUrl = this.googleConnect.getGoogleAuthUrl(
                    'youtube',
                    encryptedState
                  );
                  resultJson = {
                    code: 200,
                    status: 'success',
                    message: 'Navigated to youtube.',
                    navigateUrl: redirectUrl,
                    state: encryptedState,
                  };
                  // } else
                  //     throw new Error("Sorry, Requested network not available for your plan.");
                  break;
                case 'GoogleAnalytics':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('10')) {
                    redirectUrl = this.googleConnect.getGoogleAuthUrl(
                      'googleAnalytics',
                      encryptedState
                    );
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to google analytics.',
                      navigateUrl: redirectUrl,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'Instagram':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('5')) {
                    redirectUrl = `https://api.instagram.com/oauth/authorize/?client_id=${config.get(
                      'instagram.client_id'
                    )}&redirect_uri=${encodeURIComponent(
                      config.get('instagram.redirect_url')
                    )}&response_type=code`;
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to instagram.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                case 'Pinterest':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('11')) {
                    redirectUrl = `https://api.pinterest.com/oauth/?response_type=code&redirect_uri=${config.get(
                      'pinterest.redirect_url'
                    )}&client_id=${config.get(
                      'pinterest.client_id'
                    )}&scope=${config.get('pinterest.scopes')}`;
                    resultJson = {
                      code: 200,
                      status: 'success',
                      message: 'Navigated to pinterest.',
                      navigateUrl: redirectUrl,
                      state: encryptedState,
                    };
                  } else
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  break;
                default:
                  throw new Error(
                    `${config.get(
                      'applicationName'
                    )} supports anyone of the following. 1.Facebook, 2.FacebookPage, 3.Twitter, 4.LinkedIn, 5.LinkedInCompany, 6.Youtube, 7.GoogleAnalytics, 8.Instagram 9.Pinterest`
                  );
              }
            }
          })
          .then(() => {
            resolve(resultJson);
          })
          .catch(function (error) {
            reject(error);
          });
      });
    });
  }

  async getProfileRedirectUrlNew(
    userId,
    teamId,
    network,
    accessToken,
    userScopeAvailableNetworks
  ) {
    var resultJson = null;
    return new Promise((resolve, reject) => {
      // Checking user is belongs to the team or not
      return db.sequelize.transaction(t => {
        return teamInfo
          .findOne(
            {
              where: {
                [Operator.and]: [
                  {
                    team_admin_id: userId,
                  },
                  {
                    team_id: teamId,
                  },
                ],
              },
              attributes: ['team_id'],
            },
            { transaction: t }
          )

          .then(team => {
            var state = {
              teamId: teamId,
              network: network,
              accessToken: accessToken,
            };
            var encryptedState = this.authorizeServices.encrypt(
              JSON.stringify(state)
            );
            var redirectUrl = '';

            if (team == null) {
              throw new Error(
                "Team not found or You don't have access to add the profile to team"
              );
            }
          })
          .then(() => {
            resolve(resultJson);
          })
          .catch(function (error) {
            reject(error);
          });
      });
    });
  }

  async addSocialProfile(
    userId,
    userName,
    queryInputs,
    userScopeMaxAccountCount,
    userScopeAvailableNetworks
  ) {
    //  logger.info(`userId : ${userId}, queryInputs: ${queryInputs},userScopeMaxAccountCount:${userScopeMaxAccountCount}, userScopeAvailableNetworks:${userScopeAvailableNetworks} `);
    var ProfileCount = null;
    return new Promise((resolve, reject) => {
      // Checking the number of accounts added by the user
      return db.sequelize.transaction(t => {
        return socialAccount
          .count(
            {
              where: { account_admin_id: userId },
            },
            { transaction: t }
          )

          .then(count => {
            ProfileCount = count;
            var planCount = 100000;
            // Calculating how may accounts user can add by user plan
            var availableAccounts = planCount - ProfileCount;
            if (availableAccounts > 0) {
              return availableAccounts;
            }
            return 0;
          })
          .then(availableCount => {
            //  logger.info(`Available Account Count : ${availableCount} `);

            if (availableCount == 0) {
              reject(
                new Error(
                  `Sorry, As per your plan, you can't add any more account.`
                )
              );
            } else if (availableCount < 1) {
              reject(
                new Error(
                  `Sorry, As per your plan, you can now add only ${availableCount}`
                )
              );
            } else {
              var networkId = this.coreServices.networks[queryInputs.network];
              // logger.info(`networkId: ${networkId}`);

              // Adding account and updating Friends stats
              switch (queryInputs.network) {
                case 'Facebook':
                  if (userScopeAvailableNetworks.includes('1')) {
                    return (
                      this.fbConnect
                        .addFacebookProfile(
                          networkId,
                          queryInputs.teamId,
                          queryInputs.code
                        )
                        .then(profile => {
                          return this.addProfiles(userId, userName, profile);
                        })
                        // .then((response) => {
                        //     result = response;
                        //     return this.fbConnect.getFbProfileStats(result.profileDetails.access_token);
                        // })
                        // .then((updateDetails) => {
                        //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                        // })
                        .then(response => {
                          result = response;
                          resolve({
                            code: 200,
                            status: 'success',
                            teamDetails: result.teamDetails,
                            profileDetails: result.profileDetails,
                          });
                        })
                        .catch(error => {
                          reject(error);
                        })
                    );
                  } else {
                    reject(new Error('Not available.'));
                  }
                  break;
                //#region old Facebook Pages
                // case "FacebookPage":
                //     if (userScopeAvailableNetworks.includes('2')) {
                //         return this.fbConnect.getOwnFacebookPages(queryInputs.code)
                //             .then((profile) => {
                //                 console.log(`Profile....${profile}`)
                //                 console.log(`Profile....${JSON.stringify(profile)}`)
                //                 return this.addProfiles(userId, userName, profile);
                //             })
                //             // .then((response) => {
                //             //     result = response;
                //             //     return this.fbConnect.getFbProfileStats(result.profileDetails.access_token);
                //             // })
                //             // .then((updateDetails) => {
                //             //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                //             // })
                //             .then((response) => {
                //                 result = response;
                //                 resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                //             })
                //             .catch((error) => {
                //                 console.log(`Error in connecting  the Facebook`)
                //                 reject(error);
                //             });
                //     } else {
                //         reject(new Error("Not available."));
                //     }
                //     break;
                //#endregion
                case 'Twitter':
                  //   logger.info(`Entered inside twitter!`);
                  if (userScopeAvailableNetworks.includes('4')) {
                    var result = {};
                    var updatedProfileDetails = {};
                    return (
                      this.twtConnect
                        .addTwitterProfile(
                          networkId,
                          queryInputs.teamId,
                          queryInputs.requestToken,
                          queryInputs.requestSecret,
                          queryInputs.code
                        )
                        .then(profile => {
                          return this.addProfiles(userId, userName, profile);
                        })
                        .then(response => {
                          result = response;
                          return this.twtConnect.getLookupList(
                            result.profileDetails.access_token,
                            result.profileDetails.refresh_token,
                            result.profileDetails.user_name
                          );
                        })
                        .then(updateDetails => {
                          updatedProfileDetails = updateDetails;
                          var data = {
                            accountId: result.profileDetails.account_id,
                            insights: {
                              followerCount: updateDetails.follower_count,
                              followingCount: updateDetails.following_count,
                              favouritesCount: updateDetails.favorite_count,
                              postsCount: updateDetails.total_post_count,
                              userMentions: updateDetails.user_mentions,
                              retweetCount: updateDetails.retweet_count,
                            },
                          };
                          // var twitterInsightPostModelObject = new TwitterInsightPostModel();
                          // return twitterInsightPostModelObject.insertInsights(data);
                        })
                        // .then(() => {
                        //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updatedProfileDetails);
                        // })
                        .then(() => {
                          resolve({
                            code: 200,
                            status: 'success',
                            teamDetails: result.teamDetails,
                            profileDetails: result.profileDetails,
                          });
                        })
                        .catch(error => {
                          reject(error);
                        })
                    );
                  } else {
                    reject(new Error('Not available.'));
                  }
                  break;
                case 'LinkedIn':
                  if (userScopeAvailableNetworks.includes('6')) {
                    return (
                      this.linkedInConnect
                        .addLinkedInProfile(
                          networkId,
                          queryInputs.teamId,
                          queryInputs.code
                        )
                        .then(profile => {
                          return this.addProfiles(userId, userName, profile);
                        })
                        // .then((response) => {
                        //     result = response;
                        //     return this.linkedInConnect.getProfileDetails(result.profileDetails.access_token);
                        // })
                        // .then((updateDetails) => {
                        //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                        // })
                        .then(response => {
                          result = response;
                          resolve({
                            code: 200,
                            status: 'success',
                            teamDetails: result.teamDetails,
                            profileDetails: result.profileDetails,
                          });
                        })
                        .catch(error => {
                          reject(error);
                        })
                    );
                  } else reject(new Error('Not available.'));
                  break;
                case 'Instagram':
                  if (userScopeAvailableNetworks.includes('5')) {
                    return this.instagramConnect
                      .addInstagramProfile(
                        networkId,
                        queryInputs.teamId,
                        queryInputs.code
                      )
                      .then(profile => {
                        //  logger.info(`Profile details : ${JSON.stringify(profile)} `);
                        return this.addProfiles(userId, userName, profile);
                      })
                      .then(response => {
                        result = response;
                        return this.instagramConnect.getInstagramProfileInformation(
                          result.profileDetails.access_token
                        );
                      })
                      .then(response => {
                        var parsedData = JSON.parse(response.Info);
                        var updateDetails = {
                          friendship_count: response.FriendCount,
                          follower_count: parsedData.followed_by,
                          following_count: parsedData.follows,
                          total_post_count: parsedData.media,
                          profile_picture: response.ProfilePicture,
                        };
                        return this.createOrUpdateFriendsList(
                          result.profileDetails.account_id,
                          updateDetails
                        );
                      })
                      .then(() => {
                        resolve({
                          code: 200,
                          status: 'success',
                          teamDetails: result.teamDetails,
                          profileDetails: result.profileDetails,
                        });
                      })
                      .catch(error => {
                        reject(error);
                      });
                  } else reject(new Error('Not available.'));
                  break;
                case 'Pinterest':
                  if (userScopeAvailableNetworks.includes('11')) {
                    this.pinterestConnect
                      .addPinterestProfile(
                        networkId,
                        queryInputs.teamId,
                        queryInputs.code
                      )
                      .then(profile => {
                        return this.addProfiles(userId, userName, profile);
                      })
                      .then(response => {
                        result = response;
                        return this.pinterestConnect.userDetails(
                          result.profileDetails.user_name,
                          result.profileDetails.access_token
                        );
                      })
                      // .then((updateDetails) => {
                      //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                      // })
                      .then(() => {
                        resolve({
                          code: 200,
                          status: 'success',
                          teamDetails: result.teamDetails,
                          profileDetails: result.profileDetails,
                        });
                      })
                      .catch(error => {
                        reject(error);
                      });
                  } else reject(new Error('Not available.'));
                  break;
                case 'LinkedInCompany':
                  resolve({
                    code: 200,
                    status: 'success',
                    responseCode: queryInputs.code,
                    state: queryInputs.state,
                  });
                  break;

                case 'Youtube':
                  return (
                    this.googleConnect
                      .getYoutubeChannels(queryInputs.code)
                      .then(profile => {
                        return this.addProfiles(userId, userName, profile);
                      })
                      // .then((response) => {
                      //     result = response;
                      //     return this.fbConnect.getFbProfileStats(result.profileDetails.access_token);
                      // })
                      // .then((updateDetails) => {
                      //     return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                      // })
                      .then(response => {
                        result = response;
                        resolve({
                          code: 200,
                          status: 'success',
                          teamDetails: result.teamDetails,
                          profileDetails: result.profileDetails,
                        });
                      })
                      .catch(error => {
                        reject(error);
                      })
                  );

                  break;

                case 'GoogleAnalytics':
                  resolve({
                    code: 200,
                    status: 'success',
                    responseCode: queryInputs.code,
                  });
                  break;
                default:
                  reject(new Error('Specified network is invalid.'));
                  break;
              }
            }
          });
      });
    });
  }

  async addBulkSocialProfiles(
    userId,
    teamId,
    profiles,
    userScopeMaxAccountCount,
    userScopeAvailableNetworks
  ) {
    return new Promise((resolve, reject) => {
      if (
        !userId ||
        !teamId ||
        !profiles ||
        !userScopeMaxAccountCount ||
        !userScopeAvailableNetworks
      ) {
        reject(new Error('Invalid Inputs'));
      } else {
        var subscribeAccountsAccessTokens = [];
        var insertedAccountIdsWithType = [];
        var teamDetails = {};
        var addingSocialIds = [];
        var isErrorOnNetwork = false;
        var erroredAccountsNames = [];
        var erroredSocialProfiles = [];
        var ProfileCount = 0;
        var ProfileInfo = {};

        return db.sequelize.transaction(t => {
          return teamInfo
            .findOne(
              {
                where: {
                  [Operator.and]: [
                    {
                      team_admin_id: userId,
                    },
                    {
                      team_id: teamId,
                    },
                  ],
                },
                attributes: ['team_id'],
              },
              { transaction: t }
            )
            .then(team => {
              if (team == null)
                throw new Error(
                  "You don't have access to add the profile to the team"
                );
              else {
                teamDetails = team;
                addingSocialIds = [];
                isErrorOnNetwork = false;

                profiles.forEach(profile => {
                  if (!isErrorOnNetwork) {
                    if (
                      this.coreServices.webhooksSupportedAccountType.includes(
                        String(profile.account_type)
                      )
                    ) {
                      var accountSubscribeDetails = {
                        AccountType: profile.account_type,
                        AccessToken: profile.access_token,
                        RefreshToken: profile.refresh_token,
                        SocialId: profile.social_id,
                      };
                      subscribeAccountsAccessTokens.push(
                        accountSubscribeDetails
                      );
                      // logger.info('Added account creds for subscription..');
                    }
                    switch (profile.account_type) {
                      case '2':
                      case '3':
                        if (!userScopeAvailableNetworks.includes('1'))
                          isErrorOnNetwork = true;
                        break;
                      case '7':
                        if (!userScopeAvailableNetworks.includes('6'))
                          isErrorOnNetwork = true;
                        break;
                      case '1':
                      case '4':
                      case '5':
                      case '6':
                      case '9':
                      case '10':
                      case '12':
                        if (
                          !userScopeAvailableNetworks.includes(
                            String(profile.account_type)
                          )
                        )
                          isErrorOnNetwork = true;
                        break;
                      default:
                        isErrorOnNetwork = true;
                        break;
                    }
                    profile.account_admin_id = userId;
                    addingSocialIds.push(profile.social_id);
                  }
                });
                if (!isErrorOnNetwork) {
                  return socialAccount.findAll({
                    where: { social_id: addingSocialIds },
                    attributes: ['account_id', 'social_id'],
                  });
                } else {
                  throw new Error(
                    'Sorry, you are trying to add some invalid type of account with respect to your plan.'
                  );
                }
              }
            })
            .then(socialAcc => {
              erroredSocialProfiles = [];
              socialAcc.forEach(account => {
                erroredSocialProfiles.push(account.social_id);
              });
              return socialAccount.count(
                {
                  where: { account_admin_id: userId },
                },
                { transaction: t }
              );
            })
            .then(count => {
              ProfileCount = count;
              var planCount = userScopeMaxAccountCount;
              var availableAccounts = planCount - ProfileCount;
              if (availableAccounts == 0)
                throw new Error(
                  `Sorry, As per your plan, you can't add any more account.`
                );
              else if (availableAccounts < addingSocialIds.length)
                throw new Error(
                  `Sorry, As per your plan, you can now add only ${availableAccounts}`
                );
              return;
            })
            .then(() => {
              var filteredProfiles = profiles.filter(
                profile => !erroredSocialProfiles.includes(profile.social_id)
              );
              return socialAccount.bulkCreate(filteredProfiles, {
                returning: true,
              });
            })
            .then(profileDetails => {
              ProfileInfo = profileDetails;
              return teamDetails.addSocialAccount(profileDetails, {
                transaction: t,
                through: { is_account_locked: false },
              });
            })
            .then(() => {
              var insertedAccountIds = [];
              ProfileInfo.forEach(element => {
                insertedAccountIds.push(element.account_id);
                insertedAccountIdsWithType.push({
                  account_id: element.account_id,
                  account_type: element.account_type,
                  access_token: element.access_token,
                  refresh_token: element.refresh_token,
                });
              });
              return this.scheduleMulitNetworkPostFetching(
                insertedAccountIds
              ).catch(error => {
                logger.info(JSON.stringify(error));
              });
            })
            .then(() => {
              //    logger.info(`Subscription count ${subscribeAccountsAccessTokens.length}`);
              if (subscribeAccountsAccessTokens.length > 0) {
                return Promise.all(
                  subscribeAccountsAccessTokens.map(accountDetails => {
                    //       logger.info(`Subscription started for ${accountDetails.AccountType}`);

                    switch (accountDetails.AccountType) {
                      case '2':
                        logger.info(
                          `Subscription processing for ${accountDetails.AccountType}`
                        );
                        return this.fbConnect
                          .subscribeWebhooks(
                            accountDetails.AccessToken,
                            accountDetails.SocialId,
                            config.get('facebook_api.page_subscription_fields')
                          )
                          .catch(() => {
                            return;
                          });
                      case '4':
                        return this.twtConnect
                          .updateSubscriptions(
                            accountDetails.AccessToken,
                            accountDetails.RefreshToken,
                            true
                          )
                          .catch(() => {
                            return;
                          });
                      case '9':
                        return this.googleConnect
                          .updateSubscriptions(accountDetails.SocialId, true)
                          .catch(() => {
                            return;
                          });
                      case '12':
                        return this.fbConnect
                          .subscribeWebhooks(
                            accountDetails.AccessToken,
                            accountDetails.SocialId,
                            config.get('instagram.business_subscription_fields')
                          )
                          .catch(() => {
                            return;
                          });
                      default:
                        break;
                    }
                  })
                );
              }
              return;
            })
            .then(() => {
              return Promise.all(
                insertedAccountIdsWithType.map(element => {
                  switch (String(element.account_type)) {
                    case '2':
                      return this.fbConnect
                        .getFbPageStats(element.access_token)
                        .then(updateDetails => {
                          return this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          );
                        })
                        .catch(() => {
                          return;
                        });
                    case '9':
                      return this.googleConnect
                        .getYtbChannelDetails('', element.refresh_token)
                        .then(updateDetails => {
                          return this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          );
                        })
                        .catch(() => {
                          return;
                        });
                    case '12':
                      return this.fbConnect
                        .getInstaBusinessStats(element.access_token)
                        .then(updateDetails => {
                          return this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          );
                        })
                        .catch(() => {
                          return;
                        });
                  }
                })
              );
            })
            .then(() => {
              profiles.forEach(account => {
                erroredSocialProfiles.forEach(accountId => {
                  if (account.social_id == accountId)
                    erroredAccountsNames.push(account.first_name);
                });
              });
              resolve({
                teamDetails: teamDetails,
                profileDetails: ProfileInfo,
                errorProfileId: erroredAccountsNames,
              });
            })
            .catch(function (error) {
              reject(error);
            });
        });
      }
    });
  }

  scheduleMulitNetworkPostFetching(accountIds) {
    return new Promise((resolve, reject) => {
      if (accountIds.length > 0) {
        accountIds.forEach(id => {
          var scheduleDate = moment().add(2, 'seconds');
          var batchId = `${id}_${String(moment().unix())}`;
          var scheduleObject = {
            accountId: id,
          };
          var time = new Date(scheduleDate);
          schedule.scheduleJob(
            batchId,
            time,
            function (scheduleObject) {
              logger.info(
                `Started network posts fetching for account id: ${scheduleObject.accountId}`
              );
              this.startNetworkFeedsFetching(scheduleObject);
            }.bind(this, scheduleObject)
          );
          logger.info('Scheduled');
        });
        resolve();
      } else reject(new Error('No accounts found'));
    });
  }

  /**
   * TODO To add specified network profile to DB
   * add specified network profile to DB
   * @param  {number} userId -User id
   * @param  {string} userName - Username
   * @param  {Object} profile - Profile Object of the Specified Network
   * @return {object} Returns object contains Team and Profile details
   */
  addProfiles(userId, userName, profile) {
    var ProfileInfo = null;
    var teamDetails = null;
    return new Promise((resolve, reject) => {
      if (!profile) {
        reject(new Error('Invalid Inputs'));
      } else {
        return db.sequelize.transaction(t => {
          return (
            teamInfo
              .findOne(
                {
                  where: {
                    [Operator.and]: [
                      {
                        team_admin_id: userId,
                      },
                      {
                        team_id: profile.TeamId,
                      },
                    ],
                  },
                  attributes: ['team_id', 'team_name'],
                },
                { transaction: t }
              )
              .then(team => {
                if (team == null)
                  throw new Error(
                    "You don't have access to add the profile to team"
                  );
                else {
                  teamDetails = team;
                  return socialAccount.findOne({
                    where: {
                      [Operator.and]: [
                        {
                          account_type: profile.Network,
                        },
                        {
                          social_id: profile.SocialId,
                        },
                      ],
                    },
                    attributes: ['account_id'],
                  });
                }
              })
              .then(socialAcc => {
                if (socialAcc) {
                  throw new Error('Account has been added already!');
                } else {
                  return socialAccount.create(
                    {
                      account_type: profile.Network,
                      user_name: profile.UserName,
                      first_name: profile.FirstName,
                      last_name: profile.LastName,
                      email: profile.Email,
                      social_id: profile.SocialId,
                      profile_pic_url: profile.ProfilePicture,
                      cover_pic_url: profile.ProfilePicture,
                      profile_url: profile.ProfileUrl,
                      access_token: profile.AccessToken,
                      refresh_token: profile.RefreshToken,
                      friendship_counts: profile.FriendCount,
                      info: profile.Info,
                      account_admin_id: userId,
                    },
                    { transaction: t }
                  );
                }
              })
              .then(profileDetails => {
                ProfileInfo = profileDetails;
                return profileDetails.setTeam(teamDetails, {
                  transaction: t,
                  through: { is_account_locked: false },
                });
              })
              .then(() => {
                return this.scheduleNetworkPostFetching(
                  ProfileInfo.account_id
                ).catch(error => {
                  logger.error(error.message);
                });
              })
              .then(() => {
                if (
                  ProfileInfo.account_type == '4' ||
                  ProfileInfo.account_type == 4
                ) {
                  return this.twtConnect
                    .updateSubscriptions(
                      ProfileInfo.access_token,
                      ProfileInfo.refresh_token,
                      true
                    )
                    .catch(error => {
                      return;
                    });
                }
              })
              .then(() => {
                let targetTeamsId = [];
                targetTeamsId.push(profile.TeamId);
                if (config.get('notification_socioboard.status') == "on")
                  return this.sendTeamNotifications(`${userName} added the social profiles to a ${teamDetails.team_name} team.`,
                    teamDetails.team_name,
                    'team_addProfile',
                    userName,
                    'success',
                    targetTeamsId,
                    profile.TeamId
                  )
              })
              .then(() => {
                resolve({
                  teamDetails: teamDetails,
                  profileDetails: ProfileInfo,
                });
              })
              .catch(function (error) {
                console.error(`Error adding account inside ${error}`);
                reject(error);
              })
          );
        });
      }
    });
  }

  async deleteSocialProfile(userId, accountId, teamId, userName) {
    return new Promise((resolve, reject) => {
      let fetchedSocialAccount = '';
      return db.sequelize.transaction(t => {
        return this.getUserDetails(userId)
          .then(userDetails => {
            return socialAccount
              .findOne({
                where: {
                  [Operator.and]: [
                    {
                      account_admin_id: userId,
                    },
                    {
                      account_id: accountId,
                    },
                  ],
                },
                attributes: [
                  'account_id',
                  'email',
                  'access_token',
                  'social_id',
                  'account_type',
                  'refresh_token',
                ],
              })
              .then(socialAcc => {
                if (socialAcc == null)
                  throw new Error(
                    'No such social account or Only admin that profile can delete an account!'
                  );
                // else if (userDetails.email == socialAcc.email) {
                //     throw new Error("You can't delete this account. As this is your primary account, which you used to login to Socioboard.");
                // }
                else {
                  fetchedSocialAccount = socialAcc;
                  let scheduleDate = moment().add(2, 'seconds');
                  let batchId = `${socialAcc.social_id}_${String(
                    moment().unix()
                  )}`;
                  this.scheduleObject = {
                    accountType: socialAcc.account_type,
                    socialId: socialAcc.social_id,
                    accessToken: socialAcc.access_token,
                    refreshToken: socialAcc.refresh_token,
                  };
                  let time = new Date(scheduleDate);

                  schedule.scheduleJob(batchId, time, () => {
                    // logger.info(`Started network posts deleting for social id: ${this.scheduleObject.socialId}`);
                    // Started network posts deleting for social account
                    this.deleteAccountsMongoPosts(this.scheduleObject)
                      .then(() => {
                        //logger.info("Deleting process completed.");
                      })
                      .catch(error => {
                        //  logger.error(error.message);
                      });
                  });
                  return;
                }
              })
              .then(() => {
                if (teamId)
                  return teamInfo.findOne({
                    where: {
                      team_id: teamId,
                    },
                    attributes: ['team_id', 'team_name'],
                  })
              })
              .then((teamDetails) => {
                let targetTeamsId = [];
                targetTeamsId.push(teamId);
                if (config.get('notification_socioboard.status') == "on" && teamId)
                  return this.sendTeamNotifications(
                    `${userName} removed one profile from Team.`,
                    teamDetails.team_name,
                    'team_deleteTeamSocialProfile',
                    userName,
                    'success',
                    targetTeamsId,
                    teamId
                  )
              })
              .then(() => {
                return fetchedSocialAccount
                  .destroy({
                    where: { account_id: accountId },
                  })
                  .catch(error => {
                    throw new Error(error.message);
                  });
              })
              .then(() => {
                resolve('success');
              })
              .catch(function (error) {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }
  async getUserDetails(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject({ error: true, message: 'Invalid userId' });
      } else {
        return userDetails
          .findOne({
            where: {
              user_id: Number(userId),
            },
            attributes: [
              'user_id',
              'email',
              'phone_no',
              'first_name',
              'last_name',
              'date_of_birth',
              'phone_code',
              'about_me',
              'profile_picture',
              'is_account_locked',
              'is_admin_user',
            ],
            include: [
              {
                model: userActivation,
                as: 'Activations',
                where: { id: db.Sequelize.col('user_activation_id') },
                attributes: [
                  'id',
                  'last_login',
                  'user_plan',
                  'payment_type',
                  'account_expire_date',
                  'signup_type',
                  'activation_status',
                  'activate_2step_verification',
                  'shortenStatus',
                  'email_validate_token',
                  'forgot_password_validate_token',
                  'forgot_password_token_expire',
                  'otp_token',
                  'otp_token_expire',
                ],
              },
            ],
          })
          .then(userDetails => {
            if (!userDetails) reject({ error: true, message: 'User not found!' });
            else resolve(userDetails);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }
  async deleteAccountsMongoPosts(accountDetails) {
    return new Promise((resolve, reject) => {
      switch (accountDetails.accountType) {
        case 1:
        case 3:
          var facebookMongoPostModelObject = new FacebookMongoPostModel();
          facebookMongoPostModelObject.deleteAccountPosts(
            accountDetails.socialId
          );
          break;

        case 4:
          // return this.twtConnect.updateSubscriptions(accountDetails.accessToken, accountDetails.refreshToken, false)
          //     .then(() => {
          var twitterMongoPostModelObject = new TwitterMongoPostModel();
          twitterMongoPostModelObject
            .deleteAccountPosts(accountDetails.socialId)
            //    return;
            // })
            .then(() => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        case 9:
          // return this.googleConnect.updateSubscriptions(accountDetails.socialId, false)
          //    .then(() => {
          var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
          youtubeMongoPostModelObject
            .deleteAccountPosts(accountDetails.socialId)
            //      return;
            //  })
            .then(() => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        case 12:
          // return this.fbConnect.unsubscribeWebhooks(accountDetails.accessToken, accountDetails.socialId)
          //  .then(() => {
          var instagramStoryMongoModelObject = new InstagramStoryMongoModel();
          return (
            instagramStoryMongoModelObject
              .deleteAccountPosts(accountDetails.socialId)
              //   })
              .then(() => {
                var instagramBusinessMongoPostModelObject =
                  new InstagramBusinessMongoPostModel();
                return instagramBusinessMongoPostModelObject.deleteAccountPosts(
                  accountDetails.socialId
                );
              })
              .then(() => {
                resolve();
              })
              .catch(error => {
                reject(error);
              })
          );
        default:
          reject(new Error('Invalid Account Type'));
          break;
      }
    });
  }
  async updateCrons(accountId, cronvalue) {
    // const promises = fruitsToGet.map(async fruit => {
    //     const numFruit = await getNumFruit(fruit)
    //     return numFruit
    //   })
    // let promises = await data.map(async itr => await this.updateRating(itr))
    // const res = await Promise.all(promises)
    // return res
    let response = await socialAccount.update(
      {
        refresh_feeds: cronvalue,
      },
      {
        where: { account_id: accountId },
        returning: true,
        plain: true,
      }
    );
    return response;
  }

  scheduleNetworkPostFetching(accountId) {
    return new Promise((resolve, reject) => {
      var scheduleDate = moment().add(3, 'seconds');
      var batchId = String(moment().unix());

      var time = new Date(scheduleDate);

      var scheduleObject = {
        accountId: accountId,
      };

      schedule.scheduleJob(batchId, time, () => {
        logger.info(
          `Started network posts fetching for account id: ${scheduleObject.accountId}`
        );
        this.startNetworkFeedsFetching(scheduleObject).catch(error => {
          logger.info(error.message);
        });
      });

      logger.info('Scheduled');
      resolve();
    });
  }

  async teamForUser(userId) {
    let res = await userDetails.findOne({
      where: { user_id: userId },
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          attributes: ['team_id'],
          through: {
            where: {
              [Operator.and]: [
                {
                  invitation_accepted: true,
                },
                {
                  left_from_team: false,
                },
              ],
            },
          },
        },
      ],
    });
    return res;
  }

  async teamForUserSearch(userId, teamName) {
    let res = await userDetails.findOne({
      where: { user_id: userId },
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: { team_name: { [Operator.like]: `%${teamName}%` } },
          attributes: ['team_id'],
          through: {
            where: {
              [Operator.and]: [
                {
                  invitation_accepted: true,
                },
                {
                  left_from_team: false,
                },
              ],
            },
          },
        },
      ],
    });
    return res;
  }

  async teamForUserSpecific(user_id, team_id) {
    let res = await userDetails.findOne({
      where: { user_id },
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: { team_id },
          attributes: ['team_id'],
          through: {
            where: {
              [Operator.and]: [
                {
                  invitation_accepted: true,
                },
                {
                  left_from_team: false,
                },
              ],
            },
          },
        },
      ],
    });
    return res;
  }

  // async teamSocialAccount(teamInformation) {
  //     return Promise.all(teamInformation.Team.map(function (teamResponse) {
  //         return teamInfo.findAll({
  //             where: {
  //                 team_id: teamResponse.dataValues.team_id
  //             },
  //             attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
  //             include: [{
  //                 model: socialAccount,
  //                 as: 'SocialAccount',
  //                 // attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
  //                 attributes: ['is_account_locked']
  //             }]
  //             // ,
  //             // order: [
  //             //     [{
  //             //         model: socialAccount,
  //             //         as: 'SocialAccount'
  //             //     }, "create_on", "DESC"]
  //             // ]
  //         });
  //     }));
  // }

  async teamSocialAccount(teamInformation) {
    return Promise.all(
      teamInformation.Team.map(function (teamResponse) {
        return teamInfo.findAll({
          where: {
            team_id: teamResponse.dataValues.team_id,
          },
          // attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
          include: [
            {
              model: socialAccount,
              as: 'SocialAccount',
              // attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
              through: {
                attributes: ['is_account_locked'],
              },
            },
          ],
          order: [
            [
              {
                model: socialAccount,
                as: 'SocialAccount',
              },
              'create_on',
              'DESC',
            ],
          ],
        });
      })
    );
  }

  async searchTeamSocialAccount(teamInformation, SocialAccountInfo) {
    return Promise.all(
      teamInformation.Team.map(function (teamResponse) {
        let innerQuery = {};
        if (SocialAccountInfo.rating.length != 0)
          innerQuery.rating = { [Operator.or]: SocialAccountInfo.rating };
        if (SocialAccountInfo.accountType.length != 0)
          innerQuery.account_type = {
            [Operator.or]: SocialAccountInfo.accountType,
          };
        return teamInfo.findAll({
          where: { team_id: teamResponse.dataValues.team_id },
          include: [
            {
              model: socialAccount,
              as: 'SocialAccount',
              where: {
                [sequelize.Op.or]: {
                  namesQuery: sequelize.where(
                    sequelize.fn(
                      'concat',
                      sequelize.fn('COALESCE', sequelize.col('first_name'), ''),
                      ' ',
                      sequelize.fn('COALESCE', sequelize.col('last_name'), '')
                    ),
                    {
                      [sequelize.Op.like]: `%${SocialAccountInfo.username}%`,
                    }
                  ),
                },
                ...innerQuery,
              },
              raw: true,
              through: {
                attributes: ['is_account_locked'],
              },
            },
          ],
          order: [
            [
              {
                model: socialAccount,
                as: 'SocialAccount',
              },
              'create_on',
              'DESC',
            ],
          ],
        });
      })
    );
  }

  async teamInfoForSearch(teamId) {
    let res = await teamInfo.findAll({
      where: {
        team_id: { [Operator.in]: teamId },
      },
      group: ['team_id'],
    });
    return res;
  }

  async getTeamDetails(userId, teamId) {
    let teams = await teamInfo.findAll({
      where: {
        team_admin_id: userId,
        team_id: teamId,
      },
      raw: true,
      attributes: ['team_id'],
    });
    return teams;
  }

  async isValidTeam(userId, teamId) {
    let teams = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
    });
    return teams;
  }
  async lockTeam(accounts) {
    let result = await teamInfo.update(
      {
        is_team_locked: 1,
      },
      { where: { team_id: accounts.map(t => t.team_id) } }
    );
    return result;
  }

  async unlockTeam(accounts) {
    let result = await teamInfo.update(
      {
        is_team_locked: 0,
      },
      { where: { team_id: accounts.map(t => t.team_id) } }
    );
    return result;
  }

  async createTeam(userId, teamDescription) {
    let transaction = await db.sequelize.transaction();
    try {
      let teamDetails = await teamInfo.create(
        {
          team_name: teamDescription.name,
          team_description: teamDescription.description,
          team_logo: teamDescription.logoUrl,
          team_admin_id: userId,
          is_default_team: false,
        },
        { transaction }
      );

      let user = await userDetails.findOne(
        {
          where: { user_id: userId },
          attributes: ['user_id'],
        },
        { transaction }
      );

      await teamDetails.setUser(user, {
        transaction,
        through: {
          invitation_accepted: true,
          permission: 2,
          left_from_team: false,
          invited_by: 0,
        },
      });
      await transaction.commit();
      return teamDetails;
    } catch (error) {
      // if we got an error and we created the transaction, roll it back
      if (transaction) {
        await transaction.rollback();
      }
    }
  }

  async getTeamInfo(userId, teamName) {
    let res = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_name: teamName,
          },
        ],
      },
      attributes: ['team_id'],
    });
    return res;
  }
  async getTeamInfoId(userId, teamId) {
    let res = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
      attributes: ['team_id', 'team_name', 'is_default_team'],
    });
    return res;
  }

  async editTeam(teamDescription, teamId) {
    let transaction = await db.sequelize.transaction();
    let res = await teamInfo.update(
      {
        team_name: teamDescription.name,
        team_description: teamDescription.description,
        team_logo: teamDescription.logoUrl,
      },
      {
        where: {
          team_id: teamId,
        },
      },
      { transaction }
    );
    return res;
  }

  async getAllTeamOfUser(userId) {
    let res = await teamInfo.findAll({
      where: {
        team_admin_id: userId,
      },
      attributes: ['team_id'],
    });
    return res;
  }

  async getAllteamsAccount(usersTeamIds) {
    let res = await teamSocialAccountJoinTable.findAll({
      where: {
        team_id: usersTeamIds,
      },
      attributes: ['id', 'account_id', 'team_id'],
    });
    return res;
  }

  async getTeamsSocialAccount(team_id) {
    let res = await teamSocialAccountJoinTable.findAll({
      where: {
        team_id,
      },
      // attributes: ['id', 'account_id', 'team_id']
    });
    return res;
  }

  async deleteTeam(teamId) {
    let res = await teamInfo.destroy({
      where: {
        team_id: teamId,
      },
    });
    return res;
  }

  async deleteSocialAccount(filteredDeleteAccounts) {
    let res = socialAccount.destroy({
      where: { account_id: filteredDeleteAccounts },
    });
    return res;
  }

  async isUserRegistered(invitingUserEmail) {
    let res = await userDetails.findOne({
      where: { email: invitingUserEmail },
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: { activation_status: 1 },
        },
      ],
      attributes: ['user_id'],
    });
    return res;
  }

  async getTotalTeamMember(userId) {
    let res = await userTeamJoinTable.count({
      where: {
        [Operator.and]: [
          {
            left_from_team: false,
          },
          {
            invited_by: userId,
          },
        ],
      },
    });
    return res;
  }
  async checkUserAlreadyAdded(invitingUserId, teamId) {
    let res = await userTeamJoinTable.findOne({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            user_id: invitingUserId,
          },
        ],
      },
    });
    return res;
  }
  async addTeamMember(invitingUserId, teamId, userId, permission) {
    let res = await userTeamJoinTable.create({
      team_id: teamId,
      user_id: invitingUserId,
      invitation_accepted: false,
      permission: permission,
      left_from_team: false,
      invited_by: userId,
    });
    return res;
  }
  async teamInformation(userId) {
    let res = await userDetails.findOne({
      where: { user_id: userId },
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          attributes: ['team_id'],
          through: {
            where: { invitation_accepted: false, left_from_team: false },
            attributes: ['invitation_accepted', 'permission'],
          },
        },
      ],
    });
    return res;
  }

  async teamDetails(team_id) {
    return teamInfo.findAll({
      where: {
        team_id: team_id,
      },
      attributes: [
        'team_id',
        'team_name',
        'team_logo',
        'team_description',
        'team_admin_id',
      ],
      include: [
        {
          model: socialAccount,
          as: 'SocialAccount',
          attributes: [
            'account_id',
            'account_type',
            'first_name',
            'last_name',
            'email',
            'social_id',
            'profile_pic_url',
            'cover_pic_url',
            'friendship_counts',
          ],
          through: {
            attributes: ['is_account_locked'],
          },
        },
      ],
    });
  }

  async teamUser(team_admin_id, details) {
    let res = await userDetails.findOne({
      where: { user_id: team_admin_id },
      raw: true,
      attributes: ['first_name'],
    });
    details.dataValues.team_admin_name = res.first_name;
    return details;
  }
  async userTeamJoinTableInfo(userId, teamId) {
    let res = await userTeamJoinTable.findOne({
      where: {
        [Operator.and]: [
          {
            user_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
      attributes: [
        'id',
        'user_id',
        'team_id',
        'invited_by',
        'invitation_accepted',
        'left_from_team',
      ],
    });
    // if (!res) throw new Error("You don't have invitation for this team!")
    return res;
  }
  async userTeamJoinTableDecline(userId, teamId) {
    let res = await userTeamJoinTable.findOne({
      where: {
        [Operator.and]: [
          {
            user_id: userId,
          },
          {
            team_id: teamId,
          },
          {
            invited_by: { [Operator.ne]: [userId] },
          },
          {
            invitation_accepted: false,
          },
        ],
      },
      attributes: [
        'id',
        'user_id',
        'team_id',
        'invitation_accepted',
        'invited_by',
        'left_from_team',
      ],
    });
    // if (!res) throw new Error("You don't have invitation for this team!")
    return res;
  }
  async acceptTeam(userId, teamId) {
    let result = await userTeamJoinTable.update(
      {
        invitation_accepted: true,
        left_from_team: false,
      },
      { where: { [Operator.and]: [{ user_id: userId }, { team_id: teamId }] } }
    );
    return result;
  }
  async declineTeam(userId, teamId) {
    let transaction = await db.sequelize.transaction();
    let res = await userTeamJoinTable.destroy({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            user_id: userId,
          },
        ],
      },
    });
    return res;
  }

  async withDraw(userId, teamId) {
    let res = await userTeamJoinTable.destroy({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            user_id: userId,
          },
          {
            invitation_accepted: false,
          },
        ],
      },
    });
    return res;
  }
  async teamMembers(filteredTeams) {
    return Promise.all(
      filteredTeams.Team.map(function (teamResponse) {
        return userTeamJoinTable.findAll({
          where: { team_id: teamResponse.dataValues.team_id },
          attributes: [
            'id',
            'team_id',
            'invitation_accepted',
            'left_from_team',
            'permission',
            'user_id',
          ],
        });
      })
    );
  }

  async teamMembersSearch(teamInformation) {
    return Promise.all(
      teamInformation.Team.map(function (teamResponse) {
        return teamInfo.findAll({
          where: {
            team_id: teamResponse.dataValues.team_id,
          },
          //,
          // attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
          // include: [{
          //     model: socialAccount,
          //     as: 'SocialAccount',
          //     // attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
          //     through: {
          //         attributes: ['is_account_locked']
          //     }
          // }],
          // order: [
          //     [{
          //         model: socialAccount,
          //         as: 'SocialAccount'
          //     }, "create_on", "DESC"]
          // ]
        });
      })
    );
  }

  async memberTeam(team_id) {
    return userTeamJoinTable.findAll({
      where: { team_id },
      attributes: [
        'id',
        'team_id',
        'invitation_accepted',
        'left_from_team',
        'permission',
        'user_id',
      ],
    });
  }

  async teamMemberDetails(teamMembers) {
    return Promise.all(
      teamMembers.map(function (teamResponse) {
        return Promise.all(
          teamResponse.map(function (userIdentifier) {
            return userDetails.findOne({
              where: { user_id: userIdentifier.user_id },
              attributes: [
                'user_id',
                'email',
                'first_name',
                'last_name',
                'profile_picture',
              ],
            });
          })
        );
      })
    );
  }
  async getAvailableTeamMember(teamMembers) {
    let res = await userDetails.findAll({
      where: {
        [Operator.and]: [
          {
            user_id: teamMembers,
          },
        ],
      },
      attributes: [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'profile_picture',
      ],
    });
    return res;
  }

  async memberProfileDetails(userId) {
    return socialAccount.findAll({
      where: { account_admin_id: userId },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
  }

  async socialAccountStats(userId) {
    let accounts = await socialAccount.findAll({
      where: { account_admin_id: userId },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    let pinterestBoards = [];
    let SocialAccountStats = [];
    let res = await Promise.all(
      accounts.map(account => {
        var fields = [];
        switch (Number(account.account_type)) {
          case 1:
            fields = [
              'account_id',
              'friendship_count',
              'page_count',
              'profile_picture',
            ];
            break;
          case 2:
            fields = [
              'account_id',
              'follower_count',
              'total_like_count',
              'profile_picture',
            ];
            break;
          case 4:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_like_count',
              'total_post_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 5:
            fields = [
              'account_id',
              'friendship_count',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 9:
            fields = [
              'account_id',
              'subscription_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 11:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'board_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 12:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          default:
            break;
        }

        if (account.account_type == 11) {
          pinterestIds.push(account.account_id);
        }

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: { account_id: account.account_id },
              attributes: fields,
            })
            .then(resultData => {
              var data = resultData.toJSON();
              SocialAccountStats.push(data);
            })
            .catch(error => {
              logger.error(error.message);
            });
        }
      })
    );
    return SocialAccountStats;
  }

  async searchSocialAccountStats(userId, socaialAccountDetails) {
    let account_ids = [];
    if (socaialAccountDetails[0])
      socaialAccountDetails[0].SocialAccount.map(x => {
        account_ids.push(x.account_id);
      });
    let accounts = await socialAccount.findAll({
      where: { account_id: account_ids },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    let pinterestBoards = [];
    let SocialAccountStats = [];
    let res = await Promise.all(
      accounts.map(account => {
        var fields = [];
        switch (Number(account.account_type)) {
          case 1:
            fields = [
              'account_id',
              'friendship_count',
              'page_count',
              'profile_picture',
            ];
            break;
          case 2:
            fields = [
              'account_id',
              'follower_count',
              'total_like_count',
              'profile_picture',
            ];
            break;
          case 4:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_like_count',
              'total_post_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 5:
            fields = [
              'account_id',
              'friendship_count',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 9:
            fields = [
              'account_id',
              'subscription_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 11:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'board_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 12:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          default:
            break;
        }

        if (account.account_type == 11) {
          pinterestIds.push(account.account_id);
        }

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: { account_id: account.account_id },
              attributes: fields,
            })
            .then(resultData => {
              var data = resultData.toJSON();
              SocialAccountStats.push(data);
            })
            .catch(error => {
              logger.error(error.message);
            });
        }
      })
    );
    return SocialAccountStats;
  }

  async socialAccountStatsForTeam(userId, account_ids) {
    let accounts = await socialAccount.findAll({
      where: { account_id: account_ids },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    let pinterestBoards = [];
    let SocialAccountStats = [];
    let res = await Promise.all(
      accounts.map(account => {
        var fields = [];
        switch (Number(account.account_type)) {
          case 1:
            fields = [
              'account_id',
              'friendship_count',
              'page_count',
              'profile_picture',
            ];
            break;
          case 2:
            fields = [
              'account_id',
              'follower_count',
              'total_like_count',
              'profile_picture',
            ];
            break;
          case 4:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_like_count',
              'total_post_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 5:
            fields = [
              'account_id',
              'friendship_count',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 9:
            fields = [
              'account_id',
              'subscription_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 11:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'board_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 12:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          default:
            break;
        }

        if (account.account_type == 11) {
          pinterestIds.push(account.account_id);
        }

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: { account_id: account.account_id },
              attributes: fields,
            })
            .then(resultData => {
              var data = resultData.toJSON();
              SocialAccountStats.push(data);
            })
            .catch(error => {
              logger.error(error.message);
            });
        }
      })
    );
    return SocialAccountStats;
  }

  async getLockedAccountsForTeam(account_id) {
    let res = await teamSocialAccountJoinTable.findAll({
      where: { is_account_locked: true, account_id: account_id },
      attributes: ['account_id'],
    });
    return res;
  }

  async socialAccountStatsTeam(accountId) {
    let accounts = await socialAccount.findAll({
      where: {
        account_id: { [Operator.in]: accountId },
      },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    let pinterestBoards = [];
    let SocialAccountStats = [];
    let res = await Promise.all(
      accounts.map(account => {
        var fields = [];
        switch (Number(account.account_type)) {
          case 1:
            fields = [
              'account_id',
              'friendship_count',
              'page_count',
              'profile_picture',
            ];
            break;
          case 2:
            fields = [
              'account_id',
              'follower_count',
              'total_like_count',
              'profile_picture',
            ];
            break;
          case 4:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_like_count',
              'total_post_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 5:
            fields = [
              'account_id',
              'friendship_count',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 9:
            fields = [
              'account_id',
              'subscription_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          case 11:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'board_count',
              'bio_text',
              'profile_picture',
            ];
            break;
          case 12:
            fields = [
              'account_id',
              'follower_count',
              'following_count',
              'total_post_count',
              'profile_picture',
            ];
            break;
          default:
            break;
        }

        if (account.account_type == 11) {
          pinterestIds.push(account.account_id);
        }

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: { account_id: account.account_id },
              attributes: fields,
            })
            .then(resultData => {
              var data = resultData.toJSON();
              SocialAccountStats.push(data);
            })
            .catch(error => {
              logger.error(error.message);
            });
        }
      })
    );
    return SocialAccountStats;
  }

  async UserTeam(userId, teamId) {
    let res = await userDetails.findOne({
      where: { user_id: userId },
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: { team_id: teamId },
          attributes: ['team_id'],
          through: {
            where: {
              [Operator.and]: [
                {
                  invitation_accepted: true,
                },
                {
                  left_from_team: false,
                },
              ],
            },
          },
        },
      ],
    });
    return res;
  }

  async teamSocialAccounts(teamInformation) {
    return Promise.all(
      teamInformation.Team.map(function (teamResponse) {
        return teamInfo.findAll({
          where: {
            team_id: teamResponse.dataValues.team_id,
          },
          attributes: [
            'team_id',
            'team_name',
            'team_logo',
            'team_description',
            'team_admin_id',
          ],
          include: [
            {
              model: socialAccount,
              as: 'SocialAccount',
              attributes: [
                'account_id',
                'account_type',
                'first_name',
                'last_name',
                'email',
                'social_id',
                'profile_pic_url',
                'cover_pic_url',
                'friendship_counts',
              ],
              through: {
                attributes: ['is_account_locked'],
              },
            },
          ],
        });
      })
    );
  }

  async checkTeamDetails(userId, teamId) {
    let res = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
    });
    return res;
  }
  async checkTeamUser(userId, teamId) {
    let res = await userTeamJoinTable.findOne({
      where: {
        [Operator.and]: [
          {
            user_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
      raw: true,
    });
    return res;
  }

  async getUser(memberId) {
    return userDetails.findOne({
      where: { user_id: memberId },
      attributes: ['user_id', 'first_name'],
    });
  }

  async removeFromTeam(teamId, user_id, userId) {
    let res = await userTeamJoinTable.destroy({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            user_id: user_id,
          },
          {
            invited_by: userId,
          },
        ],
      },
    });
    return res;
  }

  async teamInfoResponse(teamId) {
    let res = await teamInfo.findOne({
      where: { team_id: teamId },
      attributes: ['team_id', 'team_name', 'team_admin_id'],
    });
    return res;
  }

  async leaveFromTeam(teamId, userId) {
    return userTeamJoinTable.update(
      { left_from_team: true },
      { where: { team_id: teamId, user_id: userId } }
    );
  }

  async updatePermission(teamId, memberId, permission) {
    let res = await userTeamJoinTable.update(
      {
        permission: permission,
      },
      { where: { team_id: teamId, user_id: memberId } }
    );
    return res;
  }

  async getTeam(userId, teamId) {
    let team = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
    });
    return team;
  }

  async getSocialaAcc(userId, accountId) {
    let res = await socialAccount.findOne({
      where: {
        [Operator.and]: [
          {
            account_admin_id: userId,
          },
          {
            account_id: accountId,
          },
        ],
      },
      attributes: ['account_id', 'account_admin_id'],
    });
    return res;
  }
  async getSocialaAccDetails(accountId) {
    let res = await socialAccount.findOne({
      where: {
        account_id: accountId,
      },
      attributes: ['account_id', 'account_admin_id'],
    });
    return res;
  }

  async addTeams(userId, teamId, accountId) {
    // let transaction = await db.sequelize.transaction();

    // try {
    //     let team = await teamInfo.findOne({
    //         where: {
    //             [Operator.and]: [{
    //                 team_admin_id: userId
    //             }, {
    //                 team_id: teamId
    //             }]
    //         },
    //     }, { transaction })
    //     // Finding the giver account is present in database or not

    //     let socialAcc = await socialAccount.findOne({
    //         where: {
    //             account_id: accountId
    //         },
    //         attributes: ['account_id', 'account_admin_id']
    //     }, { transaction })

    //     if (socialAcc && socialAcc.account_admin_id && socialAcc.account_admin_id == userId)
    //         await socialAcc.addTeam(team, { transaction, through: { is_account_locked: false } })

    //     await transaction.commit();

    // }
    // catch (error) {
    //     console.log(error)
    //     await transaction.rollback()

    // }

    let res = await teamSocialAccountJoinTable.create({
      team_id: teamId,
      account_id: accountId,
      is_account_locked: false,
    });
    return res;
  }

  startNetworkFeedsFetching(scheduleObject) {
    return new Promise((resolve, reject) => {
      logger.info(`Accounts : ${JSON.stringify(scheduleObject)}`);

      return socialAccount
        .findOne({
          where: {
            account_id: scheduleObject.accountId,
          },
          attributes: [
            'account_id',
            'access_token',
            'refresh_token',
            'user_name',
            'social_id',
            'account_type',
          ],
        })
        .then(socialAccount => {
          if (!socialAccount)
            throw new Error('Account not available for fetching posts..');
          else {
            var batchId = '';
            switch (socialAccount.account_type) {
              case 1:
                var facebookMongoPostModelObject = new FacebookMongoPostModel();
                return this.fbConnect
                  .getFacebookPosts(
                    socialAccount.access_token,
                    socialAccount.social_id,
                    config.get('facebook_api.app_id'),
                    config.get('facebook_api.version')
                  )
                  .then(response => {
                    batchId = response.batchId;
                    logger.info(
                      `Fetched Post Details ${JSON.stringify(response.feeds)}`
                    );
                    return facebookMongoPostModelObject.insertManyPosts(
                      response.feeds
                    );
                  })
                  .then(() => {
                    // start media Downloader  through batch Id
                    return;
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                    return;
                  });
              case 2:
                var facebookMongoPostModelObject = new FacebookMongoPostModel();
                return this.fbConnect
                  .getFacebookPagePosts(
                    socialAccount.access_token,
                    socialAccount.social_id,
                    config.get('facebook_api.app_id'),
                    config.get('facebook_api.version')
                  )
                  .then(response => {
                    batchId = response.batchId;
                    logger.info(
                      `Fetched Post Details ${JSON.stringify(response.feeds)}`
                    );
                    return facebookMongoPostModelObject.insertManyPosts(
                      response.feeds
                    );
                  })
                  .then(() => {
                    // start media Downloader  through batch Id
                    return;
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                    return;
                  });
              case 3:
                var facebookMongoPostModelObject = new FacebookMongoPostModel();
                return this.fbConnect
                  .getFacebookPosts(
                    socialAccount.access_token,
                    socialAccount.social_id,
                    config.get('facebook_api.app_id'),
                    config.get('facebook_api.version')
                  )
                  .then(response => {
                    batchId = response.batchId;
                    logger.info(
                      `Fetched Post Details ${JSON.stringify(response.feeds)}`
                    );
                    return facebookMongoPostModelObject.insertManyPosts(
                      response.feeds
                    );
                  })
                  .then(() => {
                    // start media Downloader  through batch Id
                    return;
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                    return;
                  });
              case 4:
                return this.fetchAllTweets(
                  socialAccount.social_id,
                  socialAccount.access_token,
                  socialAccount.refresh_token,
                  socialAccount.user_name,
                  '0'
                );
              // var twitterMongoPostModelObject = new TwitterMongoPostModel();
              // return this.twtConnect.getUserTweets(socialAccount.social_id, socialAccount.access_token, socialAccount.refresh_token, socialAccount.user_name)
              //     .then((response) => {
              //         batchId = response.batchId;
              //         logger.info(`fetched count : ${response.tweets.length}`);
              //         return twitterMongoPostModelObject.insertManyPosts(response.tweets);
              //     })
              //     .then((insertedData) => {
              //         logger.info(`Element : ${JSON.stringify(insertedData)}`);
              //         // start media Downloader  through batch Id
              //         return;
              //     })
              //     .catch((error) => {
              //         // appInsights
              //         logger.error(`Error on fetching post details ${JSON.stringify(error)}`);
              //         return;
              //     });
              case 5:
                var instagramMongoPostModelObject =
                  new InstagramMongoPostModel();
                return this.instagramConnect
                  .getInstagramFeeds(
                    socialAccount.access_token,
                    socialAccount.social_id,
                    ''
                  )
                  .then(response => {
                    logger.info(`fetched count : ${response.length}`);
                    return instagramMongoPostModelObject
                      .insertManyPosts(response)
                      .then(result => {
                        logger.info(`Saved  Insta post details`);

                        // return this.createOrEditLastUpdateTime(
                        //   scheduleObject.accountId,
                        //   socialAccount.social_id
                        // );
                        return;
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                        return;
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `Error on fetching post details ${error.message}`
                    );
                    return;
                  });
              case 9:
                var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
                return this.googleConnect
                  .getYoutubeChannelsInfo(
                    socialAccount.social_id,
                    socialAccount.refresh_token
                  )
                  .then(response => {
                    logger.info(`fetched count : ${response.length}`);
                    return youtubeMongoPostModelObject
                      .insertManyPosts(response)
                      .then(result => {
                        logger.info(`Saved post details`);
                        return;
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                        return;
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                    return;
                  });
              case 12:
                var instagramBusinessMongoPostModelObject =
                  new InstagramBusinessMongoPostModel();
                return this.fbConnect
                  .getMediasFromInstagram(
                    socialAccount.access_token,
                    socialAccount.social_id
                  )
                  .then(response => {
                    logger.info(`fetched count : ${response.feeds.length}`);
                    return instagramBusinessMongoPostModelObject
                      .insertManyPosts(response.feeds)
                      .then(result => {
                        logger.info(`Saved post details`);
                        return;
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                        return;
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                    return;
                  });
              default:
                logger.info(
                  `default account type ${socialAccount.account_type}`
                );
                break;
            }
          }
        })
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async fetchAllTweets(
    social_id,
    access_token,
    refresh_token,
    user_name,
    archived_status
  ) {
    var max_id;
    let previousMaxid;
    do {
      let result = await this.fetchAllTweetsinloop(
        social_id,
        access_token,
        refresh_token,
        user_name,
        archived_status,
        max_id
      );
      previousMaxid = max_id;
      max_id = result;
    } while (max_id != previousMaxid);
  }

  fetchAllTweetsinloop(
    social_id,
    access_token,
    refresh_token,
    user_name,
    archived_status,
    max_id
  ) {
    return new Promise((resolve, reject) => {
      var maxId;
      return this.twtConnect
        .getAllTweets(access_token, refresh_token, user_name, max_id)
        .then(timelineTweets => {
          if (timelineTweets[timelineTweets.length - 1])
            maxId = timelineTweets[timelineTweets.length - 1].id_str;
          return this.twtConnect.parseTweetDetails(
            timelineTweets,
            social_id,
            config.get('twitter_api.app_name'),
            config.get('twitter_api.version'),
            archived_status
          );
        })
        .then(response => {
          //  maxId = response.max_id;
          logger.info(`fetched count : ${response.tweets.length}`);
          var twitterMongoPostModelObject = new TwitterMongoPostModel();
          return twitterMongoPostModelObject.insertManyPosts(response.tweets);
        })
        .then(insertedData => {
          logger.info(`Element : ${JSON.stringify(insertedData)}`);
          // start media Downloader  through batch Id
          resolve(maxId);
        })
        .catch(error => {
          // appInsights
          logger.error(
            `Error on fetching post details ${JSON.stringify(error)}`
          );
          return;
        });
    });
  }

  async removeAccount(teamId, accountId) {
    let res = await teamSocialAccountJoinTable.destroy({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            account_id: accountId,
          },
        ],
      },
    });
    return res;
  }

  async parseSearchTeamResult(teamMembers, teamInfoForSearch) {
    for (let i = 0; i < teamMembers.length; i++) {
      if (teamInfoForSearch[i].team_id == teamMembers[i].team_id)
        teamInfoForSearch[i].dataValues.teamMemberCount =
          teamMembers[i].dataValues.teamMemberCount;
    }
    return {
      totalSearchResult: teamInfoForSearch.length,
      teamInfoForSearch,
    };
  }

  async createOrUpdateFriendsList(account_id, updateDetails) {
    let userTeamAccountsLibs = new UserTeamAccountLibs();
    userTeamAccountsLibs.createOrUpdateFriendsList(account_id, updateDetails);
  }

  /**
   * TODO To send notification to particular team
   * Function To send notification to particular team
   * @param  {string} notificationMessage -Notification message
   * @param  {string} team_name -Team name
   * @param  {string} notifyType -Notification type
   * @param  {string} userName -User name
   * @param  {string} status -Status success or failed
   * @param  {Array} targetTeamsId -Targeted team id
   * @param  {Array} invitingUserId -User id
   */
  async sendTeamNotifications(notificationMessage, team_name, notifyType, userName, status, targetTeamsId, teamId) {
    // Sending notification to the Team members saying, an account is added to the Team
    let notification = new NotificationServices(config.get('notification_socioboard.host_url'));
    notification.notificationMessage = notificationMessage;
    notification.teamName = team_name;
    notification.notifyType = notifyType;
    notification.initiatorName = userName;
    notification.status = status;
    notification.targetTeamsId = targetTeamsId;
    try {
      let savedObject = await notification.saveNotifications()
      let encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
      return await notification.sendTeamNotification(teamId, encryptedNotifications);
    } catch (error) { logger.info(`Notification not sent, ${error.message}`) }

  }

  /**
   * TODO To send notification to particular team
   * Function To send notification to particular team
   * @param  {} notificationMessage
   * @param  {} team_name
   * @param  {} notifyType
   * @param  {} userName
   * @param  {} status
   * @param  {} targetTeamsId
   * @param  {} invitingUserId
   */
  async sendUserNotification(notificationMessage, team_name, notifyType, userName, status, targetTeamsId, invitingUserId) {
    let targetUserId = [];
    targetUserId.push(invitingUserId);
    // Sending notification to the Team members saying, an account is added to the Team
    let notification = new NotificationServices(config.get('notification_socioboard.host_url'));
    notification.notificationMessage = notificationMessage;
    notification.teamName = team_name;
    notification.notifyType = notifyType;
    notification.initiatorName = userName;
    notification.status = status;
    notification.targetUserId = targetUserId;
    try {
      let savedObject = await notification.saveNotifications()
      let encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
      return notification.sendUserNotification(invitingUserId, encryptedNotifications);
    } catch (error) { logger.info(`Notification not sent, ${error.message}`) }

  }

}
export default TeamLibs;
