import config from 'config';
import TrendsServices from '../../../Common/Cluster/trends.cluster.js';
import validate from './rss-feeds.validate.js';
import { SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js';
import RssSearchedUrls from '../../../Common/Mongoose/models/rss-searched-urls.js';
import FeedModel from '../../../Common/Models/feeds.model.js';

const feedModel = new FeedModel();

class RssFeedsService {
  constructor() {
    this.trendsServices = new TrendsServices();
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
}
export default new RssFeedsService();
