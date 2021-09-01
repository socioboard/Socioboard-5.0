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
      accountId: Joi.string()
        .required()
        .messages({'any.required': 'Account id is required'}),
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id is required'}),
      pageId: Joi.string()
        .required()
        .messages({'any.required': 'Page id is required'}),
    }).options({abortEarly: false});

    return JoiSchema.validate(user);
  }

  /**
   * TODO Validate Follower And Page Stats
   * This function is used for Validate Follower And Page Stats
   * @param  {string} accountId -Account Id
   * @param  {string} teamId -User team Id
   * @param  {string} filterPeriod -Filter Period like
   * @param  {string} since: Start date
   * @param  {string} until: End date,
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateStats(user) {
    const JoiSchema = Joi.object({
      accountId: Joi.string()
        .required()
        .messages({'any.required': 'Account id is required'}),
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id is required'}),
      filterPeriod: Joi.string()
        .required()
        .messages({'any.required': 'Page id is required'}),
      since: Joi.string(),
      until: Joi.string(),
    }).options({abortEarly: false});

    return JoiSchema.validate(user);
  }
}
export default new FeedsValidator();
