const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on newsapiposts collection of mongo DB
const newsApiPost = new Schema({

    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    publisherName: { type: String },
    publishedDate: { type: Date, default: Date.now },
    mediaUrl: { type: [String], unique: true },

    batchId: { type: String },
    serverMediaUrl: { type: String },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

newsApiPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('NewsApiPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

newsApiPost.methods.getPreviousPost = function (keyword, sort, skip, limit) {
    // Fetching posts from the collection whichever related to a particular keyword
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') }
            ]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('NewsApiPosts')
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

const newsApiPostModel = mongoose.model('NewsApiPosts', newsApiPost);

module.exports = newsApiPostModel;
