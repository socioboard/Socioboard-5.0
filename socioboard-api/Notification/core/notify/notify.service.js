import config from 'config';
import NotificationModel from '../../../Common/Mongoose/models/notifications.js';
import { CatchResponse, SuccessResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js';
import validate from './notify.validate.js'
class NotifyService {
  /**
   * TODO To Get the particular User notification
   * Get the Notification for particular User
   * @name post/get-user-notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Object  */
  async getUserNotification(req, res) {
    try {
      const { userId, pageId } = req.query
      const { error } = validate.userNotification({ userId, pageId })
      if (error) return ValidateErrorResponse(res, error.details[0].message)
      let notifyModel = new NotificationModel();
      let skipCount = (req.query.pageId - 1) * config.get('perPageLimit');
      let response = await notifyModel.getNotificationsDetails(
        null,
        null,
        userId,
        skipCount,
        config.get('perPageLimit'),
      );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To Fetch particular Team notification
   * Get the Notification for Team
   * @name post/get-team-notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object}  Returns Team Object
   */
  async getTeamNotification(req, res) {
    try {
      const { teamId, pageId } = req.query
      const { error } = validate.teamNotification({ teamId, pageId })
      if (error) return ValidateErrorResponse(res, error.details[0].message)
      let notifyModel = new NotificationModel();
      let skipCount = (req.query.pageId - 1) * config.get('perPageLimit');
      let response = await notifyModel
        .getNotificationsDetails(
          null,
          req.query.teamId,
          null,
          skipCount,
          config.get('perPageLimit'),
        );

      SuccessResponse(res, response);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO Update Notification status
   * Update Notification status
   * @name post/get-team-notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated Notification Message
   */
  async updateNotificationStatus(req, res) {
    try {
      if (!req.query.mongoId) return ValidateErrorResponse(res, "Mongo id required")
      let notifyModel = new NotificationModel();
      let update = await notifyModel.updateNotificationStatus(req.query.mongoId)
      SuccessResponse(res, 'Successfully updated as Read.')
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO Update All Notification status for Particular User
   * Update All Notification status for Particular User
   * @name post/get-team-notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated  Notification Message of all notification
   */
  async markAllUserNotificationsAsRead(req, res) {
    try {
      if (!req.query.userId) return ValidateErrorResponse(res, "User id required")
      let notifyModel = new NotificationModel();
      let markAll = await notifyModel.markAllUserNotificationsAsRead(req.query.userId)
      SuccessResponse(res, 'Successfully marked all User Notifications as Read.')
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO Update All Notification status for Particular Team
   * Update All Notification status for Particular Team
   * @name post/get-team-notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated Notification Message of all notification
   */
  async markAllTeamNotificationsAsRead(req, res) {
    try {
      if (!req.query.teamId) return ValidateErrorResponse(res, "Team id required")
      let notifyModel = new NotificationModel();
      let markAll = await notifyModel.markAllTeamNotificationsAsRead(req.query.teamId)
      SuccessResponse(res, 'Successfully marked all Team Notifications as Read.')
    } catch (error) {
      CatchResponse(res, error.message)
    }
  }

  /**
   * TODO Remove the Notification
   * Function to Remove the Notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {string} Deleted Notification status
   */
  async deleteParticularNotification(req, res) {
    try {
      if (!req.query.mongoId) return ValidateErrorResponse(res, "Mongo id required")
      let notifyModel = new NotificationModel();
      let deleteNotification = await notifyModel.deleteParticularNotification(req.query.mongoId)
      SuccessResponse(res, 'Deleted successfully.')
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO Remove the All Notification for Particular User
   * Function to Remove the All Notification for Particular User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string} Deleted Notification status
   */
  async clearAllUserNotifications(req, res) {
    try {
      if (!req.query.userId) return ValidateErrorResponse(res, "User id required")
      let notifyModel = new NotificationModel();
      let clear = await notifyModel.clearAllUserNotifications(req.query.userId)
      SuccessResponse(res, 'Successfully deleted all User Notifications.')
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO Remove the All Notification for Particular team
   * Function to Remove the All Notification for Particular team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string} Deleted Notification status
   */
  async clearAllTeamNotifications(req, res) {
    try {
      if (!req.query.teamId) return ValidateErrorResponse(res, "Team id required")
      let notifyModel = new NotificationModel();
      let clear = await notifyModel.clearAllTeamNotifications(req.query.teamId)
      SuccessResponse(res, 'Successfully deleted all Team Notifications.')
    } catch (error) {
      CatchResponse(res, error.message)
    }
  }

  /**
   * TODO To get user unread notification status
   * Function To get user unread notification status 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Notification status
   */
  async getUserUnreadNotification(req, res) {
    try {
      if (req.body.userIds?.length == 0) return ValidateErrorResponse(res, "User id required")
      let notifyModel = new NotificationModel();
      let status = await notifyModel.getUserUnreadNotification(req.body.userIds)
      SuccessResponse(res, status)
    } catch (error) {
      CatchResponse(res, error.message)
    }
  }

  /**
   * TODO To get team unread notification status
   * Function to get team unread notification status
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Notification status
   */
  async getTeamUnreadNotification(req, res) {
    try {
      if (req.body.teamIds?.length == 0) return ValidateErrorResponse(res, "User id required")
      let notifyModel = new NotificationModel();
      let status = await notifyModel.getTeamUnreadNotification(req.body.teamIds)
      SuccessResponse(res, status)
    } catch (error) {
      CatchResponse(res, error.message)
    }
  }

}
export default new NotifyService();
