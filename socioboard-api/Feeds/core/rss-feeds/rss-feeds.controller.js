import { CatchResponse, ErrorResponse, SuccessResponse } from '../../../Common/Shared/response.shared.js';
import RssService from './rss-feeds.service.js';
import rssValidator from './rss-feeds.validate.js';
import RSS_FEEDS_CONSTANTS from './rss-feeds.constants.js';

class RssController {
  async getRssFeeds(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'To request for rss feeds ' */
    /*	#swagger.parameters['rssUrl'] = {
                in: 'query',
                description: 'Rss Feed Url',
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getRssFeeds(req, res, next);
  }

  async getRecentRssUrl(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'To get recently searched rss feeds' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getRecentRssUrl(req, res, next);
  }

  async getBookMarkedRssUrl(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'To get bookmarked rss urls' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.getBookMarkedRssUrl(req, res, next);
  }

  async bookmarkUrl(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'book mark a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               }
               #swagger.parameters['bookmark'] = {
                in: 'query',
                description: 'bookmark',
                default: 'true',
               enum: ["true","false"]
               } */
    return await RssService.bookmarkUrl(req, res, next);
  }

  async updateRssUrls(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'update details book mark a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               }
            #swagger.parameters['data'] = {
                in: 'body',
                description: 'Searched rss url',
                schema: { $ref: "#/definitions/serchedRssUrls" }
                    } */
    return await RssService.updateRssUrls(req, res, next);
  }

  async deleteRssUrls(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'To delete a rss url' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['id'] = {
               in: 'query',
               description: '_id',
               } */
    return await RssService.deleteRssUrls(req, res, next);
  }

  async clearRssUrls(req, res, next) {
    /* 	#swagger.tags = ['RSS Feeds']
            #swagger.description = 'To clear all searches from a user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await RssService.clearRssUrls(req, res, next);
  }

  async parseLink(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get all RSS links from a website'
    */
    /*	#swagger.parameters['link'] = {
        in: 'query',
        description: 'link',
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const { link } = await rssValidator.parseLink(req.query);

      const parsedChannel = await RssService.parseLink(link);

      const filteredLinks = await RssService.filterRssLinks(parsedChannel.links);

      SuccessResponse(res, { ...parsedChannel, links: filteredLinks });
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getAllChannels(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get all available channels'
    */
    /* #swagger.parameters['page'] = {
        in: 'query',
        description: 'Specifies the page of results to retrieve. Default value 0',
       }
       #swagger.parameters['limit'] = {
        in: 'query',
        description: 'The number of channels.
                      This value has a maximum of 20. Default value 10.',
       }
       #swagger.parameters['size'] = {
        in: 'query',
        description: 'The number of links in the channel.
                      This value has a maximum of 10. Default value 5.',
       }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const validatedQuery = await rssValidator.validateGetAllChannels(20)(req.query);

      const { userScopeId: userId } = req.body;

      const channels = await RssService.getChannels({ userId, ...validatedQuery });

      SuccessResponse(res, channels);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getChannel(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get the channel by id'
    */
    /* #swagger.parameters['page'] = {
        in: 'query',
        description: 'Specifies the page of results to retrieve. Default value 0',
       }
       #swagger.parameters['limit'] = {
        in: 'query',
        description: 'The number of links in the channel.
                      This value has a maximum of 20. Default value 10.',
       }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const [channelId, validatedQuery] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.validatePagination(20)(req.query),
      ]);

      const { userScopeId: userId } = req.body;

      const foundChannel = await RssService.getChannelById({
        userId, channelId, ...validatedQuery,
      });

      if (!foundChannel) {
        return CatchResponse(res, null, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_NOT_FOUND, 404);
      }

      return SuccessResponse(res, foundChannel);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async createChannel(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Create RSS Channel with links'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'link',
        schema: {
          title: 'string',
          logo_url: 'string',
          links: [
            {
              url: 'http://rss',
              category: 'News'
            }
          ],
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const validatedBody = await rssValidator.createChannel(req.body);

      const { userScopeId, links, title } = validatedBody;

      const foundChannel = await RssService.getChannelByTitle(userScopeId, title);

      if (foundChannel) {
        return CatchResponse(
          res,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_ALREADY_EXIST,
          null,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST,
        );
      }

      const validatedRssLinks = await RssService.filterRssLinks(links);

      if (validatedRssLinks.length !== links.length) {
        return CatchResponse(
          res,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS,
          null,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST,
        );
      }

      const createdChannel = await RssService.createChannel(userScopeId, validatedBody);

      return SuccessResponse(res, createdChannel);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async deleteManyChannels(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Delete many channels'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'link',
        schema: {
          channelsIds: [
            1, 2, 3
          ]
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const { channelsIds, userScopeId } = await rssValidator.deleteManyChannels(req.body);

      const foundChannels = await RssService.getManyChannelsByIds(userScopeId, channelsIds);

      if (foundChannels.length !== channelsIds.length) {
        return CatchResponse(res, null, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_NOT_FOUND, 404);
      }

      const deletedChannels = await RssService.deleteManyChannels(userScopeId, channelsIds);

      return SuccessResponse(res, deletedChannels);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async deleteManyLinks(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Delete many links in the channel'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'link',
        schema: {
          linksIds: [
            1, 2, 3
          ]
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const [channelId, validatedBody] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.deleteManyLinks(req.body),
      ]);

      const { linksIds, userScopeId: userId } = validatedBody;

      const channel = await RssService.getChannelById({ userId, channelId });

      if (!channel) {
        return CatchResponse(
          res,
          null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.USER_DONT_HAVE_ACCESS_TO_THE_CHANNEL,
        );
      }

      const foundLinks = await RssService.getManyLinksByIds(channelId, linksIds);

      if (foundLinks.length !== linksIds.length) {
        return CatchResponse(res, null, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS_IDS, 404);
      }

      const deletedLinks = await RssService.deleteManyLinks(linksIds);

      return SuccessResponse(res, deletedLinks);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async updateChannel(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Update a channel by id'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'Channel object',
        schema: {
          channel: {
            title: 'optional',
            logo_url: 'optional',
            links: [
              {
                'id': 1,
                'url': 'optional',
                'category': 'optional',
              },
              {
                'id': 2,
                'url': 'optional',
                'category': 'optional',
              },
            ],
          }
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const [channelId, validatedChannel] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.updateChannel(req.body.channel),
      ]);

      const { userScopeId: userId } = req.body;

      const channel = await RssService.getChannelById({ userId, channelId });

      if (!channel) {
        return ErrorResponse(
          res,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.USER_DONT_HAVE_ACCESS_TO_THE_CHANNEL,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.FORBIDDEN,
        );
      }

      const linksIds = validatedChannel.links.map(({ id }) => id);

      const getLinks = await RssService.getManyLinksByIds(channelId, linksIds);

      if (getLinks.length !== linksIds.length) {
        return CatchResponse(res, null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS_IDS,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const linkUrls = validatedChannel.links.filter(({ url }) => url);

      const validatedRssLinks = await RssService.filterRssLinks(linkUrls);

      if (validatedRssLinks.length !== linkUrls.length) {
        return CatchResponse(
          res,
          null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST,
        );
      }

      await RssService.updateChannel(channelId, validatedChannel);

      const updatedChannel = await RssService.getChannelById({ userId, channelId });

      return SuccessResponse(res, updatedChannel);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async createLink(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Create links in a channel'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'Channel object',
        schema: {
          links: [
            {
              'url': 'required',
              'category': 'optional',
            },
            {
              'url': 'required',
              'category': 'optional',
            },
          ],
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const [channelId, validatedLinks] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.createLinks(req.body.links),
      ]);

      const { userScopeId: userId } = req.body;

      const channel = await RssService.getChannelById({ userId, channelId });

      if (!channel) {
        return ErrorResponse(
          res,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.USER_DONT_HAVE_ACCESS_TO_THE_CHANNEL,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.FORBIDDEN,
        );
      }

      const linkUrls = validatedLinks.filter(({ url }) => url);

      const validatedRssLinks = await RssService.filterRssLinks(linkUrls);

      if (validatedRssLinks.length !== linkUrls.length) {
        return CatchResponse(
          res,
          null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST,
        );
      }

      const uniqueUrls = new Set();

      linkUrls.map(({ url }) => uniqueUrls.add(url));

      if (uniqueUrls.size !== linkUrls.length) {
        return ErrorResponse(res, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.DUPLICATE_LINKS);
      }

      const similarLinks = channel.links.filter(
        ({ dataValues: { url } }) => linkUrls.some(({ url: link }) => url === link),
      );

      if (similarLinks.length) {
        return ErrorResponse(
          res,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.LINKS_ALREADY_EXIST_IN_THE_CHANNEL,
        );
      }

      await RssService.createLinks(channelId, validatedLinks);

      const updatedChannel = await RssService.getChannelById({ userId, channelId });

      return SuccessResponse(res, updatedChannel);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async importChannels(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Import channels from the file.',
        #swagger.description = 'Support extensions: csv.
                                The file size must be specified in the configs: rss_feeds.fileSize.
                                Default file size 5mb.'
    */
    /*	#swagger.parameters['data'] = {
        in: 'body',
        description: 'links',
        schema: {
          channelId: 1,
          file: "file",
        }
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    let commonFilePath = '';

    try {
      const { path, originalname } = req.file;

      commonFilePath = path;

      const { userScopeId: userId } = req.userScope;

      const { channelId } = await rssValidator.getChannel(req.body);

      const channel = await RssService.getChannelById({ userId, channelId });

      if (!channel) {
        RssService.deleteFile(path);

        return CatchResponse(res, null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.USER_DONT_HAVE_ACCESS_TO_THE_CHANNEL,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.FORBIDDEN);
      }

      const fileExtension = RssService.getFileExtension(originalname);

      const dataFromFile = await RssService.importChannelsMiddleware(fileExtension, path);

      const validatedFileData = await rssValidator.validateFileData(dataFromFile);

      const checkedLinks = await RssService.filterRssLinks(validatedFileData);

      if (checkedLinks.length !== validatedFileData.length) {
        RssService.deleteFile(path);

        return CatchResponse(res, null,
          RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS,
          RSS_FEEDS_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const mergedChannels = RssService.mergeChannels(validatedFileData);

      const createdChannels = await RssService.createManyChannels(userId, mergedChannels);

      RssService.deleteFile(path);

      return SuccessResponse(res, createdChannels);
    } catch (error) {
      RssService.deleteFile(commonFilePath);

      return CatchResponse(res, error.message);
    }
  }

  async getBackupChannel(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get a channel backup with links.',
    */
    /* #swagger.parameters['page'] = {
        in: 'query',
        description: 'Specifies the page of results to retrieve. Default value 0',
       }
       #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Number of channels returned per page.
                      This value has a maximum of 20. Default value 10.',
       }
       #swagger.parameters['size'] = {
        in: 'query',
        description: 'Number of returned links in the channel.
                      This value has a maximum of 10. Default value 5.',
       }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */
    try {
      const [channelId, validatedQuery] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.validateGetArchiveLinks(20)(req.query),
      ]);

      const { userScopeId: userId } = req.body;

      const foundChannel = await RssService.getChannelById({
        userId, channelId, ...validatedQuery,
      });

      if (!foundChannel) {
        return CatchResponse(res, null, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_NOT_FOUND, 404);
      }

      const channel = {
        title: foundChannel.title,
        logo_url: foundChannel.logo_url,
      };

      const links = await RssService.getBackupLinksByChannelId({
        links: foundChannel.links,
        limit: validatedQuery.size,
      });

      return SuccessResponse(res, { ...channel, links });
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getLinkBackupHistory(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get link backup history'
    */
    /* #swagger.parameters['page'] = {
        in: 'query',
        description: 'Specifies the page of results to retrieve. Default value 0',
       }
       #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Number of backups per page.
                      This value has a maximum of 30. Default value 10.',
       }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */
    try {
      const [channelId, linkId, validatedQuery] = await Promise.all([
        rssValidator.validateChannelId(req.params.channelId),
        rssValidator.validateChannelId(req.params.linkId),
        rssValidator.validatePagination(30)(req.query),
      ]);

      const { userScopeId: userId } = req.body;

      const foundChannel = await RssService.getChannelById({
        userId, channelId, limit: 1,
      });

      if (!foundChannel) {
        return CatchResponse(res, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_NOT_FOUND, null, 404);
      }

      const [link] = await RssService.getManyLinksByIds(channelId, [linkId]);

      if (!link) {
        return CatchResponse(res, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_LINKS_IDS, null, 400);
      }

      const [result] = await RssService.getLinkBackups({ url: link.url, ...validatedQuery });

      return SuccessResponse(res, result);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async getBackupLink(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Get backup link.',
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */
    try {
      const linkId = await rssValidator.isObjectId(req.params.linkId);

      const link = await RssService.getBackupLinkById(linkId);

      if (!link) {
        return ErrorResponse(res, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.ARCHIVE_LINK_NOT_FOUND);
      }

      return SuccessResponse(res, link.content);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }

  async backupChannel(req, res) {
    /* #swagger.tags = ['RSS Feeds']
        #swagger.summary = 'Make a backup of channel links.',
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */
    try {
      const channelId = await rssValidator.validateChannelId(req.params.channelId);

      const { userScopeId: userId } = req.body;

      const foundChannel = await RssService.getChannelById({ userId, channelId });

      if (!foundChannel) {
        return CatchResponse(res, null, RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.CHANNEL_NOT_FOUND, 404);
      }

      const backups = await RssService.backupManyLinks(foundChannel.links);

      return SuccessResponse(res, backups);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }
}

export default new RssController();
