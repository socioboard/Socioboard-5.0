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
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Specify cursor value (0 or -1 or 1)
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
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Provide cursor value
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
 *     description: To fetch twitter users details by username
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
 *         description: Provide search keyword
 *         name: keyword
 *         type: string  
 *       - in: query
 *         description: Provide pagination id
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