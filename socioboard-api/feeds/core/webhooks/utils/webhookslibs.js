const config = require('config');
const logger = require('../../../utils/logger')

class WebhookLibs {

    startTwitterWebhook() {
        return new Promise((resolve, reject) => {
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
                    resolve(body);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    stopTwitterWebhook() {
        return new Promise((resolve, reject) => {
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

            // GET request to fetch all running webhooks
            requestPromise.get(request_options)
                .then(function (body) {
                    var webhook_id = JSON.parse(body)[0].id;
                    logger.info('Deleting webhook config:', webhook_id);
                    request_options = {
                        url: `https://api.twitter.com/1.1/account_activity/all/${config.get('twitter_api.webhook_environment')}/webhooks/${webhook_id}.json`,
                        oauth: twitterOauth,
                        resolveWithFullResponse: true
                    };
                    // Deleting all running webhooks, given by twitter
                    return requestPromise.delete(request_options);
                })
                .then(function (response) {
                    if (response.statusCode == 204)
                        resolve({ code: 200, message: 'Twitter Webhook config deleted.' });
                    else
                        reject({ code: response.statusCode, message: 'Twitter Webhook config deleted unsuccessfull.' });
                })
                .catch(function (error) {
                    reject({ code: 400, message: error.message });
                });
        });
    }
}

module.exports = WebhookLibs;