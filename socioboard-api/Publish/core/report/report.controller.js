import ReportService from './report.service.js';

class ReportController {
  async getSchedulePublishedReport(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To get the schedule published post reports' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['scheduleId'] = {
                in: 'query',
                description: 'Enter schedule id,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done',
                }
             #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
    return await ReportService.getSchedulePublishedReport(req, res, next);
  }

  async getAccountPublishedReport(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To get the account published post reports' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'account id',
                }
         #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
             #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
    return await ReportService.getAccountPublishedReport(req, res, next);
  }

  async getTodayPostedCount(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To get the today post count' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
              #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'account id',
                } */
    return await ReportService.getTodayPostedCount(req, res, next);
  }

  async getXDayPublishCount(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To fetch the previously posted count for all social networks' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['dayCount'] = {
                in: 'query',
                description: 'Result for x previous days for all social networks',
                } */
    return await ReportService.getXDayPublishCount(req, res, next);
  }

  async getAccountwisePublishCount(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To fetch the all published count for all social networks account' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await ReportService.getAccountwisePublishCount(req, res, next);
  }
}
export default new ReportController();
