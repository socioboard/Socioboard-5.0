import mongoose from 'mongoose';
import moment from 'moment';
import logger from '../../../Publish/resources/Log/logger.log.js';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

/**
 * TODO To create schema for store User Notification Details
 * Schema for store User Notification Details
 * @param {String} notificationMessage - User Notification Data
 * @param {String} teamName - User Team Name
 * @param {Date} dateTime - Created date of notification
 * @param {String} notifyType - Notification Type
 * @param {String} initiatorName - InitiatorName Name who did the activity
 * @param {String} profileType - Social Profile Name
 * @param {number} status - notification status
 * @param {number} targetUserIds - Target User Id
 * @param {number} targetTeamIds - Target Team Id
 */

const notificationInfo = new Schema({
  notificationMessage: { type: String },
  teamName: { type: String },
  dateTime: { type: Date, default: Date.now, index: true },
  notifyType: { type: String },
  initiatorName: { type: String, index: true },
  profileType: { type: String },
  status: { type: String }, // notification status
  isRead: { type: Boolean, default: false },
  targetUserIds: { type: [Number], index: true },
  targetTeamIds: { type: [Number], index: true },
});

/**
 * TODO To Fetch Particular User Notification
 * Function to Fetch Particular User Notification
 * @param {Number} Id - Notification Id
 * @param {Number} teamId - Team Id
 * @param {Number} userId - User Id
 * @param {Number} skip - Skip Count
 * @param {Number} limit - Limit Count
 * @return {object} Returns Notification Details
 */
notificationInfo.methods.getNotificationsDetails = function (
  id,
  teamId,
  userId,
  skip,
  limit,
) {
  const query = {
    dateTime: {
      $gte: moment().add('-15', 'days').startOf('day'),
      $lt: moment().endOf('day'),
    },
  };

  if (id) query._id = id;
  if (userId) query.targetUserIds = userId;
  if (teamId) query.targetTeamIds = teamId;

  return this.model('Notifications')
    .find(query)
    .sort({ dateTime: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      logger.error('GetNotificationsDetails Error:', error.message);

      return error.message;
    });
};

/**
 * TODO Update Notification Status
 * Function Update Notification Status is read or not
 * @param {Number} Id - Notification Id
 * @return {object} Returns Updated Notification Data
 */
notificationInfo.methods.updateNotificationStatus = function (id) {
  return this.model('Notifications')
    .findOneAndUpdate({ _id: id }, { $set: { isRead: true } })
    .then((result) => result)
    .catch((error) => {
      logger.error('updateNotificationStatus Error:', error.message);

      return error.message;
    });
};

/**
 * TODO Delete Particular Notification
 * Function to Delete Particular  Notification
 * @param {Number} Id - Notification Id
 * @return {object} Returns Deleted Notification Data
 */
notificationInfo.methods.deleteParticularNotification = function (id) {
  return this.model('Notifications')
    .deleteOne({ _id: id })
    .then((result) => result)
    .catch((error) => {
      logger.error('DeleteParticularNotification Error:', error.message);

      return error.message;
    });
};

/**
 * TODO Delete All Notification of Particular User
 * Function to Delete Particular  Notification
 * @param {Number} userId - User Id
 * @return {object} Returns Deleted Notification Data
 */
notificationInfo.methods.clearAllUserNotifications = function (userId) {
  return this.model('Notifications')
    .deleteMany({ targetUserIds: userId })
    .then(result => result)
    .catch(error => {
      logger.error('clearAllUserNotifications Error:', error.message);
      return error.message;
    });
};

/**
 * TODO Delete All Notification of Particular Team
 * Function To Delete Particular  Notification for a team
 * @param {Number} teamId - Team Id
 * @return {object} Returns Deleted Notification Data
 */
notificationInfo.methods.clearAllTeamNotifications = function (teamId) {
  return this.model('Notifications')
    .deleteMany({ targetTeamIds: teamId })
    .then(result => result)
    .catch(error => {
      logger.error('Clear All Team Notifications Error:', error.message);
      return error.message;
    });
};

/**
 * TODO Update All Notification Status of Particular User
 * Function Update All Notification Status of Particular User
 * @param {Number} userId - User Id
 * @return {object} Returns Updated Notification Data
 */
notificationInfo.methods.markAllUserNotificationsAsRead = function (userId) {
  return this.model('Notifications')
    .updateMany({ targetUserIds: userId }, { $set: { isRead: true } })
    .then(result => result)
    .catch(error => {
      logger.error('markAllUserNotificationsAsRead Error:', error.message);
      return error.message;
    });
};

/**
 * TODO Update All Notification Status of Particular User
 * Function Update All Notification Status of Particular User
 * @param {Number} userId - User Id
 * @return {object} Returns Updated Notification Data
 */
notificationInfo.methods.markAllTeamNotificationsAsRead = function (teamId) {
  return this.model('Notifications')
    .updateMany({ targetTeamIds: teamId }, { $set: { isRead: true } })
    .then(result => result)
    .catch(error => {
      logger.error('Mark All Team Notifications As Read Error:', error.message);
      return error.message;
    });
};

/**
 * TODO To get user unread notification status
 * Function To get user unread notification status
 * @param {Array} userId - User Id
 * @return {object} Returns Notification Data Status
 */
notificationInfo.methods.getUserUnreadNotification = function (userId) {
  let query = getQueryCondition(userId, "targetUserIds")
  return this.model('Notifications')
    .aggregate(query)
    .then(result => result)
    .catch(error => {
      logger.error('getUserUnreadNotification:', error.message);
      return error.message;
    });
};

/**
 * TODO To get team unread notification status
 * Function To get team unread notification status
 * @param {Array} teamIds - Team Ids
 * @return {object} Returns Notification Data Status
 */
notificationInfo.methods.getTeamUnreadNotification = function (teamIds) {
  let query = getQueryCondition(teamIds, "targetTeamIds")
  return this.model('Notifications')
    .aggregate(query)
    .then(result => result)
    .catch(error => {
      logger.error('getTeamUnreadNotification:', error.message);
      return error.message;
    });
};

/**
 * TODO To get user or team unread notification status executable query
 * Function To get user or team unread notification status executable query
 * @param {Array} Ids - User id or team ids
 * @param {string} target - User or team
 * @return {object} Returns Notification Data Status
 */
const getQueryCondition = (Ids, target) => {
  return [{
    $match: {
      [target]: { $in: Ids },
      dateTime: {
        $gte: new Date(moment().add('-15', 'days').startOf('day')),
        $lt: new Date(moment().endOf('day'))
      }
    }
  },
  {
    $project: {
      id: "_id",
      unReadNotificationCount: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
      readNotificationCount: { $cond: [{ $ne: ['$isRead', false] }, 1, 0] },
    }
  },
  {
    "$group": {
      _id: "$isRead",
      unReadNotificationCount: { $sum: "$unReadNotificationCount" },
      readNotificationCount: { $sum: "$readNotificationCount" },
      totalNotificationCount: { $sum: 1 },
    }
  },
  {
    $project: {
      _id: 0, unReadNotificationCount: "$unReadNotificationCount",
      readNotificationCount: "$readNotificationCount",
      totalNotificationCount: "$totalNotificationCount",
      unReadNotificationStatus: { $cond: [{ $ne: ['$unReadNotificationCount', 0] }, true, false] }
    }
  }
  ]
}

let Notifications = mongoose.model('Notifications', notificationInfo);

export default Notifications;
