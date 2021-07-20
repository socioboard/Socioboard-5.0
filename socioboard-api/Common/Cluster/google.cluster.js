import request from 'request';
import requestPromise from 'request-promise';
import moment from 'moment';
import {google } from 'googleapis'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import logger from '../../Publish/resources/Log/logger.log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let oAuth2Client;
function Google(google_api) {
    this.google_api = google_api;

    this.googleConfig = {
        clientId: this.google_api.client_id,
        clientSecret: this.google_api.client_secrets,
        redirect: this.google_api.google_profile_add_redirect_url,
    };
    oAuth2Client = new google.auth.OAuth2(
        this.google_api.client_id,
        this.google_api.client_secrets,
        this.google_api.google_profile_add_redirect_url
    );
}



Google.prototype.getGoogleAuthUrl = function (type, state) {
    var url = "";
    switch (type) {
        case "login":
            url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.login_scopes}&access_type=offline`;
            break;
        case "youtube":
            // url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.google_profile_add_redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.youtube_scopes}&access_type=offline&state=${state}`;
            url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${this.google_api.google_profile_add_redirect_url}&prompt=consent&response_type=code&client_id=${this.google_api.client_id}&scope=${this.google_api.youtube_scopes}&access_type=offline`;
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

/**
 * TODO get the Youtube channel Details
 * Function to get the Youtube channel Details
 * @param  {string} code - Youtube Auth Code
 * @return {object} Return User channel details with Access Token
 */
Google.prototype.getYoutubeChannels = function (code) {
    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Invalid youtube code'));
      } else {
        this.getGoogleAccessToken(
          code,
          this.google_api.google_profile_add_redirect_url
        )
          .then(tokens => {
            if (!tokens) {
              reject(new Error('Invalid access token'));
            } else {
              request.get(
                {
                  headers: {Authorization: `Bearer ${tokens.access_token}`},
                  url: 'https://www.googleapis.com/youtube/v3/channels/?part=snippet%2CcontentDetails%2Cstatistics&mine=true&maxResults=50',
                },
                (error, response, body) => {
                  if (error) {
                    logger.error(
                      `prototype.getYoutubeChannels: Error in fetching Youtube Data from URL`
                    );
                    callback(error, null);
                  } else {
                    let parsedBody = JSON.parse(body);
                    resolve({parsedBody, tokens});
                  }
                }
              );
            }
          })
          .catch(error => {
            logger.error(
              `prototype.getYoutubeChannels: Error in fetching Youtube Data`
            );
            reject(error);
          });
      }
    });
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
                console.error(`Error in getting the Access Token ${error}`)
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
                        resolve(youtubeFeeds);
                    })
                    .catch((error) => {
                        resolve(youtubeFeeds);
                    });
            }
        });
    });
};

Google.prototype.youtubeVideoLike = function (videoId, rating, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!videoId || !rating || !refreshToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            this.reconnectGoogle(refreshToken, async (error, tokens) => {
                if (error) {
                    reject(error);
                } else {
                    const ratingresult = await this.getVideoRatingDetails(videoId, tokens.access_token);
                    if (ratingresult == "none" || ratingresult != rating) {
                        request.post({
                            url: `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=${rating}&access_token=${tokens.access_token}`,
                        }, function (error_1, response, body) {
                            if (error_1) {
                                reject(error_1);
                            } else {
                                resolve(response);
                            }
                        });
                    }
                    else {
                        resolve(`Already ${rating}ed`);
                    }
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
                            resolve(body);
                        }
                    });
                }
            });
        }
    });


};

Google.prototype.reconnectGoogle = function (refreshtoken, callback) {
    try {
        var requestBody = `client_secret=${this.google_api.client_secrets}&grant_type=refresh_token&refresh_token=${refreshtoken}&client_id=${this.google_api.client_id}`;
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

Google.prototype.getVideoRatingDetails = function (videoId, refreshToken) {
    return new Promise((resolve, reject) => {
        if (!videoId || !refreshToken) {
            reject(new Error('Invalid Inputs'));
        }
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                reject(error);
            } else {
                requestPromise.get(`https://www.googleapis.com/youtube/v3/videos/getRating?id=${videoId}&part=statistics&access_token=${tokens.access_token}`)
                    .then((response) => {
                        var parsedResponse = JSON.parse(response);
                        resolve(parsedResponse.items[0].rating);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

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
                            resolve(body);
                        }
                    });
                }
            });
        }
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

        requestPromise.post(postParams)
            .then((response) => {
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
                var url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=day&endDate=${moment(untill).format("YYYY-MM-DD")}&ids=channel%3D%3D${socialId}&metrics=${this.google_api.youtube_insights_metrics}&sort=-day&startDate=${moment(since).format("YYYY-MM-DD")}&access_token=${tokens.access_token}`;
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

/**
 * TODO To upload youtube video to particular youTube account
 * Upload video to youtube account
 * @param  {object} post Post details that should post to youtube
 * @param  {string} refreshToken Refresh token for  connect to  youtube
 * @return {object} Returns youtube upload message
 */
Google.prototype.uploadYouTubeVideo = function (post, refreshToken) {
    return new Promise((resolve, reject) => {
        this.reconnectGoogle(refreshToken, (error, tokens) => {
            if (error) {
                reject('Token Missing.');
            }
            else {
                var basePath = path.resolve(__dirname, '../../..');
                let filePath = `${basePath}/media/${post.mediaUrls[0]}`;
                oAuth2Client.setCredentials(tokens);
                let youtube = google.youtube({ version: "v3", auth: oAuth2Client });
                return youtube.videos.insert(
                    {
                        resource: post.resource,
                        // This is for the callback function
                        part: "snippet,status",
                        // Create the readable stream to upload the video
                        media: {
                            body: fs.createReadStream(filePath)
                        },
                    })
                    .then(() => resolve("Video Uploaded Successfully"))
                    .catch(error => reject(error));
            }
        });
    });
};

export default Google;
