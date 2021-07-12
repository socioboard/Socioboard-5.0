import Joi from 'joi'

class FeedsValidator {

    //User-defined function to validate the username 
    validateAccountIdTeamId(user) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required(),
            accountId: Joi.string().required(),
            pageId: Joi.string().required()
        }).options({ abortEarly: false });
        return JoiSchema.validate(user)
    }

    validateAccountIdTweetId(data) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required(),
            accountId: Joi.string().required(),
            tweetId: Joi.string().required()
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }

    validateCommentData(data) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required(),
            accountId: Joi.string().required(),
            tweetId: Joi.string().required(),
            comment: Joi.string().required(),
            username: Joi.string().required()
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }

    validateFetchTweet(data) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required(),
            accountId: Joi.string().required(),
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }
}
export default new FeedsValidator