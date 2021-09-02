import Router from 'express';
import schedulerController from './schedule.controller.js';

const router = Router();

router.post('/create', schedulerController.create);
router.get('/get-schedule-details', schedulerController.getScheduleDetails);
router.get('/get-filtered-schedule-details', schedulerController.getFilteredScheduleDetails);
router.get('/get-schedule-details-by-categories', schedulerController.getScheduleDetailsByCategories);
router.put('/change-schedule-status', schedulerController.changeScheduleStatus);
router.put('/cancel', schedulerController.cancel);
router.post('/get-schedule-post-by-id', schedulerController.getSchedulePostById);
router.delete('/delete', schedulerController.delete);
router.put('/edit', schedulerController.edit);
router.put('/edit-draft-schedule', schedulerController.editDraftSchedule);

// router.get('/logout', UserController.logout)

export default router;
