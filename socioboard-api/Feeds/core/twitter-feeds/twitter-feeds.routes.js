import Router from 'express';
import feedsController from './twitter-feeds.controller.js';

const router = Router();

router.post('/get-tweets', feedsController.getTweets);
router.post('/twitter-like', feedsController.twitterLike);
router.post('/twitter-dislike', feedsController.twitterDislike);
router.post('/twitter-comment', feedsController.twitterComment);
router.delete('/twitter-comment', feedsController.twitterDeleteComment);
router.post('/twitter-retweet', feedsController.twtRetweet);
router.post('/twitter-unretweet', feedsController.twtUnretweet);
router.post('/twitter-retweet-with-comment', feedsController.twtRetweetWithComment);
router.put('/fetch-all-tweets', feedsController.fetchAllTweets);

// router.get('/logout', UserController.logout)

export default router;
