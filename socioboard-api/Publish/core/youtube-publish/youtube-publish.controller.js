/**
 * @typedef {import("./youtube-publish.service.js")}
 */
import uploadService from './youtube-publish.service.js';

/**
 * YoutubeUploadController class
 * Base class for YoutubeUploadController
 */
class YoutubeUploadController {
  /**
   * TODO To upload youTube video to particular youTube account
   * Upload chosen video file to youTube
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns youTube upload message
   */
  async uploadVideo(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request for uploading videos' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['accountId'] = {
            in: 'query',
            description: 'YouTube account id',
            }
            #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team Id'
            }
            #swagger.parameters['postDetails'] = {
            in: 'body',
            description: 'Video post details',
            required: true,
            schema: { $ref: "#/definitions/postDetails" }
            }
        */
    return await uploadService.uploadVideo(req, res, next);
  }

  /**
   * TODO To get uploaded and drafted youTube videos details to particular youTube account
   * To get uploaded and drafted youTube videos details.
   * @param {import('express').Request} req Res
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns uploaded and drafted youTube videos details.
   */
  async getYouTubePublishedDetails(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request for uploaded and drafted youTube videos details' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['accountId'] = {
            in: 'query',
            description: 'YouTube account id',
            }
            #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team Id'
            }
            #swagger.parameters['pageId'] = {
            in: 'query',
            description: 'Pagination Id'
            }
            #swagger.parameters['postType'] = {
            in: 'query',
            description: '0-Published post,1-Draft ,2-Both',
            default: '0',
            enum: ["0","1","2"]
            }
        */
    return await uploadService.getYouTubePublishedDetails(req, res, next);
  }

  /**
   * TODO To get uploaded and drafted youTube videos details to particular youTube account
   * To get uploaded and drafted youTube videos details.
   * @param {import('express').Request} req Res
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns uploaded and drafted youTube videos details.
   */
  async getTeamYouTubePublishedDetails(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request for uploaded and drafted youTube videos details' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team Id'
            }
            #swagger.parameters['pageId'] = {
            in: 'query',
            description: 'Pagination Id'
            }
            #swagger.parameters['postType'] = {
            in: 'query',
            description: '0-Published post,1-Draft ,2-Both',
            default: '0',
            enum: ["0","1","2"]
            }
        */
    return await uploadService.getTeamYouTubePublishedDetails(req, res, next);
  }

  /**
   * TODO To delete youTube upload post details
   * This function To delete youTube upload post details.
   * @param {import('express').Request} req Res
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns deleted youTube upload post details
   */
  async deleteYouTubePublishedDetails(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request for delete post details' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['postId'] = {
            in: 'query',
            description: 'Post Id'
            }
        */
    return await uploadService.deleteYouTubePublishedDetails(req, res, next);
  }

  /**
   * TODO To get youTube upload post details by id
   * This function To get youTube upload post details by id.
   * @param {import('express').Request} req Res
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns youTube upload post details by id
   */
  async getPublishedDetailsById(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request get post details by Id'  */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['postId'] = {
            in: 'query',
            description: 'Post Id'
            }
        */
    return await uploadService.getPublishedDetailsById(req, res, next);
  }

  /**
   * TODO To edit youTube upload post details
   * This function To edit youTube upload post details.
   * @param {import('express').Request} req Res
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns edited youTube upload post details
   */
  async editPublishedDetails(req, res, next) {
    /*  #swagger.tags = ['Youtube Upload']
            #swagger.description = 'To request for edit post details' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
        */
    /*	#swagger.parameters['postId'] = {
            in: 'query',
            description: 'Post Id'
            }
            #swagger.parameters['accountId'] = {
            in: 'query',
            description: 'YouTube account id',
            }
            #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team Id'
            }
            #swagger.parameters['postDetails'] = {
            in: 'body',
            description: 'Video post details',
            required: true,
            schema: { $ref: "#/definitions/postDetails" }
            }
        */
    return await uploadService.editPublishedDetails(req, res, next);
  }
}

export default new YoutubeUploadController();
