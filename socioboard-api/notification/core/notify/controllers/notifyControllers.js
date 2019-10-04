const NotificationModel = require('../../../../library/mongoose/models/notifications');
const config = require('config');

class NotifyController {
    getUsersNotifications(req, res) {
        var notifyModel = new NotificationModel();
        var skipCount = (req.query.pageId - 1) * config.get('perPageLimit');
        notifyModel.getNotificationsDetails(null, null, req.query.userId, skipCount, config.get('perPageLimit'))
            .then((response) => {
                res.status(200).json({ code: 200, status: 'success', notifications: response });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }

    getTeamsNotifications(req, res) {
        var notifyModel = new NotificationModel();
        var skipCount = (req.query.pageId - 1) * config.get('perPageLimit');
        notifyModel.getNotificationsDetails(null, req.query.teamId, null, skipCount, config.get('perPageLimit'))
            .then((response) => {
                res.status(200).json({ code: 200, status: 'success', notifications: response });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }
    
    updateNotificationStatus(req, res) {
        notifyModel.updateNotificationStatus(req.query.mongoId, rea.query.status)
            .then((response) => {
                res.status(200).json({ code: 200, status: 'success', notifications: response });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }
}

module.exports = new NotifyController();