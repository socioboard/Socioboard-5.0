const config = require('config');
const moment = require('moment');

const PaymentServices = require('../../../../library/utility/paymentServices');
const AuthorizeServices = require('../../../../library/utility/authorizeServices');
const MailServices = require('../../../../library/utility/mailServices');

const logger = require('../../../utils/logger');

const db = require('../../../../library/sequelize-cli/models/index');
const userDetails = db.user_details;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const userPayment = db.user_payments;
const coupons = db.coupons;
const Operator = db.Sequelize.Op;

class PaymentLibs {

    constructor() {
        this.paymentServices = new PaymentServices(config.get('payment'));
        this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    }

    fetchPlanDetails(planId) {
        return new Promise((resolve, reject) => {
            if (planId == null || planId == undefined) {
                reject(new Error("Invalid plan Id"));
            } else {
                return applicationInfo.findOne({
                    where: { plan_id: planId, is_plan_active: true },
                })
                    .then((result) => {
                        if (!result)
                            throw new Error("Requested plan currently unavailable!");
                        else
                            resolve(result);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    applyCouponCode(couponCode, planId, userId) {
        return new Promise((resolve, reject) => {
            if (!userId || planId == null || planId == undefined) {
                reject(new Error("Invalid Inputs"));
            }
            else if (!couponCode) {
                return this.fetchPlanDetails(planId)
                    .then((result) => resolve(result))
                    .catch(error => reject(error));
            } else {
                var discountPercentage = {};
                var maxUserCount = {};
                return coupons.findOne({ where: { coupon_code: couponCode, status: true, start_date: { [Operator.lte]: moment.utc() }, end_date: { [Operator.gte]: moment.utc() } } })
                    .then((couponInfo) => {
                        if (!couponInfo)
                            throw new Error("Coupon not found or expired!");
                        else {
                            discountPercentage = couponInfo.discount;
                            maxUserCount = couponInfo.max_use;
                            return userPayment.findAll({ where: { coupon_code: couponCode, user_id: userId } });
                        }
                    })
                    .then((userPaymentCount) => {
                        var usedCount = userPaymentCount.length;
                        if (usedCount >= maxUserCount)
                            throw new Error(`Coupon code(${couponCode}) only valid for ${maxUserCount} time(s) per user!`);
                        else {
                            return this.fetchPlanDetails(planId);
                        }
                    })
                    .then((planDetails) => {
                        if (!planDetails)
                            throw new Error("Cant able to fetch plan details!");
                        else {
                            var discountedPlanPrice = Number(planDetails.plan_price) * (Number(discountPercentage) / 100);
                            if (discountedPlanPrice < 0)
                                discountedPlanPrice = 0;
                            planDetails.plan_price = Number(planDetails.plan_price) - discountedPlanPrice;
                            resolve(planDetails);
                        }
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    getPaymentRedirectUrl(userId, userScopeName, newPlanId, paymentMode, couponCode) {
        return new Promise((resolve, reject) => {
            if (!userId || !userScopeName || !newPlanId || paymentMode == null || paymentMode == undefined) {
                reject(new Error("Invalid Inputs"));
            }
            else if (newPlanId == 0) {
                reject(new Error("Requested plan doesn't need to pay"));
            }
            else {
                var currentUserDetails = '';
                var redirectUrl = {};

                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type']
                    }]
                })
                    .then((userDetails) => {
                        currentUserDetails = userDetails;
                        if (userDetails.Activations.dataValues.user_plan == newPlanId)
                            throw new Error('Sorry, You are in same plan already.');
                        else
                            return this.applyCouponCode(couponCode, newPlanId, userId);
                    })
                    .then((planDetails) => {
                        if (paymentMode == 0)
                            return this.paymentServices.getPaypalRedirectUrl(userId, newPlanId, planDetails.plan_name, currentUserDetails.email, planDetails.plan_price);
                        else if (paymentMode == 1)
                            return this.paymentServices.getPayUMoneyRedirectUrl(userId, newPlanId, planDetails.plan_name, currentUserDetails.email, userScopeName, planDetails.plan_price);
                        else
                            throw new Error("Invalid payment mode.");
                    })
                    .then((details) => {
                        if (details) {
                            redirectUrl = details.redirectUrl;
                            details.userPayment.coupon_code = couponCode;
                            return userPayment.create(details.userPayment);
                        } else
                            throw new Error("Cant able to get the redirect url!");
                    })
                    .then(() => {
                        resolve(redirectUrl);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    paypalPaymentSuccess(userId, token, payerId) {
        return new Promise((resolve, reject) => {
            if (!userId || !token || !payerId) {
                reject(new Error("Invalid Inputs"));
            } else {

                var paymentInfo = {};
                var userDetailInfo = {};

                return userPayment.findOne({
                    where: {
                        subscription_details: {
                            [Operator.like]: `%${token}%`
                        }
                    }
                })
                    .then((paymentDetails) => {
                        if (!paymentDetails)
                            throw new Error("Sorry, token details not found.");
                        else {
                            return this.paymentServices.getPaypalPaymentDetails(token, payerId)
                                .then((paymentDetailInfo) => {
                                    if (paymentDetailInfo.transaction_id) {
                                        paymentInfo = paymentDetailInfo;
                                        return paymentDetails.update(paymentInfo)
                                            .then(() => {
                                                var expireDate = moment(paymentInfo.paymentOrderTime).add(1, 'months');
                                                if (paymentInfo.RequestedAmount == paymentInfo.paidAmount && paymentInfo.userId == userId) {
                                                    return userDetails.findOne({
                                                        where: { user_id: paymentInfo.userId },
                                                        include: [{
                                                            model: userActivation,
                                                            as: "Activations",
                                                            where: {
                                                                id: db.Sequelize.col('user_activation_id'),
                                                            }
                                                        }]
                                                    })
                                                        .then((user) => {
                                                            if (user === null)
                                                                throw new Error('No user found with current payment type!');
                                                            else {
                                                                userDetailInfo = user;
                                                                return user.Activations.update({
                                                                    last_payment_id: paymentDetails.payment_id,
                                                                    payment_status: 1,
                                                                    user_plan: paymentInfo.planId,
                                                                    account_expire_date: expireDate
                                                                })
                                                                    .then(() => {
                                                                        return this.sendPaymentInvoiceMail(paymentInfo, userDetailInfo);
                                                                    })
                                                                    .catch(function (error) {
                                                                        throw new Error(error.message);
                                                                    });
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            throw new Error(error.message);
                                                        });
                                                }
                                                else
                                                    return;
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', hasNewAccesstoken: true, message: 'Payment has been completed successfully.' });
                                            })
                                            .catch((error) => {
                                                throw error;
                                            });
                                    }
                                    else
                                        resolve({ code: 200, status: 'success', hasNewAccesstoken: false, message: 'Payment still in under processing.' });
                                })
                                .catch((error) => reject(error));
                        }
                    });
            }
        });
    }

    payUMoneyPaymentSuccess(userId, paymentResponse) {
        return new Promise((resolve, reject) => {
            if (!userId || !paymentResponse)
                reject(new Error("Invalid Input"));
            else {
                var payUMoneyVerifyResult = {};
                var fetchedPaymentDetails = {};
                var userDetailInfo = {};

                return userPayment.findOne({
                    where: {
                        subscription_details: {
                            [Operator.like]: `%${paymentResponse.txnid}%`
                        }
                    }
                })
                    .then((paymentDetails) => {
                        if (!paymentDetails)
                            throw new Error("Sorry, transaction details not found.");
                        else {
                            fetchedPaymentDetails = paymentDetails;
                            return this.paymentServices.getPayUMoneyPaymentDetails(paymentResponse);
                        }
                    })
                    .then((paymentInfo) => {
                        payUMoneyVerifyResult = paymentInfo;
                        return fetchedPaymentDetails.update(paymentInfo);
                    })
                    .then(() => {
                        var expireDate = moment(payUMoneyVerifyResult.paymentOrderTime).add(1, 'months');
                        if (payUMoneyVerifyResult.userId == userId) {
                            return userDetails.findOne({
                                where: { user_id: payUMoneyVerifyResult.userId },
                                include: [{
                                    model: userActivation,
                                    as: "Activations",
                                    where: {
                                        id: db.Sequelize.col('user_activation_id'),
                                    }
                                }]
                            })
                                .then((user) => {
                                    if (user === null)
                                        throw new Error('No user found with current payment type!');
                                    else {
                                        userDetailInfo = user;
                                        return user.Activations.update({
                                            last_payment_id: fetchedPaymentDetails.payment_id,
                                            payment_status: 1,
                                            user_plan: payUMoneyVerifyResult.planId,
                                            account_expire_date: expireDate
                                        });
                                    }
                                })
                                .then(() => {
                                    return this.sendPaymentInvoiceMail(payUMoneyVerifyResult, userDetailInfo);
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else
                            return;
                    })
                    .then(() => {
                        resolve({ code: 200, status: 'success', hasNewAccesstoken: true, message: 'Payment has been completed successfully.' });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    sendPaymentInvoiceMail(paymentInfo, userDetailInfo) {

        return new Promise((resolve, reject) => {
            if (!paymentInfo) {
                reject({ error: true, message: 'Invalid UserInfo' });
            } else {
                logger.info(`Payment Info: ${JSON.stringify(paymentInfo)}`);
                logger.info(`UserDetail Info: ${JSON.stringify(userDetailInfo)}`);

                //[Payername] [payer_email] [item_name] [subscr_date] [paymentId] [amount] [payment_status] [media]

                var mailServices = new MailServices(config.get('mailService'));
                var htmlContent = mailServices.template.invoice
                    .replace('[Payername]', paymentInfo.payer_name)
                    .replace('[payer_email]', paymentInfo.payer_email)
                    .replace('[item_name]', "<Item name>")
                    .replace('[subscr_date]', paymentInfo.payment_completed_date)
                    .replace('[paymentId]', "<Payment Id>")
                    .replace('[amount]', paymentInfo.paidAmount)
                    .replace('[payment_status]', "Success");

                var emailDetails = {
                    "subject": config.get('mailTitles.payment_invoice'),
                    "toMail": userDetailInfo.email,
                    "htmlContent": htmlContent
                };

                mailServices.sendMails(config.get('mailService.defaultMailOption'), emailDetails)
                    .then((result) => {
                        logger.info(`Payment invoice mail status: ${result}`);
                    })
                    .catch((error) => {
                        logger.error(`Payment invoice mail status: ${error}`);
                    });
                resolve({ status: 'success' });
            }
        });
    }

    getMyLastPaymentInfo(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var currentUserDetails = '';
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id', 'email'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'last_payment_id']
                    }]
                })
                    .then((userDetails) => {
                        if (!userDetails.Activations.last_payment_id) {
                            throw new Error("Sorry, You didnt make any payment with us");
                        }
                        currentUserDetails = userDetails;
                        return userPayment.findOne({
                            where: { payment_id: userDetails.Activations.last_payment_id },
                        });
                    })
                    .then((paymentDetails) => {
                        resolve({ code: 200, status: 'success', userDetails: currentUserDetails, paymentResult: paymentDetails });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getFullPaymentHistory(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return userPayment.findAll({
                    where: { user_id: userId, payment_status: 1 }
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
}


module.exports = PaymentLibs;
