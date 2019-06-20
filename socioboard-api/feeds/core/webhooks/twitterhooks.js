const moment = require('moment');
const TwitterMongoPostModel = require('../../../library/mongoose/models/twitterposts');
const TwitterMongoMessageModel = require('../../../library/mongoose/models/twittermessages');
const config = require('config');
const request = require('request');
const requestPromise = require('request-promise');

const TwitterConnect = require('../../../library/network/twitter');

const twitterConnect = new TwitterConnect(config.get('twitter_api'));
const logger = require('../../utils/logger');

var helper = {};

helper.getBearerToken = function () {
    // construct request for bearer token
    var request_options = {
        url: 'https://api.twitter.com/oauth2/token',
        method: 'POST',
        auth: {
            user: config.get('twitter_api.api_key'),
            pass: config.get('twitter_api.secret_key')
        },
        form: {
            'grant_type': 'client_credentials'
        }
    };
    return new Promise(function (resolve, reject) {
        request(request_options, function (error, response) {
            if (error) {
                reject(error);
            }
            else {
                var parsedBody = JSON.parse(response.body);
                resolve(parsedBody.access_token);
            }
        });
    });
};

helper.getSubscriptionList = function () {
    return helper.getBearerToken()
        .then(function (bearerToken) {
            var request_options = {
                url: `https://api.twitter.com/1.1/account_activity/all/${config.get('twitter_api.webhook_environment')}/subscriptions/list.json`,
                auth: {
                    'bearer': bearerToken
                }
            };
            return requestPromise.get(request_options)
                .then(function (body) {
                    return JSON.parse(body);
                })
                .catch((error) => {
                    return error;
                });
        })
        .catch((error) => {
            return error;
        });
};

helper.webhookEvents = function (receivedObjects) {
    logger.info(`Twitter Received Details :\n ${JSON.stringify(receivedObjects)}`);

    var userId = receivedObjects.for_user_id;
    if (!userId) {
        logger.info('Twitter Webhooks : Cant able to get the user Id');
        return;
    } else {
        var twitterMongoPostModelObject = new TwitterMongoPostModel();
        if (receivedObjects.tweet_delete_events) {
            receivedObjects.tweet_delete_events.forEach(post => {

                twitterMongoPostModelObject.deleteSingleTweet(userId, post.status.id)
                    .then((response) => {
                        logger.info(response);
                        logger.info(`Twitter Tweet has been deleted.`);
                    })
                    .catch((error) => {
                        logger.info(`Twitter Tweet cant been deleted.`);
                    });
            });
        }
        else if (receivedObjects.tweet_create_events) {
            twitterConnect.parseTweetDetails(receivedObjects.tweet_create_events, userId, config.get('twitter_api.app_name'))
                .then((response) => {
                    logger.info(`Tweet Details : ${JSON.stringify(response.tweets)}`);
                    return twitterMongoPostModelObject.insertManyPosts(response.tweets)
                        .then(() => {
                            logger.info(`Twitter Tweet has been inserted.`);
                        })
                        .catch((error) => {
                            throw new Error(error.message);
                        });
                })
                .catch((error) => {
                    logger.info(`Error Twitter Webhooks : ${error.message}`);
                });
        }
        else if (receivedObjects.favorite_events) {
            receivedObjects.favorite_events.forEach(postDetails => {
                var tweetId = postDetails.favorited_status.id_str;
                var likeCount = postDetails.favorited_status.favorite_count;
                var retweetCount = postDetails.favorited_status.retweet_count;
                if (tweetId) {
                    return twitterMongoPostModelObject.updateLikeRetweetCount(tweetId, likeCount, retweetCount)
                        .then(() => {
                            logger.info(`Twitter favorite count has been updated.`);
                        })
                        .catch((error) => {
                            logger.info(`Twitter favorite count cant able to updated.`);
                        });
                }
            });
        }
        else if (receivedObjects.direct_message_events) {
            var twitterMongoMessageModelObject = new TwitterMongoMessageModel();
            var messageDetails = {};
            receivedObjects.direct_message_events.forEach(message => {
                messageDetails = {
                    messageId: message.id,
                    messagedDate: moment(Number(message.created_timestamp)).utc(),
                    text: message.message_create.message_data.text,
                    senderId: message.message_create.sender_id,
                    receiverId: message.message_create.target.recipient_id,
                    accountId: userId
                };

                var hashtags = [];
                var mentions = [];
                var mediaUrls = [];

                if (message.message_create.message_data.entities) {
                    if (message.message_create.message_data.entities.user_mentions.length > 0) {
                        message.message_create.message_data.entities.user_mentions.forEach(mention => {
                            mentions.push(`@${mention.screen_name}`);
                        });
                    }
                    if (message.message_create.message_data.entities.hashtags.length > 0) {
                        message.message_create.message_data.entities.hashtags.forEach(hashtag => {
                            hashtags.push(`#${hashtag.text}`);
                        });
                    }
                }
                if (message.message_create.message_data.attachment &&
                    message.message_create.message_data.attachment &&
                    message.message_create.message_data.attachment.media) {
                    if (message.message_create.message_data.attachment.media.video_info) {
                        if (message.message_create.message_data.attachment.media.video_info.variants.length > 0) {
                            mediaUrls.push(message.message_create.message_data.attachment.media.video_info.variants[0].url);
                        }
                    } else {
                        mediaUrls.push(message.message_create.message_data.attachment.media.media_url_https);
                    }
                }

                messageDetails.hashtags = hashtags;
                messageDetails.mentions = mentions;
                messageDetails.mediaUrls = mediaUrls;
            });

            var senderDetails = receivedObjects.users[messageDetails.senderId];

            messageDetails.senderInfo = {};
            messageDetails.senderInfo.name = senderDetails.name;
            messageDetails.senderInfo.senderId = messageDetails.senderId;
            messageDetails.senderInfo.screenName = senderDetails.screen_name;
            messageDetails.senderInfo.profileUrl = senderDetails.profile_image_url_https;

            messageDetails.isSeenByReceiver = false;

            var receiverDetails = receivedObjects.users[messageDetails.receiverId];
            messageDetails.receiverInfo = {};
            messageDetails.receiverInfo.name = receiverDetails.name;
            messageDetails.receiverInfo.receiverId = messageDetails.receiverId;
            messageDetails.receiverInfo.screenName = receiverDetails.screen_name;
            messageDetails.receiverInfo.profileUrl = receiverDetails.profile_image_url_https;

            var message = [];
            message.push(messageDetails);
            return twitterMongoMessageModelObject.insertManyPosts(message)
                .then(() => {
                    logger.info(`Twitter Message has been inserted.`);
                })
                .catch((error) => {
                    logger.info(`Twitter Message cant able to inserted.`);
                });
        }
    }
};

module.exports = helper;