import mongoose from 'mongoose';
import moment from 'moment';

const {Schema} = mongoose;

mongoose.set('useCreateIndex', true);

const facebookPost = new Schema({
  postId: {type: String, index: true, unique: true},
  privacy: {type: String},
  publishedDate: {type: Date, default: Date.now},
  postType: {type: String},
  description: {type: String},
  postUrl: {type: String},
  isApplicationPost: {type: Boolean},
  mediaUrls: {type: [String]},
  likeCount: {type: Number},
  commentCount: {type: Number},
  socialAccountId: {type: String, index: true},
  isLiked: {type: Boolean, default: false},
  comments: {
    type: [
      {
        message: String,
        mediaUrls: [String],
        commentId: String,
      },
    ],
  },
  batchId: {type: String},
  serverMediaUrl: {type: String},
  createdDate: {type: Date, default: Date.now},
  version: {type: String, index: true},
  sharedUrl: {type: String},
});

facebookPost.methods.insertManyPosts = function (posts) {
  return this.model('FacebookPosts')
    .bulkWrite(
      posts.map(post => ({
        updateOne: {
          filter: {postId: post.postId},
          update: post,
          upsert: true,
        },
      }))
    )
    .catch(error => {
      return 0;
    });
};

facebookPost.methods.getBatchPost = function (batchId) {
  const query = {
    batchId: new RegExp(batchId, 'i'),
  };

  return this.model('FacebookPosts')
    .find(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };

  return this.model('FacebookPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      {socialAccountId: new RegExp(keyword, 'i')},
      {title: new RegExp(keyword, 'i')},
      {publishedDate: new RegExp(keyword, 'i')},
      {rating: new RegExp(keyword, 'i')},
    ],
  };

  return this.model('FacebookPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };

  return this.model('FacebookPosts')
    .deleteMany(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.deleteSinglePost = function (postId) {
  const query = {
    postId: new RegExp(postId, 'i'),
  };

  return this.model('FacebookPosts')
    .findOneAndDelete(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.updateLikeCount = function (postId, method) {
  const query = {
    postId: new RegExp(postId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = {$inc: {likeCount: 1}};
  } else {
    updateObject = {$inc: {likeCount: -1}};
  }

  return this.model('FacebookPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.updateCommentCount = function (postId, method) {
  const query = {
    postId: new RegExp(postId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = {$inc: {commentCount: 1}};
  } else {
    updateObject = {$inc: {commentCount: -1}};
  }

  return this.model('FacebookPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

facebookPost.methods.updateIsLike = function (postId, method) {
  const query = {
    postId: new RegExp(postId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = {isLiked: true};
  } else {
    updateObject = {isLiked: false};
  }

  return this.model('FacebookPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

const facebookPostModel = mongoose.model('FacebookPosts', facebookPost);

export default facebookPostModel;
