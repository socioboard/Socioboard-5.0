import RssService from './rss-feeds.service.js';

class RssController {
  async getRssFeeds(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'To request for rss feeds ' */
    /*	#swagger.parameters['rssUrl'] = {
                in: 'query',
                description: 'Rss Feed Url',
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getRssFeeds(req, res, next);
  }

  async getRecentRssUrl(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'To get recently searched rss feeds' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getRecentRssUrl(req, res, next);
  }

  async getBookMarkedRssUrl(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'To get bookmarked rss urls' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getBookMarkedRssUrl(req, res, next);
  }

  async bookmarkUrl(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'book mark a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               }
               #swagger.parameters['bookmark'] = {
                in: 'query',
                description: 'bookmark',
                default: 'true',
               enum: ["true","false"]
               } */
    return await RssService.bookmarkUrl(req, res, next);
  }

  async updateRssUrls(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'update details book mark a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               }
            #swagger.parameters['data'] = {
                in: 'body',
                description: 'Searched rss url',
                schema: { $ref: "#/definitions/serchedRssUrls" }
                    } */
    return await RssService.updateRssUrls(req, res, next);
  }

  async deleteRssUrls(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'To delete a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               } */
    return await RssService.deleteRssUrls(req, res, next);
  }

  async clearRssUrls(req, res, next) {
    /* 	#swagger.tags = ['Rss Feeds']
            #swagger.description = 'To clear all searches from a user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.clearRssUrls(req, res, next);
  }
}

export default new RssController();
