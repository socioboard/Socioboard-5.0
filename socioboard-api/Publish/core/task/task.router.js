import Router from 'express';
import taskController from './task.controller.js';
const router = Router();

router.get('/get-tasks', taskController.getTasks);
router.put('/assign-task', taskController.assignTask);
router.post('/update-task-status', taskController.updateTaskStatus);

// router.get('/logout', UserController.logout)

export default router;
