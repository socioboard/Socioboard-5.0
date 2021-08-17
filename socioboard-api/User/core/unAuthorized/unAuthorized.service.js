// import Helper from './../helper/helper.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
import UnauthorizedLibs from '../../../Common/Models/unAuthorized.model.js';
import {
  SuccessResponse,
  ValidateErrorResponse,
  ErrorResponse,
  CatchResponse,
  SocialCallbackResponse,
} from '../../../Common/Shared/response.shared.js';
import CoreServices from '../../../Common/Services/core.services.js';
import validate from './unAuthorized.validate.js';
import moment from 'moment';
import uuidv1 from 'uuidv1';
import config from 'config';
import TwtConnect from '../../../Common/Cluster/twitter.cluster.js';

import twitterApi from 'node-twitter-api';

const fbversion = 'v9.0';
import axios from 'axios';
import facebook from 'fb';

// aMember service to upload user
import aMember from '../../../Common/Mappings/amember.users.js';

const unauthorizedLibs = new UnauthorizedLibs();

class unauthorizedController {
  constructor() {
    this.coreServices = new CoreServices(config.get('authorize'));
    this.twtConnect = new TwtConnect(config.get('twitter_api'));
  }

  async checkUserNameAvailability(req, res, next) {
    try {
      const {value, error} = validate.validateUser(req.query);
      // if (error) return res.json({ code: 401, message: "validation failed", data: null, error: error.details[0].message })
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let response = await unauthorizedLibs.checkUserNameAvailability(
        req.query.username
      );
      response
        ? ErrorResponse(res, 'User has already registered!')
        : SuccessResponse(res, null, 'Username not yet registered.!');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async checkEmailAvailability(req, res, next) {
    try {
      const {value, error} = validate.validateEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let response = await unauthorizedLibs.checkEmailAvailability(
        req.query.email
      );
      response
        ? ErrorResponse(res, 'Email has already registered!')
        : SuccessResponse(res, null, 'Email not yet registered.');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async register(req, res, next) {
    try {
      const {value, error} = validate.validateRegister(req.body);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let response = await unauthorizedLibs.isUserRegister(
        req.body.username,
        req.body.email
      );
      if (response)
        return ErrorResponse(
          res,
          'User has already registered with same username or email'
        );

      let responseData = await unauthorizedLibs.registerUser(req.body);

      if (responseData) {
        let responseData = await unauthorizedLibs.checkUserDetails(
          req.body.email
        );
        // Set Details in aMember as well
        /**
         * userName
          password
          firstName
          lastName
          email
         */
        let aMemberData = {
          userName: responseData?.userName,
          password: responseData?.password,
          firstName: responseData?.first_name,
          lastName: responseData?.last_name,
          email: responseData?.email,
        };
        new aMember(config.get('aMember')).addUserToAMember(aMemberData);

        let planDetails = await unauthorizedLibs.getPlanDetails(
          responseData.Activations.user_plan
        );
        let mailDetails = await unauthorizedLibs.sendMail(
          responseData,
          planDetails.plan_name
        );

        if (mailDetails)
          return SuccessResponse(
            res,
            null,
            'User registered Please activate email'
          );

        return ErrorResponse(res);
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const {value, error} = validate.validateVerifyEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let response = await unauthorizedLibs.checkUserDetails(req.query.email);
      if (!response) return ErrorResponse(res, 'Email not yet registered.');

      if (response.Activations.signup_type != 0) return SuccessResponse(res);
      if (response.Activations.activation_status === 1)
        return ErrorResponse(res, 'Mail is already activated!.');

      if (
        response.Activations.email_validate_token === req.query.activationToken
      ) {
        let fetchedUserId = response.user_id;
        let expireDate = response.Activations.email_token_expire;
        let newExpireDate = moment().add(1, 'days');
        //let newEmailVerificationToken = this.coreServices.getGuid();

        if (moment(expireDate).isBefore(moment.utc())) {
          let newExpireDate = moment().add(1, 'days');
          let newEmailVerificationToken = uuidv1();
          let updateToken = await unauthorizedLibs.updateToken(
            newEmailVerificationToken,
            newExpireDate,
            response.Activations.id
          );
          let responseData = await unauthorizedLibs.checkUserDetails(
            req.query.email
          );
          let planDetails = await unauthorizedLibs.getPlanDetails(
            responseData.Activations.user_plan
          );
          let mailDetails = await unauthorizedLibs.sendMail(
            responseData,
            planDetails.plan_name
          );
          if (mailDetails)
            return ErrorResponse(
              res,
              'Token expired, please check your email for new token!'
            );
        } else {
          let userVerified = await unauthorizedLibs.userVerified(
            response.user_activation_id
          );
          //if (userVerified) return res.redirect("http://local.socioboard.com/verifyEmails")
          if (userVerified) return SuccessResponse(res);
        }
      } else {
        return ErrorResponse(res, 'Invalid verification token!');
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async login(req, res, next) {
    try {
      const {value, error} = validate.validateLoginCreds(req.body);
      // if (error) return res.json({ code: 401, message: "validation failed", data: null, error: error.details[0].message })
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (!req.body.email && !req.body.username)
        return ValidateErrorResponse(
          res,
          'Username or Email and password Required!.'
        );
      let userDetails = await unauthorizedLibs.getUserDetails(
        req.body.email,
        req.body.username,
        req.body.password
      );
      if (!userDetails) return ErrorResponse(res, 'Wrong creds!');
      if (userDetails.is_account_locked)
        return ErrorResponse(res, 'Account has been locked.');
      if (!userDetails.Activations.activation_status)
        return ErrorResponse(res, 'Email not yet validated.!');

      // Call aMember to set new details of plan and expiry date
      // userId, userName & password
      await new aMember(config.get('aMember')).getUserPlanDetail(
        userDetails?.user_id,
        userDetails?.user_name
      );
      let remindingDays = moment(
        userDetails.Activations.account_expire_date
      ).diff(moment(), 'days');
      if (remindingDays < 0) {
        //code for change plan and lock social accounts
      }
      let userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.user_id,
        userDetails.Activations.id
      );
      if (userInfo) return SuccessResponse(res, userInfo, 'success');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const {value, error} = validate.validateEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let user = await unauthorizedLibs.userDetailsForForgotPassword(
        req.query.email
      );
      if (!user) return ErrorResponse(res, 'Sorry! Email not registered.');
      let newExpireDate = moment().add(1, 'days');
      let newForgotVerificationToken = uuidv1();
      let update = await unauthorizedLibs.updateForgotVerificationToken(
        user.user_activation_id,
        newExpireDate,
        newForgotVerificationToken
      );
      let userDetails =
        await unauthorizedLibs.getUserDetailswithIdForgetPassword(user.user_id);
      let mailDetails = await unauthorizedLibs.sendForgotPasswordMail(
        userDetails
      );
      if (mailDetails)
        return SuccessResponse(
          res,
          null,
          'Success! Please check your email for reset your password'
        );
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async directLoginMail(req, res, next) {
    try {
      const {value, error} = validate.validateEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let user = await unauthorizedLibs.userDetailsForDirectLogin(
        req.query.email
      );
      if (!user) return ErrorResponse(res, 'Sorry! Email not registered.');

      let newExpireDate = moment().add(1, 'days');
      let newDirectLoginToken = uuidv1();
      let update = await unauthorizedLibs.updateDirectLoginToken(
        user.user_activation_id,
        newExpireDate,
        newDirectLoginToken
      );
      let userDetails = await unauthorizedLibs.getUserDetailswithDirectLogin(
        user.user_id
      );
      let mailDetails = await unauthorizedLibs.sendDirectLoginMail(userDetails);
      if (mailDetails)
        return SuccessResponse(
          res,
          null,
          'Success! Please check your email for direct Login'
        );
      return ErrorResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async verifyPasswordToken(req, res, next) {
    try {
      const {value, error} = validate.validateVerifyEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let user = await unauthorizedLibs.userDetailsForForgotPassword(
        req.query.email
      );
      if (!user) return ErrorResponse(res, 'Email not yet registered.');
      if (
        user.Activations.forgot_password_validate_token ===
        req.query.activationToken
      ) {
        var expireDate = user.Activations.email_token_expire;
        if (moment(expireDate).isBefore(moment.utc())) {
          let newExpireDate = moment().add(1, 'days');
          let newForgotVerificationToken = uuidv1();
          let update = await unauthorizedLibs.updateForgotVerificationToken(
            user.user_activation_id,
            newExpireDate,
            newForgotVerificationToken
          );
          let userDetails =
            await unauthorizedLibs.getUserDetailswithIdForgetPassword(
              user.user_id
            );
          let mailDetails = await unauthorizedLibs.sendForgotPasswordMail(
            userDetails
          );
          if (mailDetails)
            return ErrorResponse(
              res,
              'Token expired, please check your email for new token!'
            );
        }
        return SuccessResponse(res);
      } else {
        return ErrorResponse(res, 'Invalid verification token!');
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async verifyDirectLoginToken(req, res, next) {
    try {
      const {value, error} = validate.validateVerifyEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let user = await unauthorizedLibs.userDetailsForDirectLogin(
        req.query.email
      );
      if (!user) return ErrorResponse(res, 'Email not yet registered.');

      if (
        user.Activations.direct_login_validate_token ===
        req.query.activationToken
      ) {
        var expireDate = user.Activations.direct_login_token_expire;
        if (moment(expireDate).isBefore(moment.utc())) {
          let newExpireDate = moment().add(1, 'days');
          let newDirectLoginToken = uuidv1();
          let update = await unauthorizedLibs.updateDirectLoginToken(
            user.user_activation_id,
            newExpireDate,
            newDirectLoginToken
          );
          let userDetails =
            await unauthorizedLibs.getUserDetailswithDirectLogin(user.user_id);
          let mailDetails = await unauthorizedLibs.sendDirectLoginMail(
            userDetails
          );
          if (mailDetails)
            return ErrorResponse(
              res,
              'Token expired, please check your email for new token!'
            );
        }
        return SuccessResponse(res);
      } else {
        return ErrorResponse(res, 'Invalid verification token!');
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const {value, error} = validate.validateResetPassword(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let response = await unauthorizedLibs.checkEmailAvailability(
        req.query.email
      );
      if (!response) return ErrorResponse(res, 'Sorry! Email not registered.');

      let result = await unauthorizedLibs.updatePassword(
        response.user_id,
        req.query.newPassword
      );
      if (result) return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async directLogin(req, res, next) {
    try {
      const {value, error} = validate.validateDirectLogin(req.body);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let userDetails = await unauthorizedLibs.getUserDetails(req.body.email);
      if (!userDetails) return ErrorResponse(res, 'Wrong creds!');
      if (userDetails.is_account_locked)
        return ErrorResponse(res, 'Account has been locked.');

      //if (!userDetails.Activations.activation_status) return responseformat(res, 400, null, "Email not yet validated.!", null)
      let remindingDays = moment(
        userDetails.Activations.account_expire_date
      ).diff(moment(), 'days');
      if (remindingDays < 0) {
        //code for change plan and lock social accounts
      }
      let userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.user_id,
        userDetails.Activations.id
      );
      if (userInfo) return SuccessResponse(res, userInfo);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async socialLogin(req, res, next) {
    try {
      const {value, error} = validate.validateNetwork(req.query);
      if (error)
        return ValidateErrorResponse(
          res,
          error.details[0].message,
          401,
          null,
          'Please choose the valid network'
        );
      let network = req.query.network;
      let redirectUrl = '';
      if (network == 'Facebook') {
        redirectUrl = `https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=${encodeURIComponent(
          config.get('facebook_api.redirect_url')
        )}&client_id=${config.get('facebook_api.app_id')}&scope=${config.get(
          'facebook_api.login_scopes'
        )}`;
        return SocialCallbackResponse(
          res,
          redirectUrl,
          null,
          'Navigated to FaceBook'
        );
      } else if (network == 'Google') {
        redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
          config.get('google_api.redirect_url')
        )}&prompt=consent&response_type=code&client_id=${config.get(
          'google_api.client_id'
        )}&scope=${config.get('google_api.login_scopes')}&access_type=offline`;
        return SocialCallbackResponse(
          res,
          redirectUrl,
          null,
          'Navigated to Google'
        );
      } else if (network == 'GitHub') {
        redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.get(
          'github_api.client_id'
        )}&scope=user`;
        return SocialCallbackResponse(
          res,
          redirectUrl,
          null,
          'Navigated to  GitHub'
        );
      } else if (network == 'Twitter') {
        let twitter_response = await this.twtConnect.requestTokenLogin();
        let tokens = {
          requestToken: twitter_response.requestToken,
          requestSecret: twitter_response.requestSecret,
        };
        redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${tokens.requestToken}`;
        return SocialCallbackResponse(
          res,
          redirectUrl,
          tokens,
          'Navigated to Twitter'
        );
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async facebookCallback(req, res, next) {
    /* 	#swagger.tags = ['Open']
            #swagger.description = 'Facebook code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
              in: 'query',
              require:true
      } */
    let responseCode = req.query.code;
    if (responseCode) {
      let result;
      let response;
      let accessToken;
      try {
        result = await facebook.api('oauth/access_token', {
          client_id: process.env.FB_App_Id,
          client_secret: process.env.FB_Secret_key,
          redirect_uri: process.env.FB_Redirect_Url,
          code: responseCode,
        });
      } catch (error) {
        res
          .status(200)
          .json({code: 402, message: 'This authorization code has expired'});
      }

      try {
        accessToken = result.access_token;
        let url = `https://graph.facebook.com/${fbversion}/me?fields=id,name,email,birthday,first_name,last_name,friends&access_token=${accessToken}`;
        response = await axios.get(url);
      } catch (error) {
        res
          .status(200)
          .json({code: 403, message: 'Fail to fetch Facebook token'});
      }

      let data = await unauthorizedLibs.parseData(response.data, accessToken);

      let is_user_register = await unauthorizedLibs.getSocialAccDetail(
        data.user.email,
        data.user.username
      );

      if (is_user_register) {
        let userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );
        if (userInfo)
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
      }

      let userDetails = await unauthorizedLibs.registerSocialUser(data);
      //update the last login
      //get the accessToken :
      //res.status(200).send({ code: 200, user_details: userDetails })

      let userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );
      if (userInfo)
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
    } else {
      res.status(200).json({code: 401, message: 'Code is Invalid'});
    }
  }

  async googleCallback(req, res, next) {
    /* 	#swagger.tags = ['Open']
            #swagger.description = 'Google code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
              in: 'query',
              require:true
      } */
    let responseCode = req.query.code;
    if (responseCode) {
      let response;
      let user_details;

      try {
        let requestBody = `code=${responseCode}&redirect_uri=${process.env.Google_Redirect_Url}&client_id=${process.env.Google_App_Id}&client_secret=${process.env.Google_Secret}&scope=&grant_type=authorization_code`;
        let config = {
          method: 'post',
          url: 'https://oauth2.googleapis.com/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: requestBody,
        };

        response = await axios(config);
      } catch (error) {
        res
          .status(200)
          .json({code: 402, message: 'This authorization code has expired'});
      }

      let tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };

      let config_fetch = {
        method: 'get',
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };

      try {
        user_details = await axios(config_fetch);
      } catch (error) {
        res
          .status(200)
          .json({code: 404, message: 'Failed to fetch the User Deatils'});
      }

      let data = await unauthorizedLibs.parsedataGoogle(
        user_details.data,
        tokens
      );

      let is_user_register = await unauthorizedLibs.getSocialAccDetail(
        data.user.email,
        data.user.username
      );

      if (is_user_register) {
        let userInfo = await unauthorizedLibs.getUserAccessToken(
          is_user_register.user_id,
          is_user_register.Activations.id
        );
        if (userInfo)
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
      }

      let userDetails = await unauthorizedLibs.registerSocialUser(data);

      let userInfo = await unauthorizedLibs.getUserAccessToken(
        userDetails.userInfo.user.user_id,
        userDetails.userInfo.activations.id
      );
      if (userInfo)
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
    } else {
      res.status(200).send({code: 401, message: 'Invalid code '});
    }
  }

  async githubCallback(req, res, next) {
    /* 	#swagger.tags = ['Open']
            #swagger.description = 'GitHub code ' */
    /*   #swagger.security=AccessToken: [] */
    /*	#swagger.parameters['code'] = {
              in: 'query',
              require:true
      } */
    let rescode = req.query.code;
    let accessToken = '';

    const body = {
      client_id: process.env.GitHub_App_Id,
      client_secret: process.env.Github_Secret,
      code: rescode,
    };
    const opts = {headers: {accept: 'application/json'}};
    axios
      .post(`https://github.com/login/oauth/access_token`, body, opts)
      .then(res => res.data['access_token'])
      .then(async _token => {
        accessToken = _token;
        var config = {
          method: 'get',
          url: 'https://api.github.com/user',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${_token}`,
          },
        };

        let userData = await axios(config);

        let data = await unauthorizedLibs.parsedatagitHub(
          userData.data,
          accessToken
        );

        let is_user_register = await unauthorizedLibs.getSocialAccDetail(
          data.user.email,
          data.user.username
        );

        if (is_user_register) {
          let userInfo = await unauthorizedLibs.getUserAccessToken(
            is_user_register.user_id,
            is_user_register.Activations.id
          );
          if (userInfo)
            return res
              .status(200)
              .json({code: 200, message: 'success', data: userInfo});
        }

        let userDetails = await unauthorizedLibs.registerSocialUser(data);

        let userInfo = await unauthorizedLibs.getUserAccessToken(
          userDetails.userInfo.user.user_id,
          userDetails.userInfo.activations.id
        );
        if (userInfo)
          return res
            .status(200)
            .json({code: 200, message: 'success', data: userInfo});
      })
      .catch(err => res.status(400).json({message: err.message}));
  }

  async twitterCallbackold(req, res, next) {
    /* 	#swagger.tags = ['Open']
            #swagger.description = 'GitHub code ' */
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

    let requestToken = req.query.requestToken;
    let requestSecret = req.query.requestSecret;
    let verifier = req.query.verifier;

    let UserData;

    let responseData = {};

    let twitterObject = new twitterApi({
      consumerKey: process.env.Twitter_App_Id,
      consumerSecret: process.env.Twitter_Secret,
      callback: process.env.Twitter_Redirect_url,
    });

    twitterObject.getAccessToken(
      requestToken,
      requestSecret,
      verifier,
      (error, accessToken, accessSecret) => {
        if (error)
          res
            .status(200)
            .send({code: 402, message: 'Error in getting the AccessToken'});
        else {
          var response = {
            accessToken: accessToken,
            accessSecret: accessSecret,
          };
          responseData = response;
          // res.status(200).send({ code: 200, message: "Success", token: response })
          twitterObject.verifyCredentials(
            response.accessToken,
            response.accessSecret,
            (error, UserDeatils) => {
              if (error)
                res.status(200).send({
                  code: 403,
                  message: 'Error in getting the User Details',
                });
              else {
                let parse_data = unauthorizedLibs.parseTwitter(
                  UserDeatils,
                  responseData
                );
                res.status(200).send({code: 200, User_Deatils: UserDeatils});
              }
            }
          );
        }
      }
    );
    // let data = await unauthorizedLibs.getTwitterAccessToken(requestToken, requestSecret, verifier)
    // return res.json({ data, code: 8888 })
    // // .then((response)=>{
    //     res.status(200).send({ code: 401, error: e })

    // })
    // .catch((e) => {
    //     res.status(200).send({ code: 401, error: e })

    // })

    // res.status(200).send({ code: 200, msgOut: "sss" })

    // twitterObject.getAccessToken(requestToken, requestSecret, verifier, (error, accessToken, accessSecret) => {
    //     if (error)
    //         res.status(200).send({ code: 402, message: "Error in getting the AccessToken" })
    //     else {
    //         var response = {
    //             accessToken: accessToken,
    //             accessSecret: accessSecret
    //         };
    //         responseData = response;
    //         // res.status(200).send({ code: 200, message: "Success", token: response })
    //         twitterObject.verifyCredentials(response.accessToken, response.accessSecret, (error, UserDeatils) => {
    //             if (error)
    //                 res.status(200).send({ code: 403, message: "Error in getting the User Details" })
    //             else {
    //                 UserData = UserDeatils;

    //             }
    //         })
    //     }
    // })

    // let parse_data = await unauthorizedLibs.parseTwitter(User_deatils, responseData);
    // let resp = await unauthorizedLibs.registerUser2(parse_data)
    //update the last login
    //get the accessToken :
  }
  async twitterCallback(req, res, next) {
    /* 	#swagger.tags = ['Open']
            #swagger.description = 'GitHub code ' */
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

    let requestToken = req.query.requestToken;
    let requestSecret = req.query.requestSecret;
    let verifier = req.query.verifier;

    let twitterdata = await unauthorizedLibs.getTwitterData(
      requestToken,
      requestSecret,
      verifier
    );
    let is_user_register = await unauthorizedLibs.getSocialAccDetail(
      twitterdata.user.email,
      twitterdata.user.username
    );

    if (is_user_register) {
      let userInfo = await unauthorizedLibs.getUserAccessToken(
        is_user_register.user_id,
        is_user_register.Activations.id
      );
      if (userInfo)
        return res
          .status(200)
          .json({code: 200, message: 'success', data: userInfo});
    }

    let userDetails = await unauthorizedLibs.registerSocialUser(twitterdata);

    let userInfo = await unauthorizedLibs.getUserAccessToken(
      userDetails.userInfo.user.user_id,
      userDetails.userInfo.activations.id
    );
    if (userInfo)
      return res
        .status(200)
        .json({code: 200, message: 'success', data: userInfo});
    // twitterdata ? res.status(200).send({ code: 200, User_Deatils: twitterdata }) : res.status(200).send({ code: 400, Message: "Error in Fetching the Twitter Deatils" })
    //  if (twitterdata) res.status(200).send({ code: 200, User_Deatils: twitterdata })
  }

  async updatePasswordVerificationToken(
    newExpireDate,
    newPasswordVerificationToken,
    user_id
  ) {
    let response = await userActivation.update(
      {
        forgot_password_validate_token: newPasswordVerificationToken,
        forgot_password_token_expire: newExpireDate,
      },
      {where: {id: user.user_activation_id}}
    );
    return response;
  }

  async unHoldUser(req, res, next) {
    try {
      const {value, error} = validate.validateEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let user = await unauthorizedLibs.checkUserDetails(req.query.email);
      if (!user.is_account_locked)
        return ErrorResponse(res, 'User already unlocked! Please login');
      if (!user) return ErrorResponse(res, 'Sorry! Email not registered.');

      let newExpireDate = moment().add(1, 'days');
      let newEmailVerificationToken = uuidv1();
      let updateToken = await unauthorizedLibs.updateToken(
        newEmailVerificationToken,
        newExpireDate,
        user.Activations.id
      );
      let responseData = await unauthorizedLibs.checkUserDetails(
        req.query.email
      );
      let mailDetails = await unauthorizedLibs.sendMailForUnhold(responseData);
      if (mailDetails)
        return SuccessResponse(
          res,
          null,
          'Mail sent to your email please activate'
        );
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async verifyUnHoldToken(req, res, next) {
    try {
      const {value, error} = validate.validateVerifyEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let response = await unauthorizedLibs.checkUserDetails(req.query.email);
      if (!response) return ErrorResponse(res, 'Email not yet registered.');

      if (response.Activations.signup_type != 0)
        return ErrorResponse(res, 'Mail is not manually registered.');

      if (!response.is_account_locked)
        return ErrorResponse(res, 'User already unlocked');
      if (
        response.Activations.email_validate_token === req.query.activationToken
      ) {
        let fetchedUserId = response.user_id;
        let expireDate = response.Activations.email_token_expire;
        let newExpireDate = moment().add(1, 'days');
        //let newEmailVerificationToken = this.coreServices.getGuid();
        if (moment(expireDate).isBefore(moment.utc())) {
          let newExpireDate = moment().add(1, 'days');
          let newEmailVerificationToken = uuidv1();
          let updateToken = await unauthorizedLibs.updateToken(
            newEmailVerificationToken,
            newExpireDate,
            response.Activations.id
          );
          let responseData = await unauthorizedLibs.checkUserDetails(
            req.query.email
          );
          let mailDetails = await unauthorizedLibs.sendMailForUnhold(
            responseData
          );
          if (mailDetails)
            return ErrorResponse(
              res,
              'Token expired, please check your email for new token!'
            );
        } else {
          let userVerified = await unauthorizedLibs.userUnholded(
            req.query.email
          );
          //if (userVerified) return res.redirect("http://local.socioboard.com/verifyEmails")
          if (userVerified)
            return SuccessResponse(
              res,
              null,
              'User Unlocked please login with credentials'
            );
        }
      } else {
        return ErrorResponse(res, 'Invalid verification token!');
      }
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getActivationLink(req, res, next) {
    try {
      const {value, error} = validate.validateEmail(req.query);
      if (error) return ValidateErrorResponse(res, error.details[0].message);

      let response = await unauthorizedLibs.checkUserDetails(req.query.email);
      if (!response) return ErrorResponse(res, 'Email not yet registered.');

      // let { Activations } = JSON.parse(response)
      if (response.Activations.signup_type != 0)
        return ErrorResponse(res, 'Mail is not manually registered.');
      if (response.Activations.activation_status === 1)
        return ErrorResponse(res, 'Mail is already activated!.');

      let newExpireDate = moment().add(1, 'days');
      let newEmailVerificationToken = uuidv1();
      let updateToken = await unauthorizedLibs.updateToken(
        newEmailVerificationToken,
        newExpireDate,
        response.Activations.id
      );
      let responseData = await unauthorizedLibs.checkUserDetails(
        req.query.email
      );
      let planDetails = await unauthorizedLibs.getPlanDetails(
        responseData.Activations.user_plan
      );
      let mailDetails = await unauthorizedLibs.sendMail(
        responseData,
        planDetails.plan_name
      );
      if (mailDetails)
        return SuccessResponse(res, null, 'Mail sent,Please activate email');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getPlanDetails(req, res, next) {
    try {
      let response = await unauthorizedLibs.getFullPlanDetails();
      response
        ? SuccessResponse(res, response, 'success')
        : ErrorResponse(res, 'Error in fetching PlanDetails');
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  // logout() { }
}
export default new unauthorizedController();
