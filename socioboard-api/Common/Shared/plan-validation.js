import { ErrorResponse } from "./response.shared.js";

/**
 * TODO To check user plan support the features
 * @param {string} feature -Feature which user requesting
 * @return {string} Returns error when user plan not support else continue
 */
export default (feature) => {
    return async (req, res, next) => {
        try {
            switch (feature) {
                case "ContentStudio":
                    req.body.userScopeContentStudio ? next() : ErrorResponse(res, "Sorry, Don't have permission to access content studio as per your plan.")
                    break;
                case "BoardMe":
                    req.body.userScopeBoardMe ? next() : ErrorResponse(res, "Sorry, Don't have permission to access BoardMe as per your plan.")
                    break;
                case "RssFeeds":
                    req.body.userScopeRssFeeds ? next() : ErrorResponse(res, "Sorry, Don't have permission to access Rss feeds as per your plan.")
                    break;
                case "Discovery":
                    req.body.userScopeDiscovery ? next() : ErrorResponse(res, "Sorry, Don't have permission to access discovery as per your plan.")
                    break;
                case "CustomReport":
                    req.body.userScopeDiscovery ? next() : ErrorResponse(res, "Sorry, Don't have permission to access custom report as per your plan.")
                    break;
                default:
                    next();
                    break;
            }
        }
        catch (error) {
            next()
        }
    }
}