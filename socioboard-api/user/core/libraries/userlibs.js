const config = require('config');
const moment = require('moment');
const db = require('../../../library/sequelize-cli/models/index');

const userDetails = db.user_details;
const userActivation = db.user_activations;
const socialAccount = db.social_accounts;
const applicationInfo = db.application_informations;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const AuthorizeServices = require('../../../library/utility/authorizeServices');

const logger = require('../../utils/logger');


class UserLibs {

    constructor() {
        this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    }

    getUserDetails(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject({ error: true, message: "Invalid userId" });
            } else {
                return userDetails.findOne({
                    where: {
                        user_id: Number(userId)
                    },
                    attributes: ['user_id', 'email', 'phone_no', 'first_name', 'last_name', 'date_of_birth', 'phone_code', 'about_me', 'profile_picture', 'is_account_locked', 'is_admin_user'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'activation_status', 'activate_2step_verification', 'shortenStatus', 'email_validate_token', 'forgot_password_validate_token', 'forgot_password_token_expire', 'otp_token', 'otp_token_expire']
                    }]
                })
                    .then((userDetails) => {
                        if (!userDetails)
                            reject({ error: true, message: "User not found!" });
                        else
                            resolve(userDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUserDetailsByEmail(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject({ error: true, message: "Invalid email id." });
            } else {

                return userDetails.findOne({
                    where: {
                        email: email
                    },
                    attributes: ['user_id', 'email', 'phone_no', 'first_name', 'last_name', 'profile_picture', 'is_account_locked', 'is_admin_user', 'user_activation_id'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'activation_status', 'activate_2step_verification', 'email_validate_token', 'otp_token', 'otp_token_expire']
                    }]
                })
                    .then((userDetails) => {
                        if (!userDetails)
                            reject({ error: true, message: "Sorry, No such email found!" });
                        else
                            resolve(userDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getPlanDetails(planId) {
        return new Promise((resolve, reject) => {
            if (planId == null && planId == undefined) {
                reject({ error: true, message: 'Invalid data' });
            } else {
                return applicationInfo.findOne({
                    where: {
                        plan_id: planId
                    }
                })
                    .then((result) => {
                        if (!result)
                            reject({ error: true, message: 'Not found' });
                        else {
                            resolve(result);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getOTPToken(userId) {
        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                var userInfo = {};
                return this.updateUserLoginTime(userId)
                    .then(() => {
                        return this.getUserDetails(userId);
                    })
                    .then((userDetails) => {
                        var userDetails = userDetails.toJSON();
                        userInfo.user_id = userDetails.user_id;
                        userInfo.email = userDetails.email;
                        return this.authorizeServices.createToken(userInfo);
                    })
                    .then((accessToken) => {
                        resolve(accessToken);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUserAccessToken(userId) {
        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                var userInfo = {};
                return this.updateUserLoginTime(userId)
                    .then(() => {
                        return this.getUserDetails(userId);
                    })
                    .then((userDetails) => {
                        userInfo = userDetails.toJSON();
                        return this.getPlanDetails(userInfo.Activations.user_plan);
                    })
                    .then((planDetails) => {
                        userInfo.userPlanDetails = planDetails.toJSON();
                        return this.authorizeServices.createToken(userInfo);
                    })
                    .then((accessToken) => {
                        resolve({ user: userInfo, accessToken: accessToken });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUserSocialAccounts(userId) {
        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                return socialAccount.findAll({
                    where: {
                        account_admin_id: userId
                    },
                    attributes: ['account_id']
                })
                    .then((accounts) => {
                        resolve(accounts);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    lockUserSocialAccounts(userId) {
        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                return this.getUserSocialAccounts(userId)
                    .then((accounts) => {
                        if (accounts.length <= 0)
                            return;
                        return teamSocialAccountJoinTable.update({
                            is_account_locked: 1
                        }, { where: { account_id: accounts.map(t => t.account_id) } });
                    })
                    .then(() => {
                        resolve({ success: true });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });


    }

    updateUserLoginTime(userId) {
        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                return userDetails.findOne({
                    where: {
                        user_id: userId
                    },
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'last_login']
                    }]
                })
                    .then((user) => {
                        if (!user) {
                            reject({ message: 'Not Found', error: true });
                        } else {
                            return user.Activations.update({
                                last_login: moment()
                            });
                        }
                    })
                    .then(() => {
                        resolve({ status: 'success' });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = UserLibs;

