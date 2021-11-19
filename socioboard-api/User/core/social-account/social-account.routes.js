/** Express router providing youTube upload related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./social-account.controller.js')}
 */
import SocialAccController from './social-account.controller.js';
/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

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
  SocialAccController.getProfileRedirectUrl,
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
  SocialAccController.getOwnFacebookGroups,
);
router.post(
'/get-LinkedInCompany-Profiles',
  SocialAccController.getLinkedInCompanyProfileDetails,
);


/**
 * TODO To add Intagram Business 
 * Route add the Intagram Business
 * @name post/get-instagram-business-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns added Instagram Business Profile details
 */
router.post('/get-instagram-business-profile',SocialAccController.getInstagramBusinessProfile);

/**
 * TODO Invite social Account Member
 * Route Invite social Account Member
 * @name post/invite-social-account-member
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} send Mail to Member
 */
router.post('/invite-social-account-member',SocialAccController.inviteSocialAccountMember);

/** TODO Add Medium Profile
 * Route add Medium Profile
 * @name post/add-medium-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Medium created account
 */
router.post('/add-medium-profile', SocialAccController.addMediumProfile);

/** TODO Add Tumblr Blogs
 * Route add Tumblr Blogs
 * @name post/get-own-tumbler-blog
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Tumblr account Blogs 
 */
 router.post('/get-own-tumbler-blog', SocialAccController.getTumblerBlog);

/**
 * TODO To add Multi Social Profile  
 * Route add Multi Social Profile 
 * @name post/add-bulk-social-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns bulk Social Profile  details
 */
 router.post('/add-bulk-social-profile',SocialAccController.addBulkSocialProfiles);

 /**
 * TODO Delete Social Profile 
 * Route Delete Social Profile 
 * @name delete/delete-social-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Deleted Account status 
 */
router.delete('/delete-social-profile',SocialAccController.deleteSocialProfile);


export default router;
