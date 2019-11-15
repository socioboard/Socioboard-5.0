const moment = require('moment');
const config = require('config');
const requestHttp = require('request');
const querystring = require('querystring');

const UnauthorizedLibs = require('../utils/unauthorizedlibs');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const AuthorizeServices = require('../../../../library/utility/authorizeServices');

const Google = require('../../../../library/network/google');
const logger = require('../../../utils/logger');

const analyticsServices = new AnalyticsServices(config.get('analytics'));
const authorizeServices = new AuthorizeServices(config.get('authorize'));
const googleConnect = new Google(config.get('google_api'));
const unauthorizedLibs = new UnauthorizedLibs();

class UserControllers {

    checkUserNameAvailability(req, res) {

        return unauthorizedLibs.checkUserNameAvailability(req.query.userName)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: configruation.user_service_events.anonymous,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.user_name_avialable
                });
                res.status(200).json({ code: 200, status: "success", message: "Username not yet registered!" });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: configruation.user_service_events.anonymous,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.user_name_avialable_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    checkEmailAvailability(req, res) {
        if (!req.query.email || !req.query.email.includes('@') || !req.query.email.includes('.')) {
            res.status(200).json({ code: 400, status: "failed", error: "Invalid email format." });
        } else {

            return unauthorizedLibs.checkEmailAvailability(req.query.email)
                .then((result) => {
                    analyticsServices.registerEvents({
                        category: configruation.user_service_events.anonymous,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.user_email_avialable
                    });
                    res.status(200).json({ code: 200, status: "success", message: "Email not yet registered!" });
                }).catch((error) => {
                    analyticsServices.registerEvents({
                        category: configruation.user_service_events.anonymous,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.user_email_avialable_failed
                    });
                    res.status(200).json({ code: 400, status: "failed", error: error.message });
                });
        }
    }

    register(req, res) {
        var requestBody = req.body;
        return unauthorizedLibs.isUserRegister(requestBody.user.userName, requestBody.user.email)
            .then((result) => {
                if (result.status == 'registered')
                    throw new Error("User has already register!");
                else {
                    if (!requestBody.user.profilePicture || requestBody.user.profilePicture == '') {
                        requestBody.user.profilePicture = `${config.get("user_socioboard.host_url")}${config.get('profile_url_assert')}`;
                        requestBody.user.profilePicture = requestBody.user.profilePicture.replace("http", "https");
                        logger.info(requestBody.user.profilePicture);
                    }
                    requestBody.user.isAdminUser = false;
                    requestBody.rewards = {
                        eWalletValue: 0,
                        isAdsEnabled: false,
                        referedBy: "NA",
                        referalStatus: false
                    };
                    requestBody.activations = {
                        activationStatus: 0,
                        paymentStatus: 0,
                        IsTwoStepVerify: false,
                        signupType: 0,
                        userPlan: config.get('user_base_plan'),
                        expireDate: moment.utc().add(1, 'months')
                    };
                    return unauthorizedLibs.createUser(requestBody);
                }
            })
            .then((result) => {
                if (result) {
                    return unauthorizedLibs.getUserDetails(result.userId)
                        .then((info) => {
                            if ((config.get('mail_services_environments').includes(process.env.NODE_ENV)) && info.Activations.signup_type == 0) {
                                return unauthorizedLibs.sendActivationMail(info)
                                    .then(() => { return "User has been registered,and please activate your email!"; })
                                    .catch((error) => { throw error; });
                            }
                            else {
                                var activationLink = `${config.get('user_socioboard.host_url')}/v1/verifyEmail?email=${info.email}&activationToken=${info.Activations.email_validate_token}`;
                                return `User has been registered, email activation link- ${activationLink}`;
                            }
                        })
                        .catch((error) => {
                            throw error;
                        });
                } else
                    throw new Error("Cant able to create a user!");
            })
            .then((message) => {
                analyticsServices.registerEvents({
                    category: requestBody.user.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.register
                });
                res.status(200).json({ code: 200, status: "success", message: message });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: requestBody.user.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.register_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    socialLogin(req, res) {
        var redirectUrl = '';
        if (req.query.network === "facebook") {
            redirectUrl = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('facebook_api.redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get('facebook_api.login_scopes')}`;
            res.status(200).json({ code: 200, status: "success", message: "Navigated to facebook.", navigateUrl: redirectUrl });
        }
        else if (req.query.network === "google") {
            redirectUrl = googleConnect.getGoogleAuthUrl("login", "");
            res.status(200).json({ code: 200, status: "success", message: "Navigated to google.", navigateUrl: redirectUrl });
        }
        else {
            res.status(200).json({ code: 400, status: "failed", error: `${config.get("applicationName")} supports either facebook or google.` });
        }
    }

    facebookCallback(req, res) {
        if (!req.query.code) {
            analyticsServices.registerEvents({
                category: configruation.user_service_events.anonymous,
                action: configruation.user_service_events.event_action.Open,
                label: configruation.user_service_events.unauthorized_event_label.facebook_login_failed
            });
            res.status(200).json({ code: 403, status: "failed", message: "Can't able to get facebook response code!" });
        }
        else {
            return unauthorizedLibs.facebookSocialLogin(req.query.code)
                .then((result) => {
                    analyticsServices.registerEvents({
                        category: result.user.email,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.facebook_login
                    });
                    res.status(200).json({ code: 200, status: "success", user: result.user, accessToken: result.accessToken });
                })
                .catch((error) => {
                    analyticsServices.registerEvents({
                        category: configruation.user_service_events.anonymous,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.facebook_login_failed
                    });
                    logger.info(error);
                    res.status(200).json({ code: 400, status: "failed", message: error.message });
                });
        }
    }

    googleCallback(req, res) {
        if (!req.query.code) {
            analyticsServices.registerEvents({
                category: configruation.user_service_events.anonymous,
                action: configruation.user_service_events.event_action.Open,
                label: configruation.user_service_events.unauthorized_event_label.google_login_failed
            });
            res.status(200).json({ code: 403, status: "failed", message: "Can't able to get google response code!" });
        }
        else {

            return unauthorizedLibs.googleSocialLogin(req.query.code)
                .then((result) => {
                    analyticsServices.registerEvents({
                        category: result.user.email,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.google_login
                    });
                    res.status(200).json({ code: 200, status: "success", user: result.user, accessToken: result.accessToken });
                })
                .catch((error) => {
                    analyticsServices.registerEvents({
                        category: configruation.user_service_events.anonymous,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.google_login_failed
                    });
                    res.status(200).json({ code: 400, status: "failed", message: error });
                });
        }
    }

    login(req, res) {

        var result = {};
        var fetchedUserId = null;
        var fetchedEmail = null;
        var twostepValue = null;
        return unauthorizedLibs.appLogin(req.body.user, req.body.password)
            .then((user) => {
                logger.info(JSON.stringify(user));
                if (user) {
                    fetchedUserId = user.user_id ? user.user_id : null;
                    fetchedEmail = user.email ? user.email : null;
                }
                if (!user) {
                    analyticsServices.registerEvents({
                        category: configruation.user_service_events.anonymous,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.wrong_creds,
                        value: req.body.user
                    });
                    result = { code: 400, status: 'failed', message: 'Wrong creds!' };
                    return result;
                }
                if (user.is_account_locked) {
                    result = { code: 400, status: 'failed', message: 'Account has been locked.' };
                    return result;
                }
                if (!user.Activations.activation_status) {
                    analyticsServices.registerEvents({
                        category: fetchedEmail,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.email_not_activated
                    });
                    result = { code: 400, status: 'failed', message: 'Email not yet validated.' };
                    return result;
                }
                if (user.Activations.activate_2step_verification) {
                    twostepValue = user.Activations.activate_2step_verification;
                    result = { code: 200, status: 'success', message: 'Two step login enabled.', isTwoStepEnabled: true };
                    return result;
                }
                var remindingDays = moment(user.Activations.account_expire_date).diff(moment(), 'days');
                if (remindingDays < 0) {
                    logger.info('Plan Expired');
                    analyticsServices.registerEvents({
                        category: fetchedEmail,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.plan_expired
                    });

                    return unauthorizedLibs.changeUserPlanAsBasic(fetchedUserId)
                        .then(() => {
                            result = { code: 200, status: 'success', message: 'Plan expired', isPlanExpired: true };
                            return result;
                        })
                        .catch((error) => {
                            logger.info(error.message);
                            throw error;
                        });
                }
            })
            .then(() => {
                logger.info('Fetching access token');
                if (result.status == 'failed') {
                    res.status(200).json(result);
                } else {
                    return unauthorizedLibs.getUserAccessToken(fetchedUserId)
                        .then((userInfo) => {
                            logger.info(`Fetched User : ${JSON.stringify(userInfo)}`);
                            if (result.isTwoStepEnabled) {
                                // create OTPtoken
                                // send mail
                                return unauthorizedLibs.getOTPToken(fetchedUserId)
                                    .then((OTPtoken) => {
                                        return unauthorizedLibs.sendOTP({ email: fetchedEmail, userId: fetchedUserId })
                                            .then((message) => {
                                                logger.info('2 step');
                                                analyticsServices.registerEvents({
                                                    category: fetchedEmail,
                                                    action: configruation.user_service_events.event_action.Open,
                                                    label: configruation.user_service_events.unauthorized_event_label.login_twostep_request
                                                });
                                                res.status(200).json({ code: 200, status: "success", isTwoStepEnabled: twostepValue, message: message, user: { user_id: fetchedUserId, email: fetchedEmail }, OTPToken: OTPtoken });
                                            })
                                            .catch((error) => {
                                                res.status(200).json({ code: 404, status: "failed", isTwoStepEnabled: twostepValue, error: error });
                                            })
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            } else {
                                logger.info('success');
                                analyticsServices.registerEvents({
                                    category: fetchedEmail,
                                    action: configruation.user_service_events.event_action.Open,
                                    label: configruation.user_service_events.unauthorized_event_label.login_success
                                });
                                res.status(200).json({ code: 200, status: "success", user: userInfo.user, accessToken: userInfo.accessToken });
                            }
                        })
                        .catch((error) => {
                            throw error;
                        });
                }
            })
            .catch((error) => {
                logger.error(error);
                analyticsServices.registerEvents({
                    category: configruation.user_service_events.anonymous,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.login_failed,
                    value: req.body.user
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    verifyEmail(req, res) {
        return unauthorizedLibs.verifyEmail(req.query.email, req.query.activationToken)
            .then((message) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.email_verified
                });
                if (process.env.NODE_ENV == "production")
                    res.redirect(config.get('live_url'));
                else if (process.env.NODE_ENV == "phpdev")
                    res.redirect(config.get('app_url'));
                else
                    res.status(200).json({ code: 200, status: "success", message: "Email Successfully verified" })
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.email_not_verified
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    resetPassword(req, res) {

        return unauthorizedLibs.resetPassword(req.query.email, req.query.newPassword)
            .then(function (messsage) {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.reset_password_success
                });
                res.status(200).json({ code: 200, status: "success", message: messsage });
            }).catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.reset_password_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    changePassword(req, res) {

        return unauthorizedLibs.changePassword(req.query.email, req.query.currentPassword, req.query.newPassword)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.change_password_success
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.change_password_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    forgotPassword(req, res) {

        return unauthorizedLibs.forgotPassword(req.query.email)
            .then(function (message) {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.forgot_password_request
                });
                res.status(200).json({ code: 200, status: "success", message: message });
            }).catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.forgot_password_token_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    verifyPasswordToken(req, res) {

        return unauthorizedLibs.verifyPasswordToken(req.query.email, req.query.activationToken)
            .then((message) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.forgot_password_token_verified
                });
                res.status(200).json({ code: 200, status: "success", message: message });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.forgot_password_token_failed
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    getActivationLink(req, res) {

        return unauthorizedLibs.getActivationLink(req.query.userEmail)
            .then((info) => {
                if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'apidevelopment') && info.Activations.signup_type == 0) {
                    return unauthorizedLibs.sendActivationMail(info)
                        .then(() => { return "User has been registered,and please activate your email!"; })
                        .catch((error) => { throw error; });
                }
                else {
                    var activationLink = `${config.get('user_socioboard.host_url')}/v1/verifyEmail?email=${info.email}&activationToken=${info.Activations.email_validate_token}`;
                    return `User has been registered, email activation link- ${activationLink}`;
                }
            })
            .then((message) => {
                analyticsServices.registerEvents({
                    category: req.query.userEmail,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.mail_activationLink_success
                });
                res.status(200).json({ code: 200, status: "success", message: message });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.userEmail,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.mail_activationLink_failed
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    twoStepLogin(req, res) {
        var account_kit_api_version = `${config.get('facebook_api.account_kit_version')}`;
        var app_id = `${config.get('facebook_api.app_id')}`;
        var csrf_guid = req.query.csrf;

        var view = {
            appId: app_id,
            csrf: csrf_guid,
            version: account_kit_api_version,
        };
        res.status(200).json({ code: 200, status: "success", viewDetails: view });
    }

    twoStepLoginSuccess(request, response) {

        var app_secret = `${config.get('facebook_api.account_kit_app_secret')}`;
        var me_endpoint_base_url = `https://graph.accountkit.com/${config.get('facebook_api.account_kit_version')}/me`;
        var token_exchange_base_url = `https://graph.accountkit.com/${config.get('facebook_api.account_kit_version')}/access_token`;
        var app_id = `${config.get('facebook_api.app_id')}`;


        var csrfValue = JSON.parse(authorizeServices.decrypt(request.query.csrf));

        var app_access_token = ['AA', app_id, app_secret].join('|');

        var params = {
            grant_type: 'authorization_code',
            code: request.query.code,
            access_token: app_access_token
        };

        var token_exchange_url = token_exchange_base_url + '?' + querystring.stringify(params);

        // exchange tokens
        requestHttp.get({ url: token_exchange_url, json: true }, function (err, resp, respBody) {

            var view = {
                user_access_token: respBody.access_token,
                expires_at: respBody.expires_at,
                user_id: respBody.id,
            };

            // get account details at /me endpoint
            var me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token;

            requestHttp.get({ url: me_endpoint_url, json: true }, function (err, resp, respBody) {

                var isMatched = false;

                if (respBody.phone) {

                    view.phone_num = respBody.phone.national_number;

                    if (csrfValue.phone_no == view.phone_num) {
                        isMatched = true;
                    }
                } else if (respBody.email) {
                    view.email_addr = respBody.email.address;
                    if (csrfValue.email == view.email_addr) {
                        isMatched = true;
                    }
                }

                if (isMatched) {
                    analyticsServices.registerEvents({
                        category: csrfValue.email,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.two_step_login_success
                    });
                    res.status(200).json({ code: 400, status: "failed", error: error });

                    var accessToken = authorizeServices.createToken(csrfValue);
                    response.status(200).json({ code: 200, status: "success", accessToken: accessToken, userDetails: csrfValue });
                }
                else {
                    analyticsServices.registerEvents({
                        category: csrfValue.email,
                        action: configruation.user_service_events.event_action.Open,
                        label: configruation.user_service_events.unauthorized_event_label.two_step_login_failed
                    });
                    res.status(200).json({ code: 400, status: "failed", error: error.message });
                    response.status(200).json({ code: 403, status: "failed", message: "Verified Accounts are not matched!" });
                }
            });
        });
    }

    twoStepLoginValidate(req, res) {
        return unauthorizedLibs.twoStepLoginValidate(req.query.email, req.query.emailtoken, req.query.mobiletoken)
            .then((userInfo) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.two_way_auth
                });
                res.status(200).json({ code: 200, status: "success", user: userInfo.user, accessToken: userInfo.accessToken });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.email,
                    action: configruation.user_service_events.event_action.Open,
                    label: configruation.user_service_events.unauthorized_event_label.two_way_auth_failed
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    paypalSuccess(req, res) {
        res.status(200).json({ code: 200, status: 'success', message: "Paypal Success Status " });
    }

    payuMoneySuccess(req, res) {
        res.status(200).json({ code: 200, status: 'success', message: req.body });
    }
}

module.exports = new UserControllers();
