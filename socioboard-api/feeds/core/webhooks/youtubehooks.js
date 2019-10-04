const YoutubeMongoPostModel = require('../../../library/mongoose/models/youtubepost');
const logger = require('../../utils/logger');
const config = require('config');
var helper = {};

helper.webhookEvents = function (responseBody) {
    logger.info(`Youtube Received Details :\n ${JSON.stringify(responseBody)}`);
    if (responseBody.feed && responseBody.feed.entry) {
        var postDetails = [];
        responseBody.feed.entry.forEach(entry => {
            var details = {
                videoId: entry["yt:videoid"][0],
                channelId: entry["yt:channelid"][0],
                title: entry.title[0],
                channelTitle: entry.author[0].name[0],
                publishedDate: entry.published[0],
                updatedDate: entry.updated[0],
                mediaUrl: `https://www.youtube.com/watch?v=${entry["yt:videoid"][0]}`,
                description: '',
                etag: '',
                version: config.get('google_api.version')
            };
            postDetails.push(details);
            var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
            youtubeMongoPostModelObject.FindInsertOrUpdate(details);
        });
        logger.info(`Full Details : ${JSON.stringify(postDetails)}`);
    }
};


module.exports = helper;