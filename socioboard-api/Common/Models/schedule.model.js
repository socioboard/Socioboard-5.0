import moment from 'moment';
import schedule from 'node-schedule';
import config from 'config';
import logger from '../../Publish/resources/Log/logger.log.js';
import SchedulePost from '../Mongoose/models/schedule-posts.js';
import ScheduleBase from '../../Publish/core/schedule/schedule-base.js';
import TaskModel from '../Mongoose/models/task-models.js';
import PublishedPost from '../Mongoose/models/published-posts.js';
import db from '../Sequelize-cli/models/index.js';
import TeamReportModel from './team-report.model.js';
import {SuccessResponse} from '../Shared/response.shared.js';
const teamReportModel = new TeamReportModel();
import sizeOf from 'image-size';

const Operator = db.Sequelize.Op;
const scheduleDetails = db.users_schedule_details;
const teamUserJoinTable = db.join_table_users_teams;
const scheduledInformations = db.scheduled_informations;
const dbSocialAccounts = db.social_accounts;
const userDetails = db.user_details;

class ScheduleLibs extends ScheduleBase {
  constructor() {
    super();
  }

  getActiveScheduleCount(userId) {
    return new Promise((resolve, reject) =>
      scheduleDetails
        .count({
          where: {
            [Operator.and]: [
              {
                schedule_status: 1,
              },
              {
                user_id: userId,
              },
            ],
          },
        })
        .then(activeScheduleCount => {
          resolve(activeScheduleCount);
        })
        .catch(() => {
          reject(
            new Error(
              'Cant able to get the active schedule count of specified user.'
            )
          );
        })
    );
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

  getRunningDayAndTodayTimings(scheduleTimer) {
    return new Promise((resolve, reject) => {
      if (!scheduleTimer && scheduleTimer.length == 0) {
        reject(new Error('Invalid Timers'));
      } else {
        const currentDayOfWeek = moment.utc().day();

        // schedulePart : 0 => First half (0-11)
        // schedulePart : 1=> Second half (12-23)
        const schedulePart = moment.utc().hour() > 11 ? 1 : 0;

        const todaysTiming = [];
        let runningDays = null;

        scheduleTimer.forEach(runningDay => {
          if (runningDay.dayId == undefined || runningDay.dayId == null) {
            if (
              moment()
                .utc()
                .startOf('day')
                .isSame(moment(runningDay).utc().startOf('day'))
            )
              todaysTiming.push(runningDay);
          } else {
            if (runningDay.dayId == currentDayOfWeek) {
              runningDay.timings.forEach(time => {
                const timesNoon = moment(time).utc().hour() > 11 ? 1 : 0;

                if (timesNoon == schedulePart) {
                  todaysTiming.push(time);
                }
              });
            }

            if (!runningDays) runningDays = String(runningDay.dayId);
            else runningDays += `:${runningDay.dayId}`;
          }
        });
        resolve({runningDays, todaysTiming});
      }
    });
  }

  verifyAccounts(socialAccounts) {
    return new Promise((resolve, reject) => {
      if (!socialAccounts || socialAccounts.length <= 0)
        reject(new Error('Sorry, Please check the social accounts!'));
      else {
        const invalidAccounts = [];
        const validAccounts = [];

        if (socialAccounts.length > 0) {
          socialAccounts.forEach(element => {
            if (isNaN(element.accountId) || element.accountId == 0)
              invalidAccounts.push(element.accountId);
            else validAccounts.push(element.accountId);
          });
        }
        if (invalidAccounts.length > 0)
          reject(new Error('Sorry, Please check the social accounts!'));
        else {
          return dbSocialAccounts
            .findAll({
              where: {
                account_id: validAccounts,
              },
            })
            .then(results => {
              if (results.length == validAccounts.length) resolve();
              else
                reject(new Error('Sorry, Please check the social accounts!'));
            })
            .catch(error => {
              reject(error);
            });
        }
      }
    });
  }

  create(userId, userName, postInfo, userScopeMaxScheduleCount) {
    return new Promise((resolve, reject) => {
      if (
        !userId ||
        !userName ||
        !postInfo ||
        userScopeMaxScheduleCount == null ||
        userScopeMaxScheduleCount == undefined ||
        userScopeMaxScheduleCount < 0
      )
        reject(new Error('Invalid Inputs'));
      else if (
        !(
          postInfo.postType == 'Text' ||
          postInfo.postType == 'Image' ||
          postInfo.postType == 'Link' ||
          postInfo.postType == 'Video'
        )
      )
        reject(
          new Error(
            'Invalid Post Type, it should be either Text or Image or Link or Video'
          )
        );
      else if (
        !(postInfo.scheduleCategory == 0 || postInfo.scheduleCategory == 1)
      )
        reject(
          new Error(
            'Invalid scheduleCategory, it should be either 0(daily) or 1(weekly)'
          )
        );
      else if (!(postInfo.scheduleStatus > 0 && postInfo.scheduleStatus < 8))
        reject(new Error('Invalid scheduleStatus it should be between 1-7'));
      else if (postInfo.postingSocialIds.length <= 0)
        reject(new Error('Please provide the proper social accounts'));
      else {
        if (postInfo.postType == 'Image') {
          if (postInfo?.isInsta == 'true') {
            let base_image =
              config.get(`insta_base_path`) + postInfo?.mediaUrl[0];
            const dimensions = sizeOf(base_image);
            if (dimensions.width != dimensions.height) {
              reject(
                new Error('Instagram Post Image Resolution should be 1:1')
              );
            }
          }
        }
        let runningDays = '';
        let todaysTiming = [];
        let createdResponse = '';
        let scheduledId = '';
        let usersTeamPermission = 0;
        let scheduleMongoId = {};
        let oneTimeScheduleDateTime = '';

        logger.info(
          `process started! and inputs are ${userId}, ${userName}, ${JSON.stringify(
            postInfo
          )}, ${userScopeMaxScheduleCount}`
        );

        return this.verifyAccounts(postInfo.postingSocialIds)
          .then(() => this.getActiveScheduleCount(userId))
          .then(activeScheduleCount => {
            logger.info(`activeScheduleCount : ${activeScheduleCount}`);
            if (
              activeScheduleCount >= userScopeMaxScheduleCount &&
              postInfo.scheduleStatus != 5
            )
              throw new Error(
                "Sorry, As per your plan you can't schedule any more posts."
              );
            else {
              // find user permission in the team
              return teamUserJoinTable.findOne({
                where: {
                  user_id: userId,
                  team_id: postInfo.teamId,
                  left_from_team: 0,
                },
              });
            }
          })
          .then(teamUserResponse => {
            if (!teamUserResponse)
              throw new Error("Sorry, you aren't part of the team!");
            else {
              usersTeamPermission = teamUserResponse.permission;
              postInfo.ownerId = userId;
              postInfo.ownerName = userName;
              postInfo.adminResponseStatus =
                postInfo.scheduleStatus == 5
                  ? 'draft'
                  : usersTeamPermission == 1 || 2
                  ? 'fullrights'
                  : 'pending';

              logger.info(JSON.stringify(postInfo));

              // save to mongo db
              const schedulePost = new SchedulePost(postInfo);

              return schedulePost.save();
            }
          })
          .then(response => {
            logger.info('schedule details are saved in mongo!');
            oneTimeScheduleDateTime = postInfo.normalScheduleDate;

            // Calculate running days and save into mysql db
            scheduleMongoId = response._id;

            // Daywise schedule
            if (postInfo.scheduleCategory == 1) {
              oneTimeScheduleDateTime = moment.utc().add(-1, 'days');

              return this.getRunningDayAndTodayTimings(
                postInfo.daywiseScheduleTimer
              )
                .then(result => {
                  runningDays = result.runningDays;
                  todaysTiming = result.todaysTiming;
                  if (!runningDays) runningDays = '0:1:2:3:4:5:6';
                })
                .catch(error => {
                  throw error;
                });
            }
            // OneTime schedule

            const scheduleTimings = [];

            scheduleTimings.push(oneTimeScheduleDateTime);

            return this.getRunningDayAndTodayTimings(scheduleTimings)
              .then(result => {
                runningDays = result.runningDays
                  ? result.runningDays
                  : 'onetimeschedule';
                todaysTiming = result.todaysTiming;
              })
              .catch(error => {
                throw error;
              });
          })
          .then(() => {
            logger.info(
              `Today Schedule Timings : ${JSON.stringify(todaysTiming)}`
            );

            let scheduleStatusValue = postInfo.scheduleStatus;

            // usersTeamPermission == 1(fullpermission, so send to ready(1) queue) otherwise pendingForAdmin approval
            if (postInfo.scheduleStatus != 5)
              scheduleStatusValue = usersTeamPermission == 1 || 2 ? 1 : 3;

            // Add to schedule_details queue
            return scheduleDetails.create({
              schedule_type: postInfo.scheduleCategory,
              module_name: postInfo.moduleName,
              schedule_status: scheduleStatusValue,
              // scheduleStatus : 1=ready queue, 2=wait(pause) state, 3= approvalpending, 4=rejected, 5=draft, 6=done
              mongo_schedule_id: String(scheduleMongoId),
              one_time_schedule_date: oneTimeScheduleDateTime,
              running_days_of_weeks: runningDays,
              created_date: moment.utc(),
              end_date: moment.utc().add(1, 'years'),
              user_id: userId,
              team_id: postInfo.teamId,
            });
          })
          .then(response => {
            if (postInfo.scheduleStatus == 5) {
              resolve({message: 'Schedule details are save as draft!'});
            } else if (usersTeamPermission == 1 || 2) {
              createdResponse = response;
              scheduledId = response.schedule_id;
              if (todaysTiming.length > 0) {
                return this.makeSchedule(scheduledId, todaysTiming)
                  .then(response => {
                    resolve({message: createdResponse, scheduleInfo: response});
                  })
                  .catch(expiredTimings => {
                    resolve({message: createdResponse, expiredTimings});
                  });
              }
              resolve({message: createdResponse});
            } else {
              return this.createScheduleTask(
                postInfo.teamId,
                userId,
                userName,
                response.schedule_id
              )
                .then(() => {
                  resolve({
                    message:
                      'Submitted a request to admin for schedule a post!',
                  });
                })
                .catch(error => {
                  throw error;
                });
            }
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  edit(userId, userName, teamId, scheduleId, postInfo) {
    return new Promise((resolve, reject) => {
      if (!userId || !userName || !postInfo) {
        reject(new Error('Invalid Inputs'));
      } else {
        let scheduleIdDetails = {};
        let scheduleMongoId = null;
        let oneTimeScheduleDateTime = null;
        let runningDays = '';
        let todaysTiming = [];

        return scheduleDetails
          .findOne({
            where: {
              [Operator.and]: [
                {
                  user_id: userId,
                },
                {
                  schedule_id: scheduleId,
                },
                {
                  schedule_status: [1, 3],
                },
                {
                  team_id: teamId,
                },
              ],
            },
          })
          .then(scheduleData => {
            if (!scheduleData)
              throw new Error(
                "Schedule details aren't available to edit, Please make sure following,  1.schedule should be in ready or waiting for admin approval state, \n\r 2. valid teamId!"
              );
            else {
              scheduleIdDetails = scheduleData;

              return scheduledInformations.findAll({
                where: {schedule_id: scheduleId},
              });
            }
          })
          .then(scheduleInfo => {
            if (scheduleInfo.length > 0) {
              scheduleInfo.forEach(element => {
                const scheduleJob =
                  schedule.scheduledJobs[element.scheduler_name];

                logger.info(scheduleJob);
                if (scheduleJob) {
                  logger.info('Running schedule has been cancelled!');
                  scheduleJob.cancel();
                }
              });
            }
          })
          .then(() =>
            scheduledInformations
              .destroy({where: {schedule_id: scheduleId}})
              .then(() =>
                SchedulePost.findByIdAndRemove(
                  scheduleIdDetails.mongo_schedule_id
                )
              )
              .then(() => {
                const taskModels = new TaskModel();

                return taskModels.deletePublishTask(userId, 3, scheduleId);
              })
              .catch(error => {
                throw error;
              })
          )
          .then(() => {
            postInfo.ownerId = userId;
            postInfo.adminResponseStatus =
              scheduleIdDetails.schedule_status == 1 || 2
                ? 'fullrights'
                : 'pending';
            postInfo.teamId = scheduleIdDetails.team_id;
            postInfo.scheduleStatus = scheduleIdDetails.schedule_status;

            const schedulePost = new SchedulePost(postInfo);

            return schedulePost.save();
          })
          .then(response => {
            logger.info('schedule details are saved in mongo!');
            oneTimeScheduleDateTime = postInfo.normalScheduleDate;

            // Calculate running days and save into mysql db
            scheduleMongoId = response._id;

            // Daywise schedule
            if (postInfo.scheduleCategory == 1) {
              oneTimeScheduleDateTime = moment.utc().add(-1, 'days');
              logger.info(postInfo.daywiseScheduleTimer);

              return this.getRunningDayAndTodayTimings(
                postInfo.daywiseScheduleTimer
              )
                .then(result => {
                  logger.info(result);
                  runningDays = result.runningDays;
                  todaysTiming = result.todaysTiming;
                  if (!runningDays) runningDays = '0:1:2:3:4:5:6';
                })
                .catch(error => {
                  throw error;
                });
            }
            // OneTime schedule

            const scheduleTimings = [];

            scheduleTimings.push(oneTimeScheduleDateTime);

            return this.getRunningDayAndTodayTimings(scheduleTimings)
              .then(result => {
                runningDays = result.runningDays
                  ? result.runningDays
                  : 'onetimeschedule';
                todaysTiming = result.todaysTiming;
              })
              .catch(error => {
                throw error;
              });
          })
          .then(() => {
            logger.info(
              `Today Schedule Timings : ${JSON.stringify(todaysTiming)}`
            );
            // Update to schedule_details queue
            return scheduleDetails.update(
              {
                schedule_type: postInfo.scheduleCategory,
                module_name: postInfo.moduleName,
                mongo_schedule_id: String(scheduleMongoId),
                one_time_schedule_date: oneTimeScheduleDateTime,
                running_days_of_weeks: runningDays,
              },
              {where: {schedule_id: scheduleId}}
            );
          })
          .then(response => {
            if (scheduleIdDetails.schedule_status == 1) {
              if (todaysTiming.length > 0)
                return this.makeSchedule(scheduleId, todaysTiming);
            } else
              return this.createScheduleTask(
                scheduleIdDetails.team_id,
                userId,
                userName,
                scheduleId
              );
          })
          .then(() => {
            resolve({message: 'schedule details are edit successfully'});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async editDraftSchedule(userId, userName, teamId, scheduleId, postInfo) {
    const id = await this.getScheduleMongoId(userId, scheduleId);
    const schedulePost = new SchedulePost();
    const update = await schedulePost.insertManyPosts([postInfo], id);
    const res = await schedulePost.getPostsById(id);

    return id;
  }

  createScheduleTask(teamId, userId, userName, scheduleId) {
    return new Promise((resolve, reject) =>
      this.getTeamsAllAdmin(teamId)
        .then(result => {
          if (result.length == 0)
            throw new Error("Cant able to fetch the team admin's!");
          else {
            const assignedUsers = [];

            result.map(element => {
              const admin = {
                assignedTo: element,
                assignedBy: userId,
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
            ownerId: userId,
            taskName: 'Scheduing request',
            taskDescription: `${userName} needs to schedule a post!`,
            type: 3,
            status: 'created',
            inviteEmails: '',
            schedulePostId: scheduleId,
            normalPostId: '',
            createdDate: moment.utc().format(),
            updatedDate: moment.utc().format(),
            assignedUser: admins,
          };
          const taskModel = new TaskModel(taskDetails);

          return taskModel.save();
        })
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  getScheduleDetails(userId, pageId) {
    return new Promise((resolve, reject) => {
      if (!userId || !Number(pageId)) {
        reject(new Error('Invalid Inputs'));
      } else {
        let userScheduleDetails = null;

        return scheduleDetails
          .findAll({
            where: {user_id: userId},
            offset: config.get('perPageLimit') * (pageId - 1),
            limit: config.get('perPageLimit'),
            include: [
              {
                model: userDetails,
                as: 'UserSchedule',
                attributes: [['first_name', 'name']],
              },
            ],
            raw: true,
          })
          .then(response => {
            userScheduleDetails = response;
            const mongoIds = [];

            if (response) {
              response.map(element => {
                mongoIds.push(element.mongo_schedule_id);
              });

              return SchedulePost.find({_id: {$in: mongoIds}});
            }

            return [];
          })
          .then(mongoValues => {
            resolve({
              scheduleDetails: userScheduleDetails,
              postContents: mongoValues,
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getSchedulePostById(userId, mongoIds) {
    return new Promise((resolve, reject) =>
      SchedulePost.find({_id: {$in: mongoIds}}, '-_id', {lean: true})
        .then(mongoValues => {
          resolve(mongoValues);
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  async getScheduleId(userId, mongo_schedule_id, response) {
    const scheduleData = await scheduleDetails.findOne({
      where: {
        [Operator.and]: [
          {
            user_id: userId,
          },
          {
            mongo_schedule_id,
          },
        ],
      },
      raw: true,
      attributes: ['schedule_id'],
    });
    const res = {...response[0]};

    res.schedule_id = scheduleData?.schedule_id;
    res._id = mongo_schedule_id;

    return [res];
  }

  async getScheduleMongoId(user_id, schedule_id) {
    const scheduleData = await scheduleDetails.findOne({
      where: {
        [Operator.and]: [
          {
            user_id,
          },
          {
            schedule_id,
          },
        ],
      },
      raw: true,
      attributes: ['mongo_schedule_id'],
    });

    return scheduleData?.mongo_schedule_id;
  }

  getFilteredScheduleDetails(userId, scheduleStatus, pageId, teamId) {
    return new Promise((resolve, reject) => {
      if (
        !userId ||
        !scheduleStatus ||
        !Number(pageId) ||
        scheduleStatus > 7 ||
        scheduleStatus < 1
      ) {
        reject(
          new Error(
            'Sorry, please verify following are correct. 1.Invalid Page Id, \n\r 2.Schedule status is between 1 to 7.'
          )
        );
      } else {
        let userScheduleDetails = null;
        let query = {
          user_id: userId,
          schedule_status: scheduleStatus,
        };
        if (teamId) query.team_id = teamId;
        return scheduleDetails
          .findAll({
            where: query,
            offset: config.get('perPageLimit') * (pageId - 1),
            limit: config.get('perPageLimit'),
            order: [['created_date', 'DESC']],
            include: [
              {
                model: userDetails,
                as: 'UserSchedule',
                attributes: [['first_name', 'name']],
              },
            ],
            raw: true,
          })
          .then(response => {
            userScheduleDetails = response;
            const mongoIds = [];

            if (response) {
              response.forEach(element => {
                mongoIds.push(element.mongo_schedule_id);
              });

              return SchedulePost.find({_id: {$in: mongoIds}}).sort({
                createdDate: -1,
              });
            }

            return [];
          })
          .then(mongoValues => {
            resolve({
              scheduleDetails: userScheduleDetails,
              postContents: mongoValues,
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getScheduleDetailsByCategories(
    userId,
    scheduleStatus,
    scheduleCategory,
    pageId,
    teamId
  ) {
    return new Promise((resolve, reject) => {
      if (
        !userId ||
        !scheduleStatus ||
        !Number(pageId) ||
        scheduleStatus > 7 ||
        scheduleStatus < 1
      ) {
        reject(
          new Error(
            'Sorry, please verify following are correct. 1.Invalid Page Id, \n\r 2.Schedule status is between 1 to 7.'
          )
        );
      } else if (scheduleCategory < 0 || scheduleCategory > 1) {
        reject(
          new Error(
            'Sorry, please verify schedule category which should be either 0(normal) or 1(daywise).'
          )
        );
      } else {
        let userScheduleDetails = null;
        let query = {
          user_id: userId,
          schedule_status: scheduleStatus,
          schedule_type: scheduleCategory,
        };
        if (teamId) query.team_id = teamId;
        return scheduleDetails
          .findAll({
            where: query,
            offset: config.get('perPageLimit') * (pageId - 1),
            limit: config.get('perPageLimit'),
            order: [['created_date', 'DESC']],
            include: [
              {
                model: userDetails,
                as: 'UserSchedule',
                attributes: [['first_name', 'name']],
              },
            ],
            raw: true,
          })
          .then(response => {
            userScheduleDetails = response;
            const mongoIds = [];

            if (response) {
              response.forEach(element => {
                mongoIds.push(element.mongo_schedule_id);
              });

              return SchedulePost.find({_id: {$in: mongoIds}}).sort({
                createdDate: -1,
              });
            }

            return [];
          })
          .then(mongoValues => {
            resolve({
              scheduleDetails: userScheduleDetails,
              postContents: mongoValues,
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  /**
   * TODO To get scheduled details for calender view
   * @param  {Number} user_id
   * @param  {Number} schedule_status
   * @param  {Number} schedule_type
   * @return {object} Returns scheduled details
   */
  async getScheduleDetailsForCalenderView(
    user_id,
    schedule_status,
    schedule_type,
    teamId
  ) {
    const query = {user_id};

    if (schedule_status) query.schedule_status = schedule_status;
    if (schedule_type) query.schedule_type = schedule_type;
    if (teamId) query.team_id = teamId;
    const mongoIds = [];
    const response = await scheduleDetails.findAll({
      where: query,
      order: [['created_date', 'DESC']],
      include: [
        {
          model: userDetails,
          as: 'UserSchedule',
          attributes: [['first_name', 'name']],
        },
      ],
      raw: true,
    });

    if (response) {
      response.map(element => mongoIds.push(element.mongo_schedule_id));

      return await SchedulePost.find({_id: {$in: mongoIds}}).sort({
        createdDate: -1,
      });
    }

    return [];
  }

  changeScheduleStatus(
    userId,
    userName,
    scheduleId,
    newScheduleStatus,
    userScopeMaxScheduleCount
  ) {
    return new Promise((resolve, reject) => {
      if (
        !userId ||
        !scheduleId ||
        !newScheduleStatus ||
        newScheduleStatus > 7 ||
        newScheduleStatus < 1
      ) {
        reject(
          new Error(
            'Sorry, please verify following are correct. 1.Schedule Id, \n\r 2.Schedule status is between 1 to 7.'
          )
        );
      } else {
        let scheduleInfo = {};
        let userPermission = false;

        return this.getActiveScheduleCount(userId)
          .then(count => {
            if (count >= userScopeMaxScheduleCount && newScheduleStatus == 1) {
              throw new Error(
                `Sorry ! As per your plan, you can make ${userScopeMaxScheduleCount} schedules are possible.`
              );
            } else {
              return scheduleDetails.findOne({
                where: {
                  [Operator.and]: [
                    {
                      user_id: userId,
                    },
                    {
                      schedule_id: scheduleId,
                    },
                  ],
                },
              });
            }
          })
          .then(scheduleData => {
            if (!scheduleData)
              throw new Error("Schedule details aren't available to update!");
            else if (scheduleData.schedule_status == newScheduleStatus) {
              throw new Error(
                'Sorry, Cant able to update because both current and previous status are same!'
              );
            } else {
              scheduleInfo = scheduleData;
              if (newScheduleStatus == 1) {
                // find user permission in the team
                return teamUserJoinTable
                  .findOne({
                    where: {
                      user_id: userId,
                      team_id: scheduleData.team_id,
                      left_from_team: 0,
                    },
                  })
                  .then(teamUserResponse => {
                    userPermission = teamUserResponse.permission;
                  })
                  .catch(error => {
                    throw error;
                  });
              }

              if (scheduleData.schedule_status == 5 && newScheduleStatus == 1) {
                // Draft(5) to ready(1) ==>
                // We need to check the user has permission to make ready state
                // If user have, then make a schedule
                // If not, create a task

                if (teamUserResponse.permission == 0) {
                  return this.createScheduleTask(
                    scheduleData.team_id,
                    userId,
                    userName,
                    scheduleId
                  );
                }
                const schedulePost = new SchedulePost();

                return schedulePost
                  .getScheduleDetails(scheduleData.mongo_schedule_id)
                  .then(schedulePostInfo => {
                    // Daywise schedule
                    if (schedulePostInfo.scheduleCategory == 1) {
                      return this.getRunningDayAndTodayTimings(
                        schedulePostInfo.daywiseScheduleTimer
                      )
                        .then(result => result.todaysTiming)
                        .catch(error => {
                          throw error;
                        });
                    }
                    // OneTime schedule

                    const scheduleTimings = [];

                    scheduleTimings.push(schedulePostInfo.normalScheduleDate);

                    return this.getRunningDayAndTodayTimings(scheduleTimings)
                      .then(result => result.todaysTiming)
                      .catch(error => {
                        throw error;
                      });
                  })
                  .then(todaysTiming => {
                    logger.info(
                      `Today Timings : ${JSON.stringify(todaysTiming)}`
                    );
                    if (todaysTiming.length > 0)
                      return this.makeSchedule(scheduledId, todaysTiming);
                  })
                  .catch(error => {
                    throw error;
                  });
              }
              if (scheduleData.schedule_status == 3 && newScheduleStatus == 5) {
                // Delete the task
                const taskModels = new TaskModel();

                return taskModels.deletePublishTask(userId, 3, scheduleId);
              }
            }
          })
          .then(() =>
            scheduleDetails.update(
              {
                schedule_status: newScheduleStatus,
              },
              {
                where: {
                  user_id: userId,
                  schedule_id: scheduleId,
                },
              }
            )
          )
          .then(() => {
            const schedulePost = new SchedulePost();

            return schedulePost.updateStatus(
              scheduleInfo.mongo_schedule_id,
              newScheduleStatus
            );
          })
          .then(() => {
            if (userPermission == 0 && newScheduleStatus == 1)
              resolve({
                message:
                  'Schedule status has been updated successfully. Admin approvals is in pending!',
              });
            else
              resolve({
                message: 'Schedule status has been updated successfully!',
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  delete(userId, scheduleId) {
    return new Promise((resolve, reject) => {
      if (!userId || !scheduleId) {
        reject(new Error('Invalid Input'));
      } else {
        return scheduleDetails
          .findOne({
            where: {
              [Operator.and]: [
                {
                  user_id: userId,
                },
                {
                  schedule_id: scheduleId,
                },
              ],
            },
          })
          .then(scheduleData => {
            if (!scheduleData)
              throw new Error("Not found or you don't have a access to delete");
            else {
              const mongoIds = scheduleData.mongo_schedule_id;

              return SchedulePost.findByIdAndRemove(mongoIds)
                .then(() =>
                  scheduledInformations.findAll({
                    where: {schedule_id: scheduleId},
                  })
                )
                .then(scheduleInfo => {
                  if (scheduleInfo.length > 0) {
                    scheduleInfo.forEach(element => {
                      const scheduleJobName =
                        schedule.scheduledJobs[element.scheduler_name];

                      if (scheduleJobName) scheduleJobName.cancel();
                    });
                  }
                })
                .then(() =>
                  scheduledInformations.destroy({
                    where: {schedule_id: scheduleId},
                  })
                )
                .then(() => scheduleData.destroy())
                .then(() => {
                  const taskModels = new TaskModel();

                  return taskModels.deletePublishTask(userId, 3, scheduleId); // where 3 => specify task type
                })
                .catch(error => {
                  throw new Error(error.message);
                });
            }
          })
          .then(() => {
            resolve({message: 'Deleted successfully'});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  cancelScheduleDetails(userId, scheduleId) {
    return new Promise((resolve, reject) => {
      if (!userId || !scheduleId) {
        reject(new Error('Invalid Input'));
      } else {
        let scheduleIdData = {};

        return scheduleDetails
          .findOne({
            where: {
              [Operator.and]: [
                {
                  user_id: userId,
                },
                {
                  schedule_id: scheduleId,
                },
                {
                  schedule_status: 1,
                },
              ],
            },
          })
          .then(scheduleData => {
            if (!scheduleData)
              throw new Error(
                'Sorry, cant able to cancel the schedule due to following issues. 1. Invalid schedule id, \n\r 2. Schedule status should be in ready state to cancel, \n\r 3.User isnt owner the schedule.'
              );
            else {
              scheduleIdData = scheduleData;

              return scheduledInformations.findAll({
                where: {schedule_id: scheduleId},
              });
            }
          })
          .then(scheduleInfo => {
            if (scheduleInfo.length > 0) {
              scheduleInfo.forEach(element => {
                const scheduleJobName =
                  schedule.scheduledJobs[element.scheduler_name];

                if (scheduleJobName) scheduleJobName.cancel();
              });
            }

            return scheduledInformations.update(
              {status: 10},
              {where: {schedule_id: scheduleId}}
            );
          })
          .then(() =>
            scheduleDetails.update(
              {schedule_status: 7},
              {where: {schedule_id: scheduleId}}
            )
          )
          .then(() => {
            if (
              scheduleIdData.schedule_type == 0 &&
              moment(scheduleIdData.one_time_schedule_date).isBefore
            ) {
              reject(new Error('Schedule time already crossed!'));
            } else {
              resolve({message: 'Schedule has been cancelled successfully!'});
            }
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  startSchedulerCron() {
    return new Promise((resolve, reject) =>
      this.setupCrons()
        .then(() => {
          resolve({
            message: 'Scheduler cron setup has been successfully done!',
          });
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  runDaywiseSchedule() {
    return new Promise((resolve, reject) =>
      this.startDaywiseSchedule()
        .then(response => {
          resolve({scheduleDetails: response});
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  runTodaySchedule() {
    return new Promise((resolve, reject) =>
      this.startTodaySchedule()
        .then(response => {
          resolve({scheduleDetails: response});
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  /**
   * TODO To get all published post for a schedule
   * @description To get all published post for a schedule
   * @param  {number} fullPublishContentId -Schedule id
   * @return {object} Return all published content for a schedule post
   */
  async getPublishedSchedulePostById(
    fullPublishContentId,
    skip = 0,
    limit = 100
  ) {
    try {
      let publishedPost = new PublishedPost();
      return publishedPost.getPublishedSchedulePostById(
        fullPublishContentId,
        skip,
        limit
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * TODO To get schedule details based on selected criteria
   * Function To get publish details based on selected criteria
   * @param  {number} userId -User id
   * @param  {number} teamId -Team id
   * @param  {number} pageId -Page id
   * @param  {object} scheduleCategory -Schedule category
   * @param  {string} scheduleStatus -Schedule status
   * @param  {number} filterPeriod -PFiltered period
   * @param  {date} since -Since date
   * @param  {date} until -Until date
   */
  getFilterScheduleDetailsByCategories(
    userId,
    scheduleStatus,
    scheduleCategory,
    pageId,
    teamId,
    filterPeriod,
    since,
    until
  ) {
    return new Promise(async (resolve, reject) => {
      if (
        !userId ||
        !scheduleStatus ||
        !Number(pageId) ||
        scheduleStatus > 7 ||
        scheduleStatus < 1
      ) {
        reject(
          new Error(
            'Sorry, please verify following are correct. 1.Invalid Page Id, \n\r 2.Schedule status is between 1 to 7.'
          )
        );
      } else if (scheduleCategory < 0 || scheduleCategory > 1) {
        reject(
          new Error(
            'Sorry, please verify schedule category which should be either 0(normal) or 1(daywise).'
          )
        );
      } else {
        let userScheduleDetails = null;
        let query = {
          user_id: userId,
          schedule_status: scheduleStatus,
          schedule_type: scheduleCategory,
        };
        if (filterPeriod) {
          let date = await teamReportModel.getFilteredPeriod(
            filterPeriod,
            since,
            until
          );
          query.created_date = {
            [Operator.lt]: date.untill,
            [Operator.gt]: date.since,
          };
        }

        if (teamId) query.team_id = teamId;
        return scheduleDetails
          .findAll({
            where: query,
            offset: config.get('perPageLimit') * (pageId - 1),
            limit: config.get('perPageLimit'),
            order: [['created_date', 'DESC']],
            include: [
              {
                model: userDetails,
                as: 'UserSchedule',
                attributes: [['first_name', 'name']],
              },
            ],
            raw: true,
          })
          .then(response => {
            userScheduleDetails = response;
            const mongoIds = [];

            if (response) {
              response.forEach(element => {
                mongoIds.push(element.mongo_schedule_id);
              });

              return SchedulePost.find({_id: {$in: mongoIds}}).sort({
                createdDate: -1,
              });
            }
            return [];
          })
          .then(mongoValues => {
            resolve({
              scheduleDetails: userScheduleDetails,
              postContents: mongoValues,
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  /**
   * TODO To get count of active,total and remaining Schedule Count
   * @param {number} userId -User Id
   * @param {number} totalUserSchedule User total Schedule Count based on user plan
   * @return {object} number of active,total and remaining Schedule Count
   */
  async getTotalActiveScheduleCount(userId, totalUserSchedule) {
    try {
      let activeScheduleCount = await scheduleDetails.count({
        where: {
          [Operator.and]: [
            {
              schedule_status: 1,
            },
            {
              user_id: userId,
            },
          ],
        },
      });
      return {
        activeScheduleCount,
        totalUserSchedule,
        remainingScheduleCount: totalUserSchedule - activeScheduleCount,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * TODO To get count of active,total and remaining Schedule Count
   * @param {number} userId -User Id
   * @param {number} totalUserSchedule User total Schedule Count based on user plan
   * @return {object} number of active,total and remaining Schedule Count
   */
  async getScheduleDetailsCount(
    user_id,
    schedule_status,
    schedule_type,
    teamId
  ) {
    try {
      let query = {
        user_id,
      };
      if (schedule_status) query.schedule_status = schedule_status;
      if (schedule_type) query.schedule_type = schedule_type;
      if (teamId) query.team_id = teamId;
      let activeScheduleCount = await scheduleDetails.count({
        where: query,
      });
      return activeScheduleCount;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * Save a scheduling post in Mongodb
   * @param {object} post
   * @returns {object} post - Created Mongodb document
   */
  savePost(post) {
    const schedulePost = new SchedulePost(post);

    return schedulePost.save();
  }

  /**
   * Create queue for scheduling posts
   * @param {object} details
   * @returns {details}
   */
  createScheduleDetailsQueue(details) {
    return scheduleDetails.create(details);
  }
}

export default ScheduleLibs;
