const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on giphyposts collection of mongo DB
const giphyPost = new Schema({
    giphyId: { type: String, index: true, unique: true },
    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    publisherName: { type: String },
    publishedDate: { type: Date, default: Date.now },
    postSourceUrl: { type: String },
    mediaUrl: { type: [String] },
    rating: { type: String },
    score: { type: String },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

giphyPost.methods.insertManyGiphy = function (posts) {
    // Inserting multiple posts in giphyposts collection
    return this.model('GiphyPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

giphyPost.methods.getBatchPost = function (batchId) {
    // Fetching a specified post from giphyposts collection
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('GiphyPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

giphyPost.methods.getPreviousPost = function (keyword, sort, skip, limit) {
    // Fetching posts from the giphyposts collection with keyword matching in anywhere in the post
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') },
                { publishedDate: new RegExp(keyword, 'i') },
                { rating: new RegExp(keyword, 'i') }]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('GiphyPosts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

giphyPost.methods.updateServerMediaUrl = function (serverMedia) {

    // Updating serverMediaUrl to each post
    var updates = [];
    serverMedia.map(function (item) {
        var update = this.model('GiphyPosts')
            .update({ "giphyId": item.giphyId }, { "$set": { "serverMediaUrl": item.serverMediaUrl } });

        updates.push(update);
    });
    return Promise.all(updates);
};

const giphyPostModel = mongoose.model('GiphyPosts', giphyPost);

module.exports = giphyPostModel;
