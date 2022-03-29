import TikTokService from '../../Feeds/core/tiktok/tiktok.service.js';

/**
 * TikTok interceptor for requests
 * @module
 * @param {object} args - Any request args
 * @param {object} tikTokProfile - TikTok account data from db
 * @return {void|object} Continue response or return an error
 */
export default cb => async (args, tikTokProfile) => {
  try {
    const res = await cb(args);

    return res;
  } catch (error) {
    let statusCode = error?.statusCode;

    if (error.isAxiosError) {
      statusCode = error?.response?.status;
    }

    if (statusCode === 401) {
      const access_token = await TikTokService.refreshAccessToken(
        tikTokProfile.account_id,
        tikTokProfile.refresh_token
      );

      return cb({...args, access_token});
    }

    throw error;
  }
};
