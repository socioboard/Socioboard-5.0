import Joi from 'joi';

class Networkvalidator {
  validateTeam(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      filterPeriod: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateTwtInsight(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
      filterPeriod: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}
export default new Networkvalidator();
