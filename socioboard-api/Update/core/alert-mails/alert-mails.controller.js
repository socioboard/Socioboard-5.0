import AlertMailService from './alert-mails.service.js';

class AlertMailController {
  async sendExpireAlert(req, res, next) {
    /* 	#swagger.tags = ['Alert Mail']
            #swagger.description = 'To send alert mail to all user who's plan get expire within a week' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await AlertMailService.sendExpireAlert(req, res, next);
  }

  async sendExpiredIntimation(req, res, next) {
    /* 	#swagger.tags = ['Alert Mail']
            #swagger.description = 'To send alert mail to all user who's plan get expire within a week' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await AlertMailService.sendExpiredIntimation(req, res, next);
  }

  async sendExpiredMail(req, res, next) {
    /* 	#swagger.tags = ['Alert Mail']
            #swagger.description = 'To send alert mail to all user who's plan get expire within a week' */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['days'] = {
                            in: 'query',
                            description: 'User get mail after how many days.',
                            required: true,
                            }
                    } */
    return await AlertMailService.sendExpiredMail(req, res, next);
  }
}
export default new AlertMailController();
