import Joi from 'joi';

class CallbackValidator {
  validateCode(code) {
    const JoiSchema = Joi.object({
      code: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(code);
  }

  validateTwitterData(data) {
    const JoiSchema = Joi.object({
      requestToken: Joi.string().required(),
      requestSecret: Joi.string().required(),
      verifier: Joi.string().required(),

    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new CallbackValidator();
