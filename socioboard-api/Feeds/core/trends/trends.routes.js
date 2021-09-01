import Router from 'express';
import trendController from './trends.controller.js';
import planValidation from '../../../Common/Shared/plan-validation.js';

const router = Router();

router.use(planValidation('Discovery'))
router.post('/get-youtube', trendController.getYoutube);
router.post('/get-Twitter', trendController.getTwitter);
router.use(planValidation('ContentStudio'))
router.post('/get-giphy', trendController.getGiphy);
router.post('/get-imgur', trendController.getImgur);
router.post('/get-flickr', trendController.getFlickr);
router.post('/get-daily-motion', trendController.getDailyMotion);
router.post('/get-news-api', trendController.getNewsAPI);
router.post('/get-pixabay', trendController.getPixabay);


// router.get('/logout', UserController.logout)

export default router;
