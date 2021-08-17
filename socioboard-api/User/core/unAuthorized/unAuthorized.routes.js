import Router from 'express';

import unauthorizedController from './unAuthorized.controller.js'

const router = Router();
router.get('/check-username-availability', unauthorizedController.checkUserNameAvailability)
router.get('/check-email-availability', unauthorizedController.checkEmailAvailability)
router.post('/register', unauthorizedController.register)
router.post('/login', unauthorizedController.login)
router.get('/verify-email', unauthorizedController.verifyEmail)
router.get('/forgot-password', unauthorizedController.forgotPassword)
router.get('/verify-password-token', unauthorizedController.verifyPasswordToken)
router.post('/reset-password', unauthorizedController.resetPassword)
router.get('/direct-login-mail', unauthorizedController.directLoginMail)
router.get('/verify-direct-login-token', unauthorizedController.verifyDirectLoginToken)
router.post('/direct-login', unauthorizedController.directLogin)
router.post('/un-hold-user', unauthorizedController.unHoldUser)
router.get('/verify-unhold-token', unauthorizedController.verifyUnHoldToken)
router.get('/social-login', unauthorizedController.socialLogin)
router.get('/get-mail-activation-link', unauthorizedController.getActivationLink);
router.get('/get-plan-details', unauthorizedController.getPlanDetails)

export default router