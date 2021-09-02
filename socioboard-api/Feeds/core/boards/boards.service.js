import Boardsvalidate from './boards.validate.js';
import BoardsModel from '../../../Common/Models/board.model.js';
import {
  ValidateErrorResponse, CatchResponse, SuccessResponse, ErrorResponse,
} from '../../../Common/Shared/response.shared.js';

const BoardsModelObj = new BoardsModel();

class BoardsService {
  async create(req, res, next) {
    try {
      const { boardName, Keyword, teamId } = req.query;
      const { value, error } = Boardsvalidate.validateCreate({ boardName, Keyword, teamId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      return BoardsModelObj.create(req.body.userScopeId, teamId, boardName, Keyword)
        .then((result) => {
          SuccessResponse(res, result);
          // res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
          ErrorResponse(res, error.message);
          // res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getAllBoards(req, res, next) {
    try {
      const { teamId } = req.query;
      const { value, error } = Boardsvalidate.validateTeam({ teamId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      return BoardsModelObj.getAllBoards(req.body.userScopeId, teamId)
        .then((result) => {
          SuccessResponse(res, result);
          // res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
          ErrorResponse(res, error.message);
          // res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async update(req, res, next) {
    try {
      const { boardId, Keyword, teamId } = req.query;
      const { value, error } = Boardsvalidate.validateUpdate({ boardId, teamId, Keyword });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      return BoardsModelObj.update(req.body.userScopeId, teamId, Keyword, boardId)
        .then((result) => {
          SuccessResponse(res, result);
          // res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
          ErrorResponse(res, error.message);
          // res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async delete(req, res, next) {
    try {
      const { boardId, teamId } = req.query;
      const { value, error } = Boardsvalidate.validateDelete({ boardId, teamId });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      return BoardsModelObj.delete(req.body.userScopeId, teamId, boardId)
        .then((result) => {
          SuccessResponse(res, result);
          // res.status(200).json({ code: 200, status: "success", message: result });
        })
        .catch((error) => {
          ErrorResponse(res, error.message);
          // res.status(200).json({ code: 400, status: "failed", error: error.message });
        });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }
}
export default new BoardsService();
