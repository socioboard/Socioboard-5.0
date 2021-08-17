import Joi from 'joi'

class Validator {

    getMediaDetails(data) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required(),
            privacy: Joi.string().required(),
            pageId: Joi.string().required()
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }

}

export default new Validator