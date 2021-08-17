import FeedsLibs from '../../../Common/Models/feeds.model.js'
import validate from './facebook.feeds.validate.js'
import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import userTeamAccounts from '../../../Common/Shared/userTeamAccounts.shared.js'
const feedsLibs = new FeedsLibs()
import FacebookMongoPostModel from '../../../Common/Mongoose/models/facebookposts.js'

import config from 'config'
class FeedsService {
    constructor() {
    }


    async getFacebookFeeds(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let socialAccountDetails = await userTeamAccounts.getSocialAccount([1, 2, 3], accountId, req.body.userScopeId, teamId)
            var offset = (pageId - 1) * config.get('perPageLimit');
            let facebookMongoPostModelObject = new FacebookMongoPostModel();
            let feeds = await facebookMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async facebookLike(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, postId } = req.query
            const { value, error } = validate.validateLikePost({ teamId, accountId, postId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.facebookLike(req.body.userScopeId, accountId, teamId, postId)
            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async facebookComment(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, postId, comment } = req.query
            const { value, error } = validate.validateCommentData({ teamId, accountId, postId, comment })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.facebookComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.postId, req.query.comment)
            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getRecentFbFeeds(req, res, next) {

        //  const { value, error } = validate.validatePassword(req.body)
        // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
        // const { currentPassword, } = req.body
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)
            let socialAccountDetails = await userTeamAccounts.getSocialAccount([1, 2, 3], accountId, req.body.userScopeId, teamId)
            let response = await feedsLibs.getRecentFbFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds: response }
            SuccessResponse(res, data)

        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async getRecentFbPageFeeds(req, res, next) {
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)
            let socialAccountDetails = await userTeamAccounts.getSocialAccount([1, 2, 3], accountId, req.body.userScopeId, teamId)
            let response = await feedsLibs.getRecentFbPageFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds: response }
            SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

}
export default new FeedsService()