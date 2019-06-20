const request = require('request');
const requestPromise = require('request-promise');

function Instagram(instagram) {
    this.instagram = instagram;
    this.profile_add_redirect_url = instagram.redirect_url;
}

Instagram.prototype.getInstagramAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        var requestBody = `code=${code}&redirect_uri=${this.profile_add_redirect_url}&client_id=${this.instagram.client_id}&client_secret=${this.instagram.client_secret}&grant_type=authorization_code`;
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'https://api.instagram.com/oauth/access_token',
            body: requestBody
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

Instagram.prototype.getInstagramProfileInformation = function (accessToken) {
    return new Promise((resolve, reject) => {
        request.get({
            url: `https://api.instagram.com/v1/users/self/?access_token=${accessToken}`
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                var parsedData = parsedBody.data;
                counts = {
                    media: parsedData.counts.media,
                    follows: parsedData.counts.follows,
                    followed_by: parsedData.counts.followed_by,
                };

                var userDetails = {
                    UserName: parsedData.username,
                    FirstName: parsedData.full_name,
                    LastName: '',
                    Email: '',
                    SocialId: parsedData.id,
                    ProfilePicture: parsedData.profile_picture,
                    ProfileUrl: `https://www.instagram.com/${parsedData.username}`,
                    AccessToken: accessToken,
                    RefreshToken: '',
                    FriendCount: parsedData.counts.follows,
                    Info: JSON.stringify(counts),
                };
                resolve(userDetails);
            }
        });
    });


};

Instagram.prototype.addInstagramProfile = function addInstagram(network, teamId, code) {
    return new Promise((resolve, reject) => {
        if (!code) {
            reject("Can't get code from instagram!");
        } else {
            return this.getInstagramAccessToken(code)
                .then((accessToken) => {
                    return this.getInstagramProfileInformation(accessToken);
                })
                .then((userDetails) => {
                    userDetails.TeamId = teamId;
                    userDetails.Network = network;
                    resolve(userDetails);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

Instagram.prototype.getInstagramFeeds = function (accessToken, socialId, recentInstaId) {
    return new Promise((resolve, reject) => {
        if (!accessToken) {
            reject(new Error("Invalid accesstoken!"));
        } else {
            var postDetails = [];
            var url = '';
            if (recentInstaId)
                url = `https://api.instagram.com/v1/users/self/media/recent/?min_id=${recentInstaId}&access_token=${accessToken}`;
            else
                url = `https://api.instagram.com/v1/users/self/media/recent/?&access_token=${accessToken}`;

            return requestPromise.get(url)
            .then((body) => {
                var parsedBody = JSON.parse(body);
                parsedBody.data.forEach(post => {
                    var data = {
                        postId: post.id,
                        socialId: post.user.id,
                        userName: post.user.full_name,
                        mediaUrl: post.images.standard_resolution.url,
                        publishedDate: post.caption ? post.caption.created_time : "",
                        captionId: post.caption ? post.caption.id : "",
                        captionText: post.caption ? post.caption.text : "",
                        isUserLiked: post.user_has_liked,
                        likeCount: post.likes.count,
                        commentCount: post.comments.count,
                        type: post.type,
                        link: post.link,
                        locationName: post.location ? post.location.name : "",
                        locationId: post.location ? post.location.id : "",
                    };
                    postDetails.push(data);
                });
            })
                .then(() => {
                    resolve(postDetails);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};


module.exports = Instagram;



