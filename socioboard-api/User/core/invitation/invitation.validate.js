import Joi from 'joi';

class InvitationValidator {
 
  /**
   * TODO to  validate TwitterData
   * This function to  validate TwitterData
   * @param {string} code - Twitter Auth code
   * @param {string} network - Twitter network 
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateTwitterData(data) {
    const JoiSchema = Joi.object({
      code: Joi.string().required(),
      requestToken: Joi.string().required(),
     }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new InvitationValidator();
