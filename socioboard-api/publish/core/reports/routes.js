const routes = require('express').Router();
const accountController = require('./controllers/reportControllers');

/**
 * @swagger
 * /v1/reports/getSchedulePublishedReport:
 *   get:
 *     operationId: secured_reports_getSchedulePublishedReport
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To get the schedule published post reports
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide schedule id 
 *         name: scheduleId
 *         type: integer
 *       - in: query
 *         description: Provide page id 
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
routes.get("/getSchedulePublishedReport", accountController.getSchedulePublishedReport);



/**
 * @swagger
 * /v1/reports/getAccountPublishedReport:
 *   get:
 *     operationId: secured_reports_getAccountPublishedReport
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To get the account published post reports
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide account id 
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide page id 
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
routes.get("/getAccountPublishedReport", accountController.getAccountPublishedReport);

/**
 * @swagger
 * /v1/reports/getTodayPostCount:
 *   get:
 *     operationId: secured_reports_getTodayPostCount
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To get the today post count
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide account id 
 *         name: accountId
 *         type: integer
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
routes.get("/getTodayPostCount", accountController.getTodayPostedCount);



/**
 * @swagger
 * /v1/reports/getXDayPublishCount:
 *   get:
 *     operationId: secured_reports_getXDayPublishCount
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To fetch the previously posted count for all social networks
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Result for x previous days for all social networks
 *         name: dayCount
 *         type: integer  
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getXDayPublishCount", accountController.getXDayPublishCount);


/**
 * @swagger
 * /v1/reports/getAccountwisePublishCount:
 *   get:
 *     operationId: secured_reports_getAccountwisePublishCount
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To fetch the all published count for all social networks account
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getAccountwisePublishCount", accountController.getAccountwisePublishCount);


/**
 * @swagger
 * /v1/reports/getTwitterMessage:
 *   get:
 *     operationId: secured_reports_getTwitterMessage
 *     summary: Secured - Only for twitter
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To fetch the twitter messages
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
routes.get("/getTwitterMessage", accountController.getTwitterMessage);

/**
 * @swagger
 * /v1/reports/getMessageBetweenTwoUsers:
 *   get:
 *     operationId: secured_reports_getMessageBetweenTwoUsers
 *     summary: Secured - Only for twitter
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To fetch the twitter messages between 2 users
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
 *       - in: query
 *         description: Provide twitter receiver id
 *         name: receiverId
 *         type: string  
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
routes.get("/getMessageBetweenTwoUsers", accountController.getMessageBetweenTwoUsers);



/**
 * @swagger
 * /v1/reports/getPreviouslyMessagedUsers:
 *   get:
 *     operationId: secured_reports_getPreviouslyMessagedUsers
 *     summary: Secured - Only for twitter
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Report
 *     description: To fetch the previously messaged user info
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: string  
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
routes.get("/getPreviouslyMessagedUsers", accountController.getPreviouslyMessagedUsers);




module.exports = routes;