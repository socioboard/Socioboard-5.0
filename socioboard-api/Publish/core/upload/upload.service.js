import {
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import UploadModel from '../../../Common/Models/upload.model.js';
import validate from './upload.validate.js';

const uploadModel = new UploadModel();

class UploadController {
  async uploadMedia(req, res, next) {
    try {
      const response = await uploadModel.uploadMedia(
        req.query.userScopeId,
        req.query.teamId,
        req.query.privacy,
        req.files,
        req.query.title,
        req.query.language
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getUserMediaDetails(req, res) {
    try {
      const {teamId, privacy, pageId} = req.query;
      const {value, error} = validate.getMediaDetails({
        teamId,
        privacy,
        pageId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await uploadModel.getUserMediaDetails(
        req.query.userScopeId,
        teamId,
        privacy,
        pageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getSocialGallery(req, res) {
    try {
      const response = await uploadModel.getSocialGallery(
        req.query.userScopeId,
        req.query.pageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async deleteUserMedia(req, res) {
    try {
      const response = await uploadModel.deleteUserMedia(
        req.query.isForceDelete,
        req.body.userScopeId,
        req.query.mediaId
      );

      SuccessResponse(res, null, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async uploadSSTemplate(req, res) {
    try {
      const response = await uploadModel.uploadSSTemplate(
        req.query.userScopeId,
        req.query.title,
        req.body.mediaDetails
      );

      SuccessResponse(res, null, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getSSTemplates(req, res) {
    try {
      const response = await uploadModel.getSSTemplates(req.body.userScopeId);

      SuccessResponse(res, null, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async deleteSSTemplates(req, res) {
    try {
      const response = await uploadModel.deleteSSTemplates(
        req.body.userScopeId
      );

      SuccessResponse(res, null, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async deleteParticularTemplate(req, res) {
    try {
      const response = await uploadModel.deleteParticularTemplate(
        req.body.userScopeId,
        req.query.templateId
      );

      SuccessResponse(res, null, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To search user media with all filtration
   * Route To search user media with all filtration
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns user media details
   */
  async searchUserMediaDetails(req, res) {
    try {
      const {SocialImageInfo} = req.body;
      const {teamId, filterPeriod, sortBy, pageId, userScopeId, since, until} =
        req.query;
      const {error} = validate.searchMediaDetails({
        SocialImageInfo,
        teamId,
        sortBy,
        pageId,
        since,
        until,
        filterPeriod,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const response = await uploadModel.searchUserMediaDetails(
        SocialImageInfo,
        teamId,
        sortBy,
        pageId,
        userScopeId,
        filterPeriod,
        since,
        until
      );
      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To update rating and title of media file
   * Route To update rating and title of media file
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns user media updated details
   */
  async updateMedia(req, res) {
    try {
      const {userScopeId} = req.body;
      const {mediaId, title, rating} = req.query;
      const {error} = validate.updateMediaDetails({
        mediaId,
        title,
        rating,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (!title && !rating)
        ValidateErrorResponse(res, 'Title or rating required.');
      let data = {};
      if (title) data.title = title;
      if (rating) data.rating = rating;
      await uploadModel.updateMedia(userScopeId, mediaId, data);
      SuccessResponse(res, 'Media details successfully updated.');
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }
}

export default new UploadController();
