const moment = require('moment');
const config = require('config');

const AuthorizedServices = require('../../../../library/utility/authorizeServices');
const CoreServices = require('../../../../library/utility/coreServices');
const PaymentServices = require('../../../../library/utility/paymentServices');
const UserLibs = require('../../libraries/userlibs');

const db = require('../../../../library/sequelize-cli/models/index');
const userDetails = db.user_details;
const userActivation = db.user_activations;
const Operator = db.Sequelize.Op;

class AuthorizedLibs extends UserLibs {
    constructor() {
        super();
        this.authorizeServices = new AuthorizedServices(config.get('authorize'));
        this.coreServices = new CoreServices(config.get('authorize'));
        this.paymentServices = new PaymentServices(config.get('payment'));
    }

    changePassword(userId, currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!userId || !currentPassword || !newPassword) {
                reject({ error: true, message: "Invalid Inputs" });
            }
            else if (currentPassword == newPassword) {
                reject({ error: true, message: "New password should not match with current password!" });
            }
            else {
                return userDetails.findOne({
                    where: {
                        user_id: userId,
                    },
                    attributes: ['user_id', 'email', 'password']
                })
                    .then(function (user) {
                        if (!user)
                            throw new Error('Sorry! Email not registered.');
                        if (user.password !== currentPassword)
                            throw new Error('Sorry! Wrong Password.');
                        return userDetails.update({ password: newPassword }, { where: { user_id: user.user_id } });
                    })
                    .then(function () {
                        resolve("Success!");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    updateUserProfiles(userId, profileDetails) {

        return new Promise((resolve, reject) => {
            if (!userId || !profileDetails) {
                reject({ error: true, message: "Invalid Inputs" });
            } else {              
                var updatedData = {};
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email', 'first_name', 'last_name', 'date_of_birth', 'profile_picture', 'phone_code', 'phone_no', 'about_me'],
                })
                    .then(function (user) {
                        if (!user)
                            throw new Error('No user found!');
                        else {
                            return user.update({
                                first_name: profileDetails.firstName,
                                last_name: profileDetails.lastName,
                                date_of_birth: profileDetails.DateOfBirth,
                                profile_picture: profileDetails.profilePicture,
                                phone_code: profileDetails.phoneCode,
                                phone_no: profileDetails.phoneNumber,
                                about_me: profileDetails.aboutMe,
                            });
                        }
                    })
                    .then(()=>{
                        return this.getUserAccessToken(userId);                       
                    })
                    .then((response)=>{
                        updatedData.data = response.user;
                        updatedData.accessToken = response.accessToken;
                        resolve(updatedData);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    changePaymentType(userId, currentPaymentType, newPaymentType) {

        return new Promise((resolve, reject) => {
            if (!userId || userId < 0 || newPaymentType == null || newPaymentType == undefined || currentPaymentType == null || currentPaymentType == undefined) {
                reject({ error: true, message: "Invalid Inputs" });
            } else {
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: {
                            [Operator.and]: [{
                                id: db.Sequelize.col('user_activation_id'),
                                payment_type: currentPaymentType
                            }]
                        },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date']
                    }]
                })
                    .then((user) => {
                        if (!user)
                            throw new Error('No user found with current payment type!');
                        else {
                            return user.Activations.update({
                                payment_type: newPaymentType
                            })
                                .then(() => {
                                    return super.getUserAccessToken(user.user_id);
                                }).catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

    }

    change2StepOptions(userId, twoStepActivate) {
        return new Promise((resolve, reject) => {
            if (!userId || (twoStepActivate != 0 && twoStepActivate != 1)) {
                reject({ error: true, message: "Invalid Inputs" });
            } else {
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: {
                            id: db.Sequelize.col('user_activation_id'),
                        },
                        attributes: ['id', 'activate_2step_verification']
                    }]
                })
                    .then(function (user) {
                        if (user === null)
                            throw new Error('No user found!');
                        else {
                            return user.Activations.update({
                                activate_2step_verification: twoStepActivate
                            })
                                .catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                    })
                    .then(() => {
                        resolve('success');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }


        });
    }

    changePlan(userId, currentPlan, newPlan) {
        var fetchedUserInfo = null;
        var userInformation = null;
        return new Promise((resolve, reject) => {
            if (!userId || currentPlan == null || currentPlan == undefined || newPlan == null || newPlan == undefined) {
                reject({ error: true, message: "Invalid Inputs" });
            }
            else if (currentPlan == newPlan) {
                reject(new Error("Current and new plan are same!"));
            }
            else {
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email', 'phone_no', 'first_name', 'last_name', 'profile_picture', 'is_account_locked', 'is_admin_user'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: {
                            [Operator.and]: [{
                                id: db.Sequelize.col('user_activation_id'),
                                user_plan: currentPlan
                            }]
                        },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'activation_status', 'activate_2step_verification']
                    }]
                })
                    .then((user) => {
                        if (user === null)
                            return user;
                        else {
                            fetchedUserInfo = user.toJSON();
                            return this.getPlanDetails(newPlan)
                                .then((planDetails) => {
                                    fetchedUserInfo.userPlanDetails = planDetails.toJSON();
                                    return user;
                                })
                                .catch((error) => {
                                    throw new Error("Cant able to fetch plan.");
                                });
                        }
                    })
                    .then((user) => {
                        if (fetchedUserInfo === null)
                            throw new Error('Not found, Please check current plan or user details!');
                        else {
                            userInformation = user;
                            return this.lockUserSocialAccounts(userId);
                        }
                    })
                    .then(() => {
                        if (newPlan == 0) {
                            return userInformation.Activations.update({
                                last_login: moment(),
                                user_plan: newPlan,
                                account_expire_date: moment.utc().add(1, 'months'),
                            })
                                .then(() => {
                                    return this.getUserAccessToken(userId);
                                }).catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                        else if (newPlan < currentPlan) {
                            return userInformation.Activations.update({
                                last_login: moment(),
                                user_plan: newPlan
                            })
                                .then(() => {
                                    return this.getUserAccessToken(userId);
                                }).catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                        else {
                            throw new Error("Please use proper payment endpoints to upgrade plans.");
                        }
                    })
                    .then((userDetails) => {
                        resolve(userDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = AuthorizedLibs;