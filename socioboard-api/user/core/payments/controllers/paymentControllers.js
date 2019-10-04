const PaymentLibs = require('../utils/paymentlibs');
const config = require('config');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
const configruation = require('../../../config/configuration');
const paymentLibs = new PaymentLibs();

class PaymentController {

    getPaymentRedirectUrl(req, res) {
        return paymentLibs.getPaymentRedirectUrl(req.body.userScopeId, req.body.userScopeName, req.query.newPlanId, req.query.paymentMode, req.query.couponCode)
            .then((redirectUrl) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.fetch_payment_redirect_url.replace('{{user}}', req.body.userScopeName).replace('{{plan}}', req.query.newPlanId).replace('{{mode}}', req.query.paymentMode == 1 ? "payUMoney" : "payPal").replace('{{coupon}}', req.query.couponCode).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', redirectUrl: redirectUrl });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.fetch_payment_redirect_url_failed.replace('{{user}}', req.body.userScopeName).replace('{{plan}}', req.query.newPlanId).replace('{{mode}}', req.query.paymentMode == 1 ? "payUMoney" : "payPal").replace('{{coupon}}', req.query.couponCode).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    paypalPaymentSuccess(req, res) {
        return paymentLibs.paypalPaymentSuccess(req.body.userScopeId, req.query.token, req.query.payerId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.payment_success.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.payment_failed.replace('{{user}}', req.body.userScopeName).replace('{{mode}}', "payPal").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }


    payUMoneyPaymentSuccess(req, res) {
        return paymentLibs.payUMoneyPaymentSuccess(req.body.userScopeId, req.body.PaymentDetails)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.payment_success.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.payment_failed.replace('{{user}}', req.body.userScopeName).replace('{{mode}}', "payUMoney").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    getMyLastPaymentInfo(req, res) {
        return paymentLibs.getMyLastPaymentInfo(req.body.userScopeId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_last_payment_info.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_last_payment_info_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    getFullPaymentHistory(req, res) {
        return paymentLibs.getFullPaymentHistory(req.body.userScopeId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_full_payment_history.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', data: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_full_payment_history_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    paymentInvoiceDownloader(req, res) {
        return paymentLibs.paymentInvoiceDownloader(req.body.userScopeId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_payment_invoice.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', data: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Payment,
                    label: configruation.user_service_events.payment_event_label.get_payment_invoice_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: 'failed', error: error.message });
            });
    }

    paypalNotify(req, res) {
        res.status(200).json({ code: 200, status: 'success', message: "Paypal Notify Status " });
    }

}

module.exports = new PaymentController();