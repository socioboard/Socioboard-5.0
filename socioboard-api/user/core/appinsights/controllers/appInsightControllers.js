const AppInsightLibs = require('../utils/appinsightlibs');
const config = require('config');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
const configruation = require('../../../config/configuration');
const appinsightlibs = new AppInsightLibs();

class AppInsightController {
    getAllRealtimeUsers(req, res) {
        return appinsightlibs.getAllRealtimeUsers()
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_all_realTime_users.replace('{{admin}}', req.body.userScopeName)
                });
                res.status(200).json({ code: 200, status: 'success', data: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_all_realTime_users_failed.replace('{{admin}}', req.body.userScopeName)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }


    getRealtimeUsersActivities(req, res) {
        return appinsightlibs.getRealtimeUsersActivities(req.query.userEmail)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_realTime_activities.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 200, status: 'success', data: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_realTime_activities_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }


    getAllUser(req, res) {
        return appinsightlibs.getAllUser(req.query.startDate, req.query.endDate)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_all_users.replace('{{admin}}', req.body.userScopeName).replace('{{startdate}}', req.query.startDate).replace('{{enddate}}', req.query.endDate)
                });
                res.status(200).json({ code: 200, status: 'success', data: response.result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_all_users_failed.replace('{{admin}}', req.body.userScopeName).replace('{{startdate}}', req.query.startDate).replace('{{enddate}}', req.query.endDate)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }


    getUsersActivities(req, res) {
        return appinsightlibs.getUsersActivities(req.query.userEmail, req.query.pageId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_activities.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 200, status: 'success', data: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_activities_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    getUserActionCount(req, res) {
        return appinsightlibs.getUserActionCount(req.query.userEmail, req.query.startDate, req.query.endDate)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_action_count.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 200, status: 'success', data: response.result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.AppInsights,
                    label: configruation.user_service_events.app_insights_event_lable.get_user_action_count_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userEmail)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }
}


module.exports = new AppInsightController();