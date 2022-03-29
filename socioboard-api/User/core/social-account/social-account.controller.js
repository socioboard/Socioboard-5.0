import {
  AddSocialAccRes,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';
import Validator from './social-account.validate.js';
import SocialAccountService from './social-account.service.js';

class SocialAccountController {
  /**
   * TODO To get the redirect Url and state for specified network
   * Route get the Redirect Url
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns redirect Url and state
   */
  async getProfileRedirectUrl(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
               #swagger.description = To get profile redirectUrl for specified Network */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamId'] = {
            in: 'query',
            required:true
        }
            #swagger.parameters['network'] = {
                in: 'query',
                default: 'Facebook',
            enum: ["Facebook", "FacebookPage","FacebookGroup", "Twitter", "LinkedIn", "LinkedInCompany", "Youtube", "GoogleAnalytics", "Instagram","InstagramBusiness" ,"Pinterest", "Bitly","Tumblr","TikTok"]

        } */
    return await SocialAccountService.getProfileRedirectUrl(req, res, next);
  }

  /**
   * TODO To add the specified network
   * Add the specified network
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns Added specified network details
   */
  async addSocialProfile(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = Add the social network to the System */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['state'] = {
                in: 'query',
                required:false
                }
            #swagger.parameters['code'] = {
                in: 'query'
                }
            #swagger.parameters['flag'] = {
                in: 'query',
                default:0,
                enum: ["1", "0"]
            }
            */
    return await SocialAccountService.addSocialProfile(req, res, next);
  }

  async getYoutubeChannels(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = To get Youtube Channel details */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
    /*
         #swagger.parameters['code'] = {
                in: 'query'

            }
          #swagger.parameters['state'] = {
                in: 'query',
                required:true
          }*/
    return await SocialAccountService.getYoutubeChannels(req, res, next);
  }

  async getFacebookPages(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = get the FaceBook Pages */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
   /*
          #swagger.parameters['code'] = {
                 in: 'query',
                  required:true
          }     
          #swagger.parameters['state'] = {
                in: 'query',
                required:true
          }
    */
    return await SocialAccountService.getFacebookPages(req, res, next);
  }

  async getOwnFacebookGroups(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = get the FaceBook Groups */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
    /*
          #swagger.parameters['code'] = {
                 in: 'query'

             } */
    return await SocialAccountService.getOwnFacebookGroups(req, res, next);
  }

  async getLinkedInCompanyProfileDetails(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = Add the Linked in Profile */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
   /*
          #swagger.parameters['code'] = {
                 in: 'query'

            } 
           #swagger.parameters['state'] = {
               in: 'query',
               required:true
            }
     */
    return await SocialAccountService.getLinkedInCompanyProfileDetails(
      req,
      res,
      next,
    );
  }

/**
 * TODO To add Intagram Business 
 * @name post/get-instagram-business-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns added Instagram Business Profile details
 */
  async getInstagramBusinessProfile(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = get the FaceBook Groups */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
    /*
          #swagger.parameters['code'] = {
                 in: 'query'

             }
         #swagger.parameters['state'] = {
                in: 'query',
                required:true
             }*/
    return await SocialAccountService.getInstagramBusinessProfile(req, res, next);
  }

  /**
   * TODO Invite social Account Member
   * @name post/invite-social-account-member
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} send Mail to Member
   */
  async inviteSocialAccountMember(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = Add the social network to the System */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['data'] = {
                            in: 'body',
                            description: 'User Details',
                            required: true,
                            schema: { $ref: "#/definitions/InviteSocialAccount" }
                    } */
    return await SocialAccountService.inviteSocialAccountMember(req, res, next);
  }

/**
 * TODO To add Multi Social Profile  
 * @name post/add-bulk-social-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns bulk Social Profile  details
 */
  async addBulkSocialProfiles(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
         #swagger.description = 'add Bulk social Profiles' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['data'] = {
                in: 'body',
                required: true,
                schema: { $ref: "#/definitions/addBulk" }
        } */
    /*
           #swagger.parameters['teamId'] = {
                  in: 'query'
              } 
           #swagger.parameters['state'] = {
                in: 'query',
                required:false
      }*/
    return await SocialAccountService.addBulkSocialProfiles(req, res, next);
  }

  /**
 * TODO Delete Social Profile 
 * @name delete/delete-social-profile
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns Deleted Account status 
 */
  async deleteSocialProfile(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
         #swagger.description = 'Delete Socila Profile' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */

    /* #swagger.parameters['AccId'] = {
                  in: 'query'
              }
     *#swagger.parameters['teamId'] = {
                  in: 'query'
              } */
    return await SocialAccountService.deleteSocialProfile(req, res, next);
  }

  async addMediumProfile(req, res) {
    /* #swagger.tags = ['Add-SocialAccount']
        #swagger.description = 'Add Medium Blog profile' */
    /* #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.parameters['accessToken'] = {
        in: 'query',
        description: 'Access Token',
        required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const {accessToken, teamId} = await Validator.validateAddMediumProfile(
        req.query
      );
      const {userName, userScopeId: userId} = req.body;

      const addedProfile = await SocialAccountService.addMediumProfile(
        accessToken,
        {
          userId,
          userName,
          teamId,
        }
      );

      AddSocialAccRes(
        res,
        addedProfile.teamDetails,
        addedProfile.profileDetails
      );
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /** TODO Add Tumblr Blogs
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns get Board details 
 */
   async getTumblerBlog(req, res, next) {
    /* 	#swagger.tags = ['Add-SocialAccount']
                 #swagger.description = get the FaceBook Pages */
    /* #swagger.security = [{
                    "AccessToken": []
                    }] */
    /*
          #swagger.parameters['code'] = {
                 in: 'query',
                  required:true
          }     
          #swagger.parameters['state'] = {
                in: 'query',
                required:true
          }
    */
    return await SocialAccountService.getTumblerBlog(req, res, next);
  }
}
export default new SocialAccountController();
