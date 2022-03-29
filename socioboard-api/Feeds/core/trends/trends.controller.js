import TrendService from './trends.service.js';

class TrendsController {
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
                #swagger.parameters['category'] = {
                in: 'query',
                description: 'category',
                default: 'business',
                enum: ["business","entertainment","general","health","science","sports","technology"]
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
               #swagger.parameters['ccode'] = {
                in: 'query',
                description: 'Country Cods in Alpha2 standard [252]',
                default: 'IN',
                enum: ["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","XK","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RS","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","CS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SZ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","XT","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW"]
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

export default new TrendsController();
