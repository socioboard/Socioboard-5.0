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
                // Finding user
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
                        // Updating user with new password
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
                            // Updating user with new details
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
                    .then(() => {
                        // Creating new access Token with updated details
                        return this.getUserAccessToken(userId);
                    })
                    .then((response) => {
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
                // Fetching user and Payment details of specified payment type
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
                            // Updating user with new payment type
                            return user.Activations.update({
                                payment_type: newPaymentType
                            })
                                .then(() => {
                                    // Generating new access token with updated details
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
            if (!userId || (twoStepActivate != 0 && twoStepActivate != 1 && twoStepActivate != 2)) {
                reject({ error: true, message: "Invalid Inputs" });
            } else {
                // Fetching user activation details 
                return this.getUserActivationDetails(userId)
                    .then(function (user) {
                        if (user === null)
                            throw new Error('No user found!');
                        else {
                            if (twoStepActivate == 2) {
                                if (!user.phone_no || user.phone_no == 0 || user.phone_no == null) {
                                    throw new Error('Sorry, You need to have proper phone number to make 2 way authentication with phonenumber.');
                                }
                                else {
                                    return user.Activations.update({
                                        activate_2step_verification: twoStepActivate
                                    })
                                        .catch(function (error) {
                                            throw new Error(error.message);
                                        });
                                }
                            }
                            // Updating user with Changes in 2step authentication
                            return user.Activations.update({
                                activate_2step_verification: twoStepActivate
                            })
                                .catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                    })
                    .then(() => {
                        resolve(twoStepActivate == 1 ? "Please keep your mobile available while log-in to Socioboard." : twoStepActivate == 2 ? 'Please keep open of email and mobile while sign-in to Socioboard' : "Your sign-in is not secure.");
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
            // Validating the user that, new plan and old plan are same or not
            else if (currentPlan == newPlan) {
                reject(new Error("Current and new plan are same!"));
            }
            else {
                // Fetching the user details and current plan details
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
                            // Fetching new plan details
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
                            // Locking all social accounts
                            return this.lockUserSocialAccounts(userId);
                        }
                    })
                    .then(() => {
                        if (newPlan == 0) {
                            // Updating user with new plan
                            return userInformation.Activations.update({
                                last_login: moment(),
                                user_plan: newPlan,
                                account_expire_date: moment.utc().add(1, 'months'),
                            })
                                .then(() => {
                                    // Generating access Token with updated plan details
                                    return this.getUserAccessToken(userId);
                                }).catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                        else if (newPlan < currentPlan) {
                            // Updating user with new plan
                            return userInformation.Activations.update({
                                last_login: moment(),
                                user_plan: newPlan
                            })
                                .then(() => {
                                    // Generating access Token with updated plan details
                                    return this.getUserAccessToken(userId);
                                }).catch(function (error) {
                                    throw new Error(error.message);
                                });
                        }
                        else {
                            // If requested plan is higher than current plan we are throwing an error message
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

    changeShortenStatus(userId, status) {
        return new Promise((resolve, reject) => {
            if (!userId || (status != 0 && status != 1)) {
                reject({ error: true, message: "Invalid Inputs" });
            } else {
                // Checking that the status of update are same or not
                return this.getUserActivationDetails(userId)
                    .then((user) => {
                        if (user === null)
                            throw new Error('No user found!');
                        else {
                            if (user.Activations.shortenStatus == status) {
                                throw new Error('Current Status and updated status are same.');
                            }
                            else {
                                // If not, we are updating with requested status
                                return user.Activations.update({
                                    shortenStatus: status
                                })
                                    .catch(function (error) {
                                        throw new Error(error.message);
                                    });
                            }
                        }
                    })
                    .then(() => {
                        resolve('successfully updated');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }


    getUserActivationDetails(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Fetching the user activation details like 2 step, shortenUrl
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email', 'phone_no', 'phone_code'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: {
                            id: db.Sequelize.col('user_activation_id'),
                        },
                        attributes: ['id', 'activate_2step_verification', 'shortenStatus']
                    }]
                })
                    .then((user) => {
                        resolve(user);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = AuthorizedLibs;