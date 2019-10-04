const config = require('config');
const fbWebhooks = require('../facebookhooks');
const youtubeWebhooks = require('../youtubehooks');
const twitterWebhooks = require('../twitterhooks');
const instagramWebhooks = require('../instagramhooks');
const schedule = require('node-schedule');
const moment = require('moment');
const crypto = require('crypto');
const requestPromise = require('request-promise');

const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
const logger = require('../../../utils/logger');

var helper = {};

function scheduleParseWebhook(receivedObjet) {
    logger.info(`Process Started and received object ${JSON.stringify(receivedObjet)}`);
    var scheduleDate = moment().add(1, 'seconds');
    var batchId = String(moment().unix());
    var time = new Date(scheduleDate);
    schedule.scheduleJob(batchId, time, function (receivedObjet) {
        switch (receivedObjet.network) {
            case 'facebook':
                fbWebhooks.webhookEvents(receivedObjet);
                break;
            case 'youtube':
                youtubeWebhooks.webhookEvents(receivedObjet);
                break;
            case 'twitter':
                twitterWebhooks.webhookEvents(receivedObjet);
                break;
            default:
                break;
        }
    }.bind(null, receivedObjet));
}

helper.fbWebhookValidation = function (req, res) {
    if (
        req.query["hub.mode"] == 'subscribe' &&
        req.query["hub.verify_token"] == config.get('facebook_api.webhook_token')
    ) {
        logger.info('Facebook Webhook Validated..');
        res.send(req.query["hub.challenge"]);
    } else {
        res.sendStatus(400);
    }
};

helper.fbWebhookEvents = function (req, res) {
    if (!req.isXHubValid()) {
        logger.info('Warning - request header X-Hub-Signature not present or invalid');
        res.sendStatus(401);
        return;
    }
    res.sendStatus(200);
    fbWebhooks.webhookEvents(req.body);
};


helper.instaWebhookValidation = function (req, res) {
    if (
        req.query["hub.mode"] == 'subscribe' &&
        req.query["hub.verify_token"] == config.get('instagram.webhook_token')
    ) {
        logger.info('Instagram Webhook Validated..');
        res.send(req.query["hub.challenge"]);
    } else {
        res.sendStatus(400);
    }
};

helper.instaWebhookEvents = function (req, res) {
    if (!req.isXHubValid()) {
        logger.info('Warning - request header X-Hub-Signature not present or invalid');
        res.sendStatus(401);
        return;
    }
    res.sendStatus(200);
    instagramWebhooks.webhookEvents(req.body);
};


helper.startTwitterWebhook = function (req, res) {
    var twitterOauth = {
        consumer_key: config.get('twitter_api.api_key'),
        consumer_secret: config.get('twitter_api.secret_key'),
        token: config.get('twitter_api.access_token'),
        token_secret: config.get('twitter_api.access_token_secret')
    };

    var request_options = {
        url: `https://api.twitter.com/1.1/account_activity/all/${config.get('twitter_api.webhook_environment')}/webhooks.json`,
        oauth: twitterOauth,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            url: config.get('twitter_api.webhook_url')
        }
    };

    // POST request to create webhook config
    requestPromise.post(request_options)
        .then(function (body) {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_webhooks_start.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: 200, message: body });
        })
        .catch(function (error) {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_webhooks_start_failed.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: 200, message: error.message });
        });
};

helper.stopTwitterWebhook = function (req, res) {
    var twitterOauth = {
        consumer_key: config.get('twitter_api.api_key'),
        consumer_secret: config.get('twitter_api.secret_key'),
        token: config.get('twitter_api.access_token'),
        token_secret: config.get('twitter_api.access_token_secret')
    };
    var request_options = {
        url: `https://api.twitter.com/1.1/account_activity/all/${config.get('twitter_api.webhook_environment')}/webhooks.json`,
        oauth: twitterOauth,
    };

    requestPromise.get(request_options)
        .then(function (body) {
            var webhook_id = JSON.parse(body)[0].id;
            logger.info('Deleting webhook config:', webhook_id);
            request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.get('twitter_api.webhook_environment')}/webhooks/${webhook_id}.json`,
                oauth: twitterOauth,
                resolveWithFullResponse: true
            };
            return requestPromise.delete(request_options);
        })
        .then(function (response) {
            if (response.statusCode == 204) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.AdminWebhooks,
                    label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_webhooks_stop.replace('{{admin}}', req.body.userScopeName)
                });
                res.status(200).json({ code: 200, message: 'Twitter Webhook config deleted.' });
                return;
            }
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_webhooks_stop_failed.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: response.statusCode, message: 'Twitter Webhook config deleted unsuccessfull.' });
        })
        .catch(function (error) {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_webhooks_stop_failed.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: 400, message: error.message });
        });
};

helper.getTwitterSubscriptionList = function (req, res) {
    twitterWebhooks.getSubscriptionList()
        .then((response) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_subscription_list.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: 200, subscription_count: response });
        })
        .catch((error) => {
            analyticsServices.registerEvents({
                category: req.body.userScopeEmail,
                action: configruation.feeds_service_events.event_action.AdminWebhooks,
                label: configruation.feeds_service_events.admin_webhooks_event_label.twitter_subscription_list_failed.replace('{{admin}}', req.body.userScopeName)
            });
            res.status(200).json({ code: 400, message: error.message });
        });
};

helper.twitterWebhookValidation = function (req, res) {
    var crcToken = req.query.crc_token;
    if (crcToken) {
        var hash = crypto.createHmac('sha256', config.get('twitter_api.secret_key')).update(crcToken).digest('base64');
        res.status(200);
        res.send({
            response_token: 'sha256=' + hash
        });
    } else {
        res.status(400);
        res.send('Error: crc_token missing from request.');
    }
};

helper.twitterWebhookEvents = function (req, res) {
    if (req.headers["x-twitter-webhooks-signature"]) {
        twitterWebhooks.webhookEvents(req.body);
    }
    else {
        logger.info('Signature not presented in twitter webhooks');
    }
    res.status(200).send('200');
};

helper.youtubeWebhookValidation = function (req, res) {
    var hub_signature = req.query['hub.challenge'];
    if (hub_signature) {
        res.status(200).send(hub_signature.toString());
    } else {
        res.status(404).send();
    }
};

helper.youtubeWebhookEvents = function (req, res) {
    logger.info(`Received the data from youtube..`);
    res.status(200).send('200 OK');
    if (req.body.feed && req.body.feed.entry) {
        youtubeWebhooks.webhookEvents(req.body);
    }
};

module.exports = helper;