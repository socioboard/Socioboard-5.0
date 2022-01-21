import Router from 'express';
import schedulerController from './schedule.controller.js';

const router = Router();

router.post('/create', schedulerController.create);
router.get('/get-schedule-details', schedulerController.getScheduleDetails);
router.get(
  '/get-filtered-schedule-details',
  schedulerController.getFilteredScheduleDetails
);
router.get(
  '/get-schedule-details-by-categories',
  schedulerController.getScheduleDetailsByCategories
);
router.put('/change-schedule-status', schedulerController.changeScheduleStatus);
router.put('/cancel', schedulerController.cancel);
router.post(
  '/get-schedule-post-by-id',
  schedulerController.getSchedulePostById
);
router.delete('/delete', schedulerController.delete);
router.put('/edit', schedulerController.edit);
router.put('/edit-draft-schedule', schedulerController.editDraftSchedule);

/**
 * TODO To get all published post for a schedule
 * Route serving published post for a schedule
 * @name post/et-published-schedule-post-by-id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns published post details
 */
router.post(
  '/get-published-schedule-post-by-id',
  schedulerController.getPublishedSchedulePostById
);

router.post(
  '/filter-schedule-details-by-categories',
  schedulerController.getFilterScheduleDetailsByCategories
);

router.get(
  '/get-active-schedule-count',
  schedulerController.getActiveScheduleCount
);

router.get(
  '/get-schedule-details-count',
  schedulerController.getScheduleDetailsCount
);

export default router;
