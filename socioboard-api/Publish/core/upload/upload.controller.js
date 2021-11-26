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

  /**
   * TODO To search user media with all filtration
   * Route To search user media with all filtration
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns user media details
   */
  async searchUserMediaDetails(req, res, next) {
    /* 	#swagger.tags = ['Upload']
            #swagger.description = 'Get media details of users' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	    #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter Team Id',
                }
                #swagger.parameters['criteria'] = {
                in: 'body',
                description: 'User team to edit',
                required: true,
                schema: { $ref: "#/definitions/searchImage" }
                } 
                #swagger.parameters['filterPeriod'] = {
                in: 'query',
                description: 'Filter Period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range',
                enum: [1,2,3,4,5,6,7]
                }
                #swagger.parameters['since'] = {
                in: 'query',
                description: 'Custom since range in YYYY-MM-DD format'
                }
                #swagger.parameters['until'] = {
                in: 'query',
                description: 'Custom untill range in YYYY-MM-DD format'
                } 
                #swagger.parameters['sortBy'] = {
                in: 'query',
                description: 'Sort by Asc or Desc',
                default: 'desc',
                enum: ['asc','desc']
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                }*/
    return await UploadService.searchUserMediaDetails(req, res, next);
  }

  /**
   * TODO To update rating and title of media file
   * Route To update rating and title of media file
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns user media updated details
   */
  async updateMedia(req, res, next) {
    /* 	#swagger.tags = ['Upload']
            #swagger.description = 'To update user media details' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	    #swagger.parameters['mediaId'] = {
                in: 'query',
                description: 'Enter mediaId',
                }
                #swagger.parameters['title'] = {
                in: 'query',
                description: 'Enter media title',
                }
                #swagger.parameters['rating'] = {
                in: 'query',
                description: 'Enter mediaId',
                default:'1',
                enum: [1,2,3,4,5]
                }
                */
    return await UploadService.updateMedia(req, res, next);
  }
}
export default new UploadController();
