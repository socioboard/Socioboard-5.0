import { ValidateErrorResponse, CatchResponse, ErrorResponse, SuccessResponse, SuccessNavigationResponse, AddSocialAccRes } from '../../../Common/Shared/response.shared.js'
import RecentVisitedModel from '../../../Common/Mongoose/models/recentvisited.js'
const recentVisitedModel = new RecentVisitedModel()
class RecentVistedService {
    constructor() {
    }

    async getRecentVisited(req, res, next) {
        try {
            let response = await recentVisitedModel.getPreviousPost(req.body.userScopeId, req.query.skip, req.query.limit)
            SuccessResponse(res, response)
        } catch (error) {
            return CatchResponse(res, error.message);
        }
    }

    async deleteRecentVisited(req, res, next) {
        try {
            let response = await recentVisitedModel.deleteRecentVisited(req.body.userScopeId, req.query.id)
            SuccessResponse(res, response)
        } catch (error) {
            return CatchResponse(res, error.message);
        }
    }

    async clearRecentVisited(req, res, next) {
        try {
            let response = await recentVisitedModel.clearRecentVisited(req.body.userScopeId)
            SuccessResponse(res, response?.deletedCount)
        } catch (error) {
            return CatchResponse(res, error.message);
        }
    }
}
export default new RecentVistedService()