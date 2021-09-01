const mongoose = require('mongoose');
const moment = require('moment');
const { count } = require('./facebook-posts');

const { Schema } = mongoose;
const mediaBasePath = '../../';
const fs = require('fs');

mongoose.set('useCreateIndex', true);

const twitterArchivePost = new Schema({
  tweetId: { type: String, index: true, unique: true },
  publishedDate: { type: Date, default: Date.now, index: true },
  descritpion: { type: String },
  mediaUrls: {
    type: [{
      type: { type: String },
      url: { type: String },
    }],
  },
  hashtags: { type: [String] },
  mentions: { type: [String] },
  retweetCount: { type: Number },
  favoriteCount: { type: Number },
  accountId: { type: String, index: true },
  postedAccountId: { type: String },
  postedAccountScreenName: { type: String },
  isApplicationPost: { type: Boolean },
  tweetUrl: { type: String },
  isLiked: { type: Boolean, default: false },
  sentiment: { type: String, default: '' },
  customtag: { type: String, default: '' },
  quoteDetails: {
    type: [{
      quoteTweetId: { type: String, default: '' },
      quoteTweetUrl: { type: String, default: '' },
      quoteTweetText: { type: String, default: '' },
      quoteTweetMediaUrls: { type: [String] },
    }],
  },
  custometag: { type: String, default: '' },
  customtags: {
    type: [{
      groupname: { type: String, default: '' },
      customtags: { type: [String] },
    }],
  },
  isReplayTweet: { type: Boolean, default: false },
  isReTweet: { type: Boolean, default: false },
  retweetStatus: {
    type: [{
      retweetTweetId: { type: String, default: '' },
      retweetTweetUrl: { type: String, default: '' },
      retweetTweetText: { type: String, default: '' },
      // retweetTweetMediaUrls: { type: [String] }
    }],
  },

  replayDetails: {
    type: [{
      replayTweetId: { type: String, default: '' },
      replayTweetUserId: { type: String, default: '' },
      replayTweetScreenName: { type: String, default: '' },
      // replayTweetMediaUrls: { type: [String] }
    }],
  },
  // comments: {
  //     type: [{
  //         message: { type: String },
  //         mediaUrls: { type: [String] },
  //         commentedId: { type: String }
  //     }]
  // },

  batchId: { type: String },
  serverMediaUrl: {
    type: [{
      type: { type: String, default: '' },
      url: { type: String, default: '' },
    }],
  },
  deleteStatus: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

twitterArchivePost.methods.insertManyPosts = function (posts) {
  return this.model('TwitterArchivePost')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { tweetId: post.tweetId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

twitterArchivePost.methods.getBatchPost = function (batchId) {
  const query = {
    batchId: new RegExp(batchId, 'i'),
  };

  return this.model('TwitterArchivePost')
    .find(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  const query = {
    accountId: new RegExp(accountId, 'i'),
    $or: [
      { deleteStatus: false },
      { deleteStatus: { $exists: false } },
    ],
  };

  return this.model('TwitterArchivePost')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.deleteMediaFile = function (accountId, isArray, skip, limit) {
  const query = {};

  if (!isArray) query.accountId = new RegExp(accountId, 'i');
  else query.accountId = { $in: accountId };

  return this.model('TwitterArchivePost')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => {
      const mediaUrls = [];

      result.forEach((element) => {
        if (element.mediaUrls.length != 0) {
          element.mediaUrls.forEach((media) => {
            mediaUrls.push(media.url);
          });
        }
      });

      deleteMediaFile(mediaUrls);
    })
    .catch((error) => {
      console.log(error);
    });
};

const deleteMediaFile = function (arrayOfMediaFile) {
  Promise.all(arrayOfMediaFile.map((data) => {
    fs.unlink(mediaBasePath + data, (err) => {
      if (err) {

      } else {

      }
    });
  }));
};

twitterArchivePost.methods.getPreviousPost = function (keyword, skip, limit) {
  const query = {
    $or: [
      { socialAccountId: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
      { publishedDate: new RegExp(keyword, 'i') },
      { rating: new RegExp(keyword, 'i') }],
  };

  return this.model('TwitterArchivePost')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.updateLike = function (tweetId, isliked) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  const updateObject = {};

  updateObject.isLiked = isliked;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.updateLikeRetweetCount = function (tweetId, favoriteCount, retweetCount) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };

  const updateObject = {};

  updateObject.favoriteCount = favoriteCount;
  updateObject.retweetCount = retweetCount;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.updateLikeCount = function (tweetId, method) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = { $inc: { favoriteCount: 1 } };
  } else {
    updateObject = { $inc: { favoriteCount: -1 } };
  }

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.updateCommentCount = function (tweetId, method) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = { $inc: { retweetCount: 1 } };
  } else {
    updateObject = { $inc: { retweetCount: -1 } };
  }

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.addcomments = function (tweetId, message, commentedId, mediaUrls) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  const updateObject = { $push: { comments: { message, mediaUrls, commentedId: String(commentedId) } } };

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.deletecomments = function (id) {
  const query = { 'comments.commentedId': new RegExp(id, 'i') };
  const updateObject = { $pull: { comments: { commentedId: id } } };

  return this.model('TwitterArchivePost')
    .updateOne(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    accountId: new RegExp(accountId, 'i'),
  };

  return this.model('TwitterArchivePost')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.deleteSingleTweet = function (accountId, tweetId) {
  const query = {
    $and: [{
      accountId: new RegExp(accountId, 'i'),
      tweetId: new RegExp(tweetId),
    }],
  };

  return this.model('TwitterArchivePost')
    .findOneAndDelete(query)
    .then((result) => {
      // return result;
      if (!result) {
        return 'No tweet found';
      }

      return 'Deleted tweet succesfully';
    })
    .catch((error) => {
      throw new Error(error);
    });
};

twitterArchivePost.methods.setdeleteStatus = function (accountId, tweetId, deleteStatus) {
  const query = {
    accountId,
    tweetId,
  };
  const updateObject = {};

  updateObject.deleteStatus = deleteStatus;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Deleted tweet succesfully';
    })
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.findLastRecentTweetId = function () {
  return this.model('TwitterArchivePost')
    .find().limit(1).sort({ publishedDate: -1 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result[0].tweetId ? result[0].tweetId : '';
      }
    })
    .catch((error) => '');
};

twitterArchivePost.methods.findAllHashTags = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .find({ accountId: { $in: list } }, { hashtags: 1, _id: 0 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        let data = [];

        for (const count in result) {
          if ([result[count].hashtags].length != 0) data = data.concat(result[count].hashtags);
        }
        const occurrences = {};

        for (let i = 0, j = data.length; i < j; i++) {
          occurrences[data[i]] = (occurrences[data[i]] || 0) + 1;
        }

        return occurrences;
      }
    })
    .catch((error) => '');
};

twitterArchivePost.methods.getNumberOfTweet = function (social_id, isforTeam, data) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .find({ accountId: { $in: list } })
    .then((result) => {
      if (!result) {
        throw new Error('no data found.');
      } else {
        const datas = {
          numberOfArchivingTweets: result.length,
          data,
        };

        return result.length;
      }
    })
    .catch((error) => '');
};

twitterArchivePost.methods.getTweetDayWise = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .aggregate([
      { $match: { accountId: { $in: list } } },
      {
        $project: {
          _id: '$_id',
          year: { $year: '$publishedDate' },
          month: { $month: '$publishedDate' },
          day: { $dayOfMonth: '$publishedDate' },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$publishedDate' } },
          dates: { year: '$year', month: '$month', day: '$day' },
          favoriteCount: '$favoriteCount',
          retweetCount: '$retweetCount',
          numberHashtag: { $cond: { if: { $isArray: '$hashtags' }, then: { $size: '$hashtags' }, else: '0' } },

        },
      },
      {
        $group: {
          _id: '$date',
          likes: { $sum: '$favoriteCount' },
          retweets: { $sum: '$retweetCount' },
          tweets: { $sum: 1 },
          hashtags: { $sum: '$numberHashtag' },
        },
      },
      { $sort: { _id: -1 } },
    ])
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const results = result;

        return result;
      }
    })
    .catch((error) => {
      console.log('Error while getting datewise', error);

      return '';
    });
};

twitterArchivePost.methods.getArchivedTweetDayWise = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .aggregate([
      { $match: { accountId: { $in: list } } },
      {
        $project: {
          _id: '$_id',
          year: { $year: '$createdDate' },
          month: { $month: '$createdDate' },
          day: { $dayOfMonth: '$createdDate' },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdDate' } },
          dates: { year: '$year', month: '$month', day: '$day' },
        },
      },
      {
        $group: {
          _id: '$date',
          archivedTweet: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ])
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        let totalPosts = 0;
        const data = [];

        for (const count in result) {
          totalPosts += result[count].archivedTweet;
          const datas = {
            date: result[count]._id,
            archivedTweet: result[count].archivedTweet,
          };

          data.push(datas);
        }
        const response = {
          totalPosts,
          data,
        };

        return response;
      }
    })
    .catch((error) => {
      console.log('Error--', error);

      return '';
    });
};

twitterArchivePost.methods.getArchivedAccountDetails = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .distinct('accountId', { accountId: { $in: list } })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result;
      }
    })
    .catch((error) => '');
};

twitterArchivePost.methods.getSentimentAnalysis = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('TwitterArchivePost')
    .find({ accountId: { $in: list } }, { sentiment: 1, _id: 0 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const totalCount = result.length;

        if (totalCount > 0) {
          let pos = 0;
          let neg = 0;
          let neu = 0;

          for (const count in result) {
            if (result[count].sentiment == 0) {
              neu += 1;
            } else if (result[count].sentiment == -1) {
              neg += 1;
            } else {
              pos += 1;
            }
          }
          const data = {
            totalCount,
            sentiment: {
              positive: pos,
              neutral: neu,
              negative: neg,

            },
            sentiment_percentage: {
              positive: (pos / totalCount) * 100,
              neutral: (neu / totalCount) * 100,
              negative: (neg / totalCount) * 100,
            },
          };

          return data;
        }

        return result;
      }
    })
    .catch((error) => {
      console.log('Error:', error);

      return '';
    });
};

twitterArchivePost.methods.findTweet = function (tweetId) {
  return this.model('TwitterArchivePost')
    .findOne({
      tweetId,
    })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result;
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
};

twitterArchivePost.methods.setSentimentStatus = function (socialAccount, tweetId, sentimentStatus) {
  const query = {
    accountId: socialAccount.social_id,
    tweetId,
  };
  const updateObject = {};

  updateObject.sentiment = sentimentStatus;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Status changed succesfully';
    })
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.getCustomTagsFeeds = function (socialAccount, tweetId, groupName) {
  let query = {};

  query = {
    accountId: socialAccount.social_id,
    tweetId,
  };

  return this.model('TwitterArchivePost')
    .findOne(query, ['customtags', { _id: 0 }])
    .then((result) => {
      if (!result) return 'No tweet found';
      if (groupName) {
        const groupRes = [];

        for (const element in result.customtags) {
          if (result.customtags[element].groupname == groupName) {
            groupRes.push(result.customtags[element]);
          }
        }

        return groupRes;
      }

      return result;
    })
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.setCustomTag = function (socialAccount, tweetId, customeTagValue) {
  const query = {
    accountId: socialAccount.social_id,
    tweetId,
  };
  const updateObject = {};

  updateObject.customtag = customeTagValue;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Custome Tag Updated succesfully';
    })
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.setCustomTags = function (socialAccount, tweetId, customeTagValue) {
  const query = {
    accountId: socialAccount.social_id,
    tweetId,
  };
  const updateObject = {};

  const data = [];

  for (const c in customeTagValue) {
    if (customeTagValue[c].groupname) {
      const datas = {
        groupname: customeTagValue[c].groupname,
        customtags: customeTagValue[c].customtags,
      };

      data.push(datas);
    }
  }
  updateObject.customtags = data;

  return this.model('TwitterArchivePost')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Custom Tag Updated succesfully';
    })
    .catch((error) => {
      console.log('Error--', error);
    });
};

twitterArchivePost.methods.setCustomTagsSpecificGroup = function (socialAccount, tweetId, customeTagValue) {
  const query = {
    accountId: socialAccount.social_id,
    tweetId,
  };

  const groupName = customeTagValue[0].groupname;

  return this.model('TwitterArchivePost')
    .findOne(query, ['customtags', { _id: 0 }])
    .then((result) => {
      if (!result) {
        return 'No tweet found';
      } if (groupName) {
        const checkCtag = result.customtags.find((i) => i.groupname == groupName);

        if (checkCtag) {
          const checkCtag2 = result.customtags.filter((i) => i.groupname != groupName);

          checkCtag2.push(customeTagValue[0]);

          return checkCtag2;
        }
        const checkCtag2 = result.customtags;

        checkCtag2.push(customeTagValue[0]);

        return checkCtag2;
      }

      return customeTagValue;
    })
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.getArchivedAccountReportsOld = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  const query = {
    accountId: { $in: list },
    publishedDate: { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) },
  };

  if (keyword != '' && keyword != null) {
    if (keyword.indexOf('#') == 0) {
      query.hashtags = keyword;
    } else {
      query.descritpion = new RegExp(`.*${keyword}.*`);
    }
  }
  if (startDate == endDate) {
    new Date(startDate).setHours(0, 0, 0);
  }
  if (sentimantScore) query.sentiment = sentimantScore;
  if (custometag.length != 0) query.customtags = { $elemMatch: { custometag } };
  let data = {};

  return this.model('TwitterArchivePost')
    .find(query)
  // .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => {
      let retweet = 0;
      let likes = 0;
      let favorite = 0;
      let INTERACTION = 0;
      let replay = 0;
      let totalHashtag = 0;
      const tempObj = [];

      for (var i = 0; i < social_id.length; i++) {
        tempObj[social_id[i].social_id] = 0;
      }
      for (const c in result) {
        retweet += result[c].retweetCount;
        likes += result[c].favoriteCount;
        INTERACTION += result[c].mentions.length;
        if (result[c].isLiked) favorite += 1;
        totalHashtag += result[c].hashtags.length;
        if (result[c].isReplayTweet) replay += 1;
        for (var i = 0; i < social_id.length; i++) {
          if (result[c].accountId == social_id[i].social_id) {
            tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1;
          }
        }
      }
      data = {
        tweets: result.length,
        retweet,
        likes,
        favorite,
        interaction: INTERACTION,
        replay,
        totalHashtag,
      };
      if (skip == 0 && limit == 0) return data;

      return result;
    })
    .catch((error) => {
      console.log(error);
    });
};

twitterArchivePost.methods.getArchivedAccountReports = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  let query = {};

  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    query = { $and: condition };
  }
  query.accountId = { $in: list };
  query.publishedDate = { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) };

  if (keyword != '' && keyword != null) {
    if (keyword.indexOf('#') == 0) {
      query.hashtags = keyword;
    } else {
      query.descritpion = new RegExp(`.*${keyword}.*`);
    }
  }
  if (sentimantScore) query.sentiment = sentimantScore;

  const data = {};

  return this.model('TwitterArchivePost')
    .find(query)
  // .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.getArchivedAccountReportsAccounts = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  let query = {};

  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    query = { $and: condition };
  }
  query.accountId = { $in: list };

  var timestamp = Number(new Date(startDate).setHours(0, 0, 0));

  startDate = new Date(timestamp);
  var timestamp = Number(new Date(endDate).setHours(23, 59, 59));

  endDate = new Date(timestamp);
  query.publishedDate = { $gte: startDate, $lte: endDate };

  if (keyword != '' && keyword != null) {
    if (keyword.indexOf('#') == 0) {
      query.hashtags = keyword;
    } else {
      query.descritpion = new RegExp(`.*${keyword}.*`);
    }
  }
  if (sentimantScore) query.sentiment = sentimantScore;
  query = [{ $match: query },
    { $group: { _id: '$accountId', count: { $sum: 1 } } },
    { $project: { accountId: '$_id', _id: 0, count: '$count' } }];

  const data = {};

  return this.model('TwitterArchivePost')
    .aggregate(query)
  // .sort({ publishedDate: -1 })
  // .skip(skip)
  // .limit(limit)
    .then((result) => {
      const results = [];

      for (const c in list) {
        for (const count in result) {
          if (list[c] == result[count].accountId) {
            if (result[count].count != 0) {
              results.push(result[count].accountId);
            }
          }
        }
      }

      return results;
    })
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.getArchivedAccountReportStats = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  let query = {};

  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    query = { $and: condition };
  }
  query.accountId = { $in: list };
  var timestamp = Number(new Date(startDate).setHours(0, 0, 0));

  startDate = new Date(timestamp);
  var timestamp = Number(new Date(endDate).setHours(23, 59, 59));

  endDate = new Date(timestamp);
  query.publishedDate = { $gte: startDate, $lte: endDate };

  if (keyword != '' && keyword != null) {
    if (keyword.indexOf('#') == 0) {
      query.hashtags = keyword;
    } else {
      query.descritpion = new RegExp(`.*${keyword}.*`);
    }
  }
  if (sentimantScore) query.sentiment = sentimantScore;

  query = [
    { $match: query },
    {
      $project: {
        favoriteCount: '$favoriteCount',
        retweetCount: '$retweetCount',
        numberHashtag: { $cond: { if: { $isArray: '$hashtags' }, then: { $size: '$hashtags' }, else: '0' } },
        favorite: { $cond: { if: '$isLiked', then: 1, else: 0 } },
        numberReplay: { $cond: { if: '$isReplayTweet', then: 1, else: 0 } },
        interaction:
           { $cond: { if: { $isArray: '$mentions' }, then: { $size: '$mentions' }, else: '0' } },
      },
    },
    {
      $group: {
        _id: '$customhashtag',
        retweet: { $sum: '$retweetCount' },
        likes: { $sum: '$favoriteCount' },
        favorite: { $sum: '$favorite' },
        replay: { $sum: '$numberReplay' },
        totalHashtag: { $sum: '$numberHashtag' },
        interaction: { $sum: '$interaction' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        tweets: '$count',
        _id: 0,
        likes: 1,
        retweet: 1,
        totalHashtag: 1,
        favorite: 1,
        replay: 1,
        interaction: 1,
      },
    },
  ];

  return this.model('TwitterArchivePost')
    .aggregate(query)
    .then((result) => {
      let count = 0;
      let retweet = 0;
      let likes = 0;
      let favorite = 0;
      let INTERACTION = 0;
      let replay = 0;
      let totalHashtag = 0;

      if (result.length != 0) {
        count = result[0].tweets;
        retweet = result[0].retweet;
        likes = result[0].likes;
        INTERACTION = result[0].interaction;
        favorite = result[0].favorite;
        totalHashtag = result[0].totalHashtag;
        replay = result[0].replay;
      }

      data = {
        tweets: count,
        retweet,
        likes,
        favorite,
        interaction: INTERACTION,
        replay,
        totalHashtag,
      };

      return data;
    })
    .catch((error) => {
    });
};

twitterArchivePost.methods.getArchivedAccountReportsold1 = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  const query = {
    accountId: { $in: list },
    publishedDate: { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) },
  };

  if (keyword != '' && keyword != null) {
    if (keyword.indexOf('#') == 0) {
      query.hashtags = keyword;
    } else {
      query.descritpion = new RegExp(`.*${keyword}.*`);
    }
  }
  if (sentimantScore) query.sentiment = sentimantScore;
  if (custometag.length != 0) {
    skip = 0;
    limit = 0;
  }
  let data = {};

  return this.model('TwitterArchivePost')
    .find(query)
  // .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => {
      let count = 0;
      let retweet = 0;
      let likes = 0;
      let favorite = 0;
      let INTERACTION = 0;
      let replay = 0;
      let totalHashtag = 0;
      const tempObj = [];

      for (var i = 0; i < social_id.length; i++) {
        tempObj[social_id[i].social_id] = 0;
      }

      const datas = [];

      for (var c in result) {
        if (custometag.length != 0) {
          let d = 0;

          for (const e in custometag) {
            if (result[c].customtags.length != 0) {
              for (var f in result[c].customtags) {
                if (result[c].customtags[f].groupname == custometag[e].groupname) {
                  if ((custometag[e].customtags).every((v) => result[c].customtags[f].customtags.includes(v))) {
                    d += 1;
                    if (d == custometag.length) {
                      count += 1;
                      datas.push(result[c]);
                      retweet += result[c].retweetCount;
                      likes += result[c].favoriteCount;
                      INTERACTION += result[c].mentions.length;
                      if (result[c].isLiked) favorite += 1;
                      totalHashtag += result[c].hashtags.length;
                      if (result[c].isReplayTweet) replay += 1;
                      for (var i = 0; i < social_id.length; i++) {
                        if (result[c].accountId == social_id[i].social_id) {
                          tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          count += 1;
          retweet += result[c].retweetCount;
          likes += result[c].favoriteCount;
          INTERACTION += result[c].mentions.length;
          if (result[c].isLiked) favorite += 1;
          totalHashtag += result[c].hashtags.length;
          if (result[c].isReplayTweet) replay += 1;
          for (var i = 0; i < social_id.length; i++) {
            if (result[c].accountId == social_id[i].social_id) {
              tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1;
            }
          }
        }
      }
      data = {
        tweets: count,
        retweet,
        likes,
        favorite,
        interaction: INTERACTION,
        replay,
        totalHashtag,
      };
      if (skip == 0 && limit == 0) {
        if (isForFeeds) return datas;

        return data;
      }

      return result;
    })
    .catch((error) => {
    });
};

twitterArchivePost.methods.removeSocialAccountPosts = function (accountId, isArray, skip, limit) {
  const query = {};

  if (!isArray) query.accountId = new RegExp(accountId, 'i');
  else query.accountId = { $in: accountId };

  return this.model('TwitterArchivePost')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      console.log('Error', error);
    });
};

twitterArchivePost.methods.getSocialAccountPostsArray = function (accountId, skip, limit) {
  const query = {
    accountId: { $in: accountId },
  };

  return this.model('TwitterArchivePost')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log('Error', error);
    });
};

const twitterarchiveModel = mongoose.model('TwitterArchivePost', twitterArchivePost);

module.exports = twitterarchiveModel;
