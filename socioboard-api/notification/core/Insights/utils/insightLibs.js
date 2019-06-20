const db = require('../../../../library/sequelize-cli/models/index');
const socialAccounts = db.social_accounts;
const teamSocialAccount = db.join_table_teams_social_accounts;
const logger = require('../../../utils/logger');
const config = require('config');

const TwitterHelper = require('../../../../library/network/twitter');
const TwitterInsightMongoModel = require('../../../../library/mongoose/models/twitterInsights');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');


class InsightLibs {
    constructor() {
        Object.assign(this, UserTeamAccount);
        this.twitterHelper = new TwitterHelper(config.get('twitter_api'));
    }

    twtInsights() {
        return new Promise((resolve, reject) => {
            var twtAccount = null;
            return socialAccounts.findAll({
                where: { account_type: 4 }
            })
                .then((result) => {
                    if (result.length > 0) {
                        return Promise.all(result.map(socialAccount => {
                            twtAccount = socialAccount;
                            return teamSocialAccount.findOne({
                                where: {
                                    account_id: socialAccount.account_id,
                                    is_account_locked: 0
                                }
                            })
                                .then((runnigAccount) => {
                                    if (runnigAccount) {
                                        var accountId = runnigAccount.dataValues.account_id;
                                        var updatedTwitterStats = {};
                                        return this.twitterHelper.getLookupList(twtAccount.access_token, twtAccount.refresh_token, twtAccount.user_name)
                                            .then((updatedProfileDetails) => {
                                                updatedTwitterStats = updatedProfileDetails;
                                                return this.createOrUpdateFriendsList(accountId, updatedProfileDetails);
                                            })
                                            .then(() => {
                                                var insightObject = {
                                                    followerCount: updatedTwitterStats.follower_count,
                                                    followingCount: updatedTwitterStats.following_count,
                                                    favouritesCount: updatedTwitterStats.favorite_count,
                                                    postsCount: updatedTwitterStats.total_post_count,
                                                    userMentions: updatedTwitterStats.user_mentions,
                                                    retweetCount: updatedTwitterStats.retweet_count
                                                };
                                                var twtMongomodelObject = new TwitterInsightMongoModel();
                                                return twtMongomodelObject.addInsights(accountId, insightObject);
                                            })                                         
                                            .catch((error) => {
                                                throw error;
                                            });
                                    }
                                    else
                                        throw new Error('No running accounts found.');
                                })
                                .catch((error) => {
                                    logger.error(error.message);
                                });
                        }))
                            .then(() => {
                                resolve("success");
                            })
                            .catch((error)=>{
                                throw error;
                            });
                    }
                    else
                        throw new Error('No twitter accounts found.');
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }


    
}

module.exports = InsightLibs;