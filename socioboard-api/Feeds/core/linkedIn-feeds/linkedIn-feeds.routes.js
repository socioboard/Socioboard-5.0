/** Express router providing LinkedIn feeds related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./linkedIn-feeds.controller.js')}
 */
import linkedInFeedsController from './linkedIn-feeds.controller.js';
/**
 * Express router to mount LinkedIn feeds related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To Fetch the linkedIn feeds
 * Function to Fetch the linkedIn feeds
 * @name get/get-linkedIn-feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Instagram Feeds
 */
router.get('/get-linkedIn-feeds', linkedInFeedsController.getLinkedInFeeds);

/**
 * TODO To Fetch The linkedIn Follower Stats
 * Function to Fetch the linkedIn Follower Stats
 * @name post/get-follower-stats
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns linkedIn Follower Stats
 */
router.post('/get-follower-stats', linkedInFeedsController.getFollowerStats);

/**
 * TODO To Fetch The linkedIn Page Stats
 * Function to Fetch The linkedIn Page Stats
 * @name post/get-page-stats
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns linkedIn Page Stats
 */
router.post('/get-page-stats', linkedInFeedsController.getPageStats);

export default router;
