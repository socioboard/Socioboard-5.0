import Router from 'express';
import config from 'config';
import Helper from '../../../Common/Services/authorize.services.js'
import NotifyController from './notify.controller.js'
const helper = new Helper(config.get('authorize'));
import Logger from '../../resources/Log/Logger.log.js';
const router = Router();

function notifyServer(io) {
    router.post('/sendTeamNotification', (req, res, next) => {
        /* 	#swagger.tags = ['Notification']
            #swagger.description = ' To notify to entire team' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	#swagger.parameters['teamId'] = {
                in: 'query',
                required:true
            }
            #swagger.parameters['notificationDetails'] = {
                in: 'query',
                required:true
            }
     }*/
        try {
            console.log(`req ${req.query}`)
            //   let decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
            io.sockets.to(req.query.teamId).emit('notification', req.query.notificationDetails);
            Logger.info(`\n${JSON.stringify(req.query.notificationDetails)}\n`);
        } catch (error) {
            Logger.info(`\n${error}\n`);
            res.status(200).json({ code: 400, status: 'success', ErrMsg: error });
        }
        res.status(200).json({ code: 200, status: 'success' });

    })


    router.post('/sendUserNotification', (req, res, next) => {
        /* 	#swagger.tags = ['Notification']
                #swagger.description = ' To notify to entire team' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	#swagger.parameters['userId'] = {
                in: 'query',
                required:true
            }
            #swagger.parameters['notificationDetails'] = {
                in: 'query',
                required:true
            }
     }*/
        var data = {};
        try {
            Logger.info("Started ...");
            Logger.info(`Message : \n ${req.query.notificationDetails}`);
            var decryptedMessage = helper.decrypt(req.query.notificationDetails);
            Logger.info(`decryptedMessage : \n ${decryptedMessage}`);
            var decryptredMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));
            Logger.info(`\n${JSON.stringify(decryptredMessage)}\n`);

            io.sockets.in(req.query.userId).emit('notification', decryptredMessage);
            data.message = { code: 200, status: 'success' };
            data.code = 200;
        } catch (error) {
            Logger.info(`\n${error.message}\n`);
            data.message = { code: 400, status: 'failed', message: error.message };
            data.code = 400;
        }
        res.status(data.code).json(data.message);
    })

    router.post('/get-user-notification', NotifyController.getUserNotification)

}

export { notifyServer }

