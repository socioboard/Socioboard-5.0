import {
  ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import TaskModel from '../../../Common/Models/task.model.js';
import logger from '../../resources/Log/logger.log.js';

const taskModel = new TaskModel();

class PublishService {
  constructor() {
    this.setupTwitterInsightsCrons();
  }

  async getTasks(req, res, next) {
    try {
      const response = await taskModel.getTaskDetails(req.query.userScopeId, req.query.teamId, req.query.pageId);

      SuccessResponse(res, response?.data, response?.message, response?.code);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async assignTask(req, res, next) {
    try {
      const response = await taskModel.assignTask(req.query.userScopeId, req.query.taskId, req.query.assigningUserId, req.query.teamId);

      SuccessResponse(res, response?.data, response?.message, response?.code);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async updateTaskStatus(req, res, next) {
    try {
      const response = await taskModel.updateTaskStatus(req.query.userScopeId, req.query.taskId, req.query.status, req.query.teamId);

      SuccessResponse(res, response?.data, response?.message, response?.code);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  setupTwitterInsightsCrons() {
    taskModel.setupTwitterInsightsCrons();
    logger.info('Cron setup intialized for twitter insights services...');
  }
}

export default new PublishService();
