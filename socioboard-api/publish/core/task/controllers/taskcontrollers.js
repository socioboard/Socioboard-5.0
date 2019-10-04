
const TaskLibs = require('../utils/tasklibs');

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

class TaskController {

    getTasks(req, res) {
        var taskLibs = new TaskLibs();
        return taskLibs.getTaskDetails(req.query.userScopeId, req.query.teamId, req.query.pageId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.get_tasks.replace('{{admin}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.get_tasks_failed.replace('{{admin}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    assignTask(req, res) {
        var taskLibs = new TaskLibs();
        return taskLibs.assignTask(req.query.userScopeId, req.query.taskId, req.query.assigningUserId, req.query.teamId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.assign_task.replace('{{user}}', req.body.userScopeName).replace('{{taskId}}', req.query.taskId).replace('{{member}}', req.query.assigningUserId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.assign_task_failed.replace('{{user}}', req.body.userScopeName).replace('{{taskId}}', req.query.taskId).replace('{{member}}', req.query.assigningUserId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    updateTaskStatus(req, res) {
        var taskLibs = new TaskLibs();
        return taskLibs.updateTaskStatus(req.query.userScopeId, req.query.taskId, req.query.status, req.query.teamId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.update_task_status.replace('{{admin}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{status}}', req.query.status).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Task,
                    label: configruation.publiser_service_events.task_event_module.update_task_status_failed.replace('{{admin}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{status}}', req.query.status).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

}

module.exports = new TaskController();