/** Express router providing Demo related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';

/**
 * @typedef {import('./bitly-demo.controller.js')}
 */
import demoController from './bitly-demo.controller.js';

/**
 * Express router for demo related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

router.get('/demo/bitly/oauth/authorize', demoController.bitlyOAuthAuthorize.bind(demoController));
router.get('/demo/bitly/callback', demoController.bitlyCallback.bind(demoController));
router.get('/demo/bitly/user', demoController.getUserDetails.bind(demoController));
router.get('/demo/bitly/user/platform_limits', demoController.getPlatformLimits.bind(demoController));
router.get('/demo/bitly/groups/:group_guid/bitlinks', demoController.getGroupLink.bind(demoController));
router.post('/demo/bitly/access_token', demoController.getAccessToken.bind(demoController));
router.post('/demo/bitly/shorten', demoController.shortenLink.bind(demoController));
router.patch('/demo/bitly/bitlinks/bit.ly/:bitlink', demoController.archiveLink.bind(demoController));

export default router;
