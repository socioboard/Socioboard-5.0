import Router from 'express';
import planValidation from '../../../Common/Shared/plan-validation.js';
import rssController from './rss-feeds.controller.js';

const router = Router();
router.get('/get-rss-feeds', planValidation('RssFeeds'), rssController.getRssFeeds);
router.get('/get-recent-rssurls', rssController.getRecentRssUrl);
router.get('/get-bookmarked-rssurls', rssController.getBookMarkedRssUrl);
router.post('/bookmark-rssurl', rssController.bookmarkUrl);
router.post('/update-rss-urls', rssController.updateRssUrls);
router.delete('/delete-rss-urls', rssController.deleteRssUrls);
router.delete('/clear-rss-urls', rssController.clearRssUrls);

// router.get('/logout', UserController.logout)

export default router;
