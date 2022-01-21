import Joi from 'joi';

/**
 * YouTueUploadValidator class
 * Base class for youTube upload routes input validation
 */
class YouTubeUploadValidator {
  /**
   * TODO Validate youTube upload details
   * This function is used for the youTube upload input validations
   * @param {Object} data - It will have multiple inputs
   * @param {number} teamId - Team id
   * @param {number} accountId - Account id
   * @param {object} postDetails - Video details
   * @param {array} mediaUrls - Media ulr that will upload to youTube
   * @param {number} postType - Post type 0 for upload 1 for draft
   * @param {object} resource - Resource details for video
   * @param {object} snippet - Snippet details for video
   * @param {string} title - Title for the uploading video
   * @param {string} description - Description for the uploading video
   * @param {array} tags - Tags for the uploading video
   * @param {object} status - Status details for video
   * @param {string} privacyStatus - PrivacyStatus of uploading video
   * @param {date} publishAt - Publish time if privacy status is public
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateUploadVideo(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id required to upload'}),
      accountId: Joi.string()
        .required()
        .messages({'any.required': 'Select account id for upload'}),
      postDetails: Joi.object().required(),
      postDetails: Joi.object({
        mediaUrls: Joi.array().min(1).required().messages({
          'any.required': 'Media required to upload',
          'array.min': 'Media required to upload',
        }),
        thumbnailUrl: Joi.string(),
        postType: Joi.number().min(0).max(1).required().messages({
          'any.required': 'Post type required to upload',
          'number.min': 'Post type should be 0 or 1',
          'number.max': 'Post type should be 0 or 1',
        }),
        resource: Joi.object()
          .required()
          .messages({'any.required': 'Video resource details required'}),
        resource: Joi.object({
          snippet: Joi.object({
            title: Joi.string().required().messages({
              'any.required': 'Title for the video is required',
              'string.empty': 'Title not allowed to be empty',
            }),
            description: Joi.string().allow(''),
            tags: Joi.array()
              .min(1)
              .messages({'array.min': 'At least one tag required'}),
            categoryId: Joi.allow(''),
            defaultLanguage: Joi.string().allow(''),
            defaultAudioLanguage: Joi.string().allow(''),
          }),
          status: Joi.object().allow(''),
          status: Joi.object({
            privacyStatus: Joi.string()
              .valid('private', 'public')
              .required()
              .messages({
                'any.only': 'Privacy status must be one of [private, public]',
              }),
            publishAt: Joi.when('privacyStatus', {
              is: Joi.string().valid('public'),
              then: Joi.valid(null),
              otherwise: Joi.allow(''),
            }).messages({
              'any.only':
                'Privacy status must be private for schedule date and time to make video public',
            }),
          }),
        }),
      }),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }

  /**
   * TODO Validate youTube uploaded details
   * This function is used for Validate youTube uploaded details
   * @param {Object} data - It will have multiple inputs
   * @param  {string} teamId -User team Id
   * @param  {string} accountId -Account Id
   * @param  {number} postType -Post Type 0-published,1-draft,2-both
   * @param  {number} pageId -Page Id for pagination
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateUploadVideoDetails(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id required'}),
      accountId: Joi.string()
        .required()
        .messages({'any.required': 'Account id required'}),
      pageId: Joi.string()
        .required()
        .messages({'any.required': 'Page Id id required'}),
      postType: Joi.number().required().min(0).max(2).messages({
        'any.required': 'Post type id required',
        'number.min': 'Post type should be 0, 1 or 2',
        'number.max': 'Post type should be 0, 1 or 2',
      }),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }
  /**
   * TODO Validate youTube uploaded details
   * This function is used for Validate youTube uploaded details
   * @param {Object} data - It will have multiple inputs
   * @param  {string} teamId -User team Id
   * @param  {string} accountId -Account Id
   * @param  {number} postType -Post Type 0-published,1-draft,2-both
   * @param  {number} pageId -Page Id for pagination
   * @return {boolean} Returns the inputs are valid or not based on rules
   */
  validateTeamUploadVideoDetails(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string()
        .required()
        .messages({'any.required': 'Team id required'}),
      pageId: Joi.string()
        .required()
        .messages({'any.required': 'Page Id id required'}),
      postType: Joi.number().required().min(0).max(2).messages({
        'any.required': 'Post type id required',
        'number.min': 'Post type should be 0, 1 or 2',
        'number.max': 'Post type should be 0, 1 or 2',
      }),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }
}
export default new YouTubeUploadValidator();
