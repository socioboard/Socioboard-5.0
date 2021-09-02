import LinkedInFeedsService from './linkedIn-feeds.service.js';
class LinkedInFeedController {
  /**
   * TODO To Fetch the LinkedIn feeds
   * Function to Fetch the LinkedIn feeds
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns LinkedIn feeds
   */
  async getLinkedInFeeds(req, res, next) {
    /* 	#swagger.tags = ['LinkedIn Feeds']
            #swagger.description = 'Get feeds of LinkedIn account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'LinkedIn account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await LinkedInFeedsService.getLinkedInFeeds(req, res, next);
  }

  /**
   * TODO To Fetch the LinkedIn Follower Stats
   * Function to Fetch the LinkedIn Follower Stats
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns LinkedIn Follower Stats
   */
  async getFollowerStats(req, res, next) {
    /* 	#swagger.tags = ['LinkedIn Feeds']
            #swagger.description = 'Get LinkedIn account follower stats' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'LinkedIn account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['filterPeriod'] = {
                in: 'query',
                description: 'Filter Period 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range',
                default: 3,
                enum: [3,4,5,6,7]
                }
                #swagger.parameters['since'] = {
                in: 'query',
                description: 'Custom since range in YYYY-MM-DD format'
                }
                #swagger.parameters['until'] = {
                in: 'query',
                description: 'Custom until range in YYYY-MM-DD format'
                }  */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await LinkedInFeedsService.getFollowerStats(req, res, next);
  }

  /**
   * TODO To Fetch the LinkedIn Page Stats
   * Function to Fetch the LinkedIn Page Stats
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns LinkedIn Page Stats
   */
  async getPageStats(req, res, next) {
    /* 	#swagger.tags = ['LinkedIn Feeds']
            #swagger.description = 'Get LinkedIn Page Stats' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'LinkedIn account id',
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
                description: 'Custom until range in YYYY-MM-DD format'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await LinkedInFeedsService.getPageStats(req, res, next);
  }
}
export default new LinkedInFeedController();
