import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const dailyMotionPost = new Schema({
  dailyMotionId: { type: String, index: true, unique: true },
  sourceUrl: { type: String },
  title: { type: String },
  description: { type: String },
  publisherName: { type: String },
  publishedDate: { type: Date, default: Date.now },
  mediaUrl: { type: [String] },

  batchId: { type: String },
  serverMediaUrl: { type: String },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

dailyMotionPost.methods.insertManyPosts = function (posts) {
  return this.model('DailyMotionPosts')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => 0);
};

dailyMotionPost.methods.getPreviousPost = function (skip, limit) {
  return this.model('DailyMotionPosts')
    .find({})
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

const dailyMotionPostModel = mongoose.model('DailyMotionPosts', dailyMotionPost);

export default dailyMotionPostModel;
