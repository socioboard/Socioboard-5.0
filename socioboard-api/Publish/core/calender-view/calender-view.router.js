/** Express router providing calender view related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';

/**
 * @typedef {import('./calender-view.controller.js')}
 */
import calenderViewValidatorController from './calender-view.controller.js';

/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To get scheduled details for calender view
 * Route serving scheduling details.
 * @name post/schedule-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns scheduled details
 */
router.post('/schedule-details', calenderViewValidatorController.scheduleDetails);

/**
 * @exports router for calender view
 */
export default router;
