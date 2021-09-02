import Joi from 'joi';

class FeedsValidator {
  /**
   * TODO Validate AccountId,TeamId and PageId
   * This function is used for Validate AccountId,TeamId and PageId
   * @param  {string} accountId -Account Id
   * @param  {string} teamId -User team Id
   * @param  {string} pageId -Page Id
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateAccountIdTeamId(user) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(user);
  }

   /**
   * TODO Validate AccountId,TeamId 
   * This function is used for Validate AccountId,TeamId and PageId
   * @param  {string} accountId -Account Id
   * @param  {string} teamId -User team Id
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateAccountIdsTeamId(user) {
    const JoiSchema = Joi.object({
      accountIds: Joi.array().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });
    return JoiSchema.validate(user);
  }
}
export default new FeedsValidator();
