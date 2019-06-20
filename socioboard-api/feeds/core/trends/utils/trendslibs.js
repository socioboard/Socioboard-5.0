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
                        MediaServiceObject.DownloadGiphy()
                            .then(() => {
                                logger.info("Giphy media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "imgur":
                        MediaServiceObject.DownloadImgur()
                            .then(() => {
                                logger.info("Imgur media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "pixabay":
                        MediaServiceObject.DownloadPixabay()
                            .then(() => {
                                logger.info("Pixabay media's are downloaded successfully!");
                            })
                            .catch((error) => {
                                logger.info(error);
                            });
                        break;
                    case "flickr":
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

    getGiphy(keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchGiphy(config.get('content_studio.giphy'), keyword, pageId)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.giphy.path'))) {
                                fs.mkdirSync(config.get('content_studio.giphy.path'));
                            }
                            logger.info(`Giphy Response : ${response.giphyDetails}`);
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

    getNewsApi(keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchNewsApi(config.get('content_studio.newsapi'), keyword, pageId)
                    .then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getPixabay(keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchPixabay(config.get('content_studio.pixabay'), keyword, pageId)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.pixabay.path'))) {
                                fs.mkdirSync(config.get('content_studio.pixabay.path'));
                            }
                            logger.info(`Pixabay Response : ${response.pixabayDetails}`);
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

    getFlickr(keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchFlickr(config.get('content_studio.flickr'), keyword, pageId)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.flickr.path'))) {
                                fs.mkdirSync(config.get('content_studio.flickr.path'));
                            }
                            logger.info(`flickr Response : ${response.flickrDetails}`);
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

    getDailyMotion(pageId) {
        return new Promise((resolve, reject) => {
            if (!pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                return this.trendsServices.fetchDailyMotion(config.get('content_studio.daily_motion'), pageId)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


    getImgur(keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchImgur(config.get('content_studio.imgur'), keyword, pageId)
                    .then((response) => {
                        if (response.batchId) {
                            if (!fs.existsSync(config.get('content_studio.imgur.path'))) {
                                fs.mkdirSync(config.get('content_studio.imgur.path'));
                            }
                            logger.info(`imgur Response : ${response.imgurDetails}`);
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
                this.trendsServices.fetchRssFeeds(rssUrl)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


    getYoutube(pageId, keyword) {
        return new Promise((resolve, reject) => {
            if (!pageId || !keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                this.trendsServices.fetchYoutube(config.get('content_studio.youtube'), pageId, keyword)
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
                this.trendsServices.fetchTrendingKeywords(countryCode)
                    .then((response) => resolve(response))
                    .catch(error => reject(error));
            }
        });
    }


}


module.exports = TrendLibs;