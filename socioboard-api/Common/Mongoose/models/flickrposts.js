import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const flickrPost = new Schema({
    flickrId: { type: String, index: true, unique: true },
    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
    publisherName: { type: String },
    publishedDate: { type: Date, default: Date.now },
    mediaUrl: { type: [String] },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

flickrPost.methods.insertManyPosts = function (posts) {
    return this.model('FlickrPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

flickrPost.methods.getPreviousPost = function (keyword, skip, limit) {
    var query = {
        $or: [
            { description: new RegExp(keyword, 'i') },
            { title: new RegExp(keyword, 'i') }
        ]
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
            console.log(error);
        });
};

flickrPost.methods.getBatchPost = function (batchId) {
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('FlickrPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

const flickrPostModel = mongoose.model('FlickrPosts', flickrPost);

export default flickrPostModel;
