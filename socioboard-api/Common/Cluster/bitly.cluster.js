import requestPromise from 'request-promise';
import BITLY_CONSTANTS from '../Constants/bitly.constants.js';
import bitlyService from '../../Feeds/core/bitly/bitly.service.js';

class Bitly {
  async addBitlyProfile(network, teamId, code) {
    const { access_token: accessToken } = await this.getProfileAccessToken(code);

    const profile = await this.getProfileDetails(accessToken);

    return {
      UserName: profile.name,
      FirstName: profile.name,
      LastName: '',
      Email: profile.emails[0].email,
      SocialId: profile.login,
      ProfilePicture: '',
      ProfileUrl: '',
      AccessToken: accessToken,
      RefreshToken: accessToken,
      FriendCount: '',
      Info: '',
      TeamId: teamId,
      Network: network,
    };
  }

  getProfileDetails(accessToken) {
    const options = {
      method: 'GET',
      uri: BITLY_CONSTANTS.API_URI.GET_USER_DETAILS,
      headers: this.getHeaders(accessToken),
      json: true,
    };

    return requestPromise(options);
  }

  getProfileAccessToken(code) {
    const options = {
      method: 'POST',
      uri: BITLY_CONSTANTS.API_URI.GET_ACCESS_TOKEN,
      qs: {
        client_id: BITLY_CONSTANTS.CLIENT_ID,
        client_secret: BITLY_CONSTANTS.CLIENT_SECRET,
        code,
        redirect_uri: BITLY_CONSTANTS.REDIRECT_URI,
      },
      json: true,
    };

    return requestPromise(options);
  }

  getGroups(accessToken) {
    const options = {
      method: 'POST',
      uri: BITLY_CONSTANTS.API_URI.GET_GROUPS,
      headers: this.getHeaders(accessToken),
      json: true,
    };

    return requestPromise(options);
  }

  shortenLink(accessToken, body) {
    const options = {
      method: 'POST',
      uri: BITLY_CONSTANTS.API_URI.SHORTEN_LINK,
      headers: this.getHeaders(accessToken),
      body,
      json: true,
    };

    return requestPromise(options);
  }

  getPlatformLimits(accessToken, path = '') {
    const options = {
      method: 'GET',
      uri: BITLY_CONSTANTS.API_URI.GET_PLATFORM_LIMITS,
      headers: this.getHeaders(accessToken),
      qs: {
        path,
      },
      json: true,
    };

    return requestPromise(options);
  }

  getLinksByGroup(accessToken, { group_guid: groupGuid, ...qs }) {
    const options = {
      method: 'GET',
      uri: bitlyService.buildGetBitlinksUrl(groupGuid),
      headers: this.getHeaders(accessToken),
      qs,
      json: true,
    };

    return requestPromise(options);
  }

  archiveLink(accessToken, bitlink) {
    const options = {
      method: 'PATCH',
      uri: bitlyService.buildUpdateBitlinkLink(bitlink),
      headers: this.getHeaders(accessToken),
      body: {
        archived: true,
      },
      json: true,
    };

    return requestPromise(options);
  }

  getHeaders(accessToken) {
    return {
      authorization: `Bearer ${accessToken}`,
    };
  }
}

export default new Bitly();
