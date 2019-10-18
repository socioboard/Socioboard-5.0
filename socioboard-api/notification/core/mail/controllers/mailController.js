const moment = require('moment');
const schedule = require('node-schedule');
const logger = require('../../../utils/logger');
const MailLibs = require("../utils/mailLibs");

const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
const mailLibs = new MailLibs();

class MailController {

    constructor() {
        this.setupMailServicesCrons();
    }

    setupMailServicesCrons() {
        logger.info("Cron setup intialized for mail services...");

        schedule.scheduleJob('20 0 * * *', () => {
            logger.info(`Cron started to notify all user's whose plan going to expire within 7 days, started time ${moment()}`);
            return mailLibs.sendExpireAlert()
                .then(() => {
                    logger.info(`Cron process completed for notify all user's whose plan going to expire within 7 days, completed time ${moment()}`);
                })
                .catch((error) => {
                    logger.info(`Cron process errored while notifying user's whose plan going to expire within 7 days, stopped time ${moment()}`);
                });
        });

        schedule.scheduleJob('0 1 * * *', () => {
            logger.info(`Cron started to notify all user's whose plan already expired, started time ${moment()}`);
            return mailLibs.sendExpiredInitimation()
                .then(() => {
                    logger.info(`Cron process completed for notify all user's whose plan already expired, completed time ${moment()}`);
                })
                .catch((error) => {
                    logger.info(`Cron process errored while notifying user's whose plan already expired, stopped time ${moment()}`);
                });
        });

        schedule.scheduleJob('0 2 * * *', () => {
            logger.info(`Cron started to notify all user's who didnt login application in last 3 days, started time ${moment()}`);
            return mailLibs.sendLoginReminder()
                .then(() => {
                    logger.info(`Cron process completed for notify all user's who didnt login application in last 3 days, completed time ${moment()}`);
                })
                .catch((error) => {
                    logger.info(`Cron process errored while notifying user's who didnt login application in last 3 days, stopped time ${moment()}`);
                });
        });

        logger.info("Cron setup completed for mail services...");
    }



    sendExpireAlert(req, res) {
        return mailLibs.sendExpireAlert()
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.email_expire.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: "Added to mail service queue, It will take few minutes to complete." });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.email_expire_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    sendExpiredInitimation(req, res) {
        return mailLibs.sendExpiredInitimation()
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.email_expired.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: "Added to mail service queue, It will take few minutes to complete." });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.email_expired_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    sendLoginReminder(req, res) {
        return mailLibs.sendLoginReminder()
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.recent_login.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: "Added to mail service queue, It will take few minutes to complete." });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.recent_login_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    sendCustomNotifications(req, res) {
        return mailLibs.sendCustomNotifications(req.body.notificationDetails)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.notification_email.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: "Added to mail service queue, It will take few minutes to complete." });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.notification_email_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getUsersMailedInfo(req, res) {
        return mailLibs.getUsersMailedInfo(req.query.days, req.query.notifyType, req.query.email)
            .then((message) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.mails_sent_list.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.email).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", result: message });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Mail,
                    label: configruation.user_service_events.emails_event_lable.mails_sent_list.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.email).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}


module.exports = new MailController();




