const facebook = require('fb');
const async = require('async');
const request = require('request');
const fs = require('fs');
const moment = require('moment');
const requestPromise = require('request-promise');
const fbversion = "v3.3";
const path = require('path');

function Facebook(facebook_api) {
    this.facebook_api = facebook_api;
}

Facebook.prototype.getAppAccessToken = function () {
    return new Promise((resolve, reject) => {
        try {
            facebook.api('oauth/access_token', {
                client_id: this.facebook_api.app_id,
                client_secret: this.facebook_api.secret_key,
                grant_type: 'client_credentials'
            }, function (res) {
                if (!res || res.error) {
                    return new Error(res.error);
                }
                resolve(res.access_token);
            });
        } catch (error) {
            reject(error.message);
        }
    });
};

Facebook.prototype.getUserAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        facebook.api('oauth/access_token', {
            client_id: this.facebook_api.app_id,
            client_secret: this.facebook_api.secret_key,
            redirect_uri: this.facebook_api.redirect_url,
            code: code
        }, function (res) {
            if (!res || res.error) {
                reject(res.error);
            }
            var accessToken = res.access_token;
            var expires = res.expires ? res.expires : 0;
            resolve(accessToken);
        });
    });
};

Facebook.prototype.getProfileAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject('Invalid code from facebook');
        } else {
            var postOptions = {
                method: 'GET',
                uri: `https://graph.facebook.com/${fbversion}/oauth/access_token`,
                qs: {
                    client_id: this.facebook_api.app_id,
                    redirect_uri: this.facebook_api.fbprofile_add_redirect_url,
                    client_secret: this.facebook_api.secret_key,
                    code: code
                }
            };
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

Facebook.prototype.extendAccessToken = function (accessToken, callback) {
    facebook.api('oauth/access_token', {
        client_id: this.facebook_api.app_id,
        client_secret: this.facebook_api.secret_key,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken
    }, function (res) {
        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        var accessToken = res.access_token;
        var expires = res.expires ? res.expires : 0;
        callback(accessToken);
    });
};

Facebook.prototype.userProfileInfo = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me?fields=id,name,email,birthday,first_name,last_name,friends&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
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
                resolve(profileInfo);
            }
        });
    });
};

Facebook.prototype.addFacebookProfile = function (network, teamId, code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Facebook code is invalid!");
        } else {
            this.getProfileAccessToken(code)
                .then((accessToken) => {
                    if (!accessToken)
                        throw new Error("Cant able to fetch access token.");
                    else {
                        this.userProfileInfo(accessToken)
                            .then((userDetails) => {
                                if (!userDetails) {
                                    throw new Error("Cant able to fetch user details");
                                } else {
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

Facebook.prototype.getOwnFacebookPages = function (code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Invalid code from facebook");
        } else {
            return this.getProfileAccessToken(code)
                .then((accessToken) => {
                    if (!accessToken) {
                        reject("Cant able to get the facebok access token!");
                    } else {
                        return this.userPageDetails(accessToken);
                    }
                })
                .then((pageDetails) => {
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
        if (!code) {
            reject(new Error("Invalid code from facebook"));
        } else {
            this.getProfileAccessToken(code)
                .then((accessToken) => {
                    userAccessToken = accessToken;
                    return this.userAdminGroupDetails(accessToken);
                })
                .then((groupDetails) => {
                    var groupInfo = {
                        accessToken: userAccessToken,
                        groupDetails: groupDetails
                    };

                    resolve(groupInfo);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Facebook.prototype.userGroupDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        request.get(`https://graph.facebook.com/${fbversion}/me/groups?fields=id,name,picture.type(large){url}&access_token=${accessToken}`, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                pagination(parsedBody, (error, result) => {
                    if (error || error != null) {
                        reject(error);
                    }
                    let data = result.data;
                    resolve(data);
                });
            }
        });
    });
};

Facebook.prototype.userAdminGroupDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error("Invalid access token from facebook"));
        } else {
            request.get(`https://graph.facebook.com/${fbversion}/me/groups?fields=id,name,picture{url},member_count,administrator,member_request_count&access_token=${accessToken}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var parsedBody = JSON.parse(body);
                    pagination(parsedBody, (error, result) => {
                        if (error || error != null) {
                            reject(error);
                        }
                        let data = result.data;
                        resolve(data);
                    });
                }
            });
        }
    });
};

function getFacebookFeeds(socialId, accessToken, callback) {
    facebook.setAccessToken(accessToken);
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,likes.summary(true),comments.summary(true),type,application&limits=50`, (response) => {
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

function getRecentFacebookFeeds(socialId, accessToken, since, callback) {
    var from = String(moment(since).unix());
    var currentUnixTime = String(moment().unix());
    // console.log(from, currentUnixTime);
    facebook.setAccessToken(accessToken);
    facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,likes.summary(true),comments.summary(true),type,application&since=${from}&untill=${currentUnixTime}&limit=50`, (response) => {
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
                        likeCount: feed.likes ? feed.likes.summary.total_count : 0,
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
                        likeCount: feed.likes ? feed.likes.summary.total_count : 0,
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

Facebook.prototype.userPageDetails = function (accessToken) {

    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get(`https://graph.facebook.com/${fbversion}/me/accounts?fields=access_token,name,id,picture.type(large){url},fan_count&access_token=${accessToken}`, (error, response, body) => {
                if (error) {
                    // console.log(`Facebook fetching page error : ${error}!`);
                    reject(error);
                } else {
                    var parsedBody = JSON.parse(body);
                    pagination(parsedBody, (error, result) => {
                        if (error || error != null) {
                            reject(error);
                        }
                        let data = result.data;
                        resolve(data);
                    });
                }
            });
        }
    });
};

let pagination = (data, callback) => {
    if (data && data.paging && data.paging.next) {
        request.get(data.paging.next, (error, response, body) => {
            var bodyResponse = JSON.parse(body);
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

Facebook.prototype.publishPost = function (postDetails, accessToken, callback) {
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
            // console.log(response);
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
        return Promise.all(postDetails.mediaPath.map(function (mediaUrl) {
            let image = fs.createReadStream(`${basePath}/media/${mediaUrl}`);
            let fbPostData = {
                'message': postDetails.message,
                'Source': image,
                'published': 'false'
            };
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
                    // console.log(`\n Fetched media ids ${JSON.stringify(mediaIds)}\n`);
                    var attachmentDetails = [];
                    for (let index = 0; index < mediaIds.length; index++) {
                        attachmentDetails.push(`{"media_fbid":"${mediaIds[index]}"}`);
                    }
                    let fbPostData = {
                        'message': postDetails.message,
                        'attached_media': attachmentDetails,
                    };
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
        facebook.api('/' + postDetails.targetId + '/feed', 'post', fbPostData, (response) => {
            // console.log(response);
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

Facebook.prototype.fbPageInsights = function (accessToken, socialId, since, untill, dataPreset) {
    var url = '';
    if (since && untill) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&since=${since}&until=${untill}&access_token=${accessToken}`;
    }
    else if (dataPreset) {
        url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&date_preset=${dataPreset}&access_token=${accessToken}`;
    }

    // console.log(url);

    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                // console.log(body);
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getFbPageStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me?fields=picture.type(large){url},fan_count,new_like_count&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error('Access Token Missing'));
        } else {
            return request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    var result = JSON.parse(body);
                    var updateDetail = {
                        follower_count: result.fan_count ? result.fan_count : 0,
                        profile_picture: result.picture ? result.picture.data.url : null,
                        total_like_count: result.new_like_count ? result.new_like_count : 0
                    };
                    resolve(updateDetail);
                }
            });
        }
    });
};

Facebook.prototype.getFbProfileStats = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true),likes.summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error('Access Token Missing'));
        } else {
            return request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var parsedData = JSON.parse(body);
                    var updateDetail = {
                        friendship_count: parsedData.friends.summary.total_count,
                        page_count: parsedData.accounts.summary.total_count,
                        //group_count: parsedData.TotalGroups, // not getting summary data                    
                        profile_picture: `https://graph.facebook.com/${parsedData.id}/picture?type=large`
                    };
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
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                var updateDetail = {
                    follower_count: parsedBody.instagram_accounts.data[0].followed_by_count,
                    following_count: parsedBody.instagram_accounts.data[0].follow_count,
                    total_post_count: parsedBody.instagram_accounts.data[0].media_count,
                    profile_picture: parsedBody.instagram_accounts.data[0].profile_pic,
                };
                resolve(updateDetail);
            }
        });
    });
};


Facebook.prototype.getInstaBusinessAccount = function (accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/?fields=access_token,connected_instagram_account,instagram_accounts.limit(20){id,follow_count,followed_by_count,has_profile_picture,username,profile_pic,media_count,is_private,is_published}&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getMediasFromInstagram = function (accessToken, socialId) {
    return new Promise((resolve, reject) => {
        facebook.setAccessToken(accessToken);
        facebook.api(`${socialId}/media?fields=id,media_type,media_url,owner,timestamp,caption,comments_count,like_count,username,comments,ig_id,permalink`, (response) => {
            if (!response || response.error) {
                reject(response.error);
            } else {
                var batchId = String(moment().unix());
                var postDetails = {
                    feeds: [],
                    batchId: batchId
                };
                response.data.forEach(function (feed) {
                    // console.log(`Instagram Feeds : ${JSON.stringify(feed)}`);
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
                resolve(postDetails);
            }
        });
    });
};

Facebook.prototype.getInstagramMediaInfo = function (accessToken, mediaId) {
    return new Promise((resolve, reject) => {
        facebook.setAccessToken(accessToken);
        facebook.api(`${mediaId}/media?fields=id,media_type,media_url,owner,timestamp,caption,comments_count,like_count,username,comments,ig_id`, (feed) => {
            if (!feed || feed.error) {
                reject(feed.error);
            } else {
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
                resolve(feedObject);
            }
        });
    });
};

Facebook.prototype.getPagesConnectWithInsta = function (code) {
    return new Promise((resolve, reject) => {
        this.getProfileAccessToken(code)
            .then((accessToken) => {
                return getPagesConnectWithInsta(accessToken);
            })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

function getPagesConnectWithInsta(accessToken) {
    var url = `https://graph.facebook.com/${fbversion}/me/accounts?fields=connected_instagram_account,access_token&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
}

Facebook.prototype.instagramBusinessInsights = function (accessToken, accountId, since, untill) {
    var url = `https://graph.facebook.com/${fbversion}/${accountId}/insights?metric=impressions,reach,follower_count,profile_views&period=day&since=${since}&until=${untill}&access_token=${accessToken}`;
    return new Promise((resolve, reject) => {
        return request.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
};

Facebook.prototype.getInstaBusinessComments = function (accessToken, mediaId) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !mediaId) {
            reject(new Error('Invalid Inputs'));
        } else {
            var url = `https://graph.facebook.com/${fbversion}/${mediaId}/comments?&access_token=${accessToken}`;
            return request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var parsedBody = JSON.parse(body);
                    resolve(parsedBody);
                }
            });
        }
    });
};

Facebook.prototype.replyInstaBusinessComment = function (accessToken, commentId, comment) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !comment || !commentId) {
            reject(new Error('Invalid Inputs'));
        } else {
            var encodedComment = encodeURIComponent(comment);
            var url = `https://graph.facebook.com/${fbversion}/${commentId}/replies?message=${encodedComment}&&access_token=${accessToken}`;
            return request.post(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var parsedBody = JSON.parse(body);
                    resolve(parsedBody);
                }
            });
        }
    });
};

// Webhooks Subscriptions
Facebook.prototype.subscribeWebhooks = function (accessToken, socialId, subscribeFields) {
    console.log('Facebook Subscription started..');
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
                    console.log(parsedBody);
                    resolve();
                }
            }
        });
    });
};

Facebook.prototype.unsubscribeWebhooks = function (accessToken, socialId) {
    return new Promise((resolve, reject) => {
        facebook.setAccessToken(accessToken);
        return facebook.api(`${socialId}/subscribed_apps`, 'delete', (response) => {
            if (response.success) {
                console.log(`Facebook/Instagram Unsubscription done ${JSON.stringify(response)}!`);
                resolve(response.success);
            } else {
                console.log(response);
                resolve();
            }
        });
    });
};

module.exports = Facebook;
