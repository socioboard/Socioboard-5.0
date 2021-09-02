import FeedsService from './instagram-feeds.service.js';

/**
 * TODO To Fetch the Instagram Feeds
 * Function to Fetch the Instagram Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */
class FeedController {
  async getInstaFeeds(req, res, next) {
    /* 	#swagger.tags = ['Insta Feeds']
            #swagger.description = 'Get feeds of Insta account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Insta account id',
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
    return await FeedsService.getInstaFeeds(req, res, next);
  }
  async getInstaBusinessFeeds(req, res, next) {
    /* 	#swagger.tags = ['Insta Feeds']
            #swagger.description = 'Get feeds of Insta account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Insta account id',
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
    return await FeedsService.getInstaBusinessFeeds(req, res, next);
  }

 /**
 * TODO To Fetch the Instagram Business Publish Limit
 * Function to Fetch the Instagram Business Publish Limit
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Publish limit
 */
  async getInstaBusinessPublishLimit(req, res, next) {
    /* 	#swagger.tags = ['Insta Feeds']
            #swagger.description = 'Get feeds of Insta account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'body',
                description: 'Account Id',
                required: true,
                schema: { $ref: "#/definitions/publishlimit" }
      }
      #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.getInstaBusinessPublishLimit(req, res, next);
  }
}
export default new FeedController();
