const config = require('config');
const TrendsServices = require('../../../../library/network/trends');
const moment = require('moment');
const MediaService = require('../../../../library/utility/mediaServices');
const logger = require('../../../utils/logger');
const fs = require('fs');

class TrendLibs {
    constructor() {
        this.trendsServices = new TrendsServices();
    }

    makeDownloadSchedule(moduleName, batchId) {
        return new Promise((resolve, reject) => {
            if (!moduleName || !batchId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var MediaServiceObject = new MediaService();
                MediaServiceObject.moduleName = moduleName;
                MediaServiceObject.batchId = batchId;
                MediaServiceObject.hostUrl = config.get('feed_socioboard.host_url');

                switch (moduleName) {
                    case "giphy":
                        // Allowing to download Giphy media's
                        MediaServiceObject.DownloadGiphy()
                            .then(() => {
                                logger.info("Giphy media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "imgur":
                        // Allowing to download Imgur media's
                        MediaServiceObject.DownloadImgur()
                            .then(() => {
                                logger.info("Imgur media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "pixabay":
                        // Allowing to download Pixabay media's
                        MediaServiceObject.DownloadPixabay()
                            .then(() => {
                                logger.info("Pixabay media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "flickr":
                        // Allowing to download Flicker media's
                        MediaServiceObject.DownloadFlickr()
                            .then(() => {
                                logger.info("Flickr media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    default:
                        break;
                }
                resolve();
            }
        });
    }

    getGiphy(keyword, pageId, filter) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId || !filter) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from giphy for a specified keyword
                this.trendsServices.fetchGiphy(config.get('content_studio.giphy'), keyword, pageId, filter)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.giphy.path'))) {
                                fs.mkdirSync(config.get('content_studio.giphy.path'));
                            }
                            logger.info(`Giphy Response : ${response.giphyDetails}`);
                            // Downloading the fetched posts
                            return this.makeDownloadSchedule("giphy", response.batchId)
                                .then(() => {
                                    resolve(response.giphyDetails);
                                })
                                .catch((error) => { throw error; });
                        } else
                            resolve(response.giphyDetails);

                    })
                    .catch((error) => reject(error));
            }
        });
    }

    getNewsApi(keyword, pageId, sort) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from newsApi for a specified keyword
                this.trendsServices.fetchNewsApi(config.get('content_studio.newsapi'), keyword, pageId, sort)
                    .then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getPixabay(keyword, pageId, filter, sort) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from pixabay for a specified keyword
                this.trendsServices.fetchPixabay(config.get('content_studio.pixabay'), keyword, pageId, filter, sort)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.pixabay.path'))) {
                                fs.mkdirSync(config.get('content_studio.pixabay.path'));
                            }
                            logger.info(`Pixabay Response : ${response.pixabayDetails}`);
                            // Downloading the fetched posts
                            return this.makeDownloadSchedule("pixabay", response.batchId)
                                .then(() => {
                                    resolve(response.pixabayDetails);
                                })
                                .catch((error) => { throw error; });
                        } else
                            resolve(response.pixabayDetails);

                    })
                    .catch((error) => reject(error));
            }
        });
    }

    getFlickr(keyword, pageId, sort) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from flickr for a specified keyword
                this.trendsServices.fetchFlickr(config.get('content_studio.flickr'), keyword, pageId, sort)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.flickr.path'))) {
                                fs.mkdirSync(config.get('content_studio.flickr.path'));
                            }
                            logger.info(`flickr Response : ${response.flickrDetails}`);
                            // Downloading the fetched posts
                            return this.makeDownloadSchedule("flickr", response.batchId)
                                .then(() => {
                                    resolve(response.flickrDetails);
                                })
                                .catch((error) => { throw error; });
                        } else
                            resolve(response.flickrDetails);

                    })
                    .catch((error) => reject(error));
            }
        });
    }

    getDailyMotion(pageId, filter, sort) {
        return new Promise((resolve, reject) => {
            if (!pageId || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from dailymotion of newest
                return this.trendsServices.fetchDailyMotion(config.get('content_studio.daily_motion'), pageId, filter, sort)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


    getImgur(keyword, pageId, filter, sort) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from imgur for a specified keyword
                this.trendsServices.fetchImgur(config.get('content_studio.imgur'), keyword, pageId, filter, sort)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.imgur.path'))) {
                                fs.mkdirSync(config.get('content_studio.imgur.path'));
                            }
                            logger.info(`imgur Response : ${response.imgurDetails}`);
                            // Downloading the fetched posts
                            return this.makeDownloadSchedule("imgur", response.batchId)
                                .then(() => {
                                    resolve(response.imgurDetails);
                                })
                                .catch((error) => { throw error; });
                        } else
                            resolve(response.imgurDetails);

                    })
                    .catch((error) => reject(error));
            }
        });
    }


    getRssFeeds(rssUrl) {
        return new Promise((resolve, reject) => {
            if (!rssUrl) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from RSS for a specified url
                this.trendsServices.fetchRssFeeds(rssUrl)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


    getYoutube(pageId, keyword, sort) {
        return new Promise((resolve, reject) => {
            if (!pageId || !keyword || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from youtube for a specified keyword
                this.trendsServices.fetchYoutube(config.get('content_studio.youtube'), pageId, keyword, sort)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


    getTwitter(keyword) {

        return new Promise((resolve, reject) => {
            if (!keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching posts from twitter for a specified keyword
                this.trendsServices.fetchTwitter(keyword)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }

    getCurrentTrends(countryCode) {

        return new Promise((resolve, reject) => {
            if (!countryCode) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching current trends from twitter for a specified country
                this.trendsServices.fetchTrendingKeywords(countryCode)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


}


module.exports = TrendLibs;