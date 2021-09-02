import OtpVerificationService from './otp-verification.service.js';

class OtpVerificationController {

    /**
     * TODO To get OTP for phone number
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @return {object} Returns OTP sent status
     */
    async getOtpPhoneNumber(req, res, next) {
        /* 	#swagger.tags = ['OTP-Verification']
            #swagger.description = 'Get otp for phone number' */
        /*	#swagger.parameters['countryCode'] = {
                    in: 'query',
                    description: 'Country code +91'
                    }
            #swagger.parameters['phoneNumber'] = {
                    in: 'query',
                    description: 'Enter phone number'
                    } */
        return await OtpVerificationService.getOtpPhoneNumber(req, res);
    }


    /**
     * TODO To verify OTP for phone number
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @return {object} Returns OTP verify status
     */
    async getOtpPhoneNumberVerify(req, res, next) {
        /* 	#swagger.tags = ['OTP-Verification']
            #swagger.description = 'To verify otp for phone number' */
        /*	#swagger.parameters['countryCode'] = {
                    in: 'query',
                    description: 'Country code +91'
                    }
            #swagger.parameters['phoneNumber'] = {
                    in: 'query',
                    description: 'Enter phone number',
                    required: false
                    }
            #swagger.parameters['otp'] = {
                    in: 'query',
                    description: 'Enter otp'
                    } */
        return await OtpVerificationService.getOtpPhoneNumberVerify(req, res);
    }
    /**
    * TODO To get OTP for email 
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @return {object} Returns OTP sent status
    */
    async getOtpEmail(req, res, next) {
        /* 	#swagger.tags = ['OTP-Verification']
            #swagger.description = 'Get otp for email' */
        /*	#swagger.parameters['email'] = {
                    in: 'query',
                    description: 'Enter email'
                    } */
        return await OtpVerificationService.getOtpEmail(req, res);
    }


    /**
     * TODO To verify OTP for email
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @return {object} Returns OTP verify status
     */
    async getOtpEmailVerify(req, res, next) {
        /* 	#swagger.tags = ['OTP-Verification']
            #swagger.description = 'To verify email otp' */
        /*	#swagger.parameters['email'] = {
                    in: 'query',
                    description: 'Enter email'
                    }
            #swagger.parameters['otp'] = {
                    in: 'query',
                    description: 'Enter otp'
                    } */
        return await OtpVerificationService.getOtpEmailVerify(req, res);
    }
}

export default new OtpVerificationController();

