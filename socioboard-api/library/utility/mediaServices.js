const download = require('download');
const fs = require('fs');
const mediaBasePath = "../../media/";
const logger = require('../utils/logger');

function MediaServices() {
    let moduleName = '';
    Object.defineProperty(this, "moduleName", {
        set: function (moduleFieldName) {
            if (typeof moduleFieldName === 'string') {
                moduleName = moduleFieldName;
            }
        },
        get: function () {
            return moduleName;
        }
    });

    let batchId = '';
    Object.defineProperty(this, 'batchId', {
        set: function (batch) {
            if (typeof batch === 'string') {
                batchId = batch;
            }
        },
        get: function () {
            return batchId;
        }
    });

    let hostUrl = '';
    Object.defineProperty(this, 'hostUrl', {
        set: function (host) {
            if (typeof host === 'string') {
                hostUrl = host;
            }
        },
        get: function () {
            return hostUrl;
        }
    });
}

MediaServices.prototype.getRandomNumbers = function () {
    var randomNum = Math.floor(100000 + Math.random() * 900000);
    randomNum = String(randomNum);
    return randomNum.substring(0, 4);
};

MediaServices.prototype.getRandomCharacters = function (len) {
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPosition = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPosition, randomPosition + 1);
    }
    return randomString;
};

MediaServices.prototype.DownloadGiphy = function () {
    const GiphyMongoModel = require('../mongoose/models/giphyposts');
    var giphyMongoModelObject = new GiphyMongoModel();
    return new Promise((resolve, reject) => {
        var giphyPostDetails = [];
        giphyMongoModelObject.getBatchPost(this.batchId)
            .then((response) => {
                return Promise.all(response.map(mongoDocument => {
                    var mediaUrls = [];
                    return Promise.all(mongoDocument.mediaUrl.map((media) => {
                        if (media && media !== 'undefined') {
                            var extension = media.split('.').pop();
                            return download(media)
                                .then(data => {
                                    var fileName = `${mongoDocument.giphyId}_${this.getRandomCharacters(3)}${this.getRandomNumbers(3)}.${extension}`;
                                    fs.writeFileSync(`${mediaBasePath}${this.moduleName}/${fileName}`, data);
                                    var path = `${this.hostUrl}/${this.moduleName}/${fileName}`;
                                    mediaUrls.push(path);
                                })
                                .catch((error) => {
                                    logger.info(error);
                                });
                        }
                        return;
                    }))
                        .then(() => {
                            var giphyUpdate = {
                                giphyId: mongoDocument.giphyId,
                                serverMediaUrl: mediaUrls
                            };
                            giphyPostDetails.push(giphyUpdate);
                        })
                        .catch((error) => {
                            throw error;
                        });
                }));
            })
            .then(() => {
                var updates = giphyPostDetails.map(function (item) {
                    return GiphyMongoModel.findOneAndUpdate({ giphyId: item.giphyId }, { $push: { serverMediaUrl: { $each: item.serverMediaUrl } } });
                });
                return Promise.all(updates)
                    .then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error.message);
            });
    });
};

MediaServices.prototype.DownloadImgur = function () {
    const ImgurMongoModel = require('../mongoose/models/imgurposts');
    var ImgurMongoModelObject = new ImgurMongoModel();
    return new Promise((resolve, reject) => {
        var postDetails = [];
        ImgurMongoModelObject.getBatchPost(this.batchId)
            .then((response) => {
                return Promise.all(response.map(mongoDocument => {
                    var mediaUrls = [];
                    return Promise.all(mongoDocument.mediaUrl.map((media) => {
                        if (media && media !== 'undefined') {
                            var extension = media.split('.').pop();
                            return download(media)
                                .then(data => {
                                    var fileName = `${mongoDocument.imgurId}_${this.getRandomCharacters(3)}${this.getRandomNumbers(3)}.${extension}`;
                                    fs.writeFileSync(`${mediaBasePath}${this.moduleName}/${fileName}`, data);
                                    var path = `${this.hostUrl}/${this.moduleName}/${fileName}`;
                                    mediaUrls.push(path);
                                })
                                .catch((error) => {
                                    logger.info(error);
                                });
                        }
                        return;
                    }))
                        .then(() => {
                            var updateDetail = {
                                imgurId: mongoDocument.imgurId,
                                serverMediaUrl: mediaUrls
                            };
                            postDetails.push(updateDetail);
                        })
                        .catch((error) => {
                            throw error;
                        });
                }));
            })
            .then(() => {
                var updates = postDetails.map(function (item) {
                    return ImgurMongoModel.findOneAndUpdate({ imgurId: item.imgurId }, { $push: { serverMediaUrl: { $each: item.serverMediaUrl } } });
                });
                return Promise.all(updates)
                    .then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error.message);
            });
    });
};

MediaServices.prototype.DownloadFlickr = function () {
    const FlickrMongoModel = require('../mongoose/models/flickrposts');
    var flickrMongoModelObject = new FlickrMongoModel();
    return new Promise((resolve, reject) => {
        var postDetails = [];
        flickrMongoModelObject.getBatchPost(this.batchId)
            .then((response) => {
                return Promise.all(response.map(mongoDocument => {
                    var mediaUrls = [];
                    return Promise.all(mongoDocument.mediaUrl.map((media) => {
                        if (media && media !== 'undefined') {
                            var extension = media.split('.').pop();
                            return download(media)
                                .then(data => {
                                    var fileName = `${mongoDocument.flickrId}_${this.getRandomCharacters(3)}${this.getRandomNumbers(3)}.${extension}`;
                                    fs.writeFileSync(`${mediaBasePath}${this.moduleName}/${fileName}`, data);
                                    var path = `${this.hostUrl}/${this.moduleName}/${fileName}`;
                                    mediaUrls.push(path);
                                })
                                .catch((error) => {
                                    logger.info(error);
                                });
                        }
                        return;
                    }))
                        .then(() => {
                            var updateDetails = {
                                flickrId: mongoDocument.flickrId,
                                serverMediaUrl: mediaUrls
                            };
                            postDetails.push(updateDetails);
                        })
                        .catch((error) => {
                            throw error;
                        });
                }));
            })
            .then(() => {
                var updates = postDetails.map(function (item) {
                    return FlickrMongoModel.findOneAndUpdate({ flickrId: item.flickrId }, { $push: { serverMediaUrl: { $each: item.serverMediaUrl } } });
                });
                return Promise.all(updates)
                    .then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error.message);
            });
    });
};

MediaServices.prototype.DownloadPixabay = function () {
    const PixaBayMongoModel = require('../mongoose/models/pixabayposts');
    var pixaBayMongoModelObject = new PixaBayMongoModel();
    return new Promise((resolve, reject) => {
        var postDetails = [];
        pixaBayMongoModelObject.getBatchPost(this.batchId)
            .then((response) => {
                return Promise.all(response.map(mongoDocument => {
                    var mediaUrls = [];
                    return Promise.all(mongoDocument.mediaUrl.map((media) => {
                        if (media && media !== 'undefined') {
                            var extension = media.split('.').pop();
                            return download(media)
                                .then(data => {
                                    var fileName = `${mongoDocument.pixaBayId}_${this.getRandomCharacters(3)}${this.getRandomNumbers(3)}.${extension}`;
                                    fs.writeFileSync(`${mediaBasePath}${this.moduleName}/${fileName}`, data);
                                    var path = `${this.hostUrl}/${this.moduleName}/${fileName}`;
                                    mediaUrls.push(path);
                                })
                                .catch((error) => {
                                    logger.info(error);
                                });
                        }
                        return;
                    }))
                        .then(() => {
                            var updateDetails = {
                                pixaBayId: mongoDocument.pixaBayId,
                                serverMediaUrl: mediaUrls
                            };
                            postDetails.push(updateDetails);
                        })
                        .catch((error) => {
                            throw error;
                        });
                }));
            })
            .then(() => {
                var updates = postDetails.map(function (item) {
                    return PixaBayMongoModel.findOneAndUpdate({ pixaBayId: item.pixaBayId }, { $push: { serverMediaUrl: { $each: item.serverMediaUrl } } });
                });
                return Promise.all(updates)
                    .then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error.message);
            });
    });
};

MediaServices.prototype.DownloadTwitterFeeds = function () {

};

MediaServices.prototype.DownloadFacebookFeeds = function () {

};

module.exports = MediaServices;