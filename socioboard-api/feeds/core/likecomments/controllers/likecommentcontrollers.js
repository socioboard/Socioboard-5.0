const LikeCommentLibs = require('../utils/likecommentlibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));


class LikeCommentController {

    facebookLike(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.facebookLike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.postId)
            .then((response) => {
                if (response.success) {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.feeds_service_events.event_action.Facebook,
                        label: configruation.feeds_service_events.like_comment_event_label.facebook_like.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.postId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                    });
                    res.status(200).json({ code: 200, status: "success", message: "Successfully liked." });
                }
                else
                    throw new Error("Sorry! Something went wrong with fb api.");
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.like_comment_event_label.facebook_like_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.postId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    facebookComment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.facebookComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.postId, req.query.comment)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.like_comment_event_label.facebook_comment.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.postId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: "Successfully commented.", commentedId: response.id });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.like_comment_event_label.facebook_comment_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.postId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    twitterLike(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.twitterLike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_like.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_like_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    twitterDislike(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.twitterDislike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_dislike.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_dislike_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    twitterComment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.twitterComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId, req.query.comment)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_comment.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: `Successfully commented and commented id is ${response.commentId}.` });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_comment_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    twitterDeleteComment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.twitterDeleteComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.tweetId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_comment_delete.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.like_comment_event_label.twitter_comment_delete_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.tweetId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    youtubeLike(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.youtubeLike(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.videoId, req.query.rating)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_like.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_like_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    youtubeComment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.youtubeComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.videoId, req.query.comment)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_comment.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_comment_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    youtubeReplyComment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.youtubeReplyComment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.commentId, req.query.comment)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_comment_reply.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.like_comment_event_label.youtube_comment_reply_failed.replace('{{user}}', req.body.userScopeName).replace('{{post}}', req.query.videoId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    instabusinesscomment(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.instabusinesscomment(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.mediaId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.like_comment_event_label.insta_business_comment.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.like_comment_event_label.insta_business_comment_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    instabusinesscommentreply(req, res) {
        var likeCommentLibs = new LikeCommentLibs();
        return likeCommentLibs.instabusinesscommentreply(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.commentId, req.query.comment)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.like_comment_event_label.insta_business_reply_comment.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{commentId}}', req.query.commentId).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.like_comment_event_label.insta_business_reply_comment_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{commentId}}', req.query.commentId).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

}
module.exports = new LikeCommentController();