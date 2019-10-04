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
*     description: To get all real time users
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
*         description: Provide user email id
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
*         description: Specify startDate in YYYY-MM-DD format
*         name: startDate
*         type: string
*       - in: query
*         description: Specify endDate in YYYY-MM-DD format
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
*         description: Provide user email id
*         name: userEmail
*         type: string
*       - in: query
*         description: Specify startDate in YYYY-MM-DD format
*         name: startDate
*         type: string
*       - in: query
*         description: Specify endDate in YYYY-MM-DD format
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
* /v1/appinsights/getTodayActionwiseCount:
*   get:
*     operationId: secured_insights_getTodayActionwiseCount
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To fetch activity wise count for all users.
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
routes.get('/getTodayActionwiseCount', controllers.getTodayActionwiseCount);

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
*     description: To get the user activites upto last 30 days
*     parameters:
*       - in: query
*         description: Provide user email id
*         name: userEmail
*         type: string
*       - in: query
*         description: Provide pagination id
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

/**
* @swagger
* /v1/appinsights/get-users-activities-by-date:
*   get:
*     operationId: secured_insights_getUsersActivitiesByDate
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get the user activites by date
*     parameters:
*       - in: query
*         description: Provide user email id
*         name: userEmail
*         type: string
*       - in: query
*         description: Specify startDate in YYYY-MM-DD format
*         name: startDate
*         type: string
*       - in: query
*         description: Specify endDate in YYYY-MM-DD format
*         name: endDate
*         type: string
*       - in: query
*         description: Provide pagination id
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
routes.get('/get-users-activities-by-date', controllers.getUsersActivitiesByDate);

/**
* @swagger
* /v1/appinsights/getUsersActivitiesByAction:
*   get:
*     operationId: secured_insights_getUsersActivitiesByAction
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - AppInsights
*     description: To get the users activity based on specific action
*     parameters:
*       - in: query
*         description: Provide user email id
*         name: userEmail
*         type: string
*       - in: query
*         description: Specify action
*         name: action
*         type: string
*       - in: query
*         description: Provide pagination id
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
routes.get('/getUsersActivitiesByAction', controllers.getUsersActivitiesByAction);


module.exports = routes;
