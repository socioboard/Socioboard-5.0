import schedule from 'node-schedule'
import lodash from 'lodash'
import moment from 'moment'
import config from 'config'
import db from '../../../Common/Sequelize-cli/models/index.js'
import SchedulePost from '../../../Common/Mongoose/models/scheduleposts.js'
import publishController from '../publish/publish.controller.js'
import CoreServices from '../../../Common/Services/core.services.js'
const coreServices = new CoreServices(config.get('authorize'));
import logger from '../../resources/Log/logger.log.js'

const scheduledInformations = db.scheduled_informations;
const scheduleDetails = db.users_schedule_details;
const Operator = db.Sequelize.Op;


class ScheduleBase {
    constructor() {
        this.setupCrons()
    }
    setupCrons() {
        return new Promise((resolve, reject) => {
            logger.info("Cron setup intialized...");

            schedule.scheduleJob('0 */12 * * *', () => {
                logger.info(`Cron started for day wise schedule on date ${moment()}`);
                this.startDaywiseSchedule();
            });

            schedule.scheduleJob('0 0 * * *', () => {
                logger.info(`Cron started for today schedules on date ${moment()}`);
                this.startTodaySchedule();
            });

            schedule.scheduleJob('0 1 * * *', () => {
                logger.info(`Cron started for removing all previous scheduled details on date ${moment()}`);
                this.remove3DaysBeforeScheduleInfo();
            });

            logger.info("Cron setup completed...");
            resolve();
        });
    }

    async startDaywiseSchedule() {
        logger.info("Day wise process started...");

        var currentDayOfWeek = moment.utc().day();
        var errorScheduleIds = [];
        var successScheduleIds = [];

        logger.info(`currentDayOfWeek ${currentDayOfWeek}`)

        try {
            await this.removeScheduleInfo(1)
            let scheduleInfos = await scheduleDetails.findAll({
                where: {
                    [Operator.and]: [{
                        running_days_of_weeks: {
                            [Operator.like]: `%${String(currentDayOfWeek)}%`
                        }
                    }, {
                        schedule_status: 1
                    }]
                }
            })

            logger.info(`scheduleInfos ${JSON.stringify(scheduleInfos)}`)
            var currentDayOfWeek_1 = moment.utc().day()
            var currentHour = moment.utc().hour()
            var schedulePart = 0 // First half (0-11 - ForeNoon)
            if (currentHour > 11) {
                schedulePart = 1 // Second half (12-23 - Afternoon)
            }
            if (scheduleInfos.length > 0) {
                return Promise.all(scheduleInfos.map((scheduleDetail) => {
                    var scheduleId = scheduleDetail.schedule_id
                    var mongoId = scheduleDetail.mongo_schedule_id
                    var schedulePost = new SchedulePost()
                    return schedulePost.getScheduleDetails(mongoId)
                        .then((details) => {
                            logger.info(`details ${details}`)
                            var allTimers = details.daywiseScheduleTimer
                            var timings = []
                            allTimers.forEach(dayDetails => {
                                if (dayDetails.dayId == currentDayOfWeek_1) {
                                    dayDetails.timings.forEach(time => {
                                        var newDate = moment().utcOffset(0);
                                        newDate.set({ hour: time.getUTCHours(), minute: time.getUTCMinutes(), second: time.getUTCSeconds(), millisecond: 0 })
                                        time = newDate.toISOString()
                                        var timeHour = moment(time).utc().hour()
                                        var timesNoon = 0
                                        if (timeHour > 11)
                                            timesNoon = 1 // Second half (12-23)

                                        if (timesNoon == schedulePart) {
                                            timings.push(time)
                                        }
                                    })
                                }
                            })
                            return timings
                        })
                        .then((timings_1) => {
                            if (timings_1.length > 0) {
                                return this.makeSchedule(scheduleId, timings_1)
                                    .then(() => {
                                        successScheduleIds.push(scheduleId)
                                    })
                                    .catch(() => {
                                        errorScheduleIds.push(scheduleId)
                                    })
                            }
                        })
                        .catch((error) => {
                            logger.info(`\n Error on Day wise Scheduler \n ${error.message}`)
                        })
                }))
            }



            var response = {
                successScheduleIds: successScheduleIds,
                errorScheduleIds: errorScheduleIds
            }
            logger.info(`Success running times :${JSON.stringify(response)}`)
            return response
        } catch (error_1) {
            throw new Error(`\n Error on Day wise Scheduler \n ${error_1.message}`)
        }
    }

    async startTodaySchedule() {
        logger.info("Started today scheduler functionality");
        var errorScheduleIds = [];
        var successScheduleIds = [];

        try {
            await this.removeScheduleInfo(0)
            let scheduleInfos = await scheduleDetails.findAll({
                where: {
                    [Operator.and]: [{
                        one_time_schedule_date: {
                            [Operator.gte]: moment().startOf('day'),
                        }
                    }, {
                        one_time_schedule_date: {
                            [Operator.lte]: moment().endOf('day'),
                        }
                    }, {
                        schedule_status: 1
                    }]
                }
            })
            logger.info(`scheduleInfos count ${JSON.stringify(scheduleInfos.length)}`)
            if (scheduleInfos.length > 0) {
                return Promise.all(scheduleInfos.map((scheduleDetail) => {
                    var scheduleId = scheduleDetail.schedule_id
                    var timings = []
                    timings.push((moment.tz(scheduleDetail.one_time_schedule_date, 'GMT')))

                    logger.info(`schedule id: ${scheduleId} and timing ${JSON.stringify(timings)}`)

                    return this.makeSchedule(scheduleId, timings)
                        .then(() => {
                            successScheduleIds.push(scheduleId)
                        })
                        .catch((error) => {
                            errorScheduleIds.push(scheduleId)
                            logger.info(`\n Error or Expire date: \n ${JSON.stringify(error)}`)
                            return
                        })
                }))
            }



            var response = {
                successScheduleIds: successScheduleIds,
                errorScheduleIds: errorScheduleIds
            }
            return response
        } catch (error_1) {
            throw new Error(`\n Error on One time Scheduler \n ${error_1}`)
        }
    }

    remove7DaysBeforeScheduleInfo() {
        return scheduledInformations.destroy({ where: { schedule_datetime: scheduleId } });
    }

    removeAllScheduleInfo() {
        return new Promise((resolve, reject) => {
            return scheduledInformations.destroy({ truncate: true })
                .then(() => {
                    const jobNames = lodash.keys(schedule.scheduledJobs);
                    for (let name of jobNames)
                        schedule.cancelJob(name);
                })
                .then(() => {
                    resolve("All schedules are removed completely!");
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    makeSchedule(scheduleId, runningTimes) {
        return new Promise((resolve, reject) => {
            var todaysTimes = [];
            var scheduleObjects = [];
            var expiredTimes = [];
            runningTimes.forEach(element => {

                logger.info(`Received timings : ${element}`);

                var dayDifference = moment(element).diff(moment(), 'days');
                var todayTime = moment(element).add(dayDifference, 'days');

                // Todo : Production remove the following line 
                //todayTime = moment().add(10, 'seconds');

                var timeDifference = todayTime.diff(moment(), 'minutes');
                if (timeDifference > 0) {
                    logger.info(`Starts in ${timeDifference} minutes..`);
                    todaysTimes.push(todayTime);
                }
                else {
                    logger.info(`Expired before ${((timeDifference) * -1)} minutes..`);
                    expiredTimes.push(todayTime);
                }
            });

            if (todaysTimes.length > 0) {

                todaysTimes.forEach(timing => {

                    var schedulerName = `${coreServices.getRandomCharacters(6)}_${coreServices.getRandomNumbers(4)}_${String(moment().unix())}`;

                    var scheduleDate = new Date(timing);
                    this.scheduleObject = {
                        schedule_id: scheduleId,
                        schedule_datetime: scheduleDate,
                        scheduler_name: schedulerName,
                        status: 0
                    };
                    scheduleObjects.push(this.scheduleObject);

                    schedule.scheduleJob(schedulerName, scheduleDate, () => {
                        logger.info(`schedule time :${moment.now()},scheduleObjects: ${JSON.stringify(scheduleObjects)}`)
                        logger.info(`schedule process started running! ${JSON.stringify(this.scheduleObject)}`);
                        scheduleObjects.map(x => {
                            if (x.scheduler_name == schedulerName)
                                this.runScheduler(x);
                        })
                    });

                    // schedule.scheduleJob(schedulerName, scheduleDate, function (scheduleObject) {
                    //     this.runScheduler(scheduleObject);
                    // }.bind(null, scheduleObject));

                });
            }
            if (expiredTimes.length > 0) {
                expiredTimes.forEach(timing => {
                    var schedulerName = `${coreServices.getRandomCharacters(6)}_${coreServices.getRandomNumbers(4)}_${String(moment().unix())}`;

                    var scheduleDate = new Date(timing);
                    var scheduleObject = {
                        schedule_id: scheduleId,
                        schedule_datetime: scheduleDate,
                        scheduler_name: schedulerName,
                        status: 6
                    };
                    scheduleObjects.push(scheduleObject);
                });
            }

            if (scheduleObjects.length > 0) {
                return scheduledInformations.bulkCreate(scheduleObjects, { returning: true })
                    .then((scheduledObjects) => {
                        var details = {
                            scheduleObjects: scheduleObjects,
                            expiredTimes: expiredTimes
                        };
                        resolve(details);
                    });
            } else {
                var details = {
                    expiredTimes: expiredTimes
                };
                reject(details);
            }
        });
    }

    runScheduler(scheduleObject) {
        logger.info(`\nSchedule Id ${scheduleObject.schedule_id} started...\n`);
        var mongoScheduleId = '';
        var scheduleStatus = 1;

        return scheduleDetails.findOne({ where: { schedule_id: scheduleObject.schedule_id } })
            .then((scheduleDetailsData) => {
                if (!scheduleDetailsData) {
                    throw new Error("Not found");
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
                    return scheduledInformations.findOne({
                        where: { scheduler_name: scheduleObject.scheduler_name }
                    });
                }
            })
            .then((scheduleInfo) => {
                logger.info(` \n Updating scheduler status as ${scheduleStatus} \n`);
                return scheduleInfo.update({ status: scheduleStatus });
            })
            .then(() => {

                if (scheduleStatus == 1) {
                    return SchedulePost.findById(mongoScheduleId)
                        .then((mongoDetails) => {


                            var mediaUrl = [];
                            if (mongoDetails.mediaSelectionType == 2)
                                mediaUrl.push(mongoDetails.mediaUrl[0]);
                            else if (mongoDetails.mediaSelectionType == 3) {
                                var length = mongoDetails.mediaUrl.length;
                                mediaUrl.push(mongoDetails.mediaUrl[Math.floor(Math.random() * Math.floor(length))]);
                            }
                            else mediaUrl = mongoDetails.mediaUrl;

                            logger.info(` \n Found Mongo values \n`);
                            var postDetails = {
                                message: mongoDetails.description,
                                mediaPath: mediaUrl,
                                link: mongoDetails.shareLink,
                                postType: mongoDetails.postType,
                                mongoScheduleId: mongoScheduleId,
                                moduleName: mongoDetails.moduleName,
                                boardDetails: mongoDetails.pinBoards
                            };

                            var postingSocialIds = [];
                            mongoDetails.postingSocialIds.forEach(element => {
                                postingSocialIds.push(element.accountId);
                            });

                            logger.info(`Post Details : ${JSON.stringify(postDetails)} and Publishing Id : ${JSON.stringify(postingSocialIds)}`)

                            if (postingSocialIds.length > 0) {
                                publishController.startPublish(postDetails, mongoDetails.teamId, postingSocialIds)
                                    .then((details) => {
                                        logger.info(`Publishing under process..`);
                                        return scheduleDetails.update({
                                            schedule_status: 6
                                        }, { where: { schedule_id: scheduleObject.schedule_id } });
                                    })
                                    .catch((error) => {
                                        logger.info(`failed..\n${error.error.message}`);
                                    });
                            }
                        })
                        .catch((error) => {
                            logger.info(`cant able to fetch the mongo database..${error}`);
                        });
                }
            })
            .catch((error) => {
                logger.info(error.message);
            });
    }

    removeScheduleInfo(scheduleType) {
        return new Promise((resolve, reject) => {
            var scheduleResponseIds = [];
            return scheduleDetails.findAll(
                {
                    where: { schedule_type: scheduleType },
                    attributes: ['schedule_id'],
                    raw: true
                })
                .then((scheduleIds) => {

                    scheduleResponseIds = scheduleIds;

                    scheduleResponseIds = scheduleIds.map(element => {
                        return element.schedule_id;
                    });

                    logger.info(scheduleResponseIds);

                    return scheduledInformations.findAll({ where: { schedule_id: scheduleResponseIds } })
                        .then((scheduleInfoDetails) => {
                            if (scheduleInfoDetails.length > 0) {
                                scheduleInfoDetails.forEach(element => {
                                    var scheduleJobName = schedule.scheduledJobs[element.scheduler_name];
                                    if (scheduleJobName)
                                        scheduleJobName.cancel();
                                });
                            }
                        });
                })
                .then(() => {
                    return scheduledInformations.destroy({ where: { schedule_id: scheduleResponseIds } });
                })
                .then(() => resolve())
                .catch((error) => {
                    logger.info(error);
                    reject(error);
                });
        });
    }

    cancelSchedule(scheduleId) {

        return new Promise((resolve, reject) => {
            return scheduledInformations.findOne({
                where: { schedule_id: scheduleId }
            })
                .then((result) => {
                    if (!result)
                        throw new Error("Cant able to find the schedule Information");
                    else {
                        var scheduleJobName = schedule.scheduledJobs[result.scheduler_name];
                        if (scheduleJobName) {
                            scheduleJobName.cancel();
                        }
                        return scheduledInformations.update({ status: 10 }, { where: { schedule_id: scheduleId } });
                    }
                })
                .then(() => {
                    resolve("Schedule has been cancelled!");
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    createAutomatedRssSchedule(userId, teamId, rssDetails) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !rssDetails) {
                reject(new Error("Invalid Inputs"));
            } else
                resolve();
        });
    }

}


export default ScheduleBase;

