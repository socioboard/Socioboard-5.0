import config from 'config';
import Validating from './social-callback.validate.js';
import {
  ValidateErrorResponse,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';
import Facebook from '../../../Common/Cluster/facebook.cluster.js';
import Google from '../../../Common/Cluster/google.cluster.js';
import Github from '../../../Common/Cluster/github.cluster.js';
import TwitterInsightPostModel from '../../../Common/Mongoose/models/twitter-insights.js';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import UserTeamAccount from '../../../Common/Shared/user-team-accounts.shared.js';
import TwtConnect from '../../../Common/Cluster/twitter.cluster.js';
import TeamLibs from '../../../Common/Models/team.model.js';

// aMember service to upload user
import aMember from '../../../Common/Mappings/amember.users.js';

const unauthorizedLibs = new UnauthorizedLibs();
const teamlibs = new TeamLibs();

class SocialCallbackService {
  constructor() {
    Object.assign(this, UserTeamAccount);
    this.fbConnect = new Facebook(config.get('facebook_api'));
    this.googleConnect = new Google(config.get('google_api'));
    this.githubConnect = new Github(config.get('github_api'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
  }

  async facebookCallback(req, res, next) {
    try {
      const {error} = Validating.validateCode(req.query);

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const {code} = req.query;
      const access_token = await this.fbConnect.getProfileAccessToken(
        code,
        config.get('facebook_api.redirect_url')
      );

      if (!access_token) {
      }

      const fbrawuserInfo = await this.fbConnect.userProfileInfo(access_token);

      if (!fbrawuserInfo) {
      }

      const parseData = await unauthorizedLibs.parseDataFacebook(
        fbrawuserInfo,
        access_token
      );
      const is_user_register = await unauthorizedLibs.getSocialAccDetail(
        parseData.user.email,
        parseData.user.username
      );

      if (is_user_register) {
       if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
        // Call aMember to set new details of plan and expiry date
        // userId, userName & password
        await new aMember(config.get('aMember')).getUserPlanDetail(
          is_user_register.user_id,
          is_user_register?.user_name
        );
       }
        const userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );

        if (userInfo) {
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
        }
      }

      const userDetails = await unauthorizedLibs.registerSocialUser(parseData);

      this.updateSocialMediaStats(userDetails.socialNetworkDetails);
      await unauthorizedLibs.checkTeamInvite(
        parseData.user.email,
        userDetails.userInfo.user.user_id
      );

      if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
       //   To Store the user Details in aMember
      await this.registerSocialUserToAmember(userDetails);
      }
      await unauthorizedLibs.checkAppSumoActivation(
        parseData.user.email,
        userDetails.userInfo.user.user_id
      );

      const userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );

      if (userInfo) {
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
      }
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async registerSocialUserToAmember(userDetails = {}) {
    // Set Details in aMember as well
    /**
       * userName
        password
        firstName
        lastName
        email
       */
    const {user: userData} = userDetails?.userInfo;
    const aMemberData = {
      userName: userData?.user_name,
      password: userData?.password,
      firstName: userData?.first_name,
      lastName: userData?.last_name,
      email: userData?.email,
    };

    await new aMember(config.get('aMember')).addUserToAMember(aMemberData);
  }

  async googleCallback(req, res, next) {
    try {
      const {value, error} = Validating.validateCode(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const {code} = req.query;
      const g_token = await this.googleConnect.getGoogleAccessToken(
        code,
        config.get('google_api.redirect_url')
      );
      const googlerawuserInfo =
        await this.googleConnect.getGoogleProfileInformation(g_token);
      const parseData = await unauthorizedLibs.parsedataGoogle(
        googlerawuserInfo,
        g_token
      );
      const is_user_register = await unauthorizedLibs.getSocialAccDetail(
        parseData.user.email,
        parseData.user.username
  );

      if (is_user_register) {
        if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
        // Call aMember to set new details of plan and expiry date
        // userId, userName & password
        await new aMember(config.get('aMember')).getUserPlanDetail(
          is_user_register.user_id,
          is_user_register?.user_name
        );
      }
        const userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );

        if (userInfo) {
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
        }
      }
      const userDetails = await unauthorizedLibs.registerSocialUser(parseData);
      if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
           //   To Store the user Details in aMember
          await this.registerSocialUserToAmember(userDetails);
      }
      await unauthorizedLibs.checkTeamInvite(
        parseData.user.email,
        userDetails.userInfo.user.user_id
      );
      await unauthorizedLibs.checkAppSumoActivation(
        parseData.user.email,
        userDetails.userInfo.user.user_id
      );

      const userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );

      if (userInfo) {
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
      }
    } catch (error) {
      return CatchResponse(res, error,"Invalid Auth code");
    }
  }

  async githubCallback(req, res, next) {
    try {
      const {error} = Validating.validateCode(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const {code} = req.query;
      const GithubrawuserInfo = await this.githubConnect.getGithubuserData(
        code
      );

      const data = await unauthorizedLibs.parsedatagitHub(
        GithubrawuserInfo.data
      );
      const is_user_register = await unauthorizedLibs.getSocialAccDetail(
        data.user.email,
        data.user.username
      );

      if (is_user_register) {
        if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
        // Call aMember to set new details of plan and expiry date
        // userId, userName & password
        await new aMember(config.get('aMember')).getUserPlanDetail(
          is_user_register.user_id,
          is_user_register?.user_name
        );
        }
        const userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );

        if (userInfo) {
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
        }
      }
      const userDetails = await unauthorizedLibs.registerSocialUser(data);
      if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
      //   To Store the user Details in aMember
      await this.registerSocialUserToAmember(userDetails);
      }
      await unauthorizedLibs.checkTeamInvite(
        userDetails.userInfo.user.email,
        userDetails.userInfo.user.user_id
      );
      await unauthorizedLibs.checkAppSumoActivation(
        userDetails.userInfo.user.email,
        userDetails.userInfo.user.user_id
      );
      const userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );

      if (userInfo) {
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
      }
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async twitterCallback(req, res, next) {
    try {
      const {error} = Validating.validateTwitterData(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const {requestToken} = req.query;
      const {requestSecret} = req.query;
      const {verifier} = req.query;

      const twitterdata = await unauthorizedLibs.getTwitterData(
        requestToken,
        requestSecret,
        verifier
      );
      const is_user_register = await unauthorizedLibs.getSocialAccDetail(
        twitterdata.user.email,
        twitterdata.user.username
      );

      if (is_user_register) {
        if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
        // Call aMember to set new details of plan and expiry date
        // userId, userName & password
        await new aMember(config.get('aMember')).getUserPlanDetail(
          is_user_register.user_id,
          is_user_register?.user_name
        );
        }
        const userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );

        if (userInfo) {
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
        }
      }

      const userDetails = await unauthorizedLibs.registerSocialUser(
        twitterdata
      );
      if (process.env.NODE_ENV === 'production'|| process.env.NODE_ENV === 'development' ) {
      //   To Store the user Details in aMember
      this.registerSocialUserToAmember(userDetails);
      }
     this.updateSocialMediaStats(userDetails.socialNetworkDetails);
      await unauthorizedLibs.checkTeamInvite(
        userDetails.userInfo.user.email,
        userDetails.userInfo.user.user_id
      );
      await unauthorizedLibs.checkAppSumoActivation(
        userDetails.userInfo.user.email,
        userDetails.userInfo.user.user_id
      );
      const userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );

      if (userInfo) {
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
      }
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  updateSocialMediaStats(socialAccounts) {
    switch (socialAccounts.dataValues.account_type) {
      case '1':
        this.fbConnect
          .getFbProfileStats(socialAccounts.dataValues.access_token)
          .then(updateDetails =>
            this.createOrUpdateFriendsList(
              socialAccounts.dataValues.account_id,
              updateDetails
            )
          )
          .then(() =>
            teamlibs
              .scheduleNetworkPostFetching(socialAccounts.dataValues.account_id)
              .catch(error => {
                logger.error(error.message);
              })
          )
          .catch(() => {});
        break;

      case '4':
        var result = {};
        var updatedProfileDetails = {};

        result = socialAccounts.dataValues;
        this.twtConnect
          .getLookupList(
            socialAccounts.dataValues.access_token,
            socialAccounts.dataValues.refresh_token,
            socialAccounts.dataValues.user_name
          )
          .then(updateDetails => {
            updatedProfileDetails = updateDetails;
            const data = {
              accountId: socialAccounts.dataValues.account_id,
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

            return twitterInsightPostModelObject.insertInsights(data);
          })
          .then(() =>
            this.createOrUpdateFriendsList(
              socialAccounts.dataValues.account_id,
              updatedProfileDetails
            )
          )
          .then(() =>
            teamlibs
              .scheduleNetworkPostFetching(socialAccounts.dataValues.account_id)
              .catch(error => {
                logger.error(error.message);
              })
          )
          .catch(error => {});
        break;
    }
  }
}
export default new SocialCallbackService();
