/** Express router providing Pinterest related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./pinterest-pins.controller.js')}
 */
import PinterestPinsController from './pinterest-pins.controller.js'
/**
 * Express router to Fetch the Pinterest Pins
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To Fetch the Pinterest Pins for specific Boards
 * Function to Fetch Pinterest Pins for specific Boards
 * @name get-tumblr-feeds
 * @param {import('express').Request} req   
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns  Pinterest Pins
 */
router.get('/get-pinterest-pins', PinterestPinsController.getPinterestPins);

export default router;