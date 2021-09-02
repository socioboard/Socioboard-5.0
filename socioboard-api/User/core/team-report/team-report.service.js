import TeamReport from '../../../Common/Models/team-report.model.js';
import {
  ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import validate from './team-report.validate.js';

const teamReport = new TeamReport();

class TeamReportController {
  constructor() {
  }

  async getTeamSchedulerStats(req, res, next) {
    try {
      const teamInfo = await teamReport.getTeamInfoId(req.body.userScopeId, req.query.teamId);

      if (!teamInfo) return ErrorResponse(res, 'Team not found or access denied!');
      const teamSocialAccount = await teamReport.teamSocialAccount(req.query.teamId);

      const response = await teamReport.getTeamSchedulerStats(teamSocialAccount, req.query.filterPeriod, req.query.teamId, req.query.since, req.query.until);

      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }
}
export default new TeamReportController();
