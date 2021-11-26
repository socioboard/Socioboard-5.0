import config from 'config';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import _ from 'underscore';
import csv from 'csvtojson';
import moment from 'moment';
import TrendsServices from '../../../Common/Cluster/trends.cluster.js';
import validate from './rss-feeds.validate.js';
import { SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js';
import RssSearchedUrls from '../../../Common/Mongoose/models/rss-searched-urls.js';
import FeedModel from '../../../Common/Models/feeds.model.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
import RSS_FEEDS_CONSTANTS from './rss-feeds.constants.js';
import rssChannelLinksModel from '../../../Common/Mongoose/models/rss-channel-links.js';

const feedModel = new FeedModel();

class RssFeedsService {
  constructor() {
    this.trendsServices = new TrendsServices();
  }

  async initUploadFolder(uploadFolderPath) {
    fs.mkdirSync(uploadFolderPath, { recursive: true });
  }

  deleteFile(path) {
    if (!path) {
      return;
    }

    fs.unlinkSync(path);
  }

  getFileExtension(fileName) {
    const separatedFileName = fileName.split('.');

    return _.last(separatedFileName);
  }

  async getRssFeeds(req, res, next) {
    try {
      const { rssUrl } = req.query;
      const { value, error } = validate.RssUrl({ rssUrl });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const data = await this.trendsServices.fetchRssFeedsNew(rssUrl);
      const insertData = await feedModel.addRssSearchUrls(req.body.userScopeId, rssUrl);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getRecentRssUrl(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.getPreviousPost(req.body.userScopeId, 0, config.get('rssUrl.max_history'));

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getBookMarkedRssUrl(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.getBookMarkedPost(req.body.userScopeId);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async bookmarkUrl(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.bookmarkUrl(req.body.userScopeId, req.query.id, req.query.bookmark);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async updateRssUrls(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.updateRssUrls(req.body.userScopeId, req.query.id, req.body);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async deleteRssUrls(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.deleteRssUrls(req.body.userScopeId, req.query.id);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async clearRssUrls(req, res, next) {
    try {
      const rssSearchedUrls = new RssSearchedUrls();
      const data = await rssSearchedUrls.clearRssUrls(req.body.userScopeId);

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async parseLink(link) {
    const { data } = await axios(link);

    const $ = cheerio.load(data);

    const channelTitle = $('title').text();

    const channelIcon = this.getChannelIconUrl($, link);

    const links = this.parsePageMiddleware($, link);

    return {
      title: channelTitle,
      logo_url: channelIcon,
      links,
    };
  }

  async filterLink({ url, category }) {
    const response = await axios(url);

    return {
      response,
      category,
    };
  }

  getChannels(args) {
    return feedModel.getChannels(args);
  }

  getChannelById(args) {
    return feedModel.getChannelById(args);
  }

  getChannelByTitle(userId, title) {
    return feedModel.getChannelByTitle(userId, title);
  }

  getManyChannelsByIds(userId, ids) {
    return feedModel.getManyChannelsByIds(userId, ids);
  }

  getManyLinksByIds(channelId, ids) {
    return feedModel.getManyLinksByIds(channelId, ids);
  }

  getManyLinksByLinks(channelId, links) {
    return feedModel.getManyLinksByLinks(channelId, links);
  }

  async createChannel(userId, channelInfo) {
    const trx = await db.sequelize.transaction();

    try {
      const { links } = channelInfo;

      const channel = await feedModel.createChannel(userId, channelInfo, trx);

      const createdLinks = await feedModel.createLinks(channel.id, links, trx);

      await trx.commit();

      return { ...channel.dataValues, links: createdLinks };
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async deleteManyChannels(userId, ids) {
    const trx = await db.sequelize.transaction();

    try {
      const deletedChannels = await feedModel.deleteManyChannels(userId, ids, trx);

      await trx.commit();

      return deletedChannels;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async deleteManyLinks(ids) {
    const trx = await db.sequelize.transaction();

    try {
      const deletedLinks = await feedModel.deleteManyLinks(ids, trx);

      await trx.commit();

      return deletedLinks;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async updateChannel(channelId, channel) {
    const trx = await db.sequelize.transaction();

    try {
      await feedModel.updateChannel(channelId, channel, trx);

      await this.updateManyLinks(channel);

      await trx.commit();

      return true;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async updateManyLinks({ links }) {
    const trx = await db.sequelize.transaction();

    try {
      for (const link of links) {
        await feedModel.updateLink(link, trx);
      }

      await trx.commit();

      return true;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async createLinks(channelId, links) {
    const trx = await db.sequelize.transaction();

    try {
      await feedModel.createLinks(channelId, links, trx);

      await trx.commit();

      return true;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  importChannelsMiddleware(fileExtension, path) {
    switch (fileExtension) {
      case 'csv':
        return this.importCsvFile(path);
      default:
        throw new Error(RSS_FEEDS_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_EXTENSION);
    }
  }

  importCsvFile(path) {
    return csv().fromFile(path);
  }

  async createManyChannels(userId, channels) {
    const trx = await db.sequelize.transaction();

    try {
      const result = [];

      for (const channel of channels) {
        const createdChannel = await this.createChannel(userId, channel);

        result.push(createdChannel);
      }

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  mergeChannels(channels) {
    const arr = {};

    const usedChannels = new Set();

    channels.forEach(({
      title, logo_url, url, category,
    }) => {
      if (usedChannels.has(title)) {
        return arr[title].links.push({
          url, category,
        });
      }

      arr[title] = {
        title,
        logo_url,
        links: [{
          url,
          category,
        }],
      };

      usedChannels.add(title);
    });

    return Object.values(arr);
  }

  parsePageMiddleware($, link) {
    switch (link) {
      case RSS_FEEDS_CONSTANTS.DOMAINS.TIMES_OF_INDIA:
        return this.parseTimesOfIndiaPage($);
      case RSS_FEEDS_CONSTANTS.DOMAINS.ARCHIVE_NYTIMES:
        return this.parseArchiveNYTimesPage($);
      default:
        return this.parseCommonPages($);
    }
  }

  parseArchiveNYTimesPage($) {
    const links = [];

    $('a').each((_, value) => {
      const regExp = new RegExp(/[.](xml|rss|cms)$/, 'gm');

      const url = $(value).attr('href') || '';
      const text = $(value).text();

      const category = text.replace(/[\t\n\s]+[\s+$]/g, '');

      if (url.match(regExp)) {
        links.push({ url, category });
      }
    });

    return links;
  }

  parseTimesOfIndiaPage($) {
    const links = [];

    $('p table tbody tr').each((_, value) => {
      const category = $(value).find('td:eq(0)').text();
      const url = $(value).find('td:eq(1) span a').attr('href');

      links.push({ url, category });
    });

    return links;
  }

  parseCommonPages($) {
    const links = [];

    $('a, link').each((_, value) => {
      const regExp = new RegExp(/[.](xml|rss|cms)$/, 'gm');

      const url = $(value).attr('href') || '';
      const type = $(value).attr('type') || '';

      if (url.match(regExp) || type === 'application/rss+xml') {
        links.push({ url, category: null });
      }
    });

    return links;
  }

  getChannelIconUrl($, link) {
    const iconUrl = $('link[rel*=icon]').attr('href');

    const _url = link.substr(-1) === '/' && iconUrl[0] === '/' ? link.substr(0, link.length - 1) : link;

    if (!iconUrl) {
      return null;
    }

    if (!this.isUrl(iconUrl)) {
      return `${_url}${iconUrl}`;
    }

    return iconUrl;
  }

  isUrl(url) {
    try {
      const checkedUrl = new URL(url);

      if (checkedUrl.protocol !== 'http:' && checkedUrl.protocol !== 'https:') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async filterRssLinks(links) {
    const result = [];

    const queries = await Promise.allSettled(links.map((link) => this.filterLink(link)));

    for (const { status, value } of queries) {
      if (status === 'rejected') continue;

      const $ = cheerio.load(value.response.data);

      if ($('rss').length) {
        result.push({ url: value.response.config.url, category: value.category });
      }
    }

    return result;
  }

  async backupManyLinks(links) {
    const urls = new Set(links.map(({ url }) => url));

    const searchDate = moment().subtract(
      RSS_FEEDS_CONSTANTS.BACKUP_CONFIGS.AMOUNT,
      RSS_FEEDS_CONSTANTS.BACKUP_CONFIGS.UNIT,
    ).utc().format(RSS_FEEDS_CONSTANTS.BACKUP_CONFIGS.DATE_FORMAT);

    const foundLinks = await rssChannelLinksModel.getBackupLinksByUrlsFromDate(
      [...urls], searchDate,
    );

    const foundUrls = foundLinks.map(({ url }) => url);

    return Promise.allSettled([...urls].map((url) => {
      if (!foundUrls.includes(url)) {
        return this.createBackupLink(url, searchDate);
      }

      return url;
    }));
  }

  async getBackupLinksByChannelId({ links, ...args }) {
    const urls = new Set(links.map(({ url }) => url));

    return rssChannelLinksModel.getBackupLinksByUrls({
      urls: [...urls],
      ...args,
    });
  }

  async getLinkBackups({ url, ...args }) {
    return rssChannelLinksModel.getBackupLinksByUrls({
      urls: [url],
      ...args,
    });
  }

  getBackupLinkById(linkId) {
    return rssChannelLinksModel.getBackupLinkById(linkId);
  }

  async createBackupLink(url) {
    try {
      const { data: content } = await axios(url);

      const snapshotDate = moment().utc().format(RSS_FEEDS_CONSTANTS.BACKUP_CONFIGS.DATE_FORMAT);

      const backup = await rssChannelLinksModel.createBackupLink({ url, content, snapshotDate });

      return backup.url;
    } catch (error) {
      const errorCode = error.code;

      if (errorCode === RSS_FEEDS_CONSTANTS.STATUS_CODE.DUPLICATE_LINKS) {
        return url;
      }

      throw error;
    }
  }
}
export default new RssFeedsService();
