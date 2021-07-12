import NotifyService from './notify.service.js'
class Notifycontroller {
    async getUserNotification(req, res, next) {
        /* 	#swagger.tags = ['Notification']
        #swagger.description = ' To notify to entire team' */
        /* #swagger.security = [{
               "AccessToken": []
        }] */
        /*	#swagger.parameters['userId'] = {
                in: 'query',
                required:true
            }
            #swagger.parameters['pageId'] = {
                in: 'query',
                required:true
            }
     }*/
        return await NotifyService.getUserNotification(req, res, next)

    }

}
export default new Notifycontroller()