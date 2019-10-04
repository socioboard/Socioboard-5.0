const controllers = require('./controllers/mailController');
const routes = require('express').Router();


/**
* @swagger
* /v1/mail/sendExpireAlert:
*   post:
*     operationId: secured_mail_sendExpireAlert
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Mail
*     description: To send alert mail to all user who's plan get expire within a week
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
routes.post('/sendExpireAlert', controllers.sendExpireAlert);


/**
* @swagger
* /v1/mail/sendExpiredInitimation:
*   post:
*     operationId: secured_mail_sendExpiredInitimation
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Mail
*     description: To send intimation to all user who's plan got expired
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
routes.post('/sendExpiredInitimation', controllers.sendExpiredInitimation);


/**
* @swagger
* /v1/mail/sendLoginReminder:
*   post:
*     operationId: secured_mail_sendLoginReminder
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Mail
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
routes.post('/sendLoginReminder', controllers.sendLoginReminder);


// /**
// * @swagger
// * /v1/mail/sendCustomNotifications:
// *   post:
// *     operationId: secured_mail_sendCustomNotifications
// *     summary: Secured - Admin Only
// *     security:
// *     - AccessToken: []
// *     tags:
// *       - Mail
// *     description: To send any custom notification to all user 
// *     requestBody:
// *       content:
// *           text/html:
// *     produces:
// *       - application/json
// *     responses:
// *       200:
// *         description: Return success!
// *       404: 
// *         description: Return Not Found or ErrorMessage
// *       401:
// *         $ref: "#/responses/unauthorizedError"
// */
// routes.post('/sendCustomNotifications', controllers.sendCustomNotifications);


/**
* @swagger
* /v1/mail/getUsersMailedInfo:
*   get:
*     operationId: secured_mail_getUsersMailedInfo
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Mail
*     description: To get the sent mail information to a particular user through email 
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: Provide user email 
*         name: email
*         type: string
*       - in: query
*         description: Specify notification type { -1 - For all, 1- Expire within a week, 2- Expired users, 3- Login Reminder, 4- Other newsletters, 5- Schedule success update, 6- Schedule failed, 7- Daily team report, 8- Every 15 days team report, 9- Every 30 days team report, 10- Every 60 days team report, 11- Every 90 days team report} 
*         name: notifyType
*         type: integer
*         enum : [-1,1,2,3,4,5,6,7,8,9,10,11]
*         default : -1
*       - in: query
*         description: Provide number of days 
*         name: days
*         type: integer
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.get('/getUsersMailedInfo', controllers.getUsersMailedInfo);

module.exports = routes;