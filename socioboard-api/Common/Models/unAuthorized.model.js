import db from '../Sequelize-cli/models/index.js';
import SendEmailServices from '../Services/mailBase.services.js';
import moment from 'moment';
import config from 'config';
import TwtConnect from '../Cluster/twitter.cluster.js';

// const db = require('../Sequelize-cli/models/index')
// const SendEmailServices = require('../Services/mailServices')
// const dotenv = require('dotenv')
// const moment = require('moment')
// const config = require('config')
// const TwtConnect = require('../Cluster/twitter.js')

//import userDetails from '../../Common/Sequelize-cli/models/user_details.js'
const Operator = db.Sequelize.Op;
const userRewardsModel = db.user_rewards;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const userDetails = db.user_details;

//import config from 'config';

import AuthorizeServices from '../Services/authorize.services.js';
// const AuthorizeServices = require('../Services/authorizeServices.js')
// const twitterApi = require('node-twitter-api')

import twitterApi from 'node-twitter-api';

class userLibs {
  constructor() {
    this.sendEmailServices = new SendEmailServices(config.get('mailService'));
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
  }

  async checkUserNameAvailability(username) {
    let response = await userDetails.findOne({
      where: {
        user_name: username,
      },
    });
    return response;
  }

  async getUserDetails(email, user_name, password) {
    let query = {};
    if (password) query = {...query, password};
    if (user_name) query = {...query, user_name};
    if (email) query = {...query, email};

    let response = await userDetails.findOne({
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
    if (user_name) query = {...query, user_name};
    if (email) query = {...query, email};

    if (email || user_name) {
      let response = await userDetails.findOne({
        where: query,
        attributes: [
          'user_id',
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
    } else return null;
  }

  async checkEmailAvailability(email) {
    let response = await userDetails.findOne({
      where: {
        email: email,
      },
    });
    return response;
  }

  async isUserRegister(userName, email) {
    let response = await userDetails.findOne({
      where: {
        [Operator.or]: [
          {
            user_name: userName,
          },
          {
            email: email,
          },
        ],
      },
      attributes: ['user_id'],
    });
    return response;
  }

  async registerUser(body) {
    let requestBody = body;

    // if (!requestBody.user.profilePicture || requestBody.user.profilePicture == '') {
    //     requestBody.user.profilePicture = `${config.get("user_socioboard.host_url")}${config.get('profile_url_assert')}`;
    //     requestBody.user.profilePicture = requestBody.user.profilePicture.replace("http", "https");
    // }
    var userInfo = {};
    var fetchedUserId = null;
    var team = null;
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
      userPlan: 7,
      expireDate: moment.utc().add(1, 'months'),
    };
    let info = requestBody;

    let transaction;
    let user;
    let rewards;
    let socialNetworkDetails;
    try {
      // start a new transaction
      transaction = await db.sequelize.transaction();

      let createdUser = await userDetails.create(
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
        ),
        // if (createdUser) {
        user = createdUser;
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
      let activationDetails = await userActivation.create(
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

      let teamDetails = await teamInfo.create(
        {
          team_name: 'socioboard',
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
      return {userId: fetchedUserId, userInfo: userInfo};
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

    var activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verifyEmails?email=${data.email}&activationToken=${
      data.Activations.email_validate_token
    }`;
    var htmlContent = this.sendEmailServices.template.registration
      .replace('[FirstName]', `${data.first_name}`)
      .replace('[AccountType]', planName)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'Activation Mail',
      toMail: data.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );
    return mailData.response ? mailData.response : mailData;
  }
  async sendForgotPasswordMail(userInfo) {
    var activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-password-token?email=${userInfo.email}&activationToken=${
      userInfo.Activations.forgot_password_validate_token
    }`;
    // Appending activation link in Mail content
    var htmlContent = this.sendEmailServices.template.forgotpassword
      .replace('[FirstName]', `${userInfo.first_name}`)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'Socioboard reset password',
      toMail: userInfo.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );
    return mailData.response ? mailData.response : mailData;
  }

  async sendDirectLoginMail(userInfo) {
    var activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-direct-login?email=${userInfo.email}&activationToken=${
      userInfo.Activations.direct_login_validate_token
    }`;
    // Appending activation link in Mail content
    var htmlContent = this.sendEmailServices.template.directLogin
      .replace('[FirstName]', `${userInfo.first_name}`)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'Socioboard Direct Login',
      toMail: userInfo.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
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
    let response = await userActivation.update(
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
    let response = await userDetails.findOne({
      where: {
        email: email,
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
    let response = await userActivation.update(
      {activation_status: 1},
      {where: {id: userId}}
    );
    return response;
  }

  async userUnholded(email) {
    let response = await userDetails.update(
      {is_account_locked: 0},
      {where: {email: email}}
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
    let res = await this.updateUserLoginTime(activationID);
    if (res) {
      let userInfo = {};
      let userDetails = await this.getUserDetailswithId(userId);
      userInfo = userDetails;
      let planDetails = await this.getPlanDetails(
        userDetails.Activations.user_plan
      );
      userInfo.userPlanDetails = planDetails;
      let accessToken = await this.authorizeServices.createToken(userInfo);
      return {user: userInfo, accessToken: accessToken};
    }
  }

  async getUserDetailswithId(userId) {
    let response = await userDetails.findOne({
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
    let response = await userDetails.findOne({
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
    let response = await userDetails.findOne({
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
  async getFullPlanDetails(planId) {
    let res = await applicationInfo.findAll({});
    return res;
  }

  async userDetailsForForgotPassword(email) {
    let res = await userDetails.findOne({
      where: {
        email: email,
      },
      attributes: ['user_id', 'first_name', 'email', 'user_activation_id'],
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
    let res = await userDetails.findOne({
      where: {
        email: email,
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
    let res = await userActivation.update(
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
    let res = await userActivation.update(
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

  async updatePassword(user_id, newPassword) {
    let res = await userDetails.update(
      {password: newPassword},
      {
        where: {
          user_id: user_id,
        },
      }
    );
    return res;
  }

  async parseDataFacebook(data, access_token) {
    let fbUserDeatils = {
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
        userPlan: 1,
        // expireDate:
      },
      isSocialLogin: true,
      network: '1', //1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion
      accessToken: access_token,
      refreshToken: access_token,

      // phoneNo: "1324575248",
    };
    return fbUserDeatils;
  }
  async parsedataGoogle(data, tokens) {
    //   let birthday = data.birthday ? moment(profileDetails.birthday, ["MM-DD-YYYY", "YYYY-MM-DD"]) : moment("01-01-1970", ["MM-DD-YYYY", "YYYY-MM-DD"]);
    let googleUserDeatils = {
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
        userPlan: 1,
        // expireDate:
      },
      isSocialLogin: true,
      network: '8', //1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,

      // phoneNo: "1324575248",
    };
    return googleUserDeatils;
  }
  async parsedatagitHub(data) {
    let userEmail = data.login + '@github.com';
    let githubUserDeatils = {
      user: {
        username: data.id,
        email: userEmail,
        password: 'github@@123',
        firstName: data.login,
        //lastName: data.family_name,
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
        userPlan: 1,
        // expireDate:
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
      let userEmail = data.screen_name + '@twitter.com';
      let githubUserDeatils = {
        user: {
          username: data.screen_name,
          email: userEmail,
          password: 'Twitter@@123',
          firstName: data.name,
          //lastName: data.family_name,
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
          userPlan: 1,
          // expireDate:
        },
        isSocialLogin: true,
        network: '4', //1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion 12,github
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
    let twitterObject = new twitterApi({
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
        else {
          var response = {
            accessToken: accessToken,
            accessSecret: accessSecret,
          };
          return response;
        }
      }
    );
  }

  async registerSocialUser(info) {
    var userInfo = {}; //used
    var fetchedUserId = null; //used
    var team = null; //used
    var AccountDetails = {};
    let user; //used
    let transaction; //used
    let rewards; //used
    let socialNetworkDetails;

    try {
      // start a new transaction
      transaction = await db.sequelize.transaction();

      let createdUser = await userDetails.create(
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
            phone_code: info.user.phoneCode, //default value starts
            phone_no: info.user.phoneNo,
            country: info.user.country,
            time_zone: info.timeZone,
            about_me: info.aboutMe,
            is_admin_user: false,
            is_account_locked: false,
          },
          {transaction}
        ),
        //#region
        // if (createdUser) {
        user = createdUser;
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
      let activationDetails = await userActivation.create(
        {
          activation_status: info.activations.activationStatus,
          payment_status: info.activations.paymentStatus,
          activate_2step_verification: info.activations.IsTwoStepVerify,
          signup_type: info.activations.signupType,
          // account_expire_date: info.activations.expireDate,
          user_plan: info.activations.userPlan,
          //  payment_type: info.activations.paymentType
        },
        {transaction}
      );

      if (activationDetails) {
        userInfo.activations = activationDetails;
        await user.setActivations(activationDetails, {transaction});
      }

      let teamDetails = await teamInfo.create(
        {
          team_name: 'socioboard',
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
            //info: info.user.aboutMe,
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
            //info: info.user.aboutMe,
            account_admin_id: user.user_id,
          },
          {transaction}
        );
      }

      if (socialNetworkDetails) {
        //if (info.isSocialLogin && info.network == 1) {
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
      return {userId: fetchedUserId, userInfo: userInfo, socialNetworkDetails};
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
        let parseddata = this.parseTwitter(
          profile.profile_deatils,
          profile.token
        );
        return parseddata;
      })
      .catch(error => {
        return error;
      });
  }

  async sendMailForUnhold(data) {
    // let response = await getPlanDetails(data.userId)
    // if()
    // this.sendEmailServices
    var activationLink = `${config.get(
      'user_socioboard.mail_url'
    )}/verify-unhold-token?email=${data.email}&activationToken=${
      data.Activations.email_validate_token
    }`;
    var htmlContent = this.sendEmailServices.template.unlock
      .replace('[FirstName]', `${data.first_name}`)
      .replace('[AccountType]', data.Activations.plan_name)
      .replace('[ActivationLink]', activationLink);
    var emailDetails = {
      subject: 'Activation Mail',
      toMail: data.email,
      htmlContent: htmlContent,
    };
    let mailData = await this.sendEmailServices.sendMails(
      config.get('mailService.defaultMailOption'),
      emailDetails
    );
    return mailData.response ? mailData.response : mailData;
  }
}
export default userLibs;
