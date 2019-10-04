const FeedLibs = require('../utils/feedlibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));


class FeedController {

    getFacebookFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getFacebookFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.feed_event_label.facebook_feed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.feed_event_label.facebook_feed_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getRecentFbFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getRecentFbFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.feed_event_label.facebook_recent_feed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.feed_event_label.facebook_recent_feed_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getTweets(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getTweets(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_tweet_list.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_tweet_list_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });

    }

    getRecentTweets(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getRecentTweets(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_recent_tweet_list.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", data: { count: response.length, posts: response } });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_recent_tweet_list_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });

    }

    getYoutubeFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getYoutubeFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.feed_event_label.youtube_feeds.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.feed_event_label.youtube_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getHomeTimeLineTweets(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getHomeTimeLineTweets(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((tweets) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_timeline_tweets.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", timelineTweets: tweets });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_timeline_tweets_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getTweetsByKeyword(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getTweetsByKeyword(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.keyword)
            .then((tweets) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.keyword_tweets.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{keyword}}', req.query.keyword).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", timelineTweets: tweets });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.keyword_tweets_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{keyword}}', req.query.keyword).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getMentionTimeLineTweets(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getMentionTimeLineTweets(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((tweets) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_mention_tweets.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", timelineTweets: tweets });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.feed_event_label.twitter_mention_tweets_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getCompanyUpdates(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getCompanyUpdates(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((feeds) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.feed_event_label.linkedin_company_pages.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: feeds.length, feeds: feeds });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.feed_event_label.linkedin_company_pages_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getPinterestPins(req, res) {

        var feedLibs = new FeedLibs();
        return feedLibs.getPinterestPins(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.boardId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Pinterest,
                    label: configruation.feeds_service_events.feed_event_label.pinterst_pins.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{board}}', req.query.boardId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", pins: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Pinterest,
                    label: configruation.feeds_service_events.feed_event_label.pinterst_pins_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{board}}', req.query.boardId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });

    }

    getInstagramFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getInstaFeedsFromDB(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_feeds.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, feeds: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getRecentInstagramFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getRecentInstagramFeeds(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_recent_feeds.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, feeds: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_recent_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getInstagramBusinessFeeds(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getInstagramBusinessFeeds(req.query.accountId, req.body.userScopeId, req.query.teamId, req.query.pageId) 
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_business_feeds.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.feed_event_label.instagram_business_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }
}
module.exports = new FeedController();