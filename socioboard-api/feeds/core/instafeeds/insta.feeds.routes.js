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
 * @typedef {import('./insta.feeds.controller.js')}
 */
import feedsController from './insta.feeds.controller.js';

/**
 * TODO To Fetch the Instagram Feeds
 * Function to Fetch the Instagram Feeds
 * @name get/get-insta-feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */
router.get('/get-insta-feeds', feedsController.getInstaFeeds);

export default router;
