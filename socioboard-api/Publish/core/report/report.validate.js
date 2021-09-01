import Joi from 'joi';

class Validator {
  SchedulePublishedReport(data) {
    const JoiSchema = Joi.object({
      scheduleId: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  AccountPublishedReport(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  TodayPostedCount(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  XDayPublishCount(data) {
    const JoiSchema = Joi.object({
      dayCount: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new Validator();
