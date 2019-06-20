const PaymentServices = require('../../core/payments/utils/paymentlibs');

const paymentServices = new PaymentServices();
const userId = 1;

describe('getPaymentRedirectUrl', () => {

    test('getPaymentRedirectUrl_shouldReturn_successMessageForValidInputs', () => {
        var userName = 'Suresh';
        var newPlan = 7;
        var paymentMode = 0;
        var coupon = "SB80";
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode, coupon)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getPaymentRedirectUrl_shouldReturn_errorMessageForInvalidCouponCode', () => {
        var userName = 'Suresh';
        var newPlan = 7;
        var paymentMode = 0;
        var coupon = "SB50";
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode, coupon)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getPaymentRedirectUrl_shouldReturn_errorMessageForInvalidInputs', () => {
        var userName = 'Suresh';
        var newPlan = 7;
        var paymentMode = 0;
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    describe('applyCouponCode', () => {

        test('applyCouponCode_shouldReturn_successMessageForValidInputs', () => {
            return paymentServices.applyCouponCode("SB80", 7, userId)
                .then((result) => {
                    expect(result).not.toHaveProperty('message');
                });
        });

        test('applyCouponCode_shouldReturn_errorMessageForInvlaidInputs', () => {
            return paymentServices.applyCouponCode("SH50", 9, 3)
                .catch((error) => {
                    expect(error).toHaveProperty('message');
                });
        });

        test('applyCouponCode_shouldReturn_errorMessageFormissingInputs', () => {
            return paymentServices.applyCouponCode('', 7, 1)
                .catch((error) => {
                    expect(error).toHaveProperty('message');
                });
        });

    });

    describe('planCheck', () => {

        test('fetchPlanDetails_shouldReturn_successMessageForValidInputs', () => {
            var planId = 7;
            return paymentServices.fetchPlanDetails(planId)
                .then((result) => {
                    expect(result).not.toHaveProperty('message');
                });
        });

        test('fetchPlanDetails_shouldReturn_errorMessageForInvlaidInputs', () => {
            return paymentServices.fetchPlanDetails(20)
                .catch((error) => {
                    expect(error).toHaveProperty('message');
                });
        });

        test('fetchPlanDetails_shouldReturn_errorMessageFormissingInputs', () => {
            return paymentServices.fetchPlanDetails('')
                .catch((error) => {
                    expect(error).toHaveProperty('message');
                });
        });

    });


    test('getPaymentRedirectUrl_shouldReturn_errorMessageForInvalidPaymentMode', () => {
        var userName = 'Suresh';
        var newPlan = 7;
        var paymentMode = 4;
        var coupon = "SB50";
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode, coupon)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getPaymentRedirectUrl_shouldReturn_errorMessageForInvalidPlanNumer', () => {
        var userName = 'Suresh';
        var newPlan = 14;
        var paymentMode = 0;
        var coupon = "SB50";
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode, coupon)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getPaymentRedirectUrl_shouldReturn_errorMessageForInvalidCouponCode', () => {
        var userName = 'Suresh';
        var newPlan = 7;
        var paymentMode = 0;
        var coupon = "50";
        return paymentServices.getPaymentRedirectUrl(userId, userName, newPlan, paymentMode, coupon)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getPaymentRedirectUrl_shouldReturn_errorMessageForMissingInputs', () => {
        var userName = 'Suresh';
        var coupon = "SB50";
        return paymentServices.getPaymentRedirectUrl(userId, userName, '', '', coupon)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('paypalPaymentSuccess', () => {

    test('paypalPaymentSuccess_shouldReturn_successMessageForValidInputs', () => {
        var token = "EC-72995347L6929460U";
        var payerId = "J9VSKE27GQU6S";
        return paymentServices.paypalPaymentSuccess(userId, token, payerId)
            .then((result) => {
                expect(result).toHaveProperty('hasNewAccesstoken');
            });
    });

    test('paypalPaymentSuccess_shouldReturn_errorForInvalidInputs', () => {
        var token = "EC-72995347L6929460U";
        var payerId = "J9VSKE";
        return paymentServices.paypalPaymentSuccess(userId, token, payerId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('paypalPaymentSuccess_shouldReturn_errorForMissingInputs', () => {
        return paymentServices.paypalPaymentSuccess(userId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('payUMoneyPaymentSuccess', () => {

    test('payUMoneyPaymentSuccess_shouldReturn_successMessageForValidInputs', () => {
        var paymentResponse = {
            "key": "string",
            "txnid": "5WA71798LB533870A",
            "amount": "19.9979999",
            "productinfo": "string",        //*** */ original data should update in this.
            "firstname": "string",
            "email": "string",
            "mihpayid": "string",
            "status": "success",
            "hash": "string",
            "cardnum": "401200XXXXXX1112",
            "phone": "string",
            "pg_type": "expresscheckout",
            "addedon": "2019-05-08 07:01:57",
            "udf1": "string",
            "udf2": "string"
        };
        return paymentServices.payUMoneyPaymentSuccess(userId, paymentResponse)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('payUMoneyPaymentSuccess_shouldReturn_errorForInvalidInputs', () => {
        var paymentResponse = {
            "key": "string",
            "txnid": "string",
            "amount": "string",
            "productinfo": "string",    // error data entry
            "firstname": "string",
            "email": "string",
            "mihpayid": "string",
            "status": "string",
            "hash": "string",
            "cardnum": "string",
            "phone": "string",
            "pg_type": "string",
            "addedon": "string",
            "udf1": "string",
            "udf2": "string"
        };
        return paymentServices.payUMoneyPaymentSuccess(userId, paymentResponse)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('payUMoneyPaymentSuccess_shouldReturn_errorForMissingUser', () => {
        var paymentResponse = {
            "key": "string",
            "txnid": "string",
            "amount": "string",
            "productinfo": "string",            //any data 'Coz the user is missed it throws error.
            "firstname": "string",
            "email": "string",
            "mihpayid": "string",
            "status": "string",
            "hash": "string",
            "cardnum": "string",
            "phone": "string",
            "pg_type": "string",
            "addedon": "string",
            "udf1": "string",
            "udf2": "string"
        };
        return paymentServices.payUMoneyPaymentSuccess('', paymentResponse)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('payUMoneyPaymentSuccess_shouldReturn_errorForMissingResponseData', () => {
        return paymentServices.payUMoneyPaymentSuccess(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getMyLastPaymentInfo', () => {

    test('getMyLastPaymentInfo_shouldReturn_successMessageForValidInputs', () => {
        return paymentServices.getMyLastPaymentInfo(userId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getMyLastPaymentInfo_shouldReturn_errorForInvalidInputs', () => {
        return paymentServices.getMyLastPaymentInfo(20)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getMyLastPaymentInfo_shouldReturn_errorForMissingInputs', () => {
        return paymentServices.getMyLastPaymentInfo('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getFullPaymentHistory', () => {

    test('getFullPaymentHistory_successMessageForValidInputs', () => {
        return paymentServices.getFullPaymentHistory(userId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getFullPaymentHistory_shouldReturn_errorForInvalidInputs', () => {
        return paymentServices.getFullPaymentHistory(20)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getFullPaymentHistory_shouldReturn_errorForMissingInputs', () => {
        return paymentServices.getFullPaymentHistory('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});