import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const imgurPost = new Schema({
  imgurId: { type: String, index: true, unique: true },
  title: { type: String },
  sourceUrl: { type: String },
  description: { type: String },
  publisherName: { type: String },
  publishedDate: { type: Date, default: Date.now },
  mediaUrl: { type: [String] },
  mediaType: { type: [String] },

  batchId: { type: String },
  serverMediaUrl: { type: [String] },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

imgurPost.methods.insertManyPosts = function (posts) {
  return this.model('ImgurPosts')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => 0);
};

imgurPost.methods.getBatchPost = function (batchId) {
  const query = {
    batchId: new RegExp(batchId, 'i'),
  };

  return this.model('ImgurPosts')
    .find(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

imgurPost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      { description: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') }],
  };

  return this.model('ImgurPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

const imgurPostModel = mongoose.model('ImgurPosts', imgurPost);

export default imgurPostModel;
