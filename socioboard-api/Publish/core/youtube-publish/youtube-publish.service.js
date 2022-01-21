/**
 * @typedef {import('../../../Common/Shared/response.shared.js')}
 */
import config from 'config';
import {
  SuccessResponse,
  CatchResponse,
  ErrorResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
/**
 * @typedef {import('./youtube-publish.validate.js')}
 */
import validate from './youtube-publish.validate.js';
/**
 * @typedef {import('./youtube-publish.validate.js')}
 */
import GoogleConnect from '../../../Common/Cluster/google.cluster.js';
/**
 * @typedef {import('./youtube-publish.validate.js')}
 */
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
/**
 * @typedef {import('config')}
 */
/**
 * Add model
 * @typedef {import('../../../Common/Models/schedule.model.js')}
 */
import YouTubeModel from '../../../Common/Models/youtube-upload.model.js';

const youTubeModel = new YouTubeModel();

/**
 * YoutubeUploadService class
 * Base class for YouTubeUploadService
 */
class YoutubeUploadService {
  /**
   * The class constructor
   * @param  {object} {googleConnect} Google developer app credential
   */
  constructor() {
    this.googleConnect = new GoogleConnect(config.get('google_api'));
  }

  /**
   * TODO To upload youtube video to particular youTube account
   * Upload video to youtube account
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns youtube upload message
   */
  async uploadVideo(req, res) {
    try {
      const {teamId, accountId} = req.query;
      const {error} = validate.validateUploadVideo({
        teamId,
        accountId,
        postDetails: req?.body?.postDetails,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (req?.body?.postDetails?.postType === 1) {
        await youTubeModel.updateTable(
          req.body.userScopeId,
          accountId,
          teamId,
          req.body.postDetails
        );
        return SuccessResponse(res, 'Saved as Draft Successfully');
      }
      await this.postVideoOnYouTube(
        res,
        accountId,
        req?.body?.userScopeId,
        teamId,
        req?.body?.postDetails,
        req.body.userScopeName
      );
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get uploaded and drafted youTube videos details to particular youTube account
   * Function To get uploaded and drafted youTube videos details.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Uploaded and drafted youTube videos details
   */
  async getYouTubePublishedDetails(req, res) {
    try {
      const {teamId, accountId, postType, pageId} = req.query;
      const {error} = validate.validateUploadVideoDetails({
        teamId,
        accountId,
        postType,
        pageId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      await userTeamAccounts.getSocialAccount(
        9,
        accountId,
        req.body.userScopeId,
        teamId
      );
      const postDetails = await youTubeModel.postDetails(
        req.body.userScopeId,
        accountId,
        teamId,
        postType,
        pageId
      );

      SuccessResponse(res, postDetails);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get uploaded and drafted youTube videos details to particular team youTube account
   * Function To get uploaded and drafted youTube videos details.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Uploaded and drafted youTube videos details
   */
  async getTeamYouTubePublishedDetails(req, res) {
    try {
      const {teamId, postType, pageId} = req.query;
      const {error} = validate.validateTeamUploadVideoDetails({
        teamId,
        postType,
        pageId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      await userTeamAccounts.isTeamValidForUser(req.body.userScopeId, teamId);
      const postDetails = await youTubeModel.postTeamDetails(
        req.body.userScopeId,
        teamId,
        postType,
        pageId
      );
      SuccessResponse(res, postDetails);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To delete youTube upload post details
   * Function To delete youTube upload post details.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Deleted youTube upload post details
   */
  async deleteYouTubePublishedDetails(req, res) {
    try {
      if (!req.query.postId)
        return ValidateErrorResponse(res, 'Post id required');
      const result = await youTubeModel.getPostDetailsByIdWithPostType(
        req.body.userScopeId,
        req.query.postId
      );

      if (!result) return ErrorResponse(res, 'No record found');
      const response = await youTubeModel.deletePostDetailsById(
        req.body.userScopeId,
        req.query.postId,
        result.mongo_id
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get uploaded and drafted youTube videos details to particular post id
   * Function To get uploaded and drafted youTube videos details to particular post id.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Uploaded and drafted youTube videos details particular post id.
   */
  async getPublishedDetailsById(req, res) {
    try {
      if (!req.query.postId)
        return ValidateErrorResponse(res, 'Post id required');
      const result = await youTubeModel.getPostDetailsByIdWithPostType(
        req.body.userScopeId,
        req.query.postId
      );

      if (!result) return ErrorResponse(res, 'No record found');
      const response = await youTubeModel.getPostDetailsByIdWithMongo(
        req.body.userScopeId,
        req.query.postId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To edit uploaded and drafted youTube videos details to particular youTube account
   * Function To edit uploaded and drafted youTube videos details.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Edit uploaded and drafted youTube videos details
   */
  async editPublishedDetails(req, res) {
    try {
      if (!req.query.postId)
        return ValidateErrorResponse(res, 'Post id required');
      const {teamId, accountId} = req.query;
      const {error} = validate.validateUploadVideo({
        teamId,
        accountId,
        postDetails: req.body.postDetails,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const result = await youTubeModel.getPostDetailsByIdWithPostType(
        req.body.userScopeId,
        req.query.postId
      );
      if (!result) return ErrorResponse(res, 'No record found');
      if (result.upload_type == 1) {
        if (req.body.postDetails.postType === 1) {
          await youTubeModel.updateDraftTable(
            req.body.userScopeId,
            accountId,
            teamId,
            req.body.postDetails,
            result.mongo_id,
            req.query.postId
          );
          return SuccessResponse(res, 'Draft updated Successfully');
        }
        if (req.body.postDetails.postType === 0) {
          await this.postVideoOnYouTube(
            res,
            accountId,
            req.body.userScopeId,
            teamId,
            req.body.postDetails,
            req.body.userScopeName,
            result.mongo_id,
            req.query.postId
          );
        }
      } else {
        if (req.body.postDetails.postType === 1) {
          await youTubeModel.updateTable(
            req.body.userScopeId,
            accountId,
            teamId,
            req.body.postDetails
          );

          return SuccessResponse(res, 'Saved as Draft Successfully');
        }
        await this.postVideoOnYouTube(
          res,
          accountId,
          req.body.userScopeId,
          teamId,
          req.body.postDetails,
          req.body.userScopeName,
          result.mongo_id,
          req.query.postId
        );
      }
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async postVideoOnYouTube(
    res,
    accountId,
    userScopeId,
    teamId,
    postDetails,
    userScopeName,
    mongo_id,
    postId
  ) {
    try {
      const socialAccountDetails = await userTeamAccounts.getSocialAccount(
        9,
        accountId,
        userScopeId,
        teamId
      );
      const uploadedVideoCountPer24hrs =
        await youTubeModel.getUploadedVideoCountPer24hrs(
          userScopeId,
          accountId,
          teamId
        );

      if (
        uploadedVideoCountPer24hrs?.length >= 0 &&
        config.get('youTube_upload_count_per_24hrs') <=
          uploadedVideoCountPer24hrs?.length
      ) {
        const remainingTme = await youTubeModel.remainingTimeForUpload(
          uploadedVideoCountPer24hrs[uploadedVideoCountPer24hrs.length - 1]
            .updated_at
        );
        return ErrorResponse(
          res,
          `Reached maximum limit to upload video,try after ${remainingTme.hours}h:${remainingTme.minutes}m:${remainingTme.seconds}s`
        );
      }
      const response = await this.googleConnect.uploadYouTubeVideo(
        postDetails,
        socialAccountDetails.dataValues.refresh_token
      );
      if (postDetails?.thumbnailUrl) {
        await this.googleConnect.setThumbnails(
          socialAccountDetails.refresh_token,
          response?.data?.id,
          postDetails?.thumbnailUrl
        );
      }
      let PublishedUrl = response?.data?.id
        ? `https://www.youtube.com/watch?v=${response?.data?.id}`
        : '';
      let reason = '';
      youTubeModel.sendTeamNotification(
        teamId,
        {ownerName: userScopeName},
        PublishedUrl,
        'YouTube',
        reason
      );
      await youTubeModel.updateTable(
        userScopeId,
        accountId,
        teamId,
        postDetails,
        PublishedUrl
      );
      if (mongo_id && postId) await youTubeModel.removeData(mongo_id, postId);
      return SuccessResponse(
        res,
        response?.message ?? 'Video Uploaded Successfully'
      );
    } catch (e) {
      youTubeModel.sendTeamNotification(
        teamId,
        {ownerName: userScopeName},
        '',
        'YouTube',
        e.message
      );
      throw new Error(e.message);
    }
  }
}

export default new YoutubeUploadService();
