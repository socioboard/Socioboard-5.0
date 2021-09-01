import RecentVistedService from './recent-visted.service.js';

class RecentVistedController {
  async getRecentVisited(req, res, next) {
    /* 	#swagger.tags = ['RecentVisited']
               #swagger.description = 'To get recent visited of a user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['skip'] = {
            in: 'query'
        }
            #swagger.parameters['limit'] = {
                in: 'query'
        } */
    return await RecentVistedService.getRecentVisited(req, res, next);
  }

  async deleteRecentVisited(req, res, next) {
    /* 	#swagger.tags = ['RecentVisited']
               #swagger.description = 'To get recent visited of a user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
            in: 'query',
            discription:'_id'
        } */
    return await RecentVistedService.deleteRecentVisited(req, res, next);
  }

  async clearRecentVisited(req, res, next) {
    /* 	#swagger.tags = ['RecentVisited']
               #swagger.description = 'To get recent visited of a user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RecentVistedService.clearRecentVisited(req, res, next);
  }
}
export default new RecentVistedController();
