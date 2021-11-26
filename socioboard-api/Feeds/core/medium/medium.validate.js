import Joi from 'joi';
import MEDIUM_CONSTANTS from '../../../Common/Constants/medium.constants.js';

const mediumTagSchema = Joi.string().min(1).max(25).required();

const mediumPostSchema = Joi.object({
  title: Joi.string().min(1).required(),
  contentFormat: Joi.string().valid(...MEDIUM_CONSTANTS.CONTENT_FORMATS).required(),
  content: Joi.string().min(1).required(),
  tags: Joi.array().items(mediumTagSchema).optional(),
  canonicalUrl: Joi.string().min(1).max(500).optional(),
  publishStatus: Joi.string().valid(...MEDIUM_CONSTANTS.PUBLISH_STATUSES).default('public'),
  license: Joi.string().valid(...MEDIUM_CONSTANTS.PUBLICATION_LICENSES).default('all-rights-reserved'),
  notifyFollowers: Joi.boolean().optional(),
});

export const mediumBasicSchema = Joi.object({
  accountId: Joi.number().integer().min(1).required(),
  teamId: Joi.number().integer().min(1).required(),
});

export const mediumCreatePostSchema = mediumBasicSchema.keys({
  article: mediumPostSchema,
}).unknown();

export const mediumCreatePostUnderPublicationsSchema = mediumCreatePostSchema.keys({
  publicationId: Joi.string().min(1).max(200).required(),
}).unknown();

export const mediumGetPostsSchema = mediumBasicSchema.keys({
  limit: Joi.number().integer().min(1).max(25)
    .default(10),
  to: Joi.number().integer().min(1).optional(),
}).rename('cursor', 'to').required();
