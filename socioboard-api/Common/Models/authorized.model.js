import moment from 'moment';
import config from 'config';
import db from '../Sequelize-cli/models/index.js';
import AuthorizeServices from '../Services/authorize.services.js';

import aMember from '../Mappings/amember.users.js';

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

  /**
   * TODO To update the User  Password
   * Function to Update User Password
   * @param  {number} user_id - User id
   * @param  {string} newPassword - User Password
   * @return {object} Returns Update User details
   */

  async changePassword(user_id, userName, newPassword) {
    let res = await userDetails.update(
      {password: newPassword},
      {
        where: {
          user_id,
        },
      }
    );
    //update in Amember as well
    let aMemberData = {
      password: newPassword,
      userName,
    };
    new aMember(config.get('aMember')).updateUserPasswordToAMember(aMemberData);
    return res;
  }

  async getUserDetails(userId) {
    const res = await userDetails.findOne({
      where: {user_id: userId},
      attributes: ['user_id', 'email', 'password'],
    });

    return res;
  }

  async holdUser(userId) {
    const res = await userDetails.update(
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
    const response = await userDetails.findOne({
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
    const response = await userDetails.findOne({
      where: {
        user_name: username,
      },
    });

    return response;
  }

  async UserProfiles(userId) {
    const res = await userDetails.findOne({
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
    const res = await this.updateUserLoginTime(activationID);

    if (res) {
      let userInfo = {};
      const userDetails = await this.getUserDetailswithId(userId);

      userInfo = userDetails;
      const planDetails = await this.getPlanDetails(
        userDetails.Activations.user_plan
      );

      userInfo.userPlanDetails = planDetails.toJSON();
      const accessToken = await this.authorizeServices.createToken(userInfo);

      return {
        user: userInfo,
        userplandetails: planDetails,
        accessToken,
      };
    }
  }

  async updateUserLoginTime(user_activation_id) {
    const res = await userActivation.update(
      {
        last_login: moment(),
      },
      {where: {id: user_activation_id}}
    );

    return res;
  }

  async getPlanDetails(planId) {
    const res = await applicationInfo.findOne({
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
      const user = await userDetails.findOne(
        {where: {user_id: userId}},
        {transaction}
      );
      const removeUserActivation = await userActivation.destroy(
        {where: {id: user.user_activation_id}},
        {transaction}
      );
      const removeReward = await userRewardsModel.destroy(
        {where: {id: user.user_rewards_id}},
        {transaction}
      );
      const remove = await userDetails.destroy(
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
   * To delete the particular user from aMember if they delete the account from SocioBoard.
   * TODO delete the Details from aMember
   * @param {string} userName
   */
  async deleteUserAmember(userName) {
    let deleteUser = await new aMember(
      config.get('aMember')
    ).deleteUserFromAMember(userName);
    return deleteUser;
  }

  /**
   * TODO To update the User  details in mysql table
   * Function to Update User details in mysql table
   * @param  {object} profileDetails -User details to update
   * @param  {number} userId - User id
   * @return {object} Returns Update User Details information
   */
  async updateUser(profileDetails, userId, userName) {
    let res = '';

    try {
      res = await userDetails.update(
        {
          user_name: profileDetails?.username,
          first_name: profileDetails?.firstName,
          last_name: profileDetails?.lastName,
          email: profileDetails?.email,
          profile_picture: profileDetails?.profilePicture,
          working_at: profileDetails?.company,
          address: profileDetails?.location,
          language: profileDetails?.language,
          time_zone: profileDetails?.timezone,
          country: profileDetails?.country,
          phone_code: profileDetails?.phoneCode,
          phone_no: profileDetails?.phoneNo,
          company_name: profileDetails?.company_name,
          company_logo: profileDetails?.company_logo,
        },
        {where: {user_id: userId}}
      );
      // Update User Email  in aMember as well
      if (profileDetails?.email) {
        let aMemberData = {
          email: profileDetails?.email,
          userName,
        };
        new aMember(config.get('aMember')).updateUserEmailToAMember(
          aMemberData
        );
      }
      if (profileDetails?.phoneNo || profileDetails?.phoneCode) {
        let aMemberData = {
          userName,
          phoneNo: `${profileDetails?.phoneCode}${profileDetails?.phoneNo}`,
        };
        new aMember(config.get('aMember')).updateUserPhoneToAMember(
          aMemberData
        );
      }
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserPlanDetailswithId(userId, currentPlan) {
    const response = await userDetails.findOne({
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
    const res = await userActivation.update(
      {
        user_plan: newplan,
      },
      {where: {id: user_activation_id}}
    );

    if (newplan == 0) {
      const extendDate = await userActivation.update(
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
