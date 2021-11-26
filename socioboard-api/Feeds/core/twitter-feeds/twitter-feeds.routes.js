import Router from 'express';
import feedsController from './twitter-feeds.controller.js';

/**
 * @typedef {import('./twitter.helpers.js')}
 */
import twitterHelpers from './twitter.helpers.js';

const router = Router();

router.get('/twitter/trends', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.getTrends.bind(feedsController));
router.get('/twitter/trends/available', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.getTrendsAvailable.bind(feedsController));
router.post('/get-tweets', feedsController.getTweets);
router.post('/twitter-like', feedsController.twitterLike);
router.post('/twitter-dislike', feedsController.twitterDislike);
router.post('/twitter-comment', feedsController.twitterComment);
router.delete('/twitter-comment', feedsController.twitterDeleteComment);
router.post('/twitter-retweet', feedsController.twtRetweet);
router.post('/twitter-unretweet', feedsController.twtUnretweet);
router.post('/twitter-retweet-with-comment', feedsController.twtRetweetWithComment);
router.put('/fetch-all-tweets', feedsController.fetchAllTweets);

router.get('/twitter/users/search', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.searchTwitterUsers.bind(feedsController));
router.get('/twitter/users/:userName', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.getUserWithTweets.bind(feedsController));
router.post('/twitter/users/follow', feedsController.getAddTwitterAccess(twitterHelpers.getFromBody), feedsController.follow.bind(feedsController));
router.post('/twitter/users/unfollow', feedsController.getAddTwitterAccess(twitterHelpers.getFromBody), feedsController.unfollow.bind(feedsController));

router.get('/twitter/account/friends', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.getAccountFriends.bind(feedsController));
router.post('/twitter/account/friends/import', feedsController.getAddTwitterAccess(twitterHelpers.getFromBody), feedsController.importAccountFriends.bind(feedsController));
router.get('/twitter/account/followers', feedsController.getAddTwitterAccess(twitterHelpers.getFromQuery), feedsController.getAccountFollowers.bind(feedsController));
router.post('/twitter/account/followers/import', feedsController.getAddTwitterAccess(twitterHelpers.getFromBody), feedsController.importAccountFollowers.bind(feedsController));

export default router;
