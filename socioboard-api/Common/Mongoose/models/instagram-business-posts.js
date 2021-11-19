import mongoose from 'mongoose';
const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const instagramBusinessPost = new Schema({
  postId: { type: String, index: true, unique: true },
  permalink: { type: String },
  captions: { type: String },
  mediaType: { type: String },
  mediaUrls: { type: [String] },
  publishedDate: { type: Date, default: Date.now, index: true },
  hashtags: { type: [String] },
  mentions: { type: [String] },
  instagramId: { type: String, index: true },
  socialAccountId: { type: String, index: true },
  ownerId: { type: String, index: true },
  ownerUserName: { type: String, index: true },
  likeCount: { type: Number },
  commentCount: { type: Number },
  comments: {
    type: [{
      text: String,
      mediaUrls: [String],
      commentId: String,
      commentDate: { type: Date, default: Date.now },
    }],
  },

  batchId: { type: String },
  serverMediaUrl: { type: [String] },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

instagramBusinessPost.methods.insertManyPosts = function (posts) {
  return this.model('InstagramBusinessPosts')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { postId: post.postId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

instagramBusinessPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  return this.model('InstagramBusinessPosts')
    .aggregate([
      { $match: { socialAccountId: accountId } },
      { $sort: { publishedDate: -1 } },
      { $limit: limit },
      { $skip: skip },
    ])
    .then((result) => {
      console.log(result);
      if (result.length > 0) {
        return result;
      }

      return [];
    })
    .catch((error) => {
      console.log(error);
      throw new Error(error.message);
    });
};

instagramBusinessPost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };

  return this.model('InstagramBusinessPosts')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

const instagramBusinessPostModel = mongoose.model('InstagramBusinessPosts', instagramBusinessPost);

export default instagramBusinessPostModel;
