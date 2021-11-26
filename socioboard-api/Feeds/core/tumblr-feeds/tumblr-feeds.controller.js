import TumblrFeedService from './tumblr-feeds.service.js'

class FeedController{
 
 /**
 * TODO To Fetch the Tumbler Feeds
 * Function to Fetch the Tumbler Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Tumblr Feeds
 */
 async getTumblrFeeds(req, res, next) {
     /* 	#swagger.tags = ['Tumblr Feeds']
            #swagger.description = 'Get feeds of Tumblr account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Tumblr account id',
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
      return await TumblrFeedService.getTumblrFeeds(req, res, next);
  }

}
export default new FeedController();
