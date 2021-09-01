import config from 'config';
import {resolve} from 'path';
import Validator from './social-account.validate.js';
import {
  ValidateErrorResponse,
  CatchResponse,
  ErrorResponse,
  SuccessResponse,
  SuccessNavigationResponse,
  AddSocialAccRes,
} from '../../../Common/Shared/response.shared.js';
import TeamLibs from '../../../Common/Models/team.model.js';
import ProfileLibs from '../../../Common/Models/profile.model.js';

import TwtConnect from '../../../Common/Cluster/twitter.cluster.js';
import LinkedInConnect from '../../../Common/Cluster/linkedin.cluster.js';
import GoogleConnect from '../../../Common/Cluster/google.cluster.js';
import FacebookConnect from '../../../Common/Cluster/facebook.cluster.js';
import InstaConnect from '../../../Common/Cluster/instagram.cluster.js';
import CoreServices from '../../../Common/Services/core.services.js';
import TwitterInsightPostModel from '../../../Common/Mongoose/models/twitter-insights.js';
import logger from '../../resources/Log/logger.log.js';
import schedule from 'node-schedule';
import AuthorizeServices from '../../../Common/Services/authorize.services.js';
import UserTeamAccount from '../../../Common/Shared/user-team-accounts.shared.js';

const teamLibs = new TeamLibs();
const profileLibs = new ProfileLibs();

class SocialAccountService {
  constructor() {
    Object.assign(this, UserTeamAccount);
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
    this.linkedInConnect = new LinkedInConnect(config.get('linkedIn_api'));
    this.googleConnect = new GoogleConnect(config.get('google_api'));
    this.coreServices = new CoreServices(config.get('authorize'));
    this.fbConnect = new FacebookConnect(config.get('facebook_api'));
    this.instagramConnect = new InstaConnect(config.get('instagram_api'));
    this.refreshTokenLinkedIn();
  }

  /**
   * TODO To get the redirect Url and state for specified network
   * Route get the Redirect Url
   * @name post/get-profile-redirect-url
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns redirect Url and state
   */
  async getProfileRedirectUrl(req, res, next) {
    try {
      const {teamId, network} = req.query;
      const {value, error} = Validator.validateNetwork({teamId, network});
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const team = await teamLibs.isValidTeam(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!team) {
        ErrorResponse(
          res,
          "Team not found or You don't have access to add the profile to team"
        );
      }

      let redirectUrl = '';
      const resultJson = '';
      const {userScopeAvailableNetworks} = req.body;
      const state = {
        teamId,
        network,
        accessToken: req.headers['x-access-token'],
      };
      const encryptedState = this.authorizeServices.encrypt(
        JSON.stringify(state)
      );

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
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'FacebookPage':
          if (userScopeAvailableNetworks.includes('1')) {
            redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
              config.get('profile_page_redirect_url')
            )}&client_id=${config.get(
              'facebook_api.app_id'
            )}&scope=${config.get('facebook_api.page_scopes')}`;
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            throw new Error(
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'FacebookGroup':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('1')) {
            redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
              config.get('profile_add_redirect_url')
            )}&client_id=${config.get(
              'facebook_api.app_id'
            )}&scope=${config.get('facebook_api.page_scopes')}`;
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'InstagramBusiness':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('12')) {
            redirectUrl = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
              config.get('instagram_business_api.business_redirect_url')
            )}&client_id=${config.get(
              'instagram_business_api.client_id'
            )}&scope=${config.get(
              'instagram_business_api.business_account_scopes'
            )}`;
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
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
                  accessToken: req.headers['x-access-token'],
                  requestToken: response.requestToken,
                  requestSecret: response.requestSecret,
                };
                const twtencryptedState = this.authorizeServices.encrypt(
                  JSON.stringify(state)
                );

                redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${response.requestToken}`;
                SuccessNavigationResponse(res, redirectUrl, twtencryptedState);
              })
              .catch(error => {
                console.error(`Error ${error}`);
                CatchResponse(res, error.message);
              });
          }
          ErrorResponse(
            res,
            'Sorry, Requested feature not available for your plan.'
          );
          break;
        case 'LinkedIn':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('6')) {
            redirectUrl = this.linkedInConnect.getOAuthUrl(encryptedState);
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }

          break;
        case 'LinkedInCompany':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('6')) {
            redirectUrl = this.linkedInConnect.getV1OAuthUrl(encryptedState);
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }

          break;
        case 'Youtube':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('9')) {
            redirectUrl = this.googleConnect.getGoogleAuthUrl(
              'youtube',
              encryptedState
            );
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'GoogleAnalytics':
          // Validating that the user is having permisiion for this network or not by user plan
          if (userScopeAvailableNetworks.includes('10')) {
            redirectUrl = this.googleConnect.getGoogleAuthUrl(
              'googleAnalytics',
              encryptedState
            );
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'Instagram':
          if (userScopeAvailableNetworks.includes('5')) {
            redirectUrl = `https://api.instagram.com/oauth/authorize?client_id=${config.get(
              'instagram_api.client_id'
            )}&redirect_uri=${encodeURIComponent(
              config.get('instagram_api.redirect_url')
            )}&scope=user_profile,user_media&response_type=code`;
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
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
            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
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
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To add the specified network
   * Route add the specified network
   * @name post/add-social-profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns Added specified network details
   */

  async addSocialProfile(req, res, next) {
    try {
      const {state, code, flag} = req.query;
      const {userScopeAvailableNetworks} = req.body;
      const {value, error} = Validator.validateCode({code});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const networkId = this.coreServices.networks[req.query.network];
      const queryInputs = req.query;
      const userId = req.body.userScopeId;
      const userName = req.body.userScopeName;

      // Adding account and updating Friends stats
      switch (req.query.network) {
        case 'Facebook':
          if (userScopeAvailableNetworks.includes('1')) {
            return this.fbConnect
              .addFacebookProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.code,
                config.get('facebook_api.fbprofile_add_redirect_url')
              )
              .then(profile => teamLibs.addProfiles(userId, userName, profile))
              .then(response => {
                result = response;

                return this.fbConnect.getFbProfileStats(
                  result.profileDetails.access_token
                );
              })
              .then(updateDetails =>
                this.createOrUpdateFriendsList(
                  result.profileDetails.account_id,
                  updateDetails
                )
              )
              .then(response => {
                // result = response;
                AddSocialAccRes(res, result.teamDetails, result.profileDetails);
              })
              .catch(error => {
                console.error(`error outside${error}`);
                CatchResponse(res, error.message);
              });
          }
          ErrorResponse(res, 'Not available.');

          break;
        case 'Twitter':
          if (userScopeAvailableNetworks.includes('4')) {
            var result = {};
            let updatedProfileDetails = {};

            return this.twtConnect
              .addTwitterProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.requestToken,
                queryInputs.requestSecret,
                queryInputs.code
              )
              .then(profile => teamLibs.addProfiles(userId, userName, profile))
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
                const twitterInsightPostModelObject =
                  new TwitterInsightPostModel();

                return twitterInsightPostModelObject.insertInsights(data);
              })
              .then(() =>
                this.createOrUpdateFriendsList(
                  result.profileDetails.account_id,
                  updatedProfileDetails
                )
              )
              .then(() => {
                if (flag == 1) {
                  try {
                    const follres = this.twtConnect.followTwitterId(
                      result.profileDetails.access_token,
                      result.profileDetails.refresh_token,
                      config.get('socioboardTwitterhandler')
                    );
                  } catch (err) {
                    logger.error(`Error while follow : ${err}`);
                  }
                }
              })
              .then(() => {
                AddSocialAccRes(res, result.teamDetails, result.profileDetails);
                // return ({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
              })
              .catch(error => {
                console.error(`error outside${error}`);
                CatchResponse(res, error.message);
              });
          }
          ErrorResponse(res, 'Not available.');

          break;
        case 'LinkedIn':
          if (userScopeAvailableNetworks.includes('6')) {
            return this.linkedInConnect
              .addLinkedInProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.code
              )
              .then(profile => teamLibs.addProfiles(userId, userName, profile))
              .then(response => {
                result = response;

                return this.linkedInConnect.getProfileDetails(
                  result.profileDetails.access_token
                );
              })
              .then(updateDetails =>
                this.createOrUpdateFriendsList(
                  result.profileDetails.account_id,
                  updateDetails
                )
              )
              .then(() => {
                AddSocialAccRes(res, result.teamDetails, result.profileDetails);
              })
              .catch(error => {
                console.error(`error outside${error}`);
                CatchResponse(res, error.message);
              });
          }
          ErrorResponse(res, 'Not available.');
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
                logger.info(`Profile details : ${JSON.stringify(profile)} `);

                return teamLibs.addProfiles(userId, userName, profile);
              })
              .then(response => {
                result = response;
                AddSocialAccRes(res, result.teamDetails, result.profileDetails);
              })
              .catch(error => {
                console.error(`error outside${error}`);
                CatchResponse(res, error.message);
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
              .then(profile => this.addProfiles(userId, userName, profile))
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
                //    reject(error);
              });
          }
          //   reject(new Error("Not available."));
          else break;
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
              .then(profile => this.addProfiles(userId, userName, profile))
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
                console.log(`Error in youtube channel ${error.message}`);
                //    reject(error);
              })
          );

          break;
        case 'GoogleAnalytics':
          // resolve({ code: 200, status: "success", responseCode: queryInputs.code });
          break;
        default:
          //   reject(new Error('Specified network is invalid.'));
          break;
      }
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getYoutubeChannels(req, res, next) {
    try {
      const {code} = req.query;
      const {value, error} = Validator.validateCode({code});
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      return profileLibs
        .getYoutubeChannels(req.query.code)
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            channels: response.channels,
            availableChannels: response.availableChannels,
          });
        })
        .catch(error => {
          res
            .status(200)
            .json({code: 400, status: 'failed', error: error.message});
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getFacebookPages(req, res, next) {
    try {
      return profileLibs
        .getFacebookPages(req.query.code)
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            pages: response.pages,
            availablePages: response.availablePages,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getOwnFacebookGroups(req, res, next) {
    try {
      return profileLibs
        .getOwnFacebookGroups(req.query.code)
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            groups: response.groups,
            availableGroups: response.availableGroups,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getLinkedInCompanyProfileDetails(req, res, next) {
    try {
      return profileLibs
        .getcompanyProfileDetails(req.query.code)
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            company: response.company,
            availablePages: response.availablePages,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To add Intagram Business
   * @name post/get-instagram-business-profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns added Instagram Business Profile details
   */
  async getInstagramBusinessProfile(req, res, next) {
    try {
      return profileLibs
        .getInstaBusinessAccount(req.query.code)
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            pages: response.pages,
            availablePages: response.availablePages,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To add Multi Social Profile
   * @name post/add-bulk-social-profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns bulk Social Profile  details
   */
  async addBulkSocialProfiles(req, res, next) {
    try {
      return teamLibs
        .addBulkSocialProfiles(
          req.body.userScopeId,
          req.query.teamId,
          req.body,
          req.body.userScopeMaxAccountCount,
          req.body.userScopeAvailableNetworks
        )
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            teamDetails: response.teamDetails,
            profileDetails: response.profileDetails,
            errorProfileId: response.errorProfileId,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async deleteSocialProfile(req, res, next) {
    try {
      const {AccId, teamId} = req.query;
      const {value, error} = Validator.validateDeleteAccId({AccId});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await teamLibs.deleteSocialProfile(
        req.body.userScopeId,
        AccId,
        teamId,
        req.body.userScopeName
      );

      SuccessResponse(res, null, 'Account has been deleted.');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /*
   * TODO To update access token from refresh token
   * Function To get access token from refresh token
   */
  refreshTokenLinkedIn() {
    logger.info(`Cron started for updating all linkedIn account access token`);
    schedule.scheduleJob('00 23 * * *', () => {
      teamLibs.refreshTokenLinkedIn();
    });
  }
}
export default new SocialAccountService();
