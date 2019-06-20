const controllers = require('./controllers/appInsightControllers');
const routes = require('express').Router();

/**
* @swagger
* /v1/appinsights/getAllRealtimeUsers:
*   get:
*     operationId: secured_insights_getAllRealtimeUsers
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To send notification to all user who has not login in app last 7 days
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
routes.get('/getAllRealtimeUsers', controllers.getAllRealtimeUsers);


/**
* @swagger
* /v1/appinsights/getRealtimeUsersActivities:
*   get:
*     operationId: secured_insights_getRealtimeUsersActivities
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get real time user activites
*     parameters:
*       - in: query
*         description: user email Id
*         name: userEmail
*         type: string
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
routes.get('/getRealtimeUsersActivities', controllers.getRealtimeUsersActivities);

/**
* @swagger
* /v1/appinsights/getAllUser:
*   get:
*     operationId: secured_insights_getAllUser
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get all user who are used in between specified start and end dates
*     parameters:
*       - in: query
*         description: startDate in YYYY-MM-DD format
*         name: startDate
*         type: string
*       - in: query
*         description: endDate in YYYY-MM-DD format
*         name: endDate
*         type: string
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
routes.get('/getAllUser', controllers.getAllUser);


/**
* @swagger
* /v1/appinsights/getUserActionCount:
*   get:
*     operationId: secured_insights_getUserActionCount
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get most action used by an user
*     parameters:
*       - in: query
*         description: user email Id
*         name: userEmail
*         type: string
*       - in: query
*         description: startDate in YYYY-MM-DD format
*         name: startDate
*         type: string
*       - in: query
*         description: endDate in YYYY-MM-DD format
*         name: endDate
*         type: string
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
routes.get('/getUserActionCount', controllers.getUserActionCount);

/**
* @swagger
* /v1/appinsights/getUsersActivities:
*   get:
*     operationId: secured_insights_getUsersActivities
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get the user activites
*     parameters:
*       - in: query
*         description: user email Id
*         name: userEmail
*         type: string
*       - in: query
*         description: Pagination Id
*         name: pageId
*         type: integer
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
routes.get('/getUsersActivities', controllers.getUsersActivities);




module.exports = routes;
