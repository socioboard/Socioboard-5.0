import FeedsService from './facebook-feeds.service.js';

class FeedController {
  async getFacebookFeeds(req, res, next) {
    /* 	#swagger.tags = ['Facebook Feeds']
            #swagger.description = 'Get feeds of Facebook account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Facebook account id',
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
    return await FeedsService.getFacebookFeeds(req, res, next);
  }

  async facebookLike(req, res, next) {
    /* 	#swagger.tags = ['Facebook Feeds']
            #swagger.description = 'To request for making like to a facebook post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Facebook account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['postId'] = {
                in: 'query',
                description: 'postId Id'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.facebookLike(req, res, next);
  }

  async facebookComment(req, res, next) {
    /* 	#swagger.tags = ['Facebook Feeds']
            #swagger.description = 'To request for posting commment to a facebook post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Facebook account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['postId'] = {
                in: 'query',
                description: 'postId Id'
                }
                #swagger.parameters['comment'] = {
                in: 'query',
                description: 'comment'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.facebookComment(req, res, next);
  }

  async getRecentFbFeeds(req, res, next) {
    /* 	#swagger.tags = ['Facebook Feeds']
            #swagger.description = 'To fetch the facebook recent feeds' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Facebook account id',
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
    return await FeedsService.getRecentFbFeeds(req, res, next);
  }

  async getRecentFbPageFeeds(req, res, next) {
    /* 	#swagger.tags = ['Facebook Feeds']
            #swagger.description = 'To fetch the facebook recent feeds' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Facebook page id',
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
    return await FeedsService.getRecentFbPageFeeds(req, res, next);
  }
}

export default new FeedController();
