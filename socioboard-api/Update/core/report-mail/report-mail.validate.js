import Joi from 'joi';

/**
 * ReportMailValidate class
 * Base class for auto mails routes input validation
 */
class ReportMailValidate {
  /**
     * TODO Validate auto report mail inputs
     * This function is used for auto report mail input validations
     * @param {string} reportTitle - Title for the report
     * @param {number} testMail - Test mail status 0-Testmail, 1-Create schedule
     * @param {number} frequency - Account id
     * @param {number} report - Report type 0-All,1-pdf,2-csv
     * @param {object} autoReport - Auto Report selections
     * @return {boolean} Returns the inputs are valid or not based on rules
     */
  validAutoReport(data) {
    const JoiSchema = Joi.object({
      reportTitle: Joi.string().required().messages({ 'any.required': 'Report title required' }),
      testMail: Joi.string().valid('0', '1').required().messages({
        'any.only': 'Test mail status must be one of [0-Testmail, 1-Create schedule]',
      }),
      frequency: Joi.number().required().min(0).max(2)
        .messages({ 'any.required': 'Frequency required', 'number.min': 'Frequency should be 0, 1 or 2', 'number.max': 'Frequency should be 0, 1 or 2' }),
      report: Joi.number().required().min(0).max(2)
        .messages({ 'any.required': 'Report type required', 'number.min': 'Report should be 0, 1 or 2', 'number.max': 'Report should be 0, 1 or 2' }),
      autoReport: Joi.object().required(),
      autoReport: Joi.object({
        teamReport: Joi.array().allow(''),
        twitterReport: Joi.array().allow(''),
        facebookPageReport: Joi.array().allow(''),
        youTube: Joi.array().allow(''),
        email: Joi.array().required().min(1).items(Joi.string().email())
          .messages({ 'any.required': 'Recipients email required', 'array.min': 'At least one recipients required', 'string.email': 'Recipients email should be valid email address' }),
      }),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}
export default new ReportMailValidate();
