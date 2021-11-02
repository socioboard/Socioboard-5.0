import Joi from 'joi';
import BITLY_CONSTANTS from '../../Constants/bitly.constants.js';

export const demoBitlyOAuthAuthorizeSchema = Joi.object({
  client_id: Joi.string().valid(BITLY_CONSTANTS.CLIENT_ID).required(),
  redirect_uri: Joi.string().valid(BITLY_CONSTANTS.REDIRECT_URI).required(),
}).unknown();

export const demoBitlyCallback = Joi.object({
  code: Joi.string().valid(BITLY_CONSTANTS.ACCOUNT_DETAILS.CODE).required(),
}).unknown();

export const demoBitlyGetGroupLinks = Joi.object({
  group_guid: Joi.string().valid(
    BITLY_CONSTANTS.GROUP_GUID_VALID,
    BITLY_CONSTANTS.GROUP_GUID_FORBIDDEN,
  ).required(),
});

export const demoBitlyAccessToken = Joi.object({
  client_id: Joi.string().valid(BITLY_CONSTANTS.CLIENT_ID).required(),
  client_secret: Joi.string().valid(BITLY_CONSTANTS.CLIENT_SECRET).required(),
  code: Joi.string().valid(BITLY_CONSTANTS.ACCOUNT_DETAILS.CODE).required(),
  redirect_uri: Joi.string().valid(BITLY_CONSTANTS.REDIRECT_URI).required(),
}).unknown();

export const demoCheckAuthToken = Joi.string().valid(BITLY_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN);
