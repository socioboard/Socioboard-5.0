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
        request.post({
            url: `https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=${this.pinterest_api.client_id}&client_secret=${this.pinterest_api.client_secret}&code=${code}`
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody.access_token);
            }
        });
    });
};

Pinterest.prototype.userProfileInfo = function (accessToken) {
    return new Promise((resolve, reject) => {
        return requestPromise(`https://api.pinterest.com/v1/users/me/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Cusername%2Cimage%2Ccounts%2Cbio%2Caccount_type`)
            .then((body) => {
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
            return this.getAppAccessToken(code)
                .then((accessToken) => {
                    accessTokens = accessToken;
                    return this.userProfileInfo(accessToken);
                })
                .then((userDetails) => {
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
                    return this.getBoards(accessTokens);
                })
                .then((boards) => {
                    userInformations.Boards = boards;
                    resolve(userInformations);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};




Pinterest.prototype.getBoards = function (access_token) {
    return new Promise((resolve, reject) => {
        request.get({
            url: `https://api.pinterest.com/v1/me/boards?&access_token=${access_token}&fields=creator%2Cid%2Cname%2Cprivacy%2Curl`
        }, function (error, response, body) {
            var boardDetails = [];
            if (error) {
                resolve(boardDetails);
            } else {
                var parsedBody = JSON.parse(body);
                var parsedBodyData = parsedBody.data;

                if (parsedBodyData) {
                    parsedBodyData.forEach(board => {
                        var admin_lastName = board.creator.last_name ? board.creator.last_name : '';
                        var boardDetail = {
                            board_url: board.url,
                            privacy: board.privacy,
                            board_id: board.id,
                            board_name: board.name,
                            board_admin_name: `${board.creator.first_name} ${admin_lastName}`,
                            board_admin_url: board.creator.url,
                            board_admin_id: board.creator.id
                        };
                        boardDetails.push(boardDetail);
                    });
                    resolve(boardDetails);
                } else {
                    resolve(boardDetails);
                }
            }
        });
    });


};

Pinterest.prototype.deleteBoards = function (accessToken, boardUrl) {
    return new Promise((resolve, reject) => {
        request.delete({
            url: `https://api.pinterest.com/v1/boards/${boardUrl}?&access_token=${accessToken}`
        }, function (error, respnse, body) {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
};

Pinterest.prototype.getBoardDetails = function (access_token, boardurl) {
    return new Promise((resolve, reject) => {
        request.get({
            url: `https://api.pinterest.com/v1/boards/${boardurl}?&access_token=${access_token}&fields=creator%2Cid%2Cname%2Cprivacy%2Curl`
        }, function (error, response, body) {

            if (error) {
                resolve({});
            } else {
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
                resolve(boardDetail);
            }
        });
    });
};

Pinterest.prototype.getPins = function (access_token, callback) {
    try {
        request.get({
            url: `https://api.pinterest.com/v1/me/pins?&access_token=${access_token}`
        }, function (error, respnse, body) {
            if (error) {
                callback(error);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    } catch (error) {
        callback(error);
    }
};

Pinterest.prototype.getBoardPins = function (access_token, board_name) {
    return new Promise((resolve, reject) => {
        if (!access_token || !board_name) {
            reject(new Error("Invalid Inputs"));
        } else {
            var url = `https://api.pinterest.com/v1/boards/${board_name}pins?&access_token=${access_token}`;
            request.get({
                url: url
            }, function (error, respnse, body) {
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

Pinterest.prototype.createBoard = function (access_token, board_name, board_description) {

    return new Promise((resolve, reject) => {
        request.post({
            url: `https://api.pinterest.com/v1/boards/?access_token=${access_token}&name=${board_name}&description=${board_description}`
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                resolve(parsedBody);
            }
        });
    });
};

Pinterest.prototype.createPins = function (postDetails, boardIds, accessToken) {
    var basePath = path.resolve(__dirname, '../../..');
    return new Promise((resolve, reject) => {
        var random = lodash.random(0, postDetails.mediaPath.length - 1);
        let image = fs.createReadStream(`${basePath}/media/${postDetails.mediaPath[random]}`);
        var formData = { image: image };
        var successPins = [];
        var failedBoards = [];
        var response = [];
        var errors = [];

        return Promise.all(boardIds.map(function (board) {
            return new Promise((resolve, reject) => {
                requestPromise.post({
                    url: `https://api.pinterest.com/v1/pins/?board=${board}&access_token=${accessToken}&link=${postDetails.link}&note=${postDetails.message}`,
                    formData: formData
                })
                    .then((body) => {

                        response.push(body);

                        var parsedBody = JSON.parse(body);
                        if (parsedBody.data) {
                            successPins.push(parsedBody.data.url);
                        }
                        else if (parsedBody.message) {
                            failedBoards.push(board);
                        }
                        resolve();
                    })
                    .catch((error) => {
                        errors.push(error);
                        failedBoards.push(board);
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

                resolve(publishResponse);
            })
            .catch((error) => {
                var publishResponse = {
                    successPublishIds: successPins,
                    failedBoards: failedBoards,
                    response: response,
                    errors: errors
                };
                resolve(publishResponse);
            });

    });


};


Pinterest.prototype.userDetails = function (UserName, accessToken) {
    return new Promise((resolve, reject) => {
        if (!UserName || !accessToken) {
            reject(new Error('Invalid Inputs'));
        } else {
            request.get(`https://api.pinterest.com/v1/users/${UserName}/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Ccounts%2Cbio%2Cimage`, function (error, respnse, body) {
                if (error) {
                    reject(error);
                } else {
                    var response = JSON.parse(body);
                    var updateDetail = {
                        follower_count: response.data.counts.followers,
                        following_count: response.data.counts.following,
                        profile_picture: response.data.image['60x60'].url,
                        bio_text: response.data.bio,
                        board_count: response.data.counts.boards,
                    };
                    resolve(updateDetail);
                }
            });
        }
    });
};

module.exports = Pinterest;