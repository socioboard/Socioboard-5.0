const db = require('../../../../library/sequelize-cli/models/index');
const socialAccounts = db.social_accounts;
const teamSocialAccount = db.join_table_teams_social_accounts;
const config = require('config');

const TwitterHelper = require('../../../../library/network/twitter');
const TwitterInsightMongoModel = require('../../../../library/mongoose/models/twitterInsights');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

const teamInfo = db.team_informations;

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
                            // Checking that whether that account is locked or not
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
                                        // Fetching twitter stats
                                        return this.twitterHelper.getLookupList(twtAccount.access_token, twtAccount.refresh_token, twtAccount.user_name)
                                            .then((updatedProfileDetails) => {
                                                updatedTwitterStats = updatedProfileDetails;
                                                // Updating or creating the status of fetching stats in DB
                                                return this.createOrUpdateFriendsList(accountId, updatedProfileDetails);
                                            })
                                            .then(() => {
                                                // Formating the response
                                                var insightObject = {
                                                    followerCount: updatedTwitterStats.follower_count,
                                                    followingCount: updatedTwitterStats.following_count,
                                                    favouritesCount: updatedTwitterStats.favorite_count,
                                                    postsCount: updatedTwitterStats.total_post_count,
                                                    userMentions: updatedTwitterStats.user_mentions,
                                                    retweetCount: updatedTwitterStats.retweet_count
                                                };
                                                var twtMongomodelObject = new TwitterInsightMongoModel();
                                                // Adding it to the Mongo DB
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
                                    throw error
                                });
                        }))
                            .then(() => {
                                resolve("success");
                            })
                            .catch((error) => {
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

    updateTeamReport() {
        return new Promise((resolve, reject) => {
            return teamInfo.findAll({ raw: true })
                .then((teamsDetails) => {
                    // Update reports for each team
                    return Promise.all(teamsDetails.map(teamInfo => {
                        return this.createOrUpdateTeamReport(teamInfo.team_id, true);
                    }));
                })
                .then(() => {
                    resolve('successfully updated insights of all teams');
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }
}

module.exports = InsightLibs;