import moment from 'moment';
import config from 'config';
import twitterApi from 'node-twitter-api';
import db from '../Sequelize-cli/models/index.js';
import SendEmailServices from '../Services/mail-base.services.js';
import TwtConnect from '../Cluster/twitter.cluster.js';
import aMember from '../Mappings/amember.users.js';
import TeamLibs from './team.model.js';
const teamLibs = new TeamLibs();

// import config from 'config';

import AuthorizeServices from '../Services/authorize.services.js';
import logger from '../../User/resources/Log/logger.log.js';
// const AuthorizeServices = require('../Services/authorizeServices.js')
// const twitterApi = require('node-twitter-api')

// const db = require('../Sequelize-cli/models/index')
// const SendEmailServices = require('../Services/mailServices')
// const dotenv = require('dotenv')
// const moment = require('moment')
// const config = require('config')
// const TwtConnect = require('../Cluster/twitter.js')

// import userDetails from '../../Common/Sequelize-cli/models/user_details.js'
const Operator = db.Sequelize.Op;
const userRewardsModel = db.user_rewards;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const userDetails = db.user_details;
const teamInviteUser = db.invite_user_for_team;
const userTeamJoinTable = db.join_table_users_teams;
const appsumoActivation = db.appsumo_activation;
class userLibs {
  constructor() {
    this.sendEmailServices = new SendEmailServices(config.get('mailService'));
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
  }

  async checkUserNameAvailability(username) {
    const response = await userDetails.findOne({
      where: {
        user_name: username,
      },
    });
    return response;
  }

  async checkPhoneNumberAvailability(phone_no) {
    const response = await userDetails.findOne({
      where: {
        phone_no,
      },
    });

    return response;
  }

  async getUserDetails(email, user_name, password) {
    let query = {};

    if (password) query = {...query, password};
    if (user_name) query = {...query, user_name};
    if (email) query = {...query, email};

    const response = await userDetails.findOne({
      where: query,
      attributes: [
        'user_id',
        'email',
        'phone_no',
        'first_name',
        'last_name',
        'user_name',
        'password',
        'profile_picture',
        'is_account_locked',
        'is_admin_user',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
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

  async getSocialAccDetail(email, user_name) {
    let query = {};
    if (email) query = {...query, email};
    if (email) {
      const response = await userDetails.findOne({
        where: query,
        attributes: [
          'user_id',
          'email',
          'phone_no',
          'first_name',
          'user_name',
          'last_name',
          'profile_picture',
          'is_account_locked',
          'is_admin_user',
        ],
        include: [
          {
            model: userActivation,
            as: 'Activations',
            where: {id: db.Sequelize.col('user_activation_id')},
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

    return null;
  }

  async checkEmailAvailability(email) {
    const response = await userDetails.findOne({
      where: {
        email,
      },
    });

    return response;
  }

  async isUserRegister(userName, email) {
    const response = await userDetails.findOne({
      where: {
        [Operator.or]: [
          {
            user_name: userName,
          },
          {
            email,
          },
        ],
      },
      attributes: ['user_id'],
    });

    return response;
  }

  async registerUser(body) {
    const requestBody = body;

    // if (!requestBody.user.profilePicture || requestBody.user.profilePicture == '') {
    //     requestBody.user.profilePicture = `${config.get("user_socioboard.host_url")}${config.get('profile_url_assert')}`;
    //     requestBody.user.profilePicture = requestBody.user.profilePicture.replace("http", "https");
    // }
    const userInfo = {};
    let fetchedUserId = null;
    let team = null;

    requestBody.isAdminUser = false;
    requestBody.rewards = {
      eWalletValue: 0,
      isAdsEnabled: false,
      referedBy: 'NA',
      referalStatus: false,
    };
    requestBody.activations = {
      activationStatus: 0,
      paymentStatus: 0,
      IsTwoStepVerify: false,
      signupType: 0,
      userPlan: config.get('user_base_plan'),
      expireDate: moment
        .utc()
        .add(config.get('user_base_plan_expiry_days') ?? 7, 'days'),
    };
    const info = requestBody;

    let transaction;
    let user;
    let rewards;
    let socialNetworkDetails;

    try {
      // start a new transaction
      transaction = await db.sequelize.transaction();

      const createdUser = await userDetails.create(
        {
          user_name: info.username,
          email: info.email,
          profile_url: info.profileUrl,
          password: info.password,
          first_name: info.firstName,
          last_name: info.lastName,
          date_of_birth: info.dateOfBirth,
          profile_picture: info.profilePicture,
          phone_code: info.phoneCode,
          phone_no: info.phoneNo,
          country: info.country,
          time_zone: info.timeZone,
          about_me: info.aboutMe,
          is_admin_user: info.isAdminUser,
          is_account_locked: false,
        },
        {transaction}
      );
      // if (createdUser) {
      const user = createdUser;

      userInfo.user = createdUser;
      fetchedUserId = user.user_id;
      rewards = await userRewardsModel.create(
        {
          refered_by: info.rewards.referedBy,
          referal_status: info.rewards.referalStatus,
          is_socioboard_ads_enabled: info.rewards.isAdsEnabled,
          eWallet: info.rewards.eWalletValue,
        },
        {transaction}
      );
      //  }

      if (rewards) {
        await user.setRewards(rewards, {transaction});
      }
      const activationDetails = await userActivation.create(
        {
          activation_status: info.activations.activationStatus,
          payment_status: info.activations.paymentStatus,
          activate_2step_verification: info.activations.IsTwoStepVerify,
          signup_type: info.activations.signupType,
          account_expire_date: info.activations.expireDate,
          user_plan: info.activations.userPlan,
          payment_type: info.activations.paymentType,
        },
        {transaction}
      );

      if (activationDetails) {
        userInfo.activations = activationDetails;
        await user.setActivations(activationDetails, {transaction});
      }

      const teamDetails = await teamInfo.create(
        {
          team_name: 'SocioBoard',
          team_description: 'Default team',
          team_admin_id: user.user_id,
          is_default_team: true,
        },
        {transaction}
      );

      if (teamDetails) {
        team = teamDetails;
        await teamDetails.setUser(user, {
          transaction,
          through: {
            invitation_accepted: true,
            permission: 2,
            left_from_team: false,
            invited_by: 0,
            created_at: moment.now(),
            updated_at: moment.now(),
          },
        });
      }

      if (info.isSocialLogin && info.network == 1) {
        socialNetworkDetails = await socialAccount.create(
          {
            account_type: info.network,
            user_name: info.user.userName,
            first_name: info.user.firstName,
            last_name: info.user.lastName,
            email: info.user.email,
            social_id: info.user.userName,
            profile_pic_url: info.user.profilePicture,
            cover_pic_url: info.user.profilePicture,
            profile_url: info.user.profileUrl,
            access_token: info.accessToken,
            refresh_token: info.refreshToken,
            friendship_counts: info.user.friendCount,
            info: info.user.aboutMe,
            account_admin_id: user.user_id,
          },
          {transaction}
        );
      }

      if (socialNetworkDetails) {
        if (info.isSocialLogin && info.network == 1) {
          AccountDetails = socialNetworkDetails;
          await socialNetworkDetails.setTeam(team, {
            transaction,
            through: {is_account_locked: false},
          });
        }
        if (info.isSocialLogin && info.network == 1) {
          try {
            return user.setAccount(AccountDetails, {transaction});
          } catch (error) {
            return;
          }
        }
      }

      await transaction.commit();

      return {userId: fetchedUserId, userInfo};
    } catch (err) {
      // console.log(err)
      // if we got an error and we created the transaction, roll it back
      if (transaction) {
        await transaction.rollback();
      }
      // return
    }
  }

  async sendMail(data, planName) {
    // let response = await getPlanDetails(data.userId)
    // if()
    // this.sendEmailServices

    const activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verifyEmails?email=${data.email}&activationToken=${
      data.Activations.email_validate_token
    }`;
    const htmlContent = this.sendEmailServices.template.registration
      .replace('[FirstName]', `${data.first_name}`)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'SocioBoard Activation Mail',
      toMail: data.email,
      htmlContent,
    };
    const mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );

    return mailData.response ? mailData.response : mailData;
  }

  /**
   * TODO Sent the Welcome Mail to User
   * Function To Sent the Welcome Mail to User If mail Verified
   * @param  {object} userInfo - User details
   * @return {object} Returns Sent Mail Status
   */
  async sendWelcomeMail(userInfo) {
    let htmlContent = this.sendEmailServices.template.welcomeMailLink.replace(
      '[FirstName]',
      `${userInfo.first_name}`
    );
    let emailDetails = {
      subject: 'Welcome To SocioBoard',
      toMail: userInfo.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );
    return mailData.response ? mailData.response : mailData;
  }
  /**
   * TODO Sent User Account Delete Mail
   * Function to sent User Account Delete Mail
   * @param  {object} userInfo - User details
   * @return {object} Returns Sent Mail Status
   */
  async sendDeleteUserMail(userInfo) {
    let htmlContent = this.sendEmailServices.template.deleteUserLink.replace(
      '[FirstName]',
      `${userInfo.first_name}`
    );
    let emailDetails = {
      subject: 'SocioBoard Account Deleted',
      toMail: userInfo.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );
    return mailData.response ? mailData.response : mailData;
  }

  async sendForgotPasswordMail(userInfo) {
    const activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-password-token?email=${userInfo.email}&activationToken=${
      userInfo.Activations.forgot_password_validate_token
    }`;
    // Appending activation link in Mail content
    const htmlContent = this.sendEmailServices.template.forgotpassword
      .replace('[FirstName]', `${userInfo.first_name}`)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'SocioBoard Reset Password',
      toMail: userInfo.email,
      htmlContent,
    };
    const mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );

    return mailData.response ? mailData.response : mailData;
  }

  async sendDirectLoginMail(userInfo) {
    const activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-direct-login?email=${userInfo.email}&activationToken=${
      userInfo.Activations.direct_login_validate_token
    }`;
    // Appending activation link in Mail content
    const htmlContent = this.sendEmailServices.template.directLogin
      .replace('[FirstName]', `${userInfo.first_name}`)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'SocioBoard Direct Login',
      toMail: userInfo.email,
      htmlContent,
    };
    const mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );

    return mailData.response ? mailData.response : mailData;
  }

  async updateToken(
    newEmailVerificationToken,
    newExpireDate,
    user_activation_id
  ) {
    const response = await userActivation.update(
      {
        email_validate_token: newEmailVerificationToken,
        email_token_expire: newExpireDate,
      },
      {where: {id: user_activation_id}}
    );

    return response;
  }

  async verifyEmail(email, activationToken) {
    // console.log("email ", email)
    // let checkUserDetails = await this.checkUserDetails(email)
    // if (!checkUserDetails) return
  }

  async checkUserDetails(email) {
    const response = await userDetails.findOne({
      where: {
        email,
      },
      attributes: [
        'user_id',
        'first_name',
        'last_name',
        'user_name',
        'password',
        'email',
        'user_activation_id',
        'is_account_locked',
        'phone_code',
        'phone_no',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
          attributes: [
            'id',
            'signup_type',
            'email_validate_token',
            'email_token_expire',
            'account_expire_date',
            'activation_status',
            'user_plan',
          ],
        },
      ],
    });

    return response?.dataValues;
  }

  async userVerified(userId) {
    const response = await userActivation.update(
      {activation_status: 1},
      {where: {id: userId}}
    );

    return response;
  }

  async userUnholded(email) {
    const response = await userDetails.update(
      {is_account_locked: 0},
      {where: {email}}
    );

    return response;
  }

  /**
   * TODO To Fetch the User Access Token  for the specified User
   * Function to Fetch User Access Token  for the specified User
   * @param  {number} userId - User id
   * @param  {number} activationID - activationID id
   * @return {object} Returns User details and User AccessToken
   */

  async getUserAccessToken(userId, activationID) {
    const res = await this.updateUserLoginTime(activationID);

    if (res) {
      let userInfo = {};
      const userDetails = await this.getUserDetailswithId(userId);

      userInfo = userDetails;
      const planDetails = await this.getPlanDetails(
        userDetails.Activations.user_plan
      );

      userInfo.userPlanDetails = planDetails;
      const accessToken = await this.authorizeServices.createToken(userInfo);

      return {user: userInfo, accessToken};
    }
  }

  async getUserDetailswithId(userId) {
    const response = await userDetails.findOne({
      where: {
        user_id: Number(userId),
      },
      // attributes: ['user_id', 'user_name', 'email', 'phone_code', 'phone_no', 'first_name', 'last_name', 'profile_picture', 'address', 'working_at', 'time_zone', 'is_account_locked', 'country', 'is_admin_user', 'twitter_id', 'facebook_id', 'youtube_id', 'instagram_id', 'language'],
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

    return response.dataValues;
  }

  async getUserDetailswithIdForgetPassword(userId) {
    const response = await userDetails.findOne({
      where: {
        user_id: Number(userId),
      },
      attributes: [
        'user_id',
        'email',
        'phone_no',
        'first_name',
        'last_name',
        'date_of_birth',
        'phone_code',
        'about_me',
        'profile_picture',
        'is_account_locked',
        'is_admin_user',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
          attributes: [
            'id',
            'last_login',
            'user_plan',
            'payment_type',
            'account_expire_date',
            'signup_type',
            'activation_status',
            'activate_2step_verification',
            'shortenStatus',
            'email_validate_token',
            'forgot_password_validate_token',
            'forgot_password_token_expire',
            'otp_token',
            'otp_token_expire',
            'direct_login_validate_token',
            'direct_login_token_expire',
          ],
        },
      ],
    });

    return response;
  }

  async getUserDetailswithDirectLogin(userId) {
    const response = await userDetails.findOne({
      where: {
        user_id: Number(userId),
      },
      attributes: [
        'user_id',
        'email',
        'phone_no',
        'first_name',
        'last_name',
        'date_of_birth',
        'phone_code',
        'about_me',
        'profile_picture',
        'is_account_locked',
        'is_admin_user',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
          attributes: [
            'id',
            'last_login',
            'user_plan',
            'payment_type',
            'account_expire_date',
            'signup_type',
            'activation_status',
            'activate_2step_verification',
            'shortenStatus',
            'email_validate_token',
            'forgot_password_validate_token',
            'forgot_password_token_expire',
            'otp_token',
            'otp_token_expire',
            'direct_login_validate_token',
            'direct_login_token_expire',
          ],
        },
      ],
    });

    return response;
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
  /**
   * TODO To Fecth the Plan details
   * Function to Fecth the Plan details
   * @param  {number} planId - Plan Id
   * @return {object} Returns User Plan details
   */

  async getFullPlanDetails(planId) {
    if (planId) {
      return this.getPlanDetails(planId);
    }
    const res = await applicationInfo.findAll({
      where: {
        plan_id: {
          [Operator.not]: config.get('appsumo.plan'),
        },
      },
    });

    return res;
  }

  async userDetailsForForgotPassword(email) {
    const res = await userDetails.findOne({
      where: {
        email,
      },
      attributes: [
        'user_id',
        'user_name',
        'first_name',
        'email',
        'user_activation_id',
      ],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
          attributes: [
            'id',
            'forgot_password_validate_token',
            'forgot_password_token_expire',
          ],
        },
      ],
    });

    return res;
  }

  async userDetailsForDirectLogin(email) {
    const res = await userDetails.findOne({
      where: {
        email,
      },
      attributes: ['user_id', 'first_name', 'email', 'user_activation_id'],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {id: db.Sequelize.col('user_activation_id')},
          attributes: [
            'id',
            'direct_login_validate_token',
            'direct_login_token_expire',
          ],
        },
      ],
    });

    return res;
  }

  async updateForgotVerificationToken(
    user_activation_id,
    newExpireDate,
    newForgotVerificationToken
  ) {
    const res = await userActivation.update(
      {
        forgot_password_validate_token: newForgotVerificationToken,
        forgot_password_token_expire: newExpireDate,
      },
      {
        where: {
          id: user_activation_id,
        },
      }
    );

    return res;
  }

  async updateDirectLoginToken(
    user_activation_id,
    newExpireDate,
    newDirectLoginToken
  ) {
    const res = await userActivation.update(
      {
        direct_login_validate_token: newDirectLoginToken,
        direct_login_token_expire: newExpireDate,
      },
      {
        where: {
          id: user_activation_id,
        },
      }
    );

    return res;
  }

  /**
   * TODO To update the User  Password
   * Function to Update User Password
   * @param  {number} user_id - User id
   * @param  {string} newPassword - User Password
   * @return {object} Returns Update User details
   */
  async updatePassword(user_id, userName, newPassword) {
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

  async parseDataFacebook(data, access_token) {
    const fbUserDeatils = {
      user: {
        username: data.user_id,
        email: data.email,
        password: 'socioFb@123',
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.birthday,
        profilePicture: `https://graph.facebook.com/${data.user_id}/picture?type=large`,
      },
      rewards: {
        eWalletValue: 0,
        isAdsEnabled: false,
        referedBy: 'NA',
        referalStatus: false,
      },
      activations: {
        activationStatus: 1,
        paymentStatus: 0,
        IsTwoStepVerify: false,
        signupType: 2,
        userPlan: config.get('user_base_plan'),
        expireDate: moment.utc().add(1, 'months'),
      },
      isSocialLogin: true,
      network: '1', // 1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion
      accessToken: access_token,
      refreshToken: access_token,

      // phoneNo: "1324575248",
    };

    return fbUserDeatils;
  }

  async parsedataGoogle(data, tokens) {
    //   let birthday = data.birthday ? moment(profileDetails.birthday, ["MM-DD-YYYY", "YYYY-MM-DD"]) : moment("01-01-1970", ["MM-DD-YYYY", "YYYY-MM-DD"]);
    const googleUserDeatils = {
      user: {
        username: data.id,
        email: data.email,
        password: 'sociogooglr@123',
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.birthday
          ? data.birthday
          : moment('01-01-1970', ['MM-DD-YYYY', 'YYYY-MM-DD']),
        profilePicture: data.profilePicUrl,
      },
      rewards: {
        eWalletValue: 0,
        isAdsEnabled: false,
        referedBy: 'NA',
        referalStatus: false,
      },
      activations: {
        activationStatus: 1,
        paymentStatus: 0,
        IsTwoStepVerify: false,
        signupType: 1,
        userPlan: config.get('user_base_plan'),
        expireDate: moment.utc().add(1, 'months'),
      },
      isSocialLogin: true,
      network: '8', // 1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,

      // phoneNo: "1324575248",
    };

    return googleUserDeatils;
  }

  async parsedatagitHub(data) {
    const userEmail = `${data.login}@github.com`;
    const githubUserDeatils = {
      user: {
        username: data.id,
        email: userEmail,
        password: 'github@@123',
        firstName: data.login,
        // lastName: data.family_name,
        dateOfBirth: moment('01-01-1970', ['MM-DD-YYYY', 'YYYY-MM-DD']),
        profilePicture: data.avatar_url,
      },
      rewards: {
        eWalletValue: 0,
        isAdsEnabled: false,
        referedBy: 'NA',
        referalStatus: false,
      },
      activations: {
        activationStatus: 1,
        paymentStatus: 0,
        IsTwoStepVerify: false,
        signupType: 4,
        userPlan: config.get('user_base_plan'),
        expireDate: moment.utc().add(1, 'months'),
      },
      // isSocialLogin: true,
      // network: "12", //1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion 12,github
      // accessToken: tokens,
      // refreshToken: tokens

      // phoneNo: "1324575248",
    };

    return githubUserDeatils;
  }

  async parseTwitter(data, tokens) {
    try {
      const userEmail = `${data.screen_name}@twitter.com`;
      const githubUserDeatils = {
        user: {
          username: data.screen_name,
          email: userEmail,
          password: 'Twitter@@123',
          firstName: data.name,
          // lastName: data.family_name,
          dateOfBirth: moment('01-01-1970', ['MM-DD-YYYY', 'YYYY-MM-DD']),
          profilePicture: data.profile_image_url,
        },
        rewards: {
          eWalletValue: 0,
          isAdsEnabled: false,
          referedBy: 'NA',
          referalStatus: false,
        },
        activations: {
          activationStatus: 1,
          paymentStatus: 0,
          IsTwoStepVerify: false,
          signupType: 3,
          userPlan: config.get('user_base_plan'),
          expireDate: moment.utc().add(1, 'months'),
        },
        isSocialLogin: true,
        network: '4', // 1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion 12,github
        accessToken: tokens.accessToken,
        refreshToken: tokens.accessSecret,

        // phoneNo: "1324575248",
      };

      return githubUserDeatils;
    } catch (error) {
      return error;
    }
  }

  async getTwitterAccessToken(token, secret, verifier) {
    const twitterObject = new twitterApi({
      consumerKey: process.env.Twitter_App_Id,
      consumerSecret: process.env.Twitter_Secret,
      callback: process.env.Twitter_Redirect_url,
    });

    twitterObject.getAccessToken(
      token,
      secret,
      verifier,
      (error, accessToken, accessSecret) => {
        if (error) return error;

        const response = {
          accessToken,
          accessSecret,
        };

        return response;
      }
    );
  }

  async registerSocialUser(info) {
    const userInfo = {}; // used
    let fetchedUserId = null; // used
    let team = null; // used
    let AccountDetails = {};
    let user; // used
    let transaction; // used
    let rewards; // used
    let socialNetworkDetails;

    try {
      // start a new transaction
      transaction = await db.sequelize.transaction();

      const createdUser = await userDetails.create(
        {
          user_name: info.user.username,
          email: info.user.email,
          //   profile_url: info.user.profilePicture,
          password: info.user.password,
          first_name: info.user.firstName,
          last_name: info.user.lastName,
          date_of_birth: info.user.dateOfBirth
            ? moment(info.user.dateOfBirth, ['MM-DD-YYYY', 'YYYY-MM-DD']) ||
              moment('01-01-1970', ['MM-DD-YYYY', 'YYYY-MM-DD'])
            : '1970-01-01',

          profile_picture: info.user.profilePicture,
          phone_code: info.user.phoneCode, // default value starts
          phone_no: info.user.phoneNo,
          country: info.user.country,
          time_zone: info.timeZone,
          about_me: info.aboutMe,
          is_admin_user: false,
          is_account_locked: false,
        },
        {transaction}
      );
      // #region
      // if (createdUser) {
      const user = createdUser;

      userInfo.user = createdUser;
      fetchedUserId = user.user_id;
      rewards = await userRewardsModel.create(
        {
          refered_by: info.rewards.referedBy,
          referal_status: info.rewards.referalStatus,
          is_socioboard_ads_enabled: info.rewards.isAdsEnabled,
          eWallet: info.rewards.eWalletValue,
        },
        {transaction}
      );
      // //  }

      if (rewards) {
        await user.setRewards(rewards, {transaction});
      }
      const activationDetails = await userActivation.create(
        {
          activation_status: info.activations.activationStatus,
          payment_status: info.activations.paymentStatus,
          activate_2step_verification: info.activations.IsTwoStepVerify,
          signup_type: info.activations.signupType,
          account_expire_date: moment
            .utc()
            .add(config.get('user_base_plan_expiry_days') ?? 7, 'days'),
          user_plan: info.activations.userPlan,
          //  payment_type: info.activations.paymentType
        },
        {transaction}
      );

      if (activationDetails) {
        userInfo.activations = activationDetails;
        await user.setActivations(activationDetails, {transaction});
      }

      const teamDetails = await teamInfo.create(
        {
          team_name: 'SocioBoard',
          team_description: 'Default team',
          team_admin_id: user.user_id,
          is_default_team: true,
        },
        {transaction}
      );

      if (teamDetails) {
        team = teamDetails;
        await teamDetails.setUser(user, {
          transaction,
          through: {
            invitation_accepted: true,
            permission: 1,
            left_from_team: false,
            invited_by: 0,
          },
        });
      }

      if (info.isSocialLogin && info.network == 1) {
        socialNetworkDetails = await socialAccount.create(
          {
            account_type: info.network,
            user_name: info.user.username,
            first_name: info.user.firstName,
            last_name: info.user.lastName,
            email: info.user.email,
            social_id: info.user.username,
            profile_pic_url: info.user.profilePicture,
            cover_pic_url: info.user.profilePicture,
            profile_url: `https://facebook.com/${info.user.username}`,
            access_token: info.accessToken,
            refresh_token: info.refreshToken,
            friendship_counts: 0,
            // info: info.user.aboutMe,
            account_admin_id: user.user_id,
          },
          {transaction}
        );
      }
      if (info.isSocialLogin && info.network == 4) {
        socialNetworkDetails = await socialAccount.create(
          {
            account_type: info.network,
            user_name: info.user.username,
            first_name: info.user.firstName,
            last_name: info.user.lastName,
            email: info.user.email,
            social_id: info.user.username,
            profile_pic_url: info.user.profilePicture,
            cover_pic_url: info.user.profilePicture,
            profile_url: `https://twitter.com/${info.user.username}`,
            access_token: info.accessToken,
            refresh_token: info.refreshToken,
            friendship_counts: 0,
            // info: info.user.aboutMe,
            account_admin_id: user.user_id,
          },
          {transaction}
        );
      }

      if (socialNetworkDetails) {
        // if (info.isSocialLogin && info.network == 1) {
        AccountDetails = socialNetworkDetails;
        await socialNetworkDetails.setTeam(team, {
          transaction,
          through: {is_account_locked: false},
        });
        // }
        // if (info.isSocialLogin && info.network == 1) {
        //     try {
        //         return socialNetworkDetails.setAccount(AccountDetails, { transaction });
        //     } catch (error) {
        //         console.error(`error ${ error }`)
        //         return;
        //     }
        // }
      }

      await transaction.commit();

      return {userId: fetchedUserId, userInfo, socialNetworkDetails};
    } catch (err) {
      // if we got an error and we created the transaction, roll it back
      if (transaction) {
        await transaction.rollback();
        throw new Error(err.message);
      }
    }
  }

  async getTwitterData(requestToken, requestSecret, verifier) {
    return this.twtConnect
      .addTwitterProfilebyLogin(requestToken, requestSecret, verifier)
      .then(profile => {
        const parseddata = this.parseTwitter(
          profile.profile_deatils,
          profile.token
        );

        return parseddata;
      })
      .catch(error => error);
  }

  async sendMailForUnhold(data) {
    // let response = await getPlanDetails(data.userId)
    // if()
    // this.sendEmailServices
    const activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-unhold-token?email=${data.email}&activationToken=${
      data.Activations.email_validate_token
    }`;
    const htmlContent = this.sendEmailServices.template.unlock
      .replace('[FirstName]', `${data.first_name}`)
      .replace('[AccountType]', data.Activations.plan_name)
      .replace('[ActivationLink]', activationLink);
    const emailDetails = {
      subject: 'Activation Mail',
      toMail: data.email,
      htmlContent,
    };
    const mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );

    return mailData.response ? mailData.response : mailData;
  }

  /**
   * TODO To check user invited to join any team
   * Function To check user invited to join any team
   * @param  {number} user_id -Invited user id.
   * @param  {string} email -Email id of user invited
   */
  async checkTeamInvite(email, user_id) {
    let res = await teamInviteUser.findAll({
      where: {
        email,
        status: 0,
      },
      raw: true,
    });
    let result;
    if (res?.length > 0) {
      res.map(async x => {
        let user = await userDetails.findOne({
          where: {
            user_id: x.invited_by,
          },
          raw: true,
        });
        if (user) {
          let teamDetails = await teamInfo.findOne({
            where: {
              team_id: x.team_id,
            },
            raw: true,
          });
          if (teamInfo) {
            result = await userTeamJoinTable.create({
              team_id: x.team_id,
              user_id,
              invitation_accepted: false,
              permission: x.permission,
              left_from_team: false,
              invited_by: x.invited_by,
            });
            await teamInviteUser.update({status: 1}, {where: {id: x.id}});
            if (config.get('notification_socioboard.status') == 'on') {
              await teamLibs.sendUserNotification(
                `${user.first_name} invited to join ${teamDetails.team_name} Team.`,
                teamDetails.team_name,
                'team_invite',
                user.first_name,
                'success',
                user_id,
                user_id
              );
            }
          }
        }
      });
    }
  }

  async checkAppSumoActivation(activation_email, user_name) {
    let res = await appsumoActivation.findOne({
      where: {
        activation_email,
      },
      raw: true,
    });
    logger.info(`AppSumo result ${JSON.stringify(res)} user_name ${user_name}`);
    if (res) {
      await new aMember(config.get('aMember')).setAMemberPlanForAppSumoUser(
        user_name,
        res.plan_id,
        res.action === 'refund' ? true : false
      );
    }
  }
}
export default userLibs;
