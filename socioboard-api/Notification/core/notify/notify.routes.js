/** Express router providing youTube upload related routes
 * @module Router
 * @type {import('express')}
 */
import Router from 'express';
/**
 * @typedef {import('./notify.controller.js')}
 */
import NotifyController from './notify.controller.js';
/**
 * Express router to mount calender view related on.
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

/**
 * TODO To Fetch particular User notification
 * Get the Notification for particular User
 * @name post/get-user-notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object}  Returns User Object
 */
router.post('/get-user-notification', NotifyController.getUserNotification);

/**
 * TODO To Fetch particular Team notification
 * Get the Notification for Team
 * @name post/get-team-notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object}  Returns Team Object
 */
router.post('/get-team-notification', NotifyController.getTeamNotification);

/**
 * TODO Update Notification status
 * Update Notification status
 * @name put/update-notification-status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string}  Updated Notification Message
 */
router.put(
  '/update-notification-status',
  NotifyController.updateNotificationStatus,
);

/**
 * TODO Update All Notification status for Particular User
 * Update All Notification status for Particular User
 * @name put/mark-all-user-notifications-as-read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string}  Updated  Notification Message of all notification
 */
router.put(
  '/mark-all-user-notifications-as-read',
  NotifyController.markAllUserNotificationsAsRead,
);

/**
 * TODO Update All Notification status for Particular Team
 * Update All Notification status for Particular Team
 * @name put/mark-all-team-notifications-as-read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string}  Updated  Notification Message of all notification
 */
router.put(
  '/mark-all-team-notifications-as-read',
  NotifyController.markAllTeamNotificationsAsRead
);

/**
 * TODO Remove the Notification
 * Function to Remove the Notification
 * @name delete/delete-particular-notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string} Deleted Notification status
 */
router.delete(
  '/delete-particular-notification',
  NotifyController.deleteParticularNotification,
);

/**
 * TODO Remove the All Notification for Particular User
 * Function to Remove the All Notification for Particular User
 * @name delete/clear-all-user-notifications
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string} Deleted Notification status
 */
router.delete(
  '/clear-all-user-notifications',
  NotifyController.clearAllUserNotifications,
);

/**
 * TODO Remove the All Notification for Particular team
 * Function to Remove the All Notification for Particular team
 * @name delete/clear-all-team-notifications
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {string} Deleted Notification status
 */
router.delete(
  '/clear-all-team-notifications',
  NotifyController.clearAllTeamNotifications
);

/**
 * TODO To get user have unread notification
 * Get user have unread notification
 * @name post/get-user-unread-notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object}  Returns User Object
 */
router.post('/get-user-notification-status', NotifyController.getUserUnreadNotification);


/**
 * TODO To get team unread notification status
 * Get team unread notification status
 * @name post/get-team-notification-status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object}  Returns User Object
 */
router.post('/get-team-notification-status', NotifyController.getTeamUnreadNotification);

export default router;
