import schedule from 'node-schedule';
import lodash from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import config from 'config';
import db from '../../../Common/Sequelize-cli/models/index.js';
import SchedulePost from '../../../Common/Mongoose/models/schedule-posts.js';
import publishController from '../publish/publish.controller.js';
import scheduleServise from '../schedule/schedule.service.js';
import CoreServices from '../../../Common/Services/core.services.js';
import logger from '../../resources/Log/logger.log.js';

import SCHEDULE_CONSTANTS from './schedule.constants.js';

const coreServices = new CoreServices(config.get('authorize'));

const scheduledInformations = db.scheduled_informations;
const scheduleDetails = db.users_schedule_details;
const userDetails = db.user_details;
const Operator = db.Sequelize.Op;

class ScheduleBase {
  static instance = null;

  constructor() {
    if (ScheduleBase.instance) {
      return ScheduleBase.instance;
    }

    this.setupCrons();
    this.startDaywiseSchedule();
    this.startTodaySchedule();

    ScheduleBase.instance = this;
  }

  setupCrons() {
    return new Promise((resolve, reject) => {
      logger.info('Cron setup intialized...');

      schedule.scheduleJob('0 */12 * * *', () => {
        logger.info(`Cron started for day wise schedule on date ${moment()}`);
        this.startDaywiseSchedule();
      });

      schedule.scheduleJob('0 0 * * *', () => {
        logger.info(`Cron started for today schedules on date ${moment()}`);
        this.startTodaySchedule();
      });

      schedule.scheduleJob('0 1 * * *', () => {
        logger.info(
          `Cron started for removing all previous scheduled details on date ${moment()}`
        );
        this.remove3DaysBeforeScheduleInfo();
      });

      logger.info('Cron setup completed...');
      resolve();
    });
  }

  async startDaywiseSchedule() {
    logger.info('Day wise process started...');

    const currentDayOfWeek = moment.utc().day();
    const errorScheduleIds = [];
    const successScheduleIds = [];

    logger.info(`currentDayOfWeek ${currentDayOfWeek}`);

    try {
      await this.removeScheduleInfo(1);
      const scheduleInfos = await scheduleDetails.findAll({
        where: {
          [Operator.and]: [
            {
              running_days_of_weeks: {
                [Operator.like]: `%${String(currentDayOfWeek)}%`,
              },
            },
            {
              schedule_status: 1,
            },
          ],
        },
      });

      logger.info(`scheduleInfos ${JSON.stringify(scheduleInfos)}`);
      const currentDayOfWeek_1 = moment.utc().day();
      const currentHour = moment.utc().hour();
      let schedulePart = 0; // First half (0-11 - ForeNoon)

      if (currentHour > 11) {
        schedulePart = 1; // Second half (12-23 - Afternoon)
      }
      if (scheduleInfos.length > 0) {
        return Promise.all(
          scheduleInfos.map(scheduleDetail => {
            const scheduleId = scheduleDetail.schedule_id;
            const mongoId = scheduleDetail.mongo_schedule_id;
            const schedulePost = new SchedulePost();

            return schedulePost
              .getScheduleDetails(mongoId)
              .then(details => {
                logger.info(`details ${details}`);
                const allTimers = details.daywiseScheduleTimer;
                const timings = [];

                allTimers.forEach(dayDetails => {
                  if (dayDetails.dayId == currentDayOfWeek_1) {
                    dayDetails.timings.forEach(time => {
                      const newDate = moment().utcOffset(0);

                      newDate.set({
                        hour: time.getUTCHours(),
                        minute: time.getUTCMinutes(),
                        second: time.getUTCSeconds(),
                        millisecond: 0,
                      });
                      time = newDate.toISOString();
                      const timeHour = moment(time).utc().hour();
                      let timesNoon = 0;

                      if (timeHour > 11) timesNoon = 1; // Second half (12-23)

                      if (timesNoon == schedulePart) {
                        timings.push(time);
                      }
                    });
                  }
                });

                return timings;
              })
              .then(timings_1 => {
                if (timings_1.length > 0) {
                  return this.makeSchedule(scheduleId, timings_1, currentDayOfWeek)
                    .then(() => {
                      successScheduleIds.push(scheduleId);
                    })
                    .catch(() => {
                      errorScheduleIds.push(scheduleId);
                    });
                }
              })
              .catch(error => {
                logger.info(
                  `\n Error on Day wise Scheduler \n ${error.message}`
                );
              });
          })
        );
      }

      const response = {
        successScheduleIds,
        errorScheduleIds,
      };

      logger.info(`Success running times :${JSON.stringify(response)}`);

      return response;
    } catch (error_1) {
      throw new Error(`\n Error on Day wise Scheduler \n ${error_1.message}`);
    }
  }

  async startTodaySchedule() {
    logger.info('Started today scheduler functionality');
    const errorScheduleIds = [];
    const successScheduleIds = [];

    try {
      await this.removeScheduleInfo(0);
      const scheduleInfos = await scheduleDetails.findAll({
        where: {
          [Operator.and]: [
            {
              one_time_schedule_date: {
                [Operator.gte]: moment().startOf('day'),
              },
            },
            {
              one_time_schedule_date: {
                [Operator.lte]: moment().endOf('day'),
              },
            },
            {
              schedule_status: 1,
            },
          ],
        },
      });

      logger.info(
        `scheduleInfos count ${JSON.stringify(scheduleInfos.length)}`
      );
      if (scheduleInfos.length > 0) {
        return Promise.all(
          scheduleInfos.map(scheduleDetail => {
            const scheduleId = scheduleDetail.schedule_id;
            const timings = [];

            timings.push(
              moment.tz(scheduleDetail.one_time_schedule_date, 'GMT')
            );

            logger.info(
              `schedule id: ${scheduleId} and timing ${JSON.stringify(timings)}`
            );

            return this.makeSchedule(scheduleId, timings)
              .then(() => {
                successScheduleIds.push(scheduleId);
              })
              .catch(error => {
                errorScheduleIds.push(scheduleId);
                logger.info(
                  `\n Error or Expire date: \n ${JSON.stringify(error)}`
                );
              });
          })
        );
      }

      const response = {
        successScheduleIds,
        errorScheduleIds,
      };

      return response;
    } catch (error_1) {
      throw new Error(`\n Error on One time Scheduler \n ${error_1}`);
    }
  }

  remove7DaysBeforeScheduleInfo() {
    return scheduledInformations.destroy({
      where: {schedule_datetime: scheduleId},
    });
  }

  removeAllScheduleInfo() {
    return new Promise((resolve, reject) =>
      scheduledInformations
        .destroy({truncate: true})
        .then(() => {
          const jobNames = lodash.keys(schedule.scheduledJobs);

          for (const name of jobNames) schedule.cancelJob(name);
        })
        .then(() => {
          resolve('All schedules are removed completely!');
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  makeSchedule(scheduleId, runningTimes, currentDay) {
    return new Promise((resolve, reject) => {
      const todaysTimes = [];
      const scheduleObjects = [];
      const expiredTimes = [];

      runningTimes.forEach(element => {
        logger.info(`Received timings : ${element}`);

        const dayDifference = moment(element).diff(moment(), 'days');
        const todayTime = moment(element).add(dayDifference, 'days');

        // Todo : Production remove the following line
        // todayTime = moment().add(10, 'seconds');

        const timeDifference = todayTime.diff(moment(), 'minutes');

        if (timeDifference > 0) {
          logger.info(`Starts in ${timeDifference} minutes..`);
          todaysTimes.push(todayTime);
        } else {
          logger.info(`Expired before ${timeDifference * -1} minutes..`);
          expiredTimes.push(todayTime);
        }
      });

      if (todaysTimes.length > 0) {
        todaysTimes.forEach(timing => {
          const schedulerName = `${coreServices.getRandomCharacters(
            6
          )}_${coreServices.getRandomNumbers(4)}_${String(moment().unix())}`;

          const scheduleDate = new Date(timing);

          this.scheduleObject = {
            schedule_id: scheduleId,
            schedule_datetime: scheduleDate,
            scheduler_name: schedulerName,
            status: 0,
          };
          scheduleObjects.push(this.scheduleObject);

          schedule.scheduleJob(schedulerName, scheduleDate, () => {
            logger.info(
              `schedule time :${moment.now()},scheduleObjects: ${JSON.stringify(
                scheduleObjects
              )}`
            );
            logger.info(
              `schedule process started running! ${JSON.stringify(
                this.scheduleObject
              )}`
            );
            scheduleObjects.forEach(x => {
              if (x.scheduler_name == schedulerName) this.runScheduler(x, currentDay);
            });
          });

          // schedule.scheduleJob(schedulerName, scheduleDate, function (scheduleObject) {
          //     this.runScheduler(scheduleObject);
          // }.bind(null, scheduleObject));
        });
      }
      if (expiredTimes.length > 0) {
        expiredTimes.forEach(timing => {
          const schedulerName = `${coreServices.getRandomCharacters(
            6
          )}_${coreServices.getRandomNumbers(4)}_${String(moment().unix())}`;

          const scheduleDate = new Date(timing);
          const scheduleObject = {
            schedule_id: scheduleId,
            schedule_datetime: scheduleDate,
            scheduler_name: schedulerName,
            status: 6,
          };

          scheduleObjects.push(scheduleObject);
        });
      }

      if (scheduleObjects.length > 0) {
        return scheduledInformations
          .bulkCreate(scheduleObjects, {returning: true})
          .then(scheduledObjects => {
            const details = {
              scheduleObjects,
              expiredTimes,
            };

            resolve(details);
          });
      }
      const details = {
        expiredTimes,
      };

      reject(details);
    });
  }

  runScheduler(scheduleObject, currentDay) {
    logger.info(`\nSchedule Id ${scheduleObject.schedule_id} started...\n`);
    let mongoScheduleId = '';
    let scheduleStatus = 1;

    let scheduleFromTheDb = null;

    return scheduleDetails
      .findOne({where: {schedule_id: scheduleObject.schedule_id}})
      .then(scheduleDetailsData => {
        if (!scheduleDetailsData) {
          throw new Error('Not found');
        } else {
          mongoScheduleId = scheduleDetailsData.mongo_schedule_id;
          switch (scheduleDetailsData.schedule_status) {
            case 1: // Active
              scheduleStatus = 1; // Active
              break;
            case 2: // Paused
              scheduleStatus = 4; // Paused
              break;
            case 3: // Admin Permission
              scheduleStatus = 8; // Need Admin permission
              break;
            case 4: // Rejected
              scheduleStatus = 9; // Rejected by admin
              break;
            case 5: // Draft
              scheduleStatus = 7; // Draft in schedule_information
              break;
            case 6: // Completed
              scheduleStatus = 5; // Marked as Completed
              break;
            case 7: // Cancelled
              scheduleStatus = 10; // Cancelled
              break;
            default:
              break;
          }

          scheduleFromTheDb = scheduleDetailsData;

          return scheduledInformations.findOne({
            where: {scheduler_name: scheduleObject.scheduler_name},
          });
        }
      })
      .then(scheduleInfo => {
        logger.info(` \n Updating scheduler status as ${scheduleStatus} \n`);

        return scheduleInfo.update({status: scheduleStatus});
      })
      .then(() => {
        if (scheduleStatus == 1) {
          return SchedulePost.findById(mongoScheduleId)
            .then(mongoDetails => {
              let mediaUrl = [];

              if (mongoDetails.mediaSelectionType == 2)
                mediaUrl.push(mongoDetails.mediaUrl[0]);
              else if (mongoDetails.mediaSelectionType == 3) {
                const {length} = mongoDetails.mediaUrl;

                mediaUrl.push(
                  mongoDetails.mediaUrl[
                    Math.floor(Math.random() * Math.floor(length))
                  ]
                );
              } else mediaUrl = mongoDetails.mediaUrl;

              logger.info(' \n Found Mongo values \n');
              const postDetails = {
                message: mongoDetails.description,
                mediaPath: mediaUrl,
                link: mongoDetails.shareLink,
                postType: mongoDetails.postType,
                mongoScheduleId,
                moduleName: mongoDetails.moduleName,
                boardDetails: mongoDetails.pinBoards,
                ownerId: mongoDetails.ownerId,
                ownerName: mongoDetails.ownerName ?? '',
              };

              const postingSocialIds = [];

              mongoDetails.postingSocialIds.forEach(element => {
                postingSocialIds.push(element.accountId);
              });

              logger.info(
                `Post Details : ${JSON.stringify(
                  postDetails
                )} and Publishing Id : ${JSON.stringify(postingSocialIds)}`
              );

              if (postingSocialIds.length > 0) {
                publishController
                  .startPublish(
                    postDetails,
                    mongoDetails.teamId,
                    postingSocialIds
                  )
                  .then(() => this.changeDayWiseScheduleStatusAndCreateNewOne(scheduleFromTheDb))
                  .catch(error => {
                    logger.info(`failed..\n${error.error.message}`);

                    return this.changeDayWiseScheduleStatusAndCreateNewOne(scheduleFromTheDb);
                  });
              }
            })
            .catch(error => {
              logger.info(`cant able to fetch the mongo database..${error}`);
            });
        }
      })
      .catch(error => {
        logger.info(error.message);
      });
  }

  changeDayWiseScheduleStatusAndCreateNewOne(scheduleFromTheDb) {
    const {
      schedule_id: scheduleId,
      schedule_type: scheduleType,
      user_id: userId,
    } = scheduleFromTheDb;

    logger.info(`Start to change daywise schedule status of ${scheduleId}`);

    if (
      scheduleType === SCHEDULE_CONSTANTS.SCHEDULE_TYPES.ONETIME
    ) {
      logger.info(`Schedule ${scheduleId} is onetime. Changing status to done...`);
      return this.updateScheduleStatus(
        scheduleId,
        SCHEDULE_CONSTANTS.SCHEDULE_STATUSES.DONE,
      );
    }

    logger.info(`Schedule ${scheduleId} is daywise. Updating the status and adding a new shedule to the queue...`);

    return this.updateScheduleStatus(scheduleId, SCHEDULE_CONSTANTS.SCHEDULE_STATUSES.DONE)
      .then(() => {
        logger.info(`Schedule ${scheduleId}. Updated the status of the old schedule. Checking is the owner is not expired...`);

        return this.checkIsUserExpired(userId);
      })
      .then(isUserExpired => {
        if (isUserExpired) {
          logger.info(`Schedule ${scheduleId}. The owner account is expired. Stopping the script to add a new schedule to the queue...`);

          return;
        }

        logger.info(`Schedule ${scheduleId}. The owner account is valid. Adding a new schedule to the queue...`);

        return this.addExistedScheduleToQueue(scheduleFromTheDb);
      })
      .then(data => {
        if (!data) {
          logger.info(`Schedule ${scheduleId}. Only status was changed`);

          return;
        }

        logger.info(`Schedule ${scheduleId}. New schedule was created.`);
      })
      .catch(error => {
        logger.info(`Schedule ${scheduleId}. Adding schedule error ${error.message}`);
        logger.info(error);
      });
  }

  addExistedScheduleToQueue({
    schedule_type,
    module_name,
    schedule_status,
    mongo_schedule_id,
    one_time_schedule_date,
    running_days_of_weeks,
    user_id,
    team_id,
  }) {
    const createdDate = moment().toISOString();

    const endDate = moment().add(1, 'year').toISOString();

    return scheduleDetails.create({
      schedule_type,
      module_name,
      schedule_status,
      mongo_schedule_id,
      one_time_schedule_date,
      running_days_of_weeks,
      user_id,
      team_id,
      created_date: createdDate,
      end_date: endDate,
    });
  }

  removeScheduleInfo(scheduleType) {
    return new Promise((resolve, reject) => {
      let scheduleResponseIds = [];

      return scheduleDetails
        .findAll({
          where: {schedule_type: scheduleType},
          attributes: ['schedule_id'],
          raw: true,
        })
        .then(scheduleIds => {
          scheduleResponseIds = scheduleIds;

          scheduleResponseIds = scheduleIds.map(element => element.schedule_id);

          logger.info(scheduleResponseIds);

          return scheduledInformations
            .findAll({where: {schedule_id: scheduleResponseIds}})
            .then(scheduleInfoDetails => {
              if (scheduleInfoDetails.length > 0) {
                scheduleInfoDetails.forEach(element => {
                  const scheduleJobName =
                    schedule.scheduledJobs[element.scheduler_name];

                  if (scheduleJobName) scheduleJobName.cancel();
                });
              }
            });
        })
        .then(() =>
          scheduledInformations.destroy({
            where: {schedule_id: scheduleResponseIds},
          })
        )
        .then(() => resolve())
        .catch(error => {
          logger.info(error);
          reject(error);
        });
    });
  }

  cancelSchedule(scheduleId) {
    return new Promise((resolve, reject) =>
      scheduledInformations
        .findOne({
          where: {schedule_id: scheduleId},
        })
        .then(result => {
          if (!result)
            throw new Error('Cant able to find the schedule Information');
          else {
            const scheduleJobName =
              schedule.scheduledJobs[result.scheduler_name];

            if (scheduleJobName) {
              scheduleJobName.cancel();
            }

            return scheduledInformations.update(
              {status: 10},
              {where: {schedule_id: scheduleId}}
            );
          }
        })
        .then(() => {
          resolve('Schedule has been cancelled!');
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  createAutomatedRssSchedule(userId, teamId, rssDetails) {
    return new Promise((resolve, reject) => {
      if (!userId || !teamId || !rssDetails) {
        reject(new Error('Invalid Inputs'));
      } else resolve();
    });
  }

  createSchedulePost(mongoDetails) {
    const mongoObj = mongoDetails.toObject({
      transform: (doc, ret) => {
        const {
          _id,
          __v,
          createdDate,
          ownerId,
          ownerName,
          adminResponseStatus,
          ...args
        } = ret;

        return args;
      },
    });

    const updatedDaywiseScheduleTimer = mongoObj
      .daywiseScheduleTimer.map(({dayId, timings}) => {
        const updatedTimings = timings.map(timing => moment(timing).add(7, 'days').utc().toISOString());

        return {dayId, timings: updatedTimings};
      });

    const updatedPostingSocialIds = mongoObj
      .postingSocialIds.map(({_id, ...args}) => args);

    const schedulePost = {
      ...mongoObj,
      postingSocialIds: updatedPostingSocialIds,
      daywiseScheduleTimer: updatedDaywiseScheduleTimer,
    };

    return scheduleServise.getCreatePost({
      userId: mongoDetails.ownerId,
      userName: mongoDetails.ownerName,
    })(schedulePost);
  }

  async checkIsUserExpired(userId) {
    const user = await this.getUserActivationDetailsProfile(userId);

    const {account_expire_date: expireDate} = user.Activations;

    const overtime = moment(expireDate).diff(moment(), 'days');

    return overtime < 0;
  }

  updateScheduleStatus(scheduleId, status) {
    return scheduleDetails.update(
      {
        schedule_status: status,
      },
      {where: {schedule_id: scheduleId}},
    );
  }

  getUserActivationDetailsProfile(userId) {
    return userDetails.findOne(
      {
        where: {
          user_id: userId,
        },
        include: [
          {
            model: db.user_activations,
            where: {
              id: {[Operator.col]: 'user_activation_id'},
            },
            as: 'Activations',
          },
        ],
        raw: true,
        nest: true,
      },
    );
  }
}

export default ScheduleBase;
