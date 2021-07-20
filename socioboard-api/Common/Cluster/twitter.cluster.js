// const twitterApi = require('node-twitter-api');
// var TwtAPi = require('twitter');
// const moment = require('moment');
// const path = require('path');
// const requestPromise = require('request-promise');

import twitterApi from 'node-twitter-api';
import TwtAPi from 'twitter';
import moment from 'moment';
import path from 'path';
import requestPromise from 'request-promise';
import Sentiment from 'sentiment';
var sentiment = new Sentiment();
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { readFileSync } from 'fs';



const __dirname = dirname(fileURLToPath(import.meta.url));
//const logger = require('../utils/logger');
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// twitter_api is the config data of twitter from the route
function Twitter(twitter_api) {
    // Assiging twitter_api (twitter config) to this.twitter_api
    this.twitter_api = twitter_api;
    // Making a twitter object with config to hit twitter api
    this.twitterObj = new twitterApi({
        consumerKey: twitter_api.api_key,
        consumerSecret: twitter_api.secret_key,
        callback: twitter_api.redirect_url
    });

    this.twitterLogin = new twitterApi({
        consumerKey: twitter_api.api_key,
        consumerSecret: twitter_api.secret_key,
        callback: twitter_api.login_redirect_url
    });
}

Twitter.prototype.getTwitterClient = function (accessToken, accessTokenSecret) {
    // Making an interface with data to hit the twitter api
    var twitterClient = new TwtAPi({
        consumer_key: this.twitter_api.api_key,
        consumer_secret: this.twitter_api.secret_key,
        access_token_key: accessToken,
        access_token_secret: accessTokenSecret
    });
    return twitterClient;
};

Twitter.prototype.addTwitterProfile = function (network, teamId, requestToken, requestSecret, verifier) {
    var twitterAccessToken = null;
    return new Promise((resolve, reject) => {
        // Checking whether the input verifier is having value or not
        if (!verifier) {
            reject("Can't get verification code from twitter!");
        } else {
            return this.accessToken(requestToken, requestSecret, verifier)
                .then((response) => {
                    twitterAccessToken = response;
                    return this.verifyCredentials(response.accessToken, response.accessSecret);
                })
                .then((userDetails) => {
                    // Formating the response
                    var user = {
                        UserName: userDetails.screen_name,
                        FirstName: userDetails.name,
                        LastName: userDetails.last_name ? userDetails.last_name : '',
                        Email: userDetails.email ? userDetails.email : '',
                        SocialId: userDetails.id,
                        ProfilePicture: (userDetails.profile_image_url_https).replace('_normal', ''),
                        ProfileUrl: `https://twitter.com/${userDetails.screen_name}`,
                        AccessToken: twitterAccessToken.accessToken,
                        // For Twitter Refresh token is an accessSecret
                        RefreshToken: twitterAccessToken.accessSecret,
                        FriendCount: userDetails.friends_count,
                        Info: '',
                        TeamId: teamId,
                        Network: network,
                    };
                    // Sending response
                    resolve(user);
                })
                .catch((error) => {
                    console.log(`error ${error}`)
                    reject(error);
                });
        }
    });
};
Twitter.prototype.addTwitterProfilebyLogin = function (requestToken, requestSecret, verifier) {
    var twitterAccessToken = null;
    return new Promise((resolve, reject) => {
        // Checking whether the input verifier is having value or not
        if (!verifier) {
            reject("Can't get verification code from twitter!");
        } else {
            return this.accessToken(requestToken, requestSecret, verifier)
                .then((response) => {
                    twitterAccessToken = response;
                    return this.verifyCredentials(response.accessToken, response.accessSecret);
                })
                .then((userDetails) => {
                    let data = {
                        profile_deatils: userDetails,
                        token: twitterAccessToken
                    }
                    resolve(data);
                })
                .catch((error) => {
                    console.error(`Error while getting the data ${error.message}`)
                    reject(error);
                });
        }
    });
};


Twitter.prototype.requestToken = function () {
    return new Promise((resolve, reject) => {
        this.twitterObj.getRequestToken(function (error, requestToken, requestSecret) {
            // Checking whether it sent error in callback or not
            if (error)
                reject(error);
            else {
                var response = {
                    requestToken: requestToken,
                    requestSecret: requestSecret
                };
                // Sending response
                resolve(response);
            }
        });
    });
};

Twitter.prototype.requestTokenLogin = function () {
    return new Promise((resolve, reject) => {
        this.twitterLogin.getRequestToken(function (error, requestToken, requestSecret) {
            // Checking whether it sent error in callback or not
            if (error)
                reject(error);
            else {
                var response = {
                    requestToken: requestToken,
                    requestSecret: requestSecret
                };
                // Sending response
                resolve(response);
            }
        });
    });
};

Twitter.prototype.accessToken = function (token, secret, verifier) {
    return new Promise((resolve, reject) => {
        this.twitterObj.getAccessToken(token, secret, verifier, function (error, accessToken, accessSecret) {
            // Checking whether it sent error in callback or not
            if (error)
                reject(error);
            else {
                var response = {
                    accessToken: accessToken,
                    accessSecret: accessSecret
                };
                // Sending response
                resolve(response);
            }
        });
    });
};

Twitter.prototype.verifyCredentials = function (accessToken, accessSecret) {
    return new Promise((resolve, reject) => {
        this.twitterObj.verifyCredentials(accessToken, accessSecret, function (error, user) {
            // Checking whether it sent error in callback or not
            if (error) {
                reject(error);
            }
            else {
                resolve(user);

            }
        });
    });
};

Twitter.prototype.parseTweetDetails = function (timelineTweets, socialId, appName, version, archived_status) {
    var dataForDownload = [];
    var dataForSentimentAnalysis = [];
    return new Promise((resolve, reject) => {
        if (!timelineTweets || !socialId || !appName || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            try {
                var batchId = String(moment().unix());
                var postDetails = {
                    count: 0,
                    tweets: [],
                    batchId: batchId
                };
                timelineTweets.forEach(tweet => {
                    var source = tweet.source.includes(appName) ? true : false;
                    var mediaUrls = [];
                    var hashtags = [];
                    var mentions = [];
                    var quoteDetails = {};
                    var replayDetails = {};
                    var retweetDetails = {};
                    var isReplayTweet = false;
                    var isReTweet = false;
                    var sentimentData = 0;
                    var archiveStatus = archived_status;
                    var favoriteCount = 0;

                    quoteDetails.quoteTweetUrl = '';
                    favoriteCount = tweet.favorite_count;

                    if (tweet.extended_entities) {
                        if (tweet.extended_entities.media) {
                            tweet.extended_entities.media.forEach(media => {
                                var mediaUrl;
                                if (media.type == "photo") {
                                    mediaUrl = media.media_url_https;
                                }
                                else if (media.type == "video") {
                                    media.video_info.variants.forEach(variants => {
                                        if (variants.content_type == "video/mp4")
                                            if (variants.bitrate == 832000)
                                                mediaUrl = variants.url;
                                    })
                                }
                                else if (media.type == "animated_gif") {
                                    media.video_info.variants.forEach(variants => {
                                        if (variants.content_type == "video/mp4")
                                            mediaUrl = variants.url;
                                    })
                                }

                                var medias = {
                                    type: media.type,
                                    url: mediaUrl,
                                };
                                mediaUrls.push(medias);

                            });

                            var d = {
                                tweetId: tweet.id_str,
                                mediaDetails: mediaUrls
                            }
                            dataForDownload.push(d)
                        }
                        else {
                            mediaUrls = [];
                        }
                    }

                    if (tweet.is_quote_status) {
                        if (tweet.quoted_status) {
                            quoteDetails.quoteTweetId = tweet.quoted_status_id_str;
                            quoteDetails.quoteTweetText = tweet.quoted_status.full_text.replace(/\r?\n|\r/g, " ");
                            var quoteTweetMediaUrls = [];
                            if (tweet.quoted_status.extended_entities) {
                                if (tweet.quoted_status.extended_entities.media) {
                                    tweet.quoted_status.extended_entities.media.forEach(media => {
                                        quoteTweetMediaUrls.push(media.media_url_https);
                                    });
                                }
                            }
                            else if (tweet.quoted_status.entities.media) {
                                tweet.quoted_status.entities.media.forEach(media => {
                                    quoteTweetMediaUrls.push(media.media_url_https);
                                });
                            }
                            else {
                                quoteTweetMediaUrls = [];
                            }
                            quoteDetails.quoteTweetMediaUrls = quoteTweetMediaUrls;


                            if (tweet.quoted_status_permalink) {
                                quoteDetails.quoteTweetUrl = tweet.quoted_status_permalink.expanded;
                            }
                        }
                    }

                    var text = '' || tweet.full_text.replace(/\r?\n|\r/g, " ");

                    var SentimentAnalysisdata = {
                        text: text,
                        tweetId: tweet.id_str
                    }
                    dataForSentimentAnalysis.push(SentimentAnalysisdata)

                    if (tweet.in_reply_to_status_id != null) {
                        isReplayTweet = true,
                            replayDetails.replayTweetId = tweet.in_reply_to_status_id_str,
                            replayDetails.replayTweetUserId = tweet.in_reply_to_user_id_str,
                            replayDetails.replayTweetScreenName = tweet.in_reply_to_screen_name
                    }

                    if (tweet.retweeted_status != null) {
                        isReTweet = true,
                            favoriteCount = tweet.retweeted_status.favorite_count
                        retweetDetails.retweetTweetId = tweet.retweeted_status.id_str,
                            retweetDetails.retweetTweetUrl = `https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`,
                            retweetDetails.retweetTweetText = tweet.retweeted_status.full_text,
                            retweetDetails.postedAccountScreenName = tweet.retweeted_status.user.screen_name
                        text = "RT @" + retweetDetails.postedAccountScreenName + ": " + tweet.retweeted_status.full_text.replace(/\r?\n|\r/g, " ");
                    }

                    var sentScroe = sentiment.analyze(text).comparative;
                    if (sentScroe == 0) {
                        sentimentData = 0;
                    }
                    else if (sentScroe > 0) {
                        sentimentData = 1;
                    }
                    else {
                        sentimentData = -1
                    }

                    if (tweet.entities.user_mentions) {
                        tweet.entities.user_mentions.forEach(mention => {
                            mentions.push(`@${mention.screen_name}`);
                        });
                    }
                    if (tweet.entities.hashtags) {
                        if (tweet.entities.hashtags.length > 0) {
                            tweet.entities.hashtags.forEach(hashtag => {
                                hashtags.push(`#${hashtag.text}`);
                            });
                        }
                    }

                    var tweetDetails = {
                        tweetId: tweet.id_str,
                        publishedDate: tweet.created_at,
                        descritpion: text,
                        mediaUrls: mediaUrls,
                        hashtags: hashtags,
                        mentions: mentions,
                        retweetCount: tweet.retweet_count,
                        favoriteCount: favoriteCount,
                        accountId: socialId,
                        postedAccountId: tweet.user.id_str,
                        postedAccountScreenName: tweet.user.screen_name,
                        isApplicationPost: source,
                        tweetUrl: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                        quoteDetails: quoteDetails,
                        replayDetails: replayDetails,
                        retweetStatus: retweetDetails,
                        isReplayTweet: isReplayTweet,
                        isReTweet: isReTweet,
                        isQuoted: tweet.is_quote_status,
                        isLiked: tweet.favorited,
                        retweeted: tweet.retweeted,
                        batchId: batchId,
                        version: version,
                        // serverMediaUrl:[],
                        // sentiment: sentimentData,
                        archivedStatus: archiveStatus,
                    };

                    postDetails.tweets.push(tweetDetails);
                });

                postDetails.count = postDetails.tweets.length;
                //  this.downloadMediaPosts(dataForDownload)
                // this.checkAndStoreSentimentValue(dataForSentimentAnalysis)
                resolve(postDetails);
            } catch (error) {
                reject(error);
            }
        }
    });
};

// For getting user tweets
Twitter.prototype.getUserTweets = function (socialId, accessToken, refreshToken, userName) {
    return new Promise((resolve, reject) => {
        // Fetching timeline tweets from twitter
        return this.getTimeLineTweets(accessToken, refreshToken, userName)
            .then((timelineTweets) => {
                // Formating the response of timeline tweets
                return this.parseTweetDetails(timelineTweets, socialId, this.twitter_api.app_name, this.twitter_api.version);
            })
            .then((tweets) => {
                // Sending response
                resolve(tweets);
            })
            .catch(error => {
                reject(error);
            });
    });
};

// For getting twitter timeline tweets
Twitter.prototype.getTimeLineTweets = function (accessToken, accessTokenSecret, screenName, lastTweetId) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret || !screenName) {
            reject(new Error('Invalid Inputs'));
        } else {
            var parameters = { screen_name: screenName, count: "200" };
            if (lastTweetId)
                parameters.since_id = lastTweetId;

            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            return twitterClient.get('statuses/user_timeline', parameters)
                .then(function (repsonse) {
                    // Sending response
                    resolve(repsonse);
                })
                .catch(function (error) {
                    reject(error[0]);
                });
        }
    });
};

// For getting twitter home timeline tweets
Twitter.prototype.getHomeTimeLineTweets = function (accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.get('statuses/home_timeline', {})
                .then(function (repsonse) {
                    // Sending response
                    resolve(repsonse);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For getting twitter mentioned tweets (user tagged tweets)
Twitter.prototype.getMentionTimeLineTweets = function (accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.get('statuses/mentions_timeline', {})
                .then(function (repsonse) {
                    // Sending response
                    resolve(repsonse);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For formating the user details response into a proper syntax
function userProfileParser(userDetails) {
    return new Promise((resolve, reject) => {
        try {
            var profiles = {
                nextCursor: userDetails.next_cursor,
                previousCursor: userDetails.previous_cursor
            };
            var profileDetails = [];
            // Formating the userDetails
            userDetails.users.forEach(user => {
                var profile = {
                    id: user.id_str,
                    name: user.name,
                    screenName: user.screen_name,
                    followerCount: user.followers_count,
                    followingCount: user.friends_count,
                    statusCount: user.statuses_count,
                    isVerifiedUser: user.verified,
                    profilePicUrl: user.profile_image_url_https
                };
                profileDetails.push(profile);
            });
            profiles.users = profileDetails;
            // Sending response
            resolve(profiles);
        } catch (error) {
            reject(error);
        }
    });
}

// For formating the user profile details without cursor values
function userProfileParserWithoutCursor(userDetails) {
    return new Promise((resolve, reject) => {
        try {
            var profileDetails = [];
            userDetails.forEach(user => {
                var profile = {
                    id: user.id_str,
                    name: user.name,
                    screenName: user.screen_name,
                    followerCount: user.followers_count,
                    followingCount: user.friends_count,
                    statusCount: user.statuses_count,
                    isVerifiedUser: user.verified,
                    profilePicUrl: user.profile_image_url_https
                };
                profileDetails.push(profile);
            });
            // Sending response
            resolve(profileDetails);
        } catch (error) {
            reject(error);
        }
    });
}

// To get the twitter follower count
Twitter.prototype.getFollowersList = function (accessToken, accessTokenSecret, cursorValue) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var queryString = { count: 200, include_user_entities: false, skip_status: true };
            if (cursorValue) {
                queryString.cursor = Number(cursorValue);
            }
            twitterClient.get('followers/list', queryString)
                .then(function (response) {
                    return userProfileParser(response);
                })
                .then((result) => {
                    // Sending response
                    resolve(result);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For Fetching the twitter following list
Twitter.prototype.getFollowingsList = function (accessToken, accessTokenSecret, cursorValue) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var queryString = { count: 200, include_user_entities: false, skip_status: true };

            if (cursorValue) {
                queryString.cursor = Number(cursorValue);
            }

            twitterClient.get('friends/list', queryString)
                .then(function (repsonse) {
                    return userProfileParser(repsonse);
                })
                .then((result) => {
                    // Sending response
                    resolve(result);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For, fetching the stats of an twitter account
Twitter.prototype.getLookupList = function (accessToken, accessTokenSecret, screenName) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var queryString = { screen_name: screenName };

            return twitterClient.get('users/lookup', queryString)
                .then((response) => {
                    var updateDetails = {
                        follower_count: response[0].followers_count,
                        following_count: response[0].friends_count,
                        total_like_count: response[0].favourites_count,
                        total_post_count: response[0].statuses_count,
                        profile_picture: response[0].profile_image_url_https,
                        bio_text: response[0].description,
                        user_mentions: response[0].status.entities.user_mentions.length,
                        retweet_count: response[0].status.retweet_count,
                        favorite_count: response[0].favourites_count
                    };
                    // Sending response
                    resolve(updateDetails);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For fetching tweets by keyword
Twitter.prototype.getTweetsByKeyword = function (accessToken, accessTokenSecret, keyword) {

    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret || !keyword) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.get('search/tweets', { q: keyword })
                .then(function (repsonse) {
                    // Sending response
                    resolve(repsonse);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

// For fetching the tweets with keyword by an twitter account
Twitter.prototype.searchUser = function (keyword, pageId, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!keyword || !pageId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterOauth = {
                consumer_key: this.twitter_api.api_key,
                consumer_secret: this.twitter_api.secret_key,
                token: accessToken,
                token_secret: accessTokenSecret
            };

            var request_options = {
                url: `https://api.twitter.com/1.1/users/search.json?q=${encodeURIComponent(keyword)}&page=${pageId}&count=20&include_entities=false`,
                oauth: twitterOauth,
                resolveWithFullResponse: true,
            };
            return requestPromise.get(request_options)
                .then((result) => {
                    if (result.statusCode == 200) {
                        var value = JSON.parse(result.body);
                        return userProfileParserWithoutCursor(value);
                    }
                    return null;
                })
                .then((result) => {
                    if (result)
                        // Sending response
                        resolve(result);
                    else
                        // Sending response
                        resolve([]);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    });
};

Twitter.prototype.directMessage = function (messageDetails, accessToken, accessTokenSecret) {

    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!messageDetails || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

            var twitterOauth = {
                consumer_key: this.twitter_api.api_key,
                consumer_secret: this.twitter_api.secret_key,
                token: accessToken,
                token_secret: accessTokenSecret
            };

            var request_options = {
                url: `https://api.twitter.com/1.1/direct_messages/events/new.json`,
                oauth: twitterOauth,
                resolveWithFullResponse: true,
            };

            if (messageDetails.messageType == 'Text') {
                let message = { event: { type: "message_create", message_create: { target: { recipient_id: messageDetails.recipientId }, message_data: { text: messageDetails.text } } } };
                request_options.body = JSON.stringify(message);
                return requestPromise.post(request_options)
                    .then(function (response) {
                        // Sending response
                        resolve({ code: 200, status: "success", response: "Message has been sent." });
                    }).catch(function (error) {
                        reject(error);
                    });
            }
            else if (messageDetails.messageType == 'Image') {
                let filePath = `media/images/${messageDetails.media}`;
                let extenstion = require('path').extname(filePath).substr(1);
                return uploadMediaPromise(twitterClient, filePath, `image/${extenstion}`)
                    .then((mediaId) => {
                        let message = {
                            "event": {
                                "type": "message_create",
                                "message_create": {
                                    "target": { "recipient_id": messageDetails.recipientId },
                                    "message_data": {
                                        "text": messageDetails.text,
                                        "attachment": {
                                            type: "media", media: { id: mediaId }
                                        }
                                    }
                                }
                            }
                        };
                        request_options.body = JSON.stringify(message);
                        return requestPromise.post(request_options)
                            .then(function (response) {
                                // Sending response
                                resolve({ code: 200, status: "success", response: "Message has been sent." });
                            }).catch(function (error) {
                                reject(error);
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
            else if (messageDetails.messageType == 'Video') {
                let filePath = `media/videos/${messageDetails.media}`;
                let extenstion = require('path').extname(filePath).substr(1);
                return uploadMediaPromise(twitterClient, filePath, `video/${extenstion}`)
                    .then((mediaId) => {
                        let message = {
                            "event": {
                                "type": "message_create",
                                "message_create": {
                                    "target": { "recipient_id": messageDetails.recipientId },
                                    "message_data": {
                                        "text": messageDetails.text,
                                        "attachment": {
                                            type: "media", media: { id: mediaId }
                                        }
                                    }
                                }
                            }
                        };
                        request_options.body = JSON.stringify(message);
                        return requestPromise.post(request_options)
                            .then(function (response) {
                                // Sending response
                                resolve({ code: 200, status: "success", response: "Message has been sent." });
                            }).catch(function (error) {
                                reject(error);
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        }
    });
};

Twitter.prototype.publishTweets = function (postDetails, accessToken, accessTokenSecret) {
    var basePath = path.resolve(__dirname, '../../..');
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!postDetails || !accessToken || !accessTokenSecret) {
            reject({ code: 400, status: "failed", message: "Invalid Inputs" });
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

            if (postDetails.postType == 'Text') {
                twitterClient.post('statuses/update', { status: postDetails.message }, function (error, tweet, response) {
                    // Checking whether it sent error in callback or not
                    if (error) {
                        reject({ code: 400, status: "failed", message: error });
                    } else {
                        // Sending response
                        resolve({ code: 200, status: "success", message: tweet });
                    }
                });
            }
            else if (postDetails.postType == 'OldImage') {
                var filePath = `${basePath}/media/${postDetails.mediaPath}`;
                var extenstion = require('path').extname(filePath).substr(1);
                uploadMedia(twitterClient, filePath, `image/${extenstion}`, (error, mediaId) => {
                    if (error) {
                        reject({ code: 400, status: "failed", message: error });
                    }
                    else {
                        var status = {
                            status: postDetails.message,
                            media_ids: mediaId
                        };
                        twitterClient.post('statuses/update', status, function (error, tweet, response) {
                            // Checking whether it sent error in callback or not
                            if (error) {
                                reject({ code: 400, status: "failed", message: error });
                            } else {
                                // Sending response
                                resolve({ code: 200, status: "success", message: tweet });
                            }
                        });
                    }
                });
            }
            else if (postDetails.postType == 'Image') {
                var erroredImages = [];
                var mediaIds = '';
                return Promise.all(postDetails.mediaPath.map(media => {
                    var filePath = `${basePath}/media/${media}`;
                    var extenstion = require('path').extname(filePath).substr(1);

                    return uploadMediaPromise(twitterClient, filePath, `image/${extenstion}`)
                        .then((mediaId) => {
                            if (mediaIds == '') {
                                mediaIds = mediaId;
                            } else {
                                mediaIds = `${mediaIds},${mediaId}`;
                            }
                        })
                        .catch((errorMediaPath) => {
                            erroredImages.push(errorMediaPath);
                        });
                }))
                    .then(() => {
                        let message = null;
                        if (postDetails.link && postDetails.link != "")
                            message = `${postDetails.message} \r\n Link: ${postDetails.link}`;
                        else
                            message = `${postDetails.message}`
                        var status = {
                            // status: postDetails.message,
                            status: message,
                            media_ids: mediaIds
                        };
                        return twitterClient.post('statuses/update', status, function (error, tweet, response) {
                            // Checking whether it sent error in callback or not
                            if (error) {
                                reject({ code: 400, status: "failed", message: error });
                            } else {
                                // Sending response
                                resolve({ code: 200, status: "success", message: tweet, failedMediaPath: erroredImages });
                            }
                        });
                    })
                    .catch((error) => {
                        reject({ code: 400, status: "failed", message: error.message });
                    });
            }
            else if (postDetails.postType == 'Link') {
                var status = {
                    status: `${postDetails.message} - \r\n ${postDetails.link}`,
                };
                twitterClient.post('statuses/update', status, function (error, tweet, response) {
                    // Checking whether it sent error in callback or not
                    if (error) {
                        reject({ code: 400, status: "failed", message: error });
                    } else {
                        // Sending response
                        resolve({ code: 200, status: "success", message: tweet });
                    }
                });
            }
            else if (postDetails.postType == 'Video') {

                let filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
                let extenstion = require('path').extname(filePath).substr(1);

                uploadMedia(twitterClient, filePath, `video/${extenstion}`, (error, mediaId) => {

                    if (error) {
                        reject({ code: 400, status: "failed", message: error });
                    }
                    else {
                        var status = {
                            status: postDetails.message,
                            media_ids: mediaId
                        };
                        twitterClient.post('statuses/update', status, function (error, tweet, response) {
                            // Checking whether it sent error in callback or not
                            if (error) {

                                reject({ code: 400, status: "failed", message: error });
                            } else {
                                // Sending response
                                resolve({ code: 200, status: "success", message: tweet });
                            }
                        });
                    }
                });
            }
            else {
                reject({ code: 400, status: "failed", error: 'Not a valid post.' });
            }
        }
    });
};

Twitter.prototype.publishPost = function (postDetails, accessToken, accessTokenSecret, callback) {
    var basePath = path.resolve(__dirname, '../../..');
    var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
    if (postDetails.postType == 'Text') {
        twitterClient.post('statuses/update', { status: postDetails.message }, function (error, tweet, response) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: tweet });
            }
        });
    }
    else if (postDetails.postType == 'OldImage') {

        var filePath = `${basePath}/media/${postDetails.mediaPath}`;
        var extenstion = require('path').extname(filePath).substr(1);

        uploadMedia(twitterClient, filePath, `image/${extenstion}`, (error, mediaId) => {

            if (error) {
                callback({ code: 400, status: "failed", message: error });
            }
            else {
                var status = {
                    status: postDetails.message,
                    media_ids: mediaId
                };
                twitterClient.post('statuses/update', status, function (error, tweet, response) {
                    // Checking whether it sent error in callback or not
                    if (error) {
                        callback({ code: 400, status: "failed", message: error });
                    } else {
                        callback({ code: 200, status: "success", message: tweet });
                    }
                });
            }
        });
    }
    else if (postDetails.postType == 'Image') {
        var erroredImages = [];
        var mediaIds = '';
        return Promise.all(postDetails.mediaPath.map(media => {
            var filePath = `${basePath}/media/${media}`;
            var extenstion = require('path').extname(filePath).substr(1);

            return uploadMediaPromise(twitterClient, filePath, `image/${extenstion}`)
                .then((mediaId) => {
                    if (mediaIds == '') {
                        mediaIds = mediaId;
                    } else {
                        mediaIds = `${mediaIds},${mediaId}`;
                    }
                })
                .catch((errorMediaPath) => {
                    erroredImages.push(errorMediaPath);
                });
        }))
            .then(() => {
                var status = {
                    status: postDetails.message,
                    media_ids: mediaIds
                };
                return twitterClient.post('statuses/update', status, function (error, tweet, response) {
                    // Checking whether it sent error in callback or not
                    if (error) {
                        callback({ code: 400, status: "failed", message: error });
                    } else {
                        callback({ code: 200, status: "success", message: tweet, failedMediaPath: erroredImages });
                    }
                });
            })
            .catch((error) => {
                callback({ code: 400, status: "failed", message: error.message });
            });
    }
    else if (postDetails.postType == 'Link') {
        var status = {
            status: postDetails.link,
        };
        twitterClient.post('statuses/update', status, function (error, tweet, response) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: tweet });
            }
        });
    }
    else if (postDetails.postType == 'Video') {

        let filePath = `${basePath}/media/${postDetails.mediaPath}`;
        let extenstion = require('path').extname(filePath).substr(1);

        uploadMedia(twitterClient, filePath, `video/${extenstion}`, (error, mediaId) => {

            if (error) {
                callback({ code: 400, status: "failed", message: error });
            }
            else {
                var status = {
                    status: postDetails.message,
                    media_ids: mediaId
                };
                twitterClient.post('statuses/update', status, function (error, tweet, response) {
                    // Checking whether it sent error in callback or not
                    if (error) {
                        callback({ code: 400, status: "failed", message: error });
                    } else {
                        callback({ code: 200, status: "success", message: tweet });
                    }
                });
            }
        });
    }
    else {
        callback({ code: 400, status: "failed", error: 'Not a valid post.' });
    }
};

function uploadMediaPromise(twitterClient, mediaPath, mediaType) {
    const mediaData = require('fs').readFileSync(mediaPath);
    const mediaSize = require('fs').statSync(mediaPath).size;

    // // let mediaData = readFileSync(mediaPath);
    // let mediaData = readFileSync(new URL(mediaPath))
    // // mediaData = path.normalize(mediaData)

    // const mediaSize = fs.statSync(mediaPath).size;

    return new Promise((resolve, reject) => {
        initUpload() // Declare that you wish to upload some media
            .then(appendUpload) // Send the data for the media
            .then(finalizeUpload) // Declare that you are done uploading chunks
            .then(mediaId => {
                // Sending response
                resolve(mediaId);
            })
            .catch(error => {
                reject(mediaPath);
            });
    });

    function initUpload() {
        //  logger.info(`\n Init Upload... \n `);
        return makePost('media/upload', {
            command: 'INIT',
            total_bytes: mediaSize,
            media_type: mediaType,
        }).then(data => data.media_id_string)
            .catch(() => {
                //   logger.info("init error");
            });

    }

    function appendUpload(mediaId) {
        // logger.info(`\n Append Upload... \n `);
        // logger.info(`\n Media Id ${mediaId} \n `);
        return makePost('media/upload', {
            command: 'APPEND',
            media_id: mediaId,
            media: mediaData,
            segment_index: 0
        }).then(data => mediaId)
            .catch(() => {
                //  logger.info("append error");
            });
    }

    function finalizeUpload(mediaId) {
        //  logger.info(`\n Finalize Upload... \n `);
        //  logger.info(`\n Media Id ${mediaId} \n `);
        return makePost('media/upload', {
            command: 'FINALIZE',
            media_id: mediaId
        }).then(data => mediaId)
            .catch(() => {
                //   logger.info('finalize error');
            });
    }

    function makePost(endpoint, params) {
        return new Promise((resolve, reject) => {
            twitterClient.post(endpoint, params, (error, data, response) => {
                if (error) {
                    //   logger.info(` Error on Make Post : ${error}`);
                    //   logger.info(` Response on Make Post : ${JSON.stringify(response)}`);
                    reject(error);
                } else {
                    //  logger.info(`\n`, "done uploading!", `\n`);
                    // Sending response
                    resolve(data);
                    //  logger.info(data);
                }
            });
        });
    }
}

function uploadMedia(twitterClient, mediaPath, mediaType, callback) {

    // const mediaType = 'image/gif'; // `'video/mp4'` is also supported
    const mediaData = require('fs').readFileSync(mediaPath);
    const mediaSize = require('fs').statSync(mediaPath).size;

    initUpload() // Declare that you wish to upload some media
        .then(appendUpload) // Send the data for the media
        .then(finalizeUpload) // Declare that you are done uploading chunks
        .then(mediaId => {
            callback(null, mediaId);
            // You now have an uploaded movie/animated gif
            // that you can reference in Tweets, e.g. `update/statuses`
            // will take a `mediaIds` param.
        })
        .catch(error => {
            callback(error, null);
        });

    /**
     * Step 1 of 3: Initialize a media upload
     * @return Promise resolving to String mediaId
     */
    function initUpload() {

        //  logger.info(`\n Init Upload... \n `);
        return makePost('media/upload', {
            command: 'INIT',
            total_bytes: mediaSize,
            media_type: mediaType,
        }).then(data => {
            return data.media_id_string
        });

    }

    /**
     * Step 2 of 3: Append file chunk
     * @param String mediaId    Reference to media object being uploaded
     * @return Promise resolving to String mediaId (for chaining)
     */
    function appendUpload(mediaId) {
        //  logger.info(`\n Append Upload... \n `);
        //  logger.info(`\n Media Id ${mediaId} \n `);
        return makePost('media/upload', {
            command: 'APPEND',
            media_id: mediaId,
            media: mediaData,
            segment_index: 0
        }).then(data => {
            return mediaId
        }).catch((error) => {
            // logger.info(`${error}, Eror in video appendUpload`);
        });

    }

    /**
     * Step 3 of 3: Finalize upload
     * @param String mediaId   Reference to media
     * @return Promise resolving to mediaId (for chaining)
     */
    function finalizeUpload(mediaId) {
        //   logger.info(`\n Finalize Upload... \n `);
        //   logger.info(`\n Media Id ${mediaId} \n `);
        return makePost('media/upload', {
            command: 'FINALIZE',
            media_id: mediaId
        }).then(data => {
            return mediaId
        }).catch((error) => {
            // logger.info(`${error}, Eror in video finalizeUpload`);
        });

    }

    /**
     * (Utility function) Send a POST request to the Twitter API
     * @param String endpoint  e.g. 'statuses/upload'
     * @param Object params    Params object to send
     * @return Promise         Rejects if response is error
     */
    function makePost(endpoint, params) {
        return new Promise((resolve, reject) => {
            twitterClient.post(endpoint, params, (error, data, response) => {
                if (error) {
                    // logger.info(` Error on Make Post : ${error}`);
                    // logger.info(` Response on Make Post : ${JSON.stringify(response)}`);
                    reject(error);
                } else {
                    // Sending response
                    resolve(data);
                }
            });
        });
    }
}

// For retweeting a tweet to a particular tweet
Twitter.prototype.retweetPost = function (tweetId, accessToken, accessTokenSecret, callback) {

    var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

    twitterClient.post('statuses/retweet/' + tweetId, {}, function (error, tweet, response) {
        // Checking whether it sent error in callback or not
        if (error) {
            callback({ code: 400, status: "failed", message: error });
        } else {
            callback({ code: 200, status: "success", message: tweet });
        }
    });
};

Twitter.prototype.getGeoLocationDetails = function (keyword, location, accessToken, accessTokenSecret, callback) {

    var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

    twitterClient.get('search/tweets', { q: keyword, geocode: location }, function (error, location, response) {
        // Checking whether it sent error in callback or not
        if (error) {
            callback({ code: 400, status: "failed", message: error });
        } else {
            callback({ code: 200, status: "success", message: location });
        }
    });
};

// For making like to a specified post
Twitter.prototype.likeTwitterPost = function (tweetId, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!tweetId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.post('favorites/create', { id: tweetId }, function (error, tweet, response) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error[0]);
                } else {
                    // Sending response
                    resolve(response);
                }
            });
        }
    });
};

// For unLike specified twitter post
Twitter.prototype.unlikeTwitterPost = function (tweetId, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!tweetId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.post('favorites/destroy', { id: tweetId }, function (error, tweet, response) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Sending response
                    resolve(response);
                }
            });
        }
    });
};

Twitter.prototype.commentTwitterPost = function (tweetId, comment, username, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        if (!tweetId || !comment || !accessToken || !accessTokenSecret || !username) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var status = '@' + username + " " + comment
            twitterClient.post('statuses/update/', {
                status: status,
                in_reply_to_status_id: tweetId,
                //username: '@VashiForever'
            }, function (error, tweet, response) {
                if (error) {
                    reject(error[0]);
                } else {
                    resolve(response);
                }
            });
        }
    });
};

// For deleting a specified twitter post
Twitter.prototype.deleteTwitterPostOrComment = function (tweetId, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!tweetId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.post('statuses/destroy/', {
                id: tweetId
            }, function (error, tweet, response) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Sending response
                    resolve(response);
                }
            });
        }
    });
};

// For creating or deleting the twitter subscriptions 
Twitter.prototype.updateSubscriptions = function (accessToken, accessTokenSecret, isSubscribe) {
    return new Promise((resolve, reject) => {
        var twitterOauth = {
            consumer_key: this.twitter_api.api_key,
            consumer_secret: this.twitter_api.secret_key,
            token: accessToken,
            token_secret: accessTokenSecret
        };
        var request_options = {
            url: `https://api.twitter.com/1.1/account_activity/all/${this.twitter_api.webhook_environment}/subscriptions.json`,
            oauth: twitterOauth,
            resolveWithFullResponse: true
        };
        if (isSubscribe) {
            // If account is adding then, we are requesting for twitter subscription
            requestPromise.post(request_options)
                .then(function (response) {
                    if (response.statusCode == 204) {
                        // Sending response
                        resolve('Subscription added.');
                    }
                    else {
                        // Sending response
                        resolve('Not Subscription.');
                    }
                }).catch(function (response) {
                    reject(response.error);
                });
        } else {
            // If account is deleting then, we are deleting the subscription
            requestPromise.delete(request_options)
                .then(function (response) {
                    if (response.statusCode == 204) {
                        // Sending response
                        resolve('Subscription deleted.');
                    }
                    else {
                        // Sending response
                        resolve('Not able to delete Subscription.');
                    }
                })
                .catch(function (response) {
                    reject(response.error);
                });
        }
    });
};


Twitter.prototype.getAllTweets = function (accessToken, accessTokenSecret, screenName, lastTweetId) {
    return new Promise(async (resolve, reject) => {
        if (!accessToken || !accessTokenSecret || !screenName) {
            reject(new Error('Invalid Inputs'));
        } else {
            var parameters = { screen_name: screenName, count: "200", tweet_mode: "extended" };
            if (lastTweetId)
                parameters.max_id = lastTweetId;
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            try {
                const repsonse = await twitterClient.get('statuses/user_timeline', parameters);
                resolve(repsonse);
            } catch (error) {
                reject(error[0]);
            }
        }
    });
};

Twitter.prototype.retweetsPost = function (tweetId, accessToken, accessTokenSecret, callback) {
    return new Promise((resolve, reject) => {
        if (!tweetId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

            twitterClient.post('statuses/retweet/' + tweetId, {}, function (error, tweet, response) {
                if (error) {
                    reject(error[0]);
                } else {
                    resolve(response);
                }
            });
        }
    })
};

Twitter.prototype.unretweetPost = function (tweetId, accessToken, accessTokenSecret, callback) {
    return new Promise((resolve, reject) => {
        if (!tweetId || !accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            twitterClient.post('statuses/unretweet/' + tweetId, {}, function (error, tweet, response) {
                if (error) {
                    reject(error[0]);
                } else {
                    resolve(response);
                }
            })
        }
    });



}

Twitter.prototype.twtRetweetWithComment = function (tweetId, accessToken, accessTokenSecret, comment, username, callback) {
    return new Promise((resolve, reject) => {
        if (!tweetId || !comment || !accessToken || !accessTokenSecret || !username) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var status = "https://twitter.com/" + username + "/status/" + tweetId

            twitterClient.post('statuses/update/', {
                status: comment,
                attachment_url: status
                //username: '@VashiForever'        
            }, function (error, tweet, response) {
                if (error) {
                    reject(error[0]);
                } else {
                    resolve(response);
                }
            });
        }
    });
};

Twitter.prototype.fetchTweetsKeywords = function (twitterdata, keywords, max_id, since_id) {

    return new Promise((resolve, reject) => {
        if (!twitterdata.access_token || !twitterdata.access_secret) {
            reject(new Error('There is some Error while fetching the Twitter Creds'));
        }
        else {
            var twitterClient = this.getTwitterClient(twitterdata.access_token, twitterdata.access_secret);
            var params = { q: keywords, count: '200', tweet_mode: 'extended' };

            if (max_id)
                params.max_id = max_id
            if (since_id)
                params.since_id = since_id

            twitterClient.get('search/tweets', params, (error, jsonOut, response) => {
                if (!error) {
                    resolve(jsonOut)
                }
                else {
                    reject(error)
                }
            }

            );
        }
    });
};
Twitter.prototype.parseTweetDetailsForKeyword = function (jsonOut) {
    return new Promise((resolve, reject) => {
        if (!jsonOut) {
            reject(new Error('Error in getting the Twitter Details'));
        }
        else {
            let postDetails = {
                count: 0,
                tweets: [],
                max_id_str: 0
            };
            if (jsonOut.statuses.length != 0)
                jsonOut.statuses.map((tweet) => {
                    let mediaUrls = [];
                    let hashtags = [];
                    let mentions = [];
                    let quoteDetails = {};
                    let replayDetails = {};
                    let retweetDetails = {};
                    let isReplayTweet = false;
                    let isReTweet = false;
                    let sentimentData = 0;
                    quoteDetails.quoteTweetUrl = '';
                    //fetch for the media Url
                    if (tweet.extended_entities) {
                        if (tweet.extended_entities.media) {
                            tweet.extended_entities.media.map((media) => {
                                let mediaUrl;
                                if (media.type == "photo") {
                                    mediaUrl = media.media_url_https;
                                }
                                else if (media.type == "video") {
                                    media.video_info.variants.map((variants) => {
                                        if (variants.content_type == "video/mp4")
                                            if (variants.bitrate == 832000)
                                                mediaUrl = variants.url;
                                    })
                                }
                                else if (media.type == "animated_gif") {
                                    media.video_info.variants.map((variants) => {
                                        if (variants.content_type == "video/mp4")
                                            mediaUrl = variants.url;
                                    })
                                }

                                let medias = {
                                    type: media.type,
                                    url: mediaUrl,
                                };
                                mediaUrls.push(medias);
                            });
                        } else {
                            mediaUrls = [];
                        }
                    }

                    if (tweet.is_quote_status) {
                        if (tweet.quoted_status) {
                            quoteDetails.quoteTweetId = tweet.quoted_status_id;
                            quoteDetails.quoteTweetText = tweet.quoted_status.text;
                            let quoteTweetMediaUrls = [];
                            if (tweet.quoted_status.extended_entities) {
                                if (tweet.quoted_status.extended_entities.media) {
                                    tweet.quoted_status.extended_entities.media.map((media) => {
                                        quoteTweetMediaUrls.push(media.media_url_https);
                                    });
                                }
                            }
                            else if (tweet.quoted_status.entities.media) {
                                tweet.quoted_status.entities.media.map((media) => {
                                    quoteTweetMediaUrls.push(media.media_url_https);
                                });
                            }
                            else {
                                quoteTweetMediaUrls = [];
                            }
                            quoteDetails.quoteTweetMediaUrls = quoteTweetMediaUrls;
                            if (tweet.quoted_status.entities.urls.length > 0) {
                                quoteDetails.quoteTweetUrl = tweet.quoted_status.entities.urls[0].expanded_url;
                            }
                        }
                    }

                    let text = '' || tweet.full_text.replace(/\r?\n|\r/g, " ");
                    let sentScroe = sentiment.analyze(text).comparative;
                    if (sentScroe == 0) {
                        sentimentData = 0;
                    }
                    else if (sentScroe > 0) {
                        sentimentData = 1;
                    }
                    else {
                        sentimentData = -1
                    }


                    if (tweet.in_reply_to_status_id != null) {
                        isReplayTweet = true,
                            replayDetails.replayTweetId = tweet.in_reply_to_status_id_str,
                            replayDetails.replayTweetUserId = tweet.in_reply_to_user_id_str,
                            replayDetails.replayTweetScreenName = tweet.in_reply_to_screen_name
                    }

                    if (tweet.retweeted_status != null) {
                        isReTweet = true,
                            retweetDetails.retweetTweetId = tweet.retweeted_status.id_str,
                            retweetDetails.retweetTweetUrl = `https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`,
                            retweetDetails.retweetTweetText = tweet.retweeted_status.full_text,
                            retweetDetails.postedAccountScreenName = tweet.retweeted_status.user.screen_name
                    }

                    if (tweet.entities.user_mentions) {
                        tweet.entities.user_mentions.map((mention) => {
                            mentions.push(`@${mention.screen_name}`);
                        });
                    }
                    if (tweet.entities.hashtags) {
                        if (tweet.entities.hashtags.length > 0) {
                            tweet.entities.hashtags.map((hashtag) => {
                                hashtags.push(`#${hashtag.text}`);
                            });
                        }
                    }
                    if (mediaUrls.length == 0) {
                        mediaUrls = null
                    }

                    let tweetDetails = {
                        tweetId: tweet.id_str,
                        publishedDate: tweet.created_at,
                        description: text,
                        mediaUrls: mediaUrls,
                        hashtags: hashtags,
                        mentions: mentions,
                        retweetCount: tweet.retweet_count,
                        favoriteCount: tweet.favorite_count,
                        // accountId: socialId,
                        postedAccountId: tweet.user.id_str,
                        postedAccountScreenName: tweet.user.screen_name,
                        postedAccountProfilePic: tweet.user.profile_image_url_https,
                        //   isApplicationPost: source,
                        tweetUrl: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                        quoteDetails: quoteDetails,
                        replayDetails: replayDetails,
                        retweetStatus: retweetDetails,
                        isReplayTweet: isReplayTweet,
                        isReTweet: isReTweet,
                        isLiked: tweet.favorited,
                        //  batchId: batchId,
                        //  version: version,
                        sentiment: sentimentData,
                    };

                    postDetails.tweets.push(tweetDetails);
                });
            postDetails.count = postDetails.tweets.length;
            try {
                var maxId = jsonOut.search_metadata.next_results.split("?max_id=")
                var max = maxId[1].split("&q=")
                postDetails.max_id = max[0];
                var maxId = jsonOut.search_metadata.refresh_url.split("?since_id=")
                var max = maxId[1].split("&q=")
                postDetails.since_id = max[0];

            } catch (error) {
                reject(error)
            }
            resolve(postDetails);
        }
    })
};
// For making follow to a specified account
Twitter.prototype.followTwitterId = function (accessToken, accessTokenSecret, screen_name) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !accessTokenSecret) {
            reject(new Error("Invalid Inputs"));
        } else {
            var twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);
            var queryString = { screen_name };
            twitterClient.post('friendships/create', queryString, function (error, tweet, response) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error[0]);
                } else {
                    // Sending response
                    resolve(response);
                }
            });
        }
    });
};


export default Twitter;
