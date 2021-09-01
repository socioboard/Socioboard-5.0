import {
  CatchResponse,
  ErrorResponse,
  SuccessResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import config from 'config';
import validate from './otp-verification.validator.js';
import OtpVerificationLibs from '../../../Common/Models/otp-verification.model.js';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
const unauthorizedLibs = new UnauthorizedLibs();

class OtpVerificationController {
  constructor() {
    this.otpVerificationLibs = new OtpVerificationLibs(config.get('twilio'));
  }
  /**
   * TODO To Fetch the User Plan  Details
   * @name get/get-plan-details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Plan Details
   */
  async getOtpPhoneNumber(req, res, next) {
    try {
      const {countryCode, phoneNumber} = req.query;
      const {error} = validate.validatePhoneNumberWithCountryCode({
        countryCode,
        phoneNumber,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let result;
      const response = await unauthorizedLibs.checkPhoneNumberAvailability(
        phoneNumber
      );
      response
        ? ErrorResponse(res, 'Phone number already registered.')
        : (result = await this.otpVerificationLibs.getOtpPhoneNumber(
            countryCode,
            phoneNumber
          ));
      SuccessResponse(res, result);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To Fetch the User Plan  Details
   * @name get/get-plan-details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Plan Details
   */
  async getOtpPhoneNumberVerify(req, res, next) {
    try {
      const {countryCode, phoneNumber, otp} = req.query;
      const {value, error} = validate.validateVerifyPhoneNumberCode({
        countryCode,
        phoneNumber,
        otp,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let result = await this.otpVerificationLibs.getOtpPhoneNumberVerify(
        countryCode,
        phoneNumber,
        otp
      );
      SuccessResponse(res, result);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To Fetch the User Plan  Details
   * @name get/get-plan-details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Plan Details
   */
  async getOtpEmail(req, res, next) {
    try {
      const {email} = req.query;
      const {value, error} = validate.validateEmail({email});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let result = await this.otpVerificationLibs.getOtpEmail(email);
      SuccessResponse(res, result);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To Fetch the User Plan  Details
   * @name get/get-plan-details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @return {object} Returns User Plan Details
   */
  async getOtpEmailVerify(req, res, next) {
    try {
      const {email, otp} = req.query;
      const {value, error} = validate.validateVerifyEmail({email, otp});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      let result = await this.otpVerificationLibs.getOtpEmailVerify(email, otp);
      SuccessResponse(res, result);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }
}
export default new OtpVerificationController();
