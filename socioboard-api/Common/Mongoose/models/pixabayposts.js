import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const pixaBayPost = new Schema({
    pixaBayId: { type: String, index: true, unique: true },
    sourceUrl: { type: String, },
    title: { type: String },
    description: { type: String },
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
    return this.model('PixaBayPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

pixaBayPost.methods.getPreviousPost = function (keyword, skip, limit) {
    var query = {
        $or: [
            { description: new RegExp(keyword, 'i') },
            { title: new RegExp(keyword, 'i') }
        ]
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
            console.log(error);
        });
};


pixaBayPost.methods.getBatchPost = function (batchId) {
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('PixaBayPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

const pixaBayPostModel = mongoose.model('PixaBayPosts', pixaBayPost);

export default pixaBayPostModel;
