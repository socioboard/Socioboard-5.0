import NotifyService from './notify.service.js';

class Notifycontroller {
  /**
   * TODO To Get the particular User notification
   * Get the Notification for particular User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Object  */
  async getUserNotification(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To get user notification of a team' */
    /*	#swagger.parameters['userId'] = {
                in: 'query',
                required:true
            }
            #swagger.parameters['pageId'] = {
                in: 'query',
                required:true
            }
     */
    return await NotifyService.getUserNotification(req, res);
  }

  /**
   * TODO To Fetch particular Team notification
   * Function to Fetch Notification for Team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object}  Returns Team Object
   */
  async getTeamNotification(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To get  notification for entire team' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                required:true
            }
            #swagger.parameters['pageId'] = {
                in: 'query',
                required:true
            }
     */
    return await NotifyService.getTeamNotification(req, res);
  }

  /**
   * TODO Update Notification status
   * Update Notification status
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated Notification Message
   */
  async updateNotificationStatus(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To update notification status' */
    /*	#swagger.parameters['mongoId'] = {
                in: 'query',
                required:true

            } */
    return await NotifyService.updateNotificationStatus(req, res);
  }

  /**
   * TODO Update All Notification status for Particular User
   * Update All Notification status for Particular User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated  Notification Message of all notification
   */
  async markAllUserNotificationsAsRead(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To mark All User Notifications as Read' */
    /*	#swagger.parameters['userId'] = {
                in: 'query',
                required:true
            }
      */
    return await NotifyService.markAllUserNotificationsAsRead(req, res);
  }

  /**
   * TODO Update All Notification status for Particular Team
   * Update All Notification status for Particular Team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string}  Updated Notification Message of all notification
   */
  async markAllTeamNotificationsAsRead(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To mark All Team Notifications as Read' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                required:true
            }
      */
    return await NotifyService.markAllTeamNotificationsAsRead(req, res);
  }

  /**
   * TODO Remove the Notification
   * Function to Remove the Notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string} Deleted Notification status
   */
  async deleteParticularNotification(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To delete Particular Notification' */
    /*	#swagger.parameters['mongoId'] = {
                in: 'query',
                required:true

            } */
    return await NotifyService.deleteParticularNotification(req, res);
  }

  /**
   * TODO Remove the All Notification for Particular User
   * Function to Remove the All Notification for Particular User
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string} Deleted Notification status
   */
  async clearAllUserNotifications(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To delete all Notification' */
    /*	#swagger.parameters['userId'] = {
                in: 'query',
                required:true
            }
      */
    return await NotifyService.clearAllUserNotifications(req, res);
  }

  /**
   * TODO Remove the All Notification for Particular team
   * Function to Remove the All Notification for Particular team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {string} Deleted Notification status
   */
  async clearAllTeamNotifications(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To delete all Notification' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                required:true
            }
      */
    return await NotifyService.clearAllTeamNotifications(req, res);
  }

  /**
   * TODO To get user have unread notification
   * Function To get user have unread notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {boolean} True if user have unread notification else false
   */
  async getUserUnreadNotification(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To Get Notification status' */
    /*	#swagger.parameters['userIds'] = {
               in: 'body',
               description: 'User ids',
               required: true,
               schema: { $ref: "#/definitions/userIds" }
       } */
    return await NotifyService.getUserUnreadNotification(req, res);
  }
  /**
   * TODO To get user have unread notification
   * Function To get user have unread notification
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {boolean} True if user have unread notification else false
   */
  async getTeamUnreadNotification(req, res) {
    /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To Get Notification status' */
    /*	#swagger.parameters['teamIds'] = {
               in: 'body',
               description: 'User ids',
               required: true,
               schema: { $ref: "#/definitions/teamIds" }
       } */
    return await NotifyService.getTeamUnreadNotification(req, res);
  }

}
export default new Notifycontroller();
