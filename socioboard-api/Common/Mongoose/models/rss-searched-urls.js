import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const rssSearchedUrls = new Schema({
  title: { type: String },
  description: { type: String },
  rssUrl: { type: String },
  userId: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  isBookMarked: { type: Boolean, default: false },
});

rssSearchedUrls.methods.insertMultiPosts = function (posts) {
  return this.model('RssSearchedUrls')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

rssSearchedUrls.methods.insertManyPosts = function (posts, userId) {
  return this.model('RssSearchedUrls')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { rssUrl: post.rssUrl, userId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};
rssSearchedUrls.methods.updateTitle = function (post, userId, title) {
  return this.model('RssSearchedUrls').update({ title: { $exists: false }, userId, rssUrl: post.rssUrl }, { $set: { title } })
    .then(() => '')
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

rssSearchedUrls.methods.FindInsertOrUpdate = function (post) {
  const query = { id: post.id };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  return this.model('RssSearchedUrls')
    .findOneAndUpdate(query, post, options)
    .then((result) => result)
    .catch((error) => {
      console.log(error.message);
    });
};

rssSearchedUrls.methods.getPreviousPost = function (userId, skip, limit) {
  const query = {
    userId,
  };

  return this.model('RssSearchedUrls')
    .find(query)
    .sort({ updatedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

rssSearchedUrls.methods.getBookMarkedPost = function (userId, skip = 0, limit = 0) {
  const query = {
    userId,
    isBookMarked: true,
  };

  return this.model('RssSearchedUrls')
    .find(query)
    .sort({ updatedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

rssSearchedUrls.methods.getSocialAccountPosts = function (channelId, skip, limit) {
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

rssSearchedUrls.methods.deleteAccountPosts = function (accountId) {
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

rssSearchedUrls.methods.updateIsLike = function (data) {
  const query = { videoId: new RegExp(data.videoId, 'i') };
  const update = { $set: { isLiked: data.rating } };

  return this.model('YoutubePosts')
    .findOneAndUpdate(query, update)
    .then((result) => result)
    .catch((error) => error);
};

rssSearchedUrls.methods.bookmarkUrl = function (userId, _id, isBookMarked) {
  const query = { userId, _id };
  const update = { $set: { isBookMarked } };

  return this.model('RssSearchedUrls')
    .findOneAndUpdate(query, update, { new: true })
    .then((result) => result)
    .catch((error) => error);
};

rssSearchedUrls.methods.updateRssUrls = function (userId, _id, body) {
  const query = { userId, _id };
  const update = {
    $set: {
      isBookMarked: body.isBookMarked, title: body.title, description: body.description, rssUrl: body.rssUrl, isBookMarked: body.isBookMarked,
    },
  };

  return this.model('RssSearchedUrls')
    .findOneAndUpdate(query, update, { new: true })
    .then((result) => result)
    .catch((error) => error);
};

rssSearchedUrls.methods.clearRssUrls = function (userId) {
  const query = {
    userId,
  };

  return this.model('RssSearchedUrls')
    .deleteMany(query)
    .then((result) => 'Rss Url cleared succesfully')
    .catch((error) => {
      console.log(error);
    });
};

rssSearchedUrls.methods.deleteRssUrls = function (userId, _id) {
  const query = { userId, _id };

  return this.model('RssSearchedUrls')
    .findOneAndDelete(query)
    .then((result) => {
      if (!result) return 'No Rss Url found';

      return 'Deleted Rss Url succesfully';
    })
    .catch((error) => {
      throw new Error(error);
    });
};

const RssSearchedUrlsModel = mongoose.model('RssSearchedUrls', rssSearchedUrls);

export default RssSearchedUrlsModel;
