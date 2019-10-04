const moment = require('moment');
const config = require('config');
const lodash = require('lodash');
const db = require('../../../../library/sequelize-cli/models/index');
const FacebookConnect = require('../../../../library/network/facebook');
const TwitterConnect = require('../../../../library/network/twitter');
const LinkedInConnect = require('../../../../library/network/linkedin');
const PinterestConnect = require('../../../../library/network/pinterest');
const logger = require('../../../utils/logger');

const Operator = db.Sequelize.Op;
const PublishedPost = require('../../../../library/mongoose/models/publishedposts');
const DraftPost = require('../../../../library/mongoose/models/draftedpostlists');
const AdminApprovalPost = require('../../../../library/mongoose/models/adminapprovalposts');
const TaskModel = require('../../../../library/mongoose/models/taskmodels');
const NotificationServices = require('../../../../library/utility/notifyServices');
const AuthorizeServices = require('../../../../library/utility/authorizeServices');

const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const teamUserJoinTable = db.join_table_users_teams;
const socialAccount = db.social_accounts;
const userMediaDetails = db.user_media_details;

class PublishLibs {

    constructor() {
        this.authorizeServices = new AuthorizeServices(config.get('authorize'));
        this.facebookConnect = new FacebookConnect(config.get('facebook_api'));
        this.twitterConnect = new TwitterConnect(config.get('twitter_api'));
        this.linkedInConnect = new LinkedInConnect(config.get('linkedIn_api'), config.get('profile_add_redirect_url'));
        this.pinterestConnect = new PinterestConnect(config.get('pinterest'));
    }

    saveAsDraft(publishedDetails) {
        return new Promise((resolve, reject) => {
            if (!publishedDetails) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Making post details
                var draftPost = new DraftPost(publishedDetails);
                // Saving data in draft table in mongose DB
                return draftPost.save()
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        logger.error(error);
                        reject(new Error(error.message));
                    });
            }
        });
    }

    saveAsAdminApproval(publishedDetails) {
        return new Promise((resolve, reject) => {
            if (!publishedDetails) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Making post details
                var adminApprovalPost = new AdminApprovalPost(publishedDetails);
                // Saving details in admin approval table of mongo DB
                return adminApprovalPost.save()
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        logger.error(error);
                        reject(new Error(error.message));
                    });
            }
        });
    }

    isTeamValidForUser(userId, teamId) {
        return new Promise((resolve, reject) => {
            // Checking that whether that team is belongs to the user or not
            return teamUserJoinTable.findOne({
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

    getTeamsAllAdmin(teamId) {
        return new Promise((resolve, reject) => {
            if (!teamId) {
                reject(new Error("Invalid teamId"));
            } else {
                // Fetching all users of Team whose permissions are 1 (fully granted)
                return teamUserJoinTable.findAll({
                    where: {
                        permission: 1,
                        team_id: teamId,
                        left_from_team: false
                    },
                    attributes: ['id', 'user_id']
                })
                    .then((result) => {
                        var admins = [];
                        if (result.length > 0) {
                            result.map(element => {
                                if (element.user_id) {
                                    admins.push(element.user_id);
                                }
                            });
                        }
                        resolve(admins);
                    })
                    .catch(error => reject(error));
            }
        });
    }

    publishPost(requestBody, teamId) {
        return new Promise((resolve, reject) => {
            if (!requestBody)
                reject(new Error("Invalid Inputs"));
            else if (!(requestBody.postType == "Text" || requestBody.postType == "Image" || requestBody.postType == "Link" || requestBody.postType == "Video"))
                reject(new Error('Sorry, Please check post type should be either Text or Image or Link or Video'));
            else if (requestBody.postType == "Text" && !requestBody.message)
                reject(new Error('Sorry, Please check post message!'));
            else if ((requestBody.postType == "Image" || requestBody.postType == "Video") && requestBody.mediaPaths && requestBody.mediaPaths.length <= 0)
                reject(new Error('Sorry, Please check post media urls!'));
            else if (requestBody.postType == "Link" && !requestBody.link)
                reject(new Error('Sorry, Please check share link!'));
            else if (requestBody.accountIds.length <= 0)
                reject(new Error('Sorry, Please check social accounts!'));
            else {

                // draft status
                if (requestBody.postStatus == 0) {
                    var publishedDetails = {
                        createdDate: moment.utc(),
                        postType: requestBody.postType,
                        description: requestBody.message,
                        mediaUrl: requestBody.mediaPaths,
                        shareLink: requestBody.link,
                        ownerId: requestBody.userScopeId,
                        teamId: teamId
                    };
                    return this.saveAsDraft(publishedDetails)
                        .then(() => resolve({ code: 200, status: "success", message: "Saved as draft" }))
                        .catch(error => reject(error));
                }

                // active status
                else if (requestBody.postStatus == 1) {

                    // fetching permission of the user
                    return teamUserJoinTable.findOne({
                        where: {
                            user_id: requestBody.userScopeId,
                            team_id: teamId,
                            left_from_team: 0
                        }
                    })
                        .then((result) => {

                            // validate whether user is belongs to the team
                            if (!result)
                                throw new Error("Sorry, you aren't part of the team!");

                            // if user has full permission
                            else if (result.permission == 1) {
                                var postDetails = {
                                    message: requestBody.message,
                                    mediaPath: requestBody.mediaPaths,
                                    link: requestBody.link,
                                    postType: requestBody.postType,
                                    mongoScheduleId: "Na",
                                    moduleName: "Direct Post",
                                    boardDetails: requestBody.pinBoards,
                                    ownerId: requestBody.userScopeId,
                                    ownerName: requestBody.userScopeName
                                };
                                logger.info(postDetails);

                                // publish now itself
                                return this.startPublish(postDetails, teamId, requestBody.accountIds)
                                    .then((details) => {
                                        resolve({ code: 200, status: "success", message: details.message, lockedProfiles: details.lockedProfiles, errors: details.errors });
                                    }).catch((error) => {
                                        throw error;
                                    });
                            }
                            else {
                                var publishedDetails = {
                                    createdDate: moment.utc(),
                                    postType: requestBody.postType,
                                    description: requestBody.message,
                                    mediaUrl: requestBody.mediaPaths,
                                    shareLink: requestBody.link,
                                    ownerId: requestBody.userScopeId,
                                    teamId: teamId,
                                    accountIds: requestBody.accountIds,
                                    pinBoards: requestBody.pinBoards
                                };
                                var adminApprovalMongoId = null;
                                return this.saveAsAdminApproval(publishedDetails)
                                    .then((result) => {
                                        adminApprovalMongoId = String(result.toJSON()._id);
                                        return this.getTeamsAllAdmin(teamId);
                                    })
                                    .then((result) => {
                                        if (result.length == 0)
                                            throw new Error("Cant able to fetch the team admin's!");
                                        else {
                                            var assignedUsers = [];
                                            result.map(element => {
                                                var admin = {
                                                    assignedTo: element,
                                                    assignedBy: requestBody.userScopeId,
                                                    assignedDate: moment.utc().format()
                                                };
                                                assignedUsers.push(admin);
                                            });
                                            return assignedUsers;
                                        }
                                    })
                                    .then((admins) => {
                                        var taskDetails = {
                                            teamId: teamId,
                                            ownerId: requestBody.userScopeId,
                                            taskName: 'Publishing request',
                                            taskDescription: `${requestBody.userScopeName} needs to publish a post!`,
                                            type: 2, // 0-Verify feeds, 1-Invite user, 2- Normal publish, 3-Schedule publish
                                            status: 'created', //created,  approved, rejected                       
                                            inviteEmails: '',
                                            schedulePostId: '', // for type 3 => schedule post will store on mongo scheduleposts model, once its approved from admin which will add in schedule queue.
                                            normalPostId: adminApprovalMongoId, // for type 2 => normal post content will store on draft, when its get approved from admin, it will fetch post and publish right away.
                                            createdDate: moment.utc().format(),
                                            updatedDate: moment.utc().format(),
                                            assignedUser: admins

                                        };
                                        var taskModel = new TaskModel(taskDetails);
                                        return taskModel.save();
                                    })
                                    .then(() => {
                                        let targetUserId = [];
                                        targetUserId.push(requestBody.userScopeId);

                                        // Sending notification to Team Admin saying, Need approval to publish the post
                                        var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                                        notification.notificationMessage = `${requestBody.userScopeName} asking approval to post on Social Account`;
                                        notification.teamName = teamId;
                                        notification.notifyType = 'publish_publishPosts';
                                        notification.initiatorName = requestBody.userScopeName;
                                        notification.status = 'success';
                                        notification.targetUserId = targetUserId;

                                        return notification.saveNotifications()
                                            .then((savedObject) => {
                                                var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                                                return notification.sendTeamNotification(teamId, encryptedNotifications);
                                            }).then(() => {
                                                resolve({ code: 200, status: "success", message: "Submitted a request to admin for publishing a post!" });
                                            });
                                    })
                                    .catch(error => reject(error));
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } else {
                    reject(new Error("Invalid post status!"));
                }
            }
        });
    }

    getDraftedPosts(userId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            logger.info(`${userId}, ${teamId}, ${pageId} `);
            if (!userId || !teamId || !pageId || pageId < 0) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether that team is belongs to the user or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var skip = (Number(pageId) - 1) * config.get('perPageLimit');
                        var draftPost = new DraftPost();
                        // Fetching the Drafted posts from Mongo DB
                        return draftPost.getDraftedPost(userId, teamId, skip, config.get('perPageLimit'))
                            .then((result) => {
                                resolve(result);
                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getApprovalPostStatus(userId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            logger.info(`${userId}, ${teamId}, ${pageId} `);
            if (!userId || !teamId || !pageId || pageId < 0) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether that team is belongs to the user or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var skip = (Number(pageId) - 1) * config.get('perPageLimit');
                        var adminApprovalPost = new AdminApprovalPost();
                        // Fetching the approval pending details of a Team
                        return adminApprovalPost.getAdminApprovalPost(userId, teamId, skip, config.get('perPageLimit'))
                            .then((result) => {
                                resolve(result);
                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    isUrl(url) {
        var regexp = new RegExp(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
        return regexp.test(url);
    }

    validatePinterestPosts(postDetails) {
        return new Promise((resolve, reject) => {
            if (postDetails.link && !this.isUrl(postDetails.link)) {
                reject(new Error("Invalid link in post details!"));
            } else if (postDetails.mediaPath.length <= 0 || !postDetails.mediaPath[0]) {
                reject(new Error("Invalid mediaPath details!"));
            } else {
                resolve();
            }
        });
    }

    startPublishOld(postDetails, teamId, socialAccountIds) {
        return new Promise((resolve, reject) => {
            if (!postDetails || !teamId || !socialAccountIds) {
                reject(new Error("Invalid Inputs"));
            } else {
                var lockedAccount = [];
                var errors = [];

                return Promise.all(socialAccountIds.map((accountId) => {
                    var SocialAccount = '';
                    // Checking each account that the account is present or not
                    return db.sequelize.transaction((t) => {
                        return socialAccount.findOne({
                            where: { account_id: accountId },
                        }, { transaction: t })
                            .then((socialaccount) => {
                                logger.info(`Account ID : ${accountId} and teamId : ${teamId}`);
                                SocialAccount = socialaccount;
                                // Fetching Team details of social account
                                return teamSocialAccountJoinTable.findOne({
                                    where: {
                                        [Operator.and]: [{
                                            account_id: accountId
                                        }, {
                                            team_id: teamId
                                        }]
                                    },
                                    attributes: ['id', 'account_id', 'team_id', 'is_account_locked'],
                                }, { transaction: t });
                            })

                            .then((teamDetails) => {
                                if (!teamDetails) {
                                    logger.info("TeamDetails is null!");
                                } else {
                                    if (teamDetails.is_account_locked == 1)
                                        lockedAccount.push(accountId);
                                    else {
                                        postDetails.targetId = SocialAccount.social_id;
                                        var clonedPostDetails = JSON.parse(JSON.stringify(postDetails));

                                        logger.info(`clonedPostDetails : ${JSON.stringify(clonedPostDetails)} `);

                                        // Navigating to specified network to publish the post
                                        switch (SocialAccount.account_type) {
                                            case 2:
                                            case 3:
                                                return this.publishOnFb(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, teamId);
                                            case 6:
                                            case 7:
                                                return this.publishOnLinkedIn(clonedPostDetails, SocialAccount.access_token, SocialAccount.account_type, SocialAccount.user_name);
                                            case 4:
                                                return this.publishOnTwitter(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, SocialAccount.refresh_token, teamId);
                                            case 11:
                                                return this.validatePinterestPosts(clonedPostDetails)
                                                    .then(() => {
                                                        return this.publishOnPinterest(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, SocialAccount.refresh_token, teamId);
                                                    })
                                                    .catch((error) => {
                                                        throw error;
                                                    });
                                            default:
                                                break;
                                        }
                                    }
                                }
                            })
                            .catch((error) => {
                                errors.push({ accountId: SocialAccount.account_id, firstName: SocialAccount.first_name, accountType: SocialAccount.account_type, error: error.message });
                            });
                    });

                }))

                    .then(() => {
                        var details = {
                            message: "Publishing is in process, It will take few minutes to publish.",
                            lockedProfiles: lockedAccount,
                            errors: errors
                        };
                        resolve(details);
                    }).catch((error) => {
                        logger.info(error.message);
                        var details = {
                            message: "Unable to process the publish",
                            error: errors
                        };
                        reject(details);
                    });
            }
        });
    }

    startPublish(postDetails, teamId, socialAccountIds) {
        return new Promise((resolve, reject) => {
            if (!postDetails || !teamId || !socialAccountIds) {
                reject(new Error("Invalid Inputs"));
            } else {
                var lockedAccount = [];
                var errors = [];

                return Promise.all(socialAccountIds.map((accountId) => {
                    var SocialAccount = '';
                    // Checking each account that the account is present or not
                    return socialAccount.findOne({
                        where: { account_id: accountId },
                    })
                        .then((socialaccount) => {
                            logger.info(`Account ID : ${accountId} and teamId : ${teamId}`);
                            SocialAccount = socialaccount;
                            // Fetching Team details of social account
                            return teamSocialAccountJoinTable.findOne({
                                where: {
                                    [Operator.and]: [{
                                        account_id: accountId
                                    }, {
                                        team_id: teamId
                                    }]
                                },
                                attributes: ['id', 'account_id', 'team_id', 'is_account_locked'],
                            });
                        })
                        .then((teamDetails) => {
                            if (!teamDetails) {
                                logger.info("TeamDetails is null!");
                            } else {
                                if (teamDetails.is_account_locked == 1)
                                    lockedAccount.push(accountId);
                                else {
                                    postDetails.targetId = SocialAccount.social_id;
                                    var clonedPostDetails = JSON.parse(JSON.stringify(postDetails));

                                    logger.info(`clonedPostDetails : ${JSON.stringify(clonedPostDetails)} `);

                                    // Navigating to specified network to publish the post
                                    switch (SocialAccount.account_type) {
                                        case 2:
                                        case 3:
                                            return this.publishOnFb(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, teamId);
                                        case 6:
                                        case 7:
                                            return this.publishOnLinkedIn(clonedPostDetails, SocialAccount.access_token, SocialAccount.account_type, SocialAccount.user_name);
                                        case 4:
                                            return this.publishOnTwitter(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, SocialAccount.refresh_token, teamId);
                                        case 11:
                                            return this.validatePinterestPosts(clonedPostDetails)
                                                .then(() => {
                                                    return this.publishOnPinterest(clonedPostDetails, SocialAccount.account_id, SocialAccount.access_token, SocialAccount.refresh_token, teamId);
                                                })
                                                .catch((error) => {
                                                    throw error;
                                                });
                                        default:
                                            break;
                                    }
                                }
                            }
                        })
                        .catch((error) => {
                            errors.push({ accountId: SocialAccount.account_id, firstName: SocialAccount.first_name, accountType: SocialAccount.account_type, error: error.message });
                        });
                }))

                    .then(() => {
                        var details = {
                            message: "Publishing is in process, It will take few minutes to publish.",
                            lockedProfiles: lockedAccount,
                            errors: errors
                        };
                        resolve(details);
                    }).catch((error) => {
                        logger.info(error.message);
                        var details = {
                            message: "Unable to process the publish",
                            error: errors
                        };
                        reject(details);
                    });
            }
        });
    }
    getThumbnailOfMedia(medias) {

        logger.info(`Medias: ${JSON.stringify(medias)}`);
        var updatedMedia = [];
        if (medias.length > 1) {
            updatedMedia.push(medias[0]);
        } else {
            updatedMedia = [...medias];
        }

        var mediaDetails = [];

        return Promise.all(updatedMedia.map((media) => {
            // Creating thumbnail to each media
            return userMediaDetails.findOne({
                where: {
                    media_url: media
                },
                attributes: ['id', 'thumbnail_url', 'media_url']
            })
                .then((response) => {
                    var mediaDetail = {
                        media_url: response.media_url,
                        thumbnail_url: response.thumbnail_url
                    };
                    logger.info(`\n Fetched Media : ${JSON.stringify(mediaDetail)} \n`);
                    mediaDetails.push(mediaDetail);
                });
        }))
            .then(() => {
                logger.info(`\n Media Details : ${JSON.stringify(mediaDetails)} \n`);
                if (mediaDetails.length > 0) {
                    return mediaDetails[0];
                }
                return [];
            })
            .catch(() => {
                return [];
            });
    }

    publishOnFb(postDetails, accountId, accessToken, teamId) {
        return new Promise((resolve, reject) => {
            if (!postDetails || !accountId || !accessToken || !teamId) {
                reject(new Error('Invalid Inputs'));
            } else {
                var publishedPostObject = new PublishedPost();
                return publishedPostObject.getTodayPostsCount(accountId)
                    .then((postCount) => {
                        if (postCount < config.get('facebook_api.maximum_post_per_day')) {
                            // Publishing on Facebook page with post details and account access token
                            return this.facebookConnect.publishPost(postDetails, accessToken)
                                .then((status) => {
                                    logger.info(status);
                                    // Formating the response
                                    var publishedId = status.message.id.split("_")[1];
                                    var publishedDetails = {
                                        publishedDate: moment.utc(),
                                        accountId: accountId,
                                        fullPublishContentId: postDetails.mongoScheduleId,
                                        postCategory: postDetails.moduleName,
                                        publishedContentDetails: postDetails.message,
                                        publishedMediaUrls: postDetails.mediaPath,
                                        postShareUrl: postDetails.link,
                                        PublishedId: publishedId,
                                        PublishedUrl: `https://www.facebook.com/${publishedId}`,
                                        PublishedStatus: "Success",
                                        TeamId: Number(teamId)
                                    };
                                    var publishedPost = new PublishedPost(publishedDetails);
                                    publishedPost.save();
                                    return this.teamNotificationData(teamId, postDetails, publishedDetails.PublishedUrl, "Facebook Page")
                                        .catch((error) => {
                                            throw error;
                                        });
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        } else {
                            var publishedDetails = {
                                publishedDate: moment.utc(),
                                accountId: accountId,
                                fullPublishContentId: postDetails.mongoScheduleId,
                                postCategory: postDetails.moduleName,
                                publishedContentDetails: postDetails.message,
                                publishedMediaUrls: postDetails.mediaPath,
                                postShareUrl: postDetails.link,
                                PublishedId: "Na",
                                PublishedUrl: "Na",
                                PublishedStatus: "Failed, Maximum limit reached for the day.",
                                TeamId: Number(teamId)
                            };
                            var publishedPost = new PublishedPost(publishedDetails);
                            publishedPost.save();
                        }
                        return;
                    })
                    .then(() => resolve())
                    .catch((error) => {
                        reject(error);
                    });
            }
        })

    }

    // not added team Notification.
    publishOnLinkedIn(postDetails, accessToken, accountType, userName) {

        if (postDetails.postType == 'Video') {
            // Generating thumbnail for video
            return getThumbnailOfMedia(postDetails.mediaPath)
                .then((mediaInfos) => {
                    if (accountType == 6) {
                        postDetails.mediaInfos = mediaInfos;

                        return this.linkedInConnect.publishPost('person', postDetails, accessToken);

                        // this.linkedInConnect.publishPostOnProfile(postDetails, accessToken, (status) => {
                        //     // Notify to user via socket.io
                        //     logger.info(status);

                        // });
                    }
                    else {
                        postDetails.mediaInfos = mediaInfos;

                        this.linkedInConnect.publishPostOnCompany(postDetails, accessToken, (status) => {
                            // Notify to user via socket.io
                            logger.info(status);
                        });
                    }
                }).catch((error) => {
                    logger.info(error);
                });


        } else {
            if (accountType == 6) {

                return this.linkedInConnect.publishPost('person', postDetails, accessToken, userName)
                    .then((response) => {
                        logger.info(response);
                    })
                    .catch((error) => {
                        logger.info(error);
                    });

                // this.linkedInConnect.publishPostOnProfile(postDetails, accessToken, (status) => {
                //     // Notify to user via socket.io
                //     logger.info(status);
                //     // var publishedId = status.message.id.split("_")[1];
                //     // var publishedDetails = {
                //     //     publishedDate: moment.utc(),
                //     //     accountId: accountId,
                //     //     fullPublishContentId: postDetails.mongoScheduleId,
                //     //     postCategory: postDetails.moduleName,
                //     //     publishedContentDetails: postDetails.message,
                //     //     publishedMediaUrls: postDetails.mediaPath,
                //     //     postShareUrl: postDetails.link,
                //     //     PublishedId: publishedId,
                //     //     PublishedUrl: `https://www.facebook.com/${publishedId}`,
                //     //     PublishedStatus: "Success",
                //     //     TeamId: Number(teamId)
                //     // };
                //     // var publishedPost = new PublishedPost(publishedDetails);
                //     // publishedPost.save();

                // });
            }
            else {
                this.linkedInConnect.publishPostOnCompany(postDetails, accessToken, (status) => {
                    // Notify to user via socket.io
                    logger.info(status);
                });
            }
        }
    }

    publishOnTwitter(postDetails, accountId, accessToken, refreshToken, teamId) {
        logger.info(`Started publishing on twitter`);
        logger.info(`postDetails : ${JSON.stringify(postDetails)}`);
        return new Promise((resolve, reject) => {
            var publishedDetails = {};
            var publishedPostObject = new PublishedPost();
            // Checking how many posts made
            return publishedPostObject.getTodayPostsCount(accountId)
                .then((postCount) => {
                    logger.info(`postCount : ${postCount}`);
                    // Validating the limit of twitter posts for a day
                    if (postCount < config.get('twitter_api.maximum_post_per_day')) {
                        return this.twitterConnect.publishTweets(postDetails, accessToken, refreshToken)
                            .then((status) => {
                                logger.info(status);
                                publishedDetails = {
                                    publishedDate: moment.utc(),
                                    accountId: accountId,
                                    fullPublishContentId: postDetails.mongoScheduleId,
                                    postCategory: postDetails.moduleName,
                                    publishedContentDetails: postDetails.message,
                                    publishedMediaUrls: postDetails.mediaPath,
                                    postShareUrl: postDetails.link,
                                    PublishedId: status.message.id_str,
                                    PublishedUrl: `https://twitter.com/${status.message.user.screen_name}/status/${status.message.id_str}`,
                                    PublishedStatus: "Success",
                                    TeamId: Number(teamId)
                                };
                                var publishedPost = new PublishedPost(publishedDetails);
                                return publishedPost.save();
                            })
                            .then(() => {
                                // Sending Notification to the Team saying a post is done on twitter
                                return this.teamNotificationData(teamId, postDetails, publishedDetails.PublishedUrl, "Twitter");
                            })
                            .catch((error) => {
                                logger.info(error);
                                throw error;
                            });
                    } else {
                        publishedDetails = {
                            publishedDate: moment.utc(),
                            accountId: accountId,
                            fullPublishContentId: postDetails.mongoScheduleId,
                            postCategory: postDetails.moduleName,
                            publishedContentDetails: postDetails.message,
                            publishedMediaUrls: postDetails.mediaPath,
                            postShareUrl: postDetails.link,
                            PublishedId: "Na",
                            PublishedUrl: "Na",
                            PublishedStatus: "Failed, Maximum limit reached for the day.",
                            TeamId: Number(teamId)
                        };
                        var publishedPost = new PublishedPost(publishedDetails);
                        publishedPost.save();
                    }
                    return;
                })
                .then(() => resolve())
                .catch((error) => {
                    reject(error);
                });
        });
    }

    publishOnPinterest(postDetails, accountId, accessToken, refreshToken, teamId) {
        return new Promise((resolve, reject) => {
            var publishedPostObject = new PublishedPost();
            // Fetching today post count on Pinterest
            publishedPostObject.getTodayPostsCount(accountId)
                .then((postCount) => {
                    if (postCount < config.get('pinterest.maximum_post_per_day')) {

                        var boards = lodash.filter(postDetails.boardDetails, { 'accountId': accountId, });

                        logger.info(boards);

                        return this.pinterestConnect.createPins(postDetails, boards[0].boardId, accessToken)
                            .then((response) => {
                                logger.info(`Published Details \n: ${JSON.stringify(response)}`);

                                var publishedModel = [];
                                if (response.successPublishIds.length > 0) {
                                    response.successPublishIds.forEach(publishedId => {
                                        var publishedDetails = {
                                            publishedDate: moment.utc(),
                                            accountId: accountId,
                                            fullPublishContentId: postDetails.mongoScheduleId,
                                            postCategory: postDetails.moduleName,
                                            publishedContentDetails: postDetails.message,
                                            publishedMediaUrls: postDetails.mediaPath,
                                            postShareUrl: postDetails.link,
                                            PublishedId: publishedId,
                                            PublishedUrl: `${publishedId}`,
                                            PublishedStatus: "Success",
                                            TeamId: Number(teamId)
                                        };
                                        publishedModel.push(publishedDetails);
                                        return this.teamNotificationData(teamId, postDetails, publishedDetails.PublishedUrl, "Pinterest")
                                            .catch((error) => {
                                                throw error;
                                            });
                                    });
                                }
                                if (response.failedBoards.length > 0) {
                                    response.failedBoards.forEach(boardId => {
                                        var publishedDetails = {
                                            publishedDate: moment.utc(),
                                            accountId: accountId,
                                            fullPublishContentId: postDetails.mongoScheduleId,
                                            postCategory: postDetails.moduleName,
                                            publishedContentDetails: postDetails.message,
                                            publishedMediaUrls: postDetails.mediaPath,
                                            postShareUrl: postDetails.link,
                                            PublishedId: boardId,
                                            PublishedUrl: `https://www.pinterest.com/`,
                                            PublishedStatus: "Failed, Something went wrong or You have exceeded your rate limit.",
                                            TeamId: Number(teamId)
                                        };
                                        publishedModel.push(publishedDetails);
                                    });
                                }

                                var publishedPost = new PublishedPost();
                                publishedPost.insertManyPosts(publishedModel);
                                logger.info("Completed..");

                            }).then(() => resolve())
                            .catch((error) => {
                                reject(error);
                            });
                    } else {
                        reject(new Error('Sorry, You reached maximum post limit on this network for today'))
                    }
                });
        })
    }

    teamNotificationData(teamId, postDetails, PublishedUrl, network) {
        return new Promise((resolve, reject) => {
            let targetTeamsId = [];
            targetTeamsId.push(teamId);

            // Sending notification to Team, saying a Post is publishing
            var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
            notification.notificationMessage = ` Published post on ${network},Published by ${postDetails.ownerName}, Published url is: "${PublishedUrl}"`;
            notification.teamName = teamId;
            notification.notifyType = 'publish_publishPosts';
            notification.initiatorName = postDetails.ownerName;
            notification.status = 'success';
            notification.targetTeamsId = targetTeamsId;

            // Saving notifcation
            return notification.saveNotifications()
                .then((savedObject) => {
                    var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                    // Sending notification
                    return notification.sendTeamNotification(teamId, encryptedNotifications);
                }).then(() => {
                    resolve(true)
                })
                .catch((error) => {
                    reject(error);
                })
        })
    }
}

module.exports = PublishLibs;