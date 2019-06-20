const routes = require('express').Router();
const feedController = require('./controllers/friendshipstatscontroller');

/**
 * @swagger
 * /v1/friendshipstats/getFbProfileStats:
 *   get:
 *     operationId: secured_getFbProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the facebook profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Facebook accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getFbProfileStats", feedController.getFbProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getFbPageStats:
 *   get:
 *     operationId: secured_getFbPageStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the facebook page stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Facebook accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getFbPageStats", feedController.getFbPageStats);

/**
 * @swagger
 * /v1/friendshipstats/getTwtProfileStats:
 *   get:
 *     operationId: secured_getTwtProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the twitter profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Twitter accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getTwtProfileStats", feedController.getTwtProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getInstaProfileStats:
 *   get:
 *     operationId: secured_getInstaProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the Instagram profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Instagram accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getInstaProfileStats", feedController.getInstaProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getLinkedInProfileStats:
 *   get:
 *     operationId: secured_getLinkedInProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the LinkedIn profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: LinkedIn accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getLinkedInProfileStats", feedController.getLinkedInProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getYoutubeProfileStats:
 *   get:
 *     operationId: secured_getYoutubeProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the Youtube profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Youtube accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getYoutubeProfileStats", feedController.getYoutubeProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getPinterestProfileStats:
 *   get:
 *     operationId: secured_getPinterestProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the Pinterest profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Pinterest accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getPinterestProfileStats", feedController.getPinterestProfileStats);

/**
 * @swagger
 * /v1/friendshipstats/getInstaBusinessProfileStats:
 *   get:
 *     operationId: secured_getInstaBusinessProfileStats
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friendship stats
 *     description: To fetch the Pinterest profile stats
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: InstaBusiness accountId
 *         name: accountId
 *         type: integer
 *         required: true
 *       - in: query
 *         description: Team Id
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
routes.get("/getInstaBusinessProfileStats", feedController.getInstaBusinessProfileStats);



module.exports = routes;