var trendServices = {};
const TrendsLib = require('../utils/trendslibs');
const { validationResult } = require('express-validator/check');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

trendServices.getGiphy = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        return trendsLib.getGiphy(req.query.keyword, req.query.pageId, req.query.filter)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Giphy,
                    label: configruation.feeds_service_events.trend_event_label.giphy_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Giphy,
                    label: configruation.feeds_service_events.trend_event_label.giphy_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getNewsApi = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getNewsApi(req.query.keyword, req.query.pageId, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.NewsApi,
                    label: configruation.feeds_service_events.trend_event_label.newsapi_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.NewsApi,
                    label: configruation.feeds_service_events.trend_event_label.newsapi_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getPixabay = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getPixabay(req.query.keyword, req.query.pageId, req.query.filter, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.PixaBay,
                    label: configruation.feeds_service_events.trend_event_label.pixabay_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.PixaBay,
                    label: configruation.feeds_service_events.trend_event_label.pixabay_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getFlickr = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getFlickr(req.query.keyword, req.query.pageId, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Flickr,
                    label: configruation.feeds_service_events.trend_event_label.flickr_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Flickr,
                    label: configruation.feeds_service_events.trend_event_label.flickr_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getDailyMotion = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getDailyMotion(req.query.pageId, req.query.filter, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.DailyMotion,
                    label: configruation.feeds_service_events.trend_event_label.daily_motion_feeds.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.DailyMotion,
                    label: configruation.feeds_service_events.trend_event_label.daily_motion_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getImgur = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getImgur(req.query.keyword, req.query.pageId, req.query.filter, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Imgur,
                    label: configruation.feeds_service_events.trend_event_label.imgur_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Imgur,
                    label: configruation.feeds_service_events.trend_event_label.imgur_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{filter}}', req.query.filter).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getRssFeeds = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getRssFeeds(req.query.rssUrl)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.RssFeeds,
                    label: configruation.feeds_service_events.trend_event_label.rss_feeds.replace('{{user}}', req.body.userScopeName).replace('{{url}}', req.query.rssUrl).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.RssFeeds,
                    label: configruation.feeds_service_events.trend_event_label.rss_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{url}}', req.query.rssUrl).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getYoutube = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getYoutube(req.query.pageId, req.query.keyword, req.query.sort)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.trend_event_label.youtube_feeds.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.trend_event_label.youtube_feeds_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId).replace('{{sort}}', req.query.sort)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getTwitter = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorElement = errors.array().shift();
        return res.status(200).json({ code: 400, status: "failed", error: errorElement.msg });
    } else {
        var trendsLib = new TrendsLib();
        trendsLib.getTwitter(req.query.keyword)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.trend_event_label.twitter_keyword_trends.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.trend_event_label.twitter_keyword_trends_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
};

trendServices.getCurrentTrends = (req, res) => {
    var trendsLib = new TrendsLib();
    trendsLib.getCurrentTrends(req.query.countryCode)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.trend_event_label.twitter_current_trends.replace('{{user}}', req.body.userScopeName).replace('{{country}}', req.query.countryCode).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", response: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.trend_event_label.twitter_current_trends_failed.replace('{{user}}', req.body.userScopeName).replace('{{country}}', req.query.countryCode).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

module.exports = trendServices;