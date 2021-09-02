import Router from 'express';
import SocialCallbackController from './social-callback.controller.js';

const router = Router();

router.post('/facebook-callback', SocialCallbackController.facebookCallback);
router.post('/google-callback', SocialCallbackController.googleCallback);
router.post('/github-callback', SocialCallbackController.githubCallback);
router.post('/twitter-callback', SocialCallbackController.twitterCallback);

export default router;
