const UnauthorizedLibs = require('../../core/unauthorized/utils/unauthorizedlibs');
const logger = require('../../utils/logger');
const unauthorizedLibs = new UnauthorizedLibs();

describe('plan', () => {
    beforeAll(() => {
        require('../../../library/node_modules/iconv-lite').encodingExists('foo');
    });

    test('getPlanDetails_ShouldReturnSuccess_BasicPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(0)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 0);
            });
    });

    test('getPlanDetails_ShouldReturnSuccess_StandardPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(1)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 1);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_PremiumPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(2)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 2);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_DeluxePlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(3)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 3);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_TopazPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(4)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 4);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_RubyPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(5)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 5);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_GoldPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(6)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 6);
            });
    });
    test('getPlanDetails_ShouldReturnSuccess_PlatiumPlan', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(7)
            .then((result) => {
                expect(result).toHaveProperty('plan_id', 7);
            });
    });
    test('getPlanDetails_ShouldReturnError_InvalidPlanId', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(null)
            .catch((result) => {
                expect(result).toHaveProperty('error');
            });
    });
    test('getPlanDetails_ShouldReturnError_NonMatchedPlans', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.getPlanDetails(-1)
            .catch((result) => {
                expect(result).toHaveProperty('error');
            });
    });
});

describe('user_name_availability', () => {
    test('userNameAvailability_ShouldReturnSuccess_ValidInputs', () => {
        var userName = "unregister";
        return unauthorizedLibs.checkUserNameAvailability(userName)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });
    test('userNameAvailability_ShouldReturnError_AlreadyExistingUserName', () => {
        var userName = "socioboard-admin";
        return unauthorizedLibs.checkUserNameAvailability(userName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('userNameAvailability_ShouldReturnError_MissingInputs', () => {
        return unauthorizedLibs.checkUserNameAvailability('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('register', () => {
    beforeAll(() => {
        require('../../../library/node_modules/iconv-lite').encodingExists('foo');
    });
    test('isUserRegister_ShouldReturnSuccess_ValidUserId', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        //                                    // username          //email
        return unauthorizedLibs.isUserRegister('socioboard-user', 'testuser@socioboard.com')
            .then((result) => {
                expect(result).toHaveProperty('status', 'registered');
            });
    });

    test('isUserRegister_ShouldReturnError_NonMatchedUsers', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        //                                       // username          //email
        return unauthorizedLibs.isUserRegister('unregister', 'unregisterUser@socioboard.com')
            .then((result) => {
                expect(result).toHaveProperty('status', 'notRegistered');
            });
    });

    test('isUserRegister_ShouldReturnError_NonMatchedUsers', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.isUserRegister(null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('createUser_ShouldReturnError_InvalidInputs', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        var userInformations = {
            "user": {
                "userName": "socioboard-user",
                "email": "testuser@socioboard.com",
                "password": "test",
                "firstName": "test",
                "lastName": "string",
                "dateOfBirth": "2019-04-12",
                "profilePicture": "www.sr.com",
                "phoneCode": "string",
                "phoneNo": "0123456",
                "country": "string",
                "timeZone": "string",
                "aboutMe": "string",
                "isAdminUser": true
            },
            "rewards": {
                "eWalletValue": 0,
                "isAdsEnabled": false,
                "referedBy": "string",
                "referalStatus": false
            },
            "activations": {
                "activationStatus": 0,
                "paymentType": 0,
                "paymentStatus": 0,
                "IsTwoStepVerify": false,
                "signupType": 0,
                "userPlan": 0,
                "expireDate": "2019-04-12T12:07:31.777Z"
            }
        };

        return unauthorizedLibs.createUser(userInformations)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('createUser_ShouldReturnSuccess_ValidInputs', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        var userInformations = {
            "user": {
                "userName": "expiredUser",
                "email": "expiredUser@socioboard.com",
                "password": "expiredUser",
                "firstName": "expiredUser",
                "lastName": "string",
                "dateOfBirth": "2019-04-12",
                "profilePicture": "www.string.com",
                "phoneCode": "string",
                "phoneNo": "123456789",
                "country": "string",
                "timeZone": "string",
                "aboutMe": "string",
                "isAdminUser": true
            },
            "rewards": {
                "eWalletValue": 0,
                "isAdsEnabled": false,
                "referedBy": "string",
                "referalStatus": false
            },
            "activations": {
                "activationStatus": 0,
                "paymentType": 0,
                "paymentStatus": 0,
                "IsTwoStepVerify": false,
                "signupType": 1,
                "userPlan": 0,
                "expireDate": "2019-04-12T12:07:31.777Z"
            }
        };
        return unauthorizedLibs.createUser(userInformations)
            .then((userInfo) => {
                expect(userInfo).not.toHaveProperty('message');
            });
    });

    test('getUserDetails_ShouldReturnSuccess_ValidUserId', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        // passing getUserDetails parameter should be present in the database
        return unauthorizedLibs.getUserDetails(2)
            .then((result) => {
                expect(result).toHaveProperty('user_id');
            });
    });

    test('getUserDetails_ShouldReturnError_NonMatchedUserId', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        // passing getUserDetails parameter should not be present in the database
        return unauthorizedLibs.getUserDetails(0)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('sendActivationMail_ShouldReturnSuccess_ValidUserId', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        // passing getUserDetails parameter should be present in the database
        return unauthorizedLibs.getUserDetails(1)
            .then((userDetails) => {
                return unauthorizedLibs.sendActivationMail(userDetails);
            })
            .then((result) => {
                expect(result).toHaveProperty('status');
            });
    });

    test('sendActivationMail_ShouldReturnError_NullAsAParameter', () => {
        var unauthorizedLibs = new UnauthorizedLibs();
        return unauthorizedLibs.sendActivationMail(null)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('get_activation_link', () => {

    test('getActivationLink_ShouldReturnSuccess_ValidUser', () => {
        var email = 'expiredUser@socioboard.com';
        return unauthorizedLibs.getActivationLink(email)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getActivationLink_ShouldReturnError_AlreadyActivated', () => {
        var email = 'testuser@socioboard.com';
        return unauthorizedLibs.getActivationLink(email)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('getActivationLink_ShouldReturnError_InvalidInputs', () => {
        var email = 'unregisterUser@socioboard.com';
        return unauthorizedLibs.getActivationLink(email)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getActivationLink_ShouldReturnError_MissingInputs', () => {
        return unauthorizedLibs.getActivationLink('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('login', () => {

    test('applogin_ShouldReturnSuccess_ValidUser', () => {
        return unauthorizedLibs.appLogin('testuser@socioboard.com', 'user')
            .then((result) => {
                expect(result).toHaveProperty('user_id');
            });
    });

    test('applogin_ShouldReturnError_InvalidUserCreds', () => {
        return unauthorizedLibs.appLogin('unregisterUser@socioboard.com', 'test')
            .catch((error) => {
                expect(error).toHaveProperty('error');
            });
    });

    test('applogin_ShouldReturnError_MissingInputs', () => {
        return unauthorizedLibs.appLogin('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('verify_email', () => {

    test('verifyEmail_ShouldReturnError_InvalidActivationToken', () => {
        var token = '-b8d4-a3f9b89cf4bc';
        var email = 'unverified@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .then((result) => {
                expect(result).toEqual('Invalid verification token!');
            });
    });

    test('verifyEmail_shouldReturnSuccess_ValidInput', () => {
        var token = '05739305-8ef8-4cdc-880e-0771a429597d';
        var email = 'unverified@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .then((result) => {
                expect(result).toEqual('success');
            });
    });

    test('verifyEmail_ShouldReturnError_AlreadyVerifiedUser', () => {
        var token = '24d63085-44ea-46cb-9b6f-bbf881abca18';
        var email = 'testuser@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .catch((error) => {
                expect(error).toMatch('success');
            });
    });

    test('verifyEmail_ShouldReturnError_NonRegisteredUser', () => {
        var token = 'aa207740-602d-11e9-b8d4-a3f9b89cf4bc';
        var email = 'notregiester@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('verifyEmail_ShouldReturnError_NoNeedForSocialLoginAccounts', () => {
        var token = 'bf2fcd9c-c9a4-40db-94e2-671d6d1a8c06';
        var email = 'expiredUser@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .then((result) => {
                expect(result).toMatch(new RegExp(`${email} isn't signup manually!`));
            });
    });

    test('verifyEmail_ShouldReturnError_TokenExpired', () => {
        var token = '7485d2fa-2f67-4ecd-b2f0-31dcb2e75066';
        var email = 'tokenexpired@socioboard.com';
        return unauthorizedLibs.verifyEmail(email, token)
            .then((result) => {
                expect(result).toMatch(/Token expired/);
            });
    });
});

describe('social_login', () => {

    test('facebookLogin_ShouldReturnError_NoCode', () => {
        var code = '';
        return unauthorizedLibs.facebookSocialLogin(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('googleLogin_ShouldReturnError_NoCode', () => {
        var code = '';
        return unauthorizedLibs.googleSocialLogin(code)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    // we need response code for success state
    // test('facebookLogin_shouldReturn_sucessMessageForCode', () => {
    //     var code = 'AQBPChTlqrm1915bBemTGB89JFJCS1XoC-kOTgHogW8-AujyFHBj_sB7gB06JxI_2q9zWyAh1yZtucgJv4mSe5tJ2ngpaBJRUZhx1c6vUonax_smxQ3cPg6azYtBXIOSfvzTZVf3qr01ibaY9FyUi1rstrwAHIsYXcyggsn57CS1Ct70OGmDxqs6b24hFvdnRbSNjD97xp2J39xkzZKTYxVtyx8qGgD8zvaHFbfk7EPW0-lyiYnRifgVoKcBrDdtAw8AA_VmUXmVCCgNPX293TWmJAnefkbKlPLYmjtEyRdZhS0lzQjvhbC0Thazx-2n2f_aHG0waaQr6vPw7iYP7RXQ#_=_';
    //     return unauthorizedLibs.facebookSocialLogin(code)
    //         .catch((error) => {
    //             expect(error).toHaveProperty('user_id');
    //         });
    // });
    // 
    // test('googleLogin_shouldReturn_sucessMessageForCode', () => {
    //     var code = '4%2FLgESw_KQkmUZfPURyiaBq0GQH7HvJrfOMohI43xmVvw259pDoVQ_7aox8igsIKMSuqp6if_FmRVwCbGHaAM9Gpo';
    //     return unauthorizedLibs.facebookSocialLogin(code)
    //         .catch((error) => {
    //             expect(error).toHaveProperty('user_id');
    //         });
    // });

});

describe('forgot_password', () => {
    test('forgotPassword_ShouldReturnSuccess_ValidEmail', () => {
        var email = 'testuser@socioboard.com';
        return unauthorizedLibs.forgotPassword(email)
            .then((result) => {
                expect(result).toMatch(new RegExp('Success! Please check your email.*'));
            });
    });

    test('forgotPassword_ShouldReturnError_InValidEmail', () => {
        var email = 'unregisterUser@socioboard.com';
        return unauthorizedLibs.forgotPassword(email)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('verify_password_token', () => {

    test('verifyPasswordToken_ShouldReturnSuccess_ValidInputs', () => {
        var email = 'unverified@socioboard.com';
        var token = '75b23070-19a8-4602-a9c2-55acb3b42721';
        return unauthorizedLibs.verifyPasswordToken(email, token)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('verifyPasswordToken_ShouldReturnError_InvalidInputs', () => {
        var email = 'unregisterUser@socioboard.com';
        var token = '4c56e4c0-603f-11e9-86ec-f74415bbc418';
        return unauthorizedLibs.verifyPasswordToken(email, token)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('verifyPasswordToken_ShouldReturnError_InvalidInputs', () => {
        var email = 'testuser@socioboard.com';
        var token = '';
        return unauthorizedLibs.verifyPasswordToken(email, token)
            .catch((error) => {
                expect(error).toHaveProperty('message');

            });
    });

    test('verifyPasswordToken_ShouldReturnError_MissingInputs', () => {
        return unauthorizedLibs.verifyPasswordToken('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('verifyPasswordToken_ShouldReturnError_TokenExpired', () => {
        var token = '7d65f66e-1d32-410a-bd3f-5075f8287236';
        var email = 'tokenExpired@socioboard.com';
        return unauthorizedLibs.verifyPasswordToken(email, token)
            .then((result) => {
                expect(result).toMatch(/Token expired/);
            });
    });
});

describe('reset_password', () => {
    test('resetPassword_ShouldReturnSuccess_ValidUser', () => {
        var email = 'testuser@socioboard.com';
        var newPassword = 'user';
        return unauthorizedLibs.resetPassword(email, newPassword)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('resetPassword_ShouldReturnError_InvalidEmail', () => {
        var email = 'unregisterUser@socioboard.com';
        var newPassword = 'test';
        return unauthorizedLibs.resetPassword(email, newPassword)
            .catch((error) => {
                expect(error.message).toMatch('Sorry! Email not registered.');
            });
    });

    test('resetPassword_ShouldReturnError_MissingPassword', () => {
        var email = 'unregisterUser@socioboard.com';
        var newPassword = '';
        return unauthorizedLibs.resetPassword(email, newPassword)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('resetPassword_ShouldReturnError_MissingInputs', () => {
        var email = '';
        var newPassword = '';
        return unauthorizedLibs.resetPassword(email, newPassword)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});