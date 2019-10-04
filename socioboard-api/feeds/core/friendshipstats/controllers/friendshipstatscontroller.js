const FeedLibs = require('../utils/friendshipstatslibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

class FrienshipStatController {

    getFbProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getFbProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.fb_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.fb_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getFbPageStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getFbPageStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.fb_page_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.fb_page_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getTwtProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getLookUp(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.twitter_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.twitter_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getInstaProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getInstaProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.instagram_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.instagram_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getLinkedInProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getLinkedInProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.linkedIn_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.linkedIn_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getYoutubeProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getYoutubeProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.youtube_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.youtube_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getPinterestProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getPinterestProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Pinterest,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.pinterest_profile_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Pinterest,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.pinterest_profile_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    getInstaBusinessProfileStats(req, res) {
        var feedLibs = new FeedLibs();
        return feedLibs.getInstaBusinessProfileStats(req.body.userScopeId, req.query.accountId, req.query.teamId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.instagram_business_stats.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", friendShipStats: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.friendship_stats_event_lable.instagram_business_stats_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

}

module.exports = new FrienshipStatController();