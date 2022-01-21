/**
 * @typedef {import('../../../Common/Shared/response.shared.js')}
 */
import {
  SuccessResponse,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';

/**
 * @typedef {import('../../../Common/Models/schedule.model.js')}
 */
import ScheduleModel from '../../../Common/Models/schedule.model.js';

/**
 * @param {import('../../../Common/Models/schedule.model.js').default} scheduleModel a ScheduleModel instance
 */
const scheduleModel = new ScheduleModel();

/**
 * CalenderViewService class
 * Base class for CalenderViewService
 */
class CalenderViewService {
  /**
   * TODO To get scheduled details for calender view
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns scheduled details
   */
  async scheduleDetails(req, res) {
    try {
      const response = await scheduleModel.getScheduleDetailsForCalenderView(
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
}

export default new CalenderViewService();
