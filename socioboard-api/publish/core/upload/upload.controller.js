import UploadService from './upload.service.js';

class UploadController {

    async uploadMedia(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request for uploading images/videos' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	#swagger.parameters['title'] = {
                in: 'query',
                description: 'title'
                }
                #swagger.parameters['media'] = {
                in: 'formData',
                type: 'file',
                description: 'The file to upload',
                 required: true
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
                #swagger.parameters['privacy'] = {
                in: 'query',
                description: 'public(0) or private(1) or publish(3)',
                 default:'0',
                enum: [0,1,3]
                }*/
        return await UploadService.uploadMedia(req, res, next);
    }

    async getUserMediaDetails(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'Get media details of users' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	    #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter Team Id',
                }
                #swagger.parameters['privacy'] = {
                in: 'query',
                description: 'public(0), private(1), both(2) , publish(3)',
                 default:'0',
                enum: [0,1,2,3]
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }*/
        return await UploadService.getUserMediaDetails(req, res, next);
    }

    async getSocialGallery(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'Get media details of all users' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	  #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }*/
        return await UploadService.getSocialGallery(req, res, next);
    }

    async uploadSSTemplate(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request for uploading SS Templates '  */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	  #swagger.parameters['title'] = {
                in: 'query',
                description: 'Title of image'
                }
                 #swagger.parameters['mediaDetails'] = {
                 in: 'body',
                 description: '',
                 required: true,
                 schema: { $ref: "#/definitions/mediaDetails" }
                 }
                */
        return await UploadService.uploadSSTemplate(req, res, next);
    }

    async getSSTemplates(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request for uploading SS Templates '  */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await UploadService.getSSTemplates(req, res, next);
    }

    async deleteSSTemplates(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request for uploading SS Templates '  */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        return await UploadService.deleteSSTemplates(req, res, next);
    }

    async deleteParticularTemplate(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request to delete Particular Template'  */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	  #swagger.parameters['templateId'] = {
              in: 'query',
              description: 'Title of image'
              }
              */
        return await UploadService.deleteParticularTemplate(req, res, next);
    }

    async deleteUserMedia(req, res, next) {
        /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To request to delete media from server' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	    #swagger.parameters['mediaId'] = {
                in: 'query',
                description: 'Enter mediaId',
                }
                #swagger.parameters['isForceDelete'] = {
                in: 'query',
                description: 'Specify option of perform force delete 0-no or 1-yes',
                default:'0',
                enum: [0,1]
                }}*/
        return await UploadService.deleteUserMedia(req, res, next);
    }



}
export default new UploadController();