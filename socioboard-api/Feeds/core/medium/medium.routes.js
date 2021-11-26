/** Express router providing medium related routes
 * @module Router
 * @type {import('express')}
 */
 import Router from 'express';
 import multer from 'multer';
 import _ from 'underscore';
 import uuid from 'uuidv1';
 import selectUserFromReqBodyMiddleware from '../../middleware/selectUserFromReqBody.middleware.js';
 import uploadMiddleware from '../../middleware/upload.middleware.js';
 import MEDIUM_CONSTANTS from '../../../Common/Constants/medium.constants.js';
 
 /**
   * @typedef {import('./bitly.controller.js')}
   */
 import MediumController from './medium.controller.js';
 
 import MediumService from './medium.service.js';
 
 /**
   * Express router to mount medium view related on.
   * @type {import('express').Router}
   * @const
   * @namespace router
   */
 const router = Router();
 
 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     const uploadFolderPath = `${process.cwd()}/uploads/medium`;
 
     MediumService.initUploadFolder(uploadFolderPath);
 
     cb(null, uploadFolderPath);
   },
   filename: (req, file, cb) => {
     const separatedFileName = file.originalname.split('.');
 
     const fileExtension = _.last(separatedFileName);
 
     cb(null, `${uuid()}-${new Date().getTime()}.${fileExtension}`);
   },
 });
 
 const upload = multer({
   storage,
   limits: { fileSize: MEDIUM_CONSTANTS.FILE_SIZE, files: 1 },
   fileFilter: (_, file, cb) => {
     const IMPORT_FILE_EXTENSION = new RegExp(`[/](${MEDIUM_CONSTANTS.FILE_EXTENSIONS.join('|')})$`);
 
     if (!IMPORT_FILE_EXTENSION.test(file.mimetype)) {
       cb({ message: MEDIUM_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_EXTENSION });
     }
 
     cb(null, true);
   },
 });
 
 router.get('/medium/account', MediumController.getUserDetails);
 
 router.get('/medium/publications', MediumController.getPublications);
 
 router.get('/medium/posts', MediumController.getPosts);
 
 router.post('/medium/posts', MediumController.createPost);
 
 router.post('/medium/publications/posts', MediumController.createPostUnderPublication);
 
 router.post('/medium/upload', selectUserFromReqBodyMiddleware, uploadMiddleware(upload, 'image'), MediumController.uploadImage);
 
 export default router;
 