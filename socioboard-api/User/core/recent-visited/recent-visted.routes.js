import Router from 'express';
import RecentVisitedController from './recent-visted.controller.js';

const router = Router();

router.post('/get-recent-visited', RecentVisitedController.getRecentVisited);
router.delete('/delete-recent-visited', RecentVisitedController.deleteRecentVisited);
router.delete('/clear-recent-visited', RecentVisitedController.clearRecentVisited);

export default router;
