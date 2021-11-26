/** Express router providing bitly related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';

/**
* @typedef {import('./bitly.controller.js')}
*/
import BitlyController from './bitly.controller.js';

/**
* Express router to mount bitly view related on.
* @type {import('express').Router}
* @const
* @namespace router
*/
const router = Router();

router.get('/bitly/account', BitlyController.getAccountDetails);

router.get('/bitly/limits', BitlyController.getPlatformLimits);

router.get('/bitly/links', BitlyController.getGroupLinks);

router.post('/bitly/links', BitlyController.shortenLink);

router.delete('/bitly/links', BitlyController.archiveLink);

export default router;
 