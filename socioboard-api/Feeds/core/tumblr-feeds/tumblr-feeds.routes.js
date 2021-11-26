/** Express router providing Tumblr related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./tumblr-feeds.controller.js')}
 */
import TumblrfeedsController from './tumblr-feeds.controller.js'
/**
 * Express router to Fetch the Tumblr Feeds.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To Fetch the Tumbler Feeds
 * Function to Fetch the Tumbler Feeds
 * @name get-tumblr-feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Tumblr Feeds
 */
router.get('/get-tumblr-feeds', TumblrfeedsController.getTumblrFeeds);

export default router;