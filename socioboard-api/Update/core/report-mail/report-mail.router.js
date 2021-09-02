/** Express router providing report mail routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./report-mail.controller.js')}
 */
import reportMailController from './report-mail.controller.js';
import planValidation from '../../../Common/Shared/plan-validation.js';

/**
 * Express router to mount report mail routes.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To create auto report scheduler
 * @description To create auto report scheduler.
 * @name post/create
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {string} Returns create auto report scheduler details
 */
router.post('/create', planValidation('CustomReport'), reportMailController.createReport);

/**
 * TODO To edit auto mail report scheduled details
 * @description To edit auto mail report scheduled details.
 * @name post/create
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {string} Returns updated status
 */
router.put('/edit', planValidation('CustomReport'), reportMailController.editReport);

/**
 * TODO To delete a auto report details
 * @description Delete a auto report details .
 * @name delete/delete
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {string} Returns delete status for a record
 */
router.delete('/delete', reportMailController.removeReport);

/**
 * TODO To get auto report mail details for user
 * @description Auto report details for user.
 * @name get/get-reports
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Auto report details for user
 */
router.get('/get-reports', reportMailController.getReports);

/**
 * TODO To get auto report mail details for a particular id.
 * @description Auto report details for particular id.
 * @name get/get-reports-by-id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Auto report details for particular id
 */
router.get('/get-reports-by-id', reportMailController.getReportsById);

/**
 * @exports router For auto report mail
 */
export default router;
