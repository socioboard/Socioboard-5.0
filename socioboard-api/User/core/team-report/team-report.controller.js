import TeamReportService from './team-report.service.js';

class TeamReportController {
  async getTeamSchedulerStats(req, res, next) {
    /* 	#swagger.tags = ['Team-Report']
            #swagger.description = 'To get post published and scheduler stats for team' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'team Id'
        }
        #swagger.parameters['filterPeriod'] = {
                in: 'query',
                description: 'Filter Period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range',
                default: 1,
                enum: [1,2,3,4,5,6,7]
                }
                #swagger.parameters['since'] = {
                in: 'query',
                description: 'Custom since range in YYYY-MM-DD format'
                }
                #swagger.parameters['until'] = {
                in: 'query',
                description: 'Custom untill range in YYYY-MM-DD format'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */

    return await TeamReportService.getTeamSchedulerStats(req, res, next);
  }
}
export default new TeamReportController();
