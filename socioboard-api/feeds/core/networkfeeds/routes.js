const routes = require('express').Router();
const feedController = require('./controllers/feedControllers');

/**
 * @swagger
 * /v1/feeds/getFacebookFeeds:
 *   get:
 *     operationId: secured_feeds_getFacebookFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the facebook feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide facebook accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getFacebookFeeds", feedController.getFacebookFeeds);

/**
 * @swagger
 * /v1/feeds/getRecentFbFeeds:
 *   get:
 *     operationId: secured_feeds_getRecentFbFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the facebook recent feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide facebook accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getRecentFbFeeds", feedController.getRecentFbFeeds);


/**
 * @swagger
 * /v1/feeds/getTweets:
 *   get:
 *     operationId: secured_feeds_getTweets
 *     summary: Secured-For twitter
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the current user tweets
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string 
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer 
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getTweets", feedController.getTweets);

/**
 * @swagger
 * /v1/feeds/getRecentTweets:
 *   get:
 *     operationId: secured_feeds_getRecentTweets
 *     summary: Secured-For twitter
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the recent user tweets
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getRecentTweets", feedController.getRecentTweets);


/**
 * @swagger
 * /v1/feeds/getHomeTimeLineTweets:
 *   get:
 *     operationId: secured_feeds_getHomeTimeLineTweets
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the home timeline tweets
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string 
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getHomeTimeLineTweets", feedController.getHomeTimeLineTweets);

/**
 * @swagger
 * /v1/feeds/getMentionTimeLineTweets:
 *   get:
 *     operationId: secured_feeds_getMentionTimeLineTweets
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the mention tweets of user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getMentionTimeLineTweets", feedController.getMentionTimeLineTweets);


/**
 * @swagger
 * /v1/feeds/getTweetsByKeyword:
 *   get:
 *     operationId: secured_feeds_getTweetsByKeyword
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the tweets with respect to keyword
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
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
routes.get("/getTweetsByKeyword", feedController.getTweetsByKeyword);


/**
 * @swagger
 * /v1/feeds/getlinkedInCompanyFeeds:
 *   get:
 *     operationId: secured_feeds_getlinkedInCompanyFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the linkedIn feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide linkedIn Company accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getlinkedInCompanyFeeds", feedController.getCompanyUpdates);



/**
 * @swagger
 * /v1/feeds/getPinterestPins:
 *   get:
 *     operationId: secured_feeds_getPinterestPins
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the Pinterest pins of the board
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide accountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide board id
 *         name: boardId
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getPinterestPins", feedController.getPinterestPins);

/**
 * @swagger
 * /v1/feeds/getYoutubeFeeds:
 *   get:
 *     operationId: secured_feeds_getYoutubeFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the Youtube feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide accountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getYoutubeFeeds", feedController.getYoutubeFeeds);


/**
 * @swagger
 * /v1/feeds/getInstagramFeeds:
 *   get:
 *     operationId: secured_feeds_getInstagramFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the Instagram feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide accountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getInstagramFeeds", feedController.getInstagramFeeds);

/**
 * @swagger
 * /v1/feeds/getRecentInstagramFeeds:
 *   get:
 *     operationId: secured_feeds_getRecentInstagramFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the Instagram recent feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide accountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getRecentInstagramFeeds", feedController.getRecentInstagramFeeds);

/**
 * @swagger
 * /v1/feeds/getRecentInstagramBusinessFeeds:
 *   get:
 *     operationId: secured_feeds_getRecentInstagramBusinessFeeds
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Feeds
 *     description: To fetch the recent instagram business account feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide instagram Business accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: pageId
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getRecentInstagramBusinessFeeds", feedController.getInstagramBusinessFeeds);

module.exports = routes;
