const config = require('config');
const db = require('../../../../library/sequelize-cli/models/index');
const logger = require('../../../utils/logger');
const PublishedPost = require('../../../../library/mongoose/models/publishedposts');
const TwitterMongoMessageModel = require('../../../../library/mongoose/models/twittermessages');
const CoreServices = require('../../../../library/utility/coreServices');
const UserTeamAccountLibs = require('../../../../library/library/useraccounteamlibs');

const socialAccount = db.social_accounts;
const scheduleDetails = db.users_schedule_details;
const Operator = db.Sequelize.Op;

class ReportLibs {

    constructor() {
        this.coreServices = new CoreServices();
        this.userTeamAccountLibs = new UserTeamAccountLibs();
    }

    getTodayPostedCount(userId, teamId, accountId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !userId || !teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating the user is belongs to that Team or not
                return this.userTeamAccountLibs.isTeamAccountValidForUser(userId, teamId, accountId)
                    .then(() => {
                        var publishedPostObject = new PublishedPost();
                        // Fetching the Today posted post count of a particular account
                        return publishedPostObject.getTodayPostsCount(accountId);
                    })
                    .then((postCount) => {
                        resolve(postCount);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getXDayPublishCount(userId, dayCount) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var reportDetails = [];
                // Checking the user that does the user have any social accounts or not
                return socialAccount.findAll({
                    where: {
                        account_admin_id: userId,
                        account_type: [2, 4, 6, 7, 11]
                    }
                })
                    .then((socialAcc) => {
                        if (!socialAcc)
                            throw new Error("Sorry, You dont have any social profiles to fetch reports");
                        else {

                            logger.info(`Total account count : ${socialAcc.length}`);

                            // Fetching X day post count for each account
                            return Promise.all(socialAcc.map(account => {
                                var publishedPostObject = new PublishedPost();
                                return publishedPostObject.getXdaysPostsCount(account.account_id, dayCount)
                                    .then((count) => {
                                        var accountDetails = {
                                            accountId: account.account_id,
                                            accountType: account.account_type,
                                            firstName: account.first_name,
                                            lastName: account.last_name,
                                            network: this.coreServices.getNetworkName(account.account_type),
                                            publishedCount: count
                                        };
                                        reportDetails.push(accountDetails);
                                    });
                            }));
                        }
                    })
                    .then(() => {
                        resolve(reportDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getAccountwisePublishCount(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var reportDetails = [];
                // Checking the user that does the user have any social accounts or not
                return socialAccount.findAll({
                    where: {
                        account_admin_id: userId,
                        account_type: [2, 4, 6, 7, 11]
                    }
                })
                    .then((socialAcc) => {
                        if (!socialAcc)
                            throw new Error("Sorry, You dont have any social profiles to fetch reports");
                        else {

                            logger.info(`Total account count : ${socialAcc.length}`);

                            return Promise.all(socialAcc.map(account => {
                                var publishedPostObject = new PublishedPost();
                                // Fetching post count for each account
                                return publishedPostObject.getAccountPublishCount(account.account_id)
                                    .then((count) => {
                                        var accountDetails = {
                                            accountId: account.account_id,
                                            accountType: account.account_type,
                                            firstName: account.first_name,
                                            lastName: account.last_name,
                                            network: this.coreServices.getNetworkName(account.account_type),
                                            publishedCount: count
                                        };
                                        reportDetails.push(accountDetails);
                                    });
                            }));
                        }
                    })
                    .then(() => {
                        resolve(reportDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }

        });


    }

    getSchedulePublishedReport(scheduleId, userId, pageId) {
        return new Promise((resolve, reject) => {
            if (!scheduleId || !userId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching the schedule details of a schedule Id
                return scheduleDetails.findOne({ where: { schedule_id: scheduleId, user_id: userId } })
                    .then((result) => {
                        if (!result) {
                            throw new Error("Sorry, Cant able to get schedule report due following reason. 1.Invalid user Id, 2.Invalid schedule Id");
                        } else {
                            var publishedPostObject = new PublishedPost();
                            return publishedPostObject.getSchedulePublishedReport(result.mongo_schedule_id, ((pageId - 1) * config.get('perPageLimit')), config.get('perPageLimit'))
                                .then((publishedDetails) => {
                                    resolve(publishedDetails);
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getAccountPublishedReport(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !teamId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking the user that the user is belongs to the Team or not
                return this.userTeamAccountLibs.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        // Checking that the account is belongs to that Team or not
                        return this.userTeamAccountLibs.isAccountValidForTeam(teamId, accountId);
                    })
                    .then(() => {
                        var publishedPostObject = new PublishedPost();
                        // Fetching the posts published in that particular account
                        return publishedPostObject.getAccountPublishedReport(accountId, teamId, ((pageId - 1) * config.get('perPageLimit')), config.get('perPageLimit'));
                    })
                    .then((publishedDetails) => {
                        resolve(publishedDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getTwitterMessage(userId, accountId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !userId || !teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking the user that the user is belongs to the Team or not and account is belongs to that Team or not
                return this.isTeamAccountValidForUser(userId, teamId, accountId)
                    .then(() => {
                        // Checking that the account is belongs to Twitter or not
                        return socialAccount.findOne({
                            where: {
                                [Operator.and]: [{
                                    account_type: 4
                                }, {
                                    account_id: accountId
                                }]
                            },
                            attributes: ['account_id', 'social_id']
                        });
                    })
                    .then((socialAccount) => {
                        if (socialAccount == null)
                            throw new Error("No profile found or account isn't twitter profile.");
                        else {
                            var offset = (pageId - 1) * config.get('perPageLimit');
                            var twitterMongoMessageModelObject = new TwitterMongoMessageModel();
                            return twitterMongoMessageModelObject.getSocialAccountPosts(socialAccount.social_id, offset, config.get('perPageLimit'));
                        }
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

    getMessageBetweenTwoUsers(accountId, receiverId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !receiverId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that the account is belongs to Twitter or not
                return socialAccount.findOne({
                    where: {
                        [Operator.and]: [{
                            account_type: 4
                        }, {
                            account_id: accountId
                        }]
                    },
                    attributes: ['account_id', 'social_id']
                })
                    .then((socialAccount) => {
                        if (socialAccount == null)
                            throw new Error("No profile found or account isn't twitter profile.");
                        else {
                            var offset = (pageId - 1) * config.get('perPageLimit');
                            var twitterMongoMessageModelObject = new TwitterMongoMessageModel();
                            return twitterMongoMessageModelObject.getMessageBetweenTwoUsers(socialAccount.social_id, receiverId, offset, config.get('perPageLimit'));
                        }
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

    getPreviouslyMessagedUsers(accountId, pageId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that the account is belongs to Twitter or not
                return socialAccount.findOne({
                    where: {
                        [Operator.and]: [{
                            account_type: 4
                        }, {
                            account_id: accountId
                        }]
                    },
                    attributes: ['account_id', 'social_id', 'user_name']
                })
                    .then((socialAccount) => {
                        if (socialAccount == null)
                            throw new Error("No profile found or account isn't twitter profile.");
                        else {
                            var offset = (pageId - 1) * config.get('perPageLimit');
                            var twitterMongoMessageModelObject = new TwitterMongoMessageModel();
                            // Fetching previously messaged users of that account
                            return twitterMongoMessageModelObject.getPreviouslyMessagedUsers(socialAccount.social_id, socialAccount.user_name, offset, config.get('perPageLimit'));
                        }
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




module.exports = ReportLibs;