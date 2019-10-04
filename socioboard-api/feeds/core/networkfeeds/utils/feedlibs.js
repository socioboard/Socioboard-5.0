const config = require('config');
const moment = require('moment');
const db = require('../../../../library/sequelize-cli/models/index');
const logger = require('../../../utils/logger');

const FacebookHelper = require('../../../../library/network/facebook');
const TwitterHelper = require('../../../../library/network/twitter');
const LinkedInHelper = require('../../../../library/network/linkedin');
const PinterestHelper = require('../../../../library/network/pinterest');
const GoogleHelper = require('../../../../library/network/google');
const InstagramHelper = require('../../../../library/network/instagram');

const FacebookMongoPostModel = require('../../../../library/mongoose/models/facebookposts');
const TwitterMongoPostModel = require('../../../../library/mongoose/models/twitterposts');
const YoutubeMongoPostModel = require('../../../../library/mongoose/models/youtubepost');
const InstagramMongoPostModel = require("../../../../library/mongoose/models/instagramposts");
const InstagramBusinessMongoPostModel = require("../../../../library/mongoose/models/instagrambusinessposts");
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

const Operator = db.Sequelize.Op;
const pinterestBoards = db.pinterest_boards;
const accountUpdateTable = db.social_account_feeds_updates;

class FeedsLibs {

    constructor() {

        Object.assign(this, UserTeamAccount);
        this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
        this.twitterHelper = new TwitterHelper(config.get('twitter_api'));
        this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'), config.get('profile_add_redirect_url'));
        this.pinterestHelper = new PinterestHelper(config.get('pinterest'));
        this.googleHelper = new GoogleHelper(config.get('google_api'));
        this.instagramHelper = new InstagramHelper(config.get('instagram'));
    }

    getFacebookFeeds(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            } else {
                // Checking whether user is having that facebook account or not
                return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
                    .then((socialAccountDetails) => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var facebookMongoPostModelObject = new FacebookMongoPostModel();
                        // Fetching the facebook feeds from Mongo DB
                        return facebookMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
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


    getRecentFbFeeds(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            } else {
                return this.isNeedToFetchRecentPost(accountId, config.get('facebook_api.update_time_frequency_value'), config.get('facebook_api.update_time_frequency_factor'))
                    .then((isRunRecentPost) => {
                        if (isRunRecentPost) {
                            var socialAccountInfo = {};
                            var feeds = [];
                            // Checking whether user is having that facebook account or not
                            return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
                                .then((socialAccountDetails) => {
                                    socialAccountInfo = socialAccountDetails;
                                    return accountUpdateTable.findOne({
                                        where: { account_id: accountId },
                                        attributes: ['updated_date'],
                                        raw: true
                                    })
                                        .then((updatedAccountData) => {
                                            if (updatedAccountData && updatedAccountData.updated_date)
                                                // Fetching recent facebook feeds
                                                return this.facebookHelper.getRecentFacebookFeeds(socialAccountInfo.access_token, socialAccountInfo.social_id, updatedAccountData.updated_date, config.get('facebook_api.app_id'), config.get('facebook_api.version'));
                                            else
                                                // Fetching feeds from DB (existed feeds)
                                                return this.facebookHelper.getFacebookPosts(socialAccountInfo.access_token, socialAccountInfo.social_id, config.get('facebook_api.app_id'), config.get('facebook_api.version'));
                                        });
                                })
                                .then((postDetails) => {
                                    if (postDetails && postDetails.feeds && postDetails.feeds.length > 0) {
                                        feeds = postDetails.feeds;
                                        var facebookMongoPostModelObject = new FacebookMongoPostModel();
                                        // Updating the feeds in Mongo DB
                                        return facebookMongoPostModelObject.insertManyPosts(postDetails.feeds);
                                    } else
                                        return [];
                                })
                                .then(() => {
                                    // Creating or updating the recent feeds table with new fetched time
                                    return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id)
                                        .then(() => { return feeds; })
                                        .catch((error) => { throw error; });
                                })
                                .catch((error) => { throw error; });
                        }
                    })
                    .then(() => {
                        // Fetching the existing feeds from DB
                        return this.getFacebookFeeds(userId, accountId, teamId, pageId);
                    })
                    .then((feeds) => resolve(feeds))
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }


    getTweets(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            } else {
                // Checking whether user is having that twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccountDetails) => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var twitterMongoPostModelObject = new TwitterMongoPostModel();
                        // Fetching the twitter feeds from Mongo DB
                        return twitterMongoPostModelObject.getSocialAccountPosts(socialAccountDetails.social_id, offset, config.get('perPageLimit'));
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


    getRecentTweets(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            } else {
                return this.isNeedToFetchRecentPost(accountId, config.get('twitter_api.update_time_frequency_value'), config.get('twitter_api.update_time_frequency_factor'))
                    .then((isRunRecentPost) => {
                        if (isRunRecentPost) {
                            var socialAccountInfo = {};
                            var tweets = [];
                            // Checking whether user is having that twitter account or not
                            return this.getSocialAccount(4, accountId, userId, teamId)
                                .then((socialAccountDetails) => {
                                    socialAccountInfo = socialAccountDetails;
                                    var twitterMongoPostModel = new TwitterMongoPostModel();
                                    // Fetching recent Tweet from DB
                                    return twitterMongoPostModel.findLastRecentTweetId()
                                        .then((recentTweetId) => {
                                            // Fetching tweets from recent DB tweet to now from twitter
                                            return this.twitterHelper.getTimeLineTweets(socialAccountInfo.access_token, socialAccountInfo.refresh_token, socialAccountInfo.user_name, recentTweetId);
                                        })
                                        .then((timelineTweets) => {
                                            // Formating the fetched tweet response
                                            return this.twitterHelper.parseTweetDetails(timelineTweets, socialAccountInfo.social_id, config.get('twitter_api.app_name'), config.get('twitter_api.version'));
                                        })
                                        .then((postDetails) => {
                                            tweets = postDetails.tweets;
                                            var twitterMongoPostModelObject = new TwitterMongoPostModel();
                                            // Updating the Twitter post model with new tweets
                                            return twitterMongoPostModelObject.insertManyPosts(postDetails.tweets);
                                        })
                                        .then(() => {
                                            // Creating or updating the recent feeds table with new fetched time
                                            return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id);
                                        })
                                        .then(() => { return tweets; })
                                        .catch((error) => { throw error; });
                                });
                        } else {
                            return this.getTweets(userId, accountId, teamId, pageId);
                        }
                    })
                    .then((feeds) => resolve(feeds))
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    getHomeTimeLineTweets(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var socialAccountInfo = {};
                // Checking whether user is having that twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccountDetails) => {
                        socialAccountInfo = socialAccountDetails;
                        // Fetching the home tweets of twitter
                        return this.twitterHelper.getTimeLineTweets(socialAccountDetails.access_token, socialAccountDetails.refresh_token, socialAccountDetails.user_name);
                    })
                    .then((timelineTweets) => {
                        // Formating the fetched tweet response
                        return this.twitterHelper.parseTweetDetails(timelineTweets, socialAccountInfo.social_id, config.get('twitter_api.app_name'), config.get('twitter_api.version'));
                    })
                    .then((tweets) => {
                        resolve(tweets);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getTweetsByKeyword(userId, accountId, teamId, keyword) {
        return new Promise((resolve, reject) => {
            if (!accountId || !keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                var socialAccountInfo = {};
                // Checking whether user is having that twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccountDetails) => {
                        socialAccountInfo = socialAccountDetails;
                        // Fetching tweets by keyword from twitter
                        return this.twitterHelper.getTweetsByKeyword(socialAccountDetails.access_token, socialAccountDetails.refresh_token, keyword);
                    })
                    .then((timelineTweets) => {
                        // Formating the fetched tweet response
                        resolve(this.twitterHelper.parseTweetDetails(timelineTweets.statuses, socialAccountInfo.social_id, config.get('twitter_api.app_name'), config.get('twitter_api.version')));
                    })
                    .then((tweets) => {
                        resolve(tweets);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getMentionTimeLineTweets(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var socialAccountInfo = {};
                // Checking whether user is having that twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAccountDetails) => {
                        socialAccountInfo = socialAccountDetails;
                        // Fetching user mentioned (tagged) tweets from twitter
                        return this.twitterHelper.getMentionTimeLineTweets(socialAccountDetails.access_token, socialAccountDetails.refresh_token);
                    })
                    .then((timelineTweets) => {
                        // Formating the fetched twitter response
                        return this.twitterHelper.parseTweetDetails(timelineTweets, socialAccountInfo.social_id, config.get('twitter_api.app_name'), config.get('twitter_api.version'));
                    })
                    .then((tweets) => {
                        resolve(tweets);
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    getCompanyUpdates(userId, accountId, teamId) {
        //Todo : need to check user has permission to fetch feed info the accountId
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var feeds = [];
                // Checking whether user is having that Linkedin in company account or not
                return this.getSocialAccount(7, accountId, userId, teamId)
                    .then((socialAccount) => {
                        return this.linkedInHelper.getCompanyUpdates(socialAccount.social_id, socialAccount.access_token);
                    })
                    .then((feedDetails) => {
                        logger.info(`feedDetails, ${feedDetails}`);
                        if (feedDetails && feedDetails.values) {
                            feedDetails.values.forEach(feed => {
                                var isApplicationPost = feed.updateContent.companyStatusUpdate.share.source.application ?
                                    feed.updateContent.companyStatusUpdate.share.source.application.name == config.get('linkedIn_api.app_name') ? true : false : false;

                                var feedObject = {
                                    publishedDate: moment(feed.timestamp).utc(),
                                    likeCount: feed.numLikes,
                                    commentCount: feed.updateComments._total,
                                    description: feed.updateContent.companyStatusUpdate.share.comment,
                                    postId: feed.updateContent.companyStatusUpdate.share.id,
                                    accountId: feed.updateContent.company.id,
                                    accountName: feed.updateContent.company.name,
                                    isApplicationPost: isApplicationPost,
                                    mediaUrl: feed.updateContent.companyStatusUpdate.share.content ?
                                        feed.updateContent.companyStatusUpdate.share.content.submittedImageUrl
                                        : ""
                                };
                                feeds.push(feedObject);
                            });
                            resolve(feeds);
                        }
                        else throw new Error("Cant able to fetch company profile feeds");
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getPinterestPins(userId, accountId, teamId, boardId) {
        var FetchedSocialAccount = '';
        return new Promise((resolve, reject) => {
            if (!accountId || !boardId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking whether user is having that pinterest account or not
                return this.getSocialAccount(11, accountId, userId, teamId)
                    .then((socialAccount) => {
                        FetchedSocialAccount = socialAccount;
                        return pinterestBoards.findOne({
                            where: {
                                [Operator.and]: [{
                                    social_account_id: accountId
                                }, {
                                    board_id: boardId
                                }]
                            }
                        });
                    })
                    .then((boardInfo) => {
                        if (boardInfo == null)
                            throw new Error("No board found with requested account.");
                        var boardName = String(boardInfo.board_url).replace('https://www.pinterest.com/', '');
                        // Fetching pinterst pins of that Board
                        return this.pinterestHelper.getBoardPins(FetchedSocialAccount.access_token, boardName);
                    })
                    .then((pinsDetails) => {
                        resolve(pinsDetails);
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getInstaFeedsFromDB(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !pageId || pageId == 0 || pageId == null) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user is having that instagram account or not
                return this.getSocialAccount(5, accountId, userId, teamId)
                    .then((socialAccount) => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var InstagramMongoPostModelObject = new InstagramMongoPostModel();
                        // Fetching instagram feeds from DB 
                        return InstagramMongoPostModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
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



    getInstaBusinessFeedsFromDB(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !Boolean(pageId)) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user is having that instagram business account or not
                return this.getSocialAccount(12, accountId, userId, teamId)
                    .then((socialAccount) => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var InstagramBusinessMongoPostModelObject = new InstagramBusinessMongoPostModel();
                        // Fetching instagram business feeds from DB
                        return InstagramBusinessMongoPostModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
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

    getRecentInstagramFeeds(userId, accountId, teamId, pageId) {

        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            }
            else {
                var feeds = [];
                return this.isNeedToFetchRecentPost(accountId, config.get('instagram.update_time_frequency_value'), config.get('instagram.update_time_frequency_factor'))
                    .then((isRunRecentPost) => {
                        if (isRunRecentPost) {
                            var socialAccountInfo = {};
                            // Checking whether user is having that instagram account or not
                            return this.getSocialAccount(5, accountId, userId, teamId)
                                .then((socialAccount) => {
                                    socialAccountInfo = socialAccount;
                                    return accountUpdateTable.findOne({
                                        where: { account_id: accountId },
                                        attributes: ['updated_date'],
                                        raw: true
                                    })
                                        .then((updatedAccountData) => {
                                            if (updatedAccountData && updatedAccountData.updated_date) {
                                                var instagramMongoPostModel = new InstagramMongoPostModel();
                                                // Finding the last feed Id
                                                return instagramMongoPostModel.findLastRecentInstaId()
                                                    .then((recentInstaId) => {
                                                        // Fetching feeds from that last feed Id to till now from instagram
                                                        return this.instagramHelper.getInstagramFeeds(socialAccount.access_token, socialAccount.social_id, recentInstaId);
                                                    })
                                                    .then((feedDetails) => {
                                                        if (!feedDetails) {
                                                            throw new Error("Cant able to fetch the feeds!");
                                                        }
                                                        else {
                                                            feeds.push(feedDetails);
                                                            var instagramMongoPostModelObject = new InstagramMongoPostModel();
                                                            // Updating the new instagram feeds in DB
                                                            return instagramMongoPostModelObject.insertManyPosts(feedDetails)
                                                                .then(() => {
                                                                    // Creating or updating the recent feeds table with new fetched time
                                                                    return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id);
                                                                })
                                                                .catch((error) => { throw error; });
                                                        }
                                                    });
                                            }
                                            else {
                                                // Fetching the existing feeds from DB
                                                return this.instagramHelper.getInstagramFeeds(socialAccount.access_token, socialAccount.social_id, '')
                                                    .then((feedDetails) => {
                                                        if (!feedDetails) {
                                                            throw new Error("Cant able to fetch the feeds!");
                                                        }
                                                        else {
                                                            feeds.push(feedDetails);
                                                            var instagramMongoPostModelObject = new InstagramMongoPostModel();
                                                            return instagramMongoPostModelObject.insertManyPosts(feedDetails)
                                                                .then(() => {
                                                                    // Creating or updating the recent feeds table with new fetched time
                                                                    return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id);
                                                                })
                                                                .catch((error) => { throw error; });
                                                        }
                                                    });
                                            }
                                        });
                                });
                        }
                        else {
                            // Fetching instagram feeds from DB
                            return this.getInstaFeedsFromDB(userId, accountId, teamId, pageId)
                                .then((response) => { feeds.push(response); })
                                .catch((error) => { throw error; });
                        }
                    })
                    .then(() => {
                        resolve(feeds);
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }


    getRecentInstagramFeedswithDB(userId, accountId, teamId, pageId) {

        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            }
            else {
                return this.isNeedToFetchRecentPost(accountId, config.get('instagram.update_time_frequency_value'), config.get('instagram.update_time_frequency_factor'))
                    .then((isRunRecentPost) => {
                        if (isRunRecentPost) {
                            var socialAccountInfo = {};
                            var feeds = [];
                            // Checking whether user is having that instagram account or not
                            return this.getSocialAccount(5, accountId, userId, teamId)
                                .then((socialAccount) => {
                                    socialAccountInfo = socialAccount;
                                    return accountUpdateTable.findOne({
                                        where: { account_id: accountId },
                                        attributes: ['updated_date'],
                                        raw: true
                                    })
                                        .then((updatedAccountData) => {
                                            if (updatedAccountData && updatedAccountData.updated_date) {
                                                var instagramMongoPostModel = new InstagramMongoPostModel();
                                                return instagramMongoPostModel.findLastRecentInstaId()
                                                    .then((recentInstaId) => {
                                                        return this.instagramHelper.getInstagramFeeds(socialAccount.access_token, socialAccount.social_id, recentInstaId);
                                                    })
                                                    .then((feedDetails) => {
                                                        if (!feedDetails) {
                                                            throw new Error("Cant able to fetch the feeds!");
                                                        }
                                                        else {
                                                            feeds.push(feedDetails);
                                                            var instagramMongoPostModelObject = new InstagramMongoPostModel();
                                                            return instagramMongoPostModelObject.insertManyPosts(feedDetails)
                                                                .then(() => {
                                                                    // Creating or updating the recent feeds table with new fetched time
                                                                    return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id)
                                                                        .then(() => { return feeds; })
                                                                        .catch((error) => { throw error; });
                                                                })
                                                                .catch((error) => { throw error; });
                                                        }
                                                    });
                                            }
                                            else {
                                                return this.instagramHelper.getInstagramFeeds(socialAccount.access_token, socialAccount.social_id, '')
                                                    .then((feedDetails) => {
                                                        if (!feedDetails) {
                                                            throw new Error("Cant able to fetch the feeds!");
                                                        }
                                                        else {
                                                            feeds.push(feedDetails);
                                                            var instagramMongoPostModelObject = new InstagramMongoPostModel();
                                                            return instagramMongoPostModelObject.insertManyPosts(feedDetails)
                                                                .then(() => {
                                                                    // Creating or updating the recent feeds table with new fetched time
                                                                    return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id)
                                                                        .then(() => { return feeds; })
                                                                        .catch((error) => { throw error; });
                                                                })
                                                                .catch((error) => { throw error; });
                                                        }
                                                    });
                                            }
                                        });
                                });
                        }
                        else {
                            // Fetching instagram feeds from DB
                            return this.getInstaFeedsFromDB(userId, accountId, teamId, pageId);
                        }
                    }).then((feeds) => {
                        resolve(feeds);
                    }).catch((error) => {
                        reject(error);
                    });

            }
        });
    }

    getInstagramBusinessFeeds(accountId, userId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !Boolean(pageId)) {
                reject(new Error('Invalid Inputs'));
            } else {
                var businessFeeds = [];
                var socialAccountInfo = {};
                return accountUpdateTable.findOne({
                    where: { account_id: accountId }
                })
                    .then((result) => {
                        var diff = null;
                        if (result && result.updated_date) {
                            diff = moment.tz(new Date(), "GMT").diff(moment.tz(result.updated_date, 'GMT'), config.get('instagram.update_time_frequency_factor'));
                        }

                        if (!result || diff > config.get('instagram.update_time_frequency_value')) {
                            // Checking whether user is having that instagram business account or not
                            return this.getSocialAccount(12, accountId, userId, teamId)
                                .then((socialAccount) => {
                                    socialAccountInfo = socialAccount;
                                    if (socialAccount == null)
                                        throw new Error("No profile found or account isn't instagram business profile.");
                                    else
                                        return this.facebookHelper.getMediasFromInstagram(socialAccount.access_token, socialAccount.social_id);
                                })
                                .then((response) => {
                                    businessFeeds = response;
                                    var instagramMongoPostModelObject = new InstagramBusinessMongoPostModel();
                                    return instagramMongoPostModelObject.insertManyPosts(response.feeds)
                                        .then(() => {
                                            // Creating or updating the recent feeds table with new fetched time
                                            return this.createOrEditLastUpdateTime(accountId, socialAccountInfo.social_id);
                                        })
                                        .catch((error) => { throw error; });
                                })
                                .catch((error) => { throw error; });
                        }
                        else {
                            return this.getInstaBusinessFeedsFromDB(userId, accountId, teamId, pageId)
                                .then((InstaBusinessFeeds) => {
                                    businessFeeds = InstaBusinessFeeds;
                                })
                                .catch((error) => { throw error; });
                        }
                    }).then(() => {
                        resolve(businessFeeds.feeds ? businessFeeds.feeds : businessFeeds);
                    }).catch((error) => {
                        reject(error);
                    });

            }
        });
    }

    getYoutubeFeeds(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!Boolean(pageId)) {
                reject(new Error("Please validate the page id!"));
            } else {
                // Checking whether user is having that youtube account or not
                return this.getSocialAccount(9, accountId, userId, teamId)
                    .then((socialAccount) => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
                        return youtubeMongoPostModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
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
}


module.exports = FeedsLibs;