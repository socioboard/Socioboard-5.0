import Router from 'express';

import tikTokController from './tiktok.controller.js';
import tikTokHelpers from './tiktok.helpers.js';

const router = Router();

router.get(
  '/tiktok/account',
  tikTokController.getAddTikTokAccess(tikTokHelpers.getFromQuery),
  tikTokController.getUserInfo.bind(tikTokController),
);

router.get(
  '/tiktok/videos',
  tikTokController.getAddTikTokAccess(tikTokHelpers.getFromQuery),
  tikTokController.getVideoList.bind(tikTokController),
);

router.post(
  '/tiktok/videos/upload',
  tikTokController.getAddTikTokManyAccess(tikTokHelpers.getManyFromBody),
  tikTokController.uploadVideo.bind(tikTokController),
);

router.post(
  '/tiktok/audios/upload',
  tikTokController.getAddTikTokManyAccess(tikTokHelpers.getManyFromBody),
  tikTokController.uploadAudio.bind(tikTokController),
);

export default router;
