const request = require('request');
const fs = require('fs');
const { google } = require('googleapis');
const requestPromise = require('request-promise');
const crypto = require('crypto');
const moment = require('moment');
const logger = require('../utils/logger');


function Google(google_api) {
    this.google_api = google_api;

    this.googleConfig = {
        clientId: this.google_api.client_id,
        clientSecret: this.google_api.client_secrets,
        redirect: this.google_api.google_profile_add_redirect_url,
    };
}

function getOauthConnection(accessToken, refreshToken) {
    var oAuthConnection = new google.auth.OAuth2(this.googleConfig.clientId, this.googleConfig.clientSecret, this.googleConfig.redirect);
    oAuthConnection.credentials = { access_token: accessToken, refresh_token: refreshToken };
    return oAuthConnection;
}

// Creating a different urls to hit google based on request type
Google.prototype.getGoogleAuthUrl = function (type, state) {
    var url = "";
    switch (type) {
        case "login":
            url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.login_scopes}&access_type=offline`;
            break;
        case "youtube":
            url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.google_profile_add_redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.youtube_scopes}&access_type=offline&state=${state}`;
            break;
        case "googleAnalytics":
            url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.google_profile_add_redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.ganalytics_scopes}&access_type=offline&state=${state}`;
            break;
        default:
            break;
    }
    // Returning a specified url based on request type
    return url;
};

Google.prototype.getGoogleAccessToken = function (code, redirectUrl) {
    return new Promise((resolve, reject) => {
        var requestBody = `code=${code}&redirect_uri=${redirectUrl}&client_id=${this.google_api.client_id}&client_secret=${this.google_api.client_secrets}&scope=&grant_type=authorization_code`;
        // Hitting google to get accessToken and refreshToken
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'https://www.googleapis.com/oauth2/v4/token',
            body: requestBody
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                var tokens = {
                    access_token: parsedBody.access_token,
                    refresh_token: parsedBody.refresh_token
                };
                // Sending response 
                resolve(tokens);
            }
        });
    });
};

Google.prototype.getGoogleProfileInformation = function (tokens) {

    return new Promise((resolve, reject) => {
        // Hitting google with accessToken to get data of google profile details
        request.get({
            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        }, function (error, response, body) {

            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                const userGoogleId = parsedBody.id;
                const userGoogleEmail = parsedBody.email;
                const firstName = parsedBody.given_name;
                const lastName = parsedBody.family_name;
                const profilePicUrl = parsedBody.picture;
                var birthday = parsedBody.birthday ? parsedBody.birthday : '';
                var profileLink = parsedBody.link;

                var userDetails = {
                    id: userGoogleId,
                    email: userGoogleEmail,
                    firstName: firstName,
                    lastName: lastName,
                    profilePicUrl: profilePicUrl,
                    birthday: birthday,
                    profileLink: profileLink,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                };
                // Sending response    
                resolve(userDetails);
            }
        });
    });


};

Google.prototype.reconnectGoogle = function (refreshtoken, callback) {
    try {
        var requestBody = `client_secret=${this.google_api.client_secrets}&grant_type=refresh_token&refresh_token=${refreshtoken}&client_id=${this.google_api.client_id}`;
        // Hitting google to reconnect (extend the accessToken validity)
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'https://www.googleapis.com/oauth2/v4/token',
            body: requestBody
        }, function (error, response, body) {

            if (error) {
                callback(error, null);
            } else {
                var parsedBody = JSON.parse(body);
                callback(null, parsedBody);
            }
        });
    } catch (error) {
        callback(`Error : ${error}`);
    }
};

Google.prototype.getYoutubeChannels = function (code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject(new Error("Invalid youtube code"));
        } else {
            this.getGoogleAccessToken(code, this.google_api.google_profile_add_redirect_url)
                .then((tokens) => {
                    if (!tokens) {
                        reject(new Error("Invalid access token"));
                    } else {
                        // Hitting google to get data of youtube channels
                        request.get({
                            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
                            url: 'https://www.googleapis.com/youtube/v3/channels/?part=snippet%2CcontentDetails%2Cstatistics&mine=true&maxResults=50'
                        }, function (error, response, body) {
                            if (error) {
                                callback(error, null);
                            } else {
                                var parsedBody = JSON.parse(body);
                                // Sending response        
                                resolve({ parsedBody: parsedBody, tokens: tokens });
                            }
                        });
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Google.prototype.getGoogleAnalyticsAccount = function (code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject(new Error("Invalid code from google analytics!"));
        } else {
            return this.getGoogleAccessToken(code, this.google_api.google_profile_add_redirect_url)
                .then((tokens) => {
                    // Hitting google to get data google analtics
                    request.get({
                        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
                        url: 'https://www.googleapis.com/analytics/v3/management/accountSummaries'
                    }, function (error, response, body) {
                        if (error) {
                            reject(error);
                        } else {
                            var parsedBody = JSON.parse(body);
                            // Sending response          
                            resolve({ parsedBody: parsedBody, tokens: tokens });
                        }
                    });
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Google.prototype.getActiveUserDetails = function (refreshToken, profileId, callback) {
    this.reconnectGoogle(refreshToken, (error, tokens) => {

        if (error) {
            callback({ code: 400, status: "failed", error: error });
        }
        else {
            // Hitting google to get data of present user details
            request.get({
                url: `https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:${profileId}&metrics=${this.google_api.ganalytics_activeuser_metrics}&dimensions=${this.google_api.ganalytics_activeuser_dimensions}&access_token=${tokens.access_token}`
            }, function (error, response, body) {
                if (error) {
                    callback(error, null);
                } else {
                    var parsedBody = JSON.parse(body);

                    var activeTrafficDetails = [];

                    parsedBody.rows.forEach(traffic => {
                        var trafficDetail = {
                            deviceCategory: traffic[0],
                            operatingSystem: traffic[1],
                            pagePath: traffic[2],
                            country: traffic[3],
                            trafficType: traffic[4],
                            minutesAgo: traffic[5],
                            userType: traffic[6],
                            count: traffic[7],
                        };
                        activeTrafficDetails.push(trafficDetail);
                    });

                    var details = {
                        activeUser: parsedBody.totalsForAllResults["rt:activeUsers"],
                        activeTrafficDetails: activeTrafficDetails
                    };

                    callback({ code: 200, status: "success", message: details });
                }
            });
        }
    });
};

Google.prototype.getPageViewDetails = function (refreshToken, profileId, startDate, endDate, callback) {
    this.reconnectGoogle(refreshToken, (error, tokens) => {
        if (error) {
            callback({ code: 400, status: "failed", error: error });
        }
        else {
            // Hitting google to get data of analytics page view details
            request.get({
                url: `https://www.googleapis.com/analytics/v3/data/ga?ids=ga:${profileId}&metrics=${this.google_api.ganalytics_page_detail_metrics}&start-date=${startDate}&end-date=${endDate}&access_token=${tokens.access_token}`
            }, function (error, response, body) {
                if (error) {
                    callback(error, null);
                } else {
                    // Formating the response(making body data to JSON)
                    var parsedBody = JSON.parse(body);
                    var trafficDetail = {
                        sessions: parsedBody.totalsForAllResults["ga:sessions"],
                        pageviews: parsedBody.totalsForAllResults["ga:pageviews"]
                    };
                    callback({ code: 200, status: "success", message: trafficDetail });
                }
            });
        }
    });
};

Google.prototype.firebaseShortUrls = function (dynamicUrl, apiKey, longUrl) {

    return new Promise((resolve, reject) => {
        var requestBody = {
            "longDynamicLink": `${dynamicUrl}/?link=${longUrl}`
        };
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`,
            body: requestBody,
            json: true
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                // Sending response        
                resolve(body);
            }
        });
    });
};


Google.prototype.youtubeVideoLike = function (videoId, rating, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!videoId || !rating || !refreshToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            this.reconnectGoogle(refreshToken, (error, tokens) => {
                if (error) {
                    reject(error);
                } else {
                    return this.getVideoRatingDetails(videoId, tokens.access_token)
                        .then((ratingresult) => {
                            if (ratingresult == "none" || ratingresult != rating) {
                                request.post({
                                    url: `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=${rating}&access_token=${tokens.access_token}`,
                                }, function (error, response, body) {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        // Sending response       
                                        resolve(response);
                                    }
                                });
                            }
                            else {
                                // Sending response        
                                resolve(`Already ${rating}ed`);
                            }
                        });
                }
            });
        }
    });
};

Google.prototype.youtubeCommentReply = function (parentId, comment, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!parentId || !comment || !refreshToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            this.reconnectGoogle(refreshToken, (error, tokens) => {
                if (error) {
                    reject(error);
                } else {
                    var postData = {
                        "snippet": {
                            "parentId": parentId,
                            "textOriginal": comment
                        }
                    };
                    // Hitting google to make a comment to a comment
                    request({
                        url: `https://www.googleapis.com/youtube/v3/comments?part=snippet&access_token=${tokens.access_token}`,
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(postData)
                    }, (error, response, body) => {

                        if (error) {
                            reject(error);
                        }
                        else {
                            // Sending response       
                            resolve(body);
                        }
                    });
                }
            });
        }
    });


};

Google.prototype.youtubeVideoComment = function (videoId, comment, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!videoId || !comment || !refreshToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            this.reconnectGoogle(refreshToken, (error, tokens) => {
                if (error) {
                    reject(error);
                } else {
                    var postData = {
                        "snippet": {
                            "topLevelComment": {
                                "snippet": {
                                    "textOriginal": comment
                                }
                            },
                            "videoId": videoId
                        }
                    };
                    // Hitting google to make a comment to an youtube video
                    request({
                        url: `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&access_token=${tokens.access_token}`,
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(postData)
                    }, (error, response, body) => {

                        if (error) {
                            reject(error);
                        }
                        else {
                            // Sending response        
                            resolve(body);
                        }
                    });
                }
            });
        }
    });


};

Google.prototype.getYoutubeChannelsInfo = function (channelId, refreshToken) {
    return new Promise((resolve, reject) => {
        var youtubeFeeds = [];
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                reject('Token Missing.');
            } else {
                requestPromise.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&access_token=${tokens.access_token}&type=video`)
                    .then((response) => {
                        var parsedResponse = JSON.parse(response);
                        parsedResponse.items.forEach((feed) => {
                            var feedObject = {
                                videoId: feed.id.videoId,
                                channelId: feed.snippet.channelId,
                                channelTitle: feed.snippet.channelTitle,
                                title: feed.snippet.title,
                                description: feed.snippet.description,
                                publishedDate: feed.snippet.publishedAt,
                                thumbnailUrls: feed.snippet.thumbnails.high.url,
                                embed_url: `https://www.youtube.com/embed/${feed.id.videoId}`,
                                etag: feed.etag,
                                isFeedPost: true,
                                isLiked: "none",
                                mediaUrl: `https://www.youtube.com/watch?v=${feed.id.videoId}`,
                                version: this.google_api.version,
                                updatedDate: moment().utc(),
                                createdDate: moment().utc()
                            };
                            youtubeFeeds.push(feedObject);
                        });
                        if (parsedResponse.nextPageToken)
                            return parsedResponse.nextPageToken;
                        return null;
                    })
                    .then((nextPageToken) => {
                        if (nextPageToken) {
                            requestPromise.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&pageToken=${nextPageToken}&type=video&access_token=${tokens.access_token}&type=video`)
                                .then((response) => {
                                    var parsedResponse = JSON.parse(response);
                                    parsedResponse.items.forEach((feed) => {
                                        var feedObject = {
                                            videoId: feed.id.videoId,
                                            channelId: feed.snippet.channelId,
                                            channelTitle: feed.snippet.channelTitle,
                                            title: feed.snippet.title,
                                            description: feed.snippet.description,
                                            publishedDate: feed.snippet.publishedAt,
                                            thumbnailUrls: feed.snippet.thumbnails.high.url,
                                            embed_url: `https://www.youtube.com/embed/${feed.id.videoId}`,
                                            etag: feed.etag,
                                            isFeedPost: true,
                                            isLiked: "none",
                                            mediaUrl: `https://www.youtube.com/watch?v=${feed.id.videoId}`,
                                            version: this.google_api.version
                                        };
                                        youtubeFeeds.push(feedObject);
                                    });
                                    if (parsedResponse.nextPageToken)
                                        return parsedResponse.nextPageToken;
                                    return null;
                                });
                        }
                        // Sending response           
                        resolve(youtubeFeeds);
                    })
                    .catch((error) => {
                        // Sending response         
                        resolve(youtubeFeeds);
                    });
            }
        });
    });
};

Google.prototype.getYtbChannelDetails = function (channelId, refreshToken) {
    return new Promise((resolve, reject) => {
        var youtubeFeeds = [];
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                reject('Token Missing.');
            } else {
                requestPromise.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&access_token=${tokens.access_token}`)
                    .then((result) => {
                        var response = JSON.parse(result);
                        var updateDetail = {
                            total_post_count: response.items[0].statistics.videoCount,
                            profile_picture: response.items[0].snippet.thumbnails.high.url,
                            bio_text: response.items[0].snippet.description,
                            subscription_count: response.items[0].statistics.subscriberCount
                            // "viewCount": "130",
                            // "commentCount": "0",
                        };
                        // Sending response       
                        resolve(updateDetail);
                    })
                    .catch((error) => {
                        // Sending response     
                        resolve(youtubeFeeds);
                    });
            }
        });
    });
};

Google.prototype.getYoutubeChannelVideos = function (refreshToken, callback) {
    this.reconnectGoogle(refreshToken, (error, tokens) => {
        if (error) {
            callback({ code: 400, status: "failed", error: error });
        } else {
            // Hitting google to get data of youtube videos
            request.get({
                url: `https://www.googleapis.com/youtube/v3/search/?part=snippet&maxResults=25&forMine=true&access_token=${tokens.access_token}&type=video`
            }, function (error, response, body) {
                if (error) {
                    callback(error, null);
                } else {
                    var parsedBody = JSON.parse(body);
                    callback(null, parsedBody);
                }
            });
        }
    });
};

Google.prototype.getVideoRatingDetails = function (videoId, refreshToken) {

    return new Promise((resolve, reject) => {
        if (!videoId || !refreshToken) {
            reject(new Error('Invalid Inputs'));
        }
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                reject(error);
            } else {
                // Hitting google to get data of video ratings
                requestPromise.get(`https://www.googleapis.com/youtube/v3/videos/getRating?id=${videoId}&part=statistics&access_token=${tokens.access_token}`)
                    .then((response) => {
                        var parsedResponse = JSON.parse(response);
                        // Sending response        
                        resolve(parsedResponse.items[0].rating);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

    });
};


Google.prototype.updateSubscriptions = function (channelId, isSubscribe) {
    return new Promise((resolve, reject) => {
        var mode = isSubscribe ? 'subscribe' : 'unsubscribe';
        var hub = 'https://pubsubhubbub.appspot.com/subscribe';
        var callback = this.google_api.youtube_webhook_url;
        var topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;

        var callbackUrl = callback +
            (callback.replace(/^https?:\/\//i, "").match(/\//) ? "" : "/") +
            (callback.match(/\?/) ? "&" : "?") +
            "topic=" + encodeURIComponent(topicUrl) +
            "&hub=" + encodeURIComponent(hub);

        var form = {
            "hub.callback": callbackUrl,
            "hub.mode": mode,
            "hub.topic": topicUrl,
            "hub.verify": "async"
        };

        form["hub.secret"] = crypto.createHmac("sha1", this.google_api.client_secrets).update('Test').digest("hex");

        var postParams = {
            url: hub,
            form: form,
            encoding: "utf-8"
        };
        // Hitting google to update subscription
        requestPromise.post(postParams)
            .then((response) => {
                // Sending response          
                resolve(`${mode} done!`);
            })
            .catch((error) => {
                reject(`${mode} unsuccessfull!`);
            });
    });
};

Google.prototype.youtubeInsights = function (refreshToken, socialId, since, untill) {
    return new Promise((resolve, reject) => {
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                callback({ code: 400, status: "failed", error: error });
            } else {
                var url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=day&endDate=${untill}&ids=channel%3D%3D${socialId}&metrics=${this.google_api.youtube_insights_metrics}&sort=-day&startDate=${since}&access_token=${tokens.access_token}`;
                // Hitting google to get data of youtube insights
                return request.get(url, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        var parsedBody = JSON.parse(body);
                        // Sending response       
                        resolve(parsedBody);
                    }
                });
            }
        });
    });
};

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
    for (var p in params) {
        if (!params[p] || params[p] == 'undefined') {
            delete params[p];
        }
    }
    return params;
}

/**
 * Create a JSON object, representing an API resource, from a list of
 * properties and their values.
 *
 * @param {Object} properties A list of key-value pairs representing resource
 *                            properties and their values.
 * @return {Object} A JSON object. The function nests properties based on
 *                  periods (.) in property names.
 */
function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
        var value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (let p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
                var key = propArray[pa];
                if (pa == propArray.length - 1) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        }
    }
    return resource;
}

Google.prototype.uploadVideoOnYoutube = function (accessToken, refreshToken, postDetails, callback) {

    // Updating the token
    this.reconnectGoogle(refreshToken, (error, tokens) => {

        // Checking whether it sent error in callback or not
        if (error) {
            callback({ code: 400, status: "failed", error: error });
        }
        else {
            var oAuthConnection = new google.auth.OAuth2(this.googleConfig.clientId, this.googleConfig.clientSecret, this.googleConfig.redirect);
            oAuthConnection.credentials = tokens;

            var properties = {
                'snippet.categoryId': '22',
                'snippet.defaultLanguage': '',
                'snippet.description': postDetails.message,
                'snippet.tags[]': '',
                'snippet.title': postDetails.message,
                'status.embeddable': '',
                'status.license': '',
                'status.privacyStatus': postDetails.postType,
                'status.publicStatsViewable': ''
            };

            var params = { 'part': 'snippet,status' };
            var service = google.youtube('v3');
            var parameters = removeEmptyParameters(params);
            parameters.auth = oAuthConnection;
            parameters.media = { body: fs.createReadStream(`public/videos/${postDetails.mediaPath}`) };
            parameters.notifySubscribers = false;
            // creating the source of video
            parameters.resource = createResource(properties);
            // Hitting the google api to add Video into youtube
            var req = service.videos.insert(parameters, function (err, data) {
                // Checking whether it sent error in callback or not
                if (err) {
                    //callback({ code: 403, status: "failed", message: err });
                    //callback(err);
                    logger.info(err);
                }
                if (data) {
                    // logger.info('The API returned response: ' + JSON.stringify(data) );
                    //callback({ code: 200, status: "success", message: data });
                    //callback(data);
                    logger.info(data);
                }
            });

            // var oAuthConnection = getOauthConnection(access_token, refreshToken);
            // const youtube = google.youtube({
            //     version: 'v3',
            //     auth: oAuthConnection,
            // });
            // youtube.videos.insert(
            //     {
            //         part: 'id,snippet,status',
            //         notifySubscribers: false,
            //         requestBody: {
            //             snippet: {
            //                 title: postDetails.message,
            //                 description: postDetails.message,
            //             },
            //             status: {
            //                 privacyStatus: postDetails.postType,
            //             },
            //         },
            //         media: {
            //             body: fs.createReadStream(`public/videos/${postDetails.mediaPath}`),
            //         },
            //     }, (response) => {
            //         logger.info(response);
            //         logger.info(` \n Old Access Token : ${accessToken} \n`);
            //         logger.info(` \n New Access Token : ${NewAccessToken} \n`);
            //         // callback({ code: 200, status: "success", message: response });
            //     }
            // );
        }
    });


    // .then((response) => {
    //     callback({ code: 200, status: "success", message: response });
    // })
    // .catch((error) => {
    //     callback({ code: 403, status: "failed", message: error });
    // });
};



module.exports = Google;



