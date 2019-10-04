const db = require('../sequelize-cli/models/index');
const CoreServices = require('../utility/coreServices');
const moment = require('moment');
const lodash = require('lodash');

const socialAccount = db.social_accounts;
const userTeamJoinTable = db.join_table_users_teams;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const accountFeedsUpdateTable = db.social_account_feeds_updates;
const coreServices = new CoreServices();

class UserAccountTeamLibs {

    isTeamValidForUser(userId, teamId) {
        return new Promise((resolve, reject) => {
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
    }

    isAccountValidForTeam(teamId, accountId) {
        return new Promise((resolve, reject) => {
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
    }

    isTeamAccountValidForUser(userId, teamId, accountId) {
        return new Promise((resolve, reject) => {
            return this.isTeamValidForUser(userId, teamId)
                .then(() => {
                    return this.isAccountValidForTeam(teamId, accountId);
                })
                .then(() => resolve())
                .catch((error) => { reject(error); });
        });
    }

    getUserTeams(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid userId"));
            } else {
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
    }

    getAccountsTeam(accountId) {
        return new Promise((resolve, reject) => {
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
    }

    isAccountValidForUser(userId, accountId) {
        return new Promise((resolve, reject) => {
            var accountTeams = [];
            var userTeams = [];
            return this.getUserTeams(userId)
                .then((userTeam) => {
                    userTeams = userTeam;
                    return this.getAccountsTeam(accountId);
                })
                .then((accountTeam) => {
                    accountTeams = accountTeam;
                    var intersectTeams = lodash.intersection(accountTeams, userTeams);
                    resolve({ isValid: intersectTeams.length > 0 ? true : false, intersectTeams: intersectTeams });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getSocialAccount(accountType, accountId, userId, teamId) {
        return new Promise((resolve, reject) => {

            if (!accountType || !accountId || !userId || !teamId) {
                reject(new Error("Please verify your inputs: 1. Account id, \n\r 2.Team id"));
            } else {
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
    }

    isNeedToFetchRecentPost(accountId, frequencyValue, frequencyFactor) {
        return new Promise((resolve, reject) => {
            if (!accountId || !frequencyValue || !frequencyFactor) {
                reject(new Error("Please verify account id valid or not!"));
            } else {
                return accountFeedsUpdateTable.findOne({
                    where: {
                        account_id: accountId
                    }
                })
                    .then((result) => {
                        if (!result)
                            resolve(true);
                        else {
                            var difference = moment.tz(new Date(), "GMT").diff(moment.tz(result.updated_date, 'GMT'), frequencyFactor);
                            resolve(difference > frequencyValue);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    createOrEditLastUpdateTime(accountId, socialId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Please verify account id!"));
            } else {
                return accountFeedsUpdateTable.findOne({
                    where: { account_id: accountId }
                })
                    .then((result) => {
                        if (!result) {
                            return accountFeedsUpdateTable.create({
                                account_id: accountId,
                                social_id: socialId,
                                updated_date: moment.utc().format()
                            });
                        } else
                            return result.update({ updated_date: moment.utc().format() });
                    })
                    .then(() => resolve())
                    .catch((error) => reject(error));
            }
        });
    }
}

module.exports = UserAccountTeamLibs;