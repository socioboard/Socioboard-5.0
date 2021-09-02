import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

var recentVisitedModel = new Schema({
  category: { type: String },
  userId: { type: String },
  message: { type: String },
  createdTime: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  processingTime: { type: String },
  action: { type: String },
  category: { type: String },
  subcategory: { type: String },
  phproute: { type: String },
  userId: { type: String },
  code: { type: String },
  requestParams: { type: Object },
  requestQuery: { type: Object },
  requestBody: { type: Object },
  error: { type: String },
  method: { type: String },
});

recentVisitedModel.methods.insertMany = function (posts) {
  return this.model('RecentVisitedModel')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((e) => {
      console.log(e);

      return 0;
    });
};

recentVisitedModel.methods.insertManyPosts = function (posts) {
  return this.model('RecentVisitedModel')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { category: post.category, action: post.action, userId: post.userId },
        // filter: { userId: post.usetId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

recentVisitedModel.methods.getPreviousPost = function (userId, skip = 0, limit = 15) {
  const query = {
    userId,
  };

  return this.model('RecentVisitedModel')
    .find(query)
    .sort({ createdTime: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};
recentVisitedModel.methods.deleteRecentVisited = function (userId, _id) {
  // Deleting a paricular tweet from an account
  const query = {
    userId,
    _id,
  };

  return this.model('RecentVisitedModel')
    .findOneAndDelete(query)
    .then((result) => result)
    .catch((error) => {
      throw new Error(error);
    });
};

recentVisitedModel.methods.clearRecentVisited = function (userId) {
  // Deleting a paricular tweet from an account
  const query = {
    userId,
  };

  return this.model('RecentVisitedModel')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      throw new Error(error);
    });
};

var recentVisitedModel = mongoose.model('RecentVisitedModel', recentVisitedModel);

export default recentVisitedModel;
