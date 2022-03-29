import config from 'config';
import schedule from 'node-schedule';
import moment from 'moment';
import sequelize from 'sequelize';
import db from '../Sequelize-cli/models/index.js';
import AuthorizeServices from '../Services/authorize.services.js';
import TwtConnect from '../Cluster/twitter.cluster.js';
import CoreServices from '../Services/core.services.js';
import logger from '../../User/resources/Log/logger.log.js';
import FbConnect from '../Cluster/facebook.cluster.js';
import PinterestConnect from '../Cluster/pinterest.cluster.js';
import LinkedInConnect from '../Cluster/linkedin.cluster.js';
import GoogleConnect from '../Cluster/google.cluster.js';
import InstaConnect from '../Cluster/instagram.cluster.js';
import TwitterMongoPostModel from '../Mongoose/models/twitter-posts.js';
import FacebookMongoPostModel from '../Mongoose/models/facebook-posts.js';
import YoutubeMongoPostModel from '../Mongoose/models/youtube-post.js';
import InstagramMongoPostModel from '../Mongoose/models/instagram-posts.js';
import UserTeamAccountLibs from '../Shared/user-team-accounts-libs.shared.js';
import UserTeamAccount from '../Shared/user-team-accounts.shared.js';
import NotificationServices from '../Shared/notify-services.js';
import LinkedInPostMongoModels from '../Mongoose/models/linkedIn-post.js';
import InstagramBusinessMongoPostModel from '../Mongoose/models/instagram-business-posts.js';
import TumblrMongoPostModel from '../Mongoose/models/tumblr-post.js';
import TumblrConnect from './../Cluster/tumblr.cluster.js';
import PinterestMongoPostModel from '../Mongoose/models/pinterest-pins.js';
import PinterestCluster from '../Cluster/pinterest.newcluster.js';
const pinConnect = new PinterestCluster();
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
import TwitterInsightPostModel from '../Mongoose/models/twitter-insights.js';
const teamInviteUser = db.invite_user_for_team;
const pinterestBoard = db.pinterest_boards;

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
    const res = await socialAccount.findAll({
      where: {account_admin_id: userId},
    });

    return res;
  }

  async getSocialProfilesById(userId, accountId) {
    let socialAccounts = {};
    const socialAccDetails = await socialAccount.findOne({
      where: {account_admin_id: userId, account_id: accountId},
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
      const resultData = await updateFriendsTable.findOne({
        where: {account_id: socialAccDetails.account_id},
        attributes: fields,
      });

      socialAccDetails.dataValues.updatedDetails = JSON.parse(
        JSON.stringify(resultData)
      );
      socialAccounts = socialAccDetails.dataValues;

      return socialAccounts;
    }
    socialAccounts = socialAccDetails.dataValues;

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
    const response = await socialAccount.update(
      {
        rating,
      },
      {
        where: {account_id: accountId},
        returning: true,
        plain: true,
      }
    );

    return response;
  }

  async updateRating(data) {
    const response = await socialAccount.update(
      {
        rating: data.rating,
      },
      {
        where: {account_id: data.accountId},
        returning: true,
        plain: true,
      }
    );

    return response;
  }

  async getSocialAccount(userId, accountId) {
    const accounts = await socialAccount.findAll({
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

    query.account_id = {[Operator.in]: account_id};
    if (account_type != 0) query = {...query, account_type};
    const accounts = await socialAccount.findAll({
      where: query,
      raw: true,
    });

    return accounts;
  }

  async getTeamSocialAccountCount(account_id) {
    const query = {};

    query.account_id = {[Operator.in]: account_id};
    const res = await socialAccount.findAll({
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
    const result = await teamSocialAccountJoinTable.update(
      {
        is_account_locked: 1,
      },
      {where: {account_id: accounts.map(t => t.account_id)}}
    );

    return result;
  }

  async unlockProfiles(accounts) {
    const result = await teamSocialAccountJoinTable.update(
      {
        is_account_locked: 0,
      },
      {where: {account_id: accounts.map(t => t.account_id)}}
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
    let resultJson = null;

    return new Promise((resolve, reject) =>
      // Checking user is belongs to the team or not
      db.sequelize.transaction(t =>
        teamInfo
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
            {transaction: t}
          )

          .then(team => {
            const state = {
              teamId,
              network,
              accessToken,
            };
            const encryptedState = this.authorizeServices.encrypt(
              JSON.stringify(state)
            );
            let redirectUrl = '';

            if (team == null) {
              throw new Error(
                "You dont have access to add the social profile to this team"
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
                  break;
                case 'Twitter':
                  // Validating that the user is having permisiion for this network or not by user plan
                  if (userScopeAvailableNetworks.includes('4')) {
                    return this.twtConnect
                      .requestToken()
                      .then(response => {
                        const state = {
                          teamId,
                          network,
                          accessToken,
                          requestToken: response.requestToken,
                          requestSecret: response.requestSecret,
                        };
                        const encryptedState = this.authorizeServices.encrypt(
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
                  }
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }

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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }

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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
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
                  } else {
                    throw new Error(
                      'Sorry, Requested network not available for your plan.'
                    );
                  }
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
          .catch(error => {
            reject(error);
          })
      )
    );
  }

  async getProfileRedirectUrlNew(
    userId,
    teamId,
    network,
    accessToken,
    userScopeAvailableNetworks
  ) {
    const resultJson = null;

    return new Promise((resolve, reject) =>
      // Checking user is belongs to the team or not
      db.sequelize.transaction(t =>
        teamInfo
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
            {transaction: t}
          )

          .then(team => {
            const state = {
              teamId,
              network,
              accessToken,
            };
            const encryptedState = this.authorizeServices.encrypt(
              JSON.stringify(state)
            );
            const redirectUrl = '';

            if (team == null) {
              throw new Error(
                "You dont have access to add the social profile to this team"
              );
            }
          })
          .then(() => {
            resolve(resultJson);
          })
          .catch(error => {
            reject(error);
          })
      )
    );
  }

  async addSocialProfile(
    userId,
    userName,
    queryInputs,
    userScopeMaxAccountCount,
    userScopeAvailableNetworks
  ) {
    //  logger.info(`userId : ${userId}, queryInputs: ${queryInputs},userScopeMaxAccountCount:${userScopeMaxAccountCount}, userScopeAvailableNetworks:${userScopeAvailableNetworks} `);
    let ProfileCount = null;

    return new Promise((resolve, reject) =>
      // Checking the number of accounts added by the user
      db.sequelize.transaction(t =>
        socialAccount
          .count(
            {
              where: {account_admin_id: userId},
            },
            {transaction: t}
          )

          .then(count => {
            ProfileCount = count;
            const planCount = 100000;
            // Calculating how may accounts user can add by user plan
            const availableAccounts = planCount - ProfileCount;

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
                  "Sorry, As per your plan, you can't add any more account."
                )
              );
            } else if (availableCount < 1) {
              reject(
                new Error(
                  `Sorry, As per your plan, you can now add only ${availableCount}`
                )
              );
            } else {
              const networkId = this.coreServices.networks[queryInputs.network];
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
                        .then(profile =>
                          this.addProfiles(userId, userName, profile)
                        )
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
                  }
                  reject(new Error('Not available.'));

                  break;
                // #region old Facebook Pages
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
                // #endregion
                case 'Twitter':
                  //   logger.info(`Entered inside twitter!`);
                  if (userScopeAvailableNetworks.includes('4')) {
                    var result = {};
                    let updatedProfileDetails = {};

                    return (
                      this.twtConnect
                        .addTwitterProfile(
                          networkId,
                          queryInputs.teamId,
                          queryInputs.requestToken,
                          queryInputs.requestSecret,
                          queryInputs.code
                        )
                        .then(profile =>
                          this.addProfiles(userId, userName, profile)
                        )
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
                          const data = {
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
                  }
                  reject(new Error('Not available.'));

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
                        .then(profile =>
                          this.addProfiles(userId, userName, profile)
                        )
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
                  }
                  reject(new Error('Not available.'));
                  break;
                case 'Instagram':
                  if (userScopeAvailableNetworks.includes('5')) {
                    return this.instagramConnect
                      .addInstagramProfile(
                        networkId,
                        queryInputs.teamId,
                        queryInputs.code
                      )
                      .then(profile =>
                        //  logger.info(`Profile details : ${JSON.stringify(profile)} `);
                        this.addProfiles(userId, userName, profile)
                      )
                      .then(response => {
                        result = response;

                        return this.instagramConnect.getInstagramProfileInformation(
                          result.profileDetails.access_token
                        );
                      })
                      .then(response => {
                        const parsedData = JSON.parse(response.Info);
                        const updateDetails = {
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
                  }
                  reject(new Error('Not available.'));
                  break;
                case 'Pinterest':
                  if (userScopeAvailableNetworks.includes('11')) {
                    this.pinterestConnect
                      .addPinterestProfile(
                        networkId,
                        queryInputs.teamId,
                        queryInputs.code
                      )
                      .then(profile =>
                        this.addProfiles(userId, userName, profile)
                      )
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
                      .then(profile =>
                        this.addProfiles(userId, userName, profile)
                      )
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
          })
      )
    );
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
        const subscribeAccountsAccessTokens = [];
        const insertedAccountIdsWithType = [];
        let teamDetails = {};
        let addingSocialIds = [];
        let isErrorOnNetwork = false;
        const erroredAccountsNames = [];
        let erroredSocialProfiles = [];
        let ProfileCount = 0;
        let ProfileInfo = {};

        return db.sequelize.transaction(t =>
          teamInfo
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
              {transaction: t}
            )
            .then(team => {
              if (team == null) {
                throw new Error(
                  "You don't have access to add the profile to the team"
                );
              } else {
                teamDetails = team;
                addingSocialIds = [];
                isErrorOnNetwork = false;

                profiles.map(profile => {
                  if (!isErrorOnNetwork) {
                    if (
                      this.coreServices.webhooksSupportedAccountType.includes(
                        String(profile.account_type)
                      )
                    ) {
                      const accountSubscribeDetails = {
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
                      case '16':
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
                    where: {social_id: addingSocialIds},
                    attributes: ['account_id', 'social_id'],
                  });
                }
                throw new Error(
                  'Sorry, you are trying to add some invalid type of account with respect to your plan.'
                );
              }
            })
            .then(socialAcc => {
              erroredSocialProfiles = [];
              socialAcc.map(account => {
                erroredSocialProfiles.push(account.social_id);
              });

              return socialAccount.count(
                {
                  where: {account_admin_id: userId},
                },
                {transaction: t}
              );
            })
            .then(count => {
              ProfileCount = count;
              const planCount = userScopeMaxAccountCount;
              const availableAccounts = planCount - ProfileCount;

              if (availableAccounts == 0) {
                throw new Error(
                  "Sorry, As per your plan, you can't add any more account."
                );
              } else if (availableAccounts < addingSocialIds.length) {
                throw new Error(
                  `Sorry, As per your plan, you can now add only ${availableAccounts}`
                );
              }
            })
            .then(() => {
              const filteredProfiles = profiles.filter(
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
                through: {is_account_locked: false},
              });
            })
            .then(() => {
              const insertedAccountIds = [];

              ProfileInfo.map(element => {
                insertedAccountIds.push(element.account_id);
                insertedAccountIdsWithType.push({
                  account_id: element.account_id,
                  account_type: element.account_type,
                  access_token: element.access_token,
                  refresh_token: element.refresh_token,
                  social_id: element.social_id,
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
                          .catch(() => {});
                      case '4':
                        return this.twtConnect
                          .updateSubscriptions(
                            accountDetails.AccessToken,
                            accountDetails.RefreshToken,
                            true
                          )
                          .catch(() => {});
                      case '9':
                        return this.googleConnect
                          .updateSubscriptions(accountDetails.SocialId, true)
                          .catch(() => {});
                      case '12':
                        return this.fbConnect
                          .subscribeWebhooks(
                            accountDetails.AccessToken,
                            accountDetails.SocialId,
                            config.get('instagram.business_subscription_fields')
                          )
                          .catch(() => {});
                      default:
                        break;
                    }
                  })
                );
              }
            })
            .then(() =>
              Promise.all(
                insertedAccountIdsWithType.map(element => {
                  switch (String(element.account_type)) {
                    case '2':
                      return this.fbConnect
                        .getFbPageStats(element.access_token)
                        .then(updateDetails =>
                          this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          )
                        )
                        .catch(() => {});
                    case '7':
                      return this.linkedInConnect
                        .linkedInPageStats(
                          element.social_id,
                          element.access_token
                        )
                        .then(updateDetails => {
                          this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          );
                        })
                        .catch(() => {});
                    case '9':
                      return this.googleConnect
                        .getYtbChannelDetails('', element.refresh_token)
                        .then(updateDetails =>
                          this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          )
                        )
                        .catch(() => {});

                    case '12':
                      return this.fbConnect
                        .getInstaBusinessStats(element.access_token)
                        .then(updateDetails =>
                          this.createOrUpdateFriendsList(
                            element.account_id,
                            updateDetails
                          )
                        )
                        .catch(() => {});
                  }
                })
              )
            )
            .then(() => {
              profiles.map(account => {
                erroredSocialProfiles.forEach(accountId => {
                  if (account.social_id == accountId)
                    erroredAccountsNames.push(account.first_name);
                });
              });
              resolve({
                teamDetails,
                profileDetails: ProfileInfo,
                errorProfileId: erroredAccountsNames,
              });
            })
            .catch(error => {
              reject(error);
            })
        );
      }
    });
  }

  scheduleMulitNetworkPostFetching(accountIds) {
    return new Promise((resolve, reject) => {
      if (accountIds.length > 0) {
        accountIds.forEach(id => {
          const scheduleDate = moment().add(2, 'seconds');
          const batchId = `${id}_${String(moment().unix())}`;
          const scheduleObject = {
            accountId: id,
          };
          const time = new Date(scheduleDate);

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
  addProfiles(userId, userName, profile, invite) {
    let ProfileInfo = null;
    let teamDetails = null;

    return new Promise((resolve, reject) => {
      if (!profile) {
        reject(new Error('Invalid Inputs'));
      } else {
        return db.sequelize.transaction(t =>
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
              {transaction: t}
            )
            .then(team => {
              if (team == null) {
                throw new Error(
                  "You don't have access to add the profile to team"
                );
              } else {
                teamDetails = team;

                return socialAccount.findOne({
                  where: {
                    social_id: profile.SocialId,
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
                    is_invite: invite,
                  },
                  {transaction: t}
                );
              }
            })
            .then(profileDetails => {
              ProfileInfo = profileDetails;

              return profileDetails.setTeam(teamDetails, {
                transaction: t,
                through: {is_account_locked: false},
              });
            })
            .then(() => {
              if (ProfileInfo.account_type == 11) {
                if (profile.Boards.length > 0) {
                  profile.Boards.map(boards => {
                    boards.social_account_id = ProfileInfo.account_id;
                  });
                  return pinterestBoard.bulkCreate(profile.Boards, {
                    transaction: t,
                    returning: true,
                  });
                } else return;
              } else return;
            })
            .then(() =>
              this.scheduleNetworkPostFetching(ProfileInfo.account_id).catch(
                error => {
                  logger.error(error.message);
                }
              )
            )
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
                  .catch(error => {});
              }
            })
            .then(() => {
              const targetTeamsId = [];

              targetTeamsId.push(profile.TeamId);
              if (config.get('notification_socioboard.status') == 'on') {
                return this.sendTeamNotifications(
                  `${userName} added the social profiles to a ${teamDetails.team_name} team.`,
                  teamDetails.team_name,
                  'team_addProfile',
                  userName,
                  'success',
                  targetTeamsId,
                  profile.TeamId
                );
              }
            })
            .then(() => {
              resolve({
                teamDetails,
                profileDetails: ProfileInfo,
              });
            })
            .catch(error => {
              console.error(`Error adding account inside ${error}`);
              reject(error);
            })
        );
      }
    });
  }

  /**
   * TODO To add specified network profile to DB
   * add specified network profile to DB
   * @param {number} userId - User id
   * @param {Object} profile - Profile Object of the Specified Network
   * @param {string} accName - Account Name
   * @return {object} Returns object contains Team and Profile details
   */
  async addProfilesByInvitation(userId, profile, accName) {
    let ProfileInfo = null;
    let teamDetails = null;
    return new Promise((resolve, reject) => {
      if (!profile) {
        reject(new Error('Invalid Inputs'));
      } else {
        logger.info(`profiles, ${profile}`);
        return db.sequelize.transaction(t => {
          return teamInfo
            .findOne(
              {
                where: {
                  [Operator.or]: [
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
              {transaction: t}
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
                logger.info('Account has been added already!');
                throw new Error('Account has been added already!');
              } else {
                logger.info('Account is addding!');
                return socialAccount.create(
                  {
                    account_type: profile.Network,
                    user_name: profile.UserName,
                    account_name: accName,
                    first_name: profile.FirstName,
                    last_name: profile.LastName,
                    email: profile.Email,
                    social_id: profile.SocialId,
                    profile_pic_url: profile.ProfilePicture,
                    cover_pic_url: profile.cover_pic_url,
                    profile_url: profile.ProfileUrl,
                    access_token: profile.AccessToken,
                    refresh_token: profile.RefreshToken,
                    friendship_counts: profile.FriendCount,
                    favorite_count: profile.FavCount,
                    is_invite: 1,
                    info: profile.Info,
                    account_admin_id: userId,
                  },
                  {transaction: t}
                );
              }
            })
            .then(profileDetails => {
              ProfileInfo = profileDetails;
              return profileDetails.setTeam(teamDetails, {
                transaction: t,
                through: {is_account_locked: false},
              });
            })
            .then(() => {
              logger.info('Started fetching feeds');
              return this.scheduleNetworkPostFetching(
                ProfileInfo.account_id
              ).catch(error => {
                logger.error(error.message);
              });
            })
            .then(() => {
              resolve({teamDetails: teamDetails, profileDetails: ProfileInfo});
            })
            .catch(function (error) {
              logger.error('Error while storing the Twiiter details', error);
              reject(error);
            });
        });
      }
    });
  }

  async deleteSocialProfile(userId, accountId, teamId, userName) {
    return new Promise((resolve, reject) => {
      let fetchedSocialAccount = '';

      return db.sequelize.transaction(t =>
        this.getUserDetails(userId)
          .then(userDetails =>
            socialAccount
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
                if (socialAcc == null) {
                  throw new Error(
                    'No such social account or Only admin that profile can delete an account!'
                  );
                }
                // else if (userDetails.email == socialAcc.email) {
                //     throw new Error("You can't delete this account. As this is your primary account, which you used to login to Socioboard.");
                // }
                else {
                  fetchedSocialAccount = socialAcc;
                  const scheduleDate = moment().add(2, 'seconds');
                  const batchId = `${socialAcc.social_id}_${String(
                    moment().unix()
                  )}`;

                  this.scheduleObject = {
                    accountType: socialAcc.account_type,
                    socialId: socialAcc.social_id,
                    accessToken: socialAcc.access_token,
                    refreshToken: socialAcc.refresh_token,
                  };
                  const time = new Date(scheduleDate);

                  schedule.scheduleJob(batchId, time, () => {
                    // logger.info(`Started network posts deleting for social id: ${this.scheduleObject.socialId}`);
                    // Started network posts deleting for social account
                    this.deleteAccountsMongoPosts(this.scheduleObject)
                      .then(() => {
                        // logger.info("Deleting process completed.");
                      })
                      .catch(error => {
                        //  logger.error(error.message);
                      });
                  });
                }
              })
              .then(() => {
                if (teamId) {
                  return teamInfo.findOne({
                    where: {
                      team_id: teamId,
                    },
                    attributes: ['team_id', 'team_name'],
                  });
                }
              })
              .then(teamDetails => {
                const targetTeamsId = [];

                targetTeamsId.push(teamId);
                if (
                  config.get('notification_socioboard.status') == 'on' &&
                  teamId
                ) {
                  return this.sendTeamNotifications(
                    `${userName} removed one profile from Team.`,
                    teamDetails.team_name,
                    'team_deleteTeamSocialProfile',
                    userName,
                    'success',
                    targetTeamsId,
                    teamId
                  );
                }
              })
              .then(() =>
                fetchedSocialAccount
                  .destroy({
                    where: {account_id: accountId},
                  })
                  .catch(error => {
                    throw new Error(error.message);
                  })
              )
              .then(() => {
                resolve('success');
              })
              .catch(error => {
                reject(error);
              })
          )
          .catch(error => {
            reject(error);
          })
      );
    });
  }

  async getUserDetails(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject({error: true, message: 'Invalid userId'});
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
                where: {id: db.Sequelize.col('user_activation_id')},
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
            if (!userDetails) reject({error: true, message: 'User not found!'});
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
        case 11:
          let pinterestObject = new PinterestMongoPostModel();
          pinterestObject
            .deleteAccountPosts(accountDetails.socialId)
            .then(() => {
              resolve();
            });
        case 12:
          const instagramBusinessMongoPostModelObject =
            new InstagramBusinessMongoPostModel();
          instagramBusinessMongoPostModelObject
            .deleteAccountPosts(accountDetails.socialId)
            .then(() => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
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
    const response = await socialAccount.update(
      {
        refresh_feeds: cronvalue,
      },
      {
        where: {account_id: accountId},
        returning: true,
        plain: true,
      }
    );

    return response;
  }

  scheduleNetworkPostFetching(accountId) {
    return new Promise((resolve, reject) => {
      const scheduleDate = moment().add(3, 'seconds');
      const batchId = String(moment().unix());

      const time = new Date(scheduleDate);

      const scheduleObject = {
        accountId,
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
    const res = await userDetails.findOne({
      where: {user_id: userId},
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
    const res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: {team_name: {[Operator.like]: `%${teamName}%`}},
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
    const res = await userDetails.findOne({
      where: {user_id},
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: {team_id},
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
  //                 model: social-account,
  //                 as: 'SocialAccount',
  //                 // attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
  //                 attributes: ['is_account_locked']
  //             }]
  //             // ,
  //             // order: [
  //             //     [{
  //             //         model: social-account,
  //             //         as: 'SocialAccount'
  //             //     }, "create_on", "DESC"]
  //             // ]
  //         });
  //     }));
  // }

  async teamSocialAccount(teamInformation) {
    return Promise.all(
      teamInformation.Team.map(teamResponse =>
        teamInfo.findAll({
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
        })
      )
    );
  }

  async searchTeamSocialAccount(teamInformation, SocialAccountInfo) {
    return Promise.all(
      teamInformation.Team.map(teamResponse => {
        const innerQuery = {};

        if (SocialAccountInfo.rating.length != 0)
          innerQuery.rating = {[Operator.or]: SocialAccountInfo.rating};
        if (SocialAccountInfo.accountType.length != 0) {
          innerQuery.account_type = {
            [Operator.or]: SocialAccountInfo.accountType,
          };
        }

        return teamInfo.findAll({
          where: {team_id: teamResponse.dataValues.team_id},
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
    const res = await teamInfo.findAll({
      where: {
        team_id: {[Operator.in]: teamId},
      },
      group: ['team_id'],
    });

    return res;
  }

  async getTeamDetails(userId, teamId) {
    const teams = await teamInfo.findAll({
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
    const teams = await teamInfo.findOne({
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
    const result = await teamInfo.update(
      {
        is_team_locked: 1,
      },
      {where: {team_id: accounts.map(t => t.team_id)}}
    );

    return result;
  }

  async unlockTeam(accounts) {
    const result = await teamInfo.update(
      {
        is_team_locked: 0,
      },
      {where: {team_id: accounts.map(t => t.team_id)}}
    );

    return result;
  }

  async createTeam(userId, teamDescription) {
    const transaction = await db.sequelize.transaction();

    try {
      const teamDetails = await teamInfo.create(
        {
          team_name: teamDescription.name,
          team_description: teamDescription.description,
          team_logo: teamDescription.logoUrl,
          team_admin_id: userId,
          is_default_team: false,
        },
        {transaction}
      );

      const user = await userDetails.findOne(
        {
          where: {user_id: userId},
          attributes: ['user_id'],
        },
        {transaction}
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
      throw new Error(error.message);
    }
  }

  async getTeamInfo(userId, teamName) {
    const res = await teamInfo.findOne({
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
    const res = await teamInfo.findOne({
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
    const transaction = await db.sequelize.transaction();
    const res = await teamInfo.update(
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
      {transaction}
    );

    return res;
  }

  async getAllTeamOfUser(userId) {
    const res = await teamInfo.findAll({
      where: {
        team_admin_id: userId,
      },
      attributes: ['team_id'],
    });

    return res;
  }

  async getAllteamsAccount(usersTeamIds) {
    const res = await teamSocialAccountJoinTable.findAll({
      where: {
        team_id: usersTeamIds,
      },
      attributes: ['id', 'account_id', 'team_id'],
    });

    return res;
  }

  async getTeamsSocialAccount(team_id) {
    const res = await teamSocialAccountJoinTable.findAll({
      where: {
        team_id,
      },
      // attributes: ['id', 'account_id', 'team_id']
    });

    return res;
  }

  async deleteTeam(teamId) {
    const res = await teamInfo.destroy({
      where: {
        team_id: teamId,
      },
    });

    return res;
  }

  async deleteSocialAccount(filteredDeleteAccounts) {
    const res = socialAccount.destroy({
      where: {account_id: filteredDeleteAccounts},
    });

    return res;
  }

  async isUserRegistered(invitingUserEmail) {
    const res = await userDetails.findOne({
      where: {email: invitingUserEmail},
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {activation_status: 1},
        },
      ],
      attributes: ['user_id'],
    });

    return res;
  }

  async getTotalTeamMember(userId) {
    const res = await userTeamJoinTable.count({
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
    const res = await userTeamJoinTable.findOne({
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
    const res = await userTeamJoinTable.create({
      team_id: teamId,
      user_id: invitingUserId,
      invitation_accepted: false,
      permission,
      left_from_team: false,
      invited_by: userId,
    });

    return res;
  }

  async teamInformation(userId) {
    const res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          attributes: ['team_id'],
          through: {
            where: {invitation_accepted: false, left_from_team: false},
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
        team_id,
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
    const res = await userDetails.findOne({
      where: {user_id: team_admin_id},
      raw: true,
      attributes: ['first_name'],
    });

    details.dataValues.team_admin_name = res.first_name;

    return details;
  }

  async userTeamJoinTableInfo(userId, teamId) {
    const res = await userTeamJoinTable.findOne({
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
    const res = await userTeamJoinTable.findOne({
      where: {
        [Operator.and]: [
          {
            user_id: userId,
          },
          {
            team_id: teamId,
          },
          {
            invited_by: {[Operator.ne]: [userId]},
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
    const result = await userTeamJoinTable.update(
      {
        invitation_accepted: true,
        left_from_team: false,
      },
      {where: {[Operator.and]: [{user_id: userId}, {team_id: teamId}]}}
    );

    return result;
  }

  async declineTeam(userId, teamId) {
    const transaction = await db.sequelize.transaction();
    const res = await userTeamJoinTable.destroy({
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
    const res = await userTeamJoinTable.destroy({
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
      filteredTeams.Team.map(teamResponse =>
        userTeamJoinTable.findAll({
          where: {team_id: teamResponse.dataValues.team_id},
          attributes: [
            'id',
            'team_id',
            'invitation_accepted',
            'left_from_team',
            'permission',
            'user_id',
          ],
          raw: true,
        })
      )
    );
  }

  async teamMembersSearch(teamInformation) {
    return Promise.all(
      teamInformation.Team.map(teamResponse =>
        teamInfo.findAll({
          where: {
            team_id: teamResponse.dataValues.team_id,
          },
          // ,
          // attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
          // include: [{
          //     model: social-account,
          //     as: 'SocialAccount',
          //     // attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
          //     through: {
          //         attributes: ['is_account_locked']
          //     }
          // }],
          // order: [
          //     [{
          //         model: social-account,
          //         as: 'SocialAccount'
          //     }, "create_on", "DESC"]
          // ]
        })
      )
    );
  }

  async memberTeam(team_id) {
    return userTeamJoinTable.findAll({
      where: {team_id},
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
      teamMembers.map(teamResponse =>
        Promise.all(
          teamResponse.map(userIdentifier =>
            userDetails.findOne({
              where: {user_id: userIdentifier.user_id},
              attributes: [
                'user_id',
                'email',
                'first_name',
                'last_name',
                'profile_picture',
              ],
              raw: true,
            })
          )
        )
      )
    );
  }

  async getAvailableTeamMember(teamMembers) {
    const res = await userDetails.findAll({
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
      where: {account_admin_id: userId},
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
  }

  async socialAccountStats(userId) {
    const accounts = await socialAccount.findAll({
      where: {account_admin_id: userId},
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    const pinterestBoards = [];
    const SocialAccountStats = [];
    const res = await Promise.all(
      accounts.map(account => {
        let fields = [];

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
          case 7:
            fields = ['account_id', 'follower_count'];
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
        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: {account_id: account.account_id},
              attributes: fields,
            })
            .then(resultData => {
              const data = resultData.toJSON();

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
    const account_ids = [];

    if (socaialAccountDetails[0]) {
      socaialAccountDetails[0].SocialAccount.map(x => {
        account_ids.push(x.account_id);
      });
    }
    const accounts = await socialAccount.findAll({
      where: {account_id: account_ids},
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    const SocialAccountStats = [];
    const res = await Promise.all(
      accounts.map(account => {
        let fields = [];

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

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: {account_id: account.account_id},
              attributes: fields,
            })
            .then(resultData => {
              const data = resultData.toJSON();

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
    const accounts = await socialAccount.findAll({
      where: {account_id: account_ids},
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    const pinterestBoards = [];
    const SocialAccountStats = [];
    const res = await Promise.all(
      accounts.map(account => {
        let fields = [];

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

        if (fields.length > 0) {
          return updateFriendsTable
            .findOne({
              where: {account_id: account.account_id},
              attributes: fields,
            })
            .then(resultData => {
              const data = resultData.toJSON();

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
    const res = await teamSocialAccountJoinTable.findAll({
      where: {is_account_locked: true, account_id},
      attributes: ['account_id'],
    });

    return res;
  }

  async socialAccountStatsTeam(accountId) {
    const accounts = await socialAccount.findAll({
      where: {
        account_id: {[Operator.in]: accountId},
      },
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
    });
    const pinterestBoards = [];
    const SocialAccountStats = [];
    const res = await Promise.all(
      accounts.map(account => {
        let fields = [];

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
              where: {account_id: account.account_id},
              attributes: fields,
            })
            .then(resultData => {
              const data = resultData.toJSON();

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
    const res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: ['user_id'],
      include: [
        {
          model: teamInfo,
          as: 'Team',
          where: {team_id: teamId},
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
      teamInformation.Team.map(teamResponse =>
        teamInfo.findAll({
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
        })
      )
    );
  }

  async checkTeamDetails(userId, teamId) {
    const res = await teamInfo.findOne({
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
    const res = await userTeamJoinTable.findOne({
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
      where: {user_id: memberId},
      attributes: ['user_id', 'first_name'],
    });
  }

  async removeFromTeam(teamId, user_id, userId) {
    const res = await userTeamJoinTable.destroy({
      where: {
        [Operator.and]: [
          {
            team_id: teamId,
          },
          {
            user_id,
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
    const res = await teamInfo.findOne({
      where: {team_id: teamId},
      attributes: ['team_id', 'team_name', 'team_admin_id'],
    });

    return res;
  }

  async leaveFromTeam(teamId, userId) {
    return userTeamJoinTable.update(
      {left_from_team: true},
      {where: {team_id: teamId, user_id: userId}}
    );
  }

  async updatePermission(teamId, memberId, permission) {
    const res = await userTeamJoinTable.update(
      {
        permission,
      },
      {where: {team_id: teamId, user_id: memberId}}
    );

    return res;
  }

  async getTeam(userId, teamId) {
    const team = await teamInfo.findOne({
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
    const res = await socialAccount.findOne({
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
    const res = await socialAccount.findOne({
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

    //     let socialAcc = await social-account.findOne({
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

    const res = await teamSocialAccountJoinTable.create({
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
            let batchId = '';

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
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
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
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
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
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
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
              // return this.twtConnect.getUserTweets(social-account.social_id, social-account.access_token, social-account.refresh_token, social-account.user_name)
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
                        logger.info('Saved  Insta post details');

                        // return this.createOrEditLastUpdateTime(
                        //   scheduleObject.accountId,
                        //   social-account.social_id
                        // );
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `Error on fetching post details ${error.message}`
                    );
                  });
              case 7:
                return this.fetchAllLinkedInPost(
                  socialAccount.social_id,
                  socialAccount.access_token
                );
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
                        logger.info('Saved post details');
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
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
                        logger.info('Saved post details');
                      })
                      .catch(result => {
                        logger.error(
                          `Error on saving post details : ${result}`
                        );
                      });
                  })
                  .catch(error => {
                    // appInsights
                    logger.error(
                      `error on fetching post details ${error.message}`
                    );
                  });
              case 16:
                let TumblrMongoPostModelObject = new TumblrMongoPostModel();
                return TumblrConnect.getBlogPostDetails(
                  config.get('tumblr_api.OAuth_consumer_Key'),
                  socialAccount.social_id
                )
                  .then(response => {
                    logger.info(
                      `Tumblr Feed Fetched count : ${response.length}`
                    );
                    return TumblrMongoPostModelObject.insertManyPosts(response)
                      .then(result => {
                        logger.info('Saved  Insta post details');
                      })
                      .catch(result => {
                        logger.error(
                          `Error in saving Tumblr post details : ${result}`
                        );
                      });
                  })
                  .catch(error => {
                    logger.error(
                      `Error in Fetching Tumblr Post details from Tumblr API ${error.message}`
                    );
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
    let max_id;
    let previousMaxid;

    do {
      const result = await this.fetchAllTweetsinloop(
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
      let maxId;

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
          const twitterMongoPostModelObject = new TwitterMongoPostModel();

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
        });
    });
  }
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
  }

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

  async removeAccount(teamId, accountId) {
    const res = await teamSocialAccountJoinTable.destroy({
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
    const userTeamAccountsLibs = new UserTeamAccountLibs();

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
  async sendTeamNotifications(
    notificationMessage,
    team_name,
    notifyType,
    userName,
    status,
    targetTeamsId,
    teamId
  ) {
    // Sending notification to the Team members saying, an account is added to the Team
    const notification = new NotificationServices(
      config.get('notification_socioboard.host_url')
    );

    notification.notificationMessage = notificationMessage;
    notification.teamName = team_name;
    notification.notifyType = notifyType;
    notification.initiatorName = userName;
    notification.status = status;
    notification.targetTeamsId = targetTeamsId;
    try {
      const savedObject = await notification.saveNotifications();
      const encryptedNotifications = this.authorizeServices.encrypt(
        JSON.stringify(savedObject)
      );

      return await notification.sendTeamNotification(
        teamId,
        encryptedNotifications
      );
    } catch (error) {
      logger.info(`Notification not sent, ${error.message}`);
    }
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
  async sendUserNotification(
    notificationMessage,
    team_name,
    notifyType,
    userName,
    status,
    targetTeamsId,
    invitingUserId
  ) {
    const targetUserId = [];

    targetUserId.push(invitingUserId);
    // Sending notification to the Team members saying, an account is added to the Team
    const notification = new NotificationServices(
      config.get('notification_socioboard.host_url')
    );

    notification.notificationMessage = notificationMessage;
    notification.teamName = team_name;
    notification.notifyType = notifyType;
    notification.initiatorName = userName;
    notification.status = status;
    notification.targetUserId = targetUserId;
    try {
      const savedObject = await notification.saveNotifications();
      const encryptedNotifications = this.authorizeServices.encrypt(
        JSON.stringify(savedObject)
      );

      return notification.sendUserNotification(
        invitingUserId,
        encryptedNotifications
      );
    } catch (error) {
      logger.info(`Notification not sent, ${error.message}`);
    }
  }

  /**
   * TODO To get access token from refresh token
   * Function To get access token from refresh token
   * Returns updated access token
   */
  async refreshTokenLinkedIn() {
    let linkedInAccount = await socialAccount.findAll({
      where: {account_type: [6, 7]},
      raw: true,
    });
    linkedInAccount?.map(async x => {
      let updateDays = moment().diff(moment(x.updated_at), 'days');
      let addedDate = moment().diff(moment(x.created_at), 'days');
      if (updateDays == 59 && addedDate < 360) {
        let data = await this.linkedInConnect.getAccessTokenFromRefreshToken(
          x.refresh_token
        );
        logger.info(
          `Updated access token for id: ${x.account_id} added date: ${addedDate}`
        );
        //update access token
        if (data.accessToken) {
          await socialAccount.update(
            {
              access_token: data.accessToken,
              updated_at: moment.now(),
            },
            {
              where: {account_id: x.account_id},
            }
          );
        }
      }
    });
  }

  /**
   * TODO To check social account stats and update
   * Function To check social account stats and update
   * @param  {number} account_id -Account id.
   */
  async socialAccountDetails(account_id) {
    let socialProfile = await socialAccount.findOne({
      where: {account_id},
      raw: true,
    });
    let isRunRecentstats = await UserTeamAccount.isNeedToFetchRecentStats(
      account_id,
      socialProfile.refresh_feeds == 2 ? 12 : 24,
      'hours'
    );
    if (isRunRecentstats) {
      let updateDetails;
      switch (socialProfile.account_type) {
        case 1:
          updateDetails = await this.fbConnect.getFbProfileStats(
            socialProfile.access_token
          );
          break;
        case 2:
          updateDetails = await this.fbConnect.getFbPageStats(
            socialProfile.access_token
          );
          break;
        case 4:
          updateDetails = await this.twtConnect.getLookupList(
            socialProfile.access_token,
            socialProfile.refresh_token,
            socialProfile.user_name
          );
          if (updateDetails) {
            const data = {
              accountId: account_id,
              insights: {
                followerCount: updateDetails.follower_count,
                followingCount: updateDetails.following_count,
                favouritesCount: updateDetails.favorite_count,
                postsCount: updateDetails.total_post_count,
                userMentions: updateDetails.user_mentions,
                retweetCount: updateDetails.retweet_count,
              },
            };
            const twitterInsightPostModelObject = new TwitterInsightPostModel();
            twitterInsightPostModelObject.insertInsights(data);
          }
          break;
        case 7:
          updateDetails = await this.linkedInConnect.linkedInPageStats(
            socialProfile.social_id,
            socialProfile.access_token
          );
          break;
        case 9:
          updateDetails = await this.googleConnect.getYtbChannelDetails(
            '',
            socialProfile.refresh_token
          );
          break;
        case 11:
          updateDetails = await this.getRecentBoard(socialProfile);
          break;
        case 12:
          updateDetails = await this.fbConnect.getInstaBusinessStats(
            socialProfile.access_token
          );
          break;
        case 6:
          updateDetails = this.getLinkedInProfilePic(socialProfile);
          break;
        default:
          break;
      }
      if (updateDetails)
        this.createOrUpdateFriendsList(account_id, updateDetails);
    }
  }

  /**
   * TODO To check user invited to join sociobard if not invite
   * Function To check user invited to join sociobard if not invite
   * @param  {number} team_id -Team id.
   * @param  {string} firstName -First name of user need to invite
   * @param  {number} invited_by -Invited user id.
   * @param  {string} email -Email id of user invited
   * @param  {number} permission -Permission for the team.
   * @param  {number} status -Status.
   */
  async addTeamDetails(
    team_id,
    firstName,
    invited_by,
    email,
    permission,
    status = 0
  ) {
    let checkAlreadyAdded = await teamInviteUser.findOne({
      where: {
        team_id,
        email,
        status: 0,
      },
      raw: true,
    });
    if (!checkAlreadyAdded)
      await teamInviteUser.create({
        team_id,
        firstName,
        invited_by,
        email,
        permission,
        status,
      });
  }

  /**
   * TODO To get Pinterst Users with Board details
   * Function To get Pinterst Users with Board details
   * @param  {number} UserId - User Id
   * @return  {Array} Pinterest Account details
   */
  async getTeamBoard(userId, teamId) {
    let pinterestAccts = await this.getPinterstSocilaAcc(userId, teamId);
    let boardsData = await this.getBoard(pinterestAccts);
    return boardsData;
  }

  /**
   * TODO To get User's Pinterst Account
   * Function To get User's Pinterst Account
   * @param  {number} UserId - User Id
   * @param  {number} team_id - Team Id
   * @return {Array} Users Pinterest Account
   */
  async getPinterstSocilaAcc(userId, team_id) {
    let accIds = [];
    let res = await teamSocialAccountJoinTable.findAll({
      where: {team_id},
      raw: true,
    });
    res.map(x => {
      if (x.is_account_locked == 0) {
        accIds.push(x.account_id);
      }
    });
    let pinterestAccts = await socialAccount.findAll({
      where: {
        account_id: {[Operator.in]: accIds},
        account_type: '11',
      },
      raw: true,
    });
    return pinterestAccts;
  }

  /**
   * TODO To get Pinterst Board deatils
   * Function To get Pinterst Board deatils
   * @param  {Array} pinterestAccts - Pinterest Accs
   * @return {object} Pinterest Boars  Deatils
   */
  async getBoard(pinterestAccts) {
    let BoardDetials = [];
    const promises = pinterestAccts.map(async x => {
      let boarddata = await this.getPinterestBoards(x.account_id);
      BoardDetials.push({...x, boardDetails: boarddata});
    });
    await Promise.all(promises);
    return BoardDetials;
  }

  /**
   * TODO To get number of Pinterst Account for User Account
   * Function To get number of Pinterst Account for User Account
   * @param  {number} UserId - User Id
   * @return {Array} Users Pinterest Account
   */
  async getPinterestBoards(userId) {
    const res = await pinterestBoard.findAll({
      where: {social_account_id: userId},
      raw: true,
    });
    return res;
  }

  /**
   * TODO To update linkedin profile pic url for profile
   * Function To update linkedin profile pic url for profile
   * @param  {object} socialAccDetails - Social Account details
   * @return {object} linked in profile url
   */
  async getLinkedInProfilePic(socialAccDetails) {
    try {
      let accessTokenData =
        await this.linkedInConnect.getAccessTokenFromRefreshToken(
          socialAccDetails.refresh_token
        );
      let profileDetails = await this.linkedInConnect.getLinkedInProfilePic(
        accessTokenData.accessToken
      );
      if (profileDetails)
        await socialAccount.update(profileDetails, {
          where: {account_id: socialAccDetails.account_id},
        });
      return {profile_picture: profileDetails?.profile_pic_url ?? ''};
    } catch (e) {}
  }

  /**
   * Note to  get Recent Pinterest Boards
   * Function to get Recent Pinterest Boards
   * @param {object} socialProfile - Social Account details
   * @return {object} blog status count
   */
  async getRecentBoard(socialProfile) {
    let newboard = await pinConnect.getBoards(socialProfile.access_token);

    if (newboard.length > 0) {
      await this.flushBoard(socialProfile);
      newboard.map(boards => {
        boards.social_account_id = socialProfile.account_id;
      });
      await db.sequelize.transaction(t =>
        pinterestBoard.bulkCreate(newboard, {transaction: t, returning: true})
      );
    }
    let data = {
      board_count: newboard.length ?? 0,
    };
    return data;
  }

  /**
   * Note to  delete  Pinterest Boards
   * Function to delete  Pinterest Boards
   * @param {object} socialProfile - Social Account details
   */
  async flushBoard(socialProfile) {
    pinterestBoard.destroy({
      where: {
        social_account_id: socialProfile.account_id,
      },
    });
  }

  /**
   * Update access token in social accounts db
   * @param {number} accountId
   * @param {string} accessToken
   * @returns {object} Success of Error object
   */
  updateAccessToken(accountId, accessToken) {
    return socialAccount.update(
      {
        access_token: accessToken,
      },
      {
        where: {
          account_id: accountId,
        },
      }
    );
  }

  /**
   * Check user and team details
   * @param {number} userId User id
   * @param {string} teamId Team id
   * @returns {object} team details
   */
  async otherTeamDetails(userId, teamId) {
    let result = await userTeamJoinTable.findOne({
      where: {
        user_id: userId,
        team_id: teamId,
        left_from_team: false,
      },
      attributes: ['id', 'user_id', 'permission'],
      raw: true,
    });

    if (!result) throw new Error('User not belongs to the team!');

    if (result.permission === 0)
      throw new Error(`You don't have access to add the profile to the team!`);
  }
}
export default TeamLibs;
