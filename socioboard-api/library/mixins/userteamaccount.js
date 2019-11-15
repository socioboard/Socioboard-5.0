const db = require('../sequelize-cli/models/index');
const CoreServices = require('../utility/coreServices');
const TeamInsightsMongoModel = require('../mongoose/models/teamInsights');
const PublishedPostsMongoModel = require('../mongoose/models/publishedposts');
const moment = require('moment');
const lodash = require('lodash');

const socialAccount = db.social_accounts;
const userDetails = db.user_details;
const userActivation = db.user_activations;
const userTeamJoinTable = db.join_table_users_teams;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const accountFeedsUpdateTable = db.social_account_feeds_updates;
const Operator = db.Sequelize.Op;
const teamInfo = db.team_informations;
const updateFriendsTable = db.social_account_friends_counts;

const coreServices = new CoreServices();
const UserTeamAccount = {

    isTeamValidForUser(userId, teamId) {
        return new Promise((resolve, reject) => {
            // Checking whether that user is belongs to that Team or not
            return userTeamJoinTable.findOne({
                where: {
                    user_id: userId,
                    team_id: teamId,
                    left_from_team: false
                },
                attributes: ['id', 'user_id']
            })
                .then((result) => {
                    if (result) resolve();
                    else throw new Error("User not belongs to the team!");
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    isAccountValidForTeam(teamId, accountId) {
        return new Promise((resolve, reject) => {
            // Checking whether that account is belongs to that Team or not
            return teamSocialAccountJoinTable.findOne({
                where: {
                    account_id: accountId,
                    team_id: teamId,
                    is_account_locked: 0
                },
            })
                .then((result) => {
                    if (result) resolve();
                    else throw new Error("Account isnt belongs to team or account is locked for the team!");
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    isTeamAccountValidForUser(userId, teamId, accountId) {
        return new Promise((resolve, reject) => {
            // Checking whether that user is belongs to that Team or not
            return this.isTeamValidForUser(userId, teamId)
                .then(() => {
                    // Checking whether that account is belongs to that Team or not
                    return this.isAccountValidForTeam(teamId, accountId);
                })
                .then(() => resolve())
                .catch((error) => { reject(error); });
        });
    },

    getUserTeams(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid userId"));
            } else {
                // Fetching all Teams of an user
                return userTeamJoinTable.findAll({
                    where: { user_id: userId, left_from_team: 0, invitation_accepted: 1 },
                    attributes: ["id", "team_id"]
                })
                    .then((response) => {
                        var teamIds = [];
                        response.map(element => {
                            if (element.team_id)
                                teamIds.push(element.team_id);
                        });

                        resolve(teamIds);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    },

    getAccountsTeam(accountId) {
        return new Promise((resolve, reject) => {
            // Fetching the Team which the account is belongs to
            return teamSocialAccountJoinTable.findAll({
                where: {
                    account_id: accountId,
                    is_account_locked: false
                },
                attributes: ["id", 'team_id']
            }).then((teams) => {
                var teamIds = [];
                teams.map(element => {
                    if (element.team_id)
                        teamIds.push(element.team_id);
                });
                resolve(teamIds);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    isAccountValidForUser(userId, accountId) {
        return new Promise((resolve, reject) => {
            var accountTeams = [];
            var userTeams = [];
            // Fetching user teams
            return this.getUserTeams(userId)
                .then((userTeam) => {
                    userTeams = userTeam;
                    // Fetching the Team which the account is belongs to
                    return this.getAccountsTeam(accountId);
                })
                .then((accountTeam) => {
                    accountTeams = accountTeam;
                    // Validating that the user Teams consist of account Team or not
                    var intersectTeams = lodash.intersection(accountTeams, userTeams);
                    resolve({ isValid: intersectTeams.length > 0 ? true : false, intersectTeams: intersectTeams });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    getSocialAccount(accountType, accountId, userId, teamId) {
        return new Promise((resolve, reject) => {

            if (!accountType || !accountId || !userId || !teamId) {
                reject(new Error("Please verify your inputs: 1. Account id, \n\r 2.Team id"));
            } else {
                // Validating that the account is valid for user
                return this.isTeamAccountValidForUser(userId, teamId, accountId)
                    .then(() => {
                        return socialAccount.findOne({
                            where: {
                                account_type: accountType,
                                account_id: accountId
                            }
                        });
                    })
                    .then((accountDetails) => {
                        if (!accountDetails) {
                            accountType = accountType instanceof Array ? accountType[0] : accountType;
                            var networkName = coreServices.getNetworkName(accountType);
                            throw new Error(`No profile found or account isn't ${networkName.toLowerCase()} profile.`);
                        }
                        else
                            resolve(accountDetails);
                    })
                    .catch((error) => reject(error));
            }
        });
    },

    isNeedToFetchRecentPost(accountId, frequencyValue, frequencyFactor) {
        return new Promise((resolve, reject) => {
            if (!accountId || !frequencyValue || !frequencyFactor) {
                reject(new Error("Please verify account id valid or not!"));
            } else {
                // Fetching account feed updated details
                return accountFeedsUpdateTable.findOne({
                    where: {
                        account_id: accountId
                    }
                })
                    .then((result) => {
                        if (!result)
                            resolve(true);
                        else {
                            // Calculating the difference
                            var difference = moment.tz(new Date(), "GMT").diff(moment.tz(result.updated_date, 'GMT'), frequencyFactor);
                            // Sending yes or no to Fetch or not 
                            resolve(difference > frequencyValue);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    },

    createOrEditLastUpdateTime(accountId, socialId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Please verify account id!"));
            } else {
                // Fetching details of feed update of an account
                return accountFeedsUpdateTable.findOne({
                    where: { account_id: accountId }
                })
                    .then((result) => {
                        if (!result) {
                            // Creating data in feed update for an account
                            return accountFeedsUpdateTable.create({
                                account_id: accountId,
                                social_id: socialId,
                                updated_date: moment.utc().format()
                            });
                        } else
                            // Updating the existing account details
                            return result.update({ updated_date: moment.utc().format() });
                    })
                    .then(() => resolve())
                    .catch((error) => reject(error));
            }
        });
    },

    createOrUpdateFriendsList(accountId, data) {
        return new Promise((resolve, reject) => {
            if (!accountId || !data) {
                reject(new Error("Please verify account id or data to update!"));
            } else {
                // Fetching details of friends stats of an account
                return updateFriendsTable.findOne({
                    where: { account_id: accountId }
                })
                    .then((result) => {
                        if (!result) {
                            // If not found, Adding details to that table
                            return updateFriendsTable.create({
                                account_id: accountId,
                                friendship_count: data.friendship_count == undefined ? null : data.friendship_count,
                                follower_count: data.follower_count == undefined ? null : data.follower_count,
                                following_count: data.following_count == undefined ? null : data.following_count,
                                page_count: data.page_count == undefined ? null : data.page_count,
                                group_count: data.group_count == undefined ? null : data.group_count,
                                board_count: data.board_count == undefined ? null : data.board_count,
                                subscription_count: data.subscription_count == undefined ? null : data.subscription_count,
                                total_like_count: data.total_like_count == undefined ? null : data.total_like_count,
                                total_post_count: data.total_post_count == undefined ? null : data.total_post_count,
                                bio_text: data.bio_text ? data.bio_text : null,
                                profile_picture: data.profile_picture ? data.profile_picture : null,
                                cover_picture: data.cover_picture ? data.cover_picture : null,
                                updated_date: moment.utc().format()
                            });
                        } else
                            // If found, updating the existed values
                            return result.update({
                                friendship_count: data.friendship_count == undefined ? null : data.friendship_count,
                                follower_count: data.follower_count == undefined ? null : data.follower_count,
                                following_count: data.following_count == undefined ? null : data.following_count,
                                page_count: data.page_count == undefined ? null : data.page_count,
                                group_count: data.group_count == undefined ? null : data.group_count,
                                board_count: data.board_count == undefined ? null : data.board_count,
                                subscription_count: data.subscription_count == undefined ? null : data.subscription_count,
                                total_like_count: data.total_like_count == undefined ? null : data.total_like_count,
                                total_post_count: data.total_post_count == undefined ? null : data.total_post_count,
                                bio_text: data.bio_text ? data.bio_text : null,
                                profile_picture: data.profile_picture ? data.profile_picture : null,
                                cover_picture: data.cover_picture ? data.cover_picture : null,
                                updated_date: moment.utc().format()
                            });
                    })
                    .then((data) => resolve(data))
                    .catch((error) => reject(error));
            }
        });
    },

    createOrUpdateTeamReport(teamId, update) {
        return new Promise((resolve, reject) => {
            if (!teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var teamDetails = null;
                var SocialAccountStats = {};
                SocialAccountStats.facebookStats = [];
                SocialAccountStats.twitterStats = [];
                SocialAccountStats.instagramStats = [];
                SocialAccountStats.youtubeStats = [];
                var teamMembers = 0;
                var invitedList = 0;
                var socialProfiles = 0;
                var data = {};
                var updatedData = {};

                return teamInfo.findAll({
                    where: {
                        team_id: teamId
                    },
                    attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
                    include: [{
                        model: socialAccount,
                        as: 'SocialAccount',
                        attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
                        through: {
                            attributes: ['is_account_locked']
                        }
                    }]
                })
                    .then((teamSocialAccounts) => {
                        teamDetails = teamSocialAccounts;
                        return userTeamJoinTable.findAll({
                            where: {
                                team_id: teamId,
                            },
                            attributes: ['id', 'team_id', 'invitation_accepted', 'permission', 'user_id'],
                            raw: true
                        });
                    })
                    .then((teamMembersData) => {
                        teamMembersData.forEach(element => {
                            if (element.invitation_accepted == true) {
                                teamMembers += 1;
                            }
                            if (element.invitation_accepted == false) {
                                invitedList += 1;
                            }
                        });
                        return Promise.all(teamDetails.map(accounts => {
                            socialProfiles = accounts.SocialAccount.length;
                            return Promise.all(accounts.SocialAccount.map(account => {
                                var fields = [];
                                switch (Number(account.account_type)) {
                                    case 1:
                                        fields = ['account_id', 'friendship_count', 'page_count'];
                                        break;
                                    case 4:
                                        fields = ['account_id', 'follower_count', 'following_count', 'total_like_count', 'total_post_count'];
                                        break;
                                    case 5:
                                        fields = ['account_id', 'friendship_count', 'follower_count', 'following_count', 'total_post_count'];
                                        break;
                                    case 9:
                                        fields = ['account_id', 'subscription_count', 'total_post_count'];
                                        break;
                                    default:
                                        break;
                                }
                                if (fields.length > 0) {
                                    return updateFriendsTable.findOne({
                                        where: { account_id: account.account_id },
                                        attributes: fields,
                                        raw: true
                                    })
                                        .then((resultData) => {
                                            var data = resultData;
                                            switch (Number(account.account_type)) {
                                                case 1:
                                                    SocialAccountStats.facebookStats.push({ facebookStats: data });
                                                    break;
                                                case 4:
                                                    SocialAccountStats.twitterStats.push({ twitterStats: data });
                                                    break;
                                                case 5:
                                                    SocialAccountStats.instagramStats.push({ instagramStats: data });
                                                    break;
                                                case 9:
                                                    SocialAccountStats.youtubeStats.push({ youtubeStats: data });
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })
                                        .catch((error) => {
                                            throw error;
                                        });
                                }
                            }));
                        }));
                    })
                    .then(() => {
                        var publishedPostsMongoModelObject = new PublishedPostsMongoModel();
                        return publishedPostsMongoModelObject.getTeamPublishedCount(teamId);
                    })
                    .then((publishedCount) => {
                        data = {
                            teamId: teamId,
                            insights: {
                                teamMembersCount: teamMembers,
                                invitedList: invitedList,
                                socialProfilesCount: socialProfiles,
                                publishCount: publishedCount,
                                SocialAccountStats: SocialAccountStats
                            }
                        };
                        updatedData = [{
                            teamMembersCount: teamMembers,
                            invitedList: invitedList,
                            socialProfilesCount: socialProfiles,
                            publishCount: publishedCount,
                            SocialAccountStats: SocialAccountStats
                        }];
                        var teamInsightsMongoModelObject = new TeamInsightsMongoModel();
                        // insertInsights(data) then addTeamInsights(teamId, updatedData)
                        // update or insert, Update status is', update, 'update data is \n\n', updatedData;
                        if (!update || update == null || update == false)
                            return teamInsightsMongoModelObject.insertInsights(data);
                        else
                            return teamInsightsMongoModelObject.addTeamInsights(teamId, updatedData);
                    })
                    .then(() => {
                        resolve(updatedData);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    },

    getTeamSocialAccounts(userId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var filteredTeams = null;
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id'],
                    include: [{
                        model: teamInfo,
                        as: 'Team',
                        where: { team_id: teamId },
                        attributes: ['team_id'],
                        through: {
                            where: {
                                [Operator.and]: [{
                                    invitation_accepted: true
                                }, {
                                    left_from_team: false
                                }]
                            }
                        }
                    }]
                })
                    .then((teamInformation) => {
                        filteredTeams = teamInformation;
                        if (!teamInformation) {
                            throw new Error("Team not found or access denied!");
                        }
                        else if (teamInformation.count == 0) {
                            throw new Error({
                                isNoTeam: true,
                                message: "User don't have any team!"
                            });
                        }
                        else {
                            return Promise.all(teamInformation.Team.map(function (teamResponse) {
                                return teamInfo.findAll({
                                    where: {
                                        team_id: teamResponse.dataValues.team_id
                                    },
                                    attributes: ['team_id', 'team_name', 'team_logo', 'team_description', 'team_admin_id'],
                                    include: [{
                                        model: socialAccount,
                                        as: 'SocialAccount',
                                        attributes: ['account_id', 'account_type', 'first_name', 'last_name', 'email', 'social_id', 'profile_pic_url', 'cover_pic_url', 'friendship_counts'],
                                        through: {
                                            attributes: ['is_account_locked']
                                        }
                                    }]
                                });
                            }));
                        }
                    })
                    .then((teamDetails) => {
                        resolve({ teamDetails, filteredTeams });
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }
        })
    },

    getUserDetails(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject({ error: true, message: "Invalid userId" });
            } else {
                return userDetails.findOne({
                    where: {
                        user_id: Number(userId)
                    },
                    attributes: ['user_id', 'email', 'phone_no', 'first_name', 'last_name', 'date_of_birth', 'phone_code', 'about_me', 'profile_picture', 'is_account_locked', 'is_admin_user'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'activation_status', 'activate_2step_verification', 'shortenStatus', 'email_validate_token', 'forgot_password_validate_token', 'forgot_password_token_expire', 'otp_token', 'otp_token_expire']
                    }]
                })
                    .then((userDetails) => {
                        if (!userDetails)
                            reject({ error: true, message: "User not found!" });
                        else
                            resolve(userDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

};

module.exports = UserTeamAccount;