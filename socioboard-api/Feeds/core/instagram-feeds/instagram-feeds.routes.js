/** Express router providing youTube upload related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./instagram-feeds.controller.js')}
 */
import feedsController from './instagram-feeds.controller.js';
/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

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

/**
 * TODO To Fetch the Instagram Business Feeds
 * Function to Fetch the Instagram Business Feeds
 * @name get-insta-business-feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */
router.get('/get-insta-business-feeds', feedsController.getInstaBusinessFeeds);

/**
 * TODO To Fetch the Instagram Business Publish Limit
 * Function to Fetch the Instagram Business Publish Limit
 * @name get-insta-business-publish-limit
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Publish limit
 */
router.post('/get-insta-business-publish-limit', feedsController.getInstaBusinessPublishLimit);

export default router;
