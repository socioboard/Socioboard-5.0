import Router from 'express';
import NetworkinsightController from './network-insight.controller.js';

const router = Router();

router.post('/get-team-insight', NetworkinsightController.getTeamInsights);
router.post('/get-twitter-insight', NetworkinsightController.getTwitterInsights);
router.post('/get-twitter-stats', NetworkinsightController.getTwitterStats);
router.post('/get-facebook-page-insight', NetworkinsightController.getFaceBookPageInsights);
router.post('/get-youtube-insight', NetworkinsightController.getYouTubeInsights);
router.post('/get-linked-in-insight', NetworkinsightController.getLinkedInInsights);

export default router;
