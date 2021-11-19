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
/**
  * TODO  validate Invitation Data
  * This function is used for Validate Invitation data
  * @param {string} network - name of network
  * @param {string} teamId - team Id
  * @param {string} userName - User Name
  * @param {string} email - Email Name
  * @param {string} accName - Account Name
  * @return {boolean} Returns the inputs are valid or not based on rules
  */
     validateInvitation(data) {
       const JoiSchema = Joi.object({
       network: Joi.string().valid("Facebook","FacebookPage","Instagram","InstagramBusiness","LinkedIn","LinkedInPage","Twitter","Youtube").required().messages({
        'any.only': 'Social Media should be Facebook,FacebookPage,Instagram,InstagramBusiness,LinkedIn,LinkedInPage,Twitter,Youtube',
      }),
       teamId: Joi.string().required().messages({
      'string.empty': `Team Name cannot be an empty field`,
      'string.base' : `Team Name cannot be an empty field`
      }),
       userName: Joi.string().required().messages({
      'string.empty': `Username cannot be an empty field`,
      'string.base' : `Username cannot be an empty field`
      }),
       email: Joi.string().email().required().messages({
      'string.empty': `Email Id cannot be an empty field`,
      'string.email': `Email Id must be a valid email`,
      'string.base' : `Email Id cannot be an empty field`
      }),
      accName: Joi.string().required().messages({
      'string.empty': `Account Name cannot be an empty field`,
      'string.base' : `Account Name cannot be an empty field`
    }),
    }).options({ abortEarly: false });
       return JoiSchema.validate(data);
  }

  validateAddMediumProfile(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.number().min(1).required(),
    }).unknown();

    const extendSchema = JoiSchema.keys({
      accessToken: Joi.string().min(1).max(256).required(),
    });

    return extendSchema.validateAsync(data);
  }
}

export default new SocialAccValidator();
