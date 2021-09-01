import NetworkInsightService from './network-insight.service.js';

class NetworkInsightController {
  async getTeamInsights(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
             #swagger.description = 'To fetch the Team insights' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getTeamInsights(req, res, next);
  }

  async getTwitterInsights(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
             #swagger.description = 'To fetch the twitter insights' */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Provide twitter account id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getTwitterInsights(req, res, next);
  }

  async getTwitterStats(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
             #swagger.description = 'To fetch the twitter insights stats' */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Provide twitter account id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getTwitterStats(req, res, next);
  }

  async getFaceBookPageInsights(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
            #swagger.description = 'To fetch the Facebook Page insights' */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Provide twitter account id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getFacebookInsights(req, res, next);
  }

  async getYouTubeInsights(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
            #swagger.description = 'To fetch the Youtube insights' */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Provide twitter account id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getYouTubeInsights(req, res, next);
  }

  async getLinkedInInsights(req, res, next) {
    /* 	#swagger.tags = ['NetwrokInsights']
            #swagger.description = 'To fetch the Youtube insights' */
    /*   #swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Provide twitter account id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
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
    return await NetworkInsightService.getLinkedInInsights(req, res, next);
  }
}

export default new NetworkInsightController();
