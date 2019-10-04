const request = require('request');
const crypto = require('crypto');
const logger = require('../utils/logger');

let payment_url = {
    'prod': 'https://secure.payu.in/',
    'test': 'https://sandboxsecure.payu.in/'
};

let rest_url = {
    'prod': "https://www.payumoney.com/",
    'test': 'https://test.payumoney.com/'
};

let API = {
    'makePayment': '_payment',
    'paymentResponse': 'payment/op/getPaymentResponse?',
    'refundPayment': 'payment/merchant/refundPayment?',
    'refundStatus': 'treasury/ext/merchant/getRefundDetailsByPayment?',
};

function PayUMoney(authorization, key, salt, mode) {
    this.mode = mode;
    this.headers = {
        'authorization': authorization,
        'content-type': 'application/x-www-form-urlencoded',
        "Access-Control-Allow-Origin": "*"
    };
    this.credentails = {
        'key': key,
        'salt': salt,
        'service_provider': 'payu_paisa'
    };
}

PayUMoney.prototype.makePayment = function (data, callback) {

    logger.info(`Data : ${JSON.stringify(data)}`);

    var hashString = `${this.credentails.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|||||||||${this.credentails.salt}`;
    var hash = crypto.createHash('sha512').update(hashString).digest('hex');
    var postData = `key=${this.credentails.key}&txnid=${data.txnid}&amount=${data.amount}&productinfo=${data.productinfo}&firstname=${data.firstname}&lastname=&email=${data.email}&phone=${data.phone}&udf1=${data.udf1}&udf2=${data.udf2}&surl=${data.surl}&furl=${data.furl}&hash=${hash}&service_provider=${this.credentails.service_provider}`;
    var url = `${payment_url[this.mode]}${API.makePayment}`;
    request.post({
        headers: this.headers,
        url: url,
        body: postData,
        json: true,
    }, function (error, response, body) {
        if (!error) {
            logger.info(JSON.stringify(response));
            var result = response.headers.location;
            callback(error, result);
        } else {
            logger.info(error);
        }
    });
};

PayUMoney.prototype.paymentResponse = function (txnid, callback) {
    var postData = `merchantKey=${this.credentails.key}&merchantTransactionIds=${txnid}`;
    var url = `${rest_url[this.mode]}${API.paymentResponse}${postData}`;
    logger.info(`Response URl : ${url}`);
    request.post({
        headers: this.headers,
        url: url,
        json: true,
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.info(body);
            //var result = JSON.parse(body);
            callback(error, body);
        }
    });

    // var params = {
    //     merchantKey: this.credentails.key,
    //     merchantTransactionIds: txnid
    // request.post(rest_url[this.mode] + API.paymentResponse, { form: params, headers: this.headers }, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         var result = JSON.parse(body);
    //         callback(error, result.result);
    //     }
    // });
};

PayUMoney.prototype.refundPayment = function (paymentId, amount, callback) {
    var params = {
        merchantKey: this.credentails.key,
        paymentId: paymentId,
        refundAmount: amount
    };
    request.post(rest_url[this.mode] + API.refundPayment, { form: params, headers: this.headers }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            callback(error, result);
        }
    });
};

PayUMoney.prototype.refundStatus = function (paymentId, callback) {
    request.get(rest_url[this.mode] + API.refundStatus + 'merchantKey=' + this.credentails.key + '&paymentId=' + paymentId, { headers: this.headers }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            callback(error, result);
        }
    });
}

module.exports = PayUMoney;