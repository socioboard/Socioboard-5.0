import Router from 'express';
import uploadController from './upload.controller.js';
const router = Router();
import UploadServices from '../../../Common/Services/upload.services.js';
import config from 'config';
const uploadServices = new UploadServices(config.get('uploadService'));

router.post(
  '/media',
  uploadServices.mediaUpload.array('media', 5),
  uploadController.uploadMedia
);
router.post('/get-media-details', uploadController.getUserMediaDetails);
router.delete('/delete-media', uploadController.deleteUserMedia);
router.post('/get-social-gallery', uploadController.getSocialGallery);
router.post('/ss_template', uploadController.uploadSSTemplate);
router.get('/get-ss-templates', uploadController.getSSTemplates);
router.delete('/delete-ss-templates', uploadController.deleteSSTemplates);
router.delete(
  '/delete-particular-template',
  uploadController.deleteParticularTemplate
);

/**
 * TODO To search user media with all filtration
 * Route To search user media with all filtration
 * @name post/search-media-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns user media details
 */
router.post('/search-media-details', uploadController.searchUserMediaDetails);

/**
 * TODO To update rating and title of media file
 * Route To update rating and title of media file
 * @name put/search-media-details
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns user media updated details
 */
router.put('/update-media', uploadController.updateMedia);

export default router;
