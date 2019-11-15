const routes = require('express').Router();
const config = require('config');
const Helper = require('../../../library/utility/authorizeServices');
const notificationControllers = require('./controllers/notifyControllers');

const helper = new Helper(config.get('authorize'));
const logger = require('../../utils/logger');

module.exports = (io) => {
    /**
     * @swagger
     * /v1/notify/sendTeamNotification:
     *   get:
     *     operationId: secured_notify_sendTeamNotification
     *     summary: This functionality works inside, Here no need to check
     *     deprecated: true
     *     security:
     *     - AccessToken: []
     *     tags:
     *       - Notify
     *     description: To notify to entire team
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         description: Provide team id
     *         name: teamId
     *         type: integer
     *       - in: query
     *         description: Provide notification message
     *         name: notificationDetails
     *         type: string
     *     responses:
     *       200:
     *         description: Return success!
     *       404: 
     *         description: Return Not Found or ErrorMessage
     *       401:
     *         $ref: "#/responses/unauthorizedError"
     */
    routes.get('/sendTeamNotification', (req, res) => {

        try {
            var decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
            io.sockets.to(req.query.teamId).emit('notification', decryptredMessage);
            logger.info(`\n${JSON.stringify(decryptredMessage)}\n`);
        } catch (error) {
            logger.info(`\n${error}\n`);
        }
        res.status(200).json({ code: 200, status: 'success' });
    });

    /**
     * @swagger
     * /v1/notify/sendUserNotification:
     *   get:
     *     operationId: secured_notify_sendUserNotification
     *     summary: Secured, This functionality works inside, no need to check
     *     deprecated : true
     *     security:
     *     - AccessToken: []
     *     tags:
     *       - Notify
     *     description: To notify to user of a team
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         description: Provide user id
     *         name: userId
     *         type: integer
     *       - in: query
     *         description: Provide notification message
     *         name: notificationDetails
     *         type: string
     *     responses:
     *       200:
     *         description: Return success!
     *       404: 
     *         description: Return Not Found or ErrorMessage
     *       401:
     *         $ref: "#/responses/unauthorizedError"
     */
    routes.get('/sendUserNotification', (req, res) => {

        var data = {};
        try {
            logger.info("Started ...");
            logger.info(`Message : \n ${req.query.notificationDetails}`);
            var decryptedMessage = helper.decrypt(req.query.notificationDetails);
            logger.info(`decryptedMessage : \n ${decryptedMessage}`);
            var decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
            logger.info(`\n${JSON.stringify(decryptredMessage)}\n`);

            io.sockets.in(req.query.userId).emit('notification', decryptredMessage);
            data.message = { code: 200, status: 'success' };
            data.code = 200;
        } catch (error) {
            logger.info(`\n${error.message}\n`);
            data.message = { code: 400, status: 'failed', message: error.message };
            data.code = 400;
        }
        res.status(data.code).json(data.message);
    });

    /**
         * @swagger
         * /v1/notify/getUserNotification:
         *   get:
         *     operationId: secured_notify_getUserNotification
         *     summary: Secured
         *     security:
         *     - AccessToken: []
         *     tags:
         *       - Notify
         *     description: To get user notification of a team
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: query
         *         description: Provide user id
         *         name: userId
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
    routes.get('/getUserNotification', notificationControllers.getUsersNotifications);

    /**
      * @swagger
      * /v1/notify/getTeamNotification:
      *   get:
      *     operationId: secured_notify_getTeamNotification
      *     summary: Secured
      *     security:
      *     - AccessToken: []
      *     tags:
      *       - Notify
      *     description: To get teamMember notifications of a team
      *     produces:
      *       - application/json
      *     parameters:
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
    routes.get('/getTeamNotification', notificationControllers.getTeamsNotifications);

    //        /**
    //  * @swagger
    //  * /v1/notify/updateNotificationStatus:
    //  *   put:
    //  *     operationId: secured_notify_updateNotificationStatus
    //  *     summary: Secured
    //  *     security:
    //  *     - AccessToken: []
    //  *     tags:
    //  *       - Notify
    //  *     description: To update notification status
    //  *     produces:
    //  *       - application/json
    //  *     parameters:
    //  *       - in: query
    //  *         description: status
    //  *         name: status
    //  *         type: integer
    //  *       - in: query
    //  *         description: mongoId
    //  *         name: mongoId
    //  *         type: string
    //  *     responses:
    //  *       200:
    //  *         description: Return success!
    //  *       404: 
    //  *         description: Return Not Found or ErrorMessage
    //  *       401:
    //  *         $ref: "#/responses/unauthorizedError"
    //  */
    // routes.put('/updateNotificationStatus', notificationControllers.updateNotificationStatus);


    return routes;
};