/** Express router providing appsumo routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./appsumo.controller.js')}
 */
import AppSumoController from './appsumo.controller.js';
/**
 * Express router for otp appsumo related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To get OTP for phone number
 * Route To get OTP for phone number
 * @name get/get-otp-phone-number
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns OTP sent status
 */
router.post('/get-access-token', AppSumoController.getAccessToken);

/**
 * TODO To verify OTP for phone number
 * Route To verify OTP for phone number
 * @name post/verify-otp-phone-number
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns OTP verify status
 */
router.post('/notification', AppSumoController.notification);

export default router;
