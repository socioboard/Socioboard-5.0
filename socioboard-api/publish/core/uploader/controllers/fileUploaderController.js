const UploadLibs = require('../utils/uploadlibs');


const config = require('config');
const configruation = require('../../../config/configuration');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));

class FileUploadController {

    uploadResponses(req, res, next) {
        res.status(200).send(req.files);
    }

    uploadMedia(req, res) {
        var uploadlibs = new UploadLibs();
        return uploadlibs.uploadMedia(req.query.userScopeId, req.query.teamId, req.query.privacy, req.files, req.query.title)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.query.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_upload_success.replace('{{user}}', req.query.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{privacy}}', req.query.privacy == 1 ? "private" : "public").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", mediaDetails: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.query.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_upload_failed.replace('{{user}}', req.query.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{privacy}}', req.query.privacy == 1 ? "private" : "public").replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getUserMediaDetails(req, res) {
        var uploadlibs = new UploadLibs();
        return uploadlibs.getUserMediaDetails(req.body.userScopeId, req.query.teamId, req.query.privacy, req.query.pageId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_fetch_success.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", totalSpace: response.totalSize, usedSpace: response.usedSize, data: response.data });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_fetch_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    deleteUserMedia(req, res) {
        var uploadlibs = new UploadLibs();
        return uploadlibs.deleteUserMedia(req.query.isForceDelete, req.body.userScopeId, req.query.mediaId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_delete_success.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: "success", message: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.publiser_service_events.event_action.Media,
                    label: configruation.publiser_service_events.media_event_label.media_delete_failed.replace('{{user}}', req.body.userScopeName).replace('{{teamId}}', req.query.teamId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}

module.exports = new FileUploadController();

