/** Express router providing youTube upload related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();
/**
 * @typedef {import('./socialAccount.controller.js')}
 */
import SocialAccController from './socialAccount.controller.js';

/**
 * TODO To get the redirect Url and state for specified network
 * Route get the Redirect Url
 * @name post/get-profile-redirect-url
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns redirect Url and state
 */
router.post(
  '/get-profile-redirect-url',
  SocialAccController.getProfileRedirectUrl
);

/**
 * TODO To add the specified network
 * Route add the specified network
 * @name post/add-social-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Added specified network details
 */
router.post('/add-social-profile', SocialAccController.addSocialProfile);

router.post('/get-Youtube-channels', SocialAccController.getYoutubeChannels);
router.post('/get-own-facebookpages', SocialAccController.getFacebookPages);
router.post(
  '/get-own-facebookGroups',
  SocialAccController.getOwnFacebookGroups
);
router.post(
  '/get-LinkedInCompany-Profiles',
  SocialAccController.getLinkedInCompanyProfileDetails
);
router.post(
  '/add-bulk-social-profile',
  SocialAccController.addBulkSocialProfiles
);
router.delete(
  '/delete-social-profile',
  SocialAccController.deleteSocialProfile
);

export default router;
