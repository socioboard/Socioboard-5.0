import request from 'request';
import axios from 'axios';
import FormData from 'form-data';

import TeamLibs from '../../../Common/Models/team.model.js';

import tikTokInterceptor from '../../../Common/Interceptors/tiktok.interceptor.js';
import TikTokCluster from '../../../Common/Cluster/tiktok.cluster.js';
import tikTokHelpers from './tiktok.helpers.js';

import TIK_TOK_CONSTANTS from '../../../Common/Constants/tiktok.constants.js';

const teamLibs = new TeamLibs();

/**
 * @class TikTokService
 */
class TikTokService {
  intercepted = {
    getUserInfo: tikTokInterceptor(this.getUserInfo.bind(this)),
    getVideoList: tikTokInterceptor(this.getVideoList.bind(this)),
    uploadVideo: tikTokInterceptor(this.uploadVideo.bind(this)),
    uploadAudio: tikTokInterceptor(this.uploadAudio.bind(this)),
  };

  /**
   * Get the user info
   * @param {object} args - Request params
   * @param {string} args.accessToken - The token that bears the authorization of the TikTok user
   * @param {string} args.openId - The TikTok user's unique identifier
   * @returns {object} res - User or Error data
   * @memberof TikTokService
   */
  getUserInfo(args) {
    return TikTokCluster.getUserInfo(args);
  }

  /**
   * Get the user video list
   * @param {string} args.access_token - The token that bears the authorization of the TikTok user
   * @param {string} args.open_id - The TikTok user's unique identifier
   * @param {object} args.pagination - Pagination params
   * @param {string} args.pagination.cursor - Cursor for pagination
   * @param {string} args.pagination.max_count - The maximum number of elements that will be returned from each page
   * @returns {object} res - Video list or Error data
   * @memberof TikTokService
   */
  getVideoList(args) {
    return TikTokCluster.getVideoList(args);
  }

  /**
   * Upload video to TikTok
   * @param {string} data.access_token - The token that bears the authorization of the TikTok user
   * @param {string} data.open_id - The TikTok user's unique identifier
   * @param {string} data.fileUrl - Upload video url
   * @returns {object} TikTok API response
   */
  uploadVideo(data) {
    return this.uploadFile(
      TIK_TOK_CONSTANTS.EXPECTED_FORM_DATA_KEYS.UPLOAD_VIDEO,
      TikTokCluster.uploadVideo.bind(TikTokCluster)
    )(data);
  }

  /**
   * Upload audio to TikTok
   * @param {string} data.access_token - The token that bears the authorization of the TikTok user
   * @param {string} data.open_id - The TikTok user's unique identifier
   * @param {string} data.fileUrl - Upload audio url
   * @returns {object} TikTok API response
   */
  uploadAudio(data) {
    return this.uploadFile(
      TIK_TOK_CONSTANTS.EXPECTED_FORM_DATA_KEYS.UPLOAD_AUDIO,
      TikTokCluster.uploadAudio.bind(TikTokCluster)
    )(data);
  }

  /**
   * Wrapper for uploading a file to TikTok
   * @param {string} field - Remote service file field name
   * @param {function} cb - Upload function
   * @returns {function({access_token: string, open_id: string, fileUrl: string}): Promise<object>}
   */
  uploadFile(field, cb) {
    const fetch = (fileUrl) =>  request(fileUrl)

    return ({access_token, open_id, fileUrl}) => {
      const formData = new FormData();

      formData.append(
        field,
        fetch(fileUrl)
      );

      return cb({
        access_token,
        open_id,
        formData,
      });
    }
  }

  /**
   * Get headers by url
   * @param {string} url
   * @returns {Promise<object>}
   */
  async getRemoteFileDetails(url) {
    const response = await axios.head(url);

    return response.headers;
  }

  /**
   * Refresh a user access token
   * @param {number} accountId - TikTok account id in the db
   * @param {string} refreshToken - The user refresh token
   * @returns {string} access_token - Regenerated the user access token
   */
  async refreshAccessToken(accountId, refreshToken) {
    const {access_token} = await TikTokCluster.refreshToken(refreshToken);

    await teamLibs.updateAccessToken(accountId, access_token);

    return access_token;
  }

  /**
   * Upload video to many TikTok accounts
   * @param {number[]} accounts
   * @param {string} fileUrl
   * @returns {Promise<object[]>}
   */
  uploadVideoToManyAccounts(accounts, fileUrl) {
    return this.uploadFileToManyAccounts(this.intercepted.uploadVideo)(accounts, fileUrl);
  }

  /**
   * Upload audio to many TikTok accounts
   * @param {number[]} accounts
   * @param {string} fileUrl
   * @returns {Promise<object[]>}
   */
  uploadAudioToManyAccounts(accounts, fileUrl) {
    return this.uploadFileToManyAccounts(this.intercepted.uploadAudio)(accounts, fileUrl);
  }

  /**
   * Wrapper for uploading a file to many TikTok accounts
   * @param {function} uploader
   * @returns {function(accounts: number[], fileUrl: string)}
   */
  uploadFileToManyAccounts(uploader) {
    return (accounts, fileUrl) => Promise.all(accounts.map(account => {
      const creds = tikTokHelpers.getRequestCreds(account);

      return uploader({...creds, fileUrl}, account);
    }));
  }
}

export default new TikTokService();
