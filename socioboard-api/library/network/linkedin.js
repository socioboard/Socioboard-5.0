const request = require('request');
const requestPromise = require('request-promise');
const logger = require('../../user/utils/logger');

function LinkedIn(linkedIn_api) {
    this.linkedIn_api = linkedIn_api;
    this.LinkedInApiConfig = require('node-linkedin')(linkedIn_api.client_id,
        linkedIn_api.client_secret,
        linkedIn_api.redirect_url);
    this.scope = ['r_basicprofile', 'r_emailaddress', 'w_share', 'rw_company_admin'];
}

LinkedIn.prototype.getV1OAuthUrl = function (state) {
    return this.LinkedInApiConfig.auth.authorize(this.scope, state);
};

LinkedIn.prototype.getV1ProfileAccessToken = function (res, code, state, callback) {
    this.LinkedInApiConfig.auth.getAccessToken(res, code, state, function (error, results) {
        // Checking whether it sent error in callback or not
        if (error)
            callback(error, null);
        else
            callback(null, results.access_token);
    });
};

LinkedIn.prototype.getV1ProfileDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        var linkedin = this.LinkedInApiConfig.init(accessToken);
        linkedin.people.me(['id', 'first-name', 'email-address', 'last-name', 'public-profile-url', 'picture-url', 'num-connections', 'headline'], function (error, response) {
            if (error) {
                reject(error);
            }
            var profileInfo = {
                user_id: response.id,
                email: response.emailAddress ? response.emailAddress : '',
                //birthday: response.birthday,
                first_name: response.firstName,
                last_name: response.lastName ? response.lastName : '',
                profile_url: response.publicProfileUrl,
                picture_url: response.pictureUrl ? response.pictureUrl : '',
                friend_count: response.numConnections ? response.numConnections : '0',
                access_token: accessToken,
                info: response.headline ? response.headline : ''
            };
            // Sending response
            resolve(profileInfo);
        });
    });
};

LinkedIn.prototype.getOAuthUrl = function (state) {

    // Creating a specific url based on requirement(input)
    if (!state)
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedIn_api.client_id}&redirect_uri=${this.linkedIn_api.redirect_url}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    else
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedIn_api.client_id}&redirect_uri=${this.linkedIn_api.redirect_url}&state=${state}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;


    // with old scopes
    // if (!state) {
    //     return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedIn_api.client_id}&redirect_uri=${this.linkedIn_api.redirect_url}&scope=r_basicprofile%20r_emailaddress%20w_share%20rw_company_admin`;
    // } else {
    //     return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedIn_api.client_id}&redirect_uri=${this.linkedIn_api.redirect_url}&state=${state}&scope=r_basicprofile%20r_emailaddress%20w_share%20rw_company_admin`;
    // }
};

LinkedIn.prototype.getProfileAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        var postParameters = {
            method: 'POST',
            uri: 'https://www.linkedin.com/oauth/v2/accessToken',
            // Making a JSON object of inputs in request
            qs: {
                grant_type: 'authorization_code',
                client_id: this.linkedIn_api.client_id,
                client_secret: this.linkedIn_api.client_secret,
                redirect_uri: this.linkedIn_api.redirect_url,
                code: code
            },
            json: true,
        };
        // Hitting linkedin api to get access token
        return requestPromise(postParameters)
            .then((response) => {
                // Sending response
                resolve(response.access_token);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

function ParseProfileInfo(profileDetails, accessToken) {
    return new Promise((resolve, reject) => {

        logger.info("Informations");
        logger.info(profileDetails);

        // Formating the response in a structural object useful to insert into DB
        var profileInfo = {
            user_id: profileDetails.id,
            email: profileDetails.emailAddress ? profileDetails.emailAddress : '',
            //birthday: response.birthday,
            first_name: profileDetails.firstName.localized.en_US,
            last_name: profileDetails.lastName.localized.en_US ? profileDetails.lastName.localized.en_US : '',
            profile_url: profileDetails.vanityName ? profileDetails.vanityName : '',
            picture_url: profileDetails.profilePicture ? profileDetails.profilePicture['displayImage~'].elements[3].identifiers[0].identifier ? profileDetails.profilePicture['displayImage~'].elements[3].identifiers[0].identifier : "" : '',
            // coverpic_url: profileDetails.backgroundPicture ? profileDetails.backgroundPicture['displayImage~'].elements[3].identifiers[0].identifier ? profileDetails.backgroundPicture['displayImage~'].elements[3].identifiers[0].identifier : "" : '',        
            friend_count: '0',
            access_token: accessToken,
            info: profileDetails.headline ? profileDetails.headline : ''
        };
        // Sending response
        resolve(profileInfo);
    });
}

LinkedIn.prototype.getProfileDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            var requestInfo = {
                method: 'GET',
                uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,vanityName,headline)',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            };
            // Hitting linkedin api to get profile details with accessToken
            return requestPromise(requestInfo)
                .then((details) => {
                    // Formating the response into JSON
                    var profileDetails = JSON.parse(details);
                    // Formating whole JSON into required object
                    return ParseProfileInfo(profileDetails, accessToken);
                })
                .then((profileInfo) => {
                    // Sending response
                    resolve(profileInfo);
                })
                .catch((error) => {
                    // Checking the error of no profile pic
                    if (error.message.includes("Cannot read property 'displayImage' of undefined")) {
                        var requestInfo = {
                            method: 'GET',
                            uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,emailAddress,vanityName,headline)',
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        };
                        // Hitting linkedin api for getting profile details without profile pic
                        return requestPromise(requestInfo)
                            .then((details) => {
                                // Formating the response into JSON
                                var profileDetails = JSON.parse(details);
                                // Formating whole JSON into required object
                                return ParseProfileInfo(profileDetails, accessToken);
                            })
                            .then((profileInfo) => {
                                // Sending response
                                resolve(profileInfo);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                    else reject(error);
                });
        }
    });
};

LinkedIn.prototype.getCompanyProfileDetails = function (code) {

    return new Promise((resolve, reject) => {
        return this.getProfileAccessToken(code)
            .then((accessToken) => {
                if (!accessToken)
                    throw new Error("Can't get access token from linkedIn!");
                else {
                    var linkedInCompanyPages = `https://api.linkedin.com/v1/companies?oauth2_access_token=${accessToken}&format=json&is-company-admin=true`;
                    request.get(linkedInCompanyPages, function (error, response, body) {
                        // Checking whether it sent error in callback or not
                        if (error)
                            reject(error);
                        else {
                            var pageDetails = {
                                access_token: accessToken,
                                company_details: JSON.parse(body)
                            };
                            // Sending response
                            resolve(pageDetails);
                        }
                    });
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

LinkedIn.prototype.addLinkedInProfile = function (network, teamId, code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Can't get code from linkedIn!");
        } else {
            // Calling a function to fetch the accessToken by giving user code
            return this.getProfileAccessToken(code)
                .then((accessToken) => {
                    // Checking whether it gave user accessToken or not
                    if (!accessToken)
                        throw new Error("Can't get access token from linkedIn!");
                    else
                        // Fetching user profile details with user accessToken
                        return this.getProfileDetails(accessToken);
                })
                .then((userDetails) => {
                    // Formating the details
                    var user = {
                        UserName: userDetails.user_id,
                        FirstName: userDetails.first_name,
                        LastName: userDetails.last_name ? userDetails.last_name : '',
                        Email: userDetails.email,
                        SocialId: userDetails.user_id,
                        ProfilePicture: userDetails.picture_url,
                        ProfileUrl: userDetails.profile_url,
                        AccessToken: userDetails.access_token,
                        RefreshToken: userDetails.access_token,
                        FriendCount: userDetails.friend_count,
                        Info: '',
                        TeamId: teamId,
                        Network: network,
                    };
                    // Sending response
                    resolve(user);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

LinkedIn.prototype.publishPostOnCompany = function (postDetails, accessToken, callback) {

    var linkedin = this.LinkedInApiConfig.init(accessToken);

    if (postDetails.postType == 'Text') {
        linkedin.companies.share(postDetails.targetId, {
            "comment": postDetails.message,
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Image') {
        linkedin.companies.share(postDetails.targetId, {
            "content": {
                "title": postDetails.message,
                "description": "",
                "submitted-url": postDetails.mediaPath,
                "submitted-image-url": postDetails.mediaPath
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Video') {
        linkedin.companies.share(postDetails.targetId, {
            "content": {
                "title": postDetails.message,
                "description": "",
                "submitted-url": postDetails.mediaInfos.media_url,
                "submitted-image-url": postDetails.mediaInfos.thumbnail_url
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Link') {
        linkedin.companies.share(postDetails.targetId, {
            "content": {
                "submitted-url": postDetails.link,
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else {
        callback({ code: 400, status: "failed", error: 'Not a valid post.' });
    }
};

function uploadImages(url, accessToken, mediaPath) {
    try {
        var filePath = `public/images/${mediaPath}`;
        var extenstion = require('path').extname(filePath).substr(1);

        return new Promise((resolve, reject) => {

            var formData = {
                file: {
                    value: require('fs').createReadStream(filePath),
                    options: {
                        filename: filePath,
                        contentType: `images/${extenstion}`
                    }
                }
            };

            var postParameter = {
                method: 'POST',
                uri: url,
                headers: {
                    //'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                    "X-Restli-Protocol-Version": "2.0.0"
                },
                formData: formData,
                resolveWithFullResponse: true
            };
            return requestPromise(postParameter)
                .then((response) => {
                    // Sending response
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    } catch (error) {
        logger.info(error);
    }

}

function registerMedia(accessToken, target, userName) {
    return new Promise((resolve, reject) => {
        var postParameter = {
            method: 'POST',
            uri: 'https://api.linkedin.com/v2/assets?action=registerUpload',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
            body: {
                "registerUploadRequest": {
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "owner": `urn:li:${target}:${userName}`,
                    "serviceRelationships": [{
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }]
                }
            },
            json: true,
        };
        return requestPromise(postParameter)
            .then((response) => {
                // Sending response
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

LinkedIn.prototype.publishPost = function (target, postDetails, accessToken, userName) {

    return new Promise((resolve, reject) => {
        var linkedin = this.LinkedInApiConfig.init(accessToken);
        if (postDetails.postType == 'Text') {
            if (postDetails.postType == 'Text') {
                var postParameters = {
                    method: 'POST',
                    uri: 'https://api.linkedin.com/v2/shares',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
                    body: {
                        "owner": `urn:li:${target}:${userName}`,
                        "text": { "text": postDetails.message, },
                        "distribution": {
                            "linkedInDistributionTarget": { "anyOne": true }
                        }
                    },
                    json: true,
                };
                return requestPromise(postParameters)
                    .then((response) => {
                        // Sending response
                        resolve(response.body);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        }
        else if (postDetails.postType == 'Image') {
            return registerMedia(accessToken, target, userName)
                .then((response) => {
                    var uploadUrl = response.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                    return uploadImages(uploadUrl, accessToken, postDetails.mediaPath[0]);
                })
                .then((response) => {
                    // Sending response
                    resolve(response.body);
                })
                .catch((error) => {
                    reject(error);
                });
        }
        else if (postDetails.postType == 'Video') {
            linkedin.people.share({
                "content": {
                    "title": postDetails.message,
                    "description": "",
                    "submitted-url": postDetails.mediaInfos.media_url,
                    "submitted-image-url": postDetails.mediaInfos.thumbnail_url
                },
                "visibility": { "code": "anyone" }
            }, function (error, share) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject({ code: 400, status: "failed", message: error });
                } else {
                    // Sending response
                    resolve({ code: 200, status: "success", message: share });
                }
            });
        }
        else if (postDetails.postType == 'Link') {
            linkedin.people.share({
                "content": {
                    "submitted-url": postDetails.link,
                },
                "visibility": { "code": "anyone" }
            }, function (error, share) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject({ code: 400, status: "failed", message: error });
                } else {
                    // Sending response
                    resolve({ code: 200, status: "success", message: share });
                }
            });
        }
        else {
            reject({ code: 400, status: "failed", error: 'Not a valid post.' });
        }
    });


};

LinkedIn.prototype.publishV1PostOnProfile = function (postDetails, accessToken, callback) {
    var linkedin = this.LinkedInApiConfig.init(accessToken);
    if (postDetails.postType == 'Text') {
        linkedin.people.share({
            "comment": postDetails.message,
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Image') {
        linkedin.people.share({
            "content": {
                "title": postDetails.message,
                "description": "",
                "submitted-url": postDetails.mediaPath,
                "submitted-image-url": postDetails.mediaPath
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Video') {
        linkedin.people.share({
            "content": {
                "title": postDetails.message,
                "description": "",
                "submitted-url": postDetails.mediaInfos.media_url,
                "submitted-image-url": postDetails.mediaInfos.thumbnail_url
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else if (postDetails.postType == 'Link') {
        linkedin.people.share({
            "content": {
                "submitted-url": postDetails.link,
            },
            "visibility": { "code": "anyone" }
        }, function (error, share) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback({ code: 400, status: "failed", message: error });
            } else {
                callback({ code: 200, status: "success", message: share });
            }
        });
    }
    else {
        callback({ code: 400, status: "failed", error: 'Not a valid post.' });
    }
};

LinkedIn.prototype.getCompanyUpdates = function (companyId, accessToken) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!companyId || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            var linkedin = this.LinkedInApiConfig.init(accessToken);
            linkedin.companies.updates(companyId, function (error, updates) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Sending response
                    resolve(updates);
                }
            });
        }
    });
};

LinkedIn.prototype.getCompanyInsights = function (accessToken, socialId, since, untill) {
    return new Promise((resolve, reject) => {
        var report = {};
        var statusUpdateUrl = `https://api.linkedin.com/v1/companies/${socialId}/company-statistics?time-granularity=day&start-timestamp=${since}&format=json&oauth2_access_token=${accessToken}`;
        request.get(statusUpdateUrl, function (error, response, body) {
            // Checking whether it sent error in callback or not
            if (error)
                reject(error);
            else {
                report.companyStatistics = JSON.parse(body);
            }
            var followerUpdateUrl = `https://api.linkedin.com/v1/companies/${socialId}/historical-follow-statistics?time-granularity=day&start-timestamp=${since}&end-timestamp=${untill}&format=json&oauth2_access_token=${accessToken}`;
            request.get(followerUpdateUrl, function (error, response, body) {
                // Checking whether it sent error in callback or not
                if (error)
                    reject(error);
                else {
                    report.companyFollowersStatistics = JSON.parse(body);
                    // Sending response
                    resolve(report);
                }
            });
        });
    });
};

LinkedIn.prototype.likePost = function (accessToken, postId, userId) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !postId || !userId) {
            reject(new Error('Invalid Inputs'));
        } else {
            // Hitting the linkedin api to like a specified post of a user
            request.post({
                headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
                url: `https://api.linkedin.com/v2/socialActions/{shareUrn|ugcPostUrn|commentUrn}/likes`,
                body: {
                    "actor": `urn:li:person:${userId}`,
                    "object": `urn:li:share:${postId}`
                }
            }, function (error, response, body) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Sending response
                    resolve(body);
                }
            });
        }
    });
};

LinkedIn.prototype.commentPost = function (accessToken, postId, userId, comment) {
    return new Promise((resolve, reject) => {
        // Checking whether the inputs are having values or not
        if (!accessToken || !postId || !userId || !comment) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.post({
                headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
                url: `https://api.linkedin.com/v2/socialActions/{shareUrn|ugcPostUrn|commentUrn}/comments`,
                body: {
                    "actor": `urn:li:person:${userId}`,
                    "message": {
                        "attributes": [],
                        "text": comment
                    }
                }
            }, function (error, response, body) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Sending response
                    resolve(body);
                }
            });
        }
    });
};

LinkedIn.prototype.getConnections = function (accessToken) {
    return new Promise((resolve, reject) => {
        request.get({
            headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
            url: `https://api.linkedin.com/v2/connections?q=viewer&projection=(paging)`
        }, function (error, response, body) {
            // Checking whether it sent error in callback or not
            if (error) {
                reject(error);
            } else {
                var updateDetail = {
                    friendship_count: response.paging.total,
                };
                // Sending response
                resolve(updateDetail);
            }
        });
    });
};

module.exports = LinkedIn;
