import AuthorizedService from './authorized.service.js';

class AuthorizedController {
  async changePassword(req, res, next) {
    /* 	#swagger.tags = ['User']
            #swagger.description = 'Change the password' */
    /*	#swagger.parameters['data'] = {
                in: 'body',
                description: 'Change password.',
                required: true,
                schema: { $ref: "#/definitions/changePassword" }
        } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */

    return await AuthorizedService.changePassword(req, res, next);
  }

  async deleteUser(req, res, next) {
    /* 	#swagger.tags = ['User']
                 #swagger.description = 'Delete a user account'
                 #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */

    return await AuthorizedService.deleteUser(req, res, next);
  }

  async holdUser(req, res, next) {
    /* 	#swagger.tags = ['User']
            #swagger.description = 'Hold the account'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    return await AuthorizedService.holdUser(req, res, next);
  }

  /**
   * TODO To Fetch the User Details
   * Function Fetch the User Details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns User Details
   */
  async getUserInfo(req, res, next) {
    /* 	#swagger.tags = ['User']
                #swagger.description = 'get updated access token'
                #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await AuthorizedService.getUserInfo(req, res, next);
  }

  /**
   * TODO To Update the User Details
   * Route Update update-profile-details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns updated  User Details
   */
  async updateProfileDetails(req, res, next) {
    /* 	   #swagger.tags = ['User']
               #swagger.description = 'Update the Profile Details'
               #swagger.auto = false */
    /*     #swagger.security = [{
               "AccessToken": []
        }] */
    /*	    #swagger.parameters['data'] = {
                in: 'body',
                required: true,
                schema: { $ref: "#/definitions/userUpdate" }
        } */
    return await AuthorizedService.updateProfileDetails(req, res, next);
  }

  async changePlan(req, res, next) {
    /* 	   #swagger.tags = ['User']
               #swagger.description = 'change the Plan'
               #swagger.auto = false */
    /*     #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['currentPlan'] = {
           in: 'query',
           description: 'CurrentPlan',
           required: false,
           }
            #swagger.parameters['newPlan'] = {
           in: 'query',
           description: 'NewPlan',
           required: false,
           }

           */
    return await AuthorizedService.changePlan(req, res, next);
  }
}
export default new AuthorizedController();
