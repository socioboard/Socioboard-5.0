const routes = require("express").Router();
const config = require('config');
const fileUploaderController = require('./controllers/fileUploaderController');
const UploadServices = require('../../../library/utility/uploadServices');
const uploadServices = new UploadServices(config.get('uploadService'));


/**
 * @swagger
 * responses:
 *   unauthorizedError:
 *     description: Accesstoken is missing or invalid
 *     headers:
 *       x-access-token:
 *         type: string
 *         description: Access denied for your requested url, please provide proper x-access-token with the request
 * /v1/upload/media:
 *   post:
 *     operationId: secured_upload_media
 *     summary: Secured, Please update the access token then only current route will execute
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Uploads
 *     description: To request for uploading images/videos  
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: query
 *         description: Provide title 
 *         name: title
 *         type: string
 *       - in: formData
 *         name: media
 *         type: file
 *         required: true
 *         description: The file to upload.
 *       - in: query
 *         description: Provide teamId 
 *         name: teamId
 *         type: string
 *       - in: query
 *         description: Specify public(0) or private(1) or publish(3)
 *         name: privacy
 *         type: number
 *         enum: [0,1,3]
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/media', uploadServices.mediaUpload.array('media', 5), fileUploaderController.uploadMedia);

/**
 * @swagger
 * /v1/upload/getMediaDetails:
 *   get:
 *     operationId: secured_getMediaDetails
 *     summary: Secured, Please update the access token then only current route will execute
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Uploads
 *     description: To request for user published Data
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: query
 *         description: Provide teamId 
 *         name: teamId
 *         type: number
 *       - in: query
 *         description: Specify type, public(0), private(1), both(2) or publish(3)
 *         name: privacy
 *         type: number
 *         enum: [0,1,2,3]
 *       - in: query
 *         description: Provide the pagination id 
 *         name: pageId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getMediaDetails', fileUploaderController.getUserMediaDetails);


/**
 * @swagger
 * /v1/upload/deleteMedia:
 *   delete:
 *     operationId: secured_upload_deleteMedia
 *     summary: Secured, Please update the access token then only current route will execute
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Uploads
 *     description: To request to delete media from server
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: query
 *         description: Provide the mediaId 
 *         name: mediaId
 *         type: string
 *       - in: query
 *         description: Specify option of perform force delete 0-no or 1-yes
 *         name: isForceDelete
 *         type: integer
 *         enum: [0,1]
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/deleteMedia', fileUploaderController.deleteUserMedia);


module.exports = routes;