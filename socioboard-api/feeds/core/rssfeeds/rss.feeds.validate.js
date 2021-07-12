import Joi from 'joi'
import { url } from 'node:inspector';

class RssFeedsValidator {

    //User-defined function to validate the username 
    RssUrl(user) {
        const JoiSchema = Joi.object({
            rssUrl: Joi.string().required().uri()
        }).options({ abortEarly: false });
        return JoiSchema.validate(user)
    }

}
export default new RssFeedsValidator