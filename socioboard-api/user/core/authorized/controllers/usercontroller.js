const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsSevices = require('../../../../library/utility/analyticsServices');

const GoogleHelper = require('../../../../library/network/google');
const googleHelper = new GoogleHelper(config.get('google_api'));
const analyticsServices = new AnalyticsSevices(config.get('analytics'));
const AuthorizedLibs = require('../utils/authorizedlibs');
const authorizedLibs = new AuthorizedLibs();

var userServices = {};

class AuthorizedUserController {


    changePassword(req, res) {

        return authorizedLibs.changePassword(req.body.userScopeId, req.query.currentPassword, req.query.newPassword)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_password.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: "Success!" });

            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_password_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: `Failed, ${error.message}` });
            });
    }

    getUserInfo(req, res) {

        return authorizedLibs.getUserAccessToken(req.body.userScopeId)
            .then(function (userInformation) {
                if (!userInformation) {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Users,
                        label: configruation.user_service_events.authorized_event_label.get_userData_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                    });
                    res.status(200).json({ code: 400, status: "failed", message: 'Something went wrong!' });
                }
                else {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Users,
                        label: configruation.user_service_events.authorized_event_label.get_userData_success.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                    });
                    res.status(200).json({ code: 200, status: "success", userDetails: userInformation.user, accessToken: userInformation.accessToken, maximumProfileCount: userInformation.user.userPlanDetails.account_count });
                }
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.get_userData_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", message: error.message });
            });
    }

    UpdateProfileDetails(req, res) {
        var requestBody = req.body;
        return authorizedLibs.updateUserProfiles(req.body.userScopeId, requestBody.user)
            .then((updatedData) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.update_profile.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });

                res.status(200).json({ code: 200, status: "success", user: updatedData.data, accessToken: updatedData.accessToken });

            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.update_profile_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    changePaymentType(req, res) {


        return authorizedLibs.changePaymentType(req.body.userScopeId, req.query.currentPaymentType, req.query.newPaymentType)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_payment_type.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.newPaymentType
                });
                res.status(200).json({ code: 200, status: "success", user: result.user, accessToken: result.accessToken });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_payment_type_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });

    }

    change2StepOptions(req, res) {

        return authorizedLibs.change2StepOptions(req.body.userScopeId, req.query.twoStepActivate)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_twostep.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.twoStepActivate
                });
                res.status(200).json({ code: 200, status: "success", messag: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_twostep_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    changePlan(req, res) {

        return authorizedLibs.changePlan(req.body.userScopeId, req.query.currentPlan, req.query.newPlan)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_plan.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.newPlan,
                });
                res.status(200).json({ code: 200, status: "success", userDetails: result.user, accessToken: result.accessToken, maximumProfileCount: result.user.userPlanDetails.account_count });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_plan_failed.replace('{{user}}', req.query.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    getShortenUrl(req, res) {
        if (!req.query.longurl) {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.user_service_events.event_action.Users,
                label: configruation.user_service_events.authorized_event_label.short_url_failed.replace("{{url}}", "Empty").replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: "Invalid Inputs" });
        } else {
            googleHelper.firebaseShortUrls(config.get('google_api.dynamic_link'), config.get('google_api.api_key'), req.query.longurl)
                .then((response) => {
                   if (response.error) {
                        analyticsServices.registerEvents({
                            category: req.body.userScopeEmail,
                            action: configruation.user_service_events.event_action.Users,
                            label: configruation.user_service_events.authorized_event_label.short_url_failed.replace("{{url}}", req.query.longurl).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                        });
                        res.status(200).json({ code: 400, status: "failed", error: response.error.message });
                    } else if (response.warning) {
                        analyticsServices.registerEvents({
                            category: req.body.userScopeEmail,
                            action: configruation.user_service_events.event_action.Users,
                            label: configruation.user_service_events.authorized_event_label.short_url_failed.replace("{{url}}", req.query.longurl).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                        });
                        res.status(200).json({ code: 400, status: "failed", error: "Not able to short it." });
                    } else {
                        analyticsServices.registerEvents({
                            category: req.body.userScopeEmail,
                            action: configruation.user_service_events.event_action.Users,
                            label: configruation.user_service_events.authorized_event_label.short_url.replace("{{url}}", req.query.longurl).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                        });
                        res.status(200).json({ code: 200, status: "success", message: response });
                    }
                })
                .catch((error) => {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Users,
                        label: configruation.user_service_events.authorized_event_label.short_url_failed.replace("{{url}}", req.query.longurl).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                    });
                    res.status(200).json({ code: 400, status: "failed", error: error.message });
                });
        }
    }

    changeShortenStatus(req, res) {
        return authorizedLibs.changeShortenStatus(req.body.userScopeId, req.query.status)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_shorten_status.replace('{{user}}', req.query.userScopeName).replace('{{status}}', req.query.status == 1 ? "Active" : "De-Active").replace('{{id}}', req.body.userScopeId),
                    value: req.query.twoStepActivate
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Users,
                    label: configruation.user_service_events.authorized_event_label.change_shorten_status_failed.replace('{{user}}', req.query.userScopeName).replace('{{status}}', req.query.status == 1 ? "Active" : "De-Active").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

}



module.exports = new AuthorizedUserController();
