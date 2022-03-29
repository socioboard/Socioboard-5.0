import Joi from 'joi';

class TrendValidator {
  validateYoutube(data) {
    const JoiSchema = Joi.object({
      keyword: Joi.string().required(),
      pageId: Joi.string().required(),
      sortBy: Joi.string().required(),
      ccode:Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateTwitter(data) {
    const JoiSchema = Joi.object({
      keyword: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}
export default new TrendValidator();
