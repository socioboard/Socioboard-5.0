import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const newsApiPost = new Schema({

  sourceUrl: { type: String },
  title: { type: String },
  description: { type: String },
  publisherName: { type: String },
  publishedDate: { type: Date, default: Date.now },
  mediaUrl: { type: String, unique: true },

  batchId: { type: String },
  serverMediaUrl: { type: String },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

newsApiPost.methods.insertManyPosts = function (posts) {
  return this.model('NewsApiPosts')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => 0);
};

newsApiPost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      { description: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
    ],
  };

  return this.model('NewsApiPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

const newsApiPostModel = mongoose.model('NewsApiPosts', newsApiPost);

export default newsApiPostModel;
