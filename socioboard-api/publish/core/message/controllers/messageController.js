const MessageLibs = require('../utils/messagelibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

var helper = {};

helper.twitterDirectMessage = function (req, res) {
    var messagelibs = new MessageLibs();
    return messagelibs.twitterDirectMessage(req.body)
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Message,
                label: configruation.publiser_service_events.message_event_label.twitter_message_sending.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json(response);
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.publiser_service_events.event_action.Message,
                label: configruation.publiser_service_events.message_event_label.twitter_message_sending_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
            });
            res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
};

module.exports = helper;