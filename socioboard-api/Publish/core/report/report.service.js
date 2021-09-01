import {
  ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import ReportModel from '../../../Common/Models/report.model.js';
import validate from './report.validate.js';

const reportModel = new ReportModel();

class ReportService {
  constructor() {
  }

  async getSchedulePublishedReport(req, res, next) {
    try {
      const { scheduleId, pageId } = req.query;
      const { value, error } = validate.SchedulePublishedReport({ scheduleId, pageId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await reportModel.getSchedulePublishedReport(scheduleId, req.body.userScopeId, pageId);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getAccountPublishedReport(req, res, next) {
    try {
      const { accountId, teamId, pageId } = req.query;
      const { value, error } = validate.AccountPublishedReport({ accountId, teamId, pageId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await reportModel.getAccountPublishedReport(req.body.userScopeId, req.query.accountId, req.query.teamId, req.query.pageId);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getTodayPostedCount(req, res, next) {
    try {
      const { accountId, teamId } = req.query;
      const { value, error } = validate.TodayPostedCount({ accountId, teamId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await reportModel.getTodayPostedCount(req.body.userScopeId, teamId, accountId);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getXDayPublishCount(req, res, next) {
    try {
      const { dayCount } = req.query;
      const { value, error } = validate.XDayPublishCount({ dayCount });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await reportModel.getXDayPublishCount(req.body.userScopeId, dayCount);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getAccountwisePublishCount(req, res, next) {
    try {
      const response = await reportModel.getAccountwisePublishCount(req.body.userScopeId);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }
}

export default new ReportService();
