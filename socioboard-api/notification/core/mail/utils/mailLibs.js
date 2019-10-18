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
            // Fetching user details who's last login is more than 3 days
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        last_login: {
                            [Operator.lte]: moment().subtract(3, 'days').startOf('day'),
                        }
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date', 'last_login'],
                }]
            })
                .then(function (users) {


                    logger.info(`Reminding mail for non-active user : ${JSON.stringify(users)} `);
                    // Creating object for sending emails
                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 3,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    // Sending in-active email
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve(true);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    sendExpiredInitimation() {
        return new Promise((resolve, reject) => {
            // Fetching all user who's account got expired
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        account_expire_date: {
                            [Operator.lt]: moment().startOf('day'),
                            [Operator.gt]: moment().subtract(1, 'day').startOf('day')
                        }
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date'],
                }]
            })
                .then(function (users) {
                    logger.info(`Expired users are : ${JSON.stringify(users)}`);
                    logger.info(JSON.stringify(users));
                    // Creating object for sending emails
                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 2,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    // Sending account expired mail
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve(true);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    sendExpireAlert() {
        return new Promise((resolve, reject) => {
            // Fetching all user's whos's account is going to expire in a Week
            return userDetails.findAll({
                attributes: ['user_id', 'first_name', 'email'],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    where: {
                        account_expire_date: {
                            [Operator.lt]: moment().add(7, 'days').startOf('day'),
                            [Operator.gt]: moment().startOf('day'),
                        }
                    },
                    attributes: ['id', 'user_plan', 'account_expire_date'],
                }]
            })
                .then(function (users) {
                    logger.info(`Expire users are : ${JSON.stringify(users)}`);
                    // Creating object for sending emails
                    var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                    var scheduleObject = {
                        moduleId: 1,
                        batchId: String(moment().unix()),
                        users: users,
                        scheduleId: -1,
                        teamId: -1,
                        newsletterContent: '',
                    };
                    // Sending expiry notification mail
                    return sendEmailServiceObject.mailServiceSchedule(scheduleObject);
                })
                .then(() => {
                    resolve(true);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    sendCustomNotifications(notificationDetails) {

        logger.info(notificationDetails);
        // Fetching all users who's account is going to expire at end of the day
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
                            account_expire_date: {
                                [Operator.gt]: moment().startOf('day'),
                                [Operator.lt]: moment().endOf('day'),
                            }
                        },
                        attributes: ['id', 'user_plan', 'account_expire_date'],
                    }]
                })
                    .then(function (users) {
                        // Creating object for sending emails
                        var sendEmailServiceObject = new SendEmailService(config.get('mailService'));
                        var scheduleObject = {
                            moduleId: 4,
                            batchId: String(moment().unix()),
                            users: users,
                            scheduleId: -1,
                            teamId: -1,
                            newsletterContent: notificationDetails,
                        };
                        // sending a custom notification mail
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
                    // Fetching all notification mails sent to an user with filters
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