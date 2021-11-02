import UnauthorizedService from './unauthorized.service.js';

class UnauthorizedController {
  async checkUserNameAvailability(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Check username already there in database or not' */
    /*	#swagger.parameters['username'] = {
                            in: 'query',
                            description: 'User name.',
                            required: false,
                            }
                    } */
    return await UnauthorizedService.checkUserNameAvailability(req, res, next);
  }

  async checkEmailAvailability(req, res, next) {
    /*  #swagger.tags = ['Open']
                    #swagger.description = 'Check Email already there in database or not' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: false,
                            }
                    } */
    return await UnauthorizedService.checkEmailAvailability(req, res, next);
  }

  async register(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Endpoint to sign up a specific user' */
    /*  #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['data'] = {
                            in: 'body',
                            description: 'User Details',
                            required: true,
                            schema: { $ref: "#/definitions/UserRegister" }
                    } */

    return await UnauthorizedService.register(req, res, next);
  }

  async login(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Endpoint to sign in a specific user' */
    /*	#swagger.parameters['data'] = {
                            in: 'body',
                            description: 'User credentials.',
                            required: true,
                            schema: { $ref: "#/definitions/UserLogin" }
                    } */

    return await UnauthorizedService.login(req, res, next);
  }

  async verifyEmail(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Verify the email address' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: true,
                            }
                        #swagger.parameters['activationToken'] = {
                            in: 'query',
                            description: 'User email activationToken.',
                            required: true,
                            }
                    } */
    return await UnauthorizedService.verifyEmail(req, res, next);
  }

  async forgotPassword(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Get Mail to reset the password' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: false,
                            }
                    } */
    return await UnauthorizedService.forgotPassword(req, res, next);
  }

  async verifyPasswordToken(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Verify the email address with password token' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: true,
                            }
                    #swagger.parameters['activationToken'] = {
                            in: 'query',
                            description: 'User email activationToken.',
                            required: true,
                            }
                    } */
    return await UnauthorizedService.verifyPasswordToken(req, res, next);
  }

  async resetPassword(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Reset the password' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: true,
                            }
        #swagger.parameters['activationToken'] = {
                            in: 'query',
                            description: 'User email activationToken.',
                            required: true,
                            }
        #swagger.parameters['newPassword'] = {
                            in: 'query',
                            description: 'User newPassword',
                            required: true,
                            } */
    return await UnauthorizedService.resetPassword(req, res, next);
  }

  async directLoginMail(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Get Mail to direct Login' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: false,
                            }
                    } */
    return await UnauthorizedService.directLoginMail(req, res, next);
  }

  async verifyDirectLoginToken(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Verify the email address' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            }
                    #swagger.parameters['activationToken'] = {
                            in: 'query',
                            description: 'User email activationToken.',
                            }
                    } */
    return await UnauthorizedService.verifyDirectLoginToken(req, res, next);
  }

  async socialLogin(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Social Login for FaceBook,Google,Twitter and GitHub' */
    /*  #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['network'] = {
                           in: 'query',
                           default: 'Facebook',
                           enum:["Facebook","Google","GitHub","Twitter"]
                   } */
    return await UnauthorizedService.socialLogin(req, res, next);
  }

  async unHoldUser(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'unHold a user account */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: false,
                            }
                    } */
    return await UnauthorizedService.unHoldUser(req, res, next);
  }

  async verifyUnHoldToken(req, res, next) {
    /* #swagger.tags = ['Open']
                 #swagger.description = 'Verify the unhold token ' */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: true,
                            }
                        #swagger.parameters['activationToken'] = {
                            in: 'query',
                            description: 'User email activationToken.',
                            required: true,
                            }
                    } */
    return await UnauthorizedService.verifyUnHoldToken(req, res, next);
  }

  async getActivationLink(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Endpoint to get activation link to user email */
    /*	#swagger.parameters['email'] = {
                            in: 'query',
                            description: 'User email.',
                            required: true,
                            } */
    return await UnauthorizedService.getActivationLink(req, res, next);
  }

  async validateToken(req, res, next) {
    /* 	#swagger.tags = ['Open']
                    #swagger.description = 'Endpoint to validate the token */
    /*	#swagger.parameters['token'] = {
                            in: 'query',
                            description: 'user Token.',
                            required: true,
                            } */
    return await UnauthorizedService.verifyToken(req, res, next);
  }

  /**
   * TODO To Fetch the User Details
   * @name get/get-user-info
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Details
   */
  async getPlanDetails(req, res, next) {
    /* 	#swagger.tags = ['Open']
                        #swagger.description = 'Get the User Plan Details' */
    /*	#swagger.parameters['planId'] = {
                         in: 'query',
                        description: 'Enter Plan id',
                        required: false
                } */
    return await UnauthorizedService.getPlanDetails(req, res);
  }
}

export default new UnauthorizedController();
