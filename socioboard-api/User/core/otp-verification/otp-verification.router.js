/** Express router providing otp verification routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./unauthorized.controller.js')}
 */
import OtpVerificationController from './otp-verification.controller.js';
/**
 * Express router for otp verification related operations
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
router.get('/get-otp-phone-number', OtpVerificationController.getOtpPhoneNumber);

/**
 * TODO To verify OTP for phone number
 * Route To verify OTP for phone number
 * @name post/verify-otp-phone-number
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns OTP verify status
 */
router.post('/verify-otp-phone-number', OtpVerificationController.getOtpPhoneNumberVerify);

/**
 * TODO To get OTP for email 
 * Route To get OTP for email
 * @name get/get-otp-email
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns OTP sent status
 */
router.get('/get-otp-email', OtpVerificationController.getOtpEmail);

/**
 * TODO To verify OTP for email
 * Route To verify OTP for email
 * @name post/verify-otp-emai
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns OTP verify status
 */
router.post('/verify-otp-email', OtpVerificationController.getOtpEmailVerify);

export default router;