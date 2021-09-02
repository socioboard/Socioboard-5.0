import FeedsService from './youtube-feeds.service.js';

class FeedController {
  async getYoutubeFeeds(req, res, next) {
    /* 	#swagger.tags = ['YouTube Feeds']
            #swagger.description = 'Get feeds of YouTUbe account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'YouTUbe account id',
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
    return await FeedsService.getYoutubeFeeds(req, res, next);
  }

  async getRecentYoutubeFeeds(req, res, next) {
    /* 	#swagger.tags = ['YouTube Feeds']
            #swagger.description = 'Get feeds of YouTUbe account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'YouTUbe account id',
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
    return await FeedsService.getRecentYoutubeFeeds(req, res, next);
  }

  async youtubeLike(req, res, next) {
    /* 	#swagger.tags = ['YouTube Feeds']
            #swagger.description = 'To request for making like to a youtube post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'YouTUbe account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['videoId'] = {
                in: 'query',
                description: 'Enter Youtube VideoId '
                }
                #swagger.parameters['rating'] = {
                in: 'query',
                description: 'Enter Rating  like, dislike',
                default: 'like',
                enum: ["like","dislike"]
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.youtubeLike(req, res, next);
  }

  async youtubeComment(req, res, next) {
    /* 	#swagger.tags = ['YouTube Feeds']
            #swagger.description = 'To request for making like to a youtube post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'YouTUbe account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['videoId'] = {
                in: 'query',
                description: 'Enter Youtube VideoId '
                }
                #swagger.parameters['comment'] = {
                in: 'query',
                description: 'Enter Comment'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.youtubeComment(req, res, next);
  }

  async youtubeReplyComment(req, res, next) {
    /* 	#swagger.tags = ['YouTube Feeds']
            #swagger.description = 'To request for making like to a youtube post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'YouTUbe account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['videoId'] = {
                in: 'query',
                description: 'Enter Youtube VideoId '
                }
                #swagger.parameters['commentId'] = {
                in: 'query',
                description: 'Youtube Comment Id'
                }
                #swagger.parameters['comment'] = {
                in: 'query',
                description: 'Enter Comment'
                }
        /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.youtubeReplyComment(req, res, next);
  }
}

export default new FeedController();
