const routes = require("express").Router();
const schedulerController = require('./controllers/schedulerControllers');

/**
 * @swagger
 * /v1/admin/startDaywiseSchedule:
 *   get:
 *     operationId: secured_admin_startDaywiseSchedule
 *     summary: Secured - Only admin 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To start the daywise scheduler after each restart the server
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
routes.get('/startDaywiseSchedule', schedulerController.startDaywiseSchedule);

/**
 * @swagger
 * /v1/admin/startTodaySchedule:
 *   get:
 *     operationId: secured_admin_startTodaySchedule
 *     summary: Secured - Only admin 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To start the today scheduler after each restart the server
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
routes.get('/startTodaySchedule', schedulerController.startTodaySchedule);

/**
 * @swagger
 * /v1/admin/startSchedulerCron:
 *   get:
 *     operationId: secured_admin_startSchedulerCron
 *     summary: Secured - Only admin 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To setup the cron after each restart the server
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
routes.get('/startSchedulerCron', schedulerController.startSchedulerCron);

/**
 * @swagger
 * /v1/admin/deleteAllSchedules:
 *   delete:
 *     operationId: secured_admin_deleteAllSchedules
 *     summary: Secured - Only admin 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To delete all schedules 
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
routes.delete('/deleteAllSchedules', schedulerController.deleteAllSchedules);
module.exports = routes;