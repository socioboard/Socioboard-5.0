const routes = require('express').Router();
const friendsController = require('./controllers/friendsController');

/**
 * @swagger
 * /v1/friends/getTwitterFollowers:
 *   get:
 *     operationId: secured_friends_getTwitterFollowers
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friends
 *     description: To fetch twitter follower details of an account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Team Id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Cursor Value
 *         name: cursorValue
 *         type: string  
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getTwitterFollowers", friendsController.getTwitterFollowers);


/**
 * @swagger
 * /v1/friends/getTwitterFollowing:
 *   get:
 *     operationId: secured_friends_getTwitterFollowing
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friends
 *     description: To fetch twitter following details of an account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Team Id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Cursor Value
 *         name: cursorValue
 *         type: string  
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getTwitterFollowing", friendsController.getTwitterFollowing);


/**
 * @swagger
 * /v1/friends/getTwitterSearchUser:
 *   get:
 *     operationId: secured_friends_getTwitterSearchUser
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Friends
 *     description: To fetch twitter following details of an account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Team Id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Search Keyword
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
routes.get("/getTwitterSearchUser", friendsController.getTwitterSearchUser);


module.exports = routes;