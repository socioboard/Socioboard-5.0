import {v4} from 'uuid';
import axios from 'axios';

import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '../Shared/error.shared.js';
import TIK_TOK_CONSTANTS from '../Constants/tiktok.constants.js';

/**
 * @class TikTok
 */
class TikTok {
  /**
   * Fetch user details and create social profile object for db
   * @param {object} req - Request object
   * @param {number} req.networkId - Remote service type
   * @param {number} req.teamId - Id of the team to which the account will be added
   * @param {string} req.code - Code from authorization callback
   * @returns {object} res - Response object for db
   * @memberof TikTok
   */
  async addTikTokProfile({networkId, teamId, code}) {
    const tokens = await this.getProfileAccessToken(code);

    const profile = await this.getAuthUserInfo({
      access_token: tokens.access_token,
      open_id: tokens.open_id,
    });

    return {
      UserName: profile.display_name,
      FirstName: '',
      LastName: '',
      Email: '',
      SocialId: profile.open_id,
      ProfilePicture: profile.avatar,
      ProfileUrl: '',
      AccessToken: tokens.access_token,
      RefreshToken: tokens.refresh_token,
      FriendCount: '',
      Info: '',
      TeamId: teamId,
      Network: networkId,
    };
  }

  /**
   * Fetch auth user details from TikTok
   * @param {string} access_token - The token that bears the authorization of the TikTok user
   * @param {string} open_id - The TikTok user's unique identifier
   * @returns {object} res - Data from TikTok
   * @returns {object} res.data - User or Error details
   * @returns {string} res.message - Response status message
   * @memberof TikTok
   */
  async getAuthUserInfo({access_token, open_id}) {
    const options = {
      open_id,
      access_token,
    };

    return this.request({
      method: 'GET',
      url: TIK_TOK_CONSTANTS.API_URI.GET_AUTH_USER_INFO,
      params: options,
    });
  }

  /**
   * Fetch user details from TikTok
   * @param {string} access_token - The token that bears the authorization of the TikTok user
   * @param {string} open_id - The TikTok user's unique identifier
   * @returns {object} res - Data from TikTok
   * @returns {object} res.data - User or Error details
   * @returns {string} res.message - Response status message
   * @memberof TikTok
   */
  async getUserInfo({access_token, open_id}) {
    const options = {
      open_id,
      access_token,
      fields: TIK_TOK_CONSTANTS.RESPONSE_USER_INFO_FIELDS,
    };

    return this.request({
      method: 'POST',
      url: TIK_TOK_CONSTANTS.API_URI.GET_USER_INFO,
      data: options,
    });
  }

  /**
   * Fetch user video list from TikTok
   * @param {string} access_token - The token that bears the authorization of the TikTok user
   * @param {string} open_id - The TikTok user's unique identifier
   * @param {object} pagination - Pagination params
   * @param {string} pagination.cursor - Cursor for pagination
   * @param {string} pagination.max_count - The maximum number of elements that will be returned from each page
   * @returns {object} res - Data from TikTok
   * @returns {object} res.data - Video list or Error details
   * @returns {string} res.message - Response status message
   * @memberof TikTok
   */
  async getVideoList({access_token, open_id, pagination}) {
    return this.request({
      method: 'POST',
      url: TIK_TOK_CONSTANTS.API_URI.GET_VIDEO_LIST,
      data: {
        access_token,
        open_id,
        ...pagination,
        fields: TIK_TOK_CONSTANTS.RESPONSE_VIDEO_FIELDS,
      },
    });
  }

  /**
   * Fetch user access and refresh tokens
   * @param {string} code - Code from authorization callback
   * @returns {object} res - Data from TikTok
   * @returns {data} res - Tokens or Error details
   * @returns {string} res.message - Response status message
   * @memberof TikTok
   */
  async getProfileAccessToken(code) {
    const options = {
      client_key: TIK_TOK_CONSTANTS.CLIENT_KEY,
      client_secret: TIK_TOK_CONSTANTS.CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    };

    return this.request({
      method: 'POST',
      url: TIK_TOK_CONSTANTS.API_URI.GET_ACCESS_TOKEN,
      params: options,
    });
  }

  /**
   * Upload a video to TikTok
   * @param {string} access_token - The token that bears the authorization of the TikTok user
   * @param {string} open_id - The TikTok user's unique identifier
   * @param {object} formData - Upload video object
   * @returns {object} res - TikTok API response
   * @memberof TikTok
   */
  async uploadVideo({access_token, open_id, formData}) {
    return this.request({
      method: 'POST',
      url: TIK_TOK_CONSTANTS.API_URI.UPLOAD_VIDEO,
      headers: {
        ...formData.getHeaders(),
      },
      params: {access_token, open_id},
      data: formData,
      maxBodyLength: Infinity,
    });
  }

  /**
   * Upload a audio to TikTok
   * @param {string} access_token - The token that bears the authorization of the TikTok user
   * @param {string} open_id - The TikTok user's unique identifier
   * @param {object} formData - Upload video object
   * @returns {object} res - TikTok API response
   * @memberof TikTok
   */
  async uploadAudio({access_token, open_id, formData}) {
    return this.request({
      method: 'POST',
      url: TIK_TOK_CONSTANTS.API_URI.UPLOAD_AUDIO,
      headers: {
        ...formData.getHeaders(),
      },
      params: {access_token, open_id},
      data: formData,
      maxBodyLength: Infinity,
    });
  }

  /**
   * Get regenerated a user access token
   * @param {string} refreshToken
   * @returns {object} Response object
   * @memberof TikTok
   */
  async refreshToken(refreshToken) {
    const options = {
      client_key: TIK_TOK_CONSTANTS.CLIENT_KEY,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    return this.request({
      url: TIK_TOK_CONSTANTS.API_URI.GET_REFRESH_TOKEN,
      params: options,
    });
  }

  /**
   * Generate redirect url for TikTok
   * @returns {object} res
   * @returns {string} res.responseUrl - Redirect url
   * @returns {string} res.responseState - Randomly generated state
   * @memberof TikTok
   */
  getRedirectUrl() {
    const responseState = v4();

    let responseUrl = TIK_TOK_CONSTANTS.API_URI.RESPONSE_URL;

    responseUrl += `?client_key=${TIK_TOK_CONSTANTS.CLIENT_KEY}`;
    responseUrl +=
      '&scope=user.info.basic,video.list,share.sound.create,video.upload';
    responseUrl += '&response_type=code';
    responseUrl += `&redirect_uri=${TIK_TOK_CONSTANTS.CALLBACK_URL}`;
    responseUrl += `&state=${responseState}`;

    return {responseUrl, responseState};
  }

  /**
   * Wrapper for axios request to TikTok API
   * @param {object} Request options
   * @returns {object} Axios response
   * @memberof TikTok
   */
  async request(options) {
    const {data: response} = await axios(options);

    if (response?.message !== 'error') {
      return response.data;
    }

    switch (response?.error_code) {
      case TIK_TOK_CONSTANTS.REMOTE_ERROR_CODES.UNAUTHORIZED_EXCEPTION:
        throw new UnauthorizedException(response?.data?.description);
      case TIK_TOK_CONSTANTS.REMOTE_ERROR_CODES.INVALID_OPEN_ID:
        throw new BadRequestException(
          TIK_TOK_CONSTANTS.ERROR_MESSAGES[TIK_TOK_CONSTANTS.REMOTE_ERROR_CODES.INVALID_OPEN_ID],
        );
      default:
        throw new InternalServerErrorException(response?.data?.description);
    }
  }
}

export default new TikTok();
