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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Search keyword 
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination id 
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Rss Feed Url
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Keyword
 *         name: keyword
 *         type: string
 *       - in: query
 *         description: Pagination Id
 *         name: pageId
 *         type: string
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: country code ISO-3166 
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
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: keyword
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
