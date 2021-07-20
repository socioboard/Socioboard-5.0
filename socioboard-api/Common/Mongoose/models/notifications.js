import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;
import logger from '../../../Publish/resources/Log/logger.log.js';

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
})

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
  limit
) {
  let query = {
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
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
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
    .then(result => result)
    .catch(error => {
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
    .then(result => result)
    .catch(error => {
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
notificationInfo.methods.clearAllUserNotifications = userId => {
  return this.model('Notifications')
    .deleteMany({ targetUserIds: userId })
    .then(result => result)
    .catch(error => {
      logger.error('clearAllUserNotifications Error:', error.message);
      return error.message;
    });
};

/**
 * TODO Update All Notification Status of Particular User
 * Function Update All Notification Status of Particular User
 * @param {Number} userId - User Id
 * @return {object} Returns Updated Notification Data
 */
notificationInfo.methods.markAllUserNotificationsAsRead = userId => {
  return this.model('Notifications')
    .updateMany({ targetUserIds: userId }, { $set: { isRead: true } })
    .then(result => result)
    .catch(error => {
      logger.error('markAllUserNotificationsAsRead Error:', error.message);
      return error.message;
    });
};

let Notifications = mongoose.model('Notifications', notificationInfo);

export default Notifications;
