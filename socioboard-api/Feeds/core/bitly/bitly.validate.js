import Joi from 'joi';

export const bitlyBasicSchema = Joi.object({
  accountId: Joi.number().integer().min(1).required(),
  teamId: Joi.number().integer().min(1).required(),
});

export const getPlatformLimitsSchema = bitlyBasicSchema.keys({
  path: Joi.string().min(1).optional(),
});

export const shortenLinkSchema = bitlyBasicSchema.keys({
  long_url: Joi.string().uri().min(1).required(),
}).unknown();

export const getLinksByGroupSchema = bitlyBasicSchema.keys({
  group_guid: Joi.string().min(1).required(),
  size: Joi.number().integer().min(1).default(50),
  page: Joi.number().integer().min(1).max(100)
    .default(50),
  archived: Joi.string().valid('off', 'on', 'both').default('off'),
});

export const archiveLinkSchema = bitlyBasicSchema.keys({
  bitlink: Joi.string().min(1).max(100).required(),
});
