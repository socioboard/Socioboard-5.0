import db from '../Sequelize-cli/models/index.js';
import moment from 'moment';
import AuthorizeServices from '../Services/authorize.services.js';
import config from 'config';

const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const userRewardsModel = db.user_rewards;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;

class AuthorizeLibs {
  constructor() {
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
  }

  async changePassword(userID, newPassword) {
    return await userDetails.update(
      {password: newPassword},
      {where: {user_id: userID}}
    );
  }
  async getUserDetails(userId) {
    let res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: ['user_id', 'email', 'password'],
    });
    return res;
  }

  async holdUser(userId) {
    let res = await userDetails.update(
      {is_account_locked: 1},
      {where: {user_id: userId}}
    );
    return res;
  }

  /**
   * TODO To Fetch the User  details for the specified User in mysql table
   * Function to Fetch the User  details for the specified User by User Id
   * @param  {number} userId - User id
   * @return {object} Returns User details
   */
  async getUserDetailswithId(userId) {
    let response = await userDetails.findOne({
      where: {
        user_id: userId,
      },
      attributes: [
        'user_id',
        'user_name',
        'email',
        'phone_code',
        'phone_no',
        'first_name',
        'last_name',
        'profile_picture',
        'address',
        'working_at',
        'time_zone',
        'is_account_locked',
        'country',
        'is_admin_user',
        'twitter_id',
        'facebook_id',
        'youtube_id',
        'instagram_id',
        'language',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {
            id: db.Sequelize.col('user_activation_id'),
          },
        },
      ],
    });
    return response;
  }

  async checkUserNameAvailability(username) {
    let response = await userDetails.findOne({
      where: {
        user_name: username,
      },
    });
    return response;
  }

  async UserProfiles(userId) {
    let res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'date_of_birth',
        'profile_picture',
        'phone_code',
        'phone_no',
        'about_me',
      ],
    });
    return res;
  }

  async getUserAccessToken(userId, activationID) {
    let res = await this.updateUserLoginTime(activationID);
    if (res) {
      let userInfo = {};
      let userDetails = await this.getUserDetailswithId(userId);
      userInfo = userDetails;
      let planDetails = await this.getPlanDetails(
        userDetails.Activations.user_plan
      );
      userInfo.userPlanDetails = planDetails.toJSON();
      let accessToken = await this.authorizeServices.createToken(userInfo);
      return {
        user: userInfo,
        userplandetails: planDetails,
        accessToken: accessToken,
      };
    }
  }

  async updateUserLoginTime(user_activation_id) {
    let res = await userActivation.update(
      {
        last_login: moment(),
      },
      {where: {id: user_activation_id}}
    );
    return res;
  }

  async getPlanDetails(planId) {
    let res = await applicationInfo.findOne({
      where: {
        plan_id: planId,
      },
    });
    return res;
  }

  async deleteUser(userId) {
    let transaction;
    let usersTeam = [];
    try {
      transaction = await db.sequelize.transaction();
      let user = await userDetails.findOne(
        {where: {user_id: userId}},
        {transaction}
      );
      let removeUserActivation = await userActivation.destroy(
        {where: {id: user.user_activation_id}},
        {transaction}
      );
      let removeReward = await userRewardsModel.destroy(
        {where: {id: user.user_rewards_id}},
        {transaction}
      );
      let remove = await userDetails.destroy(
        {where: {user_id: userId}},
        {transaction}
      );
      usersTeam = await teamInfo.destroy(
        {where: {team_admin_id: userId}},
        {transaction}
      );
      await transaction.commit();
      return user;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  }

  /**
   * TODO To update the User  details in mysql table
   * Function to Update User details in mysql table
   * @param  {object} postDetails -User details to update
   * @param  {number} user_id - User id
   * @return {string} Returns Update User Details information
   */
  async updateUser(profileDetails, userId) {
    let res = '';
    try {
      res = await userDetails.update(
        {
          user_name: profileDetails.username,
          first_name: profileDetails.firstName,
          last_name: profileDetails.lastName,
          profile_picture: profileDetails.profilePicture,
          working_at: profileDetails.company,
          language: profileDetails.language,
          time_zone: profileDetails.timezone,
          country: profileDetails.country,
          phone_code: profileDetails.phoneCode,
          phone_no: profileDetails.phoneNo,
          company_name: profileDetails.company_name,
          company_logo: profileDetails.company_logo,
        },
        {where: {user_id: userId}}
      );
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserPlanDetailswithId(userId, currentPlan) {
    let response = await userDetails.findOne({
      where: {
        user_id: userId,
      },
      attributes: [
        'user_id',
        'user_name',
        'email',
        'phone_no',
        'first_name',
        'last_name',
        'profile_picture',
        'is_account_locked',
        'is_admin_user',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {
            [Operator.and]: [
              {
                id: db.Sequelize.col('user_activation_id'),
                user_plan: currentPlan,
              },
            ],
          },
          attributes: [
            'id',
            'last_login',
            'user_plan',
            'payment_type',
            'account_expire_date',
            'signup_type',
            'activation_status',
            'activate_2step_verification',
          ],
        },
      ],
    });
    return response;
  }

  async updatePlan(user_activation_id, newplan) {
    let res = await userActivation.update(
      {
        user_plan: newplan,
      },
      {where: {id: user_activation_id}}
    );
    if (newplan == 0) {
      let extendDate = await userActivation.update(
        {
          last_login: moment(),
          user_plan: newPlan,
          account_expire_date: moment.utc().add(1, 'months'),
        },
        {where: {id: user_activation_id}}
      );
    }
    return res;
  }
}
export default AuthorizeLibs;
