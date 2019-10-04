const schedule = require('node-schedule');
const lodash = require('lodash');
const moment = require('moment');
const config = require('config');
const url = require('url');
const db = require('../../../../library/sequelize-cli/models/index');
const SchedulePost = require(`../../../../library/mongoose/models/scheduleposts`);
const AutomatedRssMongoModel = require('../../../../library/mongoose/models/automatedrss');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');
const publishController = require(`../../publish/controllers/publishController`);
const CoreServices = require('../../../../library/utility/coreServices');
const TrendsServices = require('../../../../library/network/trends');
const coreServices = new CoreServices(config.get('authorize'));
const ScheduleLibs = require('../../scheduler/utils/schedulerlibs');
const logger = require('../../../utils/logger');

const scheduledInformations = db.scheduled_informations;
const scheduleDetails = db.users_schedule_details;
const Operator = db.Sequelize.Op;


class ScheduleBase {
    constructor() {
        this.trendsServices = new TrendsServices();
        Object.assign(this, UserTeamAccount);
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

            schedule.scheduleJob('0 3 * * * *', () => {
                logger.info(`Cron started for Automated rss on date ${moment()}`);
                this.startRssSchedule();
            });

            schedule.scheduleJob('0 10 * * *', () => {
                logger.info(`Cron started for removing all previous scheduled details on date ${moment()}`);
                this.remove3DaysBeforeScheduleInfo();
            });

            logger.info("Cron setup completed...");
            resolve();
        });
    }

    startDaywiseSchedule() {
        logger.info("Day wise process started...");

        var currentDayOfWeek = moment.utc().day();
        var errorScheduleIds = [];
        var successScheduleIds = [];


        return this.removeScheduleInfo(1)
            .then(() => {
                return scheduleDetails.findAll({
                    where: {
                        [Operator.and]: [{
                            running_days_of_weeks: {
                                [Operator.like]: `%${String(currentDayOfWeek)}%`
                            }
                        }, {
                            schedule_status: 1
                        }]
                    }
                });
            })
            .then((scheduleInfos) => {
                var currentDayOfWeek = moment.utc().day();
                var currentHour = moment.utc().hour();
                var schedulePart = 0; // First half (0-11 - ForeNoon)
                if (currentHour > 11) {
                    schedulePart = 1; // Second half (12-23 - Afternoon)
                }
                if (scheduleInfos.length > 0) {
                    return Promise.all(scheduleInfos.map((scheduleDetail) => {
                        var scheduleId = scheduleDetail.schedule_id;
                        var mongoId = scheduleDetail.mongo_schedule_id;
                        var schedulePost = new SchedulePost();
                        return schedulePost.getScheduleDetails(mongoId)
                            .then((details) => {
                                var allTimers = details.daywiseScheduleTimer;
                                var timings = [];
                                allTimers.forEach(dayDetails => {
                                    if (dayDetails.dayId == currentDayOfWeek) {
                                        dayDetails.timings.forEach(time => {
                                            var timeHour = moment(time).utc().hour();
                                            var timesNoon = 0;
                                            if (timeHour > 11)
                                                timesNoon = 1; // Second half (12-23)

                                            if (timesNoon == schedulePart) {
                                                timings.push(time);
                                            }
                                        });
                                    }
                                });
                                return timings;
                            })
                            .then((timings) => {
                                if (timings.length > 0) {
                                    return this.makeSchedule(scheduleId, timings)
                                        .then(() => {
                                            successScheduleIds.push(scheduleId);
                                        })
                                        .catch(() => {
                                            errorScheduleIds.push(scheduleId);
                                        });
                                }
                            })
                            .catch((error) => {
                                logger.info(`\n Error on Day wise Scheduler \n ${error.message}`);
                            });
                    }));
                }
                return;
            })
            .then(() => {
                var response = {
                    successScheduleIds: successScheduleIds,
                    errorScheduleIds: errorScheduleIds
                };
                logger.info(`Success running times :${JSON.stringify(response)}`);
                return response;
            })
            .catch((error) => {
                throw new Error(`\n Error on Day wise Scheduler \n ${error.message}`);
            });
    }

    startTodaySchedule() {
        logger.info("Started today scheduler functionality");
        var errorScheduleIds = [];
        var successScheduleIds = [];

        return this.removeScheduleInfo(0)
            .then(() => {
                return scheduleDetails.findAll({
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
                });
            })
            .then((scheduleInfos) => {
                logger.info(`scheduleInfos count ${scheduleInfos.length}`);
                if (scheduleInfos.length > 0) {
                    return Promise.all(scheduleInfos.map((scheduleDetail) => {
                        var scheduleId = scheduleDetail.schedule_id;
                        var timings = [];
                        timings.push((moment.tz(scheduleDetail.one_time_schedule_date, 'GMT')));

                        logger.info(`schedule id: ${scheduleId} and timing ${JSON.stringify(timings)}`);

                        return this.makeSchedule(scheduleId, timings)
                            .then(() => {
                                successScheduleIds.push(scheduleId);
                            })
                            .catch((error) => {
                                errorScheduleIds.push(scheduleId);
                                logger.info(`\n Error or Expire date: \n ${JSON.stringify(error)}`);
                                return;
                            });
                    }));
                }
                return;
            })
            .then(() => {
                var response = {
                    successScheduleIds: successScheduleIds,
                    errorScheduleIds: errorScheduleIds
                };
                return response;
            })
            .catch((error) => {
                throw new Error(`\n Error on One time Scheduler \n ${error}`);
            });
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

            if (!scheduleId || !runningTimes) {
                reject(new Error('Invalid SchedukId or times'));
            } else {
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
                            logger.info("schedule process started running!");
                            this.runScheduler(this.scheduleObject);
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
            }
        });
    }

    runScheduler(scheduleObject) {
        logger.info(`\nSchedule Id ${scheduleObject.schedule_id} started...\n`);
        var mongoScheduleId = '';
        var scheduleStatus = 1;
        var scheduleData = '';
        return scheduleDetails.findOne({ where: { schedule_id: scheduleObject.schedule_id } })
            .then((scheduleDetailsData) => {
                if (!scheduleDetailsData) {
                    throw new Error("Not found");
                } else {
                    scheduleData = scheduleDetailsData;
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
                if (scheduleData.schedule_type != 2) {
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

                                logger.info(`Post Details : ${JSON.stringify(postDetails)} and Publishing Id : ${JSON.stringify(postingSocialIds)}`);

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
                            .catch(() => {
                                logger.info(`cant able to fetch the mongo database..`);
                            });
                    }
                }
                if (scheduleData.schedule_type == 2) {
                    if (scheduleStatus == 1) {
                        logger.info(mongoScheduleId, "mongoscheduleId");
                        // var automatedRssMongoModelObject = new AutomatedRssMongoModel();
                        return AutomatedRssMongoModel.findById(mongoScheduleId)
                            .then((mongoDetails) => {
                                logger.info("\n\n", mongoDetails, "mongoDetails");
                                var RandomRssData = [];
                                if (mongoDetails.rssDetails) {
                                    return this.fetchRandomRssMediaUrl(mongoDetails.rssDetails[0].rss_feed_url)
                                        .then((data) => {
                                            logger.info('data \n', data);
                                            RandomRssData = data;

                                            logger.info(` \n Found Mongo values \n`);
                                            var postDetails = {
                                                message: RandomRssData.title,
                                                link: RandomRssData.mediaUrl,
                                                postType: "Link",
                                                mongoScheduleId: mongoScheduleId,
                                                moduleName: "rss",
                                                mediaPath: '',
                                                boardDetails: ''
                                            };

                                            var postingSocialIds = [];
                                            mongoDetails.rssDetails[0].account_ids.forEach(element => {
                                                postingSocialIds.push(element.accountId);
                                            });

                                            logger.info(`Post Details : ${JSON.stringify(postDetails)} and Publishing Id : ${JSON.stringify(postingSocialIds)}`);

                                            if (postingSocialIds.length > 0) {
                                                return publishController.startPublish(postDetails, mongoDetails.teamId, postingSocialIds)
                                                    .then((details) => {
                                                        logger.info(`Publishing under process..`);
                                                        if (scheduleData.end_date <= moment()) {
                                                            return scheduleDetails.update({
                                                                schedule_status: 6
                                                            }, { where: { schedule_id: scheduleObject.schedule_id } });
                                                        }
                                                        else return;
                                                    })
                                                    .catch((error) => {
                                                        logger.info(`failed..\n${error.error.message}`);
                                                    });
                                            }
                                        }).catch((error) => {
                                            logger.info('error', error);
                                            reject(error);
                                        });
                                }
                            })
                            .catch(() => {
                                logger.info(`cant able to fetch the mongo database..`);
                            });
                    }
                }
            })
            .catch((error) => {
                logger.info(error.message);
                return error;
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
            if (!userId || !teamId || !rssDetails)
                reject(new Error("Invalid Inputs"));
            if (rssDetails.rss_feed_url == "string" || rssDetails.rss_feed_url == null && rssDetails.account_ids.length > 0)
                reject(new Error('Invalid rss data'));
            if (!Boolean(rssDetails.custom_interval))
                reject(new Error('Invalid time Interval'));
            else {
                if (rssDetails.start_date && rssDetails.end_date) {
                    if (rssDetails.start_date <= moment.now() || (rssDetails.start_date > rssDetails.end_date))
                        reject(new Error('please check that end date should be greater than start date.'));
                }
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var result = url.parse(rssDetails.rss_feed_url);
                        if (result.protocol == "http:") {
                            throw new Error("Sorry, Rss feed only support https protocol");
                        }
                        var rssData = {
                            teamId: teamId,
                            userId: userId,
                            rssDetails: rssDetails
                        };
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.insertRss(rssData)
                            .then((response) => {
                                resolve(response);
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

    getAutomatedRss(userId, teamId, pageId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var offset = (pageId - 1) * config.get('perPageLimit');
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.getRss(teamId, offset, config.get('perPageLimit'))
                            .then((response) => {
                                resolve({ count: response.length, response: response });
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

    updateAutomatedRss(userId, teamId, scheduleId, rssDetails) {
        return new Promise((resolve, reject) => {
            if (!userId || !rssDetails) {
                reject(new Error("Invalid Inputs"));
            } else {
                var scheduleIdDetails = {};
                var scheduleMongoId = null;
                var runningDays = "";
                var todaysTiming = [];
                var endDate = '';

                return scheduleDetails.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            schedule_id: scheduleId
                        }, {
                            schedule_status: [1, 3]
                        }, {
                            team_id: teamId
                        }, {
                            schedule_type: 2
                        }]
                    }
                })
                    .then((scheduleData) => {
                        if (!scheduleData)
                            throw new Error("Schedule details aren't available to edit, Please make sure following,  1.schedule should be in ready., \n\r 2. valid teamId!, \n\r 3.it's not rss");
                        else {
                            scheduleIdDetails = scheduleData;
                            return scheduledInformations.findAll({ where: { schedule_id: scheduleId } });
                        }
                    })
                    .then((scheduleInfo) => {
                        if (scheduleInfo.length > 0) {
                            scheduleInfo.forEach(element => {
                                var scheduleJob = schedule.scheduledJobs[element.scheduler_name];
                                logger.info(scheduleJob);
                                if (scheduleJob) {
                                    logger.info("Running schedule has been cancelled!");
                                    scheduleJob.cancel();
                                }
                            });
                        }
                        return;
                    })
                    .then(() => {
                        return scheduledInformations.destroy({ where: { schedule_id: scheduleId } });
                    })
                    .then(() => {
                        rssDetails.userId = userId;
                        rssDetails.teamId = scheduleIdDetails.team_id;
                        rssDetails.scheduleStatus = scheduleIdDetails.schedule_status;

                        var updateData = {
                            custom_interval: Number(rssDetails.custom_interval),
                            start_date: rssDetails.start_date,
                            end_date: rssDetails.end_date,
                        };
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.updateRss(teamId, updateData);
                    })
                    .then((response) => {
                        logger.info('updated response \n ', response);
                        logger.info("schedule details are saved in mongo!");
                        scheduleMongoId = response._id;
                        var startDate = moment(rssDetails.start_date);
                        var interval = rssDetails.custom_interval;
                        if (rssDetails.end_date > moment().endOf('day'))
                            endDate = moment(startDate).endOf('day');
                        else
                            endDate = moment(rssDetails.end_date);
                        logger.info("schedule details are saved in mongo!");
                        var schedulelibs = new ScheduleLibs();
                        return schedulelibs.getTimeIntervals(startDate, endDate, interval)
                            .then((scheduleTimings) => {
                                logger.info('scheduleTimings');
                                return schedulelibs.getRunningDayAndTodayTimings(scheduleTimings)
                                    .then((result) => {
                                        runningDays = result.runningDays ? result.runningDays : 'onetimeschedule';
                                        todaysTiming = result.todaysTiming;
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            });
                    })
                    .then(() => {
                        logger.info(`Today Schedule Timings : ${JSON.stringify(todaysTiming)}`);
                        logger.info(`Today Schedule Timings : `);

                        // Add to schedule_details queue
                        return scheduleDetails.create({
                            schedule_type: 2,
                            module_name: "rss",
                            schedule_status: 1,
                            //scheduleStatus : 1=ready queue, 2=wait(pause) state, 3= approvalpending, 4=rejected, 5=draft, 6=done            
                            mongo_schedule_id: String(scheduleMongoId),
                            one_time_schedule_date: rssDetails.start_date,
                            running_days_of_weeks: runningDays,
                            created_date: moment.utc(),
                            start_date: rssDetails.start_date,
                            end_date: rssDetails.end_date,
                            interval: rssDetails.custom_interval,
                            user_id: userId,
                            team_id: teamId
                        });
                    })
                    .then((response) => {
                        logger.info('final');
                        var scheduledId = response.schedule_id;
                        if (todaysTiming.length > 0) {
                            logger.info('making schedule');
                            return this.makeSchedule(scheduledId, todaysTiming)
                                .then((response) => {
                                    resolve({ code: 200, status: "success", scheduleInfo: response });
                                })
                                .catch((expiredTimings) => {
                                    resolve({ code: 200, status: "success", expiredTimings: expiredTimings });
                                });

                        }
                        else {
                            return 'success fully created.';
                        }
                    })
                    .then(() => {
                        resolve("schedule details are updated successfully");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    updateAutomatedRssOld(userId, teamId, rssDetails) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !rssDetails)
                reject(new Error("Invalid Inputs"));
            if (!Boolean(rssDetails.custom_interval))
                reject(new Error('Invalid time Interval'));
            if ((rssDetails.start_date > rssDetails.end_date))
                reject(new Error('please check that end date should be greater than start date.'));
            else {
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var updateData = {
                            custom_interval: Number(rssDetails.custom_interval),
                            start_date: rssDetails.start_date,
                            end_date: rssDetails.end_date,
                        };
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.updateRss(teamId, updateData)
                            .then((response) => {
                                resolve(response);
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

    deleteAutomatedRss(userId, teamId, rssId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !rssId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.deleteRss(teamId, rssId)
                            .then((response) => {
                                resolve(response);
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

    fetchRandomRssMediaUrl(rssurl) {
        return new Promise((resolve, reject) => {
            if (!rssurl) {
                reject(new Error('Invalid Inputs'));
            }
            else {
                return this.trendsServices.fetchRssFeeds(rssurl)
                    .then((result) => {
                        if (result && result.length > 0) {
                            var data = {};
                            var randomIndex = Math.floor(Math.random() * result.length);
                            logger.info(result[randomIndex], "random rss data");
                            data.mediaUrl = result[randomIndex].mediaUrl;
                            data.title = result[randomIndex].title;
                            resolve(data);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    startRssSchedule() {
        return new Promise((resolve, reject) => {
            var startDate = moment().startOf('day');
            var endData = moment().endOf('day');
            var automatedRssMongoModelObject = AutomatedRssMongoModel();

            return scheduleDetails.findAll({
                where: {
                    [Operator.and]: [{
                        start_date: {
                            [Operator.and]: [{ $gte: moment().startOf('day') }, { $lte: moment().endOf('day') }]
                        },

                    }, {
                        schedule_status: 1
                    },
                    { schedule_type: 2 },]
                }
            })
                .then((scheduleInfos) => {
                    var currentDayOfWeek = moment.utc().day();
                    var currentHour = moment.utc().hour();
                    var schedulePart = 0; // First half (0-11 - ForeNoon)
                    if (currentHour > 11) {
                        schedulePart = 1; // Second half (12-23 - Afternoon)
                    }
                    if (scheduleInfos.length > 0) {
                        var startDate = '';
                        var endData = '';
                        var Interval = '';
                        return Promise.all(scheduleInfos.map((scheduleDetail) => {
                            var scheduleId = scheduleDetail.schedule_id;
                            var mongoId = scheduleDetail.mongo_schedule_id;
                            var automatedRssMongoModelObject = new AutomatedRssMongoModel();
                            return automatedRssMongoModelObject.getScheduleDetails(mongoId)
                                .then((details) => {
                                    if (details.rssDetails[0].start_date) {
                                        if (details.rssDetails[0].start_date < moment().startOf('day'))
                                            startDate = moment().startOf('day');
                                        else
                                            startDate = details.rssDetails[0].start_date;
                                    }
                                    if (details.rssDetails[0].end_date) {
                                        if (details.rssDetails[0].end_date) {
                                            if (details.rssDetails[0].end_date > moment().startOf('day'))
                                                endData = moment().endOf('day');
                                            else
                                                endData = details.rssDetails[0].end_date;
                                        }
                                    }

                                    var schedulelibs = new ScheduleLibs();
                                    return schedulelibs.getTimeIntervals(startDate, endData, details.rssDetails[0].custom_interval);
                                })
                                .then((timings) => {
                                    if (timings.length > 0) {
                                        return this.makeSchedule(scheduleId, timings)
                                            .then(() => {
                                                successScheduleIds.push(scheduleId);
                                            })
                                            .catch(() => {
                                                errorScheduleIds.push(scheduleId);
                                            });
                                    }
                                })
                                .catch((error) => {
                                    logger.info(`\n Error on Day wise Scheduler \n ${error.message}`);
                                });
                        }));
                    }
                    return;
                })
                .then(() => {
                    var response = {
                        successScheduleIds: successScheduleIds,
                        errorScheduleIds: errorScheduleIds
                    };
                    logger.info(`Success running times :${JSON.stringify(response)}`);
                    return response;
                })
                .catch((error) => {
                    throw new Error(`\n Error on Day wise Scheduler \n ${error.message}`);
                });
        });
    }

}


module.exports = ScheduleBase;

