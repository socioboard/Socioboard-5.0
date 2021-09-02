import SocialCallbackService from './social-callback.service.js';

class SocialCallbackController {
  async facebookCallback(req, res, next) {
    /* 	#swagger.tags = ['Social-Callback']
        #swagger.description = 'Facebook code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
          in: 'query',
          require:true
  } */
    return await SocialCallbackService.facebookCallback(req, res, next);
  }

  async googleCallback(req, res, next) {
    /* 	#swagger.tags = ['Social-Callback']
        #swagger.description = 'Google code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
          in: 'query',
          require:true
  } */
    return await SocialCallbackService.googleCallback(req, res, next);
  }

  async githubCallback(req, res, next) {
    /* 	#swagger.tags = ['Social-Callback']
        #swagger.description = 'Github code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
          in: 'query',
          require:true
  } */
    return await SocialCallbackService.githubCallback(req, res, next);
  }

  async twitterCallback(req, res, next) {
    /* 	#swagger.tags = ['Social-Callback']
          #swagger.description = 'Twitter code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['requestToken'] = {
          in: 'query',
          require:true
  } */
    /*	#swagger.parameters['requestSecret'] = {
              in: 'query',
              required: true,
              }
          #swagger.parameters['verifier'] = {
              in: 'query',
              required: true,
              }
      } */

    return await SocialCallbackService.twitterCallback(req, res, next);
  }
}
export default new SocialCallbackController();
