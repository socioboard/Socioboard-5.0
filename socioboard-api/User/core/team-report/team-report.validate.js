import Joi from 'joi';

class Validator {
  validatePassword(data) {
    const JoiSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateUser(data) {
    const JoiSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    }).options({ abortEarly: false });

    //     "firstName": "socio",
    // "lastName": "board",
    // "dateOfBirth": "1997-09-07",
    // "profilePicture": "https://www.socioboard.com/contents/socioboard/images/Socioboard.png",
    // "phoneCode": "+91",
    // "phoneNo": "1324575248",
    // "country": "India",
    // "timeZone": "+5:30",
    // "aboutMe": "A business person",

    return JoiSchema.validate(data);
  }
}

export default new Validator();
