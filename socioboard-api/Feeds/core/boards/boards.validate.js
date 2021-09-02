import Joi from 'joi';

class Boardsvalidator {
  validateCreate(data) {
    const JoiSchema = Joi.object({
      boardName: Joi.string().required(),
      Keyword: Joi.string().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateTeam(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateUpdate(data) {
    const JoiSchema = Joi.object({
      boardId: Joi.string().required(),
      Keyword: Joi.string().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateDelete(data) {
    const JoiSchema = Joi.object({
      boardId: Joi.string().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}
export default new Boardsvalidator();
