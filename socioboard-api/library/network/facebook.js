const facebook = require('fb');
const async = require('async');
const request = require('request');
const fs = require('fs');
const moment = require('moment');
const requestPromise = require('request-promise');
const fbversion = "v3.3";
const path = require('path');
const logger = require('../utils/logger');

function Facebook(facebook_api) {
    this.facebook_api = facebook_api;
}

// For getting access token from Facebook
Facebook.prototype.getAppAccessToken = function () {
    return new Promise((resolve, reject) => {
        try {
            // Setting up the api hit with required inputs
            facebook.api('oauth/access_token', {
                client_id: this.facebook_api.app_id,
                client_secret: this.facebook_api.secret_key,
                grant_type: 'client_credentials'
            }, function (res) {
                // Checking whether it sent error in response or not
                if (!res || res.error) {
                    // If it sents error in response we are throwing that error
                    return new Error(res.error);
                }
                // Sending response  
                resolve(res.access_token);
            });
        } catch (error) {
            reject(error.message);
        }
    });
};

// For fetching access token of a user
Facebook.prototype.getUserAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        // Setting up Api call with required inputs
        facebook.api('oauth/access_token', {
            client_id: this.facebook_api.app_id,
            client_secret: this.facebook_api.secret_key,
            redirect_uri: this.facebook_api.redirect_url,
            code: code
        }, function (res) {
            // Checking whether it sent error in response or not
            if (!res || res.error) {
                reject(res.error);
            }
            var accessToken = res.access_token;
            var expires = res.expires ? res.expires : 0;
            // Sending response    
            resolve(accessToken);
        });
    });
};

// For getting user profile account access token
Facebook.prototype.getProfileAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that code having data or not
        if (!code) {
            reject('Invalid code from facebook');
        } else {
            // Setting up the variables and links to request facebook Graph-api 
            var postOptions = {
                method: 'GET',
                uri: `https://graph.facebook.com/${fbversion}/oauth/access_token`,
                // Setting JSON inputs to query
                qs: {
                    client_id: this.facebook_api.app_id,
                    redirect_uri: this.facebook_api.fbprofile_add_redirect_url,
                    client_secret: this.facebook_api.secret_key,
                    code: code
                }
            };
            // Hitting graph-api with promise 
            return requestPromise(postOptions)
                .then((response) => {
                    // Formating the response
                    var parsedResponse = JSON.parse(response);
                    // Sending response   
                    resolve(parsedResponse.access_token);
                })
                .catch((error) => {
                    // rejecting error 
                    reject(error);
                });
        }
    });
};

// Extending the access token for not getting expired access token message
Facebook.prototype.extendAccessToken = function (accessToken, callback) {
    // Setting up facebook Graph-api for exchange token with expire date increment by 30 days
    facebook.api('oauth/access_token', {
        client_id: this.facebook_api.app_id,
        client_secret: this.facebook_api.secret_key,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken
    }, function (res) {
        // Checking whether it sent error in response or not
        if (!res || res.error) {
            logger.info(!res ? 'error occurred' : res.error);
            return;
        }
        var accessToken = res.access_token;
        var expires = res.expires ? res.expires : 0;
        // Sending updated accessToken in callback response
        callback(accessToken);
    });
};

// For fetching the account information with input as accessToken of that particular account
Facebook.prototype.userProfileInfo = function (accessToken) {
    // Fetching profile details with accessToken of a user
    var url = `https://graph.facebook.com/${fbversion}/me?fields=id,name,email,birthday,first_name,last_name,friends&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                // Checking the request is having any error or not
                reject(error);
            } else {
                // Formating the body (the response of facebook call)
                var parsedBody = JSON.parse(body);
                var profileInfo = {
                    user_id: parsedBody.id,
                    name: parsedBody.name,
                    email: parsedBody.email,
                    birthday: parsedBody.birthday,
                    first_name: parsedBody.first_name,
                    last_name: parsedBody.last_name,
                    friend_count: parsedBody.friends ? parsedBody.friends.summary ? parsedBody.friends.summary.total_count : '0' : '0',
                    access_token: accessToken
                };
                // Sending response           
                resolve(profileInfo);
            }
        });
    });
};

// Fetching the required user details to add user into DB
Facebook.prototype.addFacebookProfile = function (network, teamId, code) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that code is having data or not
        if (!code) {
            reject("Facebook code is invalid!");
        } else {
            // Fetching access token from facebook using user code
            this.getProfileAccessToken(code)
                .then((accessToken) => {
                    // Validating whether we got access token in response or not(any error)
                    if (!accessToken)
                        throw new Error("Cant able to fetch access token.");
                    else {
                        this.userProfileInfo(accessToken)
                            .then((userDetails) => {
                                if (!userDetails) {
                                    throw new Error("Cant able to fetch user details");
                                } else {
                                    // Formating the response
                                    var user = {
                                        UserName: userDetails.user_id,
                                        FirstName: userDetails.first_name,
                                        LastName: userDetails.last_name ? userDetails.last_name : '',
                                        Email: userDetails.email,
                                        SocialId: userDetails.user_id,
                                        ProfilePicture: `https://graph.facebook.com/${userDetails.user_id}/picture?type=large`,
                                        ProfileUrl: `https://facebook.com/${userDetails.user_id}`,
                                        AccessToken: userDetails.access_token,
                                        RefreshToken: userDetails.access_token,
                                        FriendCount: userDetails.friend_count,
                                        Info: '',
                                        TeamId: teamId,
                                        Network: network,
                                    };
                                    // Sending response          
                                    resolve(user);
                                }
                            })
                            .catch((error) => {
                                throw new Error(error.message);
                            });
                    }
                })
                .catch((error) => {
                    reject(error.message);
                });
        }
    });
};

// For fetching facebook pages
Facebook.prototype.getOwnFacebookPages = function (code) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that code is having data or not
        if (!code) {
            reject("Invalid code from facebook");
        } else {
            // Fetching access token from facebook using user code
            return this.getProfileAccessToken(code)
                .then((accessToken) => {
                    // Validating whether we got access token in response or not(any error)
                    if (!accessToken) {
                        reject("Cant able to get the facebok access token!");
                    } else {
                        // Fetching user pages from that user access token
                        return this.userPageDetails(accessToken);
                    }
                })
                .then((pageDetails) => {
                    // Sending response           
                    resolve(pageDetails);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Facebook.prototype.getOwnFacebookGroups = function (code) {

    return new Promise((resolve, reject) => {
        var userAccessToken = {};
        // Checking the input data, that code is having data or not
        if (!code) {
            reject(new Error("Invalid code from facebook"));
        } else {
            // Fetching access token from facebook using user code
            this.getProfileAccessToken(code)
                .then((accessToken) => {
                    userAccessToken = accessToken;
                    // Fetching facebook groups from the facebook user accesstoken 
                    return this.userAdminGroupDetails(accessToken);
                })
                .then((groupDetails) => {
                    // Formating the response
                    var groupInfo = {
                        accessToken: userAccessToken,
                        groupDetails: groupDetails
                    };

                    // Sending response          
                    resolve(groupInfo);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

// Fetching details of a facebook group
Facebook.prototype.userGroupDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        // Requesting facebook graph-api for details of a group with group accessToken
        request.get(`https://graph.facebook.com/${fbversion}/me/groups?fields=id,name,picture.type(large){url}&access_token=${accessToken}`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                // Formating the response
                var parsedBody = JSON.parse(body);
                // Checking the pagination (any extra groups avaiable or not)
                pagination(parsedBody, (error, result) => {
                    // Checking whether it sent error in callback or not
                    if (error || error != null) {
                        reject(error);
                    }
                    let data = result.data;
                    // Sending response          
                    resolve(data);
                });
            }
        });
    });
};

Facebook.prototype.userAdminGroupDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that "accessToken" is having data or not
        if (!accessToken) {
            reject(new Error("Invalid access token from facebook"));
        } else {
            request.get(`https://graph.facebook.com/${fbversion}/me/groups?fields=id,name,picture{url},member_count,administrator,member_request_count&access_token=${accessToken}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var parsedBody = JSON.parse(body);
                    pagination(parsedBody, (error, result) => {
                        // Checking whether it sent error in callback or not
                        if (error || error != null) {
                            reject(error);
                        }
                        let data = result.data;
                        // Sending response         
                        resolve(data);
                    });
                }
            });
        }
    });
};

// For fetching the feeds of an page with socialId (facebook page Id) and accessToken of that.
function getFacebookFeeds(socialId, accessToken, callback) {
    facebook.setAccessToken(accessToken);
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,likes.summary(true),comments.summary(true),type,application&limits=50`, (response) => {
        if (!response || response.error) {
            callback(response.error, null);
        } else {
            pagination(response, (error, result) => {
                // Checking whether it sent error in callback or not
                if (error || error != null) {
                    callback(error, null);
                }
                let data = result.data;
                callback(null, data);
            });

        }
    });
}

// Fetching recent feeds from facebook
function getRecentFacebookFeeds(socialId, accessToken, since, callback) {
    // Changing the input time to Unix format
    var from = String(moment(since).unix());
    var currentUnixTime = String(moment().unix());
    // Setting access token
    facebook.setAccessToken(accessToken);
    // Calling graph-api for fetching feeds
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,likes.summary(true),comments.summary(true),type,application&since=${from}&untill=${currentUnixTime}&limit=50`, (response) => {
        if (!response || response.error) {
            // Sending response back
            callback(response.error, null);
        } else {
            // Fetching data by paginations (checking we have new page data or not)
            pagination(response, (error, result) => {
                // Checking the callback contains error or not
                if (error || error != null) {
                    callback(error, null);
                }
                let data = result.data;
                // Sending response back
                callback(null, data);
            });
        }
    });
}

// Fetching posts from facebook of existing account
Facebook.prototype.getFacebookPosts = function (accessToken, socialId, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not
        if (!accessToken || !socialId || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            // Fetching facebook feeds with accessToken using callback
            getFacebookFeeds(socialId, accessToken, (error, feedDetails) => {
                // Checking whether it sent error in callback or not
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };

                // Formating the response
                if (feedDetails) {
                    feedDetails.forEach(function (feed) {

                        var feedId = feed.id.replace(`${socialId}_`, '');
                        var privacy = feed.privacy.value;
                        var createdTime = moment(feed.created_time).utc();
                        var feedMessage = feed.message ? feed.message : "";
                        var feedLink = feed.link ? feed.link : `https://www.facebook.com/${feedId}`;
                        var mediaUrls = [];
                        var isApplicationPost = false;
                        if (feed.application) {
                            var applicationId = feed.application.id;
                            if (applicationId == facebookAppId) {
                                isApplicationPost = true;
                            }
                        }
                        if (feed.type == 'photo' || feed.type == 'album') {
                            if (feed.attachments && feed.attachments.data.length > 0) {
                                feed.attachments.data.forEach(data => {
                                    if (data.subattachments) {
                                        data.subattachments.data.forEach(data => {
                                            if (data.type == 'photo') {
                                                var media = data.media.image.src;
                                                mediaUrls.push(media);
                                            }
                                        });
                                    } else {
                                        if (data.type == 'photo') {
                                            var media = data.media.image.src;
                                            mediaUrls.push(media);
                                        }
                                    }
                                });
                            }
                        }
                        else if (feed.type == 'video') {
                            var media = feed.source;
                            mediaUrls.push(media);
                        }

                        // Assining values to the keys
                        var feedObject = {
                            postId: feedId,
                            privacy: privacy,
                            publishedDate: createdTime,
                            postType: feed.type,
                            description: feedMessage,
                            postUrl: feedLink,
                            isApplicationPost: isApplicationPost,
                            mediaUrls: mediaUrls,
                            likeCount: feed.likes ? feed.likes.summary.total_count : 0,
                            commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                            socialAccountId: socialId,

                            batchId: batchId,
                            version: version
                        };
                        postDetails.feeds.push(feedObject);
                    });

                    // Sending response         
                    resolve(postDetails);
                }
                else {
                    // Sending response      
                    resolve(postDetails);
                }
            });
        }
    });
};

/**
 * It will fetch the recent facebook feeds from a specifed feed of a particular account(facebook page)
 * @facebookAppId is which we are using for connecting facebook accounts (Facebook APP Id)
 */
Facebook.prototype.getRecentFacebookFeeds = function (accessToken, socialId, since, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not 
        if (!accessToken || !socialId || !since || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            // Calling function for getting facebook feeds with socialId  accessToken and since to take recent
            getRecentFacebookFeeds(socialId, accessToken, since, (error, feedDetails) => {
                // Checking whether it sent error in callback or not
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };
                // Formating the response
                feedDetails.forEach(function (feed) {
                    var feedId = feed.id.replace(`${socialId}_`, '');
                    var privacy = feed.privacy.value;
                    var createdTime = moment(feed.created_time).utc();
                    var feedMessage = feed.message ? feed.message : "";
                    var feedLink = feed.link ? feed.link : `https://www.facebook.com/${feedId}`;
                    var mediaUrls = [];
                    var isApplicationPost = false;
                    if (feed.application) {
                        var applicationId = feed.application.id;
                        if (applicationId == facebookAppId) {
                            isApplicationPost = true;
                        }
                    }
                    if (feed.type == 'photo' || feed.type == 'album') {
                        if (feed.attachments && feed.attachments.data.length > 0) {
                            feed.attachments.data.forEach(data => {
                                if (data.subattachments) {
                                    data.subattachments.data.forEach(data => {
                                        if (data.type == 'photo') {
                                            var media = data.media.image.src;
                                            mediaUrls.push(media);
                                        }
                                    });
                                } else {
                                    if (data.type == 'photo') {
                                        var media = data.media.image.src;
                                        mediaUrls.push(media);
                                    }
                                }
                            });
                        }
                    }
                    else if (feed.type == 'video') {
                        var media = feed.source;
                        mediaUrls.push(media);
                    }
                    // Assigning the values to the object keys
                    var feedObject = {
                        postId: feedId,
                        privacy: privacy,
                        publishedDate: createdTime,
                        postType: feed.type,
                        description: feedMessage,
                        postUrl: feedLink,
                        isApplicationPost: isApplicationPost,
                        mediaUrls: mediaUrls,
                        likeCount: feed.likes ? feed.likes.summary.total_count : 0,
                        commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                        socialAccountId: socialId,

                        batchId: batchId,
                        version: version
                    };
                    postDetails.feeds.push(feedObject);
                });
                // Sending response           
                resolve(postDetails);
            });
        }
    });
};

// Fetching facebook page details using page accessToken
Facebook.prototype.userPageDetails = function (accessToken) {

    return new Promise((resolve, reject) => {
        // Checking the input data, that "accessToken" is having data or not
        if (!accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get(`https://graph.facebook.com/${fbversion}/me/accounts?fields=access_token,name,id,picture.type(large){url},fan_count&access_token=${accessToken}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    // Formating the response (data from the body to JSON)
                    var parsedBody = JSON.parse(body);
                    pagination(parsedBody, (error, result) => {
                        // Checking whether it sent error in callback or not
                        if (error || error != null) {
                            reject(error);
                        }
                        let data = result.data;
                        // Sending response           
                        resolve(data);
                    });
                }
            });
        }
    });
};

let pagination = (data, callback) => {
    // Checking the input data, that data is having data and respected fields or not
    if (data && data.paging && data.paging.next) {
        request.get(data.paging.next, (error, response, body) => {
            var bodyResponse = JSON.parse(body);
            // Looping for each object from pagination
            async.forEachSeries(bodyResponse.data, (pageData, loop) => {
                data.data.push(pageData);
                loop();
            }, (err, result) => {
                if (bodyResponse.paging != undefined) {
                    data.paging.next = bodyResponse.paging.next;
                    pagination(data, callback);
                } else {
                    callback(null, data);
                }
            });
        });
    } else {
        callback(null, data);
    }
};

// For publishing data to facebook pages
Facebook.prototype.publishPostOld = function (postDetails, accessToken, callback) {
    var basePath = path.resolve(__dirname, '../../..');
    // Setting the accessToken for facebook api
    facebook.setAccessToken(accessToken);
    // For making text post
    if (postDetails.postType == 'Text') {
        let fbPostData = {
            'message': postDetails.message,
        };
        // Hitting facebook to post a text message
        facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData, (response) => {
            if (!response || response.error) {
                callback({ code: 400, status: "failed", message: response });
            } else {
                callback({ code: 200, status: "success", message: response });
            }
        });
    }
    else if (postDetails.postType == 'OldImage') {
        var imagePath = postDetails.mediaPath[0];
        let image = fs.createReadStream(`${basePath}/media/${imagePath}`);
        let fbPostData = {
            'message': postDetails.message,
            'Source': image,
        };
        // Hitting facebook to post Images
        facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData, (response) => {
            if (!response || response.error) {
                callback({ code: 400, status: "failed", message: response });
            } else {
                callback({ code: 200, status: "success", message: response });
            }
        });
    }
    else if (postDetails.postType == 'Image') {

        logger.info(`\n Multi image post started....\n`);

        var mediaIds = [];
        return Promise.all(postDetails.mediaPath.map(function (mediaUrl) {
            let image = fs.createReadStream(`${basePath}/media/${mediaUrl}`);
            let fbPostData = {
                'message': postDetails.message,
                'Source': image,
                'published': 'false'
            };
            // Hitting facebook to post photos
            return facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData)
                .then((response) => {
                    if (response.id) {
                        mediaIds.push(response.id);
                    }
                    return;
                })
                .catch((error) => {
                    throw new Error(error.message);
                });
        }))
            .then(() => {
                if (mediaIds.length > 0) {
                    var attachmentDetails = [];
                    for (let index = 0; index < mediaIds.length; index++) {
                        attachmentDetails.push(`{"media_fbid":"${mediaIds[index]}"}`);
                    }
                    let fbPostData = {
                        'message': postDetails.message,
                        'attached_media': attachmentDetails,
                    };
                    // Hitting facebook to post photos with messages
                    return facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData)
                        .then((response) => {
                            callback({ code: 200, status: "success", message: response });
                        })
                        .catch((error) => {
                            throw new Error(error.message);
                        });
                }
                else {
                    callback({ code: 400, status: "failed", message: `Can't able to post in facebook.` });
                }
            }).catch((error) => {
                callback({ code: 400, status: "failed", message: error.message });
            });
    }
    else if (postDetails.postType == 'Link') {
        let fbPostData = {
            'link': postDetails.link,
            'message': postDetails.message,
        };
        // Hitting facebook to post link and message
        facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData, (response) => {
            if (!response || response.error) {
                callback({ code: 400, status: "failed", message: response });
            } else {
                callback({ code: 200, status: "success", message: response });
            }
        });
    }
    else if (postDetails.postType == 'Video') {

        let imagePath = postDetails.mediaPath[0];

        let video = fs.createReadStream(`${basePath}/media/${imagePath}`);
        let fbPostData = {
            'description': postDetails.message,
            'Source': video,
        };
        // Hitting facebook to post videos
        facebook.api('/' + postDetails.targetId + '/videos', 'post', fbPostData, (response) => {
            if (!response || response.error) {
                callback({ code: 400, status: "failed", message: response });
            } else {
                callback({ code: 200, status: "success", message: response });
            }
        });
    }

    else {
        callback({ code: 400, status: "failed", error: 'Not a valid post.' });
    }
};

Facebook.prototype.publishPost = function (postDetails, accessToken) {
    return new Promise((resolve, reject) => {
        if (!postDetails || !accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            var basePath = path.resolve(__dirname, '../../..');
            // Setting the accessToken for facebook api
            facebook.setAccessToken(accessToken);
            // For making text post
            if (postDetails.postType == 'Text') {
                let fbPostData = {
                    'message': postDetails.message,
                };
                // Hitting facebook to post the Text data
                facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData, (response) => {
                    if (!response || response.error) {
                        reject({ code: 400, status: "failed", message: response });
                    } else {
                        resolve({ code: 200, status: "success", message: response });
                    }
                });
            }
            else if (postDetails.postType == 'OldImage') {
                var imagePath = postDetails.mediaPath[0];
                let image = fs.createReadStream(`${basePath}/media/${imagePath}`);
                let fbPostData = {
                    'message': postDetails.message,
                    'Source': image,
                };
                // Hitting facebook to post Oldimage data
                facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData, (response) => {
                    if (!response || response.error) {
                        reject({ code: 400, status: "failed", message: response });
                    } else {
                        resolve({ code: 200, status: "success", message: response });
                    }
                });
            }
            // For Image posting
            else if (postDetails.postType == 'Image') {
                logger.info(`\n Multi image post started....\n`);
                // Uploading images to Facebook for a post
                return this.uploadImages(postDetails)
                    .then((mediaIds) => {
                        // setting accesstoken for facebook api package
                        facebook.setAccessToken(accessToken);
                        if (mediaIds.length > 0) {
                            var attachmentDetails = [];
                            for (let index = 0; index < mediaIds.length; index++) {
                                attachmentDetails.push(`{"media_fbid":"${mediaIds[index]}"}`);
                            }
                            // Setting up the parameteres - message and uploaded images information
                            let fbPostData = {
                                'message': postDetails.message,
                                'attached_media': attachmentDetails,
                            };

                            // @targetId is, in which page it should post
                            // Hitting facebook to post the data with images
                            // @fbPostData will have message and the uploaded images information
                            return facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData)
                                .then((response) => {
                                    resolve({ code: 200, status: "success", message: response });
                                })
                                .catch((error) => {
                                    throw new Error(error.message);
                                });
                        }
                        else {
                            reject({ code: 400, status: "failed", message: `Can't able to post in facebook.` });
                        }
                    }).catch((error) => {
                        reject({ code: 400, status: "failed", message: error.message });
                    });
            }
            else if (postDetails.postType == 'Link') {
                // Setting up the parameteres - message and link information
                let fbPostData = {
                    'link': postDetails.link,
                    'message': postDetails.message,
                };
                // Hitting facebook to post link and message
                facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData, (response) => {
                    if (!response || response.error) {
                        reject({ code: 400, status: "failed", message: response });
                    } else {
                        resolve({ code: 200, status: "success", message: response });
                    }
                });
            }
            else if (postDetails.postType == 'Video') {
                let imagePath = postDetails.mediaPath[0];
                // Creating a readable media of video and storing that in a video variable to send as input to Facebook api request
                let video = fs.createReadStream(`${basePath}/media/${imagePath}`);
                // Setting up the parameteres - message and video information
                let fbPostData = {
                    'description': postDetails.message,
                    'Source': video,
                };
                // Hitting facebook to post the video with message
                facebook.api('/' + postDetails.targetId + '/videos', 'post', fbPostData, (response) => {
                    if (!response || response.error) {
                        reject({ code: 400, status: "failed", message: response });
                    } else {
                        resolve({ code: 200, status: "success", message: response });
                    }
                });
            }
            else {
                reject({ code: 400, status: "failed", error: 'Not a valid post.' });
            }
        }
    })
};

// Uploading images to Facebook for using in posting images
// For Image post 
// a. We have to upload images first to facebook 
// b. Then get the Id's of those images and publish it like a post
Facebook.prototype.uploadImages = function (postDetails) {
    return new Promise((resolve, reject) => {
        if (!postDetails) {
            reject(new Error('No post data found'));
        } else {
            var basePath = path.resolve(__dirname, '../../..');
            var mediaIds = [];
            return Promise.all(postDetails.mediaPath.map(function (mediaUrl) {
                let image = fs.createReadStream(`${basePath}/media/${mediaUrl}`);
                let fbPostData = {
                    'message': postDetails.message,
                    'Source': image,
                    'published': 'false'
                };
                // Hitting facebook to upload phot data
                return facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData)
                    .then((response) => {
                        if (response.id) {
                            mediaIds.push(response.id);
                        }
                        return;
                    })
                    .catch((error) => {
                        throw new Error(error.message);
                    });
            })).then(() => { resolve(mediaIds); }).catch((error) => { reject(error) });
        }
    });
}

Facebook.prototype.likeFacebookPost = function (pageId, postId, accessToken) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not
        if (!pageId || !postId || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            facebook.setAccessToken(accessToken);
            facebook.api(`${pageId}_${postId}/likes?type=like&access_token=${accessToken}`, 'post', (response) => {
                if (!response || response.error)
                    reject(response.error);
                else
                    // Sending response             
                    resolve(response);
            });
        }
    });
};

Facebook.prototype.commentFacebookPost = function (pageId, postId, comment, accessToken) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not
        if (!pageId || !postId || !comment || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            facebook.setAccessToken(accessToken);
            var encodedComment = encodeURIComponent(comment);
            facebook.api(`${pageId}_${postId}/comments?message=${encodedComment}&acess_token=${accessToken}`, 'post', (response) => {
                if (!response || response.error) {
                    reject(response.error);
                } else {
                    // Sending response            
                    resolve(response);
                }
            });
        }
    });
};

Facebook.prototype.fbPageInsights = function (accessToken, socialId, since, untill, dataPreset) {
    var url = '';
    if (since && untill) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&since=${since}&until=${untill}&access_token=${accessToken}`;
    }
    else if (dataPreset) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&date_preset=${dataPreset}&access_token=${accessToken}`;
    }

    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                // Sending response                
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getFbPageStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me?fields=picture.type(large){url},fan_count,new_like_count&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Checking the input data, that "accessToken" is having data or not
        if (!accessToken) {
            reject(new Error('Access Token Missing'));
        } else {
            // Hitting facebook  with the above url to get data 
            return request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    // Formating the body
                    var result = JSON.parse(body);
                    var updateDetail = {
                        follower_count: result.fan_count ? result.fan_count : 0,
                        profile_picture: result.picture ? result.picture.data.url : null,
                        total_like_count: result.new_like_count ? result.new_like_count : 0
                    };
                    // Sending response             
                    resolve(updateDetail);
                }
            });
        }
    });
};

Facebook.prototype.getFbProfileStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true),likes.summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Checking the input data, that "accessToken" is having data or not
        if (!accessToken) {
            reject(new Error('Access Token Missing'));
        } else {
            // Hitting facebook to get data
            return request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    // Formating the body data to fetch necessary data
                    var parsedData = JSON.parse(body);
                    var updateDetail = {
                        friendship_count: parsedData.friends.summary.total_count,
                        page_count: 0 || parsedData.accounts.summary.total_count,
                        //group_count: parsedData.TotalGroups, // not getting summary data                    
                        profile_picture: `https://graph.facebook.com/${parsedData.id}/picture?type=large`
                    };
                    // Sending response             
                    resolve(updateDetail);
                }
            });
        }
    });
};


// Instagram Business graph API with facebook


Facebook.prototype.getInstaBusinessStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=access_token,connected_instagram_account,instagram_accounts.limit(20){id,follow_count,followed_by_count,has_profile_picture,username,profile_pic,media_count,is_private,is_published}&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Hitting the url with get request to get all the Instagram business statistics
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                // Formating the body to fetch the required fields
                var parsedBody = JSON.parse(body);
                var updateDetail = {
                    follower_count: parsedBody.instagram_accounts.data[0].followed_by_count,
                    following_count: parsedBody.instagram_accounts.data[0].follow_count,
                    total_post_count: parsedBody.instagram_accounts.data[0].media_count,
                    profile_picture: parsedBody.instagram_accounts.data[0].profile_pic,
                };
                // Sending response               
                resolve(updateDetail);
            }
        });
    });
};


Facebook.prototype.getInstaBusinessAccount = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=access_token,connected_instagram_account,instagram_accounts.limit(20){id,follow_count,followed_by_count,has_profile_picture,username,profile_pic,media_count,is_private,is_published}&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Hitting the url with get request to get instagram business accounts data
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                // Sending response                
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getMediasFromInstagram = function (accessToken, socialId) {
    return new Promise((resolve, reject) => {
        facebook.setAccessToken(accessToken);
        // Hitting the url with get request to get the media details (specified field data) from instagram account
        facebook.api(`${socialId}/media?fields=id,media_type,media_url,owner,timestamp,caption,comments_count,like_count,username,comments,ig_id,permalink`, (response) => {
            if (!response || response.error) {
                reject(response.error);
            } else {
                var batchId = String(moment().unix());
                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };
                // Formating the response
                response.data.forEach((feed) => {
                    var feedObject = {
                        postId: feed.id,
                        captions: feed.caption ? feed.caption : "",
                        mediaType: feed.media_type ? feed.media_type : "",
                        mediaUrls: [feed.media_url ? feed.media_url : ''],
                        publishedDate: moment(feed.timestamp).utc(),
                        instagramId: feed.ig_id ? feed.ig_id : "",
                        socialAccountId: socialId,
                        ownerId: feed.owner && feed.owner.id ? feed.owner.id : '',
                        ownerUserName: feed.username ? feed.username : "",
                        likeCount: feed.like_count ? feed.like_count : 0,
                        commentCount: feed.comments_count ? feed.comments_count : 0,
                        createdDate: moment().utc(),
                        permalink: feed.permalink ? feed.permalink : "",
                        batchId: batchId,
                        version: this.facebook_api.version
                    };
                    postDetails.feeds.push(feedObject);
                });
                // Sending response                
                resolve(postDetails);
            }
        });
    });
};

Facebook.prototype.getInstagramMediaInfo = function (accessToken, mediaId) {
    return new Promise((resolve, reject) => {
        facebook.setAccessToken(accessToken);
        // Hitting the url with get request to get the details of an Media belongs to instagram account
        facebook.api(`${mediaId}/media?fields=id,media_type,media_url,owner,timestamp,caption,comments_count,like_count,username,comments,ig_id`, (feed) => {
            if (!feed || feed.error) {
                reject(feed.error);
            } else {
                // Formating the response
                var feedObject = {
                    postId: feed.id,
                    captions: feed.caption ? feed.caption : "",
                    mediaType: feed.media_type ? feed.media_type : "",
                    mediaUrls: [feed.media_url ? feed.media_url : ''],
                    publishedDate: moment(feed.timestamp).utc(),
                    instagramId: feed.ig_id ? feed.ig_id : "",
                    socialAccountId: mediaId,
                    ownerId: feed.owner && feed.owner.id ? feed.owner.id : '',
                    ownerUserName: feed.username ? feed.username : "",
                    likeCount: feed.like_count ? feed.like_count : 0,
                    commentCount: feed.comments_count ? feed.comments_count : 0,
                    createdDate: moment().utc(),
                    batchId: batchId,
                    version: this.facebook_api.version
                };
                // Sending response                
                resolve(feedObject);
            }
        });
    });
};

Facebook.prototype.getPagesConnectWithInsta = function (code) {
    return new Promise((resolve, reject) => {
        // Calling function to generate an accessToken by giving the code as input
        this.getProfileAccessToken(code)
            .then((accessToken) => {
                // Calling function to get the pages connected with instagram by giving the accesstoken of instagram business account
                return getPagesConnectWithInsta(accessToken);
            })
            .then((result) => {
                // Sending response                 
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// To get the pages connected with instagram business account
function getPagesConnectWithInsta(accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/accounts?fields=connected_instagram_account,access_token&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Hitting the url with get request to get pages data connected with instagram business account
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                // Formating the body data
                var parsedBody = JSON.parse(body);
                // Sending response                 
                resolve(parsedBody);
            }
        });
    });
}

// To get the instgram business insights of a particular instagram business account
Facebook.prototype.instagramBusinessInsights = function (accessToken, accountId, since, untill) {
    var url = `https://graph.facebook.com/${fbversion}/${accountId}/insights?metric=impressions,reach,follower_count,profile_views&period=day&since=${since}&until=${untill}&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        // Hitting the url with get request to get the insights of instagram business account
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                // Formating the body data
                var parsedBody = JSON.parse(body);
                // Sending response                  
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getInstaBusinessComments = function (accessToken, mediaId) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not
        if (!accessToken || !mediaId) {
            reject(new Error('Invalid Inputs'));
        } else {
            var postOptions = {
                method: 'GET',
                uri: `https://graph.facebook.com/${fbversion}/${mediaId}/comments?&access_token=${accessToken}&fields=username,like_count,media,id,text,timestamp,user,replies{user,text,id,timestamp,username,like_count}`,
            };
            // Hitting the url with get request using requestPromise to get the comments of a particular media belongs to the instagram business account.
            return requestPromise(postOptions)
                .then((response) => {
                    // Formating the body data
                    var parsedResponse = JSON.parse(response);
                    // Sending response                 
                    resolve(parsedResponse);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

// To reply for an comment of instagram business post
Facebook.prototype.replyInstaBusinessComment = function (accessToken, commentId, comment) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that every field is having data or not
        if (!accessToken || !comment || !commentId) {
            reject(new Error('Invalid Inputs'));
        } else {
            var encodedComment = encodeURIComponent(comment);
            var url = `https://graph.facebook.com/${fbversion}/${commentId}/replies?message=${encodedComment}&&access_token=${accessToken}`;
            return request.post(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    // Formating the response
                    var parsedBody = JSON.parse(body);
                    // Sending response                
                    resolve(parsedBody);
                }
            });
        }
    });
};

// Webhooks Subscriptions
Facebook.prototype.subscribeWebhooks = function (accessToken, socialId, subscribeFields) {
    logger.info('Facebook Subscription started..');
    return new Promise((resolve, reject) => {
        // Hitting the url with post request to set/subscribe webhooks for a particular account
        request.post(`https://graph.facebook.com/${socialId}/subscribed_apps?subscribed_fields=${subscribeFields}&access_token=${accessToken}`, (error, response, body) => {
            if (error) {
                logger.info(`Facebook/Instagram Subscription error ${error}!`);
            } else {
                var parsedBody = JSON.parse(body);
                if (parsedBody.success) {
                    logger.info(`Facebook/Instagram Subscription done ${body}!`);
                    // Sending response                  
                    resolve(parsedBody);
                } else {
                    logger.info(parsedBody);
                    // Sending response               
                    resolve();
                }
            }
        });
    });
};

// For un-subscribing webhooks to facebook
Facebook.prototype.unsubscribeWebhooks = function (accessToken, socialId) {
    return new Promise((resolve, reject) => {
        // Setting up the acccesstoken to facebook api package
        facebook.setAccessToken(accessToken);
        // Hitting the url with delete request to remove/un-subscribe the webhooks for a account/page
        return facebook.api(`${socialId}/subscribed_apps`, 'delete', (response) => {
            if (response.success) {
                logger.info(`Facebook/Instagram Unsubscription done ${JSON.stringify(response)}!`);
                // Sending response                     
                resolve(response.success);
            } else {
                logger.info(response);
                // Sending response                
                resolve();
            }
        });
    });
};

module.exports = Facebook;
