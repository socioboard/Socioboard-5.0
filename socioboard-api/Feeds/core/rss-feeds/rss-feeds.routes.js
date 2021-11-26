import Router from 'express';
import multer from 'multer';
import uuid from 'uuidv1';
import planValidation from '../../../Common/Shared/plan-validation.js';
import rssController from './rss-feeds.controller.js';
import rssFeedsService from './rss-feeds.service.js';
import selectUserFromReqBodyMiddleware from '../../middleware/selectUserFromReqBody.middleware.js';
import uploadMiddleware from '../../middleware/upload.middleware.js';
import RSS_CONSTANTS from './rss-feeds.constants.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolderPath = `${process.cwd()}/uploads/rss`;

    rssFeedsService.initUploadFolder(uploadFolderPath);

    cb(null, uploadFolderPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = rssFeedsService.getFileExtension(file.originalname);

    cb(null, `${uuid()}-${new Date().getTime()}.${fileExtension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: RSS_CONSTANTS.FILE_SIZE, files: 1 },
  fileFilter: (_, file, cb) => {
    const IMPORT_FILE_EXTENSION = new RegExp(`[/](${RSS_CONSTANTS.FILE_EXTENSIONS.join('|')})$`);

    if (!IMPORT_FILE_EXTENSION.test(file.mimetype)) {
      cb({ message: RSS_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_EXTENSION });
    }

    cb(null, true);
  },
});

router.get('/get-rss-feeds', planValidation('RssFeeds'), rssController.getRssFeeds);
router.get('/get-recent-rssurls', rssController.getRecentRssUrl);
router.get('/get-bookmarked-rssurls', rssController.getBookMarkedRssUrl);
router.post('/bookmark-rssurl', rssController.bookmarkUrl);
router.post('/update-rss-urls', rssController.updateRssUrls);
router.delete('/delete-rss-urls', rssController.deleteRssUrls);
router.delete('/clear-rss-urls', rssController.clearRssUrls);

router.get('/rss/parse', rssController.parseLink);
router.get('/rss/channels', rssController.getAllChannels);
router.get('/rss/channels/:channelId', rssController.getChannel);
router.post('/rss/channels', rssController.createChannel);
router.delete('/rss/channels/', rssController.deleteManyChannels);
router.delete('/rss/channels/:channelId', rssController.deleteManyLinks);
router.patch('/rss/channels/:channelId', rssController.updateChannel);
router.post('/rss/channels/:channelId/links', rssController.createLink);
router.post('/rss/channels/import/', selectUserFromReqBodyMiddleware, uploadMiddleware(upload, 'file'), rssController.importChannels);

router.get('/rss/backup/channels/:channelId/links', rssController.getBackupChannel);
router.post('/rss/backup/channels/:channelId', rssController.backupChannel);
router.get('/rss/backup/channels/:channelId/links/:linkId', rssController.getLinkBackupHistory);
router.get('/rss/backup/links/:linkId', rssController.getBackupLink);
// router.get('/logout', UserController.logout)

export default router;
