import Joi from 'joi';

class RecentVistedValidator {
  validateNetwork(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      network: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new RecentVistedValidator();
