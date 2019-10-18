const config = require('config');
const lodash = require('lodash');

const db = require('../../../../library/sequelize-cli/models/index');
const FacebookHelper = require('../../../../library/network/facebook');
const LinkedInHelper = require('../../../../library/network/linkedin');
const GoogleHelper = require('../../../../library/network/google');
const PinterestHelper = require('../../../../library/network/pinterest');
const logger = require('../../../utils/logger');

const socialAccount = db.social_accounts;
const Operator = db.Sequelize.Op;
const pinterestBoards = db.pinterest_boards;
const accountTeamJoinTable = db.join_table_teams_social_accounts;
const userTeamJoinTable = db.join_table_users_teams;

class ProfileLibs {

    constructor() {
        this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
        this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'));
        this.googleHelper = new GoogleHelper(config.get('google_api'));
        this.pinterestHelper = new PinterestHelper(config.get('pinterest'));
    }

    getFacebookPages(code) {
        var pages = [];
        var pageIds = [];
        return new Promise((resolve, reject) => {
            if (!code) {
                reject(new Error('Invalid Inputs'));
            } else {
                return this.facebookHelper.getOwnFacebookPages(code)
                    .then((pageDetails) => {
                        logger.info(`Response: ${pageDetails}`);
                        if (!pageDetails) {
                            throw new Error('Cant able to fetch page details');
                        } else {
                            logger.info(JSON.stringify(pageDetails));
                            pageDetails.forEach(function (page) {
                                var pageObject = {
                                    pageId: page.id,
                                    pageName: page.name,
                                    accessToken: page.access_token,
                                    profilePicture: page.picture.data.url,
                                    fanCount: page.fan_count,
                                    isAlreadyAdded: false
                                };
                                pages.push(pageObject);
                                pageIds.push(page.id);
                            });
                            return;
                        }
                    })
                    .then(() => {
                        return socialAccount.findAll({
                            where: { social_id: pageIds },
                            attributes: ['account_id', 'social_id']
                        });
                    })
                    .then((matchedPages) => {
                        matchedPages.forEach(page => {
                            var matchedPage = pages.find(item => item.pageId == page.social_id);
                            matchedPage.isAlreadyAdded = true;
                        });
                        resolve({ pages: pages, availablePages: matchedPages });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    isUserMemberOfATeam(userId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking the user is belongs to the Team or not
                return userTeamJoinTable.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            team_id: teamId
                        }, {
                            [Operator.not]: {
                                left_from_team: true
                            }
                        }]
                    },
                    attributes: ['id', 'user_id', 'team_id', 'permission']
                })
                    .then((user) => {
                        resolve(user ? true : false);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    isAccountLocked(accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!accountId || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking that the account is locked or not
                return accountTeamJoinTable.findOne({
                    where: {
                        [Operator.and]: [{
                            team_id: teamId
                        }, {
                            account_id: accountId
                        }, {
                            is_account_locked: true
                        }]
                    }
                })
                    .then((accountTeamInfo) => {
                        resolve(accountTeamInfo ? true : false);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getFacebookGroups(userId, accountId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !accountId || !reject) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking whether user belongs to the Team or not
                return this.isUserMemberOfATeam(userId, teamId)
                    .then((isMember) => {
                        if (!isMember)
                            throw new Error("User is not a member of a team.");
                        return;
                    })
                    .then(() => {
                        // Checking account is locked or not
                        return this.isAccountLocked(accountId, teamId);
                    })
                    .then((result) => {
                        if (result) {
                            throw new Error("Account has been locked.");
                        } else {
                            // Fetching the social account details
                            return socialAccount.findOne({
                                where: {
                                    [Operator.and]: [{
                                        account_type: 1
                                    }, {
                                        account_id: accountId
                                    }]
                                },
                                attributes: ['account_id', 'access_token']
                            });
                        }
                    })
                    .then((socialAccount) => {
                        if (socialAccount == null)
                            throw new Error("No profile found or account isn't facebook profile.");
                        else {
                            logger.info(`access_token: ${JSON.stringify(socialAccount)}`);
                            return this.facebookHelper.userGroupDetails(socialAccount.access_token);
                        }

                    })
                    .then((groupDetails) => {
                        logger.info(`Group Details: ${JSON.stringify(groupDetails)}`);
                        var groups = [];
                        groupDetails.forEach(function (group) {
                            var groupObject = {
                                groupId: group.id,
                                groupName: group.name,
                                profilePicture: group.picture.data.url,
                            };
                            groups.push(groupObject);
                        });
                        resolve(groups);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getcompanyProfileDetails(code) {

        var companies = [];
        var companyIds = [];

        return new Promise((resolve, reject) => {
            if (!code) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching linkedin company profile details using auth code 
                return this.linkedInHelper.getCompanyProfileDetails(code)
                    .then((response) => {
                        logger.info(`Response : ${JSON.stringify(response)}`);
                        if (response.company_details && response.company_details.values) {
                            response.company_details.values.forEach(function (company) {
                                var companyObject = {
                                    companyId: company.id,
                                    companyName: company.name,
                                    accessToken: response.access_token,
                                    profileUrl: `https://www.linkedin.com/company/${company.id}`,
                                    isAlreadyAdded: false
                                };
                                companies.push(companyObject);
                                companyIds.push(company.id);
                            });

                            return socialAccount.findAll({
                                where: { social_id: companyIds },
                                attributes: ['account_id', 'social_id']
                            });
                        } else {
                            throw new Error("Cant able to get linkedin company profiles!");
                        }
                    })
                    .then((matchedPages) => {
                        matchedPages.forEach(page => {
                            var matchedPage = companies.find(item => item.pageId == page.social_id);
                            matchedPage.isAlreadyAdded = true;
                        });
                        resolve({ company: companies, availablePages: matchedPages });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getYoutubeChannels(code) {
        var channels = [];
        var channelIds = [];
        return new Promise((resolve, reject) => {

            if (!code) {
                reject(new Error("Invalid Inputs"));
            } else {

                // Fetching youtube channels with auth code
                return this.googleHelper.getYoutubeChannels(code)
                    .then((response) => {
                        var channelDetails = response.parsedBody;
                        var tokens = response.tokens;

                        if (channelDetails.items) {
                            var etag = channelDetails.etag;
                            channelDetails.items.forEach(channel => {
                                // Formating the response in a structural way
                                var channelDetails = {
                                    channelId: channel.id,
                                    channelName: channel.snippet.title,
                                    channelImage: channel.snippet.thumbnails.default.url,
                                    accessToken: tokens.access_token,
                                    refreshToken: tokens.refresh_token,
                                    info: {
                                        etag: etag,
                                        channelDescription: channel.snippet.description,
                                        publishedDate: channel.snippet.publishedAt
                                    },
                                    friendshipCount: {
                                        viewCount: channel.statistics.viewCount,
                                        commentCount: channel.statistics.commentCount,
                                        subscriberCount: channel.statistics.subscriberCount ? channel.statistics.subscriberCount : 0,
                                        videoCount: channel.statistics.videoCount,
                                        hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount
                                    }
                                };
                                channelIds.push(channel.id);
                                channels.push(channelDetails);
                            });

                            return socialAccount.findAll({
                                where: { social_id: channelIds },
                                attributes: ['account_id', 'social_id']
                            });

                        }
                        return null;
                    })
                    .then((matchedChannels) => {
                        if (matchedChannels) {
                            matchedChannels.forEach(channel => {
                                var matchedChannel = channels.find(item => item.channelId == channel.social_id);
                                matchedChannel.isAlreadyAdded = true;
                            });
                            resolve({ channels: channels, availableChannels: matchedChannels });
                        } else {
                            reject(new Error("Something went wrong"));
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getGoogleAnalyticAccounts(code) {
        var AnalyticAccounts = [];
        return new Promise((resolve, reject) => {
            if (!code) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.googleHelper.getGoogleAnalyticsAccount(code)
                    .then((response) => {
                        var googleAccountDetails = response.parsedBody;
                        var tokens = response.tokens;
                        var profileId = [];

                        if (googleAccountDetails.items) {
                            var email = googleAccountDetails.username;
                            googleAccountDetails.items.forEach(account => {
                                var accountId = account.id;
                                var accountName = account.name;
                                account.webProperties.forEach(webProperty => {

                                    var info = {
                                        internalWebPropertyId: webProperty.internalWebPropertyId,
                                        accountWebId: webProperty.id,
                                    };

                                    var analyticAccount = {
                                        email: email,
                                        userName: accountId,
                                        lastName: accountName,
                                        firstName: webProperty.name,
                                        profileUrl: webProperty.websiteUrl,
                                        socialId: webProperty.profiles[0].id,
                                        info: JSON.stringify(info),
                                        accessToken: tokens.access_token,
                                        refreshToken: tokens.refresh_token,
                                    };
                                    profileId.push(analyticAccount.socialId);
                                    AnalyticAccounts.push(analyticAccount);
                                });
                            });

                            return socialAccount.findAll({
                                where: { social_id: profileId },
                                attributes: ['account_id', 'social_id']
                            });
                        }
                        return null;
                    })
                    .then((matchedProfiles) => {
                        if (matchedProfiles) {
                            matchedProfiles.forEach(profile => {
                                var matchedProfile = AnalyticAccounts.find(item => item.socialId == profile.social_id);
                                matchedProfile.isAlreadyAdded = true;
                            });
                            resolve({ AnalyticAccounts: AnalyticAccounts, availableAccounts: matchedProfiles });
                        } else
                            reject(new Error("Something went wrong"));
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getNewBoards(accountId, access_token) {
        return new Promise((resolve, reject) => {
            var dbBoards = [];
            var newBoards = [];
            var deletedBoardIds = [];
            var responseBoardIds = [];
            var response = {};

            if (!accountId || !access_token) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching pinterest Boards.
                this.pinterestHelper.getBoards(access_token)
                    .then((result) => {
                        response = result;
                        return pinterestBoards.findAll({
                            where: { social_account_id: accountId },
                            attributes: ['id', 'board_id']
                        });
                    })
                    .then((boards) => {
                        boards.forEach((board) => {
                            dbBoards.push(board.board_id);
                        });

                        response.forEach((board) => {
                            responseBoardIds.push(board.board_id);
                        });

                        var intersectBoards = lodash.intersection(dbBoards, responseBoardIds);

                        if (responseBoardIds.length > 0)
                            deletedBoardIds = lodash.filter(dbBoards, function (boardId) { return !intersectBoards.includes(boardId); });
                        return;
                    })
                    .then(() => {
                        response.forEach((board) => {
                            if (!dbBoards.includes(board.board_id)) {
                                board.social_account_id = accountId;
                                newBoards.push(board);
                            }
                        });
                        return;
                    })
                    .then(() => {
                        if (deletedBoardIds.length > 0)
                            return pinterestBoards.destroy({ where: { board_id: deletedBoardIds } });
                        return;
                    })
                    .then(() => {
                        if (newBoards.length > 0)
                            // Inserting Boards into DB
                            return pinterestBoards.bulkCreate(newBoards, { returning: true });
                        else
                            return;
                    })
                    .then(() => {
                        // Fetching all board details of that account
                        return pinterestBoards.findAll({
                            where: { social_account_id: accountId }
                        });
                    })
                    .then((boards) => {
                        resolve({ code: 200, status: 'success', boards: boards });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    createPinterestBoards(accountId, boardName, boardDescription) {
        return new Promise((resolve, reject) => {
            var accessToken = {};
            if (!accountId || !boardName || !boardDescription) {
                reject(new Error("Invalid Inputs"));
            }
            else {
                // Getting pinterest account
                this.getSocialAccountInfo(accountId)
                    .then((socialAccounts) => {
                        if (!socialAccounts)
                            throw new Error("Sorry, The requested account not found.");
                        else {
                            accessToken = socialAccounts.access_token;
                            // Creating Board with the account access token
                            return this.pinterestHelper.createBoard(socialAccounts.access_token, boardName, boardDescription);
                        }
                    })
                    .then((response) => {
                        if (response.data) {
                            var boardName = String(response.data.url).replace('https://www.pinterest.com/', '');
                            logger.info(`Board Name : ${boardName}`);
                            if (typeof boardName == 'string')
                                return this.pinterestHelper.getBoardDetails(accessToken, boardName);
                            else
                                throw new Error("Sorry, Something went wrong.");
                        } else {
                            if (response.toString().includes('DuplicateBoardSlugException'))
                                throw new Error('Duplicate board!');
                            else {
                                // Invalid board name.
                                // { message: 'Invalid board name.', type: 'api' }
                                // throw new Error(JSON.stringify(response));
                                if (response.message.includes('Invalid board name.'))
                                    throw new Error('Please check, requested board is already created.');
                                else
                                    throw new Error('Your rate limit is exceeded. Try after 1 Hour');
                            }
                            //throw new Error('Please check requested board is already created.');
                        }
                    })
                    .then((boardInfo) => {
                        if (!boardInfo)
                            throw new Error("Cant able to create boards");
                        else {
                            boardInfo.social_account_id = accountId;
                            // Adding the Board data into DB
                            return pinterestBoards.create(boardInfo);
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

    deletePinterestBoards(accountId, boardId) {
        return new Promise((resolve, reject) => {
            var RequestedSocialAccount = {};
            var id = {};
            if (!accountId || !boardId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.getSocialAccountInfo(accountId)
                    .then((socialAccounts) => {
                        RequestedSocialAccount = socialAccounts;
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
                    .then((response) => {
                        if (!response)
                            throw new Error("Sorry, Requested account Id and board Id doesnt match.");
                        else {
                            id = response.id;
                            var boardName = String(response.board_url).replace('https://www.pinterest.com/', '');
                            return this.pinterestHelper.deleteBoards(RequestedSocialAccount.access_token, boardName);
                        }
                    })
                    .then((response) => {
                        if (response.message) {
                            throw new Error(response.message);
                        } else
                            return pinterestBoards.destroy({ where: { id: id } });
                    })
                    .then(() => {
                        resolve('Deleted successfully');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getInstaBusinessAccount(code) {
        return new Promise((resolve, reject) => {
            var instagramAccounts = [];
            var instagramIds = [];
            var instagramAddedPages = [];
            if (!code) {
                reject(new Error("Invalid Inputs"));
            } else {

                // Fetching instagram business accounts (linked with Facebook)
                this.facebookHelper.getPagesConnectWithInsta(code)
                    .then((pageDetails) => {
                        logger.info(`Page Details: ${JSON.stringify(pageDetails)}`);
                        if (pageDetails.data) {
                            return Promise.all(pageDetails.data.map((page) => {
                                if (page.connected_instagram_account && page.connected_instagram_account.id) {
                                    var pageObject = {
                                        pageId: page.id,
                                        social_id: page.connected_instagram_account.id,
                                        accessToken: page.access_token,
                                    };
                                    instagramAddedPages.push(pageObject);
                                }
                            }));
                        }
                    })
                    .then(() => {
                        logger.info(`Added Instagram Pages : ${JSON.stringify(instagramAddedPages)}`);

                        return Promise.all(instagramAddedPages.map(businessAccount => {
                            // Getting instagram business profile details
                            return this.facebookHelper.getInstaBusinessAccount(businessAccount.accessToken)
                                .then((instaAccounts) => {
                                    logger.info(`Response Instagram Info : ${JSON.stringify(instaAccounts)}`);

                                    var business_accountId = "";

                                    if (instaAccounts.connected_instagram_account && instaAccounts.connected_instagram_account.id) {
                                        business_accountId = instaAccounts.connected_instagram_account.id;
                                    }
                                    return Promise.all(instaAccounts.instagram_accounts.data.map((profile) => {
                                        // Formating the result/profile response
                                        var instaAcc = {
                                            userName: profile.username,
                                            social_id: business_accountId,
                                            businessAccountId: business_accountId,
                                            accessToken: businessAccount.accessToken,
                                            info: {
                                                instagram_id: profile.id,
                                                follow_count: profile.follow_count,
                                                followed_by_count: profile.followed_by_count,
                                                has_profile_picture: profile.has_profile_picture,
                                                media_count: profile.media_count,
                                                is_private: profile.is_private,
                                                is_published: profile.is_published
                                            },
                                            profile_pic: profile.profile_pic ? profile.profile_pic : "",
                                            fanCount: profile.followed_by_count,
                                            isAlreadyAdded: false
                                        };

                                        logger.info(`Insta Account-- ${instaAcc} `);

                                        instagramAccounts.push(instaAcc);
                                        instagramIds.push(instaAcc.social_id);
                                    }))
                                        .catch((error) => {
                                            logger.info(`Error on fetching insta profiles by fb pages. Message: ${error}`);
                                        });
                                })
                                .catch((error) => {
                                    logger.info(`Error on fetching insta profiles by fb pages.Message: ${error}`);
                                });
                        }));
                    })
                    .then(() => {
                        return socialAccount.findAll({
                            where: { social_id: instagramIds },
                            attributes: ['account_id', 'social_id']
                        });
                    })
                    .then((matchedPages) => {
                        matchedPages.forEach(page => {
                            var matchedPage = instagramAccounts.find(item => item.social_id == page.social_id);
                            matchedPage.isAlreadyAdded = true;
                        });
                        resolve({ pages: instagramAccounts, availablePages: matchedPages });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getSocialAccountInfo(accountId) {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching a specified social account
                return socialAccount.findOne({
                    where: { account_id: accountId },
                })
                    .then((socialAccounts) => {
                        if (!socialAccounts) {
                            throw new Error("Sorry, The requested account not found.");
                        }
                        resolve(socialAccounts.toJSON());
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getOwnFacebookGroups(code) {
        var groups = [];
        var groupIds = [];
        return new Promise((resolve, reject) => {
            if (!code) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching Facebook groups from facebook with auth code
                this.facebookHelper.getOwnFacebookGroups(code)
                    .then((groupInfo) => {
                        if (groupInfo.groupDetails) {
                            groupInfo.groupDetails.forEach(function (group) {
                                if (group.administrator) {
                                    var groupObject = {
                                        groupId: group.id,
                                        groupName: group.name,
                                        accessToken: groupInfo.accessToken,
                                        profilePicture: group.picture.data.url,
                                        memberCount: group.member_count,
                                        isAlreadyAdded: false
                                    };
                                    groups.push(groupObject);
                                    groupIds.push(group.id);
                                }
                            });

                            return socialAccount.findAll({
                                where: { social_id: groupIds },
                                attributes: ['account_id', 'social_id']
                            });
                        } else {
                            throw new Error("Cant able to fetch group information");
                        }
                    })
                    .then((matchedGroups) => {
                        matchedGroups.forEach(page => {
                            var matchedPage = groups.find(item => item.groupId == page.social_id);
                            matchedPage.isAlreadyAdded = true;
                        });
                        resolve({ groups: groups, availableGroups: matchedGroups });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}
module.exports = ProfileLibs;




