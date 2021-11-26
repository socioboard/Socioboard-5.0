import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const youtubePost = new Schema({
  videoId: { type: String, index: true, unique: true },
  title: { type: String },
  description: { type: String },
  channelId: { type: String },
  channelTitle: { type: String },
  publishedDate: { type: Date, default: Date.now },
  mediaUrl: { type: String },
  updatedDate: { type: Date, default: Date.now },
  thumbnailUrls: { type: [String] },
  embed_url: { type: String },
  etag: { type: String },
  isFeedPost: { type: Boolean, default: false },
  isLiked: {
    type: String,
    enum: ['like', 'dislike', 'none'],
    default: 'none',
  },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

youtubePost.methods.insertMultiPosts = function (posts) {
  return this.model('YoutubePosts')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

youtubePost.methods.insertManyPosts = function (posts) {
  return this.model('YoutubePosts')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { videoId: post.videoId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

youtubePost.methods.FindInsertOrUpdate = function (post) {
  const query = { videoId: new RegExp(post.videoId, 'i') };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  return this.model('YoutubePosts')
    .findOneAndUpdate(query, post, options)
    .then((result) => result)
    .catch((error) => {
      console.log(error.message);
    });
};

youtubePost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      { description: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
    ],
  };

  return this.model('YoutubePosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

youtubePost.methods.getSocialAccountPosts = function (channelId, skip, limit) {
  const query = { channelId: new RegExp(channelId, 'i') };

  return this.model('YoutubePosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

youtubePost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    channelId: new RegExp(accountId, 'i'),
  };

  return this.model('YoutubePosts')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

youtubePost.methods.updateIsLike = function (data) {
  const query = { videoId: new RegExp(data.videoId, 'i') };
  const update = { $set: { isLiked: data.rating } };

  return this.model('YoutubePosts')
    .findOneAndUpdate(query, update)
    .then((result) => result)
    .catch((error) => error);
};

const youtubePostModel = mongoose.model('YoutubePosts', youtubePost);

export default youtubePostModel;
