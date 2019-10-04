const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on filckrposts collection of mongo DB
const flickrPost = new Schema({
    flickrId: { type: String, index: true, unique: true },
    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    publisherName: { type: String },
    publishedDate: { type: Date, default: Date.now },
    mediaUrl: { type: [String] },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

flickrPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts
    return this.model('FlickrPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

flickrPost.methods.getPreviousPost = function (keyword, sort, skip, limit) {
    // Fetching posts from the flickrposts collection
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') }
            ]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('FlickrPosts')
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

flickrPost.methods.getBatchPost = function (batchId) {
    // Fetching a specified post from the flickr posts
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('FlickrPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

const flickrPostModel = mongoose.model('FlickrPosts', flickrPost);

module.exports = flickrPostModel;
