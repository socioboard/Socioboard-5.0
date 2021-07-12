import TrendService from './trend.service.js';

class TrendController {

    async getGiphy(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the Giphy' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
                #swagger.parameters['type'] = {
                in: 'query',
                description: 'type',
                default: 'gifs',
               enum: ["gifs","stickers"]
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['rating'] = {
                in: 'query',
                description: 'rating',
                default: 'g',
                enum: ["g", "pg", "pg-13", "r"]
                }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getGiphy(req, res, next);
    }
    async getImgur(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the Imgur' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
               
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'viral',
                enum: ["viral", "top", "time",]
                }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getImgur(req, res, next);
    }
    async getFlickr(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the getFlickr' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
               
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'date-posted-desc',
                enum: ["date-posted-desc","date-posted-asc","date-taken-as","date-taken-desc","interestingness-des","interestingness-asc","relevance"]
                }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getFlickr(req, res, next);
    }
    async getDailyMotion(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the getDailyMotion' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
               
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'recent',
                enum: ["recent","visited","visited-hour","visited-today","visited-week","visited-month","relevance","trending","random","old","live-audience","least-visited"]
                 }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getDailyMotion(req, res, next);
    }
    async getNewsAPI(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the getNewsAPI' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
               
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'relevancy',
                enum: ["relevancy","publishedAt","popularity"]
                 }
                #swagger.parameters['category'] = {
                in: 'query',
                description: 'category',
                default: 'business',
                enum: ["business","techcrunch","entertainment","general","health","science","sports","technology"]
                 }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getNewsAPI(req, res, next);
    }
    async getPixabay(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the getPixabay' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
               
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'popular',
                enum: ["popular","latest"]
                 }
                #swagger.parameters['category'] = {
                in: 'query',
                description: 'category',
                default: 'fashion',
                enum: ["fashion","backgrounds", "nature", "science", "education", "feelings", "health", "people", "religion", "places", "animals", "industry", "computer", "food", "sports", "transportation", "travel", "buildings", "business", "music"]
                 }
                */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getPixabay(req, res, next);
    }
    async getYoutube(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the details from the Youtube' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'sortBy',
                default: 'relevance',
                enum: ["date","relevance","rating","title","viewcount"]
                } */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getYoutube(req, res, next);
    }
    async getTwitter(req, res, next) {
        /* 	#swagger.tags = ['Trends']
            #swagger.description = 'Get the  details from the Twitter ' */
        /*	#swagger.parameters['keyword'] = {
                in: 'query',
                description: 'Search keyword '
                }
                #swagger.parameters['max_id'] = {
                in: 'query',
                description: 'max_id(for next result)'
                }
                #swagger.parameters['since_id'] = {
                in: 'query',
                description: 'since_id(for refresh result)'
                }
                 */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await TrendService.getTwitter(req, res, next);
    }

}

export default new TrendController();