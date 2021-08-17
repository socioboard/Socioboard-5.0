import TeamReport from '../../../Common/Models/teamReport.model.js'
import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import validate from './teamReport.validate.js'

const teamReport = new TeamReport()
class TeamReportController {
    constructor() {
    }


    async getTeamSchedulerStats(req, res, next) {
        try {
            let teamInfo = await teamReport.getTeamInfoId(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Team not found or access denied!")
            let teamSocialAccount = await teamReport.teamSocialAccount(req.query.teamId)

            let response = await teamReport.getTeamSchedulerStats(teamSocialAccount, req.query.filterPeriod, req.query.teamId, req.query.since, req.query.until)
            SuccessResponse(res, response)

        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }


}
export default new TeamReportController()