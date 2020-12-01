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
        var notifyModel = new NotificationModel();
        notifyModel.updateNotificationStatus(req.query.mongoId)
            .then(() => {
                res.status(200).json({ code: 200, status: 'success', message: "Successfully updated as Read." });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }

    markAllUserNotificationsAsRead(req, res) {
        var notifyModel = new NotificationModel();
        notifyModel.markAllUserNotificationsAsRead(req.query.userId)
            .then(() => {
                res.status(200).json({ code: 200, status: 'success', message: "Successfully marked all User Notifications as Read." });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }

    deleteParticularNotification(req, res) {
        var notifyModel = new NotificationModel();
        notifyModel.deleteParticularNotification(req.query.mongoId)
            .then(() => {
                res.status(200).json({ code: 200, status: 'success', message: "Deleted successfully." });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }

    clearAllUserNotifications(req, res) {
        var notifyModel = new NotificationModel();
        notifyModel.clearAllUserNotifications(req.query.userId)
            .then(() => {
                res.status(200).json({ code: 200, status: 'success', message: "Successfully deleted all User Notifications." });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: 'success', error: error.message });
            });
    }
}

module.exports = new NotifyController();