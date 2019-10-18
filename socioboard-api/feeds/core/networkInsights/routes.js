var routes = require('express').Router();
const networkSightController = require('./controllers/networkInsightControllers');


/**
 * @swagger
 * /v1/networkinsights/getFacebookPageInsights:
 *   get:
 *     operationId: secured_networkinsights_getFacebookPageInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the facebook pages insights, Only if the page has more than 100 likes as per facebook insight http://prntscr.com/n3ze35
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide facebook page account id
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Specify filter period 1- Today, 2-Yesterday, 3-Last 7 days, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Specify custom since range in unix timestamp only if filterPeriod is 7 otherwise give -1
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Specify custom untill range in unix timestamp only if filterPeriod is 7 otherwise give -1
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getFacebookPageInsights', networkSightController.facebookPageInsights);


/**
 * @swagger
 * /v1/networkinsights/getYoutubeInsights:
 *   get:
 *     operationId: secured_networkinsights_getYoutubeInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the youtube insights
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide youtube account id
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Specify filter period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Specify custom since range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Specify custom untill range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getYoutubeInsights', networkSightController.getYoutubeInsights);




/**
 * @swagger
 * /v1/networkinsights/getLinkedInCompanyInsights:
 *   get:
 *     operationId: secured_networkinsights_getLinkedInCompanyInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the linkedIn insights
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide linkedIn company account id
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Specify filter period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Specify custom since range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Specify custom untill range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getLinkedInCompanyInsights', networkSightController.getLinkedInCompanyInsights);



/**
 * @swagger
 * /v1/networkinsights/getInstagramBusinessInsights:
 *   get:
 *     operationId: secured_networkinsights_getInstagramBusinessInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the instagram business insights
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide instagram business account id
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Specify filter period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Specify custom since range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Specify custom untill range in YYYY-MM-DD format (if filterPeriod is 7)
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getInstagramBusinessInsights', networkSightController.getInstagramBusinessInsights);


/**
 * @swagger
 * /v1/networkinsights/getTwitterInsights:
 *   get:
 *     operationId: secured_networkinsights_getTwitterInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the twitter insights
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide twitter account id
 *         name: accountId
 *         type: integer
 *       - in: query
 *         description: Provide team Id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Specify filter period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Specify custom since range in YYYY-MM-DD format
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Specify custom untill range in YYYY-MM-DD format
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTwitterInsights', networkSightController.getTwitterInsights);

/**
 * @swagger
 * /v1/networkinsights/getTeamInsights:
 *   get:
 *     operationId: secured_networkinsights_getTeamInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - NetworkInsights
 *     description: To fetch the Team insights
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Team Id
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Filter Period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range
 *         name: filterPeriod
 *         type: integer
 *         enum: [1,2,3,4,5,6,7]         
 *       - in: query
 *         description: Custom since range in YYYY-MM-DD format
 *         name: since
 *         type: string 
 *       - in: query
 *         description: Custom untill range in YYYY-MM-DD format
 *         name: untill
 *         type: string 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTeamInsights', networkSightController.getTeamInsights);

module.exports = routes;



