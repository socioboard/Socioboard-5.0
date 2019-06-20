const AdminServices = require('../../../user/core/admin/utils/adminlibs');
const adminServices = new AdminServices();
const userId = 1;
//  new 

describe('getAppUserStats', () => {
    test('getAppUserStats_shouldReturn_successMessageForvalidInputs', () => {
        return adminServices.getAppUserInfo()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getAppUserStats_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.getAppUserInfo(22)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getMonthlyUserStats', () => {
    test('getMonthlyUserStats_shouldReturn_successMessageForvalidInputs', () => {
        var month = 4;
        var year = 2019;
        return adminServices.getMonthlyUserStats(month, year)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getMonthlyUserStats_shouldReturn_errorMessageForInvalidInputs', () => {
        var month = 13;
        var year = 2012;
        return adminServices.getMonthlyUserStats(month, year)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getMonthlyUserStats_shouldReturn_errorForMissingInputs', () => {
        return adminServices.getMonthlyUserStats('', 2019)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getAppUserInfo', () => {
    test('getAppUserInfo_shouldReturn_successMessageForvalidInputs', () => {
        return adminServices.getAppUserInfo()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getAppUserInfo_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.getAppUserInfo()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
});

describe('getUserPaymentHistory', () => {
    test('getUserPaymentHistory_shouldReturn_successMessageForvalidInputs', () => {
        return adminServices.getUserPaymentHistory(userId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getUserPaymentHistory_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.getUserPaymentHistory(4)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getUserPaymentHistory_shouldReturn_errorForMissingInputs', () => {
        return adminServices.getUserPaymentHistory('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('updateUserlock', () => {
    test('updateUserlock_shouldReturn_successMessageForvalidInputs', () => {
        var option = 0;
        return adminServices.updateUserlock(userId, option)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('updateUserlock_shouldReturn_errorMessageForInvalidInputs', () => {
        var option = 3;
        return adminServices.updateUserlock(userId, option)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updateUserlock_shouldReturn_errorForMissingInputs', () => {
        return adminServices.updateUserlock(5, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('updatePlanForTrail', () => {
    test('updatePlanForTrail_shouldReturn_successMessageForvalidInputs', () => {
        var planId = 7;
        return adminServices.updatePlanForTrail(6, planId, 3)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('updatePlanForTrail_shouldReturn_errorMessageForInvalidInputs', () => {
        var planId = 7;
        return adminServices.updatePlanForTrail(userId, planId, 5)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updatePlanForTrail_shouldReturn_errorMessageForInvalidInputs', () => {
        var planId = 7;
        return adminServices.updatePlanForTrail(5, planId, 3)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updatePlanForTrail_shouldReturn_errorMessageForInvalidInputs', () => {
        var planId = 7;
        return adminServices.updatePlanForTrail(userId, planId, 0)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updatePlanForTrail_shouldReturn_errorForMissingInputs', () => {
        return adminServices.updatePlanForTrail(userId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('updateTwoStepOptions', () => {
    test('updateTwoStepOptions_shouldReturn_successMessageForvalidInputs', () => {
        var option = 0;
        return adminServices.updateTwoStepOptions(userId, option)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('updateTwoStepOptions_shouldReturn_errorMessageForInvalidInputs', () => {
        var option = 0;
        return adminServices.updateTwoStepOptions('', option)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updateTwoStepOptions_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.updateTwoStepOptions(userId, 3)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('updateTwoStepOptions_shouldReturn_errorForMissingInputs', () => {
        var option = 0;
        return adminServices.updateTwoStepOptions(userId, option)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getPackages', () => {
    test('getPackages_shouldReturn_successMessageForvalidInputs', () => {
        return adminServices.getPackages()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getPackages_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.getPackages(32)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('addPackage', () => {

    test('addPackage_shouldReturn_successMessageForvalidInputs', () => {
        var packageData = {
            package: {
                "plan_name": "error2",
                "account_count": "320",
                "plan_price": "100",
                "member_count": "300",
                "available_network": "1-2-3-4",
                "browser_extension": "",
                "scheduling_posting": "",
                "mobile_apps": "",
                "support_24_7": "",
                "crm": "",
                "calendar": "",
                "rss_feeds": "",
                "social_report": "",
                "discovery": "",
                "twitter_engagement": "",
                "link_shortening": "",
                "shareathon": "",
                "content_studio": "",
                "team_report": "",
                "board_me": "",
                "share_library": "",
                "custom_report": "",
                "maximum_schedule": "100",
                "maximum_referal_count": "20",
            }
        };

        return adminServices.addPackage(packageData)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('addPackage_shouldReturn_errorMessageForInvalidInputs', () => {

        var packageData = {
            package: {
                "plan_name": "error",
                "account_count": '',
                "plan_price": '',
                "member_count": "",
                "available_network": "",
                "browser_extension": "",
                "scheduling_posting": "",
                "mobile_apps": "",
                "support_24_7": "",
                "crm": "",
                "calendar": "",
                "rss_feeds": "",
                "social_report": "",
                "discovery": "",
                "twitter_engagement": "",
                "link_shortening": "",
                "shareathon": "",
                "content_studio": "",
                "team_report": "",
                "board_me": "",
                "share_library": "",
                "custom_report": "",
                "maximum_schedule": "100",
                "maximum_referal_count": "20",
            }
        };

        return adminServices.addPackage(packageData)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('addPackage_shouldReturn_successMessageForAlreadyExistingInputs', () => {

        var packageData = {
            package: {
                "plan_name": "sb",
                "account_count": "320",
                "plan_price": "100",
                "member_count": "300",
                "available_network": "1-2-3-4",
                "browser_extension": "",
                "scheduling_posting": "",
                "mobile_apps": "",
                "support_24_7": "",
                "crm": "",
                "calendar": "",
                "rss_feeds": "",
                "social_report": "",
                "discovery": "",
                "twitter_engagement": "",
                "link_shortening": "",
                "shareathon": "",
                "content_studio": "",
                "team_report": "",
                "board_me": "",
                "share_library": "",
                "custom_report": "",
                "maximum_schedule": "100",
                "maximum_referal_count": "20",
            }
        };
        return adminServices.addPackage(packageData)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('addPackage_shouldReturn_errorForMissingInputs', () => {
        return adminServices.addPackage('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('editPackage', () => {

    test('editPackage_shouldReturn_successMessageForvalidInputs', () => {
        var planId = 10;
        var packageData = {
            "package": {
                "plan_name": "errors",
                "account_count": 0,
                "plan_price": 0,
                "member_count": 0,
                "available_network": "string",
                "browser_extension": 0,
                "scheduling_posting": 0,
                "mobile_apps": 0,
                "support_24_7": 0,
                "crm": 0,
                "calendar": 0,
                "rss_feeds": 0,
                "social_report": 0,
                "discovery": 0,
                "twitter_engagement": 0,
                "link_shortening": 0,
                "shareathon": 0,
                "content_studio": 0,
                "team_report": 0,
                "board_me": 0,
                "share_library": 0,
                "custom_report": 0,
                "maximum_schedule": 0,
                "maximum_referal_count": 0
            }
        };
        return adminServices.editPackage(packageData, planId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('editPackage_shouldReturn_errorMessageForInvalidInputs', () => {
        var packageData = {
            package: {
                "plan_name": "errorerror",
                "account_count": "320",
                "plan_price": "100",
                "member_count": "300",
                "maximum_schedule": "100",
                "maximum_referal_count": "20",
            }
        };

        return adminServices.editPackage(packageData, 9)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editPackage_shouldReturn_errorMessageForNopackage', () => {
        var packageData = {
            package: {
                "plan_name": "error2",
                "account_count": "320",
                "plan_price": "100",
                "member_count": "300",
                "available_network": "1-2-3-4-5",
                "browser_extension": "",
                "scheduling_posting": "",
                "mobile_apps": "",
                "support_24_7": "",
                "crm": "",
                "calendar": "",
                "rss_feeds": "",
                "social_report": "",
                "discovery": "",
                "twitter_engagement": "",
                "link_shortening": "",
                "shareathon": "",
                "content_studio": "",
                "team_report": "",
                "board_me": "",
                "share_library": "",
                "custom_report": "",
                "maximum_schedule": "100",
                "maximum_referal_count": "20",
            }
        };
        return adminServices.editPackage(packageData, 10)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editPackage_shouldReturn_errorForMissingInputs', () => {

        return adminServices.editPackage('', 9)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


});

describe('updatePackageActivations', () => {

    test('updatePackageActivations_shouldReturn_successMessageForvalidInputs', () => {
        var planId = 10;
        var status = 1;
        return adminServices.updatePackageActivations(planId, status)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('updatePackageActivations_shouldReturn_successMessageForvalidInputs', () => {
        var planId = 10;
        var status = 0;
        return adminServices.updatePackageActivations(planId, status)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('updatePackageActivations_shouldReturn_errorMessageForInvalidPlanIdInputs', () => {
        var planId = 20;
        var status = 0;
        return adminServices.updatePackageActivations(planId, status)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('updatePackageActivations_shouldReturn_errorMessageForInvalidInputs', () => {
        var planId = 20;
        var status = 1;
        return adminServices.updatePackageActivations(planId, status)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('updatePackageActivations_shouldReturn_errorForMissingInputs', () => {
        var planId = 10;
        return adminServices.updatePackageActivations(planId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('createCoupon', () => {

    test('createCoupon_shouldReturn_successMessageForvalidInputs', () => {
        var couponInfo =
        {
            "coupon_code": "string",
            "start_date": "2019-05-08T10:09:55.099Z",
            "end_date": "2019-07-08T10:09:55.099Z",
            "discount": 50,
            "max_use": 5
        };
        return adminServices.createCoupon(userId, couponInfo)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });


    test('createCoupon_shouldReturn_errorMessageForExistingPackage', () => {
        var couponInfo =
        {
            "coupon_code": "string4",
            "start_date": "2019-04-29",
            "end_date": "2019-04-29",
            "discount": 2,
            "max_use": 2

        };
        return adminServices.createCoupon(userId, couponInfo)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('createCoupon_shouldReturn_errorMessageForIvalidMaxUse', () => {
        var couponInfo =
        {
            "coupon_code": "string2",
            "start_date": "2019-04-29",
            "end_date": "2019-04-29",
            "discount": 0,
            "max_use": 5

        };
        return adminServices.createCoupon(userId, couponInfo)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('createCoupon_shouldReturn_errorMessageForInvalidDiscount', () => {
        var couponInfo =
        {
            "coupon_code": "string2",
            "start_date": "2019-04-29",
            "end_date": "2019-04-29",
            "discount": 0,
            "max_use": 1

        };
        return adminServices.createCoupon(userId, couponInfo)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('createCoupon_shouldReturn_errorMessageForIvalidDate', () => {
        var couponInfo =
        {
            "coupon_code": "string2",
            "start_date": "2019-04-29",
            "end_date": "2019-04-29",
            "discount": 0,
            "max_use": 0
        };
        return adminServices.createCoupon(userId, couponInfo)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('createCoupon_shouldReturn_errorForMissingInputs', () => {
        return adminServices.createCoupon(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('changeCouponStatus', () => {

    test('changeCouponStatus_shouldReturn_successMessageForvalidInputs', () => {
        var couponCode = 'SB50';
        var status = 1;
        return adminServices.changeCouponStatus(couponCode, status)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('changeCouponStatus_shouldReturn_successMessageForvalidInputs', () => {
        var couponCode = 'SB50';
        var status = 0;
        return adminServices.changeCouponStatus(couponCode, status)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('changeCouponStatus_shouldReturn_errorMessageForInvalidInpts', () => {
        var couponCode = 'string123';
        var status = 1;
        return adminServices.changeCouponStatus(couponCode, status)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('changeCouponStatus_shouldReturn_errorForMissingInputs', () => {
        var couponCode = 'string';
        return adminServices.changeCouponStatus(couponCode, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getCoupons', () => {

    test('getCoupons_shouldReturn_successMessageForvalidInputs', () => {
        return adminServices.getCoupons()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getCoupons_shouldReturn_errorMessageForInvalidInputs', () => {
        return adminServices.getPackages(32)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getCouponInfo', () => {

    test('getCouponInfo_shouldReturn_successMessageForvalidInputs', () => {
        // user can be name or email or userId
        return adminServices.getCouponInfo('Admin')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getCouponInfo_shouldReturn_errorMessageForInvalidInputs', () => {
        // user can be name or email or userId
        return adminServices.getCouponInfo(22)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getCouponInfo_shouldReturn_errorMessageForMissingInputs', () => {
        // user can be name or email or userId
        return adminServices.getCouponInfo('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


});