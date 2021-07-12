import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import UploadModel from '../../../Common/Models/upload.model.js'
const uploadModel = new UploadModel()
import validate from './upload.validate.js'

class UploadController {

    constructor() {
    }

    async uploadMedia(req, res, next) {
        try {
            let response = await uploadModel.uploadMedia(req.query.userScopeId, req.query.teamId, req.query.privacy, req.files, req.query.title, req.query.language);
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getUserMediaDetails(req, res) {
        try {
            const { teamId, privacy, pageId } = req.query
            const { value, error } = validate.getMediaDetails({ teamId, privacy, pageId });
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            const response = await uploadModel.getUserMediaDetails(req.query.userScopeId, teamId, privacy, pageId);
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getSocialGallery(req, res) {
        try {
            const response = await uploadModel.getSocialGallery(req.query.userScopeId, req.query.pageId);
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async deleteUserMedia(req, res) {
        try {
            const response = await uploadModel.deleteUserMedia(req.query.isForceDelete, req.body.userScopeId, req.query.mediaId)
            SuccessResponse(res, null, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async uploadSSTemplate(req, res) {

        try {
            const response = await uploadModel.uploadSSTemplate(req.query.userScopeId, req.query.title, req.body.mediaDetails)
            SuccessResponse(res, null, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getSSTemplates(req, res) {

        try {
            const response = await uploadModel.getSSTemplates(req.body.userScopeId)
            SuccessResponse(res, null, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async deleteSSTemplates(req, res) {

        try {
            const response = await uploadModel.deleteSSTemplates(req.body.userScopeId)
            SuccessResponse(res, null, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async deleteParticularTemplate(req, res) {

        try {
            const response = await uploadModel.deleteParticularTemplate(req.body.userScopeId, req.query.templateId)
            SuccessResponse(res, null, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }


}

export default new UploadController()