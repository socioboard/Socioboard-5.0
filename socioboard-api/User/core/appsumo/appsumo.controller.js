import AppSumoService from './appsumo.service.js';
class AppSumoController {
  async getAccessToken(req, res, next) {
    /* 	#swagger.tags = ['AppSumo']
                    #swagger.description = 'Endpoint to sign in a specific user' */
    /*	#swagger.parameters['username'] = {
                            in: 'query',
                            description: 'User name.',
                            }
                    #swagger.parameters['password'] = {
                            in: 'query',
                            description: 'password',
                            } */

    AppSumoService.getAccessToken(req, res);
  }
  async notification(req, res, next) {
    /* 	#swagger.tags = ['AppSumo']
                    #swagger.description = 'Endpoint to get App Sumo Notification ' */
    /*  #swagger.parameters['action'] = {
                            in: 'query',
                            description: 'action.',
                            }
        #swagger.parameters['plan_id'] = {
                            in: 'query',
                            description: 'plan_id',
                            } 
        #swagger.parameters['uuid'] = {
                            in: 'query',
                            description: 'uuid.',
                            }
        #swagger.parameters['activation_email'] = {
                            in: 'query',
                            description: 'activation email',
                            }
        #swagger.parameters['invoice_item_uuid'] = {
                            in: 'query',
                            description: 'invoice item uuid',
                            }  */
    /* #swagger.security = [{
         "Bearer": [] 
        }] */

    AppSumoService.notification(req, res);
  }
}
export default new AppSumoController();
