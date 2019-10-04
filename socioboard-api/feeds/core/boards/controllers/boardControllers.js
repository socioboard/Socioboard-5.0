const boardLibs = require('../utils/boardLibs');
const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

class BoardController {

    create(req, res) {
        return boardLibs.create(req.body.userScopeId, req.query.teamId, req.query.boardName, req.query.keyword)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.create_board.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.create_board_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{keyword}}', req.query.keyword).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getAllBoards(req, res) {
        return boardLibs.getAllBoards(req.body.userScopeId, req.query.teamId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.fetch_board.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: result });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.fetch_board_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    update(req, res) {
        return boardLibs.update(req.body.userScopeId, req.query.teamId, req.query.keyword, req.query.boardId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.edit_board.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{boardId}}', req.query.boardId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: "Updated successfully!" });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.edit_board_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{boardId}}', req.query.boardId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    delete(req, res) {
        return boardLibs.delete(req.body.userScopeId, req.query.teamId, req.query.boardId)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.delete_board.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{boardId}}', req.query.boardId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: "Board has been deleted successfully" });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.feeds_service_events.event_action.Boards,
                    label: configruation.feeds_service_events.board_event_lable.delete_board_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{boardId}}', req.query.boardId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}


module.exports = new BoardController();