import Joi from 'joi';

class SocialAccValidator {
  /**
   * TODO  validate User Data
   * This function is used for Validate User data
   * @param  {string} teamId -User team Id
   * @param  {string} network -network Id
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateNetwork(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      network: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateCode(data) {
    const JoiSchema = Joi.object({
      //  state: Joi.string().required(),
      code: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateDeleteAccId(data) {
    const JoiSchema = Joi.object({
      AccId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new SocialAccValidator();
