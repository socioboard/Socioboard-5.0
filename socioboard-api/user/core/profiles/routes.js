const routes = require('express').Router();
const profileController = require('./controllers/profileController');


/**
 * @swagger
 * /v1/profile/getOwnFacebookPages:
 *   get:
 *     operationId: secured_profile_getOwnFacebookPages
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the facebook pages
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Facebook ResponseCode
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getOwnFacebookPages", profileController.getFacebookPages);


/**
 * @swagger
 * /v1/profile/getOwnFacebookGroups:
 *   get:
 *     operationId: secured_profile_getOwnFacebookGroups
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the facebook groups
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Facebook ResponseCode
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getOwnFacebookGroups", profileController.getOwnFacebookGroups);

/**
 * @swagger
 * /v1/profile/getFacebookJoinedGroups:
 *   get:
 *     operationId: secured_profile_getFacebookJoinedGroups
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the facebook groups
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Facebook accountId
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: teamId
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
routes.get("/getFacebookJoinedGroups", profileController.getFacebookGroups);



/**
 * @swagger
 * /v1/profile/getInstaBusinessAccount:
 *   get:
 *     operationId: secured_profile_getInstaBusinessAccount
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the instagram profiles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Instagram responseCode from facebook
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getInstaBusinessAccount", profileController.getInstaBusinessAccount);

/**
 * @swagger
 * /v1/profile/getLinkedInCompanyProfiles:
 *   get:
 *     operationId: secured_profile_getLinkedInCompanyProfiles
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the linkedIn company Profile details
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: LinkedIn Response Code
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getLinkedInCompanyProfiles", profileController.getcompanyProfileDetails);


/**
 * @swagger
 * /v1/profile/getYoutubeChannels:
 *   get:
 *     operationId: secured_profile_getYoutubeChannels
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the youtube channels
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Google ResponseCode
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getYoutubeChannels", profileController.getYoutubeChannels);

/**
 * @swagger
 * /v1/profile/getGoogleAnalyticAccounts:
 *   get:
 *     operationId: secured_profile_getGoogleAnalyticAccounts
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the google analytics account
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Google ResponseCode
 *         name: code
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getGoogleAnalyticAccounts", profileController.getGoogleAnalyticAccounts);


/**
 * @swagger
 * /v1/profile/getShortenUrl:
 *   get:
 *     operationId: secured_profile_getShortenUrl
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the shorten urls
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: long Urls
 *         name: longurl
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getShortenUrl', profileController.getShortenUrl);


/**
 * @swagger
 * /v1/profile/createPinterestBoards:
 *   get:
 *     operationId: secured_profile_createPinterestBoards
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To create a boards
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: AccountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Board Name
 *         name: boardName
 *         type: string
 *       - in: query
 *         description: Board Description
 *         name: boardDescription
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/createPinterestBoards", profileController.createPinterestBoards);


/**
 * @swagger
 * /v1/profile/fetchNewPinterestBoards:
 *   get:
 *     operationId: secured_profile_fetchNewPinterestBoards
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the facebook pages
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: AccountId
 *         name: accountId
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/fetchNewPinterestBoards", profileController.fetchNewPinterestBoards);


/**
 * @swagger
 * /v1/profile/deletePinterestBoards:
 *   delete:
 *     operationId: secured_profile_deletePinterestBoards
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Profile
 *     description: To fetch the board Ids
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: AccountId
 *         name: accountId
 *         type: string
 *       - in: query
 *         description: Board Id
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
routes.delete("/deletePinterestBoards", profileController.deletePinterestBoards);



module.exports = routes;

