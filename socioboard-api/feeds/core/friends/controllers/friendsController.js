const FriendLibs = require('../utils/friendlibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
var helper = {};

helper.getTwitterFollowers = function (req, res) {
    var friendlibs = new FriendLibs();
    return friendlibs.getTwitterFollowers(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.cursorValue)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_followers.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", response: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_followers_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

helper.getTwitterFollowing = function (req, res) {
    var friendlibs = new FriendLibs();
    return friendlibs.getTwitterFollowing(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.cursorValue)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_following.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", response: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_following_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

helper.getTwitterSearchUser = function (req, res) {
    var friendlibs = new FriendLibs();
    return friendlibs.getTwitterSearchUser(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.keyword, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_user_search.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", response: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.Twitter,
                label: configruation.feeds_service_events.friends_event_label.twitter_user_search_failed.replace('{{user}}', req.body.userScopeName).replace('{{keyword}}', req.query.keyword).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};


module.exports = helper;