/** Express router providing socket related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';

import config from 'config';
import Helper from '../../../Common/Services/authorize.services.js';
import logger from '../../resources/Log/logger.log.js';
import { CatchResponse, SuccessResponse } from '../../../Common/Shared/response.shared.js';
/**
 * Express router to mount socket related routes
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const routes = Router();

const helper = new Helper(config.get('authorize'));

/**
 * TODO To send team notification
 * To send team notification
 * @name get/sendTeamNotification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns success
 */
routes.get('/sendTeamNotification', (req, res) => {
  try {
    const io = req.app.get('socketio');
    const decryptedMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));

    io.sockets.to(req.query.teamId).emit('notification', decryptedMessage);
    logger.info(`\n${JSON.stringify(decryptedMessage)}\n`);

    return SuccessResponse(res);
  } catch (error) {
    logger.info(`\n${error}\n`);
  }
});

/**
 * TODO To send user notification
 * To send user notification
 * @name get/sendUserNotification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns success
 */
routes.get('/sendUserNotification', (req, res) => {
  try {
    const io = req.app.get('socketio');
    const decryptedMessage = JSON.parse(helper.decrypt(req.query.notificationDetails));

    io.sockets.in(Number(req.query.userId)).emit('notification', decryptedMessage);
    logger.info(`\n${JSON.stringify(decryptedMessage)}\n`);

    return SuccessResponse(res);
  } catch (error) {
    logger.info(`\n${error}\n`);
  }
});

export default routes;
