import mongoose from 'mongoose';
import moment from 'moment';

const {Schema} = mongoose;

mongoose.set('useCreateIndex', true);

// All functions will execute on twitterposts collection of mongo DB
const twitterPost = new Schema({
  tweetId: {type: String, index: true, unique: true},
  publishedDate: {type: Date, default: Date.now, index: true},
  descritpion: {type: String},
  mediaUrls: {
    type: [
      {
        type: {type: String, default: ''},
        url: {type: String, default: ''},
      },
    ],
  },
  hashtags: {type: [String]},
  mentions: {type: [String]},
  retweetCount: {type: Number},
  favoriteCount: {type: Number},
  accountId: {type: String, index: true},
  postedAccountId: {type: String},
  postedAccountScreenName: {type: String},
  isApplicationPost: {type: Boolean},
  tweetUrl: {type: String},
  isLiked: {type: Boolean, default: false},
  retweeted: {type: Boolean, default: false},
  sentiment: {type: String, default: ''},
  custometag: {type: String, default: ''},
  customtags: {
    type: [
      {
        groupname: {type: String, default: ''},
        customtags: {type: [String]},
      },
    ],
  },
  quoteDetails: {
    type: [
      {
        quoteTweetId: {type: String, default: ''},
        quoteTweetUrl: {type: String, default: ''},
        quoteTweetText: {type: String, default: ''},
        quoteTweetMediaUrls: {type: [String]},
      },
    ],
  },
  isReplayTweet: {type: Boolean, default: false},
  isReTweet: {type: Boolean, default: false},
  isQuoted: {type: Boolean, default: false},
  retweetStatus: {
    type: [
      {
        retweetTweetId: {type: String, default: ''},
        retweetTweetUrl: {type: String, default: ''},
        retweetTweetText: {type: String, default: ''},
        postedAccountScreenName: {type: String},

        // retweetTweetMediaUrls: { type: [String] }
      },
    ],
  },

  replayDetails: {
    type: [
      {
        replayTweetId: {type: String, default: ''},
        replayTweetUserId: {type: String, default: ''},
        replayTweetScreenName: {type: String, default: ''},
        // replayTweetMediaUrls: { type: [String] }
      },
    ],
  },
  // comments: {
  //     type: [{
  //         message: { type: String },
  //         mediaUrls: { type: [String] },
  //         commentedId: { type: String }
  //     }]
  // },

  batchId: {type: String},
  archivedStatus: {type: String},
  deleteStatus: {type: Boolean, default: false},
  serverMediaUrl: {
    type: [
      {
        type: {type: String, default: ''},
        url: {type: String, default: ''},
      },
    ],
  },
  urls: {
    type: [
      {
        url: {type: String, default: ''},
        expanded_url: {type: String, default: ''},
      },
    ],
  },
  createdDate: {type: Date, default: Date.now},
  version: {type: String, index: true},
});

twitterPost.methods.insertManyPosts = function (posts) {
  // Inserting multiple posts into the collection
  return this.model('TwitterPosts')
    .bulkWrite(
      posts.map(post => ({
        updateOne: {
          filter: {tweetId: post.tweetId},
          update: post,
          upsert: true,
        },
      }))
    )
    .catch(error => {
      return 0;
    });
};

twitterPost.methods.getBatchPost = function (batchId) {
  // Fetching posts by batch Id
  const query = {
    batchId: new RegExp(batchId, 'i'),
  };

  return this.model('TwitterPosts')
    .find(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  // Fetching the posts related to an account of twtitter
  const query = {
    accountId: new RegExp(accountId, 'i'),
  };

  return this.model('TwitterPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.getPreviousPost = function (keyword, skip, limit) {
  // Fetching posts related to a keyword containing in the post
  const query = {
    $or: [
      {socialAccountId: new RegExp(keyword, 'i')},
      {title: new RegExp(keyword, 'i')},
      {publishedDate: new RegExp(keyword, 'i')},
      {rating: new RegExp(keyword, 'i')},
    ],
  };

  return this.model('TwitterPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.updateLike = function (tweetId, isliked) {
  // Updating the like status to a post
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  const updateObject = {};

  updateObject.isLiked = isliked;

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.updateLikeRetweetCount = function (
  tweetId,
  favoriteCount,
  retweetCount
) {
  // Updating the retweet count of a particular tweet
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };

  const updateObject = {};

  updateObject.favoriteCount = favoriteCount;
  updateObject.retweetCount = retweetCount;

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.updateLikeCount = function (tweetId, method) {
  // Updating like count of a tweet
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = {$inc: {favoriteCount: 1}};
  } else {
    updateObject = {$inc: {favoriteCount: -1}};
  }

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.updateCommentCount = function (tweetId, method) {
  // Updating comment count of a tweet
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = {$inc: {retweetCount: 1}};
  } else {
    updateObject = {$inc: {retweetCount: -1}};
  }

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.updateretweeted = function (tweetId, retweeted) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  const updateObject = {};

  updateObject.retweeted = retweeted;

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {});
};

twitterPost.methods.addcomments = function (
  tweetId,
  message,
  commentedId,
  mediaUrls
) {
  // Updating/Adding comments to a tweet
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  const updateObject = {
    $push: {comments: {message, mediaUrls, commentedId: String(commentedId)}},
  };

  return this.model('TwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.deletecomments = function (id) {
  // Deleting comment from the tweets
  const query = {'comments.commentedId': new RegExp(id, 'i')};
  const updateObject = {$pull: {comments: {commentedId: id}}};

  return this.model('TwitterPosts')
    .updateOne(query, updateObject)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.deleteAccountPosts = function (accountId) {
  // Deleting all posts related to an account
  const query = {
    accountId: new RegExp(accountId, 'i'),
  };

  return this.model('TwitterPosts')
    .deleteMany(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

twitterPost.methods.deleteSingleTweet = function (accountId, tweetId) {
  // Deleting a paricular tweet from an account
  const query = {
    $and: [
      {
        accountId: new RegExp(accountId, 'i'),
        tweetId: new RegExp(tweetId, 'i'),
      },
    ],
  };

  return this.model('TwitterPosts')
    .findOneAndDelete(query)
    .then(result => result)
    .catch(error => {
      throw new Error(error);
    });
};

twitterPost.methods.findLastRecentTweetId = function () {
  // Fetching the recent tweet
  return this.model('TwitterPosts')
    .find()
    .limit(1)
    .sort({publishedDate: -1})
    .then(result => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result[0].tweetId ? result[0].tweetId : '';
      }
    })
    .catch(error => '');
};

twitterPost.methods.findTweet = function (tweetId) {
  // Fetching a particular tweet details
  return this.model('TwitterPosts')
    .findOne({
      tweetId,
    })
    .then(result => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result;
      }
    })
    .catch(error => {
      throw new Error(error);
    });
};

const twitterPostModel = mongoose.model('TwitterPosts', twitterPost);

export default twitterPostModel;
