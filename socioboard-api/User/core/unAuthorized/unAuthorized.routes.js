/** Express router providing User related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./unauthorized.controller.js')}
 */
import unauthorizedController from './unauthorized.controller.js';
/**
 * Express router for user related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

router.get(
  '/check-username-availability',
  unauthorizedController.checkUserNameAvailability
);
router.get(
  '/check-email-availability',
  unauthorizedController.checkEmailAvailability
);
router.post('/register', unauthorizedController.register);
router.post('/login', unauthorizedController.login);
router.get('/verify-email', unauthorizedController.verifyEmail);
router.get('/forgot-password', unauthorizedController.forgotPassword);
router.get(
  '/verify-password-token',
  unauthorizedController.verifyPasswordToken
);
router.post('/reset-password', unauthorizedController.resetPassword);
router.get('/direct-login-mail', unauthorizedController.directLoginMail);
router.get(
  '/verify-direct-login-token',
  unauthorizedController.verifyDirectLoginToken
);
router.post('/un-hold-user', unauthorizedController.unHoldUser);
router.get('/verify-unhold-token', unauthorizedController.verifyUnHoldToken);
router.get('/social-login', unauthorizedController.socialLogin);
router.get(
  '/get-mail-activation-link',
  unauthorizedController.getActivationLink
);
router.post('/validate-token', unauthorizedController.validateToken);
/**
 * TODO To Fetch the User Plan  Details
 * Route Fetch the User Plan Details
 * @name get/get-plan-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns User Plan Details
 */
router.get('/get-plan-details', unauthorizedController.getPlanDetails);

export default router;
