import Router from 'express';
import trendController from './trend.controller.js'
const router = Router();


router.post('/get-giphy', trendController.getGiphy)
router.post('/get-imgur', trendController.getImgur)
router.post('/get-flickr', trendController.getFlickr)
router.post('/get-daily-motion', trendController.getDailyMotion)
router.post('/get-news-api', trendController.getNewsAPI)
router.post('/get-pixabay', trendController.getPixabay)
router.post('/get-youtube', trendController.getYoutube)
router.post('/get-Twitter', trendController.getTwitter)






// router.get('/logout', UserController.logout)

export default router