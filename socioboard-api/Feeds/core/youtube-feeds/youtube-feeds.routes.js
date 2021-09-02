import Router from 'express';
import feedsController from './youtube-feeds.controller.js';

const router = Router();

router.get('/get-youtube-feeds', feedsController.getYoutubeFeeds);
router.post('/youtube-like-dislike', feedsController.youtubeLike);
router.post('/youtube-comment', feedsController.youtubeComment);
router.post('/youtube-reply-comment', feedsController.youtubeReplyComment);
router.get('/get-recent-youtube-feeds', feedsController.getRecentYoutubeFeeds);

// router.get('/logout', UserController.logout)

export default router;
