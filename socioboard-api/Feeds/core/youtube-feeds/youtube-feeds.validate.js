import Joi from 'joi';

class FeedsValidator {
  // User-defined function to validate the username
  validateAccountIdTeamId(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateLikePost(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      videoId: Joi.string().required(),
      rating: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateComment(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      videoId: Joi.string().required(),
      comment: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateReplayComment(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      videoId: Joi.string().required(),
      comment: Joi.string().required(),
      commentId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}
export default new FeedsValidator();
