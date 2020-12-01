const mongoose = require('mongoose');
const moment = require('moment');
var Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on notifications collection of mongo DB
var notificationInfo = new Schema({
    notificationMessage: { type: String }, // message of the notifications
    teamName: { type: String }, // team Name
    dateTime: { type: Date, default: Date.now, index: true }, // processed time
    notifyType: { type: String }, // type of the notifications
    initiatorName: { type: String, index: true }, // who did the activity
    profileType: { type: String }, // Social Profile Name
    status: { type: String }, // notification status
    isRead: { type: Boolean, default: false },
    targetUserIds: { type: [Number], index: true },
    targetTeamIds: { type: [Number], index: true }
});

notificationInfo.methods.getNotificationsDetails = function (id, teamId, userId, skip, limit) {

    // Fetching the notification details with filters
    var query = {
        dateTime: {
            $gte: moment().add('-15', 'days').startOf('day'),
            $lt: moment().endOf('day')
        }
    };
    // If specified id is there, then with id
    if (id)
        query._id = id;
    // If a specified user is mentioned, then with user
    if (userId)
        query.targetUserIds = userId;
    if (teamId)
        query.targetTeamIds = teamId;

    return this.model('Notifications')
        .find(query)
        .sort({ dateTime: -1 })
        .skip(skip)
        .limit(limit)
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

notificationInfo.methods.updateNotificationStatus = function (id) {
    // Updating a particular notification status
    return this.model('Notifications')
        .findOneAndUpdate({ _id: id }, { $set: { isRead: true } })
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
}

notificationInfo.methods.deleteParticularNotification = function (id) {
    // Delete a particular Notification
    return this.model('Notifications')
        .deleteOne({ _id: id })
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
}

notificationInfo.methods.clearAllUserNotifications = function (userId) {
    // Clear All user notifications
    return this.model('Notifications')
        .deleteMany({ targetUserIds: userId })
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
}

notificationInfo.methods.markAllUserNotificationsAsRead = function (userId) {
    // Mark All user notifications as Read
    return this.model('Notifications')
        .updateMany({ targetUserIds: userId }, { $set: { isRead: true } })
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
}

var Notifications = mongoose.model('Notifications', notificationInfo);

module.exports = Notifications;