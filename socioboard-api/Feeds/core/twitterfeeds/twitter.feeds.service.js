import FeedsLibs from '../../../Common/Models/feeds.model.js'
import validate from './twitter.feeds.validate.js'
import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import userTeamAccounts from '../../../Common/Shared/userTeamAccounts.shared.js'
const feedsLibs = new FeedsLibs()
import TwitterMongoPostModel from '../../../Common/Mongoose/models/twitterposts.js'

import config from 'config'
class TwitterFeedService {
    constructor() {
    }

    async getTweets(req, res, next) {
        try {
            const { teamId, accountId, pageId } = req.query
            const { value, error } = validate.validateAccountIdTeamId({ teamId, accountId, pageId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let socialAccountDetails = await userTeamAccounts.getSocialAccount(4, accountId, req.body.userScopeId, teamId)
            let firstName = socialAccountDetails.first_name;
            let profilePicUrl = socialAccountDetails.profile_pic_url;
            var offset = (pageId - 1) * config.get('perPageLimit');
            var twitterMongoPostModelObject = new TwitterMongoPostModel();
            let feeds = await twitterMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
            let SocialAccountStats = await feedsLibs.socialAccountStats(accountId)
            let data = { socialAccountDetails, SocialAccountStats, feeds }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twitterLike(req, res, next) {
        try {
            const { teamId, accountId, tweetId } = req.query
            const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twitterLike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language)
            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twitterDislike(req, res, next) {
        try {
            const { teamId, accountId, tweetId } = req.query
            const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twitterDislike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twitterComment(req, res, next) {
        try {
            const { teamId, accountId, tweetId, comment, username } = req.query
            const { value, error } = validate.validateCommentData({ teamId, accountId, tweetId, comment, username })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twitterComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.query.comment, req.query.username, req.body.language)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twitterDeleteComment(req, res, next) {
        try {
            const { teamId, accountId, tweetId } = req.query
            const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twitterDeleteComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twtRetweet(req, res, next) {
        try {
            const { teamId, accountId, tweetId } = req.query
            const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twtRetweet(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twtUnretweet(req, res, next) {
        try {
            const { teamId, accountId, tweetId } = req.query
            const { value, error } = validate.validateAccountIdTweetId({ teamId, accountId, tweetId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twtUnretweet(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.body.language)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async twtRetweetWithComment(req, res, next) {
        try {
            const { teamId, accountId, tweetId, comment, username } = req.query
            const { value, error } = validate.validateCommentData({ teamId, accountId, tweetId, comment, username })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.twtRetweetWithComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.query.comment, req.query.username, req.body.language)
            return SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async fetchAllTweets(req, res, next) {
        try {
            const { teamId, accountId } = req.query
            const { value, error } = validate.validateFetchTweet({ teamId, accountId })
            if (error) return ValidateErrorResponse(res, error.details[0].message)

            let response = await feedsLibs.fetchAllTweets(req.body.userScopeId, req.query.accountId, req.query.teamId, req.body.language)
            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }


}
export default new TwitterFeedService()