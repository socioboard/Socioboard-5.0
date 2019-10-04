const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on pixabayposts collection of mongo DB
const pixaBayPost = new Schema({
    pixaBayId: { type: String, index: true, unique: true },
    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    publisherName: { type: String },
    publishedDate: { type: Date, default: Date.now },
    mediaUrl: { type: [String] },
    likeCount: { type: String },
    commentCount: { type: String },
    numberOfDownloads: { type: String },
    favorites: { type: String },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

pixaBayPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('PixaBayPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

pixaBayPost.methods.getPreviousPost = function (keyword, sort, skip, limit) {
    // Fetching posts which containing the keyword value
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') }
            ]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('PixaBayPosts')
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


pixaBayPost.methods.getBatchPost = function (batchId) {
    // Fetching a specifed post with batchId
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('PixaBayPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

const pixaBayPostModel = mongoose.model('PixaBayPosts', pixaBayPost);

module.exports = pixaBayPostModel;
