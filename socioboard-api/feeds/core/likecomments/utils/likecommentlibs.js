const config = require('config');
const FacebookLikeComment = require('../../../../library/network/facebook');
const TwitterLikeComment = require('../../../../library/network/twitter');
const YoutubeLikeComment = require('../../../../library/network/google');
const TwitterMongoPostModel = require('../../../../library/mongoose/models/twitterposts');
const YoutubeMongoPostModel = require('../../../../library/mongoose/models/youtubepost');
const logger = require('../../../utils/logger');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

class LikeCommentLibs {

    constructor() {
        Object.assign(this, UserTeamAccount);
        this.facebookLikeComment = new FacebookLikeComment(config.get("facebook_api"));
        this.twitterLikeComment = new TwitterLikeComment(config.get("twitter_api"));
        this.youtubeLikeComment = new YoutubeLikeComment(config.get("google_api"));
    }

    facebookLike(userId, accountId, teamId, postId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !postId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount([2], accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.facebookLikeComment.likeFacebookPost(socialAccount.social_id, postId, socialAccount.access_token);
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    facebookComment(userId, accountId, teamId, postId, comment) {
        return new Promise((resolve, reject) => {
            if (!accountId || !postId || !comment) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.facebookLikeComment.commentFacebookPost(socialAccount.social_id, postId, comment, socialAccount.access_token);
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    twitterLike(userId, accountId, teamId, tweetId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !tweetId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.twitterLikeComment.likeTwitterPost(tweetId, socialAccount.access_token, socialAccount.refresh_token);
                    })
                    .then((response) => {
                        if (response.statusCode == 200) {
                            var twitterMongoPostModelObject = new TwitterMongoPostModel();
                            twitterMongoPostModelObject.updateLike(tweetId, true)
                                .then(() => {
                                    resolve("Successfully liked.");
                                })
                                .catch((error) => {
                                    throw new Error("Sorry! Something went wrong.");
                                });
                        }
                        else
                            throw new Error("Sorry! Something went wrong.");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    twitterDislike(userId, accountId, teamId, tweetId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !tweetId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.twitterLikeComment.unlikeTwitterPost(tweetId, socialAccount.access_token, socialAccount.refresh_token)
                            .then((response) => {
                                if (response.statusCode == 200) {
                                    var twitterMongoPostModelObject = new TwitterMongoPostModel();
                                    twitterMongoPostModelObject.updateLike(tweetId, false)
                                        .then(() => {
                                            resolve("Successfully disliked.");
                                        })
                                        .catch((error) => {
                                            throw new Error("Sorry! Something went wrong.");
                                        });
                                }
                                else
                                    throw new Error("Sorry! Something went wrong.");
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
            }
        });
    }

    twitterComment(userId, accountId, teamId, tweetId, comment) {
        return new Promise((resolve, reject) => {
            if (!accountId || !tweetId || !comment) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccount) => {
                        var twitterMongoPostModelObject = new TwitterMongoPostModel();
                        return twitterMongoPostModelObject.findTweet(tweetId)
                            .then((response) => {
                                if (response) {
                                    return this.twitterLikeComment.commentTwitterPost(tweetId, comment, socialAccount.access_token, socialAccount.refresh_token)
                                        .then((response) => {
                                            if (response.body) {
                                                var parsedBody = JSON.parse(response.body);
                                                return twitterMongoPostModelObject.addcomments(tweetId, comment, parsedBody.id_str, '')
                                                    .then(() => {
                                                        logger.info(parsedBody.id_str);
                                                        resolve({ "commentId": parsedBody.id_str });
                                                        // resolve(`Successfully commented and commented id is ${parsedBody.id_str}.`);
                                                    })
                                                    .catch((error) => {
                                                        throw new Error("Sorry! Something went wrong.");
                                                    });
                                            }
                                            else
                                                throw new Error("Invalid Inputs");
                                        })
                                        .catch((error) => {
                                            reject(error);
                                        });
                                }
                                else {
                                    throw new Error('No tweet found.');
                                }
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
            }
        });
    }

    twitterDeleteComment(userId, accountId, teamId, tweetId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !tweetId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.twitterLikeComment.deleteTwitterPostOrComment(tweetId, socialAccount.access_token, socialAccount.refresh_token)
                            .then((response) => {
                                if (response.body) {
                                    var twitterMongoPostModelObject = new TwitterMongoPostModel();
                                    twitterMongoPostModelObject.deletecomments(tweetId)
                                        .then((response) => {
                                            if (!response) throw new Error("Invalid commnetedTweetId");
                                            resolve("Successfully deleted the comment.");
                                        })
                                        .catch((error) => {
                                            throw new Error(error);
                                        });
                                }
                                else
                                    throw new Error("Sorry! Something went wrong.");

                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
            }
        });
    }


    youtubeLike(userId, accountId, teamId, videoId, rating) {
        return new Promise((resolve, reject) => {
            if (!accountId || !videoId || !rating) {
                reject(new Error("Invalid Inputs"));
            } else {
                var data = { videoId: videoId, rating: rating };
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.youtubeLikeComment.youtubeVideoLike(videoId, rating, socialAccount.refresh_token);
                    })
                    .then((response) => {
                        if (response.statusCode == 204) {
                            var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
                            return youtubeMongoPostModelObject.updateIsLike(data)
                                .then(() => {
                                    resolve(`Successfully ${rating}d.`);
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                        else
                        throw new Error(`Sorry, Already ${rating}d by the specified account.`);                        
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }


    youtubeComment(userId, accountId, teamId, videoId, comment) {
        return new Promise((resolve, reject) => {
            if (!accountId || !videoId || !comment) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.youtubeLikeComment.youtubeVideoComment(videoId, comment, socialAccount.refresh_token);
                    })
                    .then((response) => {
                        var parsedData = JSON.parse(response);
                        if (parsedData.id)
                            resolve(`Successfully commented and comment id is ${parsedData.id}`);
                        else
                            throw new Error("Sorry! Something went wrong.");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    youtubeReplyComment(userId, accountId, teamId, commentId, comment) {
        return new Promise((resolve, reject) => {
            if (!accountId || !commentId || !comment) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.youtubeLikeComment.youtubeCommentReply(commentId, comment, socialAccount.refresh_token);
                    })
                    .then((response) => {
                        var parsedData = JSON.parse(response);
                        if (parsedData.id)
                            resolve(`Successfully replied to a specified comment and comment id is ${parsedData.id}`);
                        else
                            throw new Error("Sorry! Something went wrong.");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    instabusinesscomment(userId, accountId, teamId, mediaId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId || !mediaId) {
                reject(new Error('Invalid Inputs'));
            } else {
                return this.getSocialAccount(12, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.facebookLikeComment.getInstaBusinessComments(socialAccount.access_token, mediaId);
                    })
                    .then((comments) => {
                        resolve(comments);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    instabusinesscommentreply(userId, accountId, teamId, commentId, comment) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                return this.getSocialAccount(12, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.facebookLikeComment.replyInstaBusinessComment(socialAccount.access_token, commentId, comment);
                    })
                    .then((comments) => {
                        resolve(comments);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

}


module.exports = LikeCommentLibs;