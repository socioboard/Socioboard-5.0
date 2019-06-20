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
     *     summary: Secured
     *     security:
     *     - AccessToken: []
     *     tags:
     *       - Notify
     *     description: To notify to entire team
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         description: team Id
     *         name: teamId
     *         type: string
     *       - in: query
     *         description: Notification Message
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

        var notification = {
            TeamId: 1,
            Module: 'Publisher',
            Status: 200,
            AccountId: 1,
            Description: 'Posted Successfully',
            Value: 'MongoId'
        };
        io.sockets.in(req.query.teamId).emit('notification', notification);

        try {
            var decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
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
     *     summary: Secured
     *     security:
     *     - AccessToken: []
     *     tags:
     *       - Notify
     *     description: To notify to entire team
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         description: user Id
     *         name: userId
     *         type: string
     *       - in: query
     *         description: Notification Message
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
        var notification = {
            TeamId: 1,
            Module: 'Publisher',
            Status: 200,
            AccountId: 1,
            Description: 'Posted Successfully',
            Value: 'MongoId'
        };

        try {
            logger.info("Started ...");
            logger.info(`Message : \n ${req.query.notificationDetails}`);
            var decryptedMessage = helper.decrypt(req.query.notificationDetails);
            logger.info(`decryptedMessage : \n ${decryptedMessage}`);
            var decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
            logger.info(`\n${JSON.stringify(decryptredMessage)}\n`);

            io.sockets.in(req.query.userId).emit('notification', decryptredMessage);
        } catch (error) {
            logger.info(`\n${error.message}\n`);
        }
        res.status(200).json({ code: 200, status: 'success' });
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
         *     description: To notify to entire team
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: query
         *         description: user Id
         *         name: userId
         *         type: string
         *       - in: query
         *         description: Page Id
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
    routes.get('/getUserNotification', notificationControllers.getUsersNotifications);


    return routes;
};