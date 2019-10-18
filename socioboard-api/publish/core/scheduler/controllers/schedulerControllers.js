const ScheduleLib = require('../utils/schedulerlibs');

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

var scheduleServices = {};

scheduleServices.create = function (req, res) {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.create(req.body.userScopeId, req.body.userScopeName, req.body.postInfo, req.body.userScopeMaxScheduleCount)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.create_schedule.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.body.postInfo.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.create_schedule_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.body.postInfo.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.getScheduleDetails = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.getScheduleDetails(req.body.userScopeId, req.query.fetchPageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_details.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_details_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.getParticularScheduleDetails = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.getParticularScheduleDetails(req.body.userScopeId, req.query.scId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.getParticularSchedule_details.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId).replace('{{scId}}', req.query.scId)
            });
            res.status(200).json({ code: 200, status: "success", data: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.getParticularSchedule_details_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId).replace('{{scId}}', req.query.scId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};


scheduleServices.getFilteredScheduleDetails = (req, res) => {

    var scheduleLib = new ScheduleLib();
    return scheduleLib.getFilteredScheduleDetails(req.body.userScopeId, req.query.scheduleStatus, req.query.fetchPageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.filtered_schedule_details.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.filtered_schedule_details_failed.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.getScheduleDetailsByCategories = (req, res) => {

    var scheduleLib = new ScheduleLib();
    return scheduleLib.getScheduleDetailsByCategories(req.body.userScopeId, req.query.scheduleStatus, req.query.scheduleCategory, req.query.fetchPageId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.filtered_schedule_details_with_category.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{category}}', req.query.scheduleCategory == 1 ? "daywise" : "normal").replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.filtered_schedule_details_with_category_failed.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{category}}', req.query.scheduleCategory == 1 ? "daywise" : "normal").replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.edit = function (req, res) {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.edit(req.body.userScopeId, req.body.userScopeName, req.query.teamId, req.query.scheduleId, req.body.postInfo)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_edit.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_edit_failed.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.changeScheduleStatus = function (req, res) {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.changeScheduleStatus(req.body.userScopeId, req.body.userScopeName, req.query.scheduleId, req.query.scheduleStatus, req.query.userScopeMaxScheduleCount)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_change.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_change_failed.replace('{{user}}', req.body.userScopeName).replace('{{status}}', req.query.scheduleStatus).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.delete = function (req, res) {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.delete(req.body.userScopeId, req.query.scheduleId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_delete.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_delete.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.cancel = function (req, res) {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.cancelScheduleDetails(req.body.userScopeId, req.query.scheduleId)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_cancel.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Scheduler,
                label: configruation.publiser_service_events.schedule_event_label.schedule_cancel_failed.replace('{{user}}', req.body.userScopeName).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

// Admin routes
scheduleServices.startDaywiseSchedule = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.startDaywiseSchedule()
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.daywise_schedule.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.daywise_schedule_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.startTodaySchedule = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.runTodaySchedule()
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.onetime_schedule.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.onetime_schedule_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.startSchedulerCron = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.startSchedulerCron()
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.start_cron.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.start_cron_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.deleteAllSchedules = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.removeAllScheduleInfo()
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.delete_all_schedules.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", data: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Admin,
                label: configruation.publiser_service_events.admin_event_label.delete_all_schedules_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.createAutomatedRss = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.createAutomatedRssSchedule(req.body.userScopeId, req.query.teamId, req.body.postInfo)
        .then((result) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.create_rss_schedule.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.create_rss_schedule_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.getAutomatedRss = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.getScheduleDetails(req.body.userScopeId, req.query.pageId)
        .then((result) => {
            res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.updateAutomatedRss = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.updateAutomatedRss(req.body.userScopeId, req.query.teamId, req.query.scheduleId, req.body.postInfo)
        .then((result) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.edit_rss_schedule.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.edit_rss_schedule_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{scid}}', req.query.scheduleId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.deleteAutomatedRss = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.deleteAutomatedRss(req.body.userScopeId, req.query.teamId, req.query.rssId)
        .then((result) => {
            res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

scheduleServices.createRssSchedule = (req, res) => {
    var scheduleLib = new ScheduleLib();
    return scheduleLib.createRss(req.query.userScopeId, req.query.teamId, req.body.postInfo, req.body.userScopeMaxScheduleCount)
        .then((result) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.create_rss_schedule.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Rss,
                label: configruation.publiser_service_events.rss_event_label.create_rss_schedule_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

module.exports = scheduleServices;