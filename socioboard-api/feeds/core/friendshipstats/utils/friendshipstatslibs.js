
const config = require('config');
const moment = require('moment');
const db = require('../../../../library/sequelize-cli/models/index');
const logger = require('../../../utils/logger');

const UserTeamAccount = require('../../../../library/mixins/userteamaccount');
const FacebookHelper = require('../../../../library/network/facebook');
const TwitterHelper = require('../../../../library/network/twitter');
const LinkedInHelper = require('../../../../library/network/linkedin');
const PinterestHelper = require('../../../../library/network/pinterest');
const GoogleHelper = require('../../../../library/network/google');
const InstagramHelper = require('../../../../library/network/instagram');

/* Table values...   
friendship_count
follower_count
following_count
page_count
group_count
board_count
subscription_count
total_like_count
total_post_count
bio_text
profile_picture
cover_picture
*/


class FriendshipLibs {

    constructor() {
        Object.assign(this, UserTeamAccount);
        this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
        this.twitterHelper = new TwitterHelper(config.get('twitter_api'));
        this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'), config.get('profile_add_redirect_url'));
        this.pinterestHelper = new PinterestHelper(config.get('pinterest'));
        this.googleHelper = new GoogleHelper(config.get('google_api'));
        this.instagramHelper = new InstagramHelper(config.get('instagram'));
    }

    getFbProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Facebook account or not
                return this.getSocialAccount(1, accountId, userId, teamId)
                    .then((account) => {
                        // If yes, fetching facebook profile stats
                        return this.facebookHelper.getFbProfileStats(account.access_token);
                    })
                    .then((result) => {
                        if (result) {
                            // Creating or updating the values in frinds stats table in DB
                            return this.createOrUpdateFriendsList(accountId, result)
                                .then(() => {
                                    resolve(result);
                                })
                                .catch((error) => { throw error; });
                        }
                        else throw new Error('No data found.');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

    }

    getFbPageStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Facebook Page account or not
                return this.getSocialAccount([2, 3], accountId, userId, teamId)
                    .then((account) => {
                        // If yes, fetching facebook page stats
                        return this.facebookHelper.getFbPageStats(account.access_token);
                    })
                    .then((updateDetail) => {
                        if (updateDetail) {
                            // Creating or updating the values in frinds stats table in DB
                            return this.createOrUpdateFriendsList(accountId, updateDetail)
                                .then(() => {
                                    resolve(updateDetail);
                                })
                                .catch((error) => { throw error; });
                        }
                        else throw new Error('No data found.');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

    }

    getLookUp(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var updateStats = {};
                // Checking whether user is having that Twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching twitter stats
                        return this.twitterHelper.getLookupList(socialAcc.access_token, socialAcc.refresh_token, socialAcc.user_name);
                    })
                    .then((response) => {
                        // Creating or updating the values in frinds stats table in DB
                        return this.createOrUpdateFriendsList(accountId, response)
                            .then(() => {
                                resolve(response);
                            })
                            .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getInstaProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Instagram account or not
                return this.getSocialAccount(5, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching Instagram profile stats
                        return this.instagramHelper.getInstagramProfileInformation(socialAcc.access_token);
                    })
                    .then((response) => {
                        var parsedData = JSON.parse(response.Info);
                        var updateDetails = {
                            friendship_count: response.FriendCount,
                            follower_count: parsedData.followed_by,
                            following_count: parsedData.follows,
                            total_post_count: parsedData.media,
                            profile_picture: response.ProfilePicture,
                        };
                        // Creating or updating the values in frinds stats table in DB
                        return this.createOrUpdateFriendsList(accountId, updateDetails)
                            .then(() => {
                                resolve(response);
                            })
                            .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getLinkedInProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Linkedin profile account or not
                return this.getSocialAccount(6, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching linkedin profile stats
                        return this.linkedInHelper.getProfileDetails(socialAcc.access_token);
                    })
                    .then((response) => {
                        logger.info(`response, ${response}`);
                        // var updateDetail = {
                        //     friendship_count: response[0].friends_count,
                        //     follower_count: response[0].followers_count,
                        //     following_count: response[0].friends_count,
                        //     total_like_count: response[0].favourites_count,
                        //     total_post_count: response[0].statuses_count,
                        //     profile_picture: response[0].profile_image_url_https,
                        //     bio_text: response[0].status.text
                        // };
                        // return this.createOrUpdateFriendsList(accountId, updateDetail)
                        //     .then(() => {
                        resolve(response);
                        //     })
                        //     .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getYoutubeProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Youtube account or not
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching youtube stats
                        return this.googleHelper.getYtbChannelDetails(socialAcc.user_name, socialAcc.refresh_token);
                    })
                    .then((response) => {
                        // Creating or updating the values in frinds stats table in DB
                        return this.createOrUpdateFriendsList(accountId, response)
                            .then(() => {
                                resolve(response);
                            })
                            .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getPinterestProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Pinterest account or not
                return this.getSocialAccount(11, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching pinterest stats
                        return this.pinterestHelper.userDetails(socialAcc.user_name, socialAcc.access_token);
                    })
                    .then((response) => {
                        // Creating or updating the values in frinds stats table in DB
                        return this.createOrUpdateFriendsList(accountId, response)
                            .then(() => {
                                resolve(response);
                            })
                            .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    // done. need to check data with valid access token
    getInstaBusinessProfileStats(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that Instagram Business account or not
                return this.getSocialAccount(12, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching instagram business stats
                        return this.facebookHelper.getInstaBusinessStats(socialAcc.access_token);
                    })
                    .then((response) => {
                        // Creating or updating the values in frinds stats table in DB
                        return this.createOrUpdateFriendsList(accountId, response)
                            .then(() => {
                                resolve(response);
                            })
                            .catch((error) => { throw error; });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

}

module.exports = FriendshipLibs;
