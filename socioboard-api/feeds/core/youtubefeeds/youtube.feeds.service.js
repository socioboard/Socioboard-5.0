import FeedsLibs from '../../../Common/Models/feeds.model.js'
import validate from './youtube.feeds.validate.js'
import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import userTeamAccounts from '../../../Common/Shared/userTeamAccounts.shared.js'
const feedsLibs = new FeedsLibs()
import YouTubeMongoPostModel from '../../../Common/Mongoose/models/youtubepost.js'

import config from 'config'
class YoutubeFeedsService {
    constructor() {
    }


    async getYoutubeFeeds(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let socialAccountDetails = await userTeamAccounts.getSocialAccount(9, accountId, req.body.userScopeId, teamId)
            let firstName = socialAccountDetails.first_name;
            let profilePicUrl = socialAccountDetails.profile_pic_url;
            var offset = (pageId - 1) * config.get('perPageLimit');
            let youTubeMongoPostModelObject = new YouTubeMongoPostModel();
            let feeds = await youTubeMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
            // resolve({ Fname: fname, Profile: ppic, response });
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async getRecentYoutubeFeeds(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)
            let socialAccountDetails = await userTeamAccounts.getSocialAccount(9, accountId, req.body.userScopeId, teamId)
            let youTubeMongoPostModelObject = new YouTubeMongoPostModel();
            let socialAccount = await userTeamAccounts.getSocialAccount(9, accountId, req.body.userScopeId, teamId)
            let response = await feedsLibs.youtubeRecentFeeds(socialAccount)
            if (!response)
                response = await youTubeMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds: response }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async youtubeLike(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, videoId, rating } = req.query
            const { value, error } = validate.validateLikePost({ teamId, accountId, videoId, rating })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.youtubeLike(req.body.userScopeId, accountId, teamId, videoId, rating)


            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async youtubeComment(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, videoId, comment } = req.query
            const { value, error } = validate.validateComment({ teamId, accountId, videoId, comment })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.youtubeComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.videoId, req.query.comment)


            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async youtubeReplyComment(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, videoId, comment, commentId } = req.query
            const { value, error } = validate.validateReplayComment({ teamId, accountId, videoId, comment, commentId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.youtubeReplyComment(req.body.userScopeId, accountId, teamId, commentId, comment)


            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

}
export default new YoutubeFeedsService()