import config from 'config';
import UserTeamAccount from '../../../Common/Shared/user-team-accounts.shared.js';
import TwtConnect from '../../../Common/Cluster/twitter.cluster.js';
import InviteModel from '../../../Common/Models/invitation.model.js';
import Validator from './invitation.validate.js';
import {ValidateErrorResponse,ErrorResponse,SuccessResponse} from '../../../Common/Shared/response.shared.js';
import logger from '../../resources/Log/logger.log.js';

const invitemodel = new InviteModel();

class InvitationService {
  constructor() {
    Object.assign(this, UserTeamAccount);
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
}
 
  /**
   * TODO Invite Twitter Account  Member
   * Route Invite Twitter Account Member
   * @name post/invitation-add-social-profie
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} return the twitter added details
  */  
  async inviteTwitterMember(req, res, next) {
    const{code,requestToken}=req.query;
    const {value, error} = Validator.validateTwitterData({code,requestToken});
    if (error) return ValidateErrorResponse(res, error.details[0].message);
    return invitemodel.getinvitedeatils(req.query.requestToken)
    .then((db) => {
        let twitterdetail = db.dataValues;
        return invitemodel.addSocialProfile(twitterdetail, req.query.code, "Twitter")
            .then((result) => {
                if (result.status == "success") {
                    return invitemodel.deletesocialaccount(req.query.requestToken)
                        .then((data) => {
                            logger.info(`destroy status of  the Invitation metadata ${data}`)
                            SuccessResponse(res,result)
                        })
                        .catch((error) => {
                            logger.error(`Error in deleting the Invitation metadata ${error.message}`)
                            ErrorResponse(res,error.message)
                        })
                }
            })
            .catch((error) => {
                logger.error(`Error while adding the Twitter Invitation data ${error.message}`)
                ErrorResponse(res,error.message)
              })
    })
    .catch((error) => {
        logger.error(`Error while fetching the Invitation Metadata ${error.message}`)
        ErrorResponse(res,"Invitation Link Expired,Try Again!")
      })
}

}
export default new InvitationService();
