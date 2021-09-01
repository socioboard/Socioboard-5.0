import Router from 'express';
import feedsController from './facebook-feeds.controller.js';

const router = Router();

router.get('/get-facebook-feeds', feedsController.getFacebookFeeds);
router.post('/facebook-like', feedsController.facebookLike);
router.post('/facebook-comment', feedsController.facebookComment);
router.get('/get-recent-feeds', feedsController.getRecentFbFeeds);
router.get('/get-recent-page-feeds', feedsController.getRecentFbPageFeeds);

// router.get('/logout', UserController.logout)

export default router;
