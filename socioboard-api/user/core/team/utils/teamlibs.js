const config = require('config');
const lodash = require('lodash');
const schedule = require('node-schedule');
const moment = require('moment');

const db = require('../../../../library/sequelize-cli/models/index');
const logger = require('../../../utils/logger');

const AuthorizeServices = require('../../../../library/utility/authorizeServices');
const CoreServices = require('../../../../library/utility/coreServices');
const NotificationServices = require('../../../../library/utility/notifyServices');

const FbConnect = require('../../../../library/network/facebook');
const TwtConnect = require('../../../../library/network/twitter');
const LinkedInConnect = require('../../../../library/network/linkedin');
const GoogleConnect = require('../../../../library/network/google');
const InstagramConnect = require('../../../../library/network/instagram');
const PinterestConnect = require('../../../../library/network/pinterest');

const FacebookMongoPostModel = require('../../../../library/mongoose/models/facebookposts');
const TwitterMongoPostModel = require('../../../../library/mongoose/models/twitterposts');
const TwitterInsightPostModel = require('../../../../library/mongoose/models/twitterInsights');
const YoutubeMongoPostModel = require('../../../../library/mongoose/models/youtubepost');
const InstagramMongoPostModel = require('../../../../library/mongoose/models/instagramposts');
const InstagramBusinessMongoPostModel = require('../../../../library/mongoose/models/instagrambusinessposts');
const InstagramStoryMongoModel = require('../../../../library/mongoose/models/instagramstoryinsights');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

const Operator = db.Sequelize.Op;
const userDetails = db.user_details;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const userTeamJoinTable = db.join_table_users_teams;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const pinterestBoard = db.pinterest_boards;
const updateFriendsTable = db.social_account_friends_counts;


class TeamLibs {

    constructor() {
        Object.assign(this, UserTeamAccount);
        this.authorizeServices = new AuthorizeServices(config.get('authorize'));
        this.coreServices = new CoreServices(config.get('authorize'));

        this.fbConnect = new FbConnect(config.get('facebook_api'));
        this.twtConnect = new TwtConnect(config.get('twitter_api'));
        this.linkedInConnect = new LinkedInConnect(config.get('linkedIn_api'));
        this.googleConnect = new GoogleConnect(config.get('google_api'));
        this.instagramConnect = new InstagramConnect(config.get('instagram'));
        this.pinterestConnect = new PinterestConnect(config.get('pinterest'));
    }

    getTeams(userId) {
        var filteredTeams = null;
        var teamDetails = null;
        var teamMemberDetails = null;
        var memberProfileDetails = null;

        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching user Teams respective to userId
                return userDetails.findOne({
                    where: { user_id: userId },
                    attributes: ['user_id'],
                    include: [{
                        model: teamInfo,
                        as: 'Team',
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
                        if (!teamInformation) {
                            throw new Error("Cant able to fetch the team for respective user!");
                        } else {
                            filteredTeams = teamInformation;
                            // Fetching social accounts belongs to Team/s
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
                    .then((teamSocialAccounts) => {
                        teamDetails = teamSocialAccounts;
                        // Fetching the members of Team/s
                        return Promise.all(filteredTeams.Team.map(function (teamResponse) {
                            return userTeamJoinTable.findAll({
                                where: { team_id: teamResponse.dataValues.team_id, left_from_team: false },
                                attributes: ['id', 'team_id', 'invitation_accepted', 'permission', 'user_id']
                            });
                        }));
                    })
                    .then((teamMembers) => {
                        teamMemberDetails = teamMembers;
                        // Fetching member profile details
                        return Promise.all(teamMembers.map(function (teamResponse) {
                            return Promise.all(teamResponse.map(function (userIdentifier) {
                                return userDetails.findOne({
                                    where: { user_id: userIdentifier.user_id },
                                    attributes: ['user_id', 'email', 'first_name', 'last_name', 'profile_picture']
                                });
                            }));
                        }));
                    })
                    .then((response) => {
                        memberProfileDetails = response;
                        // Fetching social accounts of user
                        return socialAccount.findAll({
                            where: { account_admin_id: userId },
                            attributes: ['account_id', 'first_name', 'account_type', 'profile_pic_url']
                        });
                    })
                    .then(function (response) {
                        resolve({ teamSocialAccountDetails: teamDetails, teamMembers: teamMemberDetails, memberProfileDetails: memberProfileDetails, socialAccounts: response });
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            }
        });
    }

    getTeamDetails(userId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var filteredTeams = null;
                var teamDetails = null;
                var teamMemberDetails = null;
                var memberProfileDetails = null;
                var pinterestBoards = [];
                var SocialAccountStats = [];

                // Validating user belongs to the Team or not
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
                            filteredTeams = teamInformation;
                            // Fetching social accounts related to that Team
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
                    .then((teamSocialAccounts) => {
                        // if (teamDetails.length < 0) throw new Error('No Social Account to the Team.');
                        teamDetails = teamSocialAccounts;
                        // Fetching Team members
                        return Promise.all(filteredTeams.Team.map(function (teamResponse) {
                            return userTeamJoinTable.findAll({
                                where: { team_id: teamResponse.dataValues.team_id, left_from_team: false },
                                attributes: ['id', 'team_id', 'invitation_accepted', 'permission', 'user_id']
                            });
                        }));
                    })

                    .then((teamMembers) => {
                        teamMemberDetails = teamMembers;
                        return Promise.all(teamMembers.map(function (teamResponse) {
                            return Promise.all(teamResponse.map(function (userIdentifier) {
                                return userDetails.findOne({
                                    where: { user_id: userIdentifier.user_id },
                                    attributes: ['user_id', 'email']
                                });
                            }));
                        }));
                    })
                    .then((response) => {
                        memberProfileDetails = response;
                        return socialAccount.findAll({
                            where: { account_admin_id: userId },
                            attributes: ['account_id', 'account_type']
                        });
                    })
                    .then((accounts) => {
                        var pinterestIds = [];
                        // Fetching social account stats for each account
                        return Promise.all(accounts.map(account => {
                            var fields = [];
                            switch (Number(account.account_type)) {
                                case 1:
                                    fields = ['account_id', 'friendship_count', 'page_count', 'profile_picture'];
                                    break;
                                case 2:
                                    fields = ['account_id', 'follower_count', 'total_like_count', 'profile_picture'];
                                    break;
                                case 4:
                                    fields = ['account_id', 'follower_count', 'following_count', 'total_like_count', 'total_post_count', 'bio_text', 'profile_picture'];
                                    break;
                                case 5:
                                    fields = ['account_id', 'friendship_count', 'follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                    break;
                                case 9:
                                    fields = ['account_id', 'subscription_count', 'total_post_count', 'profile_picture'];
                                    break;
                                case 11:
                                    fields = ['account_id', 'follower_count', 'following_count', 'board_count', 'bio_text', 'profile_picture'];
                                    break;
                                case 12:
                                    fields = ['account_id', 'follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                    break;
                                default:
                                    break;
                            }

                            if (account.account_type == 11) {
                                pinterestIds.push(account.account_id);
                            }

                            if (fields.length > 0) {
                                return updateFriendsTable.findOne({
                                    where: { account_id: account.account_id },
                                    attributes: fields
                                })
                                    .then((resultData) => {
                                        var data = resultData.toJSON();
                                        SocialAccountStats.push(data);
                                    })
                                    .catch((error) => {
                                        logger.error(error.message);
                                    });
                            }
                        }))
                            .then(() => {
                                logger.info(`Length: ${SocialAccountStats.length}`);
                                logger.info(JSON.stringify(SocialAccountStats));
                                return pinterestIds;
                            })
                            .catch((error) => {
                                throw error;
                            });

                    })
                    .then((pinterestIds) => {
                        // Fetching pinterest boads
                        return Promise.all(pinterestIds.map(function (accountId) {
                            return pinterestBoard.findAll({
                                where: {
                                    social_account_id: accountId
                                }
                            })
                                .then((boards) => {
                                    var accountBoards = [];
                                    boards.forEach((board) => {
                                        accountBoards.push(board.dataValues);
                                    });
                                    var boardDetails = {
                                        account_id: accountId,
                                        account_type: 11,
                                        boards: accountBoards
                                    };
                                    pinterestBoards.push(boardDetails);
                                    return;
                                })
                                .catch((error) => { logger.info(error); });
                        }));
                    })
                    .then(function () {
                        resolve({ teamSocialAccountDetails: teamDetails[0], SocialAccountStats: SocialAccountStats, teamMembers: teamMemberDetails[0], memberProfileDetails: memberProfileDetails[0], pinterestBoards: pinterestBoards });
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            }
        });
    }

    getSocialProfilesOld(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var socialAccounts = [];
                return socialAccount.findAll({
                    where: { account_admin_id: userId }
                })
                    .then((accounts) => {
                        resolve(accounts);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getSocialProfilesById(userId, accountId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var socialAccounts = {};
                // Fetching social account
                return socialAccount.findOne({
                    where: { account_admin_id: userId, account_id: accountId }
                })
                    .then((account) => {
                        var fields = [];
                        // Fetching account statistics/stats
                        switch (Number(account.account_type)) {
                            case 1:
                                fields = ['friendship_count', 'page_count', 'profile_picture'];
                                break;
                            case 2:
                                fields = ['follower_count', 'total_like_count', 'profile_picture'];
                                break;
                            case 4:
                                fields = ['follower_count', 'following_count', 'total_like_count', 'total_post_count', 'bio_text', 'profile_picture'];
                                break;
                            case 5:
                                fields = ['friendship_count', 'follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                break;
                            case 9:
                                fields = ['subscription_count', 'total_post_count', 'profile_picture'];
                                break;
                            case 11:
                                fields = ['follower_count', 'following_count', 'board_count', 'bio_text', 'profile_picture'];
                                break;
                            case 12:
                                fields = ['follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                break;
                            default:
                                break;
                        }
                        if (fields) {
                            return updateFriendsTable.findOne({
                                where: { account_id: account.account_id },
                                attributes: fields,
                            })
                                .then((resultData) => {
                                    account.dataValues.updatedDetails = JSON.parse(JSON.stringify(resultData));
                                    socialAccounts = account.dataValues;
                                })
                                .catch((error) => {
                                    logger.error(error);
                                });
                        }
                        else socialAccounts = account.dataValues;
                    })
                    .then(() => {
                        resolve(socialAccounts);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getSocialProfiles(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var socialAccounts = [];
                // Fetching all social accounts of an user
                return socialAccount.findAll({
                    where: { account_admin_id: userId }
                })
                    .then((accounts) => {
                        var fields = [];
                        // Fetching each account stats
                        return Promise.all(accounts.map(account => {
                            switch (Number(account.account_type)) {
                                case 1:
                                    fields = ['friendship_count', 'page_count', 'profile_picture'];
                                    break;
                                case 2:
                                    fields = ['follower_count', 'total_like_count', 'profile_picture'];
                                    break;
                                case 4:
                                    fields = ['follower_count', 'following_count', 'total_like_count', 'total_post_count', 'bio_text', 'profile_picture'];
                                    break;
                                case 5:
                                    fields = ['friendship_count', 'follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                    break;
                                case 9:
                                    fields = ['subscription_count', 'total_post_count', 'profile_picture'];
                                    break;
                                case 11:
                                    fields = ['follower_count', 'following_count', 'board_count', 'bio_text', 'profile_picture'];
                                    break;
                                case 12:
                                    fields = ['follower_count', 'following_count', 'total_post_count', 'profile_picture'];
                                    break;
                                default:
                                    break;
                            }
                            if (fields.length > 0) {
                                return updateFriendsTable.findOne({
                                    where: { account_id: account.account_id },
                                    attributes: fields,
                                })
                                    .then((resultData) => {
                                        account.dataValues.updatedDetails = JSON.parse(JSON.stringify(resultData));
                                        socialAccounts.push(account.dataValues);
                                    })
                                    .catch((error) => {
                                        logger.error(error);
                                    });
                            }
                            else socialAccounts.push(account.dataValues);
                        }));
                    })
                    .then(() => {
                        resolve(socialAccounts);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    createTeam(userId, teamDescription) {

        var teamDetails = null;
        return new Promise((resolve, reject) => {
            if (!userId || !teamDescription) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating Team details (already exists or not)
                return db.sequelize.transaction(function (t) {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_name: teamDescription.name
                            }]
                        },
                        attributes: ['team_id']
                    }, { transaction: t })
                        .then((team) => {
                            if (!team) {
                                return teamInfo.create({
                                    team_name: teamDescription.name,
                                    team_description: teamDescription.description,
                                    team_logo: teamDescription.logoUrl,
                                    team_admin_id: userId,
                                    is_default_team: false
                                }, { transaction: t });
                            }
                            else
                                throw new Error("User has already team with same name!");
                        })
                        .then((teamInfo) => {
                            teamDetails = teamInfo;
                            return userDetails.findOne({
                                where: { user_id: userId },
                                attributes: ['user_id']
                            }, { transaction: t });
                        })
                        .then((user) => {
                            return teamDetails.setUser(user, { transaction: t, through: { invitation_accepted: true, permission: 1, left_from_team: false, invited_by: 0 } });
                        })
                        .then(() => {
                            return UserTeamAccount.createOrUpdateTeamReport(teamDetails.dataValues.team_id, '');
                        })
                        .then(() => {
                            logger.info(teamDetails);
                            resolve(teamDetails.toJSON());
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }
        });
    }

    editTeam(userId, teamId, teamDescription) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !teamDescription) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating User belongs to that particular team or not
                return db.sequelize.transaction(function (t) {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        },
                        attributes: ['team_id', 'team_name', 'team_description', 'team_logo']
                    }, { transaction: t })
                        .then((team) => {
                            if (!team)
                                throw new Error("Team not found or access denied!");
                            else {
                                // Updating the team
                                return team.update({
                                    team_name: teamDescription.name,
                                    team_description: teamDescription.description,
                                    team_logo: teamDescription.logoUrl,
                                }, { transaction: t });
                            }
                        })
                        .then((teamDetails) => {
                            resolve(teamDetails);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }


        });
    }

    deleteTeam(userId, teamId) {
        var deletingTeam = '';
        var usersTeamIds = [];
        return new Promise((resolve, reject) => {
            if (!userId || !teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating User belongs to that particular team or not
                return db.sequelize.transaction(function (t) {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        },
                        attributes: ['team_id', 'team_name', 'is_default_team']
                    }, { transaction: t })
                        // Finding all team information or throwing error message
                        .then((team) => {
                            if (!team) {
                                throw new Error("Team not found or access denied!");
                            } else {
                                if (team.is_default_team) {
                                    throw new Error("Sorry, You can't delete default team.");
                                }
                                else {
                                    return teamInfo.findAll({
                                        where: {
                                            team_admin_id: userId
                                        },
                                        attributes: ['team_id']
                                    }, { transaction: t });
                                }
                            }
                        })
                        .then((usersTeam) => {
                            usersTeam.forEach(element => {
                                usersTeamIds.push(String(element.team_id));
                            });
                            if (usersTeamIds.includes(teamId)) {
                                // Fetching social accounts belongs to that Team
                                return teamSocialAccountJoinTable.findAll({
                                    where: {
                                        team_id: usersTeamIds
                                    },
                                    attributes: ['id', 'account_id', 'team_id']
                                }, { transaction: t });
                            }
                            else
                                return null;
                        })
                        .then((teamsAccount) => {
                            if (teamsAccount && teamsAccount.length > 0) {
                                var availableAccounts = [];
                                var deleteAccounts = [];
                                var currentTeamAccounts = [];

                                // Fetching all accounts Id's and storing it in a variable
                                teamsAccount.forEach(element => {
                                    if (element.team_id == teamId) {
                                        currentTeamAccounts.push(element.account_id);
                                    }
                                    availableAccounts.push(element.account_id);
                                });
                                if (availableAccounts.length > 0) {
                                    var countWiseArray = lodash.countBy(availableAccounts, Math.floor);
                                    var uniqueAccountList = lodash.uniq(availableAccounts);

                                    uniqueAccountList.forEach(element => {
                                        var availableCount = countWiseArray[element];
                                        if (availableCount == 1) {
                                            deleteAccounts.push(element);
                                        }
                                    });
                                    var filteredDeleteAccounts = lodash.intersection(currentTeamAccounts, deleteAccounts);
                                    if (filteredDeleteAccounts.length > 0) {
                                        // Deleting the listed social accounts belongs to that Team
                                        return socialAccount.destroy(
                                            { where: { account_id: filteredDeleteAccounts } },
                                            { transaction: t });
                                    } else
                                        return;
                                }
                                return;
                            }
                            else return;
                        })
                        .then(() => {
                            return teamInfo.findOne({
                                where: {
                                    [Operator.and]: [{
                                        team_admin_id: userId
                                    }, {
                                        team_id: teamId
                                    }]
                                },
                                attributes: ['team_id']
                            }, { transaction: t });
                        })
                        .then((team) => {
                            return team.destroy({
                                where: {
                                    team_id: teamId
                                }
                            }, { transaction: t });
                        })
                        .then((teamDetails) => {
                            resolve(teamDetails);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }


        });
    }

    inviteTeam(userId, userName, teamId, invitingUserEmail, permission, maximumMemberCount) {
        var teamDetails = null;
        var invitingUserId = null;
        return new Promise((resolve, reject) => {
            if (!userId || !userName || !teamId || !invitingUserEmail || !permission || !maximumMemberCount) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Validating User belongs to that particular team or not
                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        }
                    }, { transaction: t })
                        .then((teamInfo) => {
                            if (teamInfo == null)
                                throw new Error("Team not found or access denied!");

                            teamDetails = teamInfo;

                            // Validating the inviting user belongs to the socioboard or not
                            return userDetails.findOne({
                                where: { email: invitingUserEmail },
                                include: [{
                                    model: userActivation,
                                    as: 'Activations',
                                    where: { activation_status: 1 }
                                }],
                                attributes: ['user_id']
                            }, { transaction: t });
                        })
                        .then((user) => {
                            if (user == null)
                                throw new Error(`Please check following points, 1.May be email isn't registered with ${config.get('applicationName')}! or \n\r 2.User's email not activated.`);
                            else {
                                invitingUserId = user.user_id;
                                return;
                            }
                        })
                        .then(() => {
                            // Checking that till now how many members we have invited
                            return userTeamJoinTable.count({
                                where: {
                                    [Operator.and]: [{
                                        left_from_team: false
                                    }, {
                                        invited_by: userId
                                    }]
                                }
                            }, { transaction: t });
                        })
                        .then((count) => {
                            // Validating the maximum people we can invite based on our current plan
                            var availableMemberCount = maximumMemberCount - count;
                            if (availableMemberCount <= 0)
                                throw new Error(`Sorry, As per your plan, you can't invite any more user.`);
                            return;
                        })
                        .then(() => {
                            // Checking that, we already invited the same user or not
                            return userTeamJoinTable.findOne({
                                where: {
                                    [Operator.and]: [{
                                        team_id: teamId
                                    }, {
                                        user_id: invitingUserId
                                    }]
                                }
                            }, { transaction: t });
                        })
                        .then((invitingUserInfo) => {

                            if (invitingUserInfo)
                                throw new Error("Same user already invited or left the team");
                            else {
                                // Creating an invitation to the Team
                                return userTeamJoinTable.create({
                                    team_id: teamId,
                                    user_id: invitingUserId,
                                    invitation_accepted: false,
                                    permission: permission,
                                    left_from_team: false,
                                    invited_by: userId
                                }, { transaction: t });
                            }
                        })
                        .then(() => {
                            let targetUserId = [];
                            targetUserId.push(invitingUserId);
                            // Sending notification to specified inviting user of invitation to a Team
                            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                            notification.notificationMessage = `${userName} invited to join ${teamDetails.team_name} Team.`;
                            notification.teamName = teamDetails.team_name;
                            notification.notifyType = 'team_invite';
                            notification.initiatorName = userName;
                            notification.status = 'success';
                            notification.targetUserId = targetUserId;

                            return notification.saveNotifications()
                                .then((savedObject) => {
                                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                    return notification.sendUserNotification(invitingUserId, encryptedNotifications);
                                })
                                .catch((error) => {
                                    throw new Error(`Notification not sent, ${error.message}`);
                                });
                        })
                        .then(() => {
                            resolve("Invitation sent!");
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }
        });
    }

    getTeamInvitations(userId) {
        return new Promise((resolve, reject) => {
            var invitationData = [];
            // Finding user invitation acceptance pending Team/s Id's
            return userDetails.findOne({
                where: { user_id: userId },
                attributes: ['user_id'],
                include: [{
                    model: teamInfo,
                    as: 'Team',
                    attributes: ['team_id'],
                    through: {
                        where: { invitation_accepted: false, left_from_team: false },
                        attributes: ['invitation_accepted', 'permission']
                    }
                }]
            })
                .then((teamInformation) => {
                    // Fetching the full information about each team
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
                })
                .then(function (response) {

                    if (response.length > 0) {
                        return Promise.all(response[0].map(element => {
                            return userDetails.findOne({
                                where: { user_id: element.dataValues.team_admin_id },
                                attributes: ['first_name']
                            })
                                .then((user) => {
                                    element.dataValues.team_admin_name = user.dataValues.first_name;
                                    invitationData.push(element.dataValues);
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }))
                            .catch((error) => {
                                throw error(error);
                            });
                    }
                    return;
                })
                .then(() => {
                    resolve(invitationData);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    acceptTeamInvitation(userId, teamId, userName) {
        let acceptResponse = '';
        let adminId = '';
        return new Promise((resolve, reject) => {
            // Checking invitations are there or not
            return db.sequelize.transaction((t) => {
                return userTeamJoinTable.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            team_id: teamId
                        }]
                    },
                    attributes: ['id', 'user_id', 'team_id', 'invited_by', 'invitation_accepted', 'left_from_team'],
                }, { transaction: t })
                    .then((userTeamJoinTableInfo) => {

                        if (userTeamJoinTableInfo == null)
                            throw new Error("You don't have invitation for this team!");

                        adminId = userTeamJoinTableInfo.invited_by;

                        // Updating the status of invitation to Accepted
                        return userTeamJoinTableInfo.update({
                            invitation_accepted: true,
                            left_from_team: false
                        }, { transaction: t });
                    })
                    .then((response) => {
                        acceptResponse = response;
                        return teamInfo.findOne({
                            where: { team_id: teamId }
                        });
                    })
                    .then((teamDetails) => {
                        let targetUserId = [];
                        targetUserId.push(adminId);

                        // Sending notification to the user who invited saying, the user is Accepted invitation
                        var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                        notification.notificationMessage = `${userName} accepted your invitation for ${teamDetails.team_name} team.`;
                        notification.teamName = teamDetails.team_name;
                        notification.notifyType = 'team_accept';
                        notification.initiatorName = userName;
                        notification.status = 'success';
                        notification.targetUserId = targetUserId;

                        return notification.saveNotifications()
                            .then((savedObject) => {
                                var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                return notification.sendUserNotification(adminId, encryptedNotifications);
                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .then(() => {
                        resolve(acceptResponse);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        });
    }

    declineTeamInvitation(userId, teamId, userName) {
        let adminId = '';
        let deleteInfo = '';
        return new Promise((resolve, reject) => {
            // Checking invitations are there or not
            return db.sequelize.transaction((t) => {
                return userTeamJoinTable.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            team_id: teamId
                        }, {
                            invited_by: { [Operator.ne]: [userId] }
                        }, {
                            invitation_accepted: false
                        }]
                    },
                    attributes: ['id', 'user_id', 'team_id', 'invitation_accepted', 'invited_by', 'left_from_team'],
                }, { transaction: t })
                    .then((userTeamJoinTableInfo) => {

                        if (userTeamJoinTableInfo == null)
                            throw new Error("You don't have invitation for this team or You already a member of this team!");

                        // Updating the invitation to Decline (removing the invitation from DB)
                        adminId = userTeamJoinTableInfo.invited_by;
                        return userTeamJoinTable.destroy({
                            where: {
                                [Operator.and]: [{
                                    team_id: teamId
                                }, {
                                    user_id: userId
                                }]
                            }
                        }, { transaction: t });
                    })
                    .then((response) => {
                        deleteInfo = response;
                        return teamInfo.findOne({
                            where: { team_id: teamId }
                        });
                    })
                    .then((teamDetails) => {
                        let targetUserId = [];
                        targetUserId.push(adminId);

                        // Sending notification to invited user saying, user declined your Invitation
                        var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                        notification.notificationMessage = `${userName} declined your invitation for joining a ${teamDetails.team_name} team.`;
                        notification.teamName = teamDetails.team_name;
                        notification.notifyType = 'team_decline';
                        notification.initiatorName = userName;
                        notification.status = 'success';
                        notification.targetUserId = targetUserId;

                        return notification.saveNotifications()
                            .then((savedObject) => {
                                var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                return notification.sendUserNotification(adminId, encryptedNotifications);

                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .then(() => {
                        resolve(deleteInfo);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        });
    }

    withdrawInvitation(userId, teamId, emailId) {
        return new Promise((resolve, reject) => {
            // Checking user is belongs to the team or not
            return db.sequelize.transaction(function (t) {
                return teamInfo.findOne({
                    where: {
                        [Operator.and]: [{
                            team_admin_id: userId
                        }, {
                            team_id: teamId
                        }]
                    }
                }, { transaction: t })
                    .then((teamInfo) => {
                        if (teamInfo == null)
                            throw new Error("Not Found or Access Denied!");
                        else {
                            // Checking the invited user is belongs to the socioboard or not
                            return userDetails.findOne({
                                where: { email: emailId },
                                attributes: ['user_id']
                            }, { transaction: t });
                        }
                    })
                    .then((user) => {
                        if (user == null)
                            throw new Error(`No such email registered with ${config.get('applicationName')}!`);
                        else {
                            // Deleting the invitation made to the user 
                            return userTeamJoinTable.destroy({
                                where: {
                                    [Operator.and]: [{
                                        team_id: teamId
                                    }, {
                                        user_id: user.user_id
                                    }, {
                                        invitation_accepted: false
                                    }]
                                }
                            }, { transaction: t });
                        }
                    })
                    .then((response) => {
                        if (response == 0)
                            throw new Error("No more invitation are present to withdraw or You already a member of the team!");
                        else
                            resolve('success');
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        });
    }

    removeTeamMember(userId, userName, teamId, memberId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !memberId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var teamDetails = {};
                // Checking user is belongs to the team or not
                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        }
                    }, { transaction: t })
                        .then((teamData) => {
                            if (teamData == null)
                                throw new Error("Not found or access denied!");
                            else {
                                teamDetails = teamData;
                                return userDetails.findOne({
                                    where: { user_id: memberId },
                                    attributes: ['user_id', 'first_name']
                                }, { transaction: t });
                            }
                        })
                        .then((user) => {
                            if (user == null)
                                throw new Error(`No such member registered with ${config.get('applicationName')}!`);
                            else {
                                // removing the Team member
                                return userTeamJoinTable.destroy({
                                    where: {
                                        [Operator.and]: [{
                                            team_id: teamId
                                        }, {
                                            user_id: user.user_id
                                        },
                                        {
                                            invited_by: userId
                                        }]
                                    }
                                }, { transaction: t });
                            }
                        })
                        .then((response) => {
                            if (response == 0)
                                throw new Error("Already removed from your team.");
                            else {
                                let targetUserId = [];
                                targetUserId.push(memberId);

                                // Sending notification to user saying, You've been removed from Team
                                var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                                notification.notificationMessage = `You have been removed from team(${teamDetails.team_name})`;
                                notification.teamName = teamDetails.team_name;
                                notification.notifyType = 'team_removeTeamMember';
                                notification.initiatorName = userName;
                                notification.status = 'success';
                                notification.targetUserId = targetUserId;

                                return notification.saveNotifications()
                                    .then((savedObject) => {
                                        var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                        return notification.sendUserNotification(memberId, encryptedNotifications);
                                    }).then(() => {
                                        resolve(`Successfully removed member(${memberId}) from team(${teamId})`);
                                    })
                                    .catch(() => {
                                        throw error;
                                    })
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        });
    }

    getTeamMembers(userId, category) {
        return new Promise((resolve, reject) => {
            if (!userId || !category) {
                reject(new Error('Invalid Inputs'));
            } else {
                var condition = { invited_by: userId };
                if (category == 1 || category == 2) {
                    condition.invitation_accepted = category == 1 ? false : true;
                    condition.left_from_team = false;
                }
                if (category == 3) {
                    condition.left_from_team = true;
                    condition.invitation_accepted = true;
                }

                var matchedUser = [];
                // Fetching all Team members
                return userTeamJoinTable.findAll({
                    where: condition,
                    attributes: ['user_id', 'team_id']
                })
                    .then((users) => {
                        // Fetching all Team members details
                        return Promise.all(users.map(user => {
                            return userDetails.findOne({
                                where: {
                                    user_id: user.user_id,
                                },
                                attributes: ['user_id', 'email', 'first_name', 'last_name', 'date_of_birth', 'profile_picture', 'phone_no', 'country', 'about_me'],
                            })
                                .then((matchUser) => {
                                    if (matchUser) {
                                        var userInfo = matchUser.toJSON();
                                        userInfo.team_id = user.team_id;
                                        matchedUser.push(userInfo);
                                    }
                                })
                                .catch((error) => { });
                        }));
                    })
                    .then(() => {
                        resolve(matchedUser);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getProfileRedirectUrl(userId, teamId, network, accessToken, userScopeAvailableNetworks) {

        var resultJson = null;
        return new Promise((resolve, reject) => {
            // Checking user is belongs to the team or not
            return db.sequelize.transaction((t) => {
                return teamInfo.findOne({
                    where: {
                        [Operator.and]: [{
                            team_admin_id: userId
                        }, {
                            team_id: teamId
                        }]
                    },
                    attributes: ['team_id']
                }, { transaction: t })

                    .then((team) => {
                        var state = {
                            teamId: teamId,
                            network: network,
                            accessToken: accessToken
                        };
                        var encryptedState = this.authorizeServices.encrypt(JSON.stringify(state));
                        var redirectUrl = '';

                        if (team == null) {
                            throw new Error("Team not found or You don't have access to add the profile to team");
                        }
                        else {
                            // swithing to whichever network is selected by user
                            switch (network) {
                                case "Facebook":
                                    if (userScopeAvailableNetworks.includes('1')) {
                                        redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('profile_add_redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get('facebook_api.profile_scopes')}&state=${encryptedState}`;
                                        resultJson = { code: 200, status: "success", message: "Navigated to facebook.", navigateUrl: redirectUrl };
                                    }
                                    else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "FacebookPage":
                                case "FacebookGroup":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('1')) {
                                        redirectUrl = `https://www.facebook.com/v3.3/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('profile_add_redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get('facebook_api.page_scopes')}&state=${encryptedState}`;
                                        resultJson = { code: 200, status: "success", message: "Navigated to facebook.", navigateUrl: redirectUrl };
                                    }
                                    else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "InstagramBusiness":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('12')) {
                                        let scopes = `${config.get('facebook_api.scopes')},${config.get('instagram.business_account_scopes')}`;
                                        redirectUrl = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(config.get('profile_add_redirect_url'))}&client_id=${config.get('facebook_api.app_id')}&scope=${scopes}&state=${encryptedState}`;
                                        resultJson = { code: 200, status: "success", message: "Navigated to facebook to add instagram account.", navigateUrl: redirectUrl };
                                    }
                                    else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "Twitter":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('4')) {
                                        return this.twtConnect.requestToken()
                                            .then((response) => {
                                                var state = {
                                                    teamId: teamId,
                                                    network: network,
                                                    accessToken: accessToken,
                                                    requestToken: response.requestToken,
                                                    requestSecret: response.requestSecret
                                                };
                                                var encryptedState = this.authorizeServices.encrypt(JSON.stringify(state));
                                                resultJson = { code: 200, status: "success", message: response, redirectUrl: `https://api.twitter.com/oauth/authenticate?oauth_token=${response.requestToken}`, state: encryptedState };
                                            })
                                            .catch((error) => {
                                                resultJson = { code: 400, status: "failed", error: error.message };
                                            });
                                    }
                                    else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "LinkedIn":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('6')) {
                                        redirectUrl = this.linkedInConnect.getOAuthUrl(encryptedState);
                                        resultJson = { code: 200, status: "success", message: "Navigated to linkedIn.", navigateUrl: redirectUrl };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");

                                    break;
                                case "LinkedInCompany":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('6')) {
                                        redirectUrl = this.linkedInConnect.getV1OAuthUrl(encryptedState);
                                        resultJson = { code: 200, status: "success", message: "Navigated to linkedIn.", navigateUrl: redirectUrl };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");

                                    break;
                                case "Youtube":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('9')) {
                                        redirectUrl = this.googleConnect.getGoogleAuthUrl('youtube', encryptedState);
                                        resultJson = { code: 200, status: "success", message: "Navigated to youtube.", navigateUrl: redirectUrl };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "GoogleAnalytics":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('10')) {
                                        redirectUrl = this.googleConnect.getGoogleAuthUrl('googleAnalytics', encryptedState);
                                        resultJson = { code: 200, status: "success", message: "Navigated to google analytics.", navigateUrl: redirectUrl };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "Instagram":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('5')) {
                                        redirectUrl = `https://api.instagram.com/oauth/authorize/?client_id=${config.get('instagram.client_id')}&redirect_uri=${encodeURIComponent(config.get('instagram.redirect_url'))}&response_type=code`;
                                        resultJson = { code: 200, status: "success", message: "Navigated to instagram.", navigateUrl: redirectUrl, state: encryptedState };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                case "Pinterest":
                                    // Validating that the user is having permisiion for this network or not by user plan
                                    if (userScopeAvailableNetworks.includes('11')) {
                                        redirectUrl = `https://api.pinterest.com/oauth/?response_type=code&redirect_uri=${config.get('pinterest.redirect_url')}&client_id=${config.get('pinterest.client_id')}&scope=${config.get('pinterest.scopes')}`;
                                        resultJson = { code: 200, status: "success", message: "Navigated to pinterest.", navigateUrl: redirectUrl, state: encryptedState };
                                    } else
                                        throw new Error("Sorry, Requested network not available for your plan.");
                                    break;
                                default:
                                    throw new Error(`${config.get("applicationName")} supports anyone of the following. 1.Facebook, 2.FacebookPage, 3.Twitter, 4.LinkedIn, 5.LinkedInCompany, 6.Youtube, 7.GoogleAnalytics, 8.Instagram 9.Pinterest`);
                            }
                        }
                    })
                    .then(() => {
                        resolve(resultJson);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        });
    }

    scheduleNetworkPostFetching(accountId) {
        return new Promise((resolve, reject) => {
            var scheduleDate = moment().add(3, 'seconds');
            var batchId = String(moment().unix());

            var time = new Date(scheduleDate);

            this.scheduleObject = {
                accountId: accountId,
            };

            schedule.scheduleJob(batchId, time, () => {

                logger.info(`Started network posts fetching for account id: ${this.scheduleObject.accountId}`);
                this.startNetworkFeedsFetching(this.scheduleObject)
                    .catch((error) => {
                        logger.info(error.message);
                    });
            });

            logger.info("Scheduled");
            resolve();
        });
    }

    scheduleMulitNetworkPostFetching(accountIds) {
        return new Promise((resolve, reject) => {
            if (accountIds.length > 0) {
                accountIds.forEach(id => {
                    var scheduleDate = moment().add(2, 'seconds');
                    var batchId = `${id}_${String(moment().unix())}`;
                    var scheduleObject = {
                        accountId: id,
                    };
                    var time = new Date(scheduleDate);
                    schedule.scheduleJob(batchId, time, function (scheduleObject) {
                        logger.info(`Started network posts fetching for account id: ${scheduleObject.accountId}`);
                        this.startNetworkFeedsFetching(scheduleObject);
                    }.bind(this, scheduleObject));
                    logger.info("Scheduled");
                });
                resolve();
            }
            else
                reject(new Error("No accounts found"));
        });
    }

    startNetworkFeedsFetching(scheduleObject) {
        return new Promise((resolve, reject) => {

            logger.info(`Accounts : ${JSON.stringify(scheduleObject)}`);

            return socialAccount.findOne({
                where: {
                    account_id: scheduleObject.accountId
                },
                attributes: ['account_id', 'access_token', 'refresh_token', 'user_name', 'social_id', 'account_type']
            })
                .then((socialAccount) => {
                    if (!socialAccount)
                        throw new Error("Account not available for fetching posts..");
                    else {
                        var batchId = '';
                        switch (socialAccount.account_type) {
                            case 1:
                            case 2:
                            case 3:
                                var facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return this.fbConnect.getFacebookPosts(socialAccount.access_token, socialAccount.social_id, config.get('facebook_api.app_id'), config.get('facebook_api.version'))
                                    .then((response) => {
                                        batchId = response.batchId;
                                        logger.info(`Fetched Post Details ${JSON.stringify(response.feeds)}`);
                                        return facebookMongoPostModelObject.insertManyPosts(response.feeds);
                                    })
                                    .then(() => {
                                        // start media Downloader  through batch Id
                                        return;
                                    })
                                    .catch((error) => {
                                        // appInsights
                                        logger.error(`Error on fetching post details ${error.message}`);
                                        return;
                                    });
                            case 4:
                                var twitterMongoPostModelObject = new TwitterMongoPostModel();
                                return this.twtConnect.getUserTweets(socialAccount.social_id, socialAccount.access_token, socialAccount.refresh_token, socialAccount.user_name)
                                    .then((response) => {
                                        batchId = response.batchId;
                                        logger.info(`fetched count : ${response.tweets.length}`);
                                        return twitterMongoPostModelObject.insertManyPosts(response.tweets);
                                    })
                                    .then((insertedData) => {
                                        logger.info(`Element : ${JSON.stringify(insertedData)}`);
                                        // start media Downloader  through batch Id
                                        return;
                                    })
                                    .catch((error) => {
                                        // appInsights
                                        logger.error(`Error on fetching post details ${JSON.stringify(error)}`);
                                        return;
                                    });
                            case 5:
                                var instagramMongoPostModelObject = new InstagramMongoPostModel();
                                return this.instagramConnect.getInstagramFeeds(socialAccount.access_token, socialAccount.social_id, '')
                                    .then((response) => {
                                        logger.info(`fetched count : ${response.length}`);
                                        return instagramMongoPostModelObject.insertManyPosts(response)
                                            .then((result) => {
                                                return this.createOrEditLastUpdateTime(scheduleObject.accountId, socialAccount.social_id);
                                            })
                                            .catch((result) => {
                                                logger.error(`Error on saving post details : ${result}`);
                                                return;
                                            });
                                    })
                                    .catch((error) => {
                                        // appInsights
                                        logger.error(`Error on fetching post details ${error.message}`);
                                        return;
                                    });
                            case 9:
                                var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
                                return this.googleConnect.getYoutubeChannelsInfo(socialAccount.social_id, socialAccount.refresh_token)
                                    .then((response) => {
                                        logger.info(`fetched count : ${response.length}`);
                                        return youtubeMongoPostModelObject.insertManyPosts(response)
                                            .then((result) => {
                                                logger.info(`Saved post details`);
                                                return;
                                            })
                                            .catch((result) => {
                                                logger.error(`Error on saving post details : ${result}`);
                                                return;
                                            });
                                    })
                                    .catch((error) => {
                                        // appInsights
                                        logger.error(`Error on fetching post details ${error.message}`);
                                        return;
                                    });
                            case 12:
                                var instagramBusinessMongoPostModelObject = new InstagramBusinessMongoPostModel();
                                return this.fbConnect.getMediasFromInstagram(socialAccount.access_token, socialAccount.social_id)
                                    .then((response) => {
                                        logger.info(`fetched count : ${response.feeds.length}`);
                                        return instagramBusinessMongoPostModelObject.insertManyPosts(response.feeds)
                                            .then((result) => {
                                                logger.info(`Saved post details`);
                                                return;
                                            })
                                            .catch((result) => {
                                                logger.error(`Error on saving post details : ${result}`);
                                                return;
                                            });
                                    })
                                    .catch((error) => {
                                        // appInsights
                                        logger.error(`Error on fetching post details ${error.message}`);
                                        return;
                                    });
                            default:
                                logger.info(`Default account type ${socialAccount.account_type}`);
                                break;
                        }
                    }
                })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    addProfiles(userId, userName, profile) {
        logger.info(`userId: ${userId},userName: ${userName}, profile: ${JSON.stringify(profile)}`);
        var ProfileInfo = null;
        var teamDetails = null;
        return new Promise((resolve, reject) => {
            if (!profile) {
                reject(new Error("Invalid Inputs"));
            } else {
                logger.info(`profiles, ${profile}`);
                // Validating that the user is belongs to the Team or not
                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: profile.TeamId
                            }]
                        },
                        attributes: ['team_id', 'team_name']
                    }, { transaction: t })
                        .then((team) => {
                            if (team == null)
                                throw new Error("You don't have access to add the profile to team");
                            else {
                                teamDetails = team;

                                return socialAccount.findOne({
                                    where: {
                                        [Operator.and]: [{
                                            account_type: profile.Network
                                        }, {
                                            social_id: profile.SocialId
                                        }]
                                    },
                                    attributes: ['account_id']
                                });
                            }
                        })
                        .then((socialAcc) => {
                            if (socialAcc) {
                                logger.info("Account has been added already!");
                                throw new Error("Account has been added already!");
                            }
                            else {
                                // Adding/Creating account
                                logger.info("Account is addding!");
                                return socialAccount.create({
                                    account_type: profile.Network,
                                    user_name: profile.UserName,
                                    first_name: profile.FirstName,
                                    last_name: profile.LastName,
                                    email: profile.Email,
                                    social_id: profile.SocialId,
                                    profile_pic_url: profile.ProfilePicture,
                                    cover_pic_url: profile.ProfilePicture,
                                    profile_url: profile.ProfileUrl,
                                    access_token: profile.AccessToken,
                                    refresh_token: profile.RefreshToken,
                                    friendship_counts: profile.FriendCount,
                                    info: profile.Info,
                                    account_admin_id: userId
                                }, { transaction: t });
                            }
                        })
                        .then((profileDetails) => {
                            ProfileInfo = profileDetails;
                            // Setting the Account to the Team
                            return profileDetails.setTeam(teamDetails, { transaction: t, through: { is_account_locked: false } });
                        })
                        .then(() => {
                            if (ProfileInfo.account_type == 11) {
                                if (profile.Boards.length > 0) {
                                    profile.Boards.forEach(boards => {
                                        boards.social_account_id = ProfileInfo.account_id;
                                    });
                                    return pinterestBoard.bulkCreate(profile.Boards, { transaction: t, returning: true });
                                }
                                else
                                    return;
                            }
                            else
                                return;
                        })
                        .then(() => {
                            logger.info('Started fetching feeds');
                            // Started fetching feeds of the added account
                            return this.scheduleNetworkPostFetching(ProfileInfo.account_id)
                                .catch((error) => { logger.error(error.message); });
                        })
                        .then(() => {
                            if (ProfileInfo.account_type == '4' || ProfileInfo.account_type == 4) {
                                return this.twtConnect.updateSubscriptions(ProfileInfo.access_token, ProfileInfo.refresh_token, true)
                                    .catch((error) => { logger.info("ERROR"); logger.info(error.message); return; });
                            }
                        })
                        .then(() => {
                            let targetTeamsId = [];
                            targetTeamsId.push(profile.TeamId);

                            // Sending notification to the Team members saying, an account is added to the Team
                            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                            notification.notificationMessage = `${userName} added the social profiles to a ${teamDetails.team_name} team.`;
                            notification.teamName = teamDetails.team_name;
                            notification.notifyType = 'team_addProfile';
                            notification.initiatorName = userName;
                            notification.status = 'success';
                            notification.targetTeamsId = targetTeamsId;

                            return notification.saveNotifications()
                                .then((savedObject) => {
                                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                    return notification.sendTeamNotification(profile.TeamId, encryptedNotifications);
                                })
                                .catch((error) => {
                                    logger.info(`Notification not sent, ${error.message}`);
                                });
                        })
                        .then(() => {
                            resolve({ teamDetails: teamDetails, profileDetails: ProfileInfo });
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }
        });
    }

    addSocialProfile(userId, userName, queryInputs, userScopeMaxAccountCount, userScopeAvailableNetworks) {
        logger.info(`userId : ${userId}, queryInputs: ${queryInputs},userScopeMaxAccountCount:${userScopeMaxAccountCount}, userScopeAvailableNetworks:${userScopeAvailableNetworks} `);
        var ProfileCount = null;
        return new Promise((resolve, reject) => {

            // Checking the number of accounts added by the user
            return db.sequelize.transaction((t) => {
                return socialAccount.count({
                    where: { account_admin_id: userId },
                }, { transaction: t })

                    .then((count) => {
                        ProfileCount = count;
                        var planCount = userScopeMaxAccountCount;
                        // Calculating how may accounts user can add by user plan
                        var availableAccounts = planCount - ProfileCount;
                        if (availableAccounts > 0) {
                            return availableAccounts;
                        }
                        return 0;
                    })
                    .then((availableCount) => {

                        logger.info(`Available Account Count : ${availableCount} `);

                        if (availableCount == 0) {
                            reject(new Error(`Sorry, As per your plan, you can't add any more account.`));
                        }
                        else if (availableCount < 1) {
                            reject(new Error(`Sorry, As per your plan, you can now add only ${availableCount}`));
                        }
                        else {
                            var networkId = this.coreServices.networks[queryInputs.network];
                            logger.info(`networkId: ${networkId}`);

                            // Adding account and updating Friends stats
                            switch (queryInputs.network) {
                                case "Facebook":
                                    if (userScopeAvailableNetworks.includes('1')) {
                                        return this.fbConnect.addFacebookProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.fbConnect.getFbProfileStats(result.profileDetails.access_token);
                                            })
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else {
                                        reject(new Error("Not available."));
                                    }
                                    break;
                                case "Twitter":
                                    logger.info(`Entered inside twitter!`);
                                    if (userScopeAvailableNetworks.includes('4')) {
                                        var result = {};
                                        var updatedProfileDetails = {};
                                        return this.twtConnect.addTwitterProfile(networkId, queryInputs.teamId, queryInputs.requestToken, queryInputs.requestSecret, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.twtConnect.getLookupList(result.profileDetails.access_token, result.profileDetails.refresh_token, result.profileDetails.user_name);
                                            })
                                            .then((updateDetails) => {
                                                updatedProfileDetails = updateDetails;
                                                var data = {
                                                    accountId: result.profileDetails.account_id,
                                                    insights: {
                                                        followerCount: updateDetails.follower_count,
                                                        followingCount: updateDetails.following_count,
                                                        favouritesCount: updateDetails.favorite_count,
                                                        postsCount: updateDetails.total_post_count,
                                                        userMentions: updateDetails.user_mentions,
                                                        retweetCount: updateDetails.retweet_count
                                                    }
                                                };
                                                var twitterInsightPostModelObject = new TwitterInsightPostModel();
                                                return twitterInsightPostModelObject.insertInsights(data);
                                            })
                                            .then(() => {
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updatedProfileDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else {
                                        reject(new Error("Not available."));
                                    }
                                    break;
                                case "LinkedIn":
                                    if (userScopeAvailableNetworks.includes('6')) {
                                        return this.linkedInConnect.addLinkedInProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.linkedInConnect.getProfileDetails(result.profileDetails.access_token);
                                            })
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "Instagram":
                                    if (userScopeAvailableNetworks.includes('5')) {
                                        return this.instagramConnect.addInstagramProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                logger.info(`Profile details : ${JSON.stringify(profile)} `);
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.instagramConnect.getInstagramProfileInformation(result.profileDetails.access_token);
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
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "Pinterest":
                                    if (userScopeAvailableNetworks.includes('11')) {
                                        this.pinterestConnect.addPinterestProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.pinterestConnect.userDetails(result.profileDetails.user_name, result.profileDetails.access_token);
                                            })
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "LinkedInCompany":
                                    resolve({ code: 200, status: "success", responseCode: queryInputs.code, state: queryInputs.state });
                                    break;
                                case "FacebookPage":
                                case "Youtube":
                                case "GoogleAnalytics":
                                    resolve({ code: 200, status: "success", responseCode: queryInputs.code });
                                    break;
                                default:
                                    reject(new Error('Specified network is invalid.'));
                                    break;
                            }
                        }
                    });
            });
        });
    }

    addSocialProfileOld(userId, userName, queryInputs, userScopeMaxAccountCount, userScopeAvailableNetworks) {
        logger.info(`userId : ${userId}, queryInputs: ${queryInputs},userScopeMaxAccountCount:${userScopeMaxAccountCount}, userScopeAvailableNetworks:${userScopeAvailableNetworks} `);
        var ProfileCount = null;
        return new Promise((resolve, reject) => {

            return db.sequelize.transaction((t) => {
                return socialAccount.count({
                    where: { account_admin_id: userId },
                }, { transaction: t })

                    .then((count) => {
                        ProfileCount = count;
                        var planCount = userScopeMaxAccountCount;
                        var availableAccounts = planCount - ProfileCount;
                        if (availableAccounts > 0) {
                            return availableAccounts;
                        }
                        return 0;
                    })
                    .then((availableCount) => {

                        logger.info(`Available Account Count : ${availableCount} `);

                        if (availableCount == 0) {
                            reject(new Error(`Sorry, As per your plan, you can't add any more account.`));
                        }
                        else if (availableCount < 1) {
                            reject(new Error(`Sorry, As per your plan, you can now add only ${availableCount}`));
                        }
                        else {
                            var networkId = this.coreServices.networks[queryInputs.network];
                            logger.info(`networkId: ${networkId}`);

                            switch (queryInputs.network) {
                                case "Facebook":
                                    if (userScopeAvailableNetworks.includes('1')) {
                                        return this.fbConnect.addFacebookProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((result) => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else {
                                        reject(new Error("Not available."));
                                    }
                                    break;
                                case "Twitter":
                                    logger.info(`Entered inside twitter!`);
                                    if (userScopeAvailableNetworks.includes('4')) {
                                        var result = {};
                                        return this.twtConnect.addTwitterProfile(networkId, queryInputs.teamId, queryInputs.requestToken, queryInputs.requestSecret, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((response) => {
                                                result = response;
                                                return this.twtConnect.getLookupList(result.profileDetails.access_token, result.profileDetails.refresh_token, result.profileDetails.user_name);
                                            })
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(result.profileDetails.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else {
                                        reject(new Error("Not available."));
                                    }
                                    break;
                                case "LinkedIn":
                                    if (userScopeAvailableNetworks.includes('6')) {
                                        return this.linkedInConnect.addLinkedInProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((result) => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "Instagram":
                                    if (userScopeAvailableNetworks.includes('5')) {
                                        return this.instagramConnect.addInstagramProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                logger.info(`Profile details : ${JSON.stringify(profile)} `);
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((result) => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "Pinterest":
                                    if (userScopeAvailableNetworks.includes('11')) {
                                        this.pinterestConnect.addPinterestProfile(networkId, queryInputs.teamId, queryInputs.code)
                                            .then((profile) => {
                                                return this.addProfiles(userId, userName, profile);
                                            })
                                            .then((result) => {
                                                resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                                            })
                                            .catch((error) => {
                                                reject(error);
                                            });
                                    } else
                                        reject(new Error("Not available."));
                                    break;
                                case "LinkedInCompany":
                                    resolve({ code: 200, status: "success", responseCode: queryInputs.code, state: queryInputs.state });
                                    break;
                                case "FacebookPage":
                                case "Youtube":
                                case "GoogleAnalytics":
                                    resolve({ code: 200, status: "success", responseCode: queryInputs.code });
                                    break;
                                default:
                                    reject(new Error('Specified network is invalid.'));
                                    break;
                            }
                        }
                    });
            });
        });
    }

    addBulkSocialProfiles(userId, teamId, profiles, userScopeMaxAccountCount, userScopeAvailableNetworks) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !profiles || !userScopeMaxAccountCount || !userScopeAvailableNetworks) {
                reject(new Error('Invalid Inputs'));
            } else {
                var subscribeAccountsAccessTokens = [];
                var insertedAccountIdsWithType = [];
                var teamDetails = {};
                var addingSocialIds = [];
                var isErrorOnNetwork = false;
                var erroredAccountsNames = [];
                var erroredSocialProfiles = [];
                var ProfileCount = 0;
                var ProfileInfo = {};

                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        },
                        attributes: ['team_id']
                    }, { transaction: t })
                        .then((team) => {
                            if (team == null)
                                throw new Error("You don't have access to add the profile to the team");
                            else {
                                teamDetails = team;
                                addingSocialIds = [];
                                isErrorOnNetwork = false;

                                profiles.forEach(profile => {
                                    if (!isErrorOnNetwork) {
                                        if (this.coreServices.webhooksSupportedAccountType.includes(String(profile.account_type))) {
                                            var accountSubscribeDetails = {
                                                AccountType: profile.account_type,
                                                AccessToken: profile.access_token,
                                                RefreshToken: profile.refresh_token,
                                                SocialId: profile.social_id
                                            };
                                            subscribeAccountsAccessTokens.push(accountSubscribeDetails);
                                            logger.info('Added account creds for subscription..');
                                        }
                                        switch (profile.account_type) {
                                            case '2':
                                            case '3':
                                                if (!userScopeAvailableNetworks.includes('1'))
                                                    isErrorOnNetwork = true;
                                                break;
                                            case '7':
                                                if (!userScopeAvailableNetworks.includes('6'))
                                                    isErrorOnNetwork = true;
                                                break;
                                            case '1':
                                            case '4':
                                            case '5':
                                            case '6':
                                            case '9':
                                            case '10':
                                            case '12':
                                                if (!userScopeAvailableNetworks.includes(String(profile.account_type)))
                                                    isErrorOnNetwork = true;
                                                break;
                                            default:
                                                isErrorOnNetwork = true;
                                                break;
                                        }
                                        profile.account_admin_id = userId;
                                        addingSocialIds.push(profile.social_id);
                                    }
                                });
                                if (!isErrorOnNetwork) {
                                    return socialAccount.findAll({
                                        where: { social_id: addingSocialIds },
                                        attributes: ['account_id', 'social_id']
                                    });
                                }
                                else {
                                    throw new Error("Sorry, you are trying to add some invalid type of account with respect to your plan.");
                                }
                            }
                        })
                        .then((socialAcc) => {
                            erroredSocialProfiles = [];
                            socialAcc.forEach(account => {
                                erroredSocialProfiles.push(account.social_id);
                            });
                            return socialAccount.count({
                                where: { account_admin_id: userId },
                            }, { transaction: t });
                        })
                        .then((count) => {
                            ProfileCount = count;
                            var planCount = userScopeMaxAccountCount;
                            var availableAccounts = planCount - ProfileCount;
                            if (availableAccounts == 0)
                                throw new Error(`Sorry, As per your plan, you can't add any more account.`);
                            else if (availableAccounts < addingSocialIds.length)
                                throw new Error(`Sorry, As per your plan, you can now add only ${availableAccounts}`);
                            return;
                        })
                        .then(() => {
                            var filteredProfiles = profiles.filter((profile) => !erroredSocialProfiles.includes(profile.social_id));
                            return socialAccount.bulkCreate(filteredProfiles, { returning: true });
                        })
                        .then((profileDetails) => {
                            ProfileInfo = profileDetails;
                            return teamDetails.addSocialAccount(profileDetails, { transaction: t, through: { is_account_locked: false } });
                        })
                        .then(() => {
                            var insertedAccountIds = [];
                            ProfileInfo.forEach(element => {
                                insertedAccountIds.push(element.account_id);
                                insertedAccountIdsWithType.push({ account_id: element.account_id, account_type: element.account_type, access_token: element.access_token, refresh_token: element.refresh_token });
                            });
                            return this.scheduleMulitNetworkPostFetching(insertedAccountIds)
                                .catch((error) => {
                                    logger.info(JSON.stringify(error));
                                });
                        })
                        .then(() => {
                            logger.info(`Subscription count ${subscribeAccountsAccessTokens.length}`);
                            if (subscribeAccountsAccessTokens.length > 0) {
                                return Promise.all(subscribeAccountsAccessTokens.map(accountDetails => {

                                    logger.info(`Subscription started for ${accountDetails.AccountType}`);

                                    switch (accountDetails.AccountType) {
                                        case "2":
                                            logger.info(`Subscription processing for ${accountDetails.AccountType}`);
                                            return this.fbConnect.subscribeWebhooks(accountDetails.AccessToken, accountDetails.SocialId, config.get('facebook_api.page_subscription_fields'))
                                                .catch(() => { return; });
                                        case '4':
                                            return this.twtConnect.updateSubscriptions(accountDetails.AccessToken, accountDetails.RefreshToken, true)
                                                .catch(() => { return; });
                                        case '9':
                                            return this.googleConnect.updateSubscriptions(accountDetails.SocialId, true)
                                                .catch(() => { return; });
                                        case '12':
                                            return this.fbConnect.subscribeWebhooks(accountDetails.AccessToken, accountDetails.SocialId, config.get('instagram.business_subscription_fields'))
                                                .catch(() => { return; });
                                        default:
                                            break;
                                    }
                                }));
                            }
                            return;
                        })
                        .then(() => {
                            return Promise.all(insertedAccountIdsWithType.map(element => {
                                switch (String(element.account_type)) {
                                    case "2":
                                        return this.fbConnect.getFbPageStats(element.access_token)
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(element.account_id, updateDetails);
                                            })
                                            .catch(() => { return; });
                                    case "9":
                                        return this.googleConnect.getYtbChannelDetails('', element.refresh_token)
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(element.account_id, updateDetails);
                                            })
                                            .catch(() => { return; });
                                    case "12":
                                        return this.fbConnect.getInstaBusinessStats(element.access_token)
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(element.account_id, updateDetails);
                                            })
                                            .catch(() => { return; });
                                }
                            }));
                        })
                        .then(() => {
                            profiles.forEach(account => {
                                erroredSocialProfiles.forEach(accountId => {
                                    if (account.social_id == accountId)
                                        erroredAccountsNames.push(account.first_name);
                                });
                            });
                            resolve({ teamDetails: teamDetails, profileDetails: ProfileInfo, errorProfileId: erroredAccountsNames });
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                });
            }
        });
    }

    deleteSocialProfile(userId, accountId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var fetchedSocialAccount = '';
                // Validate that the account is belongs of Facebook or no
                // Fetching user social accounts
                return db.sequelize.transaction((t) => {
                    return this.getUserDetails(userId)
                        .then((userDetails) => {
                            return socialAccount.findOne({
                                where: {
                                    [Operator.and]: [{
                                        account_admin_id: userId
                                    }, {
                                        account_id: accountId
                                    }]
                                },
                                attributes: ['account_id', 'email', 'access_token', 'social_id', 'account_type', 'refresh_token']
                            })
                                .then((socialAcc) => {
                                    if (socialAcc == null)
                                        throw new Error("No such social account or Only admin that profile can delete an account!");
                                    else if (userDetails.email == socialAcc.email) {
                                        throw new Error("You can't delete this account. As this is your primary account, which you used to login to Socioboard.");
                                    }
                                    else {
                                        fetchedSocialAccount = socialAcc;
                                        var scheduleDate = moment().add(2, 'seconds');
                                        var batchId = `${socialAcc.social_id}_${String(moment().unix())}`;
                                        this.scheduleObject = {
                                            accountType: socialAcc.account_type,
                                            socialId: socialAcc.social_id,
                                            accessToken: socialAcc.access_token,
                                            refreshToken: socialAcc.refresh_token
                                        };
                                        var time = new Date(scheduleDate);

                                        schedule.scheduleJob(batchId, time, () => {
                                            logger.info(`Started network posts deleting for social id: ${this.scheduleObject.socialId}`);
                                            // Started network posts deleting for social account
                                            this.deleteAccountsMongoPosts(this.scheduleObject)
                                                .then(() => {
                                                    logger.info("Deleting process completed.");
                                                })
                                                .catch((error) => {
                                                    logger.error(error.message);
                                                });
                                        });
                                        return;
                                    }
                                })
                                .then(() => {
                                    return fetchedSocialAccount.destroy({
                                        where: { account_id: accountId }
                                    })
                                        .catch((error) => {
                                            throw new Error(error.message);
                                        });
                                })
                                .then(() => {
                                    resolve('success');
                                })
                                .catch(function (error) {
                                    reject(error);
                                });

                        })
                        .catch((error) => { reject(error); })
                });
            }
        });
    }

    deleteAccountsMongoPosts(accountDetails) {
        return new Promise((resolve, reject) => {
            logger.info(`Account Type: ${accountDetails.accountType}, Account Id : ${accountDetails.socialId}`);
            switch (accountDetails.accountType) {
                case 1:
                case 3:
                    var facebookMongoPostModelObject = new FacebookMongoPostModel();
                    facebookMongoPostModelObject.deleteAccountPosts(accountDetails.socialId);
                    break;
                case 2:
                    return this.fbConnect.unsubscribeWebhooks(accountDetails.accessToken, accountDetails.socialId)
                        .then(() => {
                            var facebookMongoPostModelObject = new FacebookMongoPostModel();
                            return facebookMongoPostModelObject.deleteAccountPosts(accountDetails.socialId);
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                case 4:
                    return this.twtConnect.updateSubscriptions(accountDetails.accessToken, accountDetails.refreshToken, false)
                        .then(() => {
                            var twitterMongoPostModelObject = new TwitterMongoPostModel();
                            twitterMongoPostModelObject.deleteAccountPosts(accountDetails.socialId);
                            return;
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                case 9:
                    return this.googleConnect.updateSubscriptions(accountDetails.socialId, false)
                        .then(() => {
                            var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
                            youtubeMongoPostModelObject.deleteAccountPosts(accountDetails.socialId);
                            return;
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                case 12:
                    return this.fbConnect.unsubscribeWebhooks(accountDetails.accessToken, accountDetails.socialId)
                        .then(() => {
                            var instagramStoryMongoModelObject = new InstagramStoryMongoModel();
                            return instagramStoryMongoModelObject.deleteAccountPosts(accountDetails.socialId);
                        })
                        .then(() => {
                            var instagramBusinessMongoPostModelObject = new InstagramBusinessMongoPostModel();
                            return instagramBusinessMongoPostModelObject.deleteAccountPosts(accountDetails.socialId);
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                default:
                    reject(new Error("Invalid Account Type"));
                    break;
            }
        });
    }

    addOtherTeamSocialProfiles(userId, teamId, accountId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !accountId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var teamDetails = {};
                // Validating user belongs to that Team or not
                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        },
                        attributes: ['team_id']
                    }, { transaction: t })
                        .then((team) => {
                            if (team == null)
                                throw new Error("You don't have access to add the profile to the team.");
                            else {
                                teamDetails = team;
                                // Finding the giver account is present in database or not
                                return socialAccount.findOne({
                                    where: {
                                        account_id: accountId
                                    },
                                    attributes: ['account_id', 'account_admin_id']
                                });
                            }
                        })
                        .then((socialAcc) => {
                            if (socialAcc && socialAcc.account_admin_id && socialAcc.account_admin_id == userId)
                                // Adding social account to the Team
                                return socialAcc.addTeam(teamDetails, { transaction: t, through: { is_account_locked: false } });
                            else
                                throw new Error("You aren't an admin for an account!");
                        })
                        .then(() => {
                            resolve('success');
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                });
            }
        });
    }

    deleteTeamSocialProfile(userId, teamId, accountId, userName) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !accountId || !userName) {
                reject(new Error('Invalid Inputs'));
            } else {
                var teamDetails = {};
                // Validating user belongs to that Team or not
                return db.sequelize.transaction((t) => {
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        },
                        attributes: ['team_id', 'team_name']
                    }, { transaction: t })
                        .then((team) => {
                            if (team == null)
                                throw new Error("You don't have access to add the profile to the team.");
                            else {
                                teamDetails = team;
                                // Finding the giver account is present in database or not
                                return socialAccount.findOne({
                                    where: {
                                        [Operator.and]: [{
                                            account_admin_id: userId
                                        }, {
                                            account_id: accountId
                                        }]
                                    },
                                    attributes: ['account_id', 'account_admin_id']
                                });
                            }
                        })
                        .then((socialAcc) => {
                            if (!socialAcc) {
                                throw new Error("Not found or You aren't an admin for an account!");
                            } else {
                                // Deleting the account from Team
                                return teamSocialAccountJoinTable.destroy({
                                    where: {
                                        [Operator.and]: [{
                                            team_id: teamId
                                        }, {
                                            account_id: accountId
                                        }]
                                    }
                                });
                            }
                        })
                        .then(() => {

                            let targetTeamsId = [];
                            targetTeamsId.push(teamId);

                            // Sending notification to the Team members saying, Social account has been deleted from the Team
                            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                            notification.notificationMessage = `${userName} removed one profile from Team.`;
                            notification.teamName = teamDetails.team_name;
                            notification.notifyType = 'team_deleteTeamSocialProfile';
                            notification.initiatorName = userName;
                            notification.status = 'success';
                            notification.targetTeamsId = targetTeamsId;

                            return notification.saveNotifications()
                                .then((savedObject) => {
                                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                    return notification.sendTeamNotification(teamId, encryptedNotifications);
                                });
                        })
                        .then(() => {
                            resolve('success');
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }
        });

    }

    leaveFromTeam(userId, teamId, userName) {

        var userTeamJoinTableInfo = {};
        logger.info(userName);
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !userName) {
                reject(new Error('Invalid Inputs'));
            } else {
                let teamName = '';
                // Validating user belongs to that Team or not
                return db.sequelize.transaction((t) => {
                    return userTeamJoinTable.findOne({
                        where: {
                            [Operator.and]: [{
                                user_id: userId
                            }, {
                                team_id: teamId
                            }
                            ]
                        },
                        attributes: ['id', 'user_id', 'team_id', 'left_from_team'],
                    }, { transaction: t })
                        .then((userTeamInfo) => {

                            if (userTeamInfo == null)
                                throw new Error("No such team or you are not a part of team!");

                            if (userTeamInfo.left_from_team == true)
                                throw new Error("You are not a part of team!");

                            userTeamJoinTableInfo = userTeamInfo;

                            return teamInfo.findOne({
                                where: { team_id: teamId },
                                attributes: ['team_id', 'team_name', 'team_admin_id']
                            }, { transaction: t });

                        })
                        .then((teamInfoResponse) => {

                            // Validating that the user is Admin or not
                            if (teamInfoResponse.team_admin_id == userId)
                                throw new Error("Admin can't leave the leave, rather delete the team!");

                            teamName = teamInfoResponse.team_name;
                            return userTeamJoinTableInfo.update({
                                left_from_team: true
                            }, { transaction: t });
                        })
                        .then(() => {
                            let targetTeamsId = [];
                            targetTeamsId.push(teamId);

                            // Sending notification to team members saying, user left from the Team
                            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                            notification.notificationMessage = `${userName} left from ${teamName} team.`;
                            notification.teamName = teamName;
                            notification.notifyType = 'team_leave';
                            notification.initiatorName = userName;
                            notification.status = 'success';
                            notification.targetTeamsId = targetTeamsId;

                            return notification.saveNotifications()
                                .then((savedObject) => {
                                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                    return notification.sendTeamNotification(profile.TeamId, encryptedNotifications);
                                })
                                .catch((error) => {
                                    logger.info(`Notification not sent, ${error.message}`);
                                });
                        })
                        .then(() => {
                            resolve('success');
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                });
            }
        });
    }

    editTeamMemberPermission(userId, teamId, memberId, permission) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !memberId || !permission) {
                reject(new Error('Invalid Inputs'));
            } else {
                return db.sequelize.transaction((t) => {

                    // Validating user belongs to that Team or not
                    return teamInfo.findOne({
                        where: {
                            [Operator.and]: [{
                                team_admin_id: userId
                            }, {
                                team_id: teamId
                            }]
                        }
                    }, { transaction: t })
                        .then((teamInfo) => {
                            if (teamInfo == null)
                                throw new Error("Team Not Found or Access Denied!");
                            else {
                                // Validating the member belongs to that Team or not
                                return userTeamJoinTable.findOne({
                                    where: {
                                        [Operator.and]: [{
                                            user_id: memberId
                                        }, {
                                            team_id: teamId
                                        }]
                                    },
                                    attributes: ['id', 'user_id', 'team_id', 'permission']
                                }, { transaction: t });
                            }
                        })
                        .then((teamProfile) => {
                            if (teamProfile == null)
                                throw new Error("No such member found!");
                            else {
                                // Updating the member permisiion
                                return teamProfile.update({
                                    permission: permission,
                                }, { transaction: t });
                            }
                        })
                        .then(() => {
                            let targetUserId = [];
                            targetUserId.push(memberId);

                            // Sending notification to the member saying, your permissions has been updated
                            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                            notification.notificationMessage = `Team Admin has changed your Team permission to ${permission == 1 ? "fullPermission" : "approvalNeeded"} `;
                            notification.teamName = teamInfo.team_name;
                            notification.notifyType = 'team_editMemberPermission';
                            notification.initiatorName = user.first_name;
                            notification.status = 'success';
                            notification.targetUserId = targetUserId;

                            return notification.saveNotifications()
                                .then((savedObject) => {
                                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                    return notification.sendUserNotification(memberId, encryptedNotifications);
                                })
                                .then(() => {
                                    resolve('success');
                                });
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                });
            }
        });
    }

    lockProfiles(userId, body) {
        return new Promise((resolve, reject) => {
            if (!userId || !body) {
                reject(new Error('Invalid Inputs'));
            } else {
                return db.sequelize.transaction(function (t) {
                    var updatedAccounts = [];
                    var erroredProfiles = [];
                    // Validating user that the accounts are belongs to user or not
                    return socialAccount.findAll({
                        where: {
                            [Operator.and]: [{
                                account_id: body
                            }, {
                                account_admin_id: userId
                            }]
                        },
                        attributes: ['account_id']
                    }, { transaction: t })
                        .then((accounts) => {
                            if (accounts.length == 0) {
                                throw new Error("Sorry, either accounts not found or you dont have access of those accounts!");
                            }
                            else {
                                accounts.forEach(account => {
                                    updatedAccounts.push(String(account.account_id));
                                });
                                erroredProfiles = lodash.pullAll(body, updatedAccounts);
                                // Locking the social account
                                return teamSocialAccountJoinTable.update({
                                    is_account_locked: 1
                                }, { where: { account_id: accounts.map(t => t.account_id) } }, { transaction: t });
                            }
                        })
                        .then(() => {
                            resolve({ updatedProfiles: updatedAccounts, errorProfiles: erroredProfiles });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        });
    }

    unlockProfilesOld(userId, body) {
        return new Promise((resolve, reject) => {
            if (!userId || !body) {
                reject(new Error('Invalid Inputs'));
            } else {
                return db.sequelize.transaction(function (t) {
                    var updatedAccounts = [];
                    var erroredProfiles = [];
                    // Validating user that the accounts are belongs to user or not
                    return socialAccount.findAll({
                        where: {
                            [Operator.and]: [{
                                account_id: body
                            }, {
                                account_admin_id: userId
                            }]
                        },
                        attributes: ['account_id']
                    }, { transaction: t })
                        .then((accounts) => {
                            if (accounts.length == 0) {
                                throw new Error("Sorry, either accounts not found or you dont have access of those accounts!");
                            }
                            else {
                                accounts.forEach(account => {
                                    updatedAccounts.push(String(account.account_id));
                                });
                                erroredProfiles = lodash.pullAll(body, updatedAccounts);
                                // Un-locking the social account
                                return teamSocialAccountJoinTable.update({
                                    is_account_locked: 0
                                }, { where: { account_id: accounts.map(t => t.account_id) } }, { transaction: t });
                            }
                        })
                        .then(() => {
                            resolve({ updatedProfiles: updatedAccounts, errorProfiles: erroredProfiles });
                        }).catch((error) => {
                            reject(error);
                        });
                });
            }
        });
    }

    unlockProfiles(userId, body, maxAccounts) {
        return new Promise((resolve, reject) => {
            if (!userId || !body || !maxAccounts) {
                reject(new Error('Invalid Inputs'));
            } else {
                var OpenAccountsCount = 0;
                // Validating user that the accounts are belongs to user or not
                return socialAccount.findAndCountAll({
                    where: { account_admin_id: userId },
                    include: [{
                        model: teamInfo,
                        as: "Team",
                        through: {
                            model: teamSocialAccountJoinTable,
                            where: { is_account_locked: 0 }
                        }
                    }],
                    raw: true
                })
                    .then((result) => {
                        return Promise.all(result.rows.map(account => {
                            if (account['Team.join_table_teams_social_accounts.is_account_locked'] == 0) {
                                OpenAccountsCount += 1;
                            }
                        }))
                            .then(() => {
                                // Validating the user plan account size
                                logger.info(`pending accounts size, OpenAccountsCount <= maxAccounts, ${OpenAccountsCount <= maxAccounts}`);
                                if (OpenAccountsCount <= maxAccounts) {
                                    return db.sequelize.transaction(function (t) {
                                        var updatedAccounts = [];
                                        var erroredProfiles = [];
                                        return socialAccount.findAll({
                                            where: {
                                                [Operator.and]: [{
                                                    account_id: body
                                                }, {
                                                    account_admin_id: userId
                                                }]
                                            },
                                            attributes: ['account_id']
                                        }, { transaction: t })
                                            .then((accounts) => {
                                                if (accounts.length == 0) {
                                                    throw new Error("Sorry, either accounts not found or you dont have access of those accounts!");
                                                }
                                                else {
                                                    accounts.forEach(account => {
                                                        updatedAccounts.push(String(account.account_id));
                                                    });
                                                    erroredProfiles = lodash.pullAll(body, updatedAccounts);
                                                    // Un-locking the social accout
                                                    return teamSocialAccountJoinTable.update({
                                                        is_account_locked: 0
                                                    }, { where: { account_id: accounts.map(t => t.account_id) } }, { transaction: t });
                                                }
                                            })
                                            .then(() => {
                                                resolve({ updatedProfiles: updatedAccounts, errorProfiles: erroredProfiles });
                                            }).catch((error) => {
                                                throw error;
                                            });
                                    });
                                }
                                else {
                                    reject(new Error("Sorry! As per your plan you can't unlock more accounts."));
                                }
                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .catch((error) => { reject(error); })
            }
        });
    }

    getTeamInsights(teamId, userId, userName, update) {

        return new Promise((resolve, reject) => {

            resolve('Sorry, we are not using this route,')

            if (!userId || !teamId || !userName) {
                reject(new Error("Invalid Inputs"));
            } else {
                var filteredTeams = null;
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
                return this.getTeamSocialAccounts(userId, teamId)
                    .then((teamSocialAccounts) => {
                        filteredTeams = teamSocialAccounts.filteredTeams;
                        teamDetails = teamSocialAccounts.teamDetails;
                        return Promise.all(filteredTeams.Team.map(function (teamResponse) {
                            return userTeamJoinTable.findAll({
                                where: {
                                    team_id: teamResponse.dataValues.team_id,
                                },
                                attributes: ['id', 'team_id', 'invitation_accepted', 'permission', 'user_id'],
                                raw: true
                            });
                        }));
                    })
                    .then((teamMembersData) => {
                        teamMembersData.forEach(element => {
                            if (element[0].invitation_accepted == true) {
                                teamMembers += 1;
                            }
                            if (element[0].invitation_accepted == false) {
                                invitedList += 1;
                            }
                        });
                        return Promise.all(teamDetails[0].map(accounts => {
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
                                        attributes: fields
                                    })
                                        .then((resultData) => {
                                            var data = resultData.toJSON();
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
                                                    SocialAccountStats.youtubeStats.push({ youTubeStats: data });
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })
                                        .catch((error) => {
                                            logger.error(error.message);
                                        });
                                }
                            }));
                        }));
                    })
                    .then(function () {
                        data = {
                            teamId: teamId,
                            insights: {
                                teamMembersCount: teamMembers,
                                invitedList: invitedList,
                                socialProfilesCount: socialProfiles,
                                SocialAccountStats: SocialAccountStats
                            }
                        };
                        updatedData = [{
                            teamMembersCount: teamMembers,
                            invitedList: invitedList,
                            socialProfilesCount: socialProfiles,
                            SocialAccountStats: SocialAccountStats

                        }];

                        var teamInsightsMongoModelObject = TeamInsightsMongoModel();
                        // insertInsights(data) then addTeamInsights(teamId, updatedData)
                        console.log('update or insert, Update status is', update);
                        if (!update || update == null || update == false)
                            return teamInsightsMongoModelObject.insertInsights(data);
                        else
                            return teamInsightsMongoModelObject.addTeamInsights(teamId, updatedData)
                    })
                    .then(() => {
                        resolve(updatedData);
                    })
                    .catch((error) => {
                        throw error;
                    });
            }
        });
    }

    createTeamInsights(teamId, userId, userName) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !userName) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.getTeamSocialAccounts(userId, teamId)
                    .then((teamInformation) => {
                        if (!teamInformation.filteredTeams)
                            throw new Error("Team not found or access denied!");
                        else
                            return this.createOrUpdateTeamReport(teamId, '');
                    })
                    .then((teamSocialAccounts) => {
                        resolve(teamSocialAccounts);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

}
module.exports = TeamLibs;
