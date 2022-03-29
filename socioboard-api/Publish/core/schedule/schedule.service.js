import moment from 'moment';

import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import ScheduleModel from '../../../Common/Models/schedule.model.js';

import SCHEDULE_CONSTANTS from './schedule.constants.js';

const scheduleModel = new ScheduleModel();

class ScheduleService {
  async create(req, res, next) {
    try {
      const response = await scheduleModel.create(
        req.body.userScopeId,
        req.body.userScopeName,
        req.body.postInfo,
        req.body.userScopeMaxScheduleCount
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getScheduleDetails(req, res, next) {
    try {
      const response = await scheduleModel.getScheduleDetails(
        req.body.userScopeId,
        req.query.fetchPageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getSchedulePostById(req, res, next) {
    try {
      const response = await scheduleModel.getSchedulePostById(
        req.body.userScopeId,
        req.query.id
      );
      const result = await scheduleModel.getScheduleId(
        req.body.userScopeId,
        req.query.id,
        response
      );

      SuccessResponse(res, result);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getFilteredScheduleDetails(req, res, next) {
    try {
      const response = await scheduleModel.getFilteredScheduleDetails(
        req.body.userScopeId,
        req.query.scheduleStatus,
        req.query.fetchPageId,
        req.query.teamId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getScheduleDetailsByCategories(req, res, next) {
    try {
      const response = await scheduleModel.getScheduleDetailsByCategories(
        req.body.userScopeId,
        req.query.scheduleStatus,
        req.query.scheduleCategory,
        req.query.fetchPageId,
        req.query.teamId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async changeScheduleStatus(req, res, next) {
    try {
      const response = await scheduleModel.changeScheduleStatus(
        req.body.userScopeId,
        req.body.userScopeName,
        req.query.scheduleId,
        req.query.scheduleStatus,
        req.query.userScopeMaxScheduleCount
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async cancel(req, res, next) {
    try {
      const response = await scheduleModel.cancelScheduleDetails(
        req.body.userScopeId,
        req.query.scheduleId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async delete(req, res, next) {
    try {
      const response = await scheduleModel.delete(
        req.body.userScopeId,
        req.query.scheduleId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async edit(req, res, next) {
    try {
      const response = await scheduleModel.edit(
        req.body.userScopeId,
        req.body.userScopeName,
        req.query.teamId,
        req.query.scheduleId,
        req.body.postInfo
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async editDraftSchedule(req, res, next) {
    try {
      const id = await scheduleModel.editDraftSchedule(
        req.body.userScopeId,
        req.body.userScopeName,
        req.query.teamId,
        req.query.scheduleId,
        req.body.postInfo
      );
      const response = await scheduleModel.getSchedulePostById(
        req.body.userScopeId,
        id
      );
      const result = await scheduleModel.getScheduleId(
        req.body.userScopeId,
        id,
        response
      );

      SuccessResponse(res, result);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get all published post for a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} published post for a schedule
   */
  async getPublishedSchedulePostById(req, res, next) {
    try {
      if (!req?.query?.scheduleId)
        ValidateErrorResponse(res, 'Schedule id required.');
      const result = await scheduleModel.getPublishedSchedulePostById(
        req?.query?.scheduleId,
        req.query.skip,
        req.query.limit
      );
      SuccessResponse(res, result);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get all published post for a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} published post for a schedule
   */
  async getFilterScheduleDetailsByCategories(req, res, next) {
    try {
      const response = await scheduleModel.getFilterScheduleDetailsByCategories(
        req.body.userScopeId,
        req.query.scheduleStatus,
        req.query.scheduleCategory,
        req.query.fetchPageId,
        req.query.teamId,
        req.query.filterPeriod,
        req.query.since,
        req.query.until
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get count of active,total and remaining Schedule Count
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} number of active,total and remaining Schedule Count
   */
  async getActiveScheduleCount(req, res) {
    try {
      const response = await scheduleModel.getTotalActiveScheduleCount(
        req.body.userScopeId,
        req.body.userScopeMaxScheduleCount
      );
      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get count of active,total and remaining Schedule Count
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} number of active,total and remaining Schedule Count
   */
  async getScheduleDetailsCount(req, res) {
    try {
      const response = await scheduleModel.getScheduleDetailsCount(
        req.body.userScopeId,
        req.query.scheduleStatus,
        req.query.scheduleCategory,
        req.query.teamId
      );
      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * Get a method to create a post
   * @param {number} userId
   * @param {string} userName
   * @returns {Promise<object[]>}
   */
  getCreatePost({userId, userName}) {
    return async post => {
      const savedPost = await scheduleModel.savePost({
        ...post,
        ownerId: userId,
        ownerName: userName,
        adminResponseStatus: post.scheduleStatus === 5 ? 'draft' : 'fillrights',
      });

      const {runningDays, todaysTiming, oneTimeScheduleDateTime} =
        await this.getTimings({
          scheduleCategory: post.scheduleCategory,
          oneTimeScheduleDateTime: savedPost.normalScheduleDate,
          daywiseScheduleTimer: post.daywiseScheduleTimer,
        });

      let scheduleStatusValue = post.scheduleStatus;

      if (post.scheduleStatus !== 5) {
        if (post.permission === 1 || 2) {
          scheduleStatusValue = 1;
        } else {
          scheduleStatusValue = 3;
        }
      }

      const queue = await scheduleModel.createScheduleDetailsQueue({
        schedule_type: post.scheduleCategory,
        module_name: post.moduleName,
        schedule_status: scheduleStatusValue,
        mongo_schedule_id: String(savedPost._id),
        one_time_schedule_date: oneTimeScheduleDateTime,
        running_days_of_weeks: runningDays,
        created_date: moment.utc(),
        end_date: moment.utc().add(1, 'years'),
        user_id: userId,
        team_id: post.teamId,
      });

      if (post.scheduleStatus === 5) {
        return {
          message: SCHEDULE_CONSTANTS.SUCCESS_MESSAGES.SCHEDULE_SAVE_AS_DRAFT,
        };
      }

      if (post.permission === 1) {
        const createdResponse = queue;
        const scheduledId = queue.schedule_id;

        if (todaysTiming.length > 0) {
          await scheduleModel.makeSchedule(scheduledId, todaysTiming);

          return {message: createdResponse, scheduleInfo: queue};
        }

        return {message: createdResponse};
      }

      await scheduleModel.createScheduleTask(
        post.teamId,
        userId,
        userName,
        queue.schedule_id
      );

      return {
        message:
          SCHEDULE_CONSTANTS.SUCCESS_MESSAGES
            .SUBMITTED_REQUEST_TO_ADMIN_FOR_SCHEDULE_POST,
      };
    };
  }

  /**
   * Get timings
   * @param {number} scheduleCategory
   * @param {number} oneTimeScheduleDateTime
   * @param {number} daywiseScheduleTimer
   * @returns {Promise<object>}
   */
  async getTimings({
    scheduleCategory,
    oneTimeScheduleDateTime,
    daywiseScheduleTimer,
  }) {
    if (scheduleCategory === 1) {
      const {runningDays, todaysTiming} =
        await scheduleModel.getRunningDayAndTodayTimings(daywiseScheduleTimer);

      return {
        todaysTiming,
        runningDays: runningDays || '0:1:2:3:4:5:6',
        oneTimeScheduleDateTime: moment.utc().add(-1, 'days'),
      };
    }

    const scheduleTimings = [];

    scheduleTimings.push(oneTimeScheduleDateTime);

    const {runningDays, todaysTiming} =
      await scheduleModel.getRunningDayAndTodayTimings(scheduleTimings);

    return {
      todaysTiming,
      runningDays: runningDays || 'onetimeschedule',
      oneTimeScheduleDateTime,
    };
  }
}

export default new ScheduleService();
