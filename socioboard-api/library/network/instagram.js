const request = require('request');
const requestPromise = require('request-promise');

// instgram is a config data of instgram from the route
function Instagram(instagram) {
    // Assigning "instgram" object to this.instgram
    this.instagram = instagram;
    // Assigning a specified redirect_url key of instagram to this.profile_add_redirect_url
    this.profile_add_redirect_url = instagram.redirect_url;
}

// For fetching the user instagram accessToken with user code
Instagram.prototype.getInstagramAccessToken = function (code) {
    return new Promise((resolve, reject) => {
        var requestBody = `code=${code}&redirect_uri=${this.profile_add_redirect_url}&client_id=${this.instagram.client_id}&client_secret=${this.instagram.client_secret}&grant_type=authorization_code`;
        // Hitting instagram api to get the user accessToken by exchanging user code
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'https://api.instagram.com/oauth/access_token',
            body: requestBody
        }, function (error, response, body) {
            // Checking whether it sent error in callback or not
            if (error) {
                reject(error);
            } else {
                var parsedBody = JSON.parse(body);
                // Sending response
                resolve(parsedBody.access_token);
            }
        });
    });
};

Instagram.prototype.getInstagramProfileInformation = function (accessToken) {
    return new Promise((resolve, reject) => {
        // Hitting instagram api to get profile information
        request.get({
            url: `https://api.instagram.com/v1/users/self/?access_token=${accessToken}`
        }, function (error, response, body) {
            // Checking whether it sent error in callback or not
            if (error) {
                reject(error);
            } else {
                // Formating the response
                var parsedBody = JSON.parse(body);
                var parsedData = parsedBody.data;
                counts = {
                    media: parsedData.counts.media,
                    follows: parsedData.counts.follows,
                    followed_by: parsedData.counts.followed_by,
                };

                // Making full account details object to insert into DB
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
                // Sending response
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
            // Calling function to get cccessToken by giving code
            return this.getInstagramAccessToken(code)
                .then((accessToken) => {
                    // Calling function to get profile details of that account using accessToken
                    return this.getInstagramProfileInformation(accessToken);
                })
                .then((userDetails) => {
                    userDetails.TeamId = teamId;
                    userDetails.Network = network;
                    // Sending response
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
            // Making a specific url based on the requirement(input)
            if (recentInstaId)
                url = `https://api.instagram.com/v1/users/self/media/recent/?min_id=${recentInstaId}&access_token=${accessToken}`;
            else
                url = `https://api.instagram.com/v1/users/self/media/recent/?&access_token=${accessToken}`;

            // Hitting instagram api to get user posts
            return requestPromise.get(url)
                .then((body) => {
                    // Formating the response
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
                    // Sending response
                    resolve(postDetails);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};


module.exports = Instagram;



