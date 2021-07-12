import Validating from './socialCallback.validate.js'
import { ValidateErrorResponse, CatchResponse } from '../../../Common/Shared/response.shared.js'
import Facebook from '../../../Common/Cluster/facebook.cluster.js'
import Google from '../../../Common/Cluster/google.cluster.js'
import Github from '../../../Common/Cluster/github.cluster.js'
import TwitterInsightPostModel from '../../../Common/Mongoose/models/twitterInsights.js'
import UnauthorizedLibs from '../../../Common/Models/unAuthorized.model.js';
import config from 'config';
import UserTeamAccount from '../../../Common/Shared/userTeamAccounts.shared.js'
import TwtConnect from '../../../Common/Cluster/twitter.cluster.js'
import TeamLibs from '../../../Common/Models/team.model.js'
const unauthorizedLibs = new UnauthorizedLibs()
const teamlibs = new TeamLibs()


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
            const { value, error } = Validating.validateCode(req.query);
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let code = req.query.code
            let access_token = await this.fbConnect.getProfileAccessToken(code, config.get('facebook_api.redirect_url'))
            if (!access_token) { }

            let fbrawuserInfo = await this.fbConnect.userProfileInfo(access_token)
            if (!fbrawuserInfo) { }

            let parseData = await unauthorizedLibs.parseDataFacebook(fbrawuserInfo, access_token)
            let is_user_register = await unauthorizedLibs.getSocialAccDetail(parseData.user.email)
            if (is_user_register) {
                let userInfo = await unauthorizedLibs.getUserAccessToken(is_user_register.user_id, is_user_register.Activations.id)
                if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });
            }

            let userDetails = await unauthorizedLibs.registerSocialUser(parseData)
            this.updateSocialMediaStats(userDetails.socialNetworkDetails)

            let userInfo = await unauthorizedLibs.getUserAccessToken(userDetails.userInfo.user.user_id, userDetails.userInfo.activations.id)
            if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });


        } catch (error) {
            return CatchResponse(res, error.message);
        }
    }

    async googleCallback(req, res, next) {
        try {
            const { value, error } = Validating.validateCode(req.query);
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let code = req.query.code
            let g_token = await this.googleConnect.getGoogleAccessToken(code, config.get('google_api.redirect_url'))
            if (!g_token) { }

            let googlerawuserInfo = await this.googleConnect.getGoogleProfileInformation(g_token)
            if (!googlerawuserInfo) { }
            let parseData = await unauthorizedLibs.parsedataGoogle(googlerawuserInfo, g_token)
            let is_user_register = await unauthorizedLibs.getSocialAccDetail(parseData.user.email)
            if (is_user_register) {
                let userInfo = await unauthorizedLibs.getUserAccessToken(is_user_register.user_id, is_user_register.Activations.id)
                if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });
            }
            let userDetails = await unauthorizedLibs.registerSocialUser(parseData)
            let userInfo = await unauthorizedLibs.getUserAccessToken(userDetails.userInfo.user.user_id, userDetails.userInfo.activations.id)
            if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });
        } catch (error) {
            return CatchResponse(res, error.message);
        }

    }

    async githubCallback(req, res, next) {
        try {
            const { value, error } = Validating.validateCode(req.query);
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let code = req.query.code
            let GithubrawuserInfo = await this.githubConnect.getGithubuserData(code)
            if (!GithubrawuserInfo) { }
            let data = await unauthorizedLibs.parsedatagitHub(GithubrawuserInfo.data);
            let is_user_register = await unauthorizedLibs.getSocialAccDetail(data.user.email, data.user.username)

            if (is_user_register) {
                let userInfo = await unauthorizedLibs.getUserAccessToken(is_user_register.user_id, is_user_register.Activations.id)
                if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });
            }
            let userDetails = await unauthorizedLibs.registerSocialUser(data)
            let userInfo = await unauthorizedLibs.getUserAccessToken(userDetails.userInfo.user.user_id, userDetails.userInfo.activations.id)
            if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });

        } catch (error) {
            return CatchResponse(res, error.message);
        }


    }

    async twitterCallback(req, res, next) {
        try {
            const { value, error } = Validating.validateTwitterData(req.query);
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let requestToken = req.query.requestToken
            let requestSecret = req.query.requestSecret
            let verifier = req.query.verifier

            let twitterdata = await unauthorizedLibs.getTwitterData(requestToken, requestSecret, verifier)
            let is_user_register = await unauthorizedLibs.getSocialAccDetail(twitterdata.user.email, twitterdata.user.username)

            if (is_user_register) {
                let userInfo = await unauthorizedLibs.getUserAccessToken(is_user_register.user_id, is_user_register.Activations.id)
                if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });
            }

            let userDetails = await unauthorizedLibs.registerSocialUser(twitterdata)
            this.updateSocialMediaStats(userDetails.socialNetworkDetails)
            let userInfo = await unauthorizedLibs.getUserAccessToken(userDetails.userInfo.user.user_id, userDetails.userInfo.activations.id)
            if (userInfo) return res.status(200).json({ code: 200, message: "success", data: userInfo });


        } catch (error) {
            return CatchResponse(res, error.message);
        }

    }

    updateSocialMediaStats(socialAccounts) {
        switch (socialAccounts.dataValues.account_type) {
            case "1":
                this.fbConnect.getFbProfileStats(socialAccounts.dataValues.access_token)
                    .then((updateDetails) => {
                        return this.createOrUpdateFriendsList(socialAccounts.dataValues.account_id, updateDetails);
                    })
                    .then(() => {
                        return teamlibs.scheduleNetworkPostFetching(socialAccounts.dataValues.account_id)
                            .catch((error) => {
                                logger.error(error.message);
                            });
                    })
                    .catch(() => {
                    });
                break;

            case "4":
                var result = {};
                var updatedProfileDetails = {};
                result = socialAccounts.dataValues;
                this.twtConnect.getLookupList(socialAccounts.dataValues.access_token, socialAccounts.dataValues.refresh_token, socialAccounts.dataValues.user_name)
                    .then((updateDetails) => {
                        updatedProfileDetails = updateDetails;
                        var data = {
                            accountId: socialAccounts.dataValues.account_id,
                            insights: {
                                followerCount: updateDetails.follower_count,
                                followingCount: updateDetails.following_count,
                                favouritesCount: updateDetails.favorite_count,
                                postsCount: updateDetails.total_post_count,
                                userMentions: updateDetails.user_mentions,
                                retweetCount: updateDetails.retweet_count
                            }
                        };
                        var twitterInsightPostModelObject = new TwitterInsightPostModel();
                        return twitterInsightPostModelObject.insertInsights(data);
                    })
                    .then(() => {
                        return this.createOrUpdateFriendsList(socialAccounts.dataValues.account_id, updatedProfileDetails);
                    })
                    .then(() => {
                        return teamlibs.scheduleNetworkPostFetching(socialAccounts.dataValues.account_id)
                            .catch((error) => {
                                logger.error(error.message);
                            });
                    })
                    .catch((error) => {
                        //  console.log(JSON.stringify(error, null, 4))
                    });
                break;
        }
    }

}
export default new SocialCallbackService()