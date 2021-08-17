import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import ScheduleModel from '../../../Common/Models/schedule.model.js'
const scheduleModel = new ScheduleModel()

class ScheduleService {

    constructor() {
    }

    async create(req, res, next) {
        try {
            const response = await scheduleModel.create(req.body.userScopeId, req.body.userScopeName, req.body.postInfo, req.body.userScopeMaxScheduleCount)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getScheduleDetails(req, res, next) {
        try {
            const response = await scheduleModel.getScheduleDetails(req.body.userScopeId, req.query.fetchPageId)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getSchedulePostById(req, res, next) {
        try {
            let response = await scheduleModel.getSchedulePostById(req.body.userScopeId, req.query.id)
            let result = await scheduleModel.getScheduleId(req.body.userScopeId, req.query.id, response)
            SuccessResponse(res, result)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getFilteredScheduleDetails(req, res, next) {
        try {
            const response = await scheduleModel.getFilteredScheduleDetails(req.body.userScopeId, req.query.scheduleStatus, req.query.fetchPageId)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async getScheduleDetailsByCategories(req, res, next) {
        try {
            const response = await scheduleModel.getScheduleDetailsByCategories(req.body.userScopeId, req.query.scheduleStatus, req.query.scheduleCategory, req.query.fetchPageId)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async changeScheduleStatus(req, res, next) {
        try {
            const response = await scheduleModel.changeScheduleStatus(req.body.userScopeId, req.body.userScopeName, req.query.scheduleId, req.query.scheduleStatus, req.query.userScopeMaxScheduleCount)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async cancel(req, res, next) {
        try {
            const response = await scheduleModel.cancelScheduleDetails(req.body.userScopeId, req.query.scheduleId)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async delete(req, res, next) {
        try {
            const response = await scheduleModel.delete(req.body.userScopeId, req.query.scheduleId)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async edit(req, res, next) {
        try {
            const response = await scheduleModel.edit(req.body.userScopeId, req.body.userScopeName, req.query.teamId, req.query.scheduleId, req.body.postInfo)
            SuccessResponse(res, response)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

    async editDraftSchedule(req, res, next) {
        try {
            let id = await scheduleModel.editDraftSchedule(req.body.userScopeId, req.body.userScopeName, req.query.teamId, req.query.scheduleId, req.body.postInfo)
            let response = await scheduleModel.getSchedulePostById(req.body.userScopeId, id)
            let result = await scheduleModel.getScheduleId(req.body.userScopeId, id, response)
            SuccessResponse(res, result)
        } catch (error) {
            CatchResponse(res, error.message)
        }
    }

}

export default new ScheduleService()