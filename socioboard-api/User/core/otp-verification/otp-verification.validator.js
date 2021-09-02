import Joi from 'joi';

class OtpVerificationValidator {

    /**
     * TODO Validate phone number with country code
     * This function is used for validate phone number with country code
     * @param {Object} data - It will have multiple inputs
     * @param {number} countryCode - Country code
     * @param {number} phoneNumber - User phone number
     * @return {boolean} Returns the inputs are valid or not based on rules
     */
    validatePhoneNumberWithCountryCode(data) {
        const JoiSchema = Joi.object({
            countryCode: Joi.string().required().messages({ 'any.required': 'Country code required' }),
            phoneNumber: Joi.number().required().messages({ 'any.required': 'Phone number required' }),
        }).options({ abortEarly: false });
        return JoiSchema.validate(data);
    }

    /**
     * TODO Validate email address
     * This function is used for validate email address
     * @param {Object} data - It will have multiple inputs
     * @param {email} email - Email address
     * @return {boolean} Returns the inputs are valid or not based on rules
     */
    validateEmail(data) {
        const JoiSchema = Joi.object({
            email: Joi.string().required().email().messages({ 'any.required': 'Email address required', 'string.email': 'Email must be a valid email' }),
        }).options({ abortEarly: false });
        return JoiSchema.validate(data);
    }

    /**
     * TODO Validate phone number with country code and otp
     * This function is used for validate phone number with country code and otp
     * @param {Object} data - It will have multiple inputs
     * @param {number} countryCode - Country code
     * @param {number} phoneNumber - User phone number
     * @param {number} Otp - Otp number
     * @return {boolean} Returns the inputs are valid or not based on rules
     */
    validateVerifyPhoneNumberCode(data) {
        const JoiSchema = Joi.object({
            countryCode: Joi.string().required().messages({ 'any.required': 'Country code required' }),
            phoneNumber: Joi.number().required().messages({ 'any.required': 'Phone number required' }),
            otp: Joi.string().required().regex(/^[0-9]{6}$/).messages({ 'string.pattern.base': `OTP number must have 6 digits.`, 'any.required': 'OTP number required' })
        }).options({ abortEarly: false });
        return JoiSchema.validate(data);
    }

    /**
     * TODO Validate email address and otp
     * This function is used for validate email address and otp
     * @param {Object} data - It will have multiple inputs
     * @param {email} email - Email address
     * @param {number} Otp - Otp number
     * @return {boolean} Returns the inputs are valid or not based on rules
     */
    validateVerifyEmail(data) {
        const JoiSchema = Joi.object({
            email: Joi.string().required().email().messages({ 'any.required': 'Email address required', 'string.email': 'Email must be a valid email' }),
            otp: Joi.string().required().regex(/^[0-9]{6}$/).messages({ 'string.pattern.base': `OTP number must have 6 digits.`, 'any.required': 'OTP number required' })
        }).options({ abortEarly: false });
        return JoiSchema.validate(data);
    }
}

export default new OtpVerificationValidator();