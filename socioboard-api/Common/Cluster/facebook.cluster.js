
import facebook from 'fb';
const fbversion = "v3.3";
import requestPromise from 'request-promise';
import request from 'request';
import async from 'async'
import path from 'path'
import moment from 'moment';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url));


function Facebook(facebook_api) {
    this.facebook_api = facebook_api;
}

Facebook.prototype.addFacebookProfile = function (network, teamId, code, redirectUrl) {
    return new Promise((resolve, reject) => {
        // Checking the input data, that code is having data or not
        if (!code) {
            reject("Facebook code is invalid!");
        } else {
            // Fetching access token from facebook using user code
            this.getProfileAccessToken(code, redirectUrl)
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


Facebook.prototype.userProfileInfo = function (accessToken) {
    // Fetching profile details with accessToken of a user
    var url = `https://graph.facebook.com/${fbversion}/me?fields=id,ids_for_apps,name,email,birthday,first_name,last_name,friends&access_token=${accessToken}`;
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

Facebook.prototype.getProfileAccessToken = function (code, redirecturl) {
    return new Promise((resolve, reject) => {
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
                    redirect_uri: redirecturl,
                    client_secret: this.facebook_api.secret_key,
                    code: code
                }
            };
            // Hitting graph-api with promise 
            return requestPromise(postOptions)
                .then((response) => {
                    var parsedResponse = JSON.parse(response);
                    resolve(parsedResponse.access_token);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};



Facebook.prototype.getFbProfileStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true),likes.summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;
    //  var url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true).summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;
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
                        friendship_count: parsedData.friends ? parsedData.friends.summary.total_count : 0,
                        page_count: parsedData.accounts ? parsedData.accounts.summary.total_count : 0,
                        //group_count: parsedData?.TotalGroups, // not getting summary data                    
                        profile_picture: `https://graph.facebook.com/${parsedData.id}/picture?type=large`
                    };
                    // Sending response             
                    resolve(updateDetail);
                }
            });
        }
    });
};

Facebook.prototype.getOwnFacebookPages = function (code, redirectUrl) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Invalid code from facebook");
        } else {
            // Fetching access token from facebook using user code
            return this.getProfileAccessToken(code, redirectUrl)
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
                    console.log(`pageDetails ${pageDetails}`)
                    resolve(pageDetails);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Facebook.prototype.getOwnFacebookGroups = function (code, redirect_url) {

    return new Promise((resolve, reject) => {
        var userAccessToken = {};
        // Checking the input data, that code is having data or not
        if (!code) {
            reject(new Error("Invalid code from facebook"));
        } else {
            // Fetching access token from facebook using user code
            this.getProfileAccessToken(code, redirect_url)
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

// Fetching facebook page details using page accessToken
Facebook.prototype.userPageDetails = function (accessToken) {

    return new Promise((resolve, reject) => {
        // Checking the input data, that "accessToken" is having data or not
        if (!accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get(`https://graph.facebook.com/${fbversion}/me/accounts?fields=access_token,link,name,id,picture.type(large){url},fan_count&access_token=${accessToken}`, (error, response, body) => {
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

// Fetching posts from facebook of existing account
Facebook.prototype.getFacebookPosts = function (accessToken, socialId, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !socialId || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            getFacebookFeeds(socialId, accessToken, (error, feedDetails) => {
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };
                // console.log(feedDetails)
                // console.log("feeds ", JSON.stringify(feed, null, 4));


                feedDetails?.forEach(function (feed) {

                    var feedId = feed.id.replace(`${socialId}_`, '');
                    var privacy = feed.privacy.value;
                    var createdTime = moment(feed.created_time).utc();
                    var feedMessage = feed.message ? feed.message : "";
                    // var feedLink = feed.link ? feed.link : `https://www.facebook.com/${feedId}`;
                    var feedLink = `https://www.facebook.com/${feedId}`;
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

                    var feedObject = {
                        postId: feedId,
                        privacy: privacy,
                        publishedDate: createdTime,
                        postType: feed.type,
                        description: feedMessage,
                        postUrl: feedLink,
                        isApplicationPost: isApplicationPost,
                        mediaUrls: mediaUrls,
                        likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
                        commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                        socialAccountId: socialId,
                        batchId: batchId,
                        version: version
                    };
                    postDetails.feeds.push(feedObject);
                });

                resolve(postDetails);
            });
        }
    });
};
// Fetching posts from facebook of existing account
Facebook.prototype.getFacebookPagePosts = function (accessToken, socialId, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !socialId || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            getFacebookPagePosts(socialId, accessToken, (error, feedDetails) => {
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };
                feedDetails?.forEach(function (feed) {

                    let feedtype = feed.attachments?.data[0].type
                    var feedId = feed.id.replace(`${socialId}_`, '');
                    var privacy = feed.privacy.value;
                    var createdTime = moment(feed.created_time).utc();
                    var feedMessage = feed.message ? feed.message : "";
                    // var feedLink = feed.link ? feed.link : `https://www.facebook.com/${feedId}`;
                    var feedLink = `https://www.facebook.com/${feedId}`;
                    var mediaUrls = [];
                    var isApplicationPost = false;
                    if (feed.application) {
                        var applicationId = feed.application.id;
                        if (applicationId == facebookAppId) {
                            isApplicationPost = true;
                        }
                    }
                    if (feedtype == 'photo' || feedtype == 'album') {
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
                    else if (feedtype == 'video') {
                        var media = feed.source;
                        mediaUrls.push(media);
                    }
                    else if (feedtype == 'video_inline') {
                        feed.attachments.data.forEach(data => {
                            mediaUrls.push(data.media.source);
                        })
                    }

                    var feedObject = {
                        postId: feedId,
                        privacy: privacy,
                        publishedDate: createdTime,
                        postType: feedtype,
                        description: feedMessage,
                        postUrl: feedLink,
                        isApplicationPost: isApplicationPost,
                        mediaUrls: mediaUrls,
                        likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
                        commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                        socialAccountId: socialId,
                        batchId: batchId,
                        version: version
                    };
                    postDetails.feeds.push(feedObject);
                });

                resolve(postDetails);
            });
        }
    });
};

function getFacebookPagePosts(socialId, accessToken, callback) {
    facebook.setAccessToken(accessToken);
    // facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,comments.summary(true),type,application&limits=50`, (response) => {
    facebook.api(`${socialId}/feed?fields=privacy,message,attachments,created_time,reactions.summary(total_count),comments.summary(true),application&limits=50`, (response) => {
        if (!response || response.error) {
            callback(response.error, null);
        } else {
            pagination(response, (error, result) => {
                if (error || error != null) {
                    callback(error, null);
                }
                let data = result.data;
                callback(null, data);
            });

        }
    });
}

function getFacebookFeeds(socialId, accessToken, callback) {
    facebook.setAccessToken(accessToken);
    // facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,comments.summary(true),type,application&limits=50`, (response) => {
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,reactions.summary(total_count),comments.summary(true),type,application&limits=50`, (response) => {
        if (!response || response.error) {
            callback(response.error, null);
        } else {
            pagination(response, (error, result) => {
                if (error || error != null) {
                    callback(error, null);
                }
                let data = result.data;
                callback(null, data);
            });

        }
    });
}

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

Facebook.prototype.likeFacebookPost = function (pageId, postId, accessToken) {
    return new Promise((resolve, reject) => {
        if (!pageId || !postId || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            facebook.setAccessToken(accessToken);
            facebook.api(`${pageId}_${postId}/likes?type=like&access_token=${accessToken}`, 'post', (response) => {
                if (!response || response.error)
                    reject(response.error);
                else
                    resolve(response);
            });
        }
    });
};

Facebook.prototype.commentFacebookPost = function (pageId, postId, comment, accessToken) {
    return new Promise((resolve, reject) => {
        if (!pageId || !postId || !comment || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            facebook.setAccessToken(accessToken);
            var encodedComment = encodeURIComponent(comment);
            facebook.api(`${pageId}_${postId}/comments?message=${encodedComment}&acess_token=${accessToken}`, 'post', (response) => {
                if (!response || response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        }
    });
};

Facebook.prototype.getRecentFacebookFeeds = function (accessToken, socialId, since, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !socialId || !since || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            getRecentFacebookFeeds(socialId, accessToken, since, (error, feedDetails) => {
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };

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

                    var feedObject = {
                        postId: feedId,
                        privacy: privacy,
                        publishedDate: createdTime,
                        postType: feed.type,
                        description: feedMessage,
                        postUrl: feedLink,
                        isApplicationPost: isApplicationPost,
                        mediaUrls: mediaUrls,
                        likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
                        commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                        socialAccountId: socialId,

                        batchId: batchId,
                        version: version
                    };
                    postDetails.feeds.push(feedObject);
                });

                resolve(postDetails);
            });
        }
    });
};

Facebook.prototype.getRecentFacebookPageFeeds = function (accessToken, socialId, since, facebookAppId, version) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !socialId || !since || !facebookAppId || !version) {
            reject(new Error('Invalid Inputs'));
        } else {
            getRecentFacebookPageFeeds(socialId, accessToken, since, (error, feedDetails) => {
                if (error != null || error) {
                    reject(error);
                }
                var batchId = String(moment().unix());

                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };

                feedDetails?.forEach(function (feed) {
                    let feedtype = feed.attachments?.data[0].type
                    var feedId = feed.id.replace(`${socialId}_`, '');
                    var privacy = feed.privacy.value;
                    var createdTime = moment(feed.created_time).utc();
                    var feedMessage = feed.message ? feed.message : "";
                    // var feedLink = feed.link ? feed.link : `https://www.facebook.com/${feedId}`;
                    var feedLink = `https://www.facebook.com/${feedId}`;
                    var mediaUrls = [];
                    var isApplicationPost = false;
                    if (feed.application) {
                        var applicationId = feed.application.id;
                        if (applicationId == facebookAppId) {
                            isApplicationPost = true;
                        }
                    }
                    if (feedtype == 'photo' || feedtype == 'album') {
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
                    else if (feedtype == 'video') {
                        var media = feed?.source;
                        mediaUrls.push(media);
                    }
                    else if (feedtype == 'video_inline') {
                        feed.attachments.data.forEach(data => {
                            mediaUrls.push(data.media.source);
                        })
                    }

                    var feedObject = {
                        postId: feedId,
                        privacy: privacy,
                        publishedDate: createdTime,
                        postType: feedtype,
                        description: feedMessage,
                        postUrl: feedLink,
                        isApplicationPost: isApplicationPost,
                        mediaUrls: mediaUrls,
                        likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
                        commentCount: feed.comments ? feed.comments.summary.total_count : 0,
                        socialAccountId: socialId,
                        batchId: batchId,
                        version: version
                    };
                    postDetails.feeds.push(feedObject);
                });

                resolve(postDetails);
            });
        }
    });
};

// Fetching recent feeds from facebook
function getRecentFacebookFeeds(socialId, accessToken, since, callback) {
    // Changing the input time to Unix format
    var from = String(moment(since).unix());
    var currentUnixTime = String(moment().unix());
    // Setting access token
    facebook.setAccessToken(accessToken);
    // Calling graph-api for fetching feeds
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,reactions.summary(total_count),comments.summary(true),type,application&since=${from}&untill=${currentUnixTime}&limit=50`, (response) => {
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
// Fetching recent feeds from facebook
function getRecentFacebookPageFeeds(socialId, accessToken, since, callback) {
    // Changing the input time to Unix format
    var from = String(moment(since).unix());
    var currentUnixTime = String(moment().unix());
    // Setting access token
    facebook.setAccessToken(accessToken);
    // Calling graph-api for fetching feeds
    facebook.api(`${socialId}/feed?fields=privacy,message,attachments,created_time,likes.summary(true),reactions.summary(total_count),comments.summary(true),application&since=${from}&untill=${currentUnixTime}&limit=50`, (response) => {
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

Facebook.prototype.subscribeWebhooks = function (accessToken, socialId, subscribeFields) {
    return new Promise((resolve, reject) => {
        request.post(`https://graph.facebook.com/${socialId}/subscribed_apps?subscribed_fields=${subscribeFields}&access_token=${accessToken}`, (error, response, body) => {
            if (error) {
                console.log(`Facebook/Instagram Subscription error ${error}!`);
            } else {
                var parsedBody = JSON.parse(body);
                if (parsedBody.success) {
                    console.log(`Facebook/Instagram Subscription done ${body}!`);
                    resolve(parsedBody);
                } else {
                    resolve();
                }
            }
        });
    });
};

Facebook.prototype.publishPost = async function (postDetails, accessToken, callback) {
    var basePath = path.resolve(__dirname, '../../..');
    facebook.setAccessToken(accessToken);
    if (postDetails.postType == 'Text') {
        let fbPostData = {
            'message': postDetails.message,
        };
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
        facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData, (response) => {
            if (!response || response.error) {
                callback({ code: 400, status: "failed", message: response });
            } else {
                callback({ code: 200, status: "success", message: response });
            }
        });
    }
    else if (postDetails.postType == 'Image') {

        console.log(`\n Multi image post started....\n`);

        var mediaIds = [];
        try {
            await Promise.all(postDetails.mediaPath.map(function (mediaUrl) {
                let image_1 = fs.createReadStream(`${basePath}/media/${mediaUrl}`);
                let fbPostData_2 = {
                    'message': postDetails.message,
                    'Source': image_1,
                    'published': 'false'
                };
                return facebook.api('/' + postDetails.targetId + '/photos', 'post', fbPostData_2)
                    .then((response_2) => {
                        if (response_2.id) {
                            mediaIds.push(response_2.id);
                        }
                        return;
                    })
                    .catch((error) => {
                        throw new Error(error.message);
                    });
            }));
            if (mediaIds.length > 0) {
                var attachmentDetails = [];
                for (let index = 0; index < mediaIds.length; index++) {
                    attachmentDetails.push(`{"media_fbid":"${mediaIds[index]}"}`);
                }
                let fbPostData_3 = {
                    'message': postDetails.message,
                    'attached_media': attachmentDetails,
                };
                return facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData_3)
                    .then((response_3) => {
                        callback({ code: 200, status: "success", message: response_3 });
                    })
                    .catch((error_1) => {
                        throw new Error(error_1.message);
                    });
            }
            else {
                callback({ code: 400, status: "failed", message: `Can't able to post in facebook.` });
            }
        } catch (error_2) {
            callback({ code: 400, status: "failed", message: error_2.message });
        }
    }
    else if (postDetails.postType == 'Link') {
        let fbPostData = {
            'link': postDetails.link,
            'message': postDetails.message,
        };
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

Facebook.prototype.fbPageInsights = function (accessToken, socialId, sinces, untill, dataPreset) {
    let url = '';
    let since = new Date(sinces);
    since.setDate(since.getDate() - 1)
    let sinceunixTimestamp = Math.floor(new Date(since).getTime() / 1000);
    let untillunixTimestamp = Math.floor(new Date(untill).getTime() / 1000);

    if (since && untill && since != -1 || untill != -1) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&since=${sinceunixTimestamp}&until=${untillunixTimestamp}&access_token=${accessToken}`;
    }
    else if (dataPreset) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&date_preset=${dataPreset}&access_token=${accessToken}`;
    }

    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                let parsedBody = JSON.parse(body);
                // Sending response                
                resolve(parsedBody);
            }
        });
    });
};


Facebook.prototype.getFbPageStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me?fields=fan_count,new_like_count,link,picture.type(large)&access_token=${accessToken}`;
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


export default Facebook;
