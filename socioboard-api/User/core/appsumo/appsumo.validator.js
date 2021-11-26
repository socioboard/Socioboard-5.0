import Joi from 'joi';
class AppSumoValidator {
  async validateCredential(data) {
    const JoiSchema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }).options({abortEarly: false});
    return JoiSchema.validate(data);
  }
  async validateNotification(data) {
    const JoiSchema = Joi.object({
      action: Joi.string().required(),
      plan_id: Joi.string().required(),
      uuid: Joi.string().required(),
      activation_email: Joi.string().required(),
      invoice_item_uuid: Joi.string(),
    }).options({abortEarly: false});
    return JoiSchema.validate(data);
  }
}
export default new AppSumoValidator();
