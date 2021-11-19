/** Express router providing Demo related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';

/**
 * @typedef {import('./medium-demo.controller.js')}
 */
import demoController from './medium-demo.controller.js';

/**
 * Express router for demo related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

router.get('/demo/medium/me', demoController.getUserDetails.bind(demoController));

router.get('/demo/medium/users/:userId/publications', demoController.getPublications.bind(demoController));

router.post('/demo/medium/users/:userId/posts', demoController.createPost.bind(demoController));

router.post('/demo/medium/publications/:publicationId/posts', demoController.createPostUnderPublication.bind(demoController));

router.post('/demo/medium/images', demoController.uploadImage);

router.post('/demo/medium/graphql', demoController.getPosts);

router.get('/demo/medium/rss-api-json', demoController.getUserId);

router.get('/demo/medium/post', demoController.getDemoPost);

export default router;
