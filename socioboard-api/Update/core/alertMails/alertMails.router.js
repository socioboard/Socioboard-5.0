import Router from 'express';
import alertMailsController from './alertMails.controller.js'
const router = Router();


router.post('/send-expire-alert', alertMailsController.sendExpireAlert)
router.post('/send-expired-intimation', alertMailsController.sendExpiredIntimation);
router.post('/send-expired-mail', alertMailsController.sendExpiredMail);


// router.get('/logout', UserController.logout)

export default router