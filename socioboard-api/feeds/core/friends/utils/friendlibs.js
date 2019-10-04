const config = require('config');
const TwitterConnect = require('../../../../library/network/twitter');

const db = require('../../../../library/sequelize-cli/models/index');
const Operator = db.Sequelize.Op;
const socialAccount = db.social_accounts;

const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

class FriendLibs {

    constructor() {

        Object.assign(this, UserTeamAccount);
        this.twitterConnect = new TwitterConnect(config.get('twitter_api'));
    }

    getTwitterFollowers(userId, accountId, teamId, cursorValue) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user is having that Twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching the follower list to that account
                        return this.twitterConnect.getFollowersList(socialAcc.access_token, socialAcc.refresh_token, cursorValue);
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

    getTwitterFollowing(userId, accountId, teamId, cursorValue) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user is having that Twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching the following list to that account
                        return this.twitterConnect.getFollowingsList(socialAcc.access_token, socialAcc.refresh_token, cursorValue);
                    })
                    .then((response) => resolve(response))
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getTwitterSearchUser(userId, accountId, teamId, keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !keyword || pageId == null || pageId == undefined || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user is having that Twitter account or not
                return this.getSocialAccount(4, accountId, userId, teamId)
                    .then((socialAcc) => {
                        // If yes, fetching the searched users from twitter
                        return this.twitterConnect.searchUser(keyword, pageId, socialAcc.access_token, socialAcc.refresh_token);
                    })
                    .then((response) => resolve(response))
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = FriendLibs;