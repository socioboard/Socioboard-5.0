import Joi from 'joi'

class Validator {

    /**
    * TODO Validate user notification details
    * This function is used for validate user notification details
    * @param  {number} userId -User Id
    * @param  {number} pageId -Page Id for pagination
    * @return {boolean} Returns the inputs are valid or not based on rules
    */
    userNotification(data) {
        const JoiSchema = Joi.object({
            userId: Joi.string().required().messages({ 'any.required': "User id required" }),
            pageId: Joi.string().required().messages({ 'any.required': "Pagination required" }),
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }

    /**
    * TODO Validate team notification details
    * This function is used for validate team notification details
    * @param  {number} teamId -User team Id
    * @param  {number} pageId -Page Id for pagination
    * @return {boolean} Returns the inputs are valid or not based on rules
    */
    teamNotification(data) {
        const JoiSchema = Joi.object({
            teamId: Joi.string().required().messages({ 'any.required': "Team id required" }),
            pageId: Joi.string().required().messages({ 'any.required': "Pagination required" }),
        }).options({ abortEarly: false });
        return JoiSchema.validate(data)
    }

}
export default new Validator