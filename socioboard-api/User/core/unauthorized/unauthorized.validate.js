import Joi from 'joi';

class userValidator {
  // User-defined function to validate the username
  validateUser(user) {
    const JoiSchema = Joi.object({
      username: Joi.string().required(),
    }).options({abortEarly: false});

    return JoiSchema.validate(user);
  }

  validateNetwork(network) {
    const JoiSchema = Joi.object({
      network: Joi.string().required(),
    }).options({abortEarly: false});

    return JoiSchema.validate(network);
  }

  validateLoginCreds(creds) {
    const JoiSchema = Joi.object({
      password: Joi.string().required(),
      email: Joi.string().email(),
      username: Joi.string(),
    }).options({abortEarly: false});

    return JoiSchema.validate(creds);
  }

  validateDirectLogin(creds) {
    const JoiSchema = Joi.object({
      email: Joi.string().email().required(),
    }).options({abortEarly: false});

    return JoiSchema.validate(creds);
  }

  validateEmail(email) {
    const JoiSchema = Joi.object({
      email: Joi.string().email().required(),
    }).options({abortEarly: false});

    return JoiSchema.validate(email);
  }

  validateRegister(data) {
    const JoiSchema = Joi.object({
      username: Joi.string().required().alphanum(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().allow(),
      dateOfBirth: Joi.date(),
      profilePicture: Joi.string(),
      phoneCode: Joi.string().allow(''),
      phoneNo: Joi.string().allow(''),
      country: Joi.string().allow(''),
      rfd: Joi.string().default('').allow(null),
      kwd: Joi.string().default('').allow(null),
      med: Joi.string().default('').allow(null),
      src: Joi.string().default('').allow(null),
      aboutMe: Joi.string(),
      timeZone: Joi.string().allow(),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }

  validateVerifyEmail(data) {
    const JoiSchema = Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email required',
        'string.email': 'Email should be valid email address',
      }),
      activationToken: Joi.string().required().messages({
        'any.required': 'Activation token is required',
      }),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }

  validateResetPassword(data) {
    const JoiSchema = Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email required',
        'string.email': 'Email should be valid email address',
      }),
      newPassword: Joi.string().required().messages({
        'any.required': 'New password is required',
      }),
      activationToken: Joi.string().required().messages({
        'any.required': 'Activation token is required',
      }),
    }).options({abortEarly: false});

    return JoiSchema.validate(data);
  }
}

// const userValidators = new userValidator();
export default new userValidator();
