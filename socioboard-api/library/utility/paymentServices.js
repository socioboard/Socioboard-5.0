const paypalExpress = require('paypal-express-checkout');
const moment = require('moment');
const queryString = require('query-string');
const PayUMoney = require('./payumoneyServices');
const request = require('request');
const crypto = require('crypto');

function Payment(payment) {
    this.payment = payment;
    this.paypal = paypalExpress.init(this.payment.paypal.api_username, this.payment.paypal.api_password, this.payment.paypal.api_signature, this.payment.paypal.success_url, this.payment.paypal.cancel_url, true);
    this.payumoney = new PayUMoney(this.payment.payumoney.header, this.payment.payumoney.key, this.payment.payumoney.salt, this.payment.payumoney.mode);
}

Payment.prototype.getPaypalRedirectUrl = function (userId, userPlan, userPlanName, email, amount) {

    return new Promise((resolve, reject) => {
        if (!userId || !userPlan || !userPlanName || !email || !amount) {
            reject("Cant able to generate redirect urls due to invalid api!");
        } else {
            var invoiceId = String(moment().unix());
            this.paypal.pay(invoiceId, amount, userPlanName, this.payment.paypal.currency, true, [String(userId), userPlan], (error, url) => {
                if (error) {
                    reject(error);
                }
                else {
                    var parsedUrl = queryString.parse(url);
                    if (parsedUrl.token) {
                        var subscriptiontoken = {
                            token: parsedUrl.token,
                            invoiceId: invoiceId
                        };
                        var userPayment = {
                            transaction_id: 'NA',
                            transaction_type: 'NA',
                            currency_code: this.payment.paypal.currency,
                            amount: amount,
                            payment_mode: 0, //Paypal
                            payment_status: 0,// Failed,
                            payment_initiated_date: moment.utc(),
                            requested_plan_id: userPlan,
                            user_id: userId,
                            subscription_details: JSON.stringify(subscriptiontoken)
                        };
                        var details = {
                            redirectUrl: url,
                            userPayment: userPayment
                        };
                        resolve(details);
                    } else {
                        reject(new Error('Something went wrong on paypal!'));
                    }
                }
            });
        }
    });
};

Payment.prototype.getPaypalPaymentDetails = function (token, payerId) {
    return new Promise((resolve, reject) => {
        if (!token || !payerId) {
            reject("Invalid token or payerId in paypal payment");
        } else {
            this.paypal.detail(token, payerId, (error, data, invoiceNumber, price, custom_data_array) => {
                if (error) {
                    reject(error);
                }
                if (data.success) {
                    var payerLastName = data.LASTNAME ? ` ${data.LASTNAME}` : '';
                    var payment = data.PAYMENTSTATUS;
                    var paymentStatus = 0;
                    var customDetails = data.CUSTOM.split('|');
                    var userPlanId = customDetails.pop();
                    var userId = customDetails.pop();

                    if (payment == 'Completed') {
                        paymentStatus = 1;
                    }

                    var paymentDetails = {
                        transaction_id: data.TRANSACTIONID,
                        transaction_type: data.PAYMENTINFO_0_TRANSACTIONTYPE,
                        payment_completed_date: moment.utc(),
                        payer_id: payerId,
                        payer_email: data.EMAIL,
                        payer_name: `${data.FIRSTNAME}${payerLastName}`,
                        invoice_id: data.INVNUM,
                        payment_status: paymentStatus,
                        paymentOrderTime: data.PAYMENTINFO_0_ORDERTIME,
                        RequestedAmount: data.PAYMENTREQUEST_0_AMT,
                        paidAmount: data.PAYMENTINFO_0_AMT,
                        planId: userPlanId,
                        userId: userId
                    };
                    resolve(paymentDetails);
                }
                else {
                    reject(new Error("Something went wrong."));
                }
            });
        }
    });
};

Payment.prototype.getPayUMoneyRedirectUrl = function (userId, userPlan, userPlanName, email, userName, amount) {
    return new Promise((resolve, reject) => {
        if (!userId || !userPlan || !userPlanName || !email || !userName || !amount) {
            reject(new Error("Cant able to get redirect url for payumoney due to invalid inputs!"));
        } else {
            var currencyLayerUrl = `http://apilayer.net/api/live?access_key=${this.payment.payumoney.currency_layer_api}&currencies=INR&source=USD&format=1`;

            request.get(currencyLayerUrl, (error, response, body) => {
                if (error) {
                    reject(new Error('Something went wrong'));
                } else {
                    var parsedBody = JSON.parse(body);
                    var INRAmount = parsedBody.quotes.USDINR;
                    var paymentPrice = (Number(amount) * Number(INRAmount));
                    paymentPrice = Math.floor(paymentPrice);
                    var transaction_id = `Socioboard${moment().unix()}`;

                    var paymentData = {
                        productinfo: userPlanName,
                        txnid: transaction_id,
                        amount: String(paymentPrice),
                        email: email,
                        phone: "",
                        lastname: "",
                        firstname: userName,
                        surl: this.payment.payumoney.success_url,
                        furl: this.payment.payumoney.cancel_url,
                        udf1: String(userId),
                        udf2: String(userPlan)
                    };

                    this.payumoney.makePayment(paymentData, (error, response) => {
                        if (error) {
                            reject(error);
                        } else {

                            var subscriptiontoken = {
                                transaction_id: transaction_id,
                            };

                            var userPayment = {
                                transaction_id: 'NA',
                                transaction_type: 'NA',
                                currency_code: 'INR',
                                amount: paymentPrice,
                                payment_mode: 1, //PayUMoney
                                payment_status: 0,// Failed,
                                payment_initiated_date: moment.utc(),
                                requested_plan_id: userPlan,
                                user_id: userId,
                                subscription_details: JSON.stringify(subscriptiontoken)
                            };
                            var details = {
                                redirectUrl: response,
                                userPayment: userPayment
                            };
                            resolve(details);
                        }
                    });
                }
            });
        }
    });
};

Payment.prototype.getPayUMoneyPaymentDetails = function (postDetails) {
    return new Promise((resolve, reject) => {
        if (!postDetails) {
            reject(new Error("Invalid response from payumoney"));
        } else {
            var hashString = `${this.payment.payumoney.key}|${postDetails.txnid}|${postDetails.amount}|${postDetails.productinfo}|${postDetails.firstname}|${postDetails.email}|${postDetails.udf1}|${postDetails.udf2}||||||||`;
            var hashStringArray = hashString.split('|');
            var reverseKeyArray = hashStringArray.reverse();
            var reverseKeyString = this.payment.payumoney.salt + '|' + postDetails.status + '|' + reverseKeyArray.join('|');
            var calculatedHash = crypto.createHash('sha512').update(reverseKeyString).digest('hex');
            if (calculatedHash == postDetails.hash) {
                var paymentDetails = {
                    transaction_id: postDetails.mihpayid,
                    transaction_type: postDetails.pg_type,
                    payment_completed_date: moment.utc(),
                    payer_id: postDetails.phone,
                    payer_email: postDetails.email,
                    payer_name: postDetails.cardnum,
                    invoice_id: postDetails.txnid,
                    payment_status: 1,
                    paymentOrderTime: postDetails.addedon,
                    RequestedAmount: postDetails.amount,
                    paidAmount: postDetails.amount,
                    planId: postDetails.udf2,
                    userId: postDetails.udf1
                };
                resolve(paymentDetails);
            } else {
                reject(new Error(`Hash Not verified and calculated hash : ${calculatedHash} and intial hash ${hashString}.`));
            }
        }
    });
};

module.exports = Payment;




