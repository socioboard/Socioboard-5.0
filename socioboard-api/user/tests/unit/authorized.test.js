const AuthorisedUtils = require('../../core/authorized/utils/authorizedlibs');

const logger = require('../../utils/logger');
const authorisedUtils = new AuthorisedUtils();
const userId = 2;

describe('change_password', () => {

    test('changePassword_ShouldReturnSuccess_ValidDetails', () => {
        return authorisedUtils.changePassword(2, "user", "User")
            .then((result) => {
                expect(result).toMatch('Success');
            });
    });

    test('changePassword_ShouldReturnError_UpdateWithSamePassword', () => {
        return authorisedUtils.changePassword(2, "user", "user")
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('changePassword_ShouldReturnError_WrongCurrentPassword', () => {
        return authorisedUtils.changePassword(2, "wrong", "wrong1")
            .catch((error) => {
                expect(error.message).toMatch('Sorry! Wrong Password.');
            });
    });

    test('changePassword_ShouldReturnError_PasswordValidationFailed', () => {
        return authorisedUtils.changePassword(2, "user", "")
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

    test('changePassword_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.changePassword(2, null, null)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

});

describe('change_plan', () => {
    test('changePlan_ShouldReturnSuccess_DowngradePlan', () => {
        return authorisedUtils.changePlan(userId, 7, 6)
            .then((result) => {
                expect(result).toHaveProperty('accessToken');
            });
    });

    test('changePlan_ShouldReturnError_LowToHighPlanWithoutPay', () => {
        return authorisedUtils.changePlan(userId, 6, 7)
            .catch((error) => {
                expect(error.message).toMatch('Please use proper payment endpoints to upgrade plans.');
            });
    });

    test('changePlan_ShouldReturnError_InvalidUserCurrentPlan', () => {

        return authorisedUtils.changePlan(userId, 2, 7)
            .catch((error) => {
                expect(error.message).toMatch('Not found, Please check current plan or user details!');
            });
    });

    test('changePlan_ShouldReturnError_InvalidRequestingPlanId', () => {

        return authorisedUtils.changePlan(userId, 6, -1)
            .catch((error) => {
                expect(error.message).toMatch('Cant able to fetch plan.');
            });
    });

    test('changePlan_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.changePlan(userId, null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('changePlan_ShouldReturnError_MissingInputs', () => {
        return authorisedUtils.changePlan(userId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('change_payment_type', () => {
    test('changePaymentType_ShouldReturnSuccess_ValidInputs', () => {
        return authorisedUtils.changePaymentType(userId, 0, 1)
            .then((result) => {
                expect(result).toHaveProperty('accessToken');
            });
    });

    test('changePaymentType_ShouldReturnError_InvalidUserIdAsZero', () => {
        return authorisedUtils.changePaymentType(0, 1, 0)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

    test('changePaymentType_ShouldReturnError_InvalidUserIdAsNegative', () => {
        return authorisedUtils.changePaymentType(-1, 1, 0)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

    test('changePaymentType_ShouldReturnError_UnavailableUserId', () => {
        return authorisedUtils.changePaymentType(9999999, 1, 0)
            .catch((error) => {
                expect(error.message).toMatch('No user found with current payment type!');
            });
    });

    test('changePaymentType_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.changePaymentType(userId, null, null)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });
});

describe('change_two_step_option', () => {
    test('changeTwoStepOption_ShouldReturnSuccess_ValidInputs', () => {
        return authorisedUtils.change2StepOptions(userId, 1)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('changeTwoStepOption_ShouldReturnSuccess_ValidInputs', () => {
        return authorisedUtils.change2StepOptions(userId, 0)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('changeTwoStepOption_ShouldReturnError_InValidInputs', () => {
        return authorisedUtils.change2StepOptions(userId, 3)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('changeTwoStepOption_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.change2StepOptions(userId, null)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });



});

describe('get_user_info', () => {

    test('getUserInfo_ShouldReturnSuccess_ValidInputs', () => {
        return authorisedUtils.getUserDetails(userId)
            .then((result) => {
                expect(result).toHaveProperty('user_id', userId);
            });
    });

    test('getUserInfo_ShouldReturnError_InvalidInputs', () => {
        return authorisedUtils.getUserDetails(0)
            .catch((error) => {
                expect(error.message).toMatch('Invalid userId');
            });
    });

    test('getUserInfo_ShouldReturnError_MissingInputs', () => {
        return authorisedUtils.getUserDetails('')
            .catch((error) => {
                expect(error.message).toMatch('Invalid userId');
            });
    });

    test('getUserInfo_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.getUserDetails(null)
            .catch((error) => {
                expect(error.message).toMatch('Invalid userId');
            });
    });

});

describe('update_profile_details', () => {
    test('updateProfileDetails_ShouldReturnSuccess_ValidInputs', () => {
        var updateDetails =
        {
            "firstName": "TestUser",
            "lastName": "Socioboard",
            "DateOfBirth": "1992-04-17",
            "profilePicture": "http://shinobi-software.com/images/geek.png",
            "phoneCode": "+91",
            "phoneNumber": "9876543210",
            "aboutMe": "Hi, I'm test user."
        };
        return authorisedUtils.updateUserProfiles(userId, updateDetails)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });


    test('updateProfileDetails_ShouldReturnError_InvalidUserId', () => {
        var updateDetails =
        {
            "firstName": "TestUser",
            "lastName": "Socioboard",
            "DateOfBirth": "1992-04-17",
            "profilePicture": "http://shinobi-software.com/images/geek.png",
            "phoneCode": "+91",
            "phoneNumber": "9876543210",
            "aboutMe": "Hi, I'm test user."
        };
        return authorisedUtils.updateUserProfiles(0, updateDetails)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

    test('updateProfileDetails_ShouldReturnError_UnavailableUserId', () => {
        var updateDetails =
        {
            "firstName": "TestUser",
            "lastName": "Socioboard",
            "DateOfBirth": "1992-04-17",
            "profilePicture": "http://shinobi-software.com/images/geek.png",
            "phoneCode": "+91",
            "phoneNumber": "9876543210",
            "aboutMe": "Hi, I'm test user."
        };
        return authorisedUtils.updateUserProfiles(9999999, updateDetails)
            .catch((error) => {
                expect(error.message).toMatch('No user found!');
            });
    });


    test('updateProfileDetails_ShouldReturnError_InvalidInputs', () => {
        var updateDetails =
        {
            "firstName": "TestUser",
            "lastName": "Socioboard",
            "DateOfBirth": "1992-04-17",
            "profilePicture": "invalidurl",
            "phoneCode": "+91",
            "phoneNumber": "9876543210",
            "aboutMe": "Hi, I'm test user."
        };
        return authorisedUtils.updateUserProfiles(userId, updateDetails)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('updateProfileDetails_ShouldReturnError_NullInputs', () => {
        return authorisedUtils.updateUserProfiles(userId, null)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });

    test('updateProfileDetails_ShouldReturnError_MissingInputs', () => {
        return authorisedUtils.updateUserProfiles(userId, '')
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });



});