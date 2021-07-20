// const request = require('request');
// const requestPromise = require('request-promise');
import request from 'request';
import requestPromise from 'request-promise';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import logger from '../../Publish/resources/Log/logger.log.js'
import axios from 'axios'


const __dirname = dirname(fileURLToPath(import.meta.url));

function LinkedIn(linkedIn_api) {
    this.linkedIn_api = linkedIn_api;
    this.LinkedInApiConfig = require('node-linkedin')(linkedIn_api.client_id,
        linkedIn_api.client_secret,
        linkedIn_api.redirect_url);
    this.scope = ['r_basicprofile', 'r_emailaddress', 'r_liteprofile', 'w_share', 'w_member_social', 'rw_company_admin'];
}

LinkedIn.prototype.getOAuthUrl = function (state) {

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedIn_api.client_id}&redirect_uri=${this.linkedIn_api.redirect_url}&scope=r_basicprofile%20r_emailaddress%20w_member_social`;
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
                        ProfilePicture: userDetails.picture_url ? userDetails.picture_url : "https://i.imgur.com/fdzLeWY.png",
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

LinkedIn.prototype.getProfileDetails = function (accessToken) {
    return new Promise((resolve, reject) => {
        let profileDetails;
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
                    profileDetails = JSON.parse(details);
                    // Formating whole JSON into required object
                    var requestInfo = {
                        method: 'GET',
                        uri: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    };
                    return requestPromise(requestInfo)
                })
                .then((result) => {
                    let data = JSON.parse(result);
                    return ParseProfileInfo(profileDetails, accessToken, data)
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
                            uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,vanityName,headline)',
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        };
                        // Hitting linkedin api to get profile details with accessToken
                        return requestPromise(requestInfo)
                            .then((details) => {
                                // Formating the response into JSON
                                profileDetails = JSON.parse(details);
                                // Formating whole JSON into required object
                                var requestInfo = {
                                    method: 'GET',
                                    uri: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                                    headers: { 'Authorization': `Bearer ${accessToken}` }
                                };
                                return requestPromise(requestInfo)
                            })
                            .then((result) => {
                                let data = JSON.parse(result);
                                return ParseProfileInfo(profileDetails, accessToken, data)
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


function ParseProfileInfo(profileDetails, accessToken, data) {
    return new Promise((resolve, reject) => {

        // logger.info("Informations");
        // logger.info(profileDetails);
        // Formating the response in a structural object useful to insert into DB
        var profileInfo = {
            user_id: profileDetails.id,
            email: data ? data.elements[0][`handle~`].emailAddress ? data.elements[0][`handle~`].emailAddress : '' : '',
            //birthday: response.birthday,
            first_name: profileDetails.firstName.localized.en_US,
            last_name: profileDetails.lastName.localized.en_US ? profileDetails.lastName.localized.en_US : '',
            profile_url: profileDetails.vanityName ? `https://www.linkedin.com/in/${profileDetails.vanityName}` : '',
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


LinkedIn.prototype.getV1OAuthUrl = function (state) {
    // return this.LinkedInApiConfig.auth.authorize(this.scope, state);
    return this.LinkedInApiConfig.auth.authorize(this.scope);
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

LinkedIn.prototype.publishPostOnCompany = function (postDetails, accessToken, callback) {

    var linkedin = this.LinkedInApiConfig.init(accessToken);

    if (postDetails.postType == 'Text') {
        linkedin.companies.share(postDetails.targetId, {
            "comment": postDetails.message,
            "visibility": { "code": "anyone" }
        }, function (error, share) {
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

function uploadImages(url, accessToken, imagePath) {
    try {

        var basePath = path.resolve(__dirname, '../../..');
        var filePath = `${basePath}/media/${imagePath}`;
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
                // host: `api.linkedin.com`,
                headers: {
                    //'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': `images/${extenstion}`,
                    'Accept': '*/*',
                    'Content-Type': 'application/octet-stream'
                },
                formData: {
                    image: fs.createReadStream(filePath)
                }
                ,
                resolveWithFullResponse: true
            };
            return requestPromise(postParameter)
                .then((response) => {
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
                    "owner": `urn:li:${target}:${userName}`,
                    "recipes": [
                        "urn:li:digitalmediaRecipe:feedshare-image"
                    ],
                    "serviceRelationships": [
                        {
                            "identifier": "urn:li:userGeneratedContent",
                            "relationshipType": "OWNER"
                        }
                    ],
                    "supportedUploadMechanism": [
                        "SYNCHRONOUS_UPLOAD"
                    ]
                }
            },
            json: true,
        };
        return requestPromise(postParameter)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function uploadVideo(url, accessToken, imagePath) {
    try {

        var basePath = path.resolve(__dirname, '../../..');
        var filePath = `${basePath}/media/${imagePath}`;
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
                // host: `api.linkedin.com`,
                headers: {
                    //'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': `images/${extenstion}`,
                    'Accept': '*/*',
                    'Content-Type': 'application/octet-stream'
                },
                formData: {
                    image: fs.createReadStream(filePath)
                }
                ,
                resolveWithFullResponse: true
            };
            return requestPromise(postParameter)
                .then((response) => {
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

function registerMediaVideo(accessToken, target, userName) {
    return new Promise((resolve, reject) => {
        var postParameter = {
            method: 'POST',
            uri: 'https://api.linkedin.com/v2/assets?action=registerUpload',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
            body: {
                "registerUploadRequest": {
                    "owner": `urn:li:${target}:${userName}`,
                    "recipes": [
                        "urn:li:digitalmediaRecipe:feedshare-video"
                    ],
                    "serviceRelationships": [
                        {
                            "identifier": "urn:li:userGeneratedContent",
                            "relationshipType": "OWNER"
                        }
                    ]
                }
            },
            json: true,
        };
        return requestPromise(postParameter)
            .then((response) => {
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
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        }
        else if (postDetails.postType == 'Image') {
            let basePath = path.resolve(__dirname, '../../..');
            let filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
            let contentType = require('path').extname(filePath).substr(1);
            let imageData;
            let asset;
            const promise = fs.promises.readFile(filePath);
            promise.then(function (buffer) {
                imageData = buffer
                return registerMedia(accessToken, target, userName)
            })
                .then((result) => {
                    const url = result.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
                        assetId = result.value.asset.replace('urn:li:digitalmediaAsset:', '');
                    asset = result.value.asset;
                    return axios.put(url, imageData, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': contentType,
                        },
                    })
                }).then(() => {
                    var postParameters = {
                        method: 'POST',
                        uri: 'https://api.linkedin.com/v2/shares',
                        headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
                        body: {
                            "owner": `urn:li:${target}:${userName}`,
                            "text": { "text": postDetails.message },
                            "subject": "Test Share Subject",
                            "distribution": {
                                "linkedInDistributionTarget": { "anyOne": true }
                            },
                            "content": {
                                "contentEntities": [
                                    {
                                        "entity": `${asset}`
                                    }
                                ],
                                "title": "Test Share with Content title",
                                "shareMediaCategory": "IMAGE"
                            }
                        },
                        json: true,
                    };
                    return requestPromise(postParameters)
                        .then((response) => {
                            resolve(response);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
        }
        else if (postDetails.postType == 'Video') {
            let basePath = path.resolve(__dirname, '../../..');
            let filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
            let contentType = require('path').extname(filePath).substr(1);
            let imageData;
            let asset;
            const promise = fs.promises.readFile(filePath);
            promise.then(function (buffer) {
                imageData = buffer
                return registerMediaVideo(accessToken, target, userName)
            })
                .then((result) => {
                    const url = result.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
                        assetId = result.value.asset.replace('urn:li:digitalmediaAsset:', '');
                    asset = result.value.asset;
                    return axios.put(url, imageData, {
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Type': contentType
                        },
                    })
                }).then(() => {
                    return axios.get(`https://api.linkedin.com/v2/assets/${asset.replace('urn:li:digitalmediaAsset:', '')}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'X-Restli-Protocol-Version': '2.0.0'
                        },
                    })
                })
                .then((response) => {
                    let status = response.data.recipes[0].status
                    resolve({ asset, status })
                })
        }
        else if (postDetails.postType == 'Link') {
            // linkedin.people.share({
            //     "content": {
            //         "submitted-url": `${postDetails.link}`,
            //     }
            //     ,
            //     "visibility": { "code": "anyone" }
            // }, function (error, share) {
            //     console.log("error, share", error, share)
            //     if (error) {
            //         reject({ code: 400, status: "failed", message: error });
            //     } else {
            //         resolve({ code: 200, status: "success", message: share });
            //     }
            // });
            var postParameters = {
                method: 'POST',
                uri: 'https://api.linkedin.com/v2/shares',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
                body: {
                    "owner": `urn:li:${target}:${userName}`,
                    //"text": { "text": postDetails.message, },
                    "content": {
                        "contentEntities": [
                            {
                                "entity": "urn:li:article:0",
                                "entityLocation": postDetails.link,
                                // "thumbnails": [
                                //     {
                                //         "imageSpecificContent": {},
                                //         "resolvedUrl": "https://www.example.com/image.jpg"
                                //     }
                                // ]
                            }
                        ],
                        // "description": postDetails.message,
                        "title": postDetails.message
                    },
                    "distribution": {
                        "linkedInDistributionTarget": { "anyOne": true }
                    }
                },
                json: true,
            };
            return requestPromise(postParameters)
                .then((response) => {
                    resolve(response.body);
                })
                .catch((error) => {
                    reject(error);
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
        if (!companyId || !accessToken) {
            reject(new Error("Invalid Inputs"));
        } else {
            var linkedin = this.LinkedInApiConfig.init(accessToken);
            linkedin.companies.updates(companyId, function (error, updates) {
                if (error) {
                    reject(error);
                } else {
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
            if (error)
                reject(error);
            else {
                report.companyStatistics = JSON.parse(body);
            }
            var followerUpdateUrl = `https://api.linkedin.com/v1/companies/${socialId}/historical-follow-statistics?time-granularity=day&start-timestamp=${since}&end-timestamp=${untill}&format=json&oauth2_access_token=${accessToken}`;
            request.get(followerUpdateUrl, function (error, response, body) {
                if (error)
                    reject(error);
                else {
                    report.companyFollowersStatistics = JSON.parse(body);
                    resolve(report);
                }
            });
        });
    });
};

/**
 * TODO To share video to liked In after upload got finished
 * Function to share video to liked In after upload got finished
 * @param  {string} accessToken -Access token of linkedin account  
 * @param  {string} target -Target for linkedin api Person or company
 * @param  {string} userName -LinkedIn account username
 * @param  {string} asset -Asset id return by register media api
 * @param  {string} status -Media upload status returned by linkedin
 * @param  {string} message -Media description
 */
LinkedIn.prototype.shareUploadVideo = function (accessToken, target, userName, asset, status, message) {
    return new Promise((resolve, reject) => {
        const postParameters = {
            method: 'POST',
            uri: 'https://api.linkedin.com/v2/ugcPosts',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'content-type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: {
                "author": `urn:li:${target}:${userName}`,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "media": [
                            {
                                "media": `${asset}`,
                                status,
                                "title": {
                                    "attributes": [],
                                    "text": "Sample Video Create"
                                }
                            }
                        ],
                        "shareCommentary": {
                            "attributes": [],
                            "text": message
                        },
                        "shareMediaCategory": "VIDEO"
                    }
                },
                "targetAudience": {
                    "targetedEntities": [
                        {
                        }
                    ]
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            },
            json: true,
        };
        setTimeout(async function () {
            try {
                const response = await requestPromise(postParameters);
                resolve(response);
            } catch (error) { }
        }, 20000);
    });
};





export default LinkedIn;