import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import PublishModel from '../../../Common/Models/publish.model.js';

const publishModel = new PublishModel();

class PublishController {
  constructor() {}

  async publishPost(req, res, next) {
    try {
      const response = await publishModel.publishPost(
        req.body,
        req.query.teamId,
        req.query.language
      );

      SuccessResponse(res, response?.data, response?.message, response?.code);
    } catch (error) {
      CatchResponse(res, error);
    }
  }

  async getDraftedPosts(req, res, next) {
    try {
      const response = await publishModel.getDraftedPosts(
        req.query.userScopeId,
        req.query.teamId,
        req.query.pageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getDraftPostById(req, res, next) {
    try {
      const response = await publishModel.getDraftPostById(req.query.id);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async updateDraftPostById(req, res, next) {
    try {
      const response = await publishModel.updateDraftPostById(
        req.query.id,
        req.body.draftPost
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async deleteDraftPostById(req, res, next) {
    try {
      const response = await publishModel.deleteDraftPostById(req.body.id);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async deleteApprovalPostById(req, res, next) {
    try {
      const response = await publishModel.deleteApprovalPostById(req.body.id);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getApprovalPostById(req, res, next) {
    try {
      const response = await publishModel.getApprovalPostById(req.query.id);

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getApprovalPostStatus(req, res, next) {
    try {
      const response = await publishModel.getApprovalPostStatus(
        req.query.userScopeId,
        req.query.teamId,
        req.query.pageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getPublishedPosts(req, res, next) {
    try {
      const response = await publishModel.getPublishedPosts(
        req.query.userScopeId,
        req.query.teamId,
        req.query.pageId
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async filterPublishedPosts(req, res, next) {
    try {
      const response = await publishModel.filterPublishedPosts(
        req.query.userScopeId,
        req.query.teamId,
        req.query.pageId,
        req.body.searchPublishedPostInfo,
        req.query.publishedStatus,
        req.query.filterPeriod,
        req.query.since,
        req.query.until
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }
}

export default new PublishController();
