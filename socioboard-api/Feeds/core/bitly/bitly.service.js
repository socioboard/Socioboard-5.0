import BitlyCluster from '../../../Common/Cluster/bitly.cluster.js';
import BITLY_CONSTANTS from '../../../Common/Constants/bitly.constants.js';

class BitlyService {
  getAccountDetails(accessToken) {
    return BitlyCluster.getProfileDetails(accessToken);
  }

  getGroups(accessToken) {
    return BitlyCluster.getGroups(accessToken);
  }

  shortenLink(accessToken, options) {
    return BitlyCluster.shortenLink(accessToken, options);
  }

  getPlatformLimits(accessToken, path) {
    return BitlyCluster.getPlatformLimits(accessToken, path);
  }

  getLinksByGroup(accessToken, queryParams) {
    return BitlyCluster.getLinksByGroup(accessToken, queryParams);
  }

  archiveLink(accessToken, bitlink) {
    return BitlyCluster.archiveLink(accessToken, bitlink);
  }

  buildGetBitlinksUrl(groupGuid) {
    return `${BITLY_CONSTANTS.API_URI.BITLY_GROUP_LINK}/${groupGuid}/bitlinks`;
  }

  buildUpdateBitlinkLink(bitlink) {
    return `${BITLY_CONSTANTS.API_URI.UPDATE_BITLINK}/${bitlink}`;
  }
}

export default new BitlyService();
