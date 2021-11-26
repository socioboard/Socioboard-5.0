import Joi from 'joi';

class Validator {
  getMediaDetails(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      privacy: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }

  /**
   * TODO Validate search user media details
   * This function is used search user media input validations
   * @param {Object} data - It will have multiple inputs
   * @param {Object} SocialImageInfo - It will have multiple inputs
   * @param {number} teamId - User team id
   * @param {number} filterPeriod - Date filter
   * @param {string} sortBy - Sort by
   * @param {number} pageId - Pagination id
   * @param {Date} since - Since date
   * @param {Date} until - End date
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  searchMediaDetails(data) {
    const JoiSchema = Joi.object({
      SocialImageInfo: Joi.object(),
      SocialImageInfo: Joi.object({
        rating: Joi.array().allow('').items('1', '2', '3', '4', '5').messages({
          'array.includes': 'Rating should be 1 to 5',
        }),
        imagePrivacyType: Joi.array().allow('').items('0', '1').messages({
          'array.includes': 'Image privacy should be 0 or 1',
        }),
        imageTitle: Joi.string().allow(''),
      }),
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id required'}),
      filterPeriod: Joi.number()
        .integer()
        .min(1)
        .max(7)
        .allow()
        .allow(null)
        .default(null)
        .messages({
          'number.min': 'Filtration id must be greater than or equal to 1',
          'number.max': 'Filtration id must be less than or equal to 7',
        }),
      sortBy: Joi.string().valid('desc', 'asc').required().messages({
        'any.only': 'Sort by must be one of [desc, asc]',
      }),
      pageId: Joi.number().integer().min(1).required().messages({
        'any.required': 'Pagination id required',
        'number.min': 'Pagination id must be greater than or equal to 1',
      }),
      since: Joi.when('filterPeriod', {
        is: Joi.number().valid(7),
        then: Joi.date().required(),
        otherwise: Joi.allow(''),
      }).messages({
        'any.required': 'Since date required for custom filtration',
        'date.base': 'Since date format should be YYYY-MM-DD',
      }),
      until: Joi.when('filterPeriod', {
        is: Joi.number().valid(7),
        then: Joi.date().required(),
        otherwise: Joi.allow(''),
      }).messages({
        'date.base': 'Until date format should be YYYY-MM-DD',
        'any.required': 'Until date required for custom filtration',
      }),
    }).options({abortEarly: false});
    return JoiSchema.validate(data);
  }

  /**
   * TODO Validate update user media details
   * This function is used update user media input validations
   * @param {Object} data - It will have multiple inputs
   * @param {number} teamId - User team id
   * @param {number} mediaId - Media Id
   * @param {string} title - Title of media file
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  updateMediaDetails(data) {
    const JoiSchema = Joi.object({
      rating: Joi.number().integer().allow('').min(1).max(7).messages({
        'number.min': 'Rating must be greater than or equal to 1',
        'number.max': 'Rating must be less than or equal to 5',
      }),
      mediaId: Joi.string().required().messages({
        'any.required': 'Media Id required',
      }),
      title: Joi.string(),
    }).options({abortEarly: false});
    return JoiSchema.validate(data);
  }
}

export default new Validator();
