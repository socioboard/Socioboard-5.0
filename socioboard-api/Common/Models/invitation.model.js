import config from 'config';
import moment from 'moment';
import db from '../Sequelize-cli/models/index.js';
import TwtConnect from '../Cluster/twitter.cluster.js'
import TeamLibs from '../Models/team.model.js'
import TwitterInsightPostModel from '../Mongoose/models/twitter-insights.js';
import UserTeamAccount from '../Shared/user-team-accounts.shared.js';


const invitation=db.Invitations;
const teamLibs = new TeamLibs();

class InvitationModel{
    constructor() {
        this.twtConnect = new TwtConnect(config.get('twitter_api'));

    }
 
 /**
   * TODO To add the twitter socialdata to Invitaion Table
   * Function To add the twitter socialdata to Invitaion Table
   * @param {object} result - twitter meta data 
   * @param {number} teamId - Team Id
   * @param {string} userName - Username
   * @param {string} accName -  Account Name 
   * @param {number} userId - User Id
   * @returns {object} returns the stores data status
   */   
 async addsocialdata(result,teamId,userName,accName,userId){
        invitation.create({
          userName: userName,
          account_name: accName,
          userId: userId,
          teamId: teamId,
          refreshToken: result.message.requestToken,
          requestSecret: result.message.requestSecret,
          redirectUrl:result.redirectUrl,
          createdAt: moment.utc().format(),
          updatedAt: moment.utc().format()
     });
    }

  /**
   * TODO To get the Twitter Invitation details
   * Function To get the Twitter Invitation details
   * @param {number} reqToken - twitter Req Token 
   * @returns {object} returns twitter metadata Details
   */      
  async getinvitedeatils(reqToken){
        return new Promise((resolve, reject) => {
            return invitation.findOne({
                where: {
                    refreshToken: reqToken
                }
            })
                .then(result => resolve(result))
                .catch(error => reject(error));
            })
    }
 
    /**
   * TODO To delete the Twitter metadata details
   * Function To delete the Twitter meta details
   * @param {number} reqToken - twitter Req Token 
   * @returns {object} returns deleted twitter metadata status
   */  
  async deletesocialaccount(reqtoken){
        return new Promise((resolve, reject) => {
            return invitation.destroy({
                where: {
                    refreshToken: reqtoken
                 }
               })
                .then(result => resolve(result))
                .catch(error =>reject(error));
                        
            })
      }

  
  /**
   * TODO To add the twitter Social profile  
   * Function To add the twitter Social profile 
   * @param {object} twitterdata - twitter metadata 
   * @param {string} code - twitter code 
   * @param {string} network - network name 
   * @returns {object} returns added twitter account details
   */  
  async addSocialProfile(twitterdata,code,network) {
        const {refreshToken, requestSecret, teamId,account_name,userId} = twitterdata
        return new Promise((resolve, reject) => {
            switch (network) {
                case "Twitter":
                    let result = {};
                    let updatedProfileDetails = {};
                    return this.twtConnect.addTwitterProfilebyInvite(4, teamId, refreshToken, requestSecret, code)
                        .then((profile) => {
                            return teamLibs.addProfilesByInvitation(userId,profile,account_name); 
                        })
                        .then((response) => {
                            result = response;
                            return this.twtConnect.getLookupList(result.profileDetails.access_token, result.profileDetails.refresh_token, result.profileDetails.user_name);
                        })
                        .then((updateDetails) => {
                            updatedProfileDetails = updateDetails;
                            let data = {
                                accountId: result.profileDetails.account_id,
                                insights: {
                                    followerCount: updateDetails?.follower_count,
                                    followingCount: updateDetails?.following_count,
                                    favouritesCount: updateDetails?.favorite_count,
                                    postsCount: updateDetails?.total_post_count,
                                    userMentions: updateDetails?.user_mentions ?? 0,
                                    retweetCount: updateDetails?.retweet_count ?? 0
                                }
                            };
                            let twitterInsightPostModelObject = new TwitterInsightPostModel();
                            return twitterInsightPostModelObject.insertInsights(data);
                        })
                        .then(() => {
                            return UserTeamAccount.createOrUpdateFriendsList(result.profileDetails.account_id, updatedProfileDetails);
                        })
                        .then(() => {
                            resolve({ code: 200, status: 'success', teamDetails: result.teamDetails, profileDetails: result.profileDetails });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                
                    break;
                default:
                    reject(new Error('Specified network is invalid.'));
                    break;
            }
        })
  }


}
export default InvitationModel;