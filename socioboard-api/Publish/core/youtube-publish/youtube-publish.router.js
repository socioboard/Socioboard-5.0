/** Express router providing youTube upload related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./youtube-publish.controller.js')}
 */
import youtubePublishController from './youtube-publish.controller.js';
/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To upload youTube video to particular youTube account
 * Route upload video to youTube.
 * @name post/publish
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns youTube upload message
 */
router.post('/publish', youtubePublishController.uploadVideo);

/**
 * TODO To get uploaded and drafted youTube videos details to particular youTube account
 * Route To get uploaded and drafted youTube videos details.
 * @name post/published-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Uploaded and drafted youTube videos details
 */
router.get(
  '/published-details',
  youtubePublishController.getYouTubePublishedDetails
);

/**
 * TODO To get uploaded and drafted youTube videos details to particular team youTube account
 * Route To get uploaded and drafted youTube videos details.
 * @name post/published-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Uploaded and drafted youTube videos details
 */
router.get(
  '/team-published-details',
  youtubePublishController.getTeamYouTubePublishedDetails
);

/**
 * TODO To edit uploaded and drafted youTube videos details to particular youTube account
 * Route To edit uploaded and drafted youTube videos details.
 * @name put/edit-published-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Edit uploaded and drafted youTube videos details
 */
router.put(
  '/edit-published-details',
  youtubePublishController.editPublishedDetails
);

/**
 * TODO To get uploaded and drafted youTube videos details to particular post id
 * Route To get uploaded and drafted youTube videos details to particular post id.
 * @name put/edit-published-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Uploaded and drafted youTube videos details particular post id.
 */
router.get(
  '/published-details-by-id',
  youtubePublishController.getPublishedDetailsById
);

/**
 * TODO To delete youTube upload post details
 * Route To delete youTube upload post details.
 * @name delete/published-post
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Deleted youTube upload post details
 */
router.delete(
  '/published-details',
  youtubePublishController.deleteYouTubePublishedDetails
);

/**
 * @exports router for youtube upload
 */
export default router;
