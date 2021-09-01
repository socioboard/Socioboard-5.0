import Router from 'express';
import BoardController from './boards.controller.js';

const router = Router();

router.post('/create-board', BoardController.create);
router.post('/get-all-boards', BoardController.getAllBoards);
router.post('/update-board', BoardController.update);
router.delete('/delete-board', BoardController.delete);

export default router;
