import Joi from 'joi';
import mongodb from 'mongodb';
import RSS_FEEDS_CONSTANST from './rss-feeds.constants.js';

const { ObjectId } = mongodb;

class RssFeedsValidator {
  url = Joi.string().min(1).max(256).uri();
  id = Joi.number().min(1).required();
  link = Joi.object({
    url: this.url.required(),
    category: Joi.any().default(null).optional(),
  });

  validateChannelId(data) {
    const channelIdSchema = Joi.number().integer().min(1).required();

    return channelIdSchema.validateAsync(data);
  }

  // User-defined function to validate the username
  RssUrl(user) {
    const JoiSchema = Joi.object({
      rssUrl: Joi.string().required().uri(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(user);
  }

  parseLink(data) {
    const JoiSchema = Joi.object({
      link: this.url.required(),
    });

    return JoiSchema.validateAsync(data);
  }

  getChannel(data) {
    const JoiSchema = Joi.object({
      channelId: Joi.number().min(1).required(),
    });

    return JoiSchema.validateAsync(data);
  }

  createChannel(data) {
    const JoiSchema = Joi.object({
      title: Joi.string().min(1).max(256).required(),
      logo_url: Joi.string().min(1).max(256).uri().empty(['', null]).default(null).optional(),
      links: Joi.array().items(this.link).required(),
    }).unknown();

    return JoiSchema.validateAsync(data);
  }

  deleteManyChannels(data) {
    const JoiSchema = Joi.object({
      channelsIds: Joi.array().items(this.id).required(),
    }).unknown();

    return JoiSchema.validateAsync(data);
  }

  deleteManyLinks(data) {
    const JoiSchema = Joi.object({
      linksIds: Joi.array().items(this.id).required(),
    }).unknown();

    return JoiSchema.validateAsync(data);
  }

  updateChannel(data) {
    const linkSchema = Joi.object({
      id: Joi.number().min(1).required(),
      url: this.url.optional(),
      category: Joi.string().min(1).max(256).optional(),
    });

    const JoiSchema = Joi.object({
      title: Joi.string().min(1).max(256).optional(),
      logo_url: Joi.string().min(1).max(256).uri().empty(['', null]).optional(),
      links: Joi.array().items(linkSchema).default([]).optional(),
    }).required();

    return JoiSchema.validateAsync(data);
  }

  updateManyLinks(data) {
    const updateLinksItem = Joi.object({
      id: Joi.number().min(1).required(),
      category: Joi.string().min(1).max(256).optional(),
    });

    const JoiSchema = Joi.object({
      links: Joi.array().items(updateLinksItem).default([]).optional(),
    }).unknown();

    return JoiSchema.validateAsync(data);
  }

  createLinks(data) {
    const JoiSchema = Joi.array().items(this.link).default([]).required();

    return JoiSchema.validateAsync(data);
  }
  
  validateFileData(data) {
    const importDataItem = Joi.object({
      title: Joi.string().min(1).max(256).required(),
      logo_url: Joi.string().min(1).max(256).uri().empty(['', null]).default(null).optional(),
      url: Joi.string().min(1).max(256).required(),
      category: Joi.string().min(1).max(256).empty(['', null]).default(null).optional(),
    });

    const JoiSchema = Joi.array().items(importDataItem).required();

    return JoiSchema.validateAsync(data);
  }

  async isObjectId(data) {
    const isObjectIdSchema = Joi.string().min(1).max(24).required();

    const validatedData = await isObjectIdSchema.validateAsync(data);

    if (!ObjectId.isValid(validatedData)) {
      throw new Error(RSS_FEEDS_CONSTANST.ERROR_MESSAGES.INVALID_BACKUP_LINK_ID);
    }

    return validatedData;
  }

  paginationSchema = (limit) => Joi.object({
    skip: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1).max(limit).default(10),
  }).rename('page', 'skip');

  validateGetAllChannels(limit) {
    return (data) => {
      const getAllChannelsSchema = this.paginationSchema(limit).keys({
        size: Joi.number().integer().min(1).max(10).default(5),
      });

      return getAllChannelsSchema.validateAsync(data);
    }
  }

  validateGetArchiveLinks(limit) {
    return (data) => {
      const getArchiveLinksSchema = this.paginationSchema(limit).keys({
        size: Joi.number().integer().min(1).max(10).default(5),
      });

      return getArchiveLinksSchema.validateAsync(data);
    }
  }

  validatePagination = (limit) => (data) => {
    return this.paginationSchema(limit).validateAsync(data);
  }
}

export default new RssFeedsValidator();
