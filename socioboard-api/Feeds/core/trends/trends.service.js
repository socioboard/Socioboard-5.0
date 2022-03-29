// import FeedsLibs from '../../../Common/Models/feeds.model.js'
import config from 'config';
import fs from 'fs';
import TrendsServices from '../../../Common/Cluster/trends.cluster.js';
import TwitterHelper from '../../../Common/Cluster/twitter.cluster.js';
import TrendsValidate from './trends.validate.js';
import Logger from '../../resources/log/logger.log.js';

import {
  ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
// const feedsLibs = new FeedsLibs()
class TrendsService {
  constructor() {
    this.trendsServices = new TrendsServices();
    this.twitterHelper = new TwitterHelper(config.get('twitter_api'));
  }

  async getGiphy(req, res, next) {
    try {
      // add validation part
      const {
        keyword, pageId, rating, type,
      } = req.query;

      const response = await this.trendsServices.fetchGiphy(config.get('content_studio.giphy'), keyword, pageId, rating, type);
      // if (response.batchId) {

      if (!fs.existsSync(config.get('content_studio.giphy.path'))) {
        fs.mkdirSync(config.get('content_studio.giphy.path'));
      }
      // logger.info(`Giphy Response : ${response.giphyDetails}`);
      // return this.makeDownloadSchedule("giphy", response.batchId)
      //     .then(() => {
      //         resolve(response.giphyDetails);
      //     })
      //     .catch((error) => { throw error; });
      // } else
      SuccessResponse(res, response.giphyDetails);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getImgur(req, res, next) {
    try {
      // validation
      const { keyword, pageId, sortBy } = req.query;

      const response = await this.trendsServices.fetchImgur(config.get('content_studio.imgur'), keyword, pageId, sortBy);

      SuccessResponse(res, response.imgurDetails);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getFlickr(req, res, next) {
    try {
      const { keyword, pageId, sortBy } = req.query;

      const response = await this.trendsServices.fetchFlickr(config.get('content_studio.flickr'), keyword, pageId, sortBy);

      SuccessResponse(res, response.flickrDetails);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getDailyMotion(req, res, next) {
    try {
      const { keyword, pageId, sortBy } = req.query;

      const response = await this.trendsServices.fetchDailyMotion(config.get('content_studio.daily_motion'), keyword, pageId, sortBy);

      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getNewsAPI(req, res, next) {
    try {
      const {
        keyword, pageId, sortBy, category,
      } = req.query;

      const response = await this.trendsServices.fetchNewsApi(config.get('content_studio.newsapi'), keyword, pageId, sortBy, category);

      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getPixabay(req, res, next) {
    try {
      const {
        keyword, pageId, sortBy, category,
      } = req.query;
      const response = await this.trendsServices.fetchPixabay(config.get('content_studio.pixabay'), keyword, pageId, sortBy, category);

      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getYoutube(req, res, next) {
    try {
      const { keyword, pageId, sortBy,ccode } = req.query;
      const { value, error } = TrendsValidate.validateYoutube({ keyword, pageId, sortBy,ccode });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await this.trendsServices.fetchYoutube(config.get('content_studio.youtube'), pageId, keyword, sortBy,ccode);

      SuccessResponse(res, response);
    } catch (error) {
      Logger.error(`Error in Fetching the Youtube Deatils ${error} `);

      return CatchResponse(res, `${error}`);
    }
  }

  async getTwitter(req, res, next) {
    try {
      const { keyword, max_id, since_id } = req.query;
      const { value, error } = TrendsValidate.validateTwitter({ keyword });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const raw_tweets = await this.twitterHelper.fetchTweetsKeywords(config.get('twitter_data'), keyword, max_id, since_id);
      const response = await this.twitterHelper.parseTweetDetailsForKeyword(raw_tweets);

      SuccessResponse(res, response);
    } catch (error) {
      return CatchResponse(res, error.message);
    }
  }
}
export default new TrendsService();
