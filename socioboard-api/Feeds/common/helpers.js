/**
 * Global helper class
 * @class Helpers
 */
 class Helpers {
  /**
   * Parse the request to get specific query params
   * @param {express.Request} req
   * @returns {object} data - Fetched data
   * @memberof Helpers
   */
  getFromQuery(req) {
    const {accountId, teamId} = req.query;

    return {accountId, teamId};
  }

  /**
   * Parse the request to get specific body params
   * @param {express.Request} req
   * @returns {object} data - Fetched data
   * @memberof Helpers
   */
  getFromBody(req) {
    const {accountId, teamId} = req.body;

    return {accountId, teamId};
  }

  /**
   * Parse the request to get specific body params
   * @param {express.Request} req
   * @returns {object} data - Fetched data
   * @memberof Helpers
   */
  getManyFromBody(req) {
    const {accountIds, teamId} = req.body;

    return {accountIds, teamId};
  }
}

export default Helpers;
