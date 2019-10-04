const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on giphyposts collection of mongo DB
const imgurPost = new Schema({
    imgurId: { type: String, index: true, unique: true },
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

imgurPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into imgurposts collection
    return this.model('ImgurPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

imgurPost.methods.getBatchPost = function (batchId) {
    // Fetching a specified posts from the collection
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('ImgurPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

imgurPost.methods.getPreviousPost = function (keyword, skip, limit) {
    // Fetching posts from collection with having keyword containing description
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') }]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('ImgurPosts')
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

const imgurPostModel = mongoose.model('ImgurPosts', imgurPost);

module.exports = imgurPostModel;
