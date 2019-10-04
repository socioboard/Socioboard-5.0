var routes = require('express').Router();
const trendsController = require('./controllers/trendcontrollers');
const planValidator = require('../../utils/planvalidator');

/**
 * @swagger
 * responses:
 *   unauthorizedError:
 *     description: Accesstoken is missing or invalid
 *     headers:
 *       x-access-token:
 *         type: string
 *         description: Access denied for your requested url, please provide proper x-access-token with the request
 * /v1/trends/getGiphy:
 *   get:
 *     operationId: secured_getGiphy
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for giphy posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide filter
 *         name: filter
 *         enum: ["G","PG","PG-13","R"]
 *         default: "G"
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getGiphy', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getGiphy);

/**
 * @swagger
 * /v1/trends/getNewsApi:
 *   get:
 *     operationId: secured_getNewsApi
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for newsApi posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["publishedAt","popularity","relevancy"]
 *         default: "relevancy"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getNewsApi', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getNewsApi);


/**
 * @swagger
 * /v1/trends/getPixabay:
 *   get:
 *     operationId: secured_getPixabay
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for pixaBay posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide filter
 *         name: filter
 *         enum: ["fashion","nature","backgrounds","science","education","people","feelings","religion","health","places","animals","industry","food","computer","sports","transportation","travel","buildings","business","music"]
 *         default: "nature"
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["popular","latest"]
 *         default: "latest"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getPixabay', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getPixabay);


/**
 * @swagger
 * /v1/trends/getFlickr:
 *   get:
 *     operationId: secured_getFlickr
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for flickr posts  
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["date-posted-asc","date-posted-desc","date-taken-asc","date-taken-desc","interestingness-desc","interestingness-asc","relevance"]
 *         default: "relevance"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getFlickr', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getFlickr);


/**
 * @swagger
 * /v1/trends/getDailyMotion:
 *   get:
 *     operationId: secured_getDailyMotion
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for dailyMotion posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide filter
 *         name: filter
 *         enum: ["what-to-watch","recommended"]
 *         default: "recommended"
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["recent","visited","visited-hour","visited-today","visited-week","visited-month","random","relevance","trending","old","live-audience","least-visit","live-airing-time"]
 *         default: "recent"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getDailyMotion', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getDailyMotion);

/**
 * @swagger
 * /v1/trends/getImgur:
 *   get:
 *     operationId: secured_getImgur
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for imgur posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id 
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide filter
 *         name: filter
 *         enum: ["hot","top"]
 *         default: "hot"
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["viral","top","time"]
 *         default: "viral"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getImgur', planValidator.isUserObtianedPermission('contentstudio'), trendsController.getImgur);



/**
 * @swagger
 * /v1/trends/getRssFeeds:
 *   get:
 *     operationId: secured_getRssFeeds
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for rss feeds    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide rss feed Url
 *         name: rssUrl
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getRssFeeds', planValidator.isUserObtianedPermission('rssfeeds'), trendsController.getRssFeeds);



/**
 * @swagger
 * /v1/trends/getYoutube:
 *   get:
 *     operationId: secured_getYoutube
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for youtube posts
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide keyword
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: string
 *       - in: query
 *         description: Provide sort
 *         name: sort
 *         type: string
 *         enum: ["date","rating","relevance","title","viewCount"]
 *         default: "relevance"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getYoutube', planValidator.isUserObtianedPermission('discovery'), trendsController.getYoutube);

/**
 * @swagger
 * /v1/trends/getCurrentTrends:
 *   get:
 *     operationId: secured_getCurrentTrends
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for twitter current trends    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide country code ISO-3166 
 *         name: countryCode
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getCurrentTrends', trendsController.getCurrentTrends);

/**
 * @swagger
 * /v1/trends/getTwitter:
 *   get:
 *     operationId: secured_getTwitter
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Trends
 *     description: To request for twitter posts    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide keyword
 *         name: keyword
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTwitter', planValidator.isUserObtianedPermission('discovery'), trendsController.getTwitter);

module.exports = routes;
