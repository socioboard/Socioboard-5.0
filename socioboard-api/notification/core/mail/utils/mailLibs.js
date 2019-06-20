const moment = require('moment');
const config = require('config');
const db = require('../../../../library/sequelize-cli/models/index');

const userActivation = db.user_activations;
const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const SendEmailService = require('../../../../library/utility/mailServices');
const MailServiceMongoModel = require('../../../../library/mongoose/models/mailservices');
const logger = require('../../../utils/logger');

class MailLibs {

    sendLoginReminder() {
        return new Promise((resolve, reject) => {
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        [Operator.and]: [{
                            last_login: {
                                [Operator.lte]: moment().subtract(3, 'days').startOf('day'),
                            }
                        }]
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date', 'last_login'],
                }]
            })
                .then(function (users) {


                    logger.info(`Reminding mail for user : ${JSON.stringify(users)} `);

                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 3,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    sendExpiredInitimation() {
        return new Promise((resolve, reject) => {
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        [Operator.and]: [{
                            account_expire_date: {
                                [Operator.lt]: moment().startOf('day'),
                            }
                        }]
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date'],
                }]
            })
                .then(function (users) {
                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 2,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    sendExpireAlert() {
        return new Promise((resolve, reject) => {
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        [Operator.and]: [{
                            account_expire_date: {
                                [Operator.lt]: moment().add(7, 'days').startOf('day'),
                            }
                        }]
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date'],
                }]
            })
                .then(function (users) {
                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 1,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    sendCustomNotifications(notificationDetails) {

        logger.info(notificationDetails);
        
        return new Promise((resolve, reject) => {
            if (!notificationDetails) {
                reject(new Error("Invalid Inputs"));
            } else {
                return userDetails.findAll({
                    attributes: ['user_id', 'first_name', 'email'],
                    include: [{
                        model: userActivation,
                        as: 'Activations',
                        where: {
                            [Operator.and]: [{
                                account_expire_date: {
                                    [Operator.eq]: moment().endOf('day'),
                                }
                            }]
                        },
                        attributes: ['id', 'user_plan', 'account_expire_date'],
                    }]
                })
                    .then(function (users) {
                        var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                        var scheduleObject = {
                            moduleId: 4,
                            batchId: String(moment().unix()),
                            users: users,
                            scheduleId: -1,
                            teamId: -1,
                            newsletterContent: notificationDetails,
                        };
                        return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                    })
                    .then(() => {
                        resolve("Added to mail service queue, It will take few minutes to complete.");
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            }
        });
    }

    getUsersMailedInfo(days, notifyType, userEmail) {
        return new Promise((resolve, reject) => {
            if (days == null || days == undefined || notifyType == null || notifyType == undefined || !userEmail) {
                reject(new Error("Invalid Inputs"));
            } else {
                const mailServiceMongoModelObject = new MailServiceMongoModel();
                if (notifyType == -1 || (notifyType > 0 && notifyType <= 11)) {
                    return mailServiceMongoModelObject.getNotificationMailInfo(userEmail, days, notifyType)
                        .then((report) => {
                            resolve(report);
                        }).catch((error) => {
                            reject(error);
                        });
                }
                else {
                    reject(new Error("please provide valid notifyType either in between 1 to 11 or to fetch all give -1"));
                }
            }
        });
    }
}


module.exports = MailLibs;