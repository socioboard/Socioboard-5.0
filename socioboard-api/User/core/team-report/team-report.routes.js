import Router from 'express';
import teamReportController from './team-report.controller.js';

const router = Router();

router.post('/get-team-scheduler-stats', teamReportController.getTeamSchedulerStats);

// router.get('/logout', UserController.logout)

export default router;
