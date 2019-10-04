const moment = require('moment');
const schedule = require('node-schedule');
const AdminLibs = require('../../admin/utils/adminlibs');
const logger = require('../../../utils/logger');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

const adminLibs = new AdminLibs();

class AdminController {

    constructor() {
        this.saveMonthlyUserStats();
    }

    saveMonthlyUserStats() {
        logger.info("Cron setup intialized for monthly user stats...");
        schedule.scheduleJob('55 23 28 * *', function () {
            logger.info(`Cron started to save monthly user stats and started at ${moment()}`);

            return adminLibs.findTodayUserStats()
                .then(() => {
                    logger.info(`Cron save monthly user stats and finished at ${moment()}`);
                })
                .catch((error) => {
                    logger.info(`Cron process errored while save monthly user stats at ${moment()}`);
                });
        });
    }

    getAppUserStats(req, res) {
        return adminLibs.getAppUserInfo()
            .then((Response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_user_stats.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", data: Response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_user_stats_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getMonthlyUserStats(req, res) {
        return adminLibs.getMonthlyUserStats(req.query.month, req.query.year)
            .then((Response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_monthly_user_stats.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", data: Response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_monthly_user_stats_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getUsers(req, res) {
        return adminLibs.getFilteredUsers(req.query.filterType, req.query.planId, req.query.paymentStatus, req.query.nameOrEmail, req.query.pageId)
            .then((fulldetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_users.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", userfullDetails: fulldetails });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_users_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getRecentSignup(req, res) {
        return adminLibs.getRecentSignup(req.query.filterType, req.query.startDate, req.query.endDate, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.recent_signup.replace('{{admin}}', req.body.userScopeName).replace('{{filter}}', req.query.filterType).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", count: response.count, accounts: response.accounts });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.recent_signup_failed.replace('{{admin}}', req.body.userScopeName).replace('{{filter}}', req.query.filterType).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getUserPaymentHistory(req, res) {
        return adminLibs.getUserPaymentHistory(req.query.userId)
            .then((fulldetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.user_payment_hystory.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", paymentDetails: fulldetails });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.user_payment_hystory_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    updateUserlock(req, res) {
        return adminLibs.updateUserlock(req.query.userId, req.query.options)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_user_lock.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_user_lock_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    updatePlanForTrail(req, res) {
        return adminLibs.updatePlanForTrail(req.query.userId, req.query.planId, req.query.dayCount)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_plan_for_trail.replace('{{admin}}', req.body.userScopeName).replace('{{planId}}', req.query.planId).replace('{{user}}', req.query.userId).replace('{{days}}', req.query.dayCount).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_plan_for_trail_failed.replace('{{admin}}', req.body.userScopeName).replace('{{planId}}', req.query.planId).replace('{{user}}', req.query.userId).replace('{{days}}', req.query.dayCount).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    updateTwoStepOptions(req, res) {
        return adminLibs.updateTwoStepOptions(req.query.userId, req.query.options)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_two_step.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{value}}', req.query.options == Number(1) ? "activate" : "deactivate").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_two_step_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.userId).replace('{{value}}', req.query.options == Number(1) ? "activate" : "deactivate").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getPackages(req, res) {
        return adminLibs.getPackages()
            .then((packages) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_packages.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", packages: packages });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_packages_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    addPackage(req, res) {
        return adminLibs.addPackage(req.body)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.add_packages.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: "Package successfully created", packageInfo: result });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.add_packages_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    editPackage(req, res) {
        return adminLibs.editPackage(req.body.package, req.query.planId)
            .then((packageDetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.edit_packages.replace('{{admin}}', req.body.userScopeName).replace('{{package}}', req.query.planId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', packageDetails: packageDetails });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.edit_packages_failed.replace('{{admin}}', req.body.userScopeName).replace('{{package}}', req.query.planId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error });
            });
    }

    updatePackageActivations(req, res) {
        return adminLibs.updatePackageActivations(req.query.planId, req.query.options)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_package_activation.replace('{{admin}}', req.body.userScopeName).replace('{{package}}', req.query.planId).replace('{{value}}', req.query.options == Number(1) ? "activate" : "deactivate").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.update_package_activation_failed.replace('{{admin}}', req.body.userScopeName).replace('{{package}}', req.query.planId).replace('{{value}}', req.query.options == Number(1) ? "activate" : "deactivate").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    createCoupon(req, res) {
        return adminLibs.createCoupon(req.body.userScopeId, req.body.CouponInfo)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.create_coupons.replace('{{admin}}', req.body.userScopeName).replace('{{coupon}}', req.body.CouponInfo.coupon_code).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.create_coupons_failed.replace('{{admin}}', req.body.userScopeName).replace('{{coupon}}', req.body.CouponInfo.coupon_code).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    changeCouponStatus(req, res) {
        return adminLibs.changeCouponStatus(req.query.couponCode, req.query.status)
            .then((couponDetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.change_coupon_status.replace('{{admin}}', req.body.userScopeName).replace('{{coupon}}', req.query.couponCode).replace('{{status}}', req.query.status == 0 ? "deactive" : "active").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', couponDetails: couponDetails });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.change_coupon_status_failed.replace('{{admin}}', req.body.userScopeName).replace('{{coupon}}', req.query.couponCode).replace('{{status}}', req.query.status == 0 ? "deactive" : "active").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getCoupons(req, res) {
        return adminLibs.getCoupons()
            .then((coupons) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_coupons.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", coupons: coupons });
            }).catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_coupons_failed.replace('{{admin}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getCouponInfo(req, res) {
        return adminLibs.getCouponInfo(req.query.user)
            .then((user) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_user_applied_coupons.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.user).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", user: user.length > 0 ? user : [] });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_user_applied_coupons_failed.replace('{{admin}}', req.body.userScopeName).replace('{{user}}', req.query.user).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getUnverifiedPayments(req, res) {
        return adminLibs.getUnverifiedPayments(req.query.paymentMode)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_unverified_payments.replace('{{admin}}', req.body.userScopeName).replace('{{type}}', req.query.paymentMode).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", data: result.length > 0 ? result : [] });
            })
            .catch((error) => {

                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.get_unverified_payments_failed.replace('{{admin}}', req.body.userScopeName).replace('{{type}}', req.query.paymentMode).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    verifyPayment(req, res) {
        return adminLibs.verifyPayment(req.query.paymentId, req.body.userScopeName)
            .then((result) => {

                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.verify_payment.replace('{{admin}}', req.body.userScopeName).replace('{{payment}}', req.query.paymentId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", data: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Admin,
                    label: configruation.user_service_events.admin_event_lable.verify_payment_failed.replace('{{admin}}', req.body.userScopeName).replace('{{payment}}', req.query.paymentId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}

module.exports = new AdminController();
