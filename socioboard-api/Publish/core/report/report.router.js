import Router from 'express';
import reportController from './report.controller.js';
const routes = Router();

routes.get(
  '/get-schedule-published-report',
  reportController.getSchedulePublishedReport
);
routes.get(
  '/get-account-published-report',
  reportController.getAccountPublishedReport
);
routes.get('/get-today-post-count', reportController.getTodayPostedCount);
routes.get('/get-X-day-publish-count', reportController.getXDayPublishCount);
routes.get(
  '/get-accountwise-publish-count',
  reportController.getAccountwisePublishCount
);

// router.get('/logout', UserController.logout)

export default routes;
