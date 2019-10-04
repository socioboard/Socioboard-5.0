const config = require('config');
const moment = require('moment');
const pdf = require('html-pdf');
const fs = require('fs');

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
                // Checking that the plan is there ot not and is that plan is active or not
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
                // Checking that the coupon code is Valid or not
                return coupons.findOne({ where: { coupon_code: couponCode, status: true, start_date: { [Operator.lte]: moment.utc() }, end_date: { [Operator.gte]: moment.utc() } } })
                    .then((couponInfo) => {
                        if (!couponInfo)
                            throw new Error("Coupon not found or expired!");
                        else {
                            discountPercentage = couponInfo.discount;
                            maxUserCount = couponInfo.max_use;
                            // Fetching the count of payments done with that coupon
                            return userPayment.findAll({ where: { coupon_code: couponCode, user_id: userId } });
                        }
                    })
                    .then((userPaymentCount) => {
                        // Checking how many times that coupon is used
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
                            // Calculating discounted price 
                            var discountedPlanPrice = Number(planDetails.plan_price) * (Number(discountPercentage) / 100);
                            if (discountedPlanPrice < 0)
                                discountedPlanPrice = 0;
                            planDetails.plan_price = Number(planDetails.plan_price) - discountedPlanPrice;
                            // Sending the updated plan details after applying the coupon code/without coupon code.
                            resolve(planDetails);
                        }
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    makeInvoicePdf(userId, paymentDetails) {
        return new Promise((resolve, reject) => {
            if (!paymentDetails) {
                reject(new Error('Invalid Date to make Invoice Pdf'));
            } else {

                // Fetching plan details
                return this.fetchPlanDetails(paymentDetails.requested_plan_id ? paymentDetails.requested_plan_id : paymentDetails.planId)
                    .then((result) => {
                        // Replace -[invoiceNo] [invoiceDate] [dueDate] [name] [email] [device] [package] [description] [paymentDate] [transactionId] [paymentStatus] [paid Amount] 
                        // var invoiceHTML = '<!DOCTYPE html><html><head><style>td {text-align: center}th {text-align: center}.left {text-align: left}.right {text-align: right}div::after {content: "";background: url("http://localhost:3000/template/watermark.png");opacity: 0.5;top: 0;left: 0;bottom: 0;right: 0;position: absolute;z-index: -1;background-repeat: no-repeat;background-position: center} br { bottom: 0px;position: fixed; }</style></head><body><div><table><tr><td rowspan="4" colspan="3" align="center"> <img style="max-height:100px"src="https://i.imgur.com/qAdpCjL.png" alt="SOCIOBOARD" /> </td><tr><td class="left">Invoice No:</td><td class="right">[invoiceNo]</td></tr><tr><td class="left">Invoice Date:</td><td class="right">[invoiceDate]</td></tr><tr><td class="left">Due Date:</td><td class="right">[dueDate]</td></tr><tr><td colspan="6"><hr></td></tr><th class="left">User Details:-</th></tr><tr><td class="left">[name]</td></tr><tr><td class="left">[email]</td></tr><tr><td><br /></td></tr></tr><tr><td colspan="6"><hr></td></tr><tr><th class="left">Package Details:-</th></tr><tr><td><br /></td></tr><tr></tr><tr><th>Package</th><th>PaymentDate</th><th>TransactionId</th><th>PaymentStatus</th><th>Paid Amount</th><tr><td>[package]</td><td>[paymentDate]</td><td>[transactionId]</td><td>[paymentStatus]</td><td>[paid Amount]</td></tr><tr><td><br /></td></tr></tr></table><p> * This reciept is generated by System.</p></div><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></body></html>',
                        var invoiceHTML = '<!DOCTYPE html><html><head><style>td {text-align: center}th {text-align: center}.left {text-align: left}.right {text-align: right}div::after {content: "";background: url("http://localhost:3000/template/watermark.png");opacity: 0.2;top: 0;left: 0;bottom: 0;right: 0;position: absolute;z-index: -1;background-repeat: no-repeat;background-position: center}br {bottom: 0px;position: fixed;}</style></head><body><div><table><tr><td width="70%"></td><td width="30%"></td><td></td><tr><td align="center" colspan="2"> <img style="max-height:100px" src="https://i.imgur.com/qAdpCjL.png"alt="SOCIOBOARD" /></td><td width="10%"></td></tr><tr><td colspan="10"><hr></td></tr><tr><th colspan="10">INVOICE</th></tr><tr><td class="left" width="40%">Name: [name]</td></tr><tr><td class="left" width="40%">Email: [email]</td></tr><tr><td class="left" width="70%">Transaction Id: [transactionId]</td></tr><tr><td class="left" width="70%">Payment Date: [paymentDate]</td></tr><tr><td><br /></td></tr></tr><tr><td colspan="10"><hr></td></tr><tr><th class="left">Package Details:-</th></tr><tr><td><br /></td></tr><table border="2"; frame= "void"; cellspacing="0"><tr><th width="18%">Package</th><th width="16%">ExpiredDate</th><th width="18%">PaymentStatus</th><th width="18%">Paid Amount</th><tr><td>[package]</td><td>[expiredDate]</td><td>[paymentStatus]</td><td>[currencyCode]:[paid Amount]</td></tr></table><tr><td><br /></td></tr></tr></table><p> * This reciept is generated by System.</p></div><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></body></html>',
                            // Updating content with Values
                            htmlContent = invoiceHTML
                                .replace('[expiredDate]', moment(paymentDetails.payment_completed_date).add(1, "month").format('YYYY-MM-DD HH:mm:ss'))
                                .replace('[name]', paymentDetails.payer_name)
                                .replace('[email]', paymentDetails.payer_email)
                                .replace('[package]', result.plan_name)
                                .replace('[description]', `${result.plan_name} package`)
                                .replace('[paymentDate]', moment(paymentDetails.payment_completed_date).format('YYYY-MM-DD HH:mm:ss'))
                                .replace('[transactionId]', paymentDetails.transaction_id)
                                .replace('[paymentStatus]', paymentDetails.payment_status == 1 ? "completed" : "processing")
                                .replace('[currencyCode]', paymentDetails.currency_code ? paymentDetails.currency_code : "USD")
                                .replace('[paid Amount]', paymentDetails.paidAmount ? paymentDetails.paidAmount : paymentDetails.amount);

                        // Creating a temporary file with updated data.
                        var write = fs.writeFileSync(`config.get('payment.template_path')${userId}_${paymentDetails.transaction_id}.html`, htmlContent);
                        // Making it to Read form with utf8 encryption
                        var html = fs.readFileSync(`config.get('payment.template_path')${userId}_${paymentDetails.transaction_id}.html`, 'utf8');
                        var options = { format: 'Letter' };
                        var fileName = `${config.get('payment.payment_path')}/${paymentDetails.transaction_id}.pdf`;
                        // Creating pdf format of that readable file to a file
                        pdf.create(html, options).toFile(fileName, function (err, res) {
                            if (err) throw error;
                            else {
                                // Updating the payment details with Bill (payment invoice PDFs)
                                return userPayment.update({
                                    invoice_url: `${config.get('user_socioboard.host_url')}/payments/${userId}_${paymentDetails.transaction_id}.pdf`,
                                }, { where: { transaction_id: paymentDetails.transaction_id } })
                                    .then(() => {
                                        // Removing that temporary file
                                        fs.unlinkSync(`config.get('payment.template_path')${userId}_${paymentDetails.transaction_id}.html`);
                                        resolve({ message: "success", file: `${config.get('user_socioboard.host_url')}/payments/${paymentDetails.transaction_id}.pdf` });
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            }
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
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

                // Fetching user deatils and payment details
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
                        // Selecting the mode of payment
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
                            // Getting payment details from paypal
                            return this.paymentServices.getPaypalPaymentDetails(token, payerId)
                                .then((paymentDetailInfo) => {
                                    if (paymentDetailInfo.transaction_id) {
                                        paymentInfo = paymentDetailInfo;
                                        // Updating the data in user payments
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
                                                                        return this.makeInvoicePdf(userId, paymentInfo);
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

                // checking payUMoney payment success with transaction id
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
                            // If not, fetching the payment details
                            return this.paymentServices.getPayUMoneyPaymentDetails(paymentResponse);
                        }
                    })
                    .then((paymentInfo) => {
                        payUMoneyVerifyResult = paymentInfo;
                        // Updating the payments with new details
                        return fetchedPaymentDetails.update(paymentInfo);
                    })
                    .then(() => {
                        // Making an expire date of 1 month
                        var expireDate = moment(payUMoneyVerifyResult.paymentOrderTime).add(1, 'months');
                        if (payUMoneyVerifyResult.userId == userId) {
                            // Finding user Activations
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
                                        // Updating user activations with payment Id and plan Id
                                        return user.Activations.update({
                                            last_payment_id: fetchedPaymentDetails.payment_id,
                                            payment_status: 1,
                                            user_plan: payUMoneyVerifyResult.planId,
                                            account_expire_date: expireDate
                                        });
                                    }
                                })
                                .then(() => {
                                    // Sending payment invoice to the user.
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
                // Updating htmlcontent with values and sending the new htmlContent to mail
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

                // Sending mail with updated content
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
                // Validating whether user made any payments or not
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
                        // Fetching the payment details
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
                // Fetching all payments where payment status is 1
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

    paymentInvoiceDownloader(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching recent payment details
                return this.getMyLastPaymentInfo(userId)
                    .then((result) => {
                        // Making a PDF with result (recent payment details)
                        return this.makeInvoicePdf(userId, result.paymentResult)
                            .then((response) => {
                                resolve(response);
                            })
                            .catch((error) => {
                                throw error;
                            });
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }

}


module.exports = PaymentLibs;
