import Router from 'express';
import uploadController from './upload.controller.js'
const router = Router();
import UploadServices from '../../../Common/Services/upload.services.js'
import config from 'config'
const uploadServices = new UploadServices(config.get('uploadService'));

router.post('/media', uploadServices.mediaUpload.array('media', 5), uploadController.uploadMedia)
router.post('/get-media-details', uploadController.getUserMediaDetails);
router.delete('/delete-media', uploadController.deleteUserMedia);
router.post('/get-social-gallery', uploadController.getSocialGallery);
router.post('/ss_template', uploadController.uploadSSTemplate);
router.get('/get-ss-templates', uploadController.getSSTemplates);
router.delete('/delete-ss-templates', uploadController.deleteSSTemplates);
router.delete('/delete-particular-template', uploadController.deleteParticularTemplate);



// router.get('/logout', UserController.logout)

export default router