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
import BitlyCluster from '../../../Common/Cluster/bitly.cluster.js';
import BITLY_CONSTANTS from '../../../Common/Constants/bitly.constants.js';
import TIK_TOK_CONSTANTS from '../../../Common/Constants/tiktok.constants.js';
import InvitationModel from '../../../Common/Models/invitation.model.js';
import SendEmailServices from '../../../Common/Services/mail-base.services.js';
import TinyLinkCluster from '../../../Common/Cluster/tinylink.cluster.js';
import MediumCluster from '../../../Common/Cluster/medium.cluster.js';
import TumblerCluster from '../../../Common/Cluster/tumblr.cluster.js';
import PinterestCluster from '../../../Common/Cluster/pinterest.newcluster.js';
import TikTokCluster from '../../../Common/Cluster/tiktok.cluster.js';

const teamLibs = new TeamLibs();
const profileLibs = new ProfileLibs();
const invitemodel = new InvitationModel();
const pinConnect = new PinterestCluster();



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
    this.sendEmailServices = new SendEmailServices(config.get('mailService'));
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
      const networkId = this.coreServices.networks[req.query.network];
       const team = await teamLibs.isValidTeam(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!team) {
        ErrorResponse(
          res,
          "You dont have access to add the social profile to this team."
        );
      }

      let redirectUrl = '';
      const resultJson = '';
      const { userScopeAvailableNetworks, userScopeLinkShortening } = req.body;
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
            redirectUrl = this.linkedInConnect.getOAuthUrl(encryptedState,config.get('linkedIn_api.redirect_url'));
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
             redirectUrl = this.linkedInConnect.getOAuthLinkedPageUrl(
              config.get('linkedIn_api.redirect_url_page')
            );
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
            if (userScopeAvailableNetworks.includes('11')) {
              redirectUrl = `https://www.pinterest.com/oauth/?client_id=${config.get('pinterest.client_id')}&redirect_uri=${config.get('pinterest.redirect_uri')}&response_type=code&scope=${config.get('pinterest.scope')}`;
              SuccessNavigationResponse(res, redirectUrl, encryptedState);
            } else {
              ErrorResponse(res,'Sorry, Requested feature not available for your plan.');
            }
            break;
        case 'Bitly':
          if (userScopeLinkShortening) {
            redirectUrl =
              `${BITLY_CONSTANTS.API_URI.AUTHORIZATION}?client_id=${BITLY_CONSTANTS.CLIENT_ID}` +
              `&redirect_uri=${BITLY_CONSTANTS.REDIRECT_URI}`;

            SuccessNavigationResponse(res, redirectUrl, encryptedState);
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.',
            );
          }
          break;
        case 'Tumblr':
          let tokens = await TumblerCluster.getTokens(
            config.get('tumblr_api.OAuth_consumer_Key'),
            config.get('tumblr_api.OAuth_consumer_secret')
          );
          redirectUrl = `https://www.tumblr.com/oauth/authorize?oauth_token=${tokens.auth_token}`;
          const state = {
            teamId,
            network,
            accessToken: req.headers['x-access-token'],
            requestToken: tokens.auth_token,
            requestSecret: tokens.auth_secret,
          };
          const tumblerencryptedState = this.authorizeServices.encrypt(
            JSON.stringify(state)
          );
          SuccessNavigationResponse(res, redirectUrl, tumblerencryptedState);
          break;
        case 'TikTok':
          if (
            userScopeAvailableNetworks.includes(TIK_TOK_CONSTANTS.ACCOUNT_TYPE)
          ) {
            return this.getTikTokRedirectUrl(res, encryptedState);
          }

          ErrorResponse(
            res,
            'Sorry, Requested feature not available for your plan.',
          );
        default:
          throw new Error(
            `${config.get(
              'applicationName',
            )} supports anyone of the following. 1.Facebook, 2.FacebookPage, 3.Twitter, 4.LinkedIn, 5.LinkedInCompany, 6.Youtube, 7.GoogleAnalytics, 8.Instagram 9.Pinterest, 10.Bitly`,
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
      const {state, code, flag,invite} = req.query;
      const { userScopeAvailableNetworks, userScopeLinkShortening } = req.body;
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
            let redirecturl = '';
            if (
                invite == 1
                ? (redirecturl = config.get('facebook_api.invite_redirect_url'))
                : (redirecturl = config.get(
                    'facebook_api.fbprofile_add_redirect_url'
                  ))
            )
            return this.fbConnect
              .addFacebookProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.code,
                redirecturl
              )
              .then(profile => teamLibs.addProfiles(userId, userName, profile,invite))
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
               let redirecturl = '';
            if (
              invite == 1
                ? (redirecturl = config.get('linkedIn_api.invite_redirect_url'))
                : (redirecturl = config.get('linkedIn_api.redirect_url'))
            )
            return this.linkedInConnect
              .addLinkedInProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.code,
                redirecturl
              )
              .then(profile => teamLibs.addProfiles(userId, userName, profile,invite))
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
             let redirecturl = '';
             if (
              invite == 1
                ? (redirecturl = config.get(
                    'instagram_api.invite_redirect_url'
                  ))
                : (redirecturl = config.get('instagram_api.redirect_url'))
            )
            return this.instagramConnect
              .addInstagramProfile(
                networkId,
                queryInputs.teamId,
                queryInputs.code,
                redirecturl
              )
              .then(profile => {
                logger.info(`Profile details : ${JSON.stringify(profile)} `);

                return teamLibs.addProfiles(userId, userName, profile,invite);
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
            const pinterestProfile = await pinConnect.getPinterestdata(networkId,queryInputs.teamId,queryInputs.code);
            const pinProfile = await teamLibs.addProfiles(userId,userName,pinterestProfile);
            AddSocialAccRes(res,pinProfile.teamDetails,pinProfile.profileDetails);
            break;
          }
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
        case 'Bitly':
          if (userScopeLinkShortening) {
            const bitlyProfile = await BitlyCluster.addBitlyProfile(
              networkId,
              queryInputs.teamId,
              code,
            );

            const addedProfile = await teamLibs.addProfiles(
              userId,
              userName,
              bitlyProfile,
            );

            AddSocialAccRes(
              res,
              addedProfile.teamDetails,
              addedProfile.profileDetails,
            );
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.',
            );
          }
          break;
        case 'TikTok':
          if (
            userScopeAvailableNetworks.includes(TIK_TOK_CONSTANTS.ACCOUNT_TYPE)
          ) {
            return this.addSocialProfileTikTok(res, {
              code,
              networkId,
              teamId: queryInputs.teamId,
              userId,
              userName,
            });
          }
          ErrorResponse(
            res,
            'Sorry, Requested feature not available for your plan.'
          );
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
        .getYoutubeChannels(req.query.code,req.query.invite)
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
        .getFacebookPages(req.query.code,req.query.invite)
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
        .getcompanyProfileDetails(req.query.code, req.query.invite)
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
        .getInstaBusinessAccount(req.query.code,req.query.invite)
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
   * TODO Invite social Account Member
   * @name post/invite-social-account-member
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} send Mail to Member
   */
  async inviteSocialAccountMember(req, res, next) {
    const invite = req.body;
    return new Promise((resolve, reject) => {
      Promise.all(invite.map(async ({userName, accName, email, network, teamId}) => {
          const {value, error} = Validator.validateInvitation({userName,accName,email,network,teamId});
          if (error){
             return ValidateErrorResponse(res, error.details[0].message);
           }
          const teamDetails = await teamLibs.isValidTeam(req.body.userScopeId,teamId);
          if (!teamDetails){
             return ErrorResponse(res,"You dont have access to Invite the social profile to this team");
          }
          let profileData = await this.getProfileRedirectUrlForInvite(req,teamId,network);
          if (network == 'Twitter') {
            try {
              let storeprofileData = await invitemodel.addsocialdata(profileData.data,teamId,userName,accName,req.body.userScopeId);
              logger.info(`storeprofileData for network ${network} : ${storeprofileData}`);
            } catch (error) {
              return ErrorResponse(res,`Error while storing the Invitataion data ${error.message}`);
            }
          }
          let invitationLink = `${config.get('invite_redirect_url_web')}userName=${userName}&network=${network}&redirectUrl=${profileData.data.redirectUrl}&state=${profileData.data.state}&teamId=${teamId}`;
          let tinyinvitaionLink = await TinyLinkCluster.getTinyLink(config.get('tiny_link.api_key'),invitationLink);
          let htmlContent = this.sendEmailServices.template.newInvitationLink
            .replace('[userName]', `${userName}`)
            .replace('[invitationLink]', tinyinvitaionLink)
            .replace('[accName]', accName)
            .replace('[network]', network)
            .replace('[sbuser]', req.body.userScopeName)
            .replace('[network]', network)
            .replace('[network]', network);
          const emailDetails = {
            subject: config.get('mailTitles.Invitation_user'),
            toMail: email,
            htmlContent: htmlContent,
          };
          try {
            this.sendEmailServices.sendMails(
                config.get('mailService.defaultMailOption'),
                emailDetails
              )
              .then(result => {
                logger.info(`Invitation  mail status: ${JSON.stringify(result)}`);
              })
              .catch(error => {
                logger.error(`Invitation mail status: ${JSON.stringify(error)}`);
              });
          } catch (error) {
            return ErrorResponse(res, error.message);
          }
        }))
        .then(() => {
          SuccessResponse(res, 'Mail sent successfully');
        })
        .catch(error => {
             logger.error(`Error in sending mail`,error)
         });
    });
  }

  /**
   * TODO get Profile RedirectUrl For Invite
   * @param {Object} Req - Request Object
   * @param {number} teamId - Team Id
   * @param {string} network - Network name
   * @return {object} Returns Network Redirect Url  details
   */
  async getProfileRedirectUrlForInvite(req, teamId, network) {
    return new Promise((resolve, reject) => {
      let redirect_Url = '';
      const {userScopeAvailableNetworks} = req.body;
      const state = {
        teamId,
        network,
        invite: 1,
        accessToken: req.headers['x-access-token'],
      };
      const encryptedStatedata = this.authorizeServices.encrypt(
        JSON.stringify(state)
      );

      switch (network) {
        case 'Twitter':
          return this.twtConnect
            .requestTokenInvite()
            .then(response => {
              let state = {
                teamId: teamId,
                network: network,
                requestToken: response.requestToken,
                requestSecret: response.requestSecret,
              };
              let encryptedState = this.authorizeServices.encrypt(
                JSON.stringify(state)
              );
              resolve({
                data: {
                  message: response,
                  redirectUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${response.requestToken}`,
                  state: encryptedState,
                },
              });
            })
            .catch(error => {
              logger.info('Error:While getting the Invite Twitter member ---', error);
            });
       break;
        case 'Facebook':
          if (userScopeAvailableNetworks.includes('1')) {
            redirect_Url = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('facebook_api.invite_redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get('facebook_api.profile_scopes')}`;
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'FacebookPage':
          if (userScopeAvailableNetworks.includes('1')) {
            redirect_Url = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('profile_page_invite_redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get('facebook_api.page_scopes')}`;
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'Instagram':
          if (userScopeAvailableNetworks.includes('5')) {
            redirect_Url = `https://api.instagram.com/oauth/authorize?client_id=${config.get('instagram_api.client_id')}&redirect_uri=${encodeURIComponent(config.get('instagram_api.invite_redirect_url'))}&scope=user_profile,user_media&response_type=code`;
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'InstagramBusiness':
          if (userScopeAvailableNetworks.includes('12')) {
            redirect_Url = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('instagram_business_api.business_invite_redirect_url'))}&client_id=${config.get('instagram_business_api.client_id')}&scope=${config.get('instagram_business_api.business_account_scopes')}`;
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'LinkedIn':
          if (userScopeAvailableNetworks.includes('6')) {
            redirect_Url = this.linkedInConnect.getOAuthUrl(
              encryptedStatedata,
              config.get('linkedIn_api.invite_redirect_url')
            );
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;
        case 'LinkedInPage':
          if (userScopeAvailableNetworks.includes('6')) {
            redirect_Url = this.linkedInConnect.getOAuthLinkedPageUrl(
              config.get('linkedIn_api.invite_redirect_url_page')
            );
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }

          break;
        case 'Youtube':
          if (userScopeAvailableNetworks.includes('9')) {
            redirect_Url =
              this.googleConnect.getGoogleAuthUrl('youtube-Invite');
            resolve({
              data: {redirectUrl: redirect_Url, state: encryptedStatedata},
            });
          } else {
            ErrorResponse(
              res,
              'Sorry, Requested feature not available for your plan.'
            );
          }
          break;

        default:
          throw new Error(
            `Currently Invitation doesnt support for given ${network} Network`
          );
      }
    });
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

  async addMediumProfile(accessToken, {teamId, userId, userName}) {
    const mediumProfile = await MediumCluster.addMediumProfile(
      accessToken,
      teamId
    );

    return teamLibs.addProfiles(userId, userName, mediumProfile);
  }

  /** TODO Add Tumblr Blogs
 * Route add Tumblr Blogs
 * @name post/get-own-tumbler-blog
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Tumblr account Blogs 
 */
   async getTumblerBlog(req, res, next) {
    try {
      const queryInputs = req.query;
      return TumblerCluster.addTumblrProfile(
        config.get('tumblr_api.OAuth_consumer_Key'),
        config.get('tumblr_api.OAuth_consumer_secret'),
        queryInputs.requestToken,
        queryInputs.requestSecret,
        queryInputs.code
      )
        .then(response => {
          res.status(200).json({
            code: 200,
            status: 'success',
            blogs: response?.blogs,
            availableBlogs: response?.availableBlogs,
          });
        })
        .catch(error => CatchResponse(res, error.message));
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * Return redirect url for TikTok
   * @param {express.Response} res
   * @param {string} state - Generated state
   * @returns {object} Success or Error data
   */
   getTikTokRedirectUrl(res, state) {
    return SuccessNavigationResponse(
      res,
      TikTokCluster.getRedirectUrl(state),
      state
    );
  }

  /**
   * Create a TikTok profile for the db and save it in it
   * @param {express.Response} res
   * @param {object} ctx - The data need to add tik-tok
   * @param {string} ctx.code - Code from authorization callback
   * @param {string} ctx.networkId - Remote service type
   * @param {string} ctx.teamId - Id of the team to which the account will be added
   * @param {string} ctx.userId - User id picked from the access token
   * @param {string} ctx.userName - User name picked from the access token
   * @returns {object} res - Suceess or Error data
   */
   async addSocialProfileTikTok(res, ctx) {
    try {
      const tikTokProfile = await TikTokCluster.addTikTokProfile(ctx);

      const createdProfile = await teamLibs.addProfiles(
        ctx.userId,
        ctx.userName,
        tikTokProfile
      );

      return AddSocialAccRes(
        res,
        createdProfile.teamDetails,
        createdProfile.profileDetails
      );
    } catch (error) {
      logger.info(`Add social profile TikTok error: ${error.message}`);

      return CatchResponse(res, error.message);
    }
  }
}
export default new SocialAccountService();
