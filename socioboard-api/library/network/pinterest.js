const request = require('request');
const fs = require('fs');
const lodash = require('lodash');
const requestPromise = require('request-promise');
const path = require('path');


function Pinterest(pinterest_api) {
    this.pinterest_api = pinterest_api;
}

Pinterest.prototype.getAppAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        // Hitting the pinterest api to get user accessToken by giving user code
        request.post({
            url: `https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=${this.pinterest_api.client_id}&client_secret=${this.pinterest_api.client_secret}&code=${code}`
        }, function (error, response, body) {
            // Checking whether it sent error in callback or not
            if (error) {
                if (parsedBody.message && parsedBody.message.includes('You have exceeded your rate limit. Try again later.'))
                    reject(new Error('You have exceeded your rate limit. Try again later.'));
                else
                    reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                if (parsedBody.message && parsedBody.message.includes('You have exceeded your rate limit. Try again later.'))
                    reject(new Error('You have exceeded your rate limit. Try again later.'));
                // Sending response
                else
                    resolve(parsedBody.access_token);
            }
        });
    });
};

Pinterest.prototype.userProfileInfo = function (accessToken) {
    return new Promise((resolve, reject) => {
        // Hitting the pinterest api to get user profile details by using user accessToken
        return requestPromise(`https://api.pinterest.com/v1/users/me/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Cusername%2Cimage%2Ccounts%2Cbio%2Caccount_type`)
            .then((body) => {
                // Formating the response
                var parsedBody = JSON.parse(body);
                var parsedBodyData = parsedBody.data;
                var profileInfo = {
                    user_id: parsedBodyData.id,
                    user_name: parsedBodyData.username,
                    email: '',
                    birthday: '',
                    profile_pic_url: parsedBodyData.image['60x60'].url,
                    first_name: parsedBodyData.first_name,
                    last_name: parsedBodyData.last_name,
                    friend_count: parsedBodyData.counts.boards,
                    info: JSON.stringify(parsedBodyData.counts),
                    access_token: accessToken,
                    profile_url: parsedBodyData.url
                };
                // Sending response
                resolve(profileInfo);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

Pinterest.prototype.addPinterestProfile = function addFacebook(network, teamId, code) {
    var userInformations = null;
    var accessTokens = null;
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Can't get code from pinterest!");
        } else {
            // Caliing function of getting accessToken by giving code as input
            return this.getAppAccessToken(code)
                .then((accessToken) => {
                    accessTokens = accessToken;
                    // After getting accessToken, sending it to get user profile details
                    return this.userProfileInfo(accessToken);
                })
                .then((userDetails) => {
                    // Formating the response
                    var user = {
                        UserName: userDetails.user_name,
                        FirstName: userDetails.first_name,
                        LastName: userDetails.last_name ? userDetails.last_name : '',
                        Email: userDetails.email,
                        SocialId: userDetails.user_id,
                        ProfilePicture: userDetails.profile_pic_url,
                        ProfileUrl: userDetails.profile_url,
                        AccessToken: userDetails.access_token,
                        RefreshToken: userDetails.access_token,
                        FriendCount: userDetails.friend_count,
                        Info: userDetails.info,
                        TeamId: teamId,
                        Network: network,
                    };
                    return user;
                })
                .then((user) => {
                    userInformations = user;
                    // Fetching user Boards with user accessToken
                    return this.getBoards(accessTokens);
                })
                .then((boards) => {
                    userInformations.Boards = boards;
                    // Sending response
                    resolve(userInformations);
                })
                .catch((error) => {
                    if (error.message && error.message.includes("Authorization failed."))
                        reject(new Error("Authorization failed."));
                    else if (error.message && error.message.includes("You have exceeded your rate limit. Try again later."))
                        reject(new Error("You have exceeded your rate limit. Try again later."));
                    else
                        reject(error);
                });
        }
    });
};

Pinterest.prototype.getBoards = function (access_token) {
    return new Promise((resolve, reject) => {
        if (!access_token) {
            reject(new Error('Invalid access_token'));
        } else {
            request.get({
                //(creator deprecated) url: `https://api.pinterest.com/v1/me/boards?&access_token=${access_token}&fields=creator%2Cid%2Cname%2Cprivacy%2Curl`
                url: `https://api.pinterest.com/v1/me/boards?&access_token=${access_token}&fields=id%2Cname%2Cprivacy%2Curl`
            }, function (error, response, body) {
                // Checking whether it sent error in callback or not
                var boardDetails = [];
                if (error) {
                    // Sending response
                    resolve(boardDetails);
                } else {
                    // Formating the response
                    var parsedBody = JSON.parse(body);
                    var parsedBodyData = parsedBody.data;

                    if (parsedBodyData) {
                        parsedBodyData.forEach(board => {
                            // var admin_lastName = board.creator.last_name ? board.creator.last_name : '';
                            var boardDetail = {
                                board_url: board.url,
                                privacy: board.privacy,
                                board_id: board.id,
                                board_name: board.name,
                                board_admin_name: `(deprecated)`,
                                board_admin_url: `(deprecated)`,
                                board_admin_id: `(deprecated)`
                            };
                            boardDetails.push(boardDetail);
                        });
                        // Sending response
                        resolve(boardDetails);
                    } else {
                        // Sending response
                        resolve(boardDetails);
                    }
                }
            });
        }
    });
};

Pinterest.prototype.deleteBoards = function (accessToken, boardUrl) {
    return new Promise((resolve, reject) => {
        if (!accessToken || !boardUrl) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.delete({
                url: `https://api.pinterest.com/v1/boards/${boardUrl}?&access_token=${accessToken}`
            }, function (error, respnse, body) {
                // Checking whether it sent error in callback or not
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
};

Pinterest.prototype.getBoardDetails = function (access_token, boardurl) {
    return new Promise((resolve, reject) => {
        if (!access_token || !boardurl) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get({
                url: `https://api.pinterest.com/v1/boards/${boardurl}?&access_token=${access_token}&fields=creator%2Cid%2Cname%2Cprivacy%2Curl`
            }, function (error, response, body) {
                // Checking whether it sent error in callback or not
                if (error) {
                    // Sending response
                    reject(error);
                } else {
                    // Formating the response
                    var parsedBody = JSON.parse(body);
                    var parsedBodyData = parsedBody.data;
                    var admin_lastName = parsedBodyData.creator ? parsedBodyData.creator.last_name : '';
                    var boardDetail = {
                        board_url: parsedBodyData.url,
                        privacy: parsedBodyData.privacy,
                        board_id: parsedBodyData.id,
                        board_name: parsedBodyData.name,
                        board_admin_name: `${parsedBodyData.creator.first_name} ${admin_lastName}`,
                        board_admin_url: parsedBodyData.creator.url,
                        board_admin_id: parsedBodyData.creator.id
                    };
                    // Sending response
                    resolve(boardDetail);
                }
            });
        }
    });
};

Pinterest.prototype.getPins = function (access_token, callback) {
    try {
        request.get({
            url: `https://api.pinterest.com/v1/me/pins?&access_token=${access_token}`
        }, function (error, respnse, body) {
            // Checking whether it sent error in callback or not
            if (error) {
                callback(error);
            } else {
                // Formating the response into JSON object
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    } catch (error) {
        if (error.message && error.message.includes("You have exceeded your rate limit. Try again later."))
            reject(new Error("You have exceeded your rate limit. Try again later."));
        callback(error);
    }
};

Pinterest.prototype.getBoardPins = function (access_token, board_name) {
    return new Promise((resolve, reject) => {
        if (!access_token || !board_name) {
            reject(new Error("Invalid Inputs"));
        } else {
            var url = `https://api.pinterest.com/v1/boards/${board_name}pins?&access_token=${access_token}`;
            // Hitting the pinterest api to get pins of a specified board related to an user profile by that profile accessToken
            request.get({
                url: url
            }, function (error, respnse, body) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Formating the response
                    var parsedBody = JSON.parse(body);
                    // Checking whether response contain rate limit error or not
                    if (parsedBody.message && parsedBody.message.includes("You have exceeded your rate limit. Try again later."))
                        reject(new Error("You have exceeded your rate limit. Try again later."));
                    // checking any error message is there or not.
                    else if (parsedBody.message)
                        reject(parsedBody);
                    else
                        // Sending response
                        resolve(parsedBody);
                }
            });
        }
    });
};

Pinterest.prototype.createBoard = function (access_token, board_name, board_description) {
    return new Promise((resolve, reject) => {
        if (access_token || board_name) {
            reject(new Error('Invalid Inputs'));
        } else {
            // Hitting the pinterest api to create a Board in profile using profile accessToken with board details
            request.post({
                url: `https://api.pinterest.com/v1/boards/?access_token=${access_token}&name=${board_name}&description=${board_description}`
            }, function (error, response, body) {
                // Checking whether it sent error in callback or not
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

Pinterest.prototype.createPins = function (postDetails, boardIds, accessToken) {
    var basePath = path.resolve(__dirname, '../../..');
    return new Promise((resolve, reject) => {
        if (!postDetails || !accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            var random = lodash.random(0, postDetails.mediaPath.length - 1);
            let image = fs.createReadStream(`${basePath}/media/${postDetails.mediaPath[random]}`);
            var formData = { image: image };
            var successPins = [];
            var failedBoards = [];
            var response = [];
            var errors = [];

            return Promise.all(boardIds.map(function (board) {
                return new Promise((resolve, reject) => {
                    // Hitting the pinterest api to create a pin under specified Board of a profile accessToken
                    requestPromise.post({
                        url: `https://api.pinterest.com/v1/pins/?board=${board}&access_token=${accessToken}&link=${postDetails.link}&note=${postDetails.message}`,
                        formData: formData
                    })
                        .then((body) => {
                            response.push(body);
                            // Formating the response
                            var parsedBody = JSON.parse(body);
                            if (parsedBody.data) {
                                successPins.push(parsedBody.data.url);
                            }
                            else if (parsedBody.message) {
                                failedBoards.push(board);
                            }
                            // Sending response
                            resolve();
                        })
                        .catch((error) => {
                            errors.push(error);
                            failedBoards.push(board);
                            // Sending response
                            resolve();
                        });
                });
            }))
                .then(() => {
                    var publishResponse = {
                        successPublishIds: successPins,
                        failedBoards: failedBoards,
                        response: response,
                        errors: errors
                    };
                    // Sending response
                    resolve(publishResponse);
                })
                .catch((error) => {
                    var publishResponse = {
                        successPublishIds: successPins,
                        failedBoards: failedBoards,
                        response: response,
                        errors: errors
                    };
                    // Sending response
                    resolve(publishResponse);
                });
        }
    });
};

Pinterest.prototype.userDetails = function (UserName, accessToken) {
    return new Promise((resolve, reject) => {
        if (!UserName || !accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get(`https://api.pinterest.com/v1/users/${UserName}/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Ccounts%2Cbio%2Cimage`, function (error, respnse, body) {
                // Checking whether it sent error in callback or not
                if (error) {
                    reject(error);
                } else {
                    // Formating the response
                    var response = JSON.parse(body);
                    var updateDetail = {
                        follower_count: response.data.counts.followers,
                        following_count: response.data.counts.following,
                        profile_picture: response.data.image['60x60'].url,
                        bio_text: response.data.bio,
                        board_count: response.data.counts.boards,
                    };
                    // Sending response
                    resolve(updateDetail);
                }
            });
        }
    });
};

module.exports = Pinterest;