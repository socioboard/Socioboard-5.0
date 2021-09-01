import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const giphyPost = new Schema({
  giphyId: { type: String, index: true, unique: true },
  sourceUrl: { type: String },
  title: { type: String },
  description: { type: String },
  publisherName: { type: String },
  publishedDate: { type: Date, default: Date.now },
  postSourceUrl: { type: String },
  mediaUrl: { type: [String] },
  rating: { type: String },
  score: { type: String },

  batchId: { type: String },
  serverMediaUrl: { type: [String] },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

giphyPost.methods.insertManyGiphy = function (posts) {
  return this.model('GiphyPosts')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => 0);
};

giphyPost.methods.getBatchPost = function (batchId) {
  const query = {
    batchId: new RegExp(batchId, 'i'),
  };

  return this.model('GiphyPosts')
    .find(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

giphyPost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      { description: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
      { publishedDate: new RegExp(keyword, 'i') },
      { rating: new RegExp(keyword, 'i') }],
  };

  return this.model('GiphyPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

giphyPost.methods.updateServerMediaUrl = function (serverMedia) {
  const updates = [];

  serverMedia.map(function (item) {
    console.log(`Giphy Id : ${item.giphyId} Server Media Url : ${JSON.stringify(item.serverMediaUrl)} \n`);
    const update = this.model('GiphyPosts')
      .update({ giphyId: item.giphyId }, { $set: { serverMediaUrl: item.serverMediaUrl } });

    updates.push(update);
  });

  return Promise.all(updates);
};

const giphyPostModel = mongoose.model('GiphyPosts', giphyPost);

export default giphyPostModel;
