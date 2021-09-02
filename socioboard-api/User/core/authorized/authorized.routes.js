/** Express router providing User related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./authorized.controller.js')}
 */
import authorizedController from './authorized.controller.js';
/**
 * Express router for user related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

router.post('/change-password', authorizedController.changePassword);
router.delete('/delete-user', authorizedController.deleteUser);
router.post('/hold-user', authorizedController.holdUser);

/**
 * TODO To Fetch the User Details
 * Route Fetch the User Details
 * @name get/get-user-info
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns User Details
 */
router.get('/get-user-info', authorizedController.getUserInfo);

/**
 * TODO To Update the User Details
 * Route Update update-profile-details
 * @name post/publish
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns updated  User Details
 */
router.post(
  '/update-profile-details',
  authorizedController.updateProfileDetails,
);
router.post('/change-plan', authorizedController.changePlan);

// router.get('/logout', UserController.logout)

export default router;
