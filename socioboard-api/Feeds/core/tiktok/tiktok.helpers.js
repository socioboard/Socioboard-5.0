import moment from 'moment';

import Helpers from '../../common/helpers.js';

/**
 * @class TikTokHelpers
 */
class TikTokHelpers extends Helpers {
  /**
   * Parse TikTok account to get access and refresh tokens
   * @param {object} account - TikTok account from db
   * @returns {object} res - Parsed the TikTok account tokens
   * @returns {string} res.access_token - The token that bears the authorization of the TikTok user
   * @returns {string} res.open_id - The TikTok user's unique identifier
   * @memberof TikTokController
   */
  getRequestCreds(account) {
    const {access_token, social_id: open_id} = account;

    return {access_token, open_id};
  }

  convertVideoDates(list) {
    const videos = list?.videos?.map(({create_time, ...video}) => ({
      create_time: moment.unix(create_time).toISOString(),
      ...video,
    }));

    return {...list, videos};
  }
}

export default new TikTokHelpers();
