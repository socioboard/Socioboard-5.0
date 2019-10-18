const NetworkInsightLibs = require('../utils/networkinsightlibs');

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

class NetworkInsightController {

    facebookPageInsights(req, res) {

        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.facebookPageInsights(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.networkInsights_event_label.fb_page_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Facebook,
                    label: configruation.feeds_service_events.networkInsights_event_label.fb_page_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getYoutubeInsights(req, res) {
        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.getYoutubeInsights(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.networkInsights_event_label.youtube_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Youtube,
                    label: configruation.feeds_service_events.networkInsights_event_label.youtube_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getLinkedInCompanyInsights(req, res) {
        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.getLinkedInCompanyInsights(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.networkInsights_event_label.linkedIn_company_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.LinkedIn,
                    label: configruation.feeds_service_events.networkInsights_event_label.linkedIn_company_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getInstagramBusinessInsights(req, res) {
        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.getInstagramBusinessInsights(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.networkInsights_event_label.instagram_business_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Instagram,
                    label: configruation.feeds_service_events.networkInsights_event_label.instagram_business_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getTwitterInsights(req, res) {
        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.getTwitterInsights(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.networkInsights_event_label.twitter_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Twitter,
                    label: configruation.feeds_service_events.networkInsights_event_label.twitter_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getTeamInsights(req, res) {
        var networkInsightLibs = new NetworkInsightLibs();
        return networkInsightLibs.getTeamInsights(req.body.userScopeId, req.query.teamId, req.query.filterPeriod, req.query.since, req.query.untill)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Team,
                    label: configruation.feeds_service_events.networkInsights_event_label.team_insights.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId).replace('{{teamId}}', req.query.teamId)
                });
                res.status(200).json({ code: 200, status: "success", result: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Team,
                    label: configruation.feeds_service_events.networkInsights_event_label.team_insights_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId).replace('{{teamId}}', req.query.teamId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}
module.exports = new NetworkInsightController();

