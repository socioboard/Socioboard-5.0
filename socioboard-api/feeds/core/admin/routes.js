const routes = require('express').Router();
const webhookController = require('../webhooks/controllers/webhookcontrollers');

/**
 * @swagger
 * /v1/admin/startTwitterWebhook:
 *   post:
 *     operationId: secured_admin_startTwitterWebhook
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To setup the configuration from twitter
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
routes.post('/startTwitterWebhook', webhookController.startTwitterWebhook);


/**
 * @swagger
 * /v1/admin/stopTwitterWebhook:
 *   delete:
 *     operationId: secured_admin_stopTwitterWebhook
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To remove the configuration from twitter
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
routes.delete('/stopTwitterWebhook', webhookController.stopTwitterWebhook);



/**
 * @swagger
 * /v1/admin/getTwitterSubscriptionList:
 *   get:
 *     operationId: secured_admin_getTwitterSubscriptionList
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To get the webhook subscription count from twitter
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
routes.get('/getTwitterSubscriptionList', webhookController.getTwitterSubscriptionList);

module.exports = routes;