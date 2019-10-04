const ReportLibs = require('../utils/reportlibs');

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

var reportServices = {};

reportServices.getTodayPostedCount = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getTodayPostedCount(req.body.userScopeId, req.query.teamId, req.query.accountId)
        .then((postCount) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.today_post_count.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: 'success', postCount: postCount });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.today_post_count_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getXDayPublishCount = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getXDayPublishCount(req.body.userScopeId, req.query.dayCount)
        .then((reportDetails) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.xday_post_count.replace('{{user}}', req.body.userScopeName).replace('{{days}}', req.query.dayCount).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", reportDetails: reportDetails });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.xday_post_count_failed.replace('{{user}}', req.body.userScopeName).replace('{{days}}', req.query.dayCount).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getAccountwisePublishCount = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getAccountwisePublishCount(req.body.userScopeId)
        .then((reportDetails) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.account_published_count.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", reportDetails: reportDetails });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.account_published_count_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getSchedulePublishedReport = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getSchedulePublishedReport(req.query.scheduleId, req.body.userScopeId, req.query.pageId)
        .then((publishedDetails) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.schedule_publish_report.replace('{{user}}', req.body.userScopeName).replace('{{mongoId}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", publishedDetails: publishedDetails });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.schedule_publish_report_failed.replace('{{user}}', req.body.userScopeName).replace('{{mongoId}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getAccountPublishedReport = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getAccountPublishedReport(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
        .then((publishedDetails) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.account_published_report.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", publishedDetails: publishedDetails });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.account_published_report_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getTwitterMessage = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getTwitterMessage(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.twitter_message_list.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.twitter_message_list_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getMessageBetweenTwoUsers = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getMessageBetweenTwoUsers(req.query.accountId, req.query.receiverId, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.twitter_messages_between_users.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.twitter_messages_between_users_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

reportServices.getPreviouslyMessagedUsers = function (req, res) {
    var reportlibs = new ReportLibs();
    return reportlibs.getPreviouslyMessagedUsers(req.query.accountId, req.query.pageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.previously_messaged_users.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", count: response.length, posts: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Report,
                label: configruation.publiser_service_events.report_event_label.previously_messaged_users_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: 'failed', error: error.message });
        });
};

module.exports = reportServices;