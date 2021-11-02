import InvitationService from './invitation.service.js';

class InvitationController {

  /**
 * TODO Invite Twitter Account  Member
 * @name post/invitation-add-social-profie
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} return the twitter added details
 */
   async inviteTwitterMember(req, res, next) {
   
    /*	
        #swagger.tags = ['Invitation'] 
        #swagger.parameters['code'] = {
              in: 'query',
              required: true,
              }
    
        #swagger.parameters['requestToken'] = {
          in: 'query',
          require:true
  } */
    
    return await InvitationService.inviteTwitterMember(req, res, next);
  }
  
}
export default new InvitationController();
