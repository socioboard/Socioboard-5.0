const moment = require('moment');
const schedule = require('node-schedule');
const config = require('config');
const logger = require('../../../utils/logger');
const SchedulePost = require('../../../../library/mongoose/models/scheduleposts');
const ScheduleBase = require('../utils/schedulebase');
const TaskModel = require('../../../../library/mongoose/models/taskmodels');
const AutomatedRssMongoModel = require('../../../../library/mongoose/models/automatedrss');
const url = require('url');

const db = require('../../../../library/sequelize-cli/models/index');
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
        return new Promise((resolve, reject) => {
            return scheduleDetails.count({
                where: {
                    [Operator.and]: [{
                        schedule_status: 0
                    }, {
                        user_id: userId
                    }]
                }
            })
                .then((activeScheduleCount) => {
                    resolve(activeScheduleCount);
                })
                .catch(() => {
                    reject(new Error("Cant able to get the active schedule count of specified user."));
                });
        });
    }

    getTeamsAllAdmin(teamId) {
        return new Promise((resolve, reject) => {
            if (!teamId) {
                reject(new Error("Invalid teamId"));
            } else {
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

    getRunningDayAndTodayTimings(scheduleTimer) {

        return new Promise((resolve, reject) => {
            if (!scheduleTimer && scheduleTimer.length == 0) {
                reject(new Error("Invalid Timers"));
            } else {
                var currentDayOfWeek = moment.utc().day();

                // schedulePart : 0 => First half (0-11) 
                // schedulePart : 1=> Second half (12-23)
                var schedulePart = moment.utc().hour() > 11 ? 1 : 0;

                var todaysTiming = [];
                var runningDays = null;
                scheduleTimer.forEach((runningDay) => {
                    if (runningDay.dayId == undefined || runningDay.dayId == null) {
                        if (moment().utc().startOf('day').isSame(moment(runningDay).utc().startOf('day')))
                            todaysTiming.push(runningDay);
                    } else {
                        if (runningDay.dayId == currentDayOfWeek) {
                            runningDay.timings.forEach(time => {
                                var timesNoon = moment(time).utc().hour() > 11 ? 1 : 0;
                                if (timesNoon == schedulePart) {
                                    todaysTiming.push(time);
                                }
                            });
                        }

                        if (!runningDays)
                            runningDays = String(runningDay.dayId);
                        else
                            runningDays += `:${runningDay.dayId}`;
                    }
                });
                resolve({ runningDays: runningDays, todaysTiming: todaysTiming });
            }
        });
    }

    verifyAccounts(socialAccounts) {
        return new Promise((resolve, reject) => {
            if (!socialAccounts || socialAccounts.length <= 0)
                reject(new Error("Sorry, Please check the social accounts!"));
            else {
                var invalidAccounts = [];
                var validAccounts = [];
                if (socialAccounts.length > 0) {
                    socialAccounts.forEach(element => {
                        if (isNaN(element.accountId) || element.accountId == 0)
                            invalidAccounts.push(element.accountId);
                        else
                            validAccounts.push(element.accountId);
                    });
                }
                if (invalidAccounts.length > 0)
                    reject(new Error("Sorry, Please check the social accounts!"));
                else {
                    return dbSocialAccounts.findAll({
                        where: {
                            account_id: validAccounts
                        }
                    })
                        .then((results) => {
                            if (results.length == validAccounts.length)
                                resolve();
                            else
                                reject(new Error("Sorry, Please check the social accounts!"));
                        })
                        .catch((error) => {
                            reject(error);
                        });
                }
            }
        });
    }

    create(userId, userName, postInfo, userScopeMaxScheduleCount) {
        return new Promise((resolve, reject) => {
            if (!userId || !userName || !postInfo || userScopeMaxScheduleCount == null || userScopeMaxScheduleCount == undefined || userScopeMaxScheduleCount < 0)
                reject(new Error("Invalid Inputs"));
            else if (!(postInfo.postType == "Text" || postInfo.postType == "Image" || postInfo.postType == "Link" || postInfo.postType == "Video"))
                reject(new Error('Invalid Post Type, it should be either Text or Image or Link or Video'));
            else if (!(postInfo.scheduleCategory == 0 || postInfo.scheduleCategory == 1))
                reject(new Error('Invalid scheduleCategory, it should be either 0(daily) or 1(weekly)'));
            else if (!(postInfo.scheduleStatus > 0 && postInfo.scheduleStatus < 8))
                reject(new Error('Invalid scheduleStatus it should be between 1-7'));
            else if (postInfo.postingSocialIds.length <= 0)
                reject(new Error('Please provide the proper social accounts'));
            else {
                var runningDays = "";
                var todaysTiming = [];
                var createdResponse = '';
                var scheduledId = '';
                var usersTeamPermission = 0;
                var scheduleMongoId = {};
                var oneTimeScheduleDateTime = '';

                logger.info(`process started! and inputs are ${userId}, ${userName}, ${JSON.stringify(postInfo)}, ${userScopeMaxScheduleCount}`);
                return this.verifyAccounts(postInfo.postingSocialIds)
                    .then(() => {
                        return this.getActiveScheduleCount(userId);
                    })
                    .then((activeScheduleCount) => {
                        logger.info(`activeScheduleCount : ${activeScheduleCount}`);
                        if (activeScheduleCount >= userScopeMaxScheduleCount && postInfo.scheduleStatus != 5)
                            throw new Error("Sorry, As per your plan you can't schedule any more posts.");
                        else {
                            // find user permission in the team
                            return teamUserJoinTable.findOne({
                                where: {
                                    user_id: userId,
                                    team_id: postInfo.teamId,
                                    left_from_team: 0
                                }
                            });
                        }
                    })
                    .then((teamUserResponse) => {
                        if (!teamUserResponse)
                            throw new Error("Sorry, you aren't part of the team!");
                        else {
                            usersTeamPermission = teamUserResponse.permission;
                            postInfo.ownerId = userId;
                            postInfo.adminResponseStatus = postInfo.scheduleStatus == 5 ? "draft" : usersTeamPermission == 1 ? "fullrights" : "pending";

                            logger.info(JSON.stringify(postInfo));

                            // save to mongo db
                            var schedulePost = new SchedulePost(postInfo);
                            return schedulePost.save();
                        }
                    })
                    .then((response) => {
                        logger.info("schedule details are saved in mongo!");
                        oneTimeScheduleDateTime = postInfo.normalScheduleDate;

                        // Calculate running days and save into mysql db
                        scheduleMongoId = response._id;

                        // Daywise schedule
                        if (postInfo.scheduleCategory == 1) {
                            oneTimeScheduleDateTime = moment.utc().add(-1, 'days');
                            return this.getRunningDayAndTodayTimings(postInfo.daywiseScheduleTimer)
                                .then((result) => {
                                    runningDays = result.runningDays;
                                    todaysTiming = result.todaysTiming;
                                    if (!runningDays)
                                        runningDays = "0:1:2:3:4:5:6";
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }
                        // OneTime schedule
                        else {
                            var scheduleTimings = [];
                            scheduleTimings.push(oneTimeScheduleDateTime);
                            return this.getRunningDayAndTodayTimings(scheduleTimings)
                                .then((result) => {
                                    runningDays = result.runningDays ? result.runningDays : 'onetimeschedule';
                                    todaysTiming = result.todaysTiming;
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }
                    })
                    .then(() => {
                        logger.info(`Today Schedule Timings : ${JSON.stringify(todaysTiming)}`);

                        var scheduleStatusValue = postInfo.scheduleStatus;

                        // usersTeamPermission == 1(fullpermission, so send to ready(1) queue) otherwise pendingForAdmin approval                                                   
                        if (postInfo.scheduleStatus != 5)
                            scheduleStatusValue = usersTeamPermission == 1 ? 1 : 3;

                        // Add to schedule_details queue
                        return scheduleDetails.create({
                            schedule_type: postInfo.scheduleCategory,
                            module_name: postInfo.moduleName,
                            schedule_status: scheduleStatusValue,
                            //scheduleStatus : 1=ready queue, 2=wait(pause) state, 3= approvalpending, 4=rejected, 5=draft, 6=done            
                            mongo_schedule_id: String(scheduleMongoId),
                            one_time_schedule_date: oneTimeScheduleDateTime,
                            running_days_of_weeks: runningDays,
                            created_date: moment.utc(),
                            start_date: moment.utc(),
                            end_date: moment.utc().add(1, 'years'),
                            user_id: userId,
                            team_id: postInfo.teamId
                        });
                    })
                    .then((response) => {

                        if (postInfo.scheduleStatus == 5) {
                            resolve({ code: 200, status: "success", message: "Schedule details are save as draft!" });
                        }
                        else if (usersTeamPermission == 1) {
                            createdResponse = response;
                            scheduledId = response.schedule_id;
                            if (todaysTiming.length > 0) {
                                return this.makeSchedule(scheduledId, todaysTiming)
                                    .then((response) => {
                                        resolve({ code: 200, status: "success", message: createdResponse, scheduleInfo: response });
                                    })
                                    .catch((expiredTimings) => {
                                        resolve({ code: 200, status: "success", message: createdResponse, expiredTimings: expiredTimings });
                                    });
                            }
                            else
                                resolve({ code: 200, status: "success", message: createdResponse });
                        } else {
                            return this.createScheduleTask(postInfo.teamId, userId, userName, response.schedule_id)
                                .then(() => {
                                    resolve({ code: 200, status: "success", message: "Submitted a request to admin for schedule a post!" });
                                })
                                .catch(error => { throw error; });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    createRss(userId, teamId, rssDetails, userScopeMaxScheduleCount) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !rssDetails)
                reject(new Error("Invalid Inputs"));
            if (rssDetails.rss_feed_url == "string" || rssDetails.rss_feed_url == null && rssDetails.account_ids.length > 0)
                reject(new Error('Invalid rss data'));
            if (!Boolean(rssDetails.custom_interval))
                reject(new Error('Invalid time Interval'));
            if (rssDetails.start_date && rssDetails.end_date) {
                if (moment(rssDetails.start_date) < moment() || rssDetails.start_date > rssDetails.end_date)
                    reject(new Error('please check that start date should be greater then now or end date should be greater than start date.'));
            }
            var result = url.parse(rssDetails.rss_feed_url);
            if (result.protocol == "http:") {
                reject(new Error("Sorry, Rss feed only support https protocol"));
            }
            var runningDays = "";
            var todaysTiming = [];
            var createdResponse = '';
            var scheduledId = '';
            var scheduleMongoId = {};
            logger.info(`process started! and inputs are ${userId}, ${teamId}, ${JSON.stringify(rssDetails)}, ${userScopeMaxScheduleCount}`);
            return this.verifyAccounts(rssDetails.account_ids)
                .then(() => {
                    return this.getActiveScheduleCount(userId);
                })
                .then((activeScheduleCount) => {
                    logger.info(`activeScheduleCount : ${activeScheduleCount}`);
                    if (activeScheduleCount >= userScopeMaxScheduleCount)
                        throw new Error("Sorry, As per your plan you can't schedule any more posts.");
                    else {
                        return teamUserJoinTable.findOne({
                            where: {
                                user_id: userId,
                                team_id: teamId,
                                left_from_team: 0
                            }
                        });
                    }
                })
                .then((teamUserResponse) => {
                    if (!teamUserResponse)
                        throw new Error("Sorry, you aren't part of the team!");
                    else {
                        var endDate = '';
                        var rssData = {
                            teamId: teamId,
                            userId: userId,
                            rssDetails: rssDetails
                        };
                        var automatedRssMongoModelObject = AutomatedRssMongoModel();
                        return automatedRssMongoModelObject.insertRss(rssData)
                            .then((response) => {
                                scheduleMongoId = response[0]._id;
                                var startDate = moment(rssDetails.start_date);
                                var interval = rssDetails.custom_interval;
                                if (rssDetails.end_date > moment().endOf('day'))
                                    endDate = moment(startDate).endOf('day');
                                else
                                    endDate = moment(rssDetails.end_date);
                                logger.info("schedule details are saved in mongo!");

                                return this.getTimeIntervals(startDate, endDate, interval)
                                    .then((scheduleTimings) => {
                                        return this.getRunningDayAndTodayTimings(scheduleTimings)
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
                                scheduledId = response.schedule_id;
                                if (todaysTiming.length > 0) {
                                    return this.makeSchedule(scheduledId, todaysTiming)
                                        .then((response) => {
                                            resolve({ code: 200, status: "success", message: createdResponse, scheduleInfo: response });
                                        })
                                        .catch((expiredTimings) => {
                                            resolve({ code: 200, status: "success", message: createdResponse, expiredTimings: expiredTimings });
                                        });
                                }
                                else {
                                    resolve('successfully created.');
                                }
                            })
                            .catch((error) => {
                                throw error;
                            });
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getTimeIntervals(startDate, endDate, interval) {
        return new Promise((resolve, reject) => {
            if (!startDate || !endDate || !interval) {
                reject(new Error('Invalid Inputs'));
            } else {
                var scheduleTimings = [];
                var numberofintervals = endDate.diff(startDate, 'minutes') / interval;
                if (startDate < endDate) {
                    for (var i = 0; i < numberofintervals; i++) {
                        var temp = moment(startDate);
                        scheduleTimings.push(temp.add(i * interval, 'minutes'));
                    }
                }
                resolve(scheduleTimings);
            }
        });
    }

    edit(userId, userName, teamId, scheduleId, postInfo) {
        return new Promise((resolve, reject) => {
            if (!userId || !userName || !postInfo) {
                reject(new Error("Invalid Inputs"));
            } else {
                var scheduleIdDetails = {};
                var scheduleMongoId = null;
                var oneTimeScheduleDateTime = null;
                var runningDays = "";
                var todaysTiming = [];

                return scheduleDetails.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            schedule_id: scheduleId
                        }, {
                            schedule_status: [1, 3, 5]
                        }, {
                            team_id: teamId
                        }]
                    }
                })
                    .then((scheduleData) => {
                        if (!scheduleData)
                            throw new Error("Schedule details aren't available to edit, Please make sure following,  1.schedule should be in ready or waiting for admin approval state or Drafted one, \n\r 2. valid teamId!");
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
                        return scheduledInformations.destroy({ where: { schedule_id: scheduleId } })
                            .then(() => {
                                return SchedulePost.findByIdAndRemove(scheduleIdDetails.mongo_schedule_id);
                            })
                            .then(() => {
                                var taskModels = new TaskModel();
                                return taskModels.deletePublishTask(userId, 3, scheduleId);
                            })
                            .catch((error) => { throw error; });
                    })
                    .then(() => {
                        postInfo.ownerId = userId;
                        postInfo.adminResponseStatus = scheduleIdDetails.schedule_status == 1 ? "fullrights" : "pending";
                        postInfo.teamId = scheduleIdDetails.team_id;
                        postInfo.scheduleStatus = scheduleIdDetails.schedule_status;

                        var schedulePost = new SchedulePost(postInfo);
                        return schedulePost.save();
                    })
                    .then((response) => {
                        logger.info("schedule details are saved in mongo!");
                        oneTimeScheduleDateTime = postInfo.normalScheduleDate;

                        // Calculate running days and save into mysql db
                        scheduleMongoId = response._id;

                        // Daywise schedule
                        if (postInfo.scheduleCategory == 1) {
                            oneTimeScheduleDateTime = moment.utc().add(-1, 'days');
                            logger.info(postInfo.daywiseScheduleTimer);
                            return this.getRunningDayAndTodayTimings(postInfo.daywiseScheduleTimer)
                                .then((result) => {
                                    logger.info(result);
                                    runningDays = result.runningDays;
                                    todaysTiming = result.todaysTiming;
                                    if (!runningDays)
                                        runningDays = "0:1:2:3:4:5:6";
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }
                        // OneTime schedule
                        else {
                            var scheduleTimings = [];
                            scheduleTimings.push(oneTimeScheduleDateTime);
                            return this.getRunningDayAndTodayTimings(scheduleTimings)
                                .then((result) => {
                                    runningDays = result.runningDays ? result.runningDays : 'onetimeschedule';
                                    todaysTiming = result.todaysTiming;
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }
                    })
                    .then(() => {
                        logger.info(`Today Schedule Timings : ${JSON.stringify(todaysTiming)}`);
                        // Update to schedule_details queue
                        return scheduleDetails.update({
                            schedule_type: postInfo.scheduleCategory,
                            module_name: postInfo.moduleName,
                            mongo_schedule_id: String(scheduleMongoId),
                            one_time_schedule_date: oneTimeScheduleDateTime,
                            running_days_of_weeks: runningDays,
                        }, { where: { schedule_id: scheduleId } });
                    })
                    .then((response) => {
                        if (scheduleIdDetails.schedule_status == 1) {
                            if (todaysTiming.length > 0)
                                return this.makeSchedule(scheduleId, todaysTiming);
                            return;
                        } else
                            return this.createScheduleTask(scheduleIdDetails.team_id, userId, userName, scheduleId);
                    })
                    .then(() => {
                        resolve({ code: 200, status: 'success', message: "schedule details are edit successfully" });
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
                var previousMongoData = '';

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
                        return scheduledInformations.destroy({ where: { schedule_id: scheduleId } })
                            .then(() => {
                                return AutomatedRssMongoModel.findByIdAndRemove(scheduleIdDetails.mongo_schedule_id);
                            })
                            .then((response) => {
                                previousMongoData = response;

                                var taskModels = new TaskModel();
                                return taskModels.deletePublishTask(userId, 3, scheduleId);
                            })
                            .catch((error) => { throw error; });
                    })
                    .then(() => {
                        var data = {
                            name: previousMongoData.rssDetails[0].name,
                            rss_feed_url: previousMongoData.rssDetails[0].rss_feed_url,
                            custom_interval: rssDetails.custom_interval,
                            start_date: rssDetails.start_date,
                            end_date: rssDetails.end_date,
                            account_ids: previousMongoData.rssDetails[0].account_ids
                        };
                        var rssData = {
                            teamId: teamId,
                            userId: userId,
                            rssDetails: data
                        };
                        var automatedRssMongoModel = new AutomatedRssMongoModel();
                        return automatedRssMongoModel.insertRss(rssData);
                    })
                    .then((response) => {
                        logger.info('updated response \n ', JSON.stringify(response));
                        logger.info("schedule details are saved in mongo!");
                        scheduleMongoId = response[0]._id;
                        var startDate = moment(rssDetails.start_date);
                        var interval = rssDetails.custom_interval;
                        if (rssDetails.end_date > moment().endOf('day'))
                            endDate = moment(startDate).endOf('day');
                        else
                            endDate = moment(rssDetails.end_date);
                        logger.info("schedule details are saved in mongo!");
                        return this.getTimeIntervals(startDate, endDate, interval)
                            .then((scheduleTimings) => {
                                logger.info('scheduleTimings', scheduleTimings);
                                return this.getRunningDayAndTodayTimings(scheduleTimings)
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

                        // Add to schedule_details queue
                        return scheduleDetails.update({
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
                        }, { where: { schedule_id: scheduleId } });
                    })
                    .then(() => {
                        if (todaysTiming.length > 0) {
                            logger.info('making schedule', scheduleId, todaysTiming);
                            return this.makeSchedule(scheduleId, todaysTiming)
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

    createScheduleTask(teamId, userId, userName, scheduleId) {
        return new Promise((resolve, reject) => {
            return this.getTeamsAllAdmin(teamId)
                .then((result) => {
                    if (result.length == 0)
                        throw new Error("Cant able to fetch the team admin's!");
                    else {
                        var assignedUsers = [];
                        result.map(element => {
                            var admin = {
                                assignedTo: element,
                                assignedBy: userId,
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
                        assignedUser: admins
                    };
                    var taskModel = new TaskModel(taskDetails);
                    return taskModel.save();
                })
                .then(() => {
                    resolve();
                })
                .catch(error => { reject(error); });
        });
    }

    getScheduleDetails(userId, pageId) {
        return new Promise((resolve, reject) => {
            if (!userId || !Boolean(Number(pageId))) {
                reject(new Error("Invalid Inputs"));
            } else {
                var userScheduleDetails = null;
                return scheduleDetails.findAll({
                    where: { user_id: userId },
                    offset: (config.get('perPageLimit') * (pageId - 1)),
                    limit: config.get('perPageLimit'),
                    include: [{
                        model: userDetails,
                        as: "UserSchedule",
                        attributes: [['first_name', 'name'],]
                    }],
                    raw: true
                }).then((response) => {
                    userScheduleDetails = response;
                    var mongoIds = [];
                    if (response) {
                        response.forEach(element => {
                            mongoIds.push(element.mongo_schedule_id);
                        });
                        return SchedulePost.find({ _id: { $in: mongoIds } });
                    } else
                        return [];
                })
                    .then((mongoValues) => {
                        resolve({ scheduleDetails: userScheduleDetails, postContents: mongoValues });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getParticularScheduleDetails(userId, scId) {
        return new Promise((resolve, reject) => {
            if (!userId || !Boolean(Number(scId))) {
                reject(new Error("Invalid Inputs"));
            } else {
                var userScheduleDetails = null;
                return scheduleDetails.findOne({
                    where: { user_id: userId, schedule_id: scId },
                    include: [{
                        model: userDetails,
                        as: "UserSchedule",
                        attributes: [['first_name', 'name'],]
                    }],
                    raw: true
                }).then((response) => {
                    userScheduleDetails = response;
                    var mongoIds = [];
                    if (response) {
                        mongoIds.push(response.mongo_schedule_id);
                        return SchedulePost.find({ _id: { $in: mongoIds } });
                    } else
                        return [];
                })
                    .then((mongoValues) => {
                        resolve({ scheduleDetails: userScheduleDetails, postContents: mongoValues });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getFilteredScheduleDetails(userId, scheduleStatus, pageId) {
        return new Promise((resolve, reject) => {
            if (!userId || !scheduleStatus || !Boolean(Number(pageId)) || scheduleStatus > 7 || scheduleStatus < 1) {
                reject(new Error("Sorry, please verify following are correct. 1.Invalid Page Id, \n\r 2.Schedule status is between 1 to 7."));
            } else {
                var userScheduleDetails = null;
                return scheduleDetails.findAll({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            schedule_status: scheduleStatus
                        }]
                    },
                    offset: (config.get('perPageLimit') * (pageId - 1)),
                    limit: config.get('perPageLimit'),
                    include: [{
                        model: userDetails,
                        as: "UserSchedule",
                        attributes: [['first_name', 'name'],]
                    }],
                    raw: true
                }).then((response) => {
                    userScheduleDetails = response;
                    var mongoIds = [];
                    if (response) {
                        response.forEach(element => {
                            mongoIds.push(element.mongo_schedule_id);
                        });
                        return SchedulePost.find({ _id: { $in: mongoIds } });
                    } else
                        return [];
                })
                    .then((mongoValues) => {
                        resolve({ code: 200, status: 'success', scheduleDetails: userScheduleDetails, postContents: mongoValues });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }


        });
    }

    getScheduleDetailsByCategories(userId, scheduleStatus, scheduleCategory, pageId) {
        return new Promise((resolve, reject) => {
            if (!userId || !scheduleStatus || !(Boolean(Number(pageId))) || scheduleStatus > 7 || scheduleStatus < 1) {
                reject(new Error("Sorry, please verify following are correct. 1.Invalid Page Id, \n\r 2.Schedule status is between 1 to 7."));
            }
            else if (scheduleCategory < 0 || scheduleCategory > 1) {
                reject(new Error("Sorry, please verify schedule category which should be either 0(normal) or 1(daywise)."));

            } else {
                var userScheduleDetails = null;
                return scheduleDetails.findAll({
                    where: {
                        user_id: userId,
                        schedule_status: scheduleStatus,
                        schedule_type: scheduleCategory
                    },
                    offset: (config.get('perPageLimit') * (pageId - 1)),
                    limit: config.get('perPageLimit'),
                    include: [{
                        model: userDetails,
                        as: "UserSchedule",
                        attributes: [['first_name', 'name'],]
                    }],
                    raw: true
                }).then((response) => {
                    userScheduleDetails = response;
                    var mongoIds = [];
                    if (response) {
                        response.forEach(element => {
                            mongoIds.push(element.mongo_schedule_id);
                        });
                        return SchedulePost.find({ _id: { $in: mongoIds } });
                    } else
                        return [];
                })
                    .then((mongoValues) => {
                        resolve({ code: 200, status: 'success', scheduleDetails: userScheduleDetails, postContents: mongoValues });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }


        });
    }

    changeScheduleStatus(userId, userName, scheduleId, newScheduleStatus, userScopeMaxScheduleCount) {
        return new Promise((resolve, reject) => {
            if (!userId || !scheduleId || !newScheduleStatus || newScheduleStatus > 7 || newScheduleStatus < 1) {
                reject(new Error("Sorry, please verify following are correct. 1.Schedule Id, \n\r 2.Schedule status is between 1 to 7."));
            } else {
                var scheduleInfo = {};
                var userPermission = false;
                return this.getActiveScheduleCount(userId)
                    .then((count) => {
                        if (count >= userScopeMaxScheduleCount && newScheduleStatus == 1) {
                            throw new Error(`Sorry ! As per your plan, you can make ${userScopeMaxScheduleCount} schedules are possible.`);
                        } else {
                            return scheduleDetails.findOne({
                                where: {
                                    [Operator.and]: [{
                                        user_id: userId
                                    }, {
                                        schedule_id: scheduleId
                                    }]
                                }
                            });
                        }
                    })
                    .then((scheduleData) => {
                        if (!scheduleData)
                            throw new Error("Schedule details aren't available to update!");
                        else if (scheduleData.schedule_status == newScheduleStatus) {
                            throw new Error("Sorry, Cant able to update because both current and previous status are same!");
                        }
                        else {
                            scheduleInfo = scheduleData;
                            if (newScheduleStatus == 1) {
                                // find user permission in the team
                                return teamUserJoinTable.findOne({
                                    where: {
                                        user_id: userId,
                                        team_id: scheduleData.team_id,
                                        left_from_team: 0
                                    }
                                })
                                    .then((teamUserResponse) => {
                                        userPermission = teamUserResponse.permission;
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            }

                            if (scheduleData.schedule_status == 5 && newScheduleStatus == 1) {
                                // Draft(5) to ready(1) ==> 
                                // We need to check the user has permission to make ready state
                                // If user have, then make a schedule
                                // If not, create a task

                                if (teamUserResponse.permission == 0) {
                                    return this.createScheduleTask(scheduleData.team_id, userId, userName, scheduleId);
                                } else {
                                    var schedulePost = new SchedulePost();

                                    return schedulePost.getScheduleDetails(scheduleData.mongo_schedule_id)
                                        .then((schedulePostInfo) => {
                                            // Daywise schedule
                                            if (schedulePostInfo.scheduleCategory == 1) {
                                                return this.getRunningDayAndTodayTimings(schedulePostInfo.daywiseScheduleTimer)
                                                    .then((result) => {
                                                        return result.todaysTiming;
                                                    })
                                                    .catch((error) => {
                                                        throw error;
                                                    });
                                            }
                                            // OneTime schedule
                                            else {
                                                var scheduleTimings = [];
                                                scheduleTimings.push(schedulePostInfo.normalScheduleDate);
                                                return this.getRunningDayAndTodayTimings(scheduleTimings)
                                                    .then((result) => {
                                                        return result.todaysTiming;
                                                    })
                                                    .catch((error) => {
                                                        throw error;
                                                    });
                                            }
                                        })
                                        .then((todaysTiming) => {
                                            logger.info(`Today Timings : ${JSON.stringify(todaysTiming)}`);
                                            if (todaysTiming.length > 0)
                                                return this.makeSchedule(scheduledId, todaysTiming);
                                            return;
                                        })
                                        .catch((error) => { throw error; });
                                }

                            }
                            else if (scheduleData.schedule_status == 3 && newScheduleStatus == 5) {
                                // Delete the task
                                var taskModels = new TaskModel();
                                return taskModels.deletePublishTask(userId, 3, scheduleId);
                            }
                            else
                                return;
                        }
                    })
                    .then(() => {
                        return scheduleDetails.update({
                            schedule_status: newScheduleStatus,
                        }, {
                            where: {
                                user_id: userId,
                                schedule_id: scheduleId
                            }
                        });
                    })
                    .then(() => {
                        var schedulePost = new SchedulePost();
                        return schedulePost.updateStatus(scheduleInfo.mongo_schedule_id, newScheduleStatus);
                    })
                    .then(() => {
                        if (userPermission == 0 && newScheduleStatus == 1)
                            resolve({ code: 200, status: 'success', message: 'Schedule status has been updated successfully. Admin approvals is in pending!' });
                        else
                            resolve({ code: 200, status: 'success', message: 'Schedule status has been updated successfully!' });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    delete(userId, scheduleId) {
        return new Promise((resolve, reject) => {
            if (!userId || !scheduleId) {
                reject(new Error("Invalid Input"));
            } else {
                return scheduleDetails.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            schedule_id: scheduleId
                        }]
                    }
                }).then((scheduleData) => {
                    if (!scheduleData)
                        throw new Error("Not found or you don't have a access to delete");
                    else {
                        var mongoIds = scheduleData.mongo_schedule_id;
                        var mongoModel = '';
                        if (scheduleData.schedule_type == 2)
                            mongoModel = AutomatedRssMongoModel;
                        else
                            mongoModel = SchedulePost;

                        return mongoModel.findByIdAndRemove(mongoIds)
                            .then((response) => {
                                return scheduledInformations.findAll({ where: { schedule_id: scheduleId } });
                            })
                            .then((scheduleInfo) => {
                                if (scheduleInfo.length > 0) {
                                    scheduleInfo.forEach(element => {
                                        var scheduleJobName = schedule.scheduledJobs[element.scheduler_name];
                                        if (scheduleJobName)
                                            scheduleJobName.cancel();
                                    });
                                }
                                return;
                            })
                            .then(() => {
                                return scheduledInformations.destroy({ where: { schedule_id: scheduleId } });
                            })
                            .then(() => {
                                return scheduleData.destroy();
                            })
                            .then(() => {
                                var taskModels = new TaskModel();
                                return taskModels.deletePublishTask(userId, 3, scheduleId); // where 3 => specify task type 
                            })
                            .catch((error) => {
                                throw new Error(error.message);
                            });
                    }
                })
                    .then(() => {
                        resolve({ code: 200, status: 'success', message: 'Deleted successfully' });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    cancelScheduleDetails(userId, scheduleId) {
        return new Promise((resolve, reject) => {
            if (!userId || !scheduleId) {
                reject(new Error("Invalid Input"));
            } else {
                var scheduleIdData = {};
                return scheduleDetails.findOne({
                    where: {
                        [Operator.and]: [{
                            user_id: userId
                        }, {
                            schedule_id: scheduleId
                        }, {
                            schedule_status: 1
                        }]
                    }
                }).then((scheduleData) => {
                    if (!scheduleData)
                        throw new Error("Sorry, cant able to cancel the schedule due to following issues. 1. Invalid schedule id, \n\r 2. Schedule status should be in ready state to cancel, \n\r 3.User isnt owner the schedule.");
                    else {
                        scheduleIdData = scheduleData;
                        return scheduledInformations.findAll({ where: { schedule_id: scheduleId } });
                    }
                })
                    .then((scheduleInfo) => {
                        if (scheduleInfo.length > 0) {
                            scheduleInfo.forEach(element => {
                                var scheduleJobName = schedule.scheduledJobs[element.scheduler_name];
                                if (scheduleJobName)
                                    scheduleJobName.cancel();
                            });
                        }
                        return scheduledInformations.update({ status: 10 }, { where: { schedule_id: scheduleId } });
                    })
                    .then(() => {
                        return scheduleDetails.update({ schedule_status: 7 }, { where: { schedule_id: scheduleId } });
                    })
                    .then(() => {
                        if (scheduleIdData.schedule_type == 0 && moment(scheduleIdData.one_time_schedule_date).isBefore) {
                            reject(new Error('Schedule time already crossed!'));
                        } else {
                            resolve({ code: 200, status: 'success', message: 'Schedule has been cancelled successfully!' });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    startSchedulerCron() {
        return new Promise((resolve, reject) => {
            return this.setupCrons()
                .then(() => {
                    resolve({ code: 200, status: 'success', message: "Scheduler cron setup has been successfully done!" });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    runDaywiseSchedule() {
        return new Promise((resolve, reject) => {
            return this.startDaywiseSchedule()
                .then((response) => {
                    resolve({ code: 200, status: 'success', scheduleDetails: response });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    runTodaySchedule() {
        return new Promise((resolve, reject) => {
            return this.startTodaySchedule()
                .then((response) => {
                    resolve({ code: 200, status: 'success', scheduleDetails: response });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

}

module.exports = ScheduleLibs;