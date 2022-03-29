import moment from 'moment';
import config from 'config';
import db from '../Sequelize-cli/models/index.js';
import TeamReportModel from './team-report.model.js';
import AuthorizeServices from '../Services/authorize.services.js';
import FacebookConnect from '../Cluster/facebook.cluster.js';
import TwitterConnect from '../Cluster/twitter.cluster.js';
import LinkedInConnect from '../Cluster/linkedin.cluster.js';
import PinterestConnect from '../Cluster/pinterest.newcluster.js';
import PublishedPost from '../Mongoose/models/published-posts.js';
import DraftPost from '../Mongoose/models/drafted-post-lists.js';
import AdminApprovalPost from '../Mongoose/models/admin-approval-posts.js';
import TaskModel from '../Mongoose/models/task-models.js';
import logger from '../../Publish/resources/Log/logger.log.js';
import NotificationServices from '../Shared/notify-services.js';
import {reject} from 'async';
import tumblrCluster from '../Cluster/tumblr.cluster.js';
import sizeOf from 'image-size';
import  getMediaDimensions from 'get-media-dimensions';
import fs from 'fs';

const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const teamUserJoinTable = db.join_table_users_teams;
const socialAccount = db.social_accounts;
const userMediaDetails = db.user_media_details;
const Operator = db.Sequelize.Op;
import lodash from 'lodash';
const teamReportModel = new TeamReportModel();
class PublishModel {
  constructor() {
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.facebookConnect = new FacebookConnect(config.get('facebook_api'));
    this.twitterConnect = new TwitterConnect(config.get('twitter_api'));
    this.linkedInConnect = new LinkedInConnect(
      config.get('linkedIn_api'),
      config.get('profile_add_redirect_url')
    );
    this.pinterestConnect = new PinterestConnect(config.get('pinterest'));
  }

  async publishPost(requestBody, teamId, lang) {
    return new Promise((resolve, reject) => {
      if (!requestBody) reject(new Error('Invalid Inputs'));
      if (!teamId) reject(new Error('TeamId cant be empty'));
      else if (
        !(
          requestBody.postType == 'Text' ||
          requestBody.postType == 'Image' ||
          requestBody.postType == 'Link' ||
          requestBody.postType == 'Video'
        )
      )
        reject(
          new Error(
            'Sorry, please check your post type which should be either text, image, link or video'
          )
        );
      else if (requestBody.postType == 'Text' && !requestBody.message)
        reject(new Error('Sorry, please check the posted message!'));
      else if (
        (requestBody.postType == 'Image' || requestBody.postType == 'Video') &&
        requestBody.mediaPaths &&
        requestBody.mediaPaths.length <= 0
      )
        reject(new Error('Sorry, please check the media urls!'));
      else if (requestBody.postType == 'Link' && !requestBody.link)
        reject(new Error('Sorry, please check the post link!'));
      else if (requestBody.accountIds.length <= 0)
        reject(new Error('Sorry, please check social accounts!'));
      else {
        // draft status
        if (requestBody.postStatus == 0) {
          const publishedDetails = {
            createdDate: moment.utc(),
            postType: requestBody.postType,
            description: requestBody.message,
            mediaUrl: requestBody.mediaPaths,
            accountIds: requestBody.accountIds,
            shareLink: requestBody.link,
            ownerId: requestBody.userScopeId,
            teamId,
          };

          return this.saveAsDraft(publishedDetails)
            .then(() =>
              resolve({code: 200, status: 'Success', message: 'Saved as draft'})
            )
            .catch(error => reject(error));
        }

        // active status
        if (requestBody.postStatus == 1) {
          // fetching permission of the user
          return teamUserJoinTable
            .findOne({
              where: {
                user_id: requestBody.userScopeId,
                team_id: teamId,
                left_from_team: 0,
              },
            })
            .then(result => {
              // validate whether user is belongs to the team
              if (!result) reject(new Error("User don't have any team!"));
              // if user has full permission
              else if (result.permission == 1 || result.permission == 2) {
                const postDetails = {
                  message: requestBody.message,
                  mediaPath: requestBody.mediaPaths,
                  link: requestBody.link,
                  postType: requestBody.postType,
                  mongoScheduleId: 'Na',
                  moduleName: 'Direct Post',
                  boardDetails: requestBody.pinBoards,
                  ownerId: requestBody.userScopeId,
                  ownerName: requestBody.userScopeName,
                };

                logger.info(postDetails);

                // publish now itself
                return this.startPublish(
                  postDetails,
                  teamId,
                  requestBody.accountIds,
                  lang
                )
                  .then(details => {
                    resolve({
                      code: 200,
                      status: 'success',
                      message: details.message,
                      data: {
                        lockedProfiles: details.lockedProfiles,
                        errors: details.errors,
                      },
                    });
                  })
                  .catch(error => {
                    throw error;
                  });
              } else {
                const publishedDetails = {
                  createdDate: moment.utc(),
                  postType: requestBody.postType,
                  description: requestBody.message,
                  mediaUrl: requestBody.mediaPaths,
                  shareLink: requestBody.link,
                  ownerId: requestBody.userScopeId,
                  teamId,
                  accountIds: requestBody.accountIds,
                  pinBoards: requestBody.pinBoards,
                };
                let adminApprovalMongoId = null;

                return (
                  this.saveAsAdminApproval(publishedDetails)
                    .then(result => {
                      adminApprovalMongoId = String(result.toJSON()._id);

                      return this.getTeamsAllAdmin(teamId);
                    })
                    .then(result => {
                      if (result.length == 0)
                        throw new Error("Cant able to fetch the team admin's!");
                      else {
                        const assignedUsers = [];

                        result.map(element => {
                          const admin = {
                            assignedTo: element,
                            assignedBy: requestBody.userScopeId,
                            assignedDate: moment.utc().format(),
                          };

                          assignedUsers.push(admin);
                        });

                        return assignedUsers;
                      }
                    })
                    .then(admins => {
                      const taskDetails = {
                        teamId,
                        ownerId: requestBody.userScopeId,
                        taskName: 'Publishing request',
                        taskDescription: `${requestBody.userScopeName} needs to publish a post!`,
                        type: 2, // 0-Verify feeds, 1-Invite user, 2- Normal publish, 3-Schedule publish
                        status: 'created', // created,  approved, rejected
                        inviteEmails: '',
                        schedulePostId: '', // for type 3 => schedule post will store on mongo scheduleposts model, once its approved from admin which will add in schedule queue.
                        normalPostId: adminApprovalMongoId, // for type 2 => normal post content will store on draft, when its get approved from admin, it will fetch post and publish right away.
                        createdDate: moment.utc().format(),
                        updatedDate: moment.utc().format(),
                        assignedUser: admins,
                      };
                      const taskModel = new TaskModel(taskDetails);

                      return taskModel.save();
                    })
                    // .then(() => {
                    //     let targetUserId = [];
                    //     targetUserId.push(requestBody.userScopeId);

                    //     var notification = new NotificationServices(config.get('notification_socioboard.host_url'));
                    //     notification.notificationMessage = `${requestBody.userScopeName} asking approval to post on Social Account`;
                    //     notification.teamName = teamId;
                    //     notification.notifyType = 'publish_publishPosts';
                    //     notification.initiatorName = requestBody.userScopeName;
                    //     notification.status = 'success';
                    //     notification.targetUserId = targetUserId;

                    //     return notification.saveNotifications()
                    //         .then((savedObject) => {
                    //             var encryptedNotifications = this.authorizeServices.encrypt(JSON.stringify(savedObject));
                    //             return notification.sendTeamNotification(teamId, encryptedNotifications);
                    // })
                    .then(() => {
                      resolve({
                        code: 200,
                        status: 'success',
                        message:
                          'Submitted a request to admin for publishing a post!',
                      });
                      // });
                    })
                    .catch(error => reject(error))
                );
              }
            })
            .catch(error => {
              reject(error);
            });
        }
        reject(new Error('Invalid post status!'));
      }
    });
  }

  startPublish(postDetails, teamId, socialAccountIds, lang) {
    return new Promise(async (resolve, reject) => {
      if (!postDetails || !teamId || !socialAccountIds) {
        reject(new Error('Invalid Input'));
      } else {
        const lockedAccount = [];
        const errors = [];

        try {
          await Promise.all(
            socialAccountIds.map(accountId => {
              let SocialAccount = '';

              return db.sequelize.transaction(t =>
                socialAccount
                  .findOne(
                    {
                      where: {account_id: accountId},
                    },
                    {transaction: t}
                  )

                  .then(socialaccount => {
                    logger.info(
                      `Account ID : ${accountId} and teamId : ${teamId}`
                    );
                    if (!socialAccount)
                      return reject({message: 'No social Account found'});

                    //const invite = socialaccount?.is_invite;

                    // if (invite == 1) {
                    //   logger.error({
                    //     message: 'Publish is denied for Invite User!! ',
                    //   });

                    //   return reject({
                    //     message: 'Publish is denied for Invite User!!',
                    //   });
                    // }
                    SocialAccount = socialaccount;

                    return teamSocialAccountJoinTable.findOne(
                      {
                        where: {
                          [Operator.and]: [
                            {
                              account_id: accountId,
                            },
                            {
                              team_id: teamId,
                            },
                          ],
                        },
                        attributes: [
                          'id',
                          'account_id',
                          'team_id',
                          'is_account_locked',
                        ],
                      },
                      {transaction: t}
                    );
                  })

                  .then(async teamDetails => {
                    if (!teamDetails) {
                      logger.info('TeamDetails is null!');
                    } else if (teamDetails.is_account_locked == 1)
                      lockedAccount.push(accountId);
                    else {
                      postDetails.targetId = SocialAccount.social_id;
                      const clonedPostDetails = JSON.parse(
                        JSON.stringify(postDetails)
                      );

                      logger.info(
                        `clonedPostDetails : ${JSON.stringify(
                          clonedPostDetails
                        )} `
                      );

                      switch (SocialAccount.account_type) {
                        case 2:
                        case 3:
                          return this.publishOnFb(
                            clonedPostDetails,
                            SocialAccount.account_id,
                            SocialAccount.access_token,
                            teamId
                          );
                        case 6:
                        case 7:
                          return this.publishOnLinkedIn(
                            clonedPostDetails,
                            SocialAccount.access_token,
                            SocialAccount.account_type,
                            SocialAccount.user_name,
                            teamId,
                            SocialAccount.account_id
                          );
                        case 4:
                          return this.publishOnTwitter(
                            clonedPostDetails,
                            SocialAccount.account_id,
                            SocialAccount.access_token,
                            SocialAccount.refresh_token,
                            teamId
                          );
                        case 11:
                          this.publishOnPinterest(
                            clonedPostDetails,
                            SocialAccount.account_id,
                            SocialAccount.access_token,
                            SocialAccount.refresh_token,
                            teamId
                          );
                          break;
                        case 12:
                           if(clonedPostDetails.postType == "Image"){
                            let base_image =config.get(`insta_base_path`) +clonedPostDetails.mediaPath[0];
                            const dimensions = sizeOf(base_image);
                            if (dimensions.width != dimensions.height) {
                            throw new Error('Instagram Post Image Resolution should be 1:1');
                          }}
                          else if(clonedPostDetails.postType == "Video"){
                             let base_video=config.get(`insta_media_url`) + clonedPostDetails.mediaPath[0];
                             let ratios = await getMediaDimensions(base_video,'video')
                             let aspectRatio=ratios.height /ratios.width;
                              logger.info(`video width=>${ratios.width}\n video height =>${ratios.height}\n and Aspect ratio=> ${aspectRatio}`)
                              if(aspectRatio <= 0.8 || aspectRatio >= 1.77){
                              throw new Error('Instagram Video aspect ratio should be  between 4/5 to 16/9');
                             }
                             let videoFile= config.get('insta_base_path')+clonedPostDetails.mediaPath[0];
                             const stats = fs.statSync(videoFile);
                             const fileSizeInBytes = stats.size;
                             const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
                             logger.info(`Instagram Video Size in MB ${fileSizeInMegabytes}`)
                             if(fileSizeInMegabytes>100){
                               throw new Error('Instagram Video File size should be within 100MB');
                             }     
                         }
                         else{
                          throw new Error('Instagram PostType is Invalid ');
                          }
                         return this.publishonInsta(
                            clonedPostDetails,
                            SocialAccount.account_id,
                            SocialAccount.access_token,
                            teamId,
                            SocialAccount.social_id
                          );
                        case 16:
                          return this.publishOnTumblr(
                            clonedPostDetails,
                            SocialAccount.account_id,
                            SocialAccount.access_token,
                            SocialAccount.refresh_token,
                            teamId,
                            SocialAccount.social_id,
                            SocialAccount.profile_url
                          );
                        default:
                          break;
                      }
                    }
                  })
                  .catch(error_1 => {
                    errors.push({
                      accountId: SocialAccount.account_id,
                      firstName: SocialAccount.first_name,
                      accountType: SocialAccount.account_type,
                      error: error_1.message,
                    });
                  })
              );
            })
          );
          const details = {
            message:
              'Publishing is in process, It will take few minutes to publish.',
            lockedProfiles: lockedAccount,
            errors,
          };

          resolve(details);
        } catch (error_2) {
          logger.info(error_2.message);
          const details_1 = {
            message:
              error_2?.message[0].message || 'Unable to process the publish',
            error: errors,
          };

          reject(details_1);
        }
      }
    });
  }

  getDraftedPosts(userId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      logger.info(`${userId}, ${teamId}, ${pageId} `);
      if (!userId || !teamId || !pageId || pageId < 0) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => {
            const skip = (Number(pageId) - 1) * config.get('perPageLimit');
            const draftPost = new DraftPost();

            return draftPost
              .getDraftedPost(userId, teamId, skip, config.get('perPageLimit'))
              .then(result => {
                resolve(result);
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getDraftPostById(id) {
    const draftPost = new DraftPost();
    const res = await draftPost.getPostsById(id);

    return res;
  }

  async updateDraftPostById(id, post) {
    const draftPost = new DraftPost();
    const update = await draftPost.insertManyPosts(post, id);
    const res = await draftPost.getPostsById(id);

    return res;
  }

  async deleteDraftPostById(id) {
    const draftPost = new DraftPost();
    const update = await draftPost.deleteDraftPostById(id);

    return update;
  }

  async deleteApprovalPostById(id) {
    const adminApprovalPost = new AdminApprovalPost();
    const update = await adminApprovalPost.deleteApprovalPostById(id);

    return update;
  }

  async getApprovalPostById(id) {
    const adminApprovalPost = new AdminApprovalPost();
    const res = await adminApprovalPost.getPostsById(id);

    return res;
  }

  saveAsDraft(publishedDetails) {
    return new Promise((resolve, reject) => {
      if (!publishedDetails) {
        reject(new Error('Invalid Inputs'));
      } else {
        const draftPost = new DraftPost(publishedDetails);

        return draftPost
          .save()
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            logger.error(error);
            reject(new Error(error.message));
          });
      }
    });
  }

  isTeamValidForUser(userId, teamId) {
    return new Promise((resolve, reject) =>
      teamUserJoinTable
        .findOne({
          where: {
            user_id: userId,
            team_id: teamId,
            left_from_team: false,
          },
          attributes: ['id', 'user_id'],
        })
        .then(result => {
          if (result) resolve();
          else throw new Error('User not belongs to the team!');
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  async publishOnFb(postDetails, accountId, accessToken, teamId) {
    const publishedPostObject = new PublishedPost();

    try {
      await publishedPostObject
        .getTodayPostsCount(accountId)
        .then(postCount => {
          if (postCount < config.get('facebook_api.maximum_post_per_day')) {
            this.facebookConnect
              .publishPost(postDetails, accessToken, status => {
                logger.info(status);
                if (status.code == 200) {
                  const publishedId = status.message.id.split('_')[1];
                  var publishedDetails = {
                    publishedDate: moment.utc(),
                    accountId,
                    fullPublishContentId: postDetails.mongoScheduleId,
                    postCategory: postDetails.moduleName,
                    publishedContentDetails: postDetails.message,
                    publishedMediaUrls: postDetails.mediaPath,
                    postShareUrl: postDetails.link,
                    PublishedId: publishedId,
                    PublishedUrl: `https://www.facebook.com/${publishedId}`,
                    PublishedStatus: 'Success',
                    TeamId: Number(teamId),
                  };
                  const publishedPost = new PublishedPost(publishedDetails);

                  publishedPost.save();
                } else {
                  publishedDetails = {
                    publishedDate: moment.utc(),
                    accountId,
                    fullPublishContentId: postDetails.mongoScheduleId,
                    postCategory: postDetails.moduleName,
                    publishedContentDetails: postDetails.message,
                    publishedMediaUrls: postDetails.mediaPath,
                    postShareUrl: postDetails.link,
                    PublishedId: moment().valueOf(),
                    PublishedUrl: '',
                    PublishedStatus: `Failed ${status.message.error.message}`,
                    TeamId: Number(teamId),
                  };
                  const publishedPost = new PublishedPost(publishedDetails);
                  publishedPost.save();
                }
                if (config.get('notification_socioboard.status') == 'on') {
                  return this.teamNotificationData(
                    teamId,
                    postDetails,
                    publishedDetails.PublishedUrl,
                    'Facebook Page',
                    publishedDetails?.PublishedStatus.replace('Failed ', '')
                  ).catch(error => {});
                }
              })
              .catch(error => error);
          } else {
            const publishedDetails = {
              publishedDate: moment.utc(),
              accountId,
              fullPublishContentId: postDetails.mongoScheduleId,
              postCategory: postDetails.moduleName,
              publishedContentDetails: postDetails.message,
              publishedMediaUrls: postDetails.mediaPath,
              postShareUrl: postDetails.link,
              PublishedId: 'Na',
              PublishedUrl: 'Na',
              PublishedStatus: 'Failed, Maximum limit reached for the day.',
              TeamId: Number(teamId),
            };
            const publishedPost = new PublishedPost(publishedDetails);

            publishedPost.save();
          }
        })
        .catch(error => {
          throw error;
        });
    } catch (error) {
      throw error;
    }
  }

  /**
   * TODO Publish and saving Image/video InstaBusinessAccount
   * Function Publish and saving Image/video InstaBusinessAccount
   * @param  {object} postDetails - Post details
   * @param  {number} accountId - Insta Account Account Id
   * @param  {string} accessToken - Insta Account token
   * @param  {number} teamId - socioboard Team Id
   * @param  {number} social_id - Insta Account User Id
   * @return {object} return status of Insta Publish
   */
   async publishonInsta(postDetails, accountId, accessToken, teamId, social_id) {
     try {
      let getPublishQuotaLimit= await this.facebookConnect.getInstaBusinessPublishLimit(social_id,accessToken)
      if(getPublishQuotaLimit <= 0 ) 
      {
        this.saveInstaNotification(postDetails,'',"Failed, Maximum Publish limit reached try again after 24 hours",accountId,teamId)
      }
      else{
        let publish_id = await  this.facebookConnect.publishPostInsta(postDetails, accessToken, social_id)
        let response= await this.facebookConnect.getShortCodeUrl(social_id, accessToken, publish_id)
         this.saveInstaNotification(postDetails,response,'',accountId,teamId)
    }
    } catch (error) {
       this.saveInstaNotification(postDetails,'',error,accountId,teamId)
       logger.info(`Error in Publishing the Instagram Post ${error}`)
   }
}

  /**
   * TODO to store InstaBusinessAccount Post Details
   * Function to store InstaBusinessAccount Post Details
   * @param  {object} postDetails - Post details
   * @param  {object} response - post publish response
   * @param  {string} failedreason - post failed reason
   * @param  {number} accountId - Insta Account Account Id
   * @param  {number} teamId - socioboard Team Id
   */
async saveInstaNotification(postDetails,response,failedreason,accountId,teamId){
  let data={
    id_string:response?.id ?? moment().valueOf(), 
    url: response?.url,
    reason:failedreason
   }      
  let result = await this.savePostInstagramBusiness(accountId,postDetails,data,teamId,data?.url,data?.reason);
  if (config.get('notification_socioboard.status') == 'on') {
    this.teamNotificationData(teamId,postDetails,result.PublishedUrl,'Instagram Business',data?.reason);
  }
}

  isUrl(url) {
    const regexp = new RegExp(
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    );

    return regexp.test(url);
  }

  validatePinterestPosts(postDetails) {
    return new Promise((resolve, reject) => {
      if (!this.isUrl(postDetails.link)) {
        reject(new Error('Invalid link in post details!'));
      } else if (
        postDetails.mediaPath.length <= 0 ||
        !postDetails.mediaPath[0]
      ) {
        reject(new Error('Invalid mediaPath details!'));
      } else {
        resolve();
      }
    });
  }

  // not added team Notification.
  publishOnLinkedIn(
    postDetails,
    accessToken,
    accountType,
    userName,
    teamId,
    accountId
  ) {
    if (postDetails.postType == 'Video') {
      return this.getThumbnailOfMedia(postDetails.mediaPath)
        .then(mediaInfos => {
          if (accountType == 6 || 7) {
            postDetails.mediaInfos = mediaInfos;
            let target = accountType == 6 ? 'person' : 'organization';

            return this.linkedInConnect
              .publishPost(target, postDetails, accessToken, userName)
              .then(response => {
                logger.info(
                  ` Response from linkedIn ${JSON.stringify(response)}`
                );
                this.shareUploadVideo(
                  accessToken,
                  target,
                  userName,
                  response.asset,
                  response.status,
                  `${postDetails.message} \n${postDetails.link ?? ''}`,
                  teamId,
                  postDetails,
                  accountId
                );
                resolve(response);
              })
              .catch(error => {
                logger.info(
                  `Error linkedin posting ${JSON.stringify(error?.body)}`
                );
                reject(error);
              });
          }

          postDetails.mediaInfos = mediaInfos;

          this.linkedInConnect.publishPostOnCompany(
            postDetails,
            accessToken,
            status => {
              // Notify to user via socket.io
              logger.info(status);
            }
          );
        })
        .catch(error => {
          logger.info(error);
        });
    }
    if (accountType == 6 || 7) {
      let target = accountType == 6 ? 'person' : 'organization';
      return this.linkedInConnect
        .publishPost(target, postDetails, accessToken, userName)
        .then(response => {
          logger.info(` Response from linkedIn ${JSON.stringify(response)}`);

          return this.savePostLinkedIn(
            accountId,
            postDetails,
            response,
            teamId
          );
        })
        .then(response => {
          if (config.get('notification_socioboard.status') == 'on') {
            this.teamNotificationData(
              response?.TeamId,
              postDetails,
              response.PublishedUrl,
              'LinkedIn'
            );
          }
        })
        .catch(error => {
          logger.info(`Error linkedin posting ${JSON.stringify(error)}`);
          return this.savePostLinkedIn(
            accountId,
            postDetails,
            {id: moment().valueOf()},
            teamId,
            '',
            error?.error?.message
          );
        })
        .then(response => {
          if (config.get('notification_socioboard.status') == 'on') {
            this.teamNotificationData(
              response?.TeamId,
              postDetails,
              '',
              'LinkedIn',
              response?.PublishedStatus.replace(
                'com.linkedin.content.common.ResponseException:',
                ''
              )
            );
          }
        });
    }

    this.linkedInConnect.publishPostOnCompany(
      postDetails,
      accessToken,
      status => {
        // Notify to user via socket.io
        logger.info(status);
      }
    );
  }

  getThumbnailOfMedia(medias) {
    logger.info(`Medias: ${JSON.stringify(medias)}`);
    let updatedMedia = [];

    if (medias.length > 1) {
      updatedMedia.push(medias[0]);
    } else {
      updatedMedia = [...medias];
    }

    const mediaDetails = [];

    return Promise.all(
      updatedMedia.map(media =>
        userMediaDetails
          .findOne({
            where: {
              media_url: media,
            },
            attributes: ['id', 'thumbnail_url', 'media_url'],
          })
          .then(response => {
            const mediaDetail = {
              media_url: response.media_url,
              thumbnail_url: response.thumbnail_url,
            };

            logger.info(`\n Fetched Media : ${JSON.stringify(mediaDetail)} \n`);
            mediaDetails.push(mediaDetail);
          })
      )
    )
      .then(() => {
        logger.info(`\n Media Details : ${JSON.stringify(mediaDetails)} \n`);
        if (mediaDetails.length > 0) {
          return mediaDetails[0];
        }

        return [];
      })
      .catch(() => []);
  }

  publishOnTwitter(postDetails, accountId, accessToken, refreshToken, teamId) {
    logger.info('Started publishing on twitter');
    logger.info(`postDetails : ${JSON.stringify(postDetails)}`);

    return new Promise((resolve, reject) => {
      let publishedDetails = {};
      const publishedPostObject = new PublishedPost();

      return publishedPostObject
        .getTodayPostsCount(accountId)
        .then(postCount => {
          logger.info(`postCount : ${postCount}`);
          if (postCount < config.get('twitter_api.maximum_post_per_day')) {
            return this.twitterConnect
              .publishTweets(postDetails, accessToken, refreshToken)
              .then(status => {
                logger.info(status);
                publishedDetails = {
                  publishedDate: moment.utc(),
                  accountId,
                  fullPublishContentId: postDetails.mongoScheduleId,
                  postCategory: postDetails.moduleName,
                  publishedContentDetails: postDetails.message,
                  publishedMediaUrls: postDetails.mediaPath,
                  postShareUrl: postDetails.link,
                  PublishedId: status.message.id_str,
                  PublishedUrl: `https://twitter.com/${status.message.user.screen_name}/status/${status.message.id_str}`,
                  PublishedStatus: 'Success',
                  TeamId: Number(teamId),
                };
                const publishedPost = new PublishedPost(publishedDetails);
                return publishedPost.save();
              })
              .then(() => {
                if (config.get('notification_socioboard.status') == 'on')
                  return this.teamNotificationData(
                    teamId,
                    postDetails,
                    publishedDetails.PublishedUrl,
                    'Twitter'
                  );
              })
              .catch(error => {
                logger.info(error);
                publishedDetails = {
                  publishedDate: moment.utc(),
                  accountId,
                  fullPublishContentId: postDetails.mongoScheduleId,
                  postCategory: postDetails.moduleName,
                  publishedContentDetails: postDetails.message,
                  publishedMediaUrls: postDetails.mediaPath,
                  postShareUrl: postDetails.link,
                  PublishedId: moment().valueOf(),
                  PublishedUrl: '',
                  PublishedStatus: `Failed ${error?.message[0]?.message}`,
                  TeamId: Number(teamId),
                };
                const publishedPost = new PublishedPost(publishedDetails);
                return publishedPost.save();
              })
              .then(() => {
                if (config.get('notification_socioboard.status') == 'on')
                  return this.teamNotificationData(
                    teamId,
                    postDetails,
                    publishedDetails.PublishedUrl,
                    'Twitter',
                    publishedDetails?.PublishedStatus.replace('Failed ', '')
                  );
              })
              .catch(error => {
                logger.info(error);
                logger.info(status);
              });
          }
          publishedDetails = {
            publishedDate: moment.utc(),
            accountId,
            fullPublishContentId: postDetails.mongoScheduleId,
            postCategory: postDetails.moduleName,
            publishedContentDetails: postDetails.message,
            publishedMediaUrls: postDetails.mediaPath,
            postShareUrl: postDetails.link,
            PublishedId: 'Na',
            PublishedUrl: 'Na',
            PublishedStatus: 'Failed, Maximum limit reached for the day.',
            TeamId: Number(teamId),
          };
          const publishedPost = new PublishedPost(publishedDetails);
          publishedPost.save();
        })
        .then(() => resolve())
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO Publish pin on Pinterest
   * Function Publish pin on Pinterest
   * @param  {object} postDetails - Post details
   * @param  {number} accountId - Pinterest Account Account Id
   * @param  {string} accessToken - Pinterest Account token
   * @param  {number} teamId - socioboard Team Id
   * @param  {number} refreshToken - Pinterest Account Refresh Token
   * @return {object} return status of Pinterest Publish
   */
  async publishOnPinterest(
    postDetails,
    accountId,
    accessToken,
    refreshToken,
    teamId
  ) {
    const publishedPostObject = new PublishedPost();
    let postCount = await publishedPostObject.getTodayPostsCount(accountId);
    if (postCount < config.get('pinterest.maximum_post_per_day')) {
      const boards = lodash.filter(postDetails.boardDetails, {accountId});
      logger.info(boards);
      boards?.map(async x => {
        if (x?.accountId == accountId)
          x.boardId.map(async board_id => {
            try {
              let data = await this.pinterestConnect.publishPin(
                postDetails,
                board_id,
                accessToken
              );
              data.url = '';
              if (!data?.id) data.reason = data?.message;
              if (data?.id) {
                data.url = `https://www.pinterest.com/pin/${data?.id}`;
              }
              let result = await this.savePostPinterest(
                accountId,
                postDetails,
                data,
                teamId,
                data?.url,
                data?.reason
              );
              if (config.get('notification_socioboard.status') == 'on') {
                this.teamNotificationData(
                  teamId,
                  postDetails,
                  result.PublishedUrl,
                  'Pinterest',
                  data?.reason
                );
              }
            } catch (e) {}
          });
      });
    }
  }

  saveAsAdminApproval(publishedDetails) {
    return new Promise((resolve, reject) => {
      if (!publishedDetails) {
        reject(new Error('Invalid Inputs'));
      } else {
        const adminApprovalPost = new AdminApprovalPost(publishedDetails);

        return adminApprovalPost
          .save()
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            logger.error(error);
            reject(new Error(error.message));
          });
      }
    });
  }

  getTeamsAllAdmin(teamId) {
    return new Promise((resolve, reject) => {
      if (!teamId) {
        reject(new Error('Invalid teamId'));
      } else {
        return teamUserJoinTable
          .findAll({
            where: {
              permission: 1,
              team_id: teamId,
              left_from_team: false,
            },
            attributes: ['id', 'user_id'],
          })
          .then(result => {
            const admins = [];

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

  getApprovalPostStatus(userId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      logger.info(`${userId}, ${teamId}, ${pageId} `);
      if (!userId || !teamId || !pageId || pageId < 0) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => {
            const skip = (Number(pageId) - 1) * config.get('perPageLimit');
            const adminApprovalPost = new AdminApprovalPost();

            return adminApprovalPost
              .getAdminApprovalPost(
                userId,
                teamId,
                skip,
                config.get('perPageLimit')
              )
              .then(result => {
                resolve(result);
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getPublishedPosts(userId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      logger.info(`${userId}, ${teamId}, ${pageId} `);
      if (!userId || !teamId || !pageId || pageId < 0) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => {
            const skip = (Number(pageId) - 1) * config.get('perPageLimit');
            const publishPost = new PublishedPost();

            return publishPost
              .getPublishedPosts(
                userId,
                teamId,
                skip,
                config.get('perPageLimit')
              )
              .then(result => {
                resolve(result);
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  /**
   * TODO To send notification to particular team
   * Function To send notification to particular team
   * @param  {number} teamId -Team id
   * @param  {object} postDetails -Post details
   * @param  {string} PublishedUrl -Post url from different social medias
   * @param  {string} network -Social media platform
   */
  async teamNotificationData(
    teamId,
    postDetails,
    PublishedUrl,
    network,
    reason
  ) {
    const targetTeamsId = [];
    targetTeamsId.push(teamId);
    const notification = new NotificationServices(
      config.get('notification_socioboard.host_url')
    );

    notification.notificationMessage =
      PublishedUrl != ''
        ? ` Published post on ${network},Published by ${postDetails.ownerName}, Published url is: "${PublishedUrl}"`
        : `Publish failed on ${network}, Published by ${postDetails.ownerName},Reason ${reason} Mongo Id ${postDetails?.mongoScheduleId}`;
    notification.teamName = teamId;
    notification.notifyType =
      PublishedUrl != '' ? 'publish_publishPosts' : 'publish_failed';
    notification.initiatorName = postDetails.ownerName;
    notification.status = 'success';
    notification.targetTeamsId = targetTeamsId;
    // Saving notification
    try {
      const savedObject = await notification.saveNotifications();
      const encryptedNotifications = this.authorizeServices.encrypt(
        JSON.stringify(savedObject)
      );
      return await notification.sendTeamNotification(
        teamId,
        encryptedNotifications
      );
    } catch (error) {
      logger.info(`Notification not sent, ${error.message}`);
    }
  }

  /**
   * TODO To share video to liked In after upload got finished
   * Function to share video to liked In after upload got finished
   * @param  {number} accountId -LinkedIn account id
   * @param  {object} postDetails -Post details
   * @param  {object} response -Response from LinkedIn api after successful upload
   * @param  {number} teamId -Team id
   * @param  {string} url -Post url from different LinkedIn
   */
  async savePostLinkedIn(
    accountId,
    postDetails,
    response,
    teamId,
    url,
    reason
  ) {
    const publishedDetails = {
      publishedDate: moment.utc(),
      accountId,
      fullPublishContentId: postDetails.mongoScheduleId,
      postCategory: postDetails.moduleName,
      publishedContentDetails: postDetails.message,
      publishedMediaUrls: postDetails.mediaPath,
      postShareUrl: postDetails.link,
      PublishedId: response.id,
      PublishedUrl:
        url ??
        `https://www.linkedin.com/feed/update/urn:li:share:${response.id}`,
      PublishedStatus: reason ?? 'Success',
      TeamId: Number(teamId),
    };
    const publishedPost = new PublishedPost(publishedDetails);

    return publishedPost.save();
  }

  /**
   * TODO To share video to linkedIn after upload got finished
   * Function to share video to liked In after upload got finished
   * @param  {string} accessToken -Access token of linkedIn account
   * @param  {string} target -Target for linkedIn api Person or company
   * @param  {string} userName -LinkedIn account username
   * @param  {string} asset -Asset id return by register media api
   * @param  {string} status -Media upload status returned by linkedIn
   * @param  {string} message -Media description
   * @param  {number} teamId -Team id
   * @param  {object} postDetails -Post details
   * @param  {number} accountId -LinkedIn account id
   */
  async shareUploadVideo(
    accessToken,
    target,
    userName,
    asset,
    status,
    message,
    teamId,
    postDetails,
    accountId
  ) {
    try {
      const data = await this.linkedInConnect.shareUploadVideo(
        accessToken,
        target,
        userName,
        asset,
        status,
        message
      );
      logger.info(
        ` Response from linkedIn after upload ${JSON.stringify(data)}`
      );
      const response = await this.savePostLinkedIn(
        accountId,
        postDetails,
        data,
        teamId,
        `https://www.linkedin.com/feed/update/${data.id}`
      );

      if (config.get('notification_socioboard.status') == 'on') {
        this.teamNotificationData(
          teamId,
          postDetails,
          response.PublishedUrl,
          'LinkedIn'
        );
      }
    } catch (err) {}
  }

  /**
   * TODO To post on Tumblr
   * Function To post on Tumblr
   * @param  {object} postDetails -Post details
   * @param  {number} accountId -Tumblr account id
   * @param  {string} accessToken -Tumblr account access token
   * @param  {string} refreshToken -Tumblr account refresh token
   * @param  {number} teamId -Team id
   * @param  {number} social_id -Social id
   */
  async publishOnTumblr(
    postDetails,
    accountId,
    accessToken,
    refreshToken,
    teamId,
    social_id,
    profileUrl
  ) {
    let response = await tumblrCluster.postOnTumblr(
      postDetails,
      config.get('tumblr_api.OAuth_consumer_Key'),
      config.get('tumblr_api.OAuth_consumer_secret'),
      social_id,
      accessToken,
      refreshToken
    );
    let data = response?.response;
    postDetails.postType === 'Video'
      ? (data.url = '')
      : (data.url = `https://${response?.response?.display_text?.replace(
          'Posted to ',
          ''
        )}.tumblr.com/post/${response?.response?.id_string}`);
    if (response?.errors || response?.response?.errors) {
      data = {
        id_string: moment().valueOf(),
        url: '',
        reason: `Failed ${
          response?.response?.errors
            ? response?.response?.errors[0]?.message
            : response?.errors[0]?.detail
        }`,
      };
    }
    let result = await this.savePostTumblr(
      accountId,
      postDetails,
      data,
      teamId,
      data?.url,
      data?.reason
    );
    if (config.get('notification_socioboard.status') == 'on') {
      this.teamNotificationData(
        teamId,
        postDetails,
        result.PublishedUrl,
        'Tumblr',
        data?.reason
      );
    }
  }

  /**
   * TODO To share video to Tumblr after post
   * Function to share video to Tumblr after post
   * @param  {number} accountId -Tumblr account id
   * @param  {object} postDetails -Post details
   * @param  {object} response -Response from Tumblr api after successful upload
   * @param  {number} teamId -Team id
   * @param  {string} url -Post url from Tumblr
   * @param  {string} reason -Post Failed reason
   */
  async savePostTumblr(accountId, postDetails, response, teamId, url, reason) {
    const publishedDetails = {
      publishedDate: moment.utc(),
      accountId,
      fullPublishContentId: postDetails?.mongoScheduleId,
      postCategory: postDetails?.moduleName,
      publishedContentDetails: postDetails?.message,
      publishedMediaUrls: postDetails?.mediaPath,
      postShareUrl: postDetails?.link,
      PublishedId: response?.id_string,
      PublishedUrl: url ?? '',
      PublishedStatus: reason ?? 'Success',
      TeamId: Number(teamId),
    };
    const publishedPost = new PublishedPost(publishedDetails);
    return publishedPost.save();
  }
  /**
   * TODO To save post details on Pinterest
   * Function To save post details on Pinterest
   * @param  {number} accountId -Pinterest account id
   * @param  {object} postDetails -Post details
   * @param  {object} response -Response from Pinterest api after successful upload
   * @param  {number} teamId -Team id
   * @param  {string} url -Post url from Pinterest
   * @param  {string} reason -Post Failed reason
   */
  async savePostPinterest(
    accountId,
    postDetails,
    response,
    teamId,
    url,
    reason
  ) {
    const publishedDetails = {
      publishedDate: moment.utc(),
      accountId,
      fullPublishContentId: postDetails?.mongoScheduleId,
      postCategory: postDetails?.moduleName,
      publishedContentDetails: postDetails?.message,
      publishedMediaUrls: postDetails?.mediaPath,
      postShareUrl: postDetails?.link,
      PublishedId: response?.id ?? moment().valueOf(),
      PublishedUrl: url ?? '',
      PublishedStatus: reason ?? 'Success',
      TeamId: Number(teamId),
    };
    const publishedPost = new PublishedPost(publishedDetails);
    return publishedPost.save();
  }

  /**
   * TODO To get publish details based on selected criteria
   * Function To get publish details based on selected criteria
   * @param  {number} userId -User id
   * @param  {number} teamId -Team id
   * @param  {number} pageId -Page id
   * @param  {object} searchPublishedPostInfo -Search publish details
   * @param  {string} publishedStatus -Publish status
   * @param  {number} filterPeriod -PFiltered period
   * @param  {date} since -Since date
   * @param  {date} until -Until date
   */
  async filterPublishedPosts(
    userId,
    teamId,
    pageId,
    searchPublishedPostInfo,
    publishedStatus,
    filterPeriod,
    since,
    until
  ) {
    return new Promise(async (resolve, reject) => {
      logger.info(`${userId}, ${teamId}, ${pageId} `);
      if (!userId || !teamId || !pageId || pageId < 0) {
        reject(new Error('Invalid Inputs'));
      } else {
        let date;
        if (filterPeriod)
          date = await teamReportModel.getFilteredPeriod(
            filterPeriod,
            since,
            until
          );
        return this.isTeamValidForUser(userId, teamId)
          .then(() => {
            const skip = (Number(pageId) - 1) * config.get('perPageLimit');
            const publishPost = new PublishedPost();

            return publishPost
              .filterPublishedPosts(
                userId,
                teamId,
                skip,
                config.get('perPageLimit'),
                searchPublishedPostInfo,
                publishedStatus,
                date
              )
              .then(result => {
                resolve(result);
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

 /**
   * TOD To save post details on Instagram Business 
   * Function To save post details on Instagram Business 
   * @param {number} accountId -Instagram Business account id
   * @param {object} postDetails -Post details
   * @param {object} response -Response from Instagram Business api after successful upload
   * @param {number} teamId -Team id
   * @param {string} url -Post url from Instagram Business
   * @param {string} reason -Post Failed reason
   */
     async savePostInstagramBusiness(accountId, postDetails, response, teamId, url, reason) {
      const publishedDetails = {
        publishedDate: moment.utc(),
        accountId,
        fullPublishContentId: postDetails?.mongoScheduleId,
        postCategory: postDetails?.moduleName,
        publishedContentDetails: postDetails?.message,
        publishedMediaUrls: postDetails?.mediaPath,
        postShareUrl: postDetails?.link,
        PublishedId: response?.id_string,
        PublishedUrl: url ?? '',
        PublishedStatus: reason ?? 'Success',
        TeamId: Number(teamId),
      };
      const publishedPost = new PublishedPost(publishedDetails);
      return publishedPost.save();
    }
}

export default PublishModel;
