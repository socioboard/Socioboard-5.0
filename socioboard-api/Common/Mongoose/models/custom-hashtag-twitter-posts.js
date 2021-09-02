const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;
const gender = require('gender-detection');
const { gen } = require('gender-detection/genders/male');
const { getGender } = require('gender-detection-from-name');
const detect = require('detect-gender');
const request = require('request');
var rn = require('random-number');
const { datastore_v1 } = require('googleapis');
var rn = require('random-number');
const { count } = require('./facebook-posts');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const customHashtagTwitterPosts = new Schema({
  customhashtag: { type: String },
  tweetId: { type: String, index: true, unique: true },
  publishedDate: { type: Date, default: Date.now, index: true },
  description: { type: String },
  mediaUrls: {
    type: [{
      type: { type: String, default: '' },
      url: { type: String, default: '' },
    }],
  },
  hashtags: { type: [String] },
  mentions: { type: [String] },
  retweetCount: { type: Number },
  favoriteCount: { type: Number },
  postedAccountId: { type: String },
  postedAccountScreenName: { type: String },
  postedAccountUserName: { type: String },
  postedAccountProfilePic: { type: String },
  isApplicationPost: { type: Boolean },
  tweetUrl: { type: String },
  isLiked: { type: Boolean, default: false },
  sentiment: { type: String, default: '' },
  custometag: { type: String, default: '' },
  customtags: {
    type: [{
      groupname: { type: String, default: '' },
      customtags: { type: [String] },
    }],
  },
  quoteDetails: {
    type: [{
      quoteTweetId: { type: String, default: '' },
      quoteTweetUrl: { type: String, default: '' },
      quoteTweetText: { type: String, default: '' },
      quoteTweetMediaUrls: { type: [String] },
    }],
  },
  isReplayTweet: { type: Boolean, default: false },
  isReTweet: { type: Boolean, default: false },
  retweetStatus: {
    type: [{
      retweetTweetId: { type: String, default: '' },
      retweetTweetUrl: { type: String, default: '' },
      retweetTweetText: { type: String, default: '' },
      postedAccountScreenName: { type: String },

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
  likedAccounts: {
    type: [{
      accountId: { type: String, default: '' },
      accountName: { type: String, default: '' },
      followersCount: { type: String, default: '' },
      profilePic: { type: String },
      isLiked: { type: Boolean, default: false },
    }],
  },
  retweetedAccounts: {
    type: [{
      accountId: { type: String, default: '' },
      accountName: { type: String, default: '' },
      followersCount: { type: String, default: '' },
      profilePic: { type: String },
      isRetweeted: { type: Boolean, default: false },
    }],
  },

  batchId: { type: String },
  archivedStatus: { type: String },
  serverMediaUrl: {
    type: [{
      type: { type: String, default: '' },
      url: { type: String, default: '' },
    }],
  },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

customHashtagTwitterPosts.methods.insertManyPosts = function (posts) {
  return this.model('customHashtagTwitterPosts')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { tweetId: post.tweetId },
        update: post,
        //   $setOnInsert:{"archivedStatus":"0"},
        //  $setOnUpdate:{"archivedStatus":"0"},
        upsert: true,
      },
    })))
    .catch((error) => 0);
};

customHashtagTwitterPosts.methods.getSocialAccountPostsForKeyword = function (accountId, keyword, skip, limit, startDate, endDate) {
  let query = {};

  if (!startDate || !endDate) {
    if (keyword.indexOf('#') == 0) {
      query = {
        accountId: new RegExp(accountId, 'i'),
        hashtags: keyword,
      };
    } else {
      query = {
        accountId: new RegExp(accountId, 'i'),
        descritpion: new RegExp(`.*${keyword}.*`),
      };
    }
  } else if (keyword.indexOf('#') == 0) {
    query = {
      accountId: new RegExp(accountId, 'i'),
      hashtags: keyword,
      publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
  } else {
    query = {
      accountId: new RegExp(accountId, 'i'),
      descritpion: new RegExp(`.*${keyword}.*`),
      publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
  }

  return this.model('customHashtagTwitterPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.deleteAccountPosts = function (accountId) {
  const query = {
    accountId: new RegExp(accountId, 'i'),
  };

  return this.model('customHashtagTwitterPosts')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.deleteSingleTweet = function (tweetId) {
  const query = {
    tweetId: new RegExp(tweetId),
  };

  return this.model('customHashtagTwitterPosts')
    .findOneAndDelete(query)
    .then((result) => {
      if (!result) {
        return 'No tweet found';
      }

      return 'Deleted tweet succesfully';
    })
    .catch((error) => {
      throw new Error(error);
    });
};

customHashtagTwitterPosts.methods.findLastRecentTweetId = function () {
  return this.model('customHashtagTwitterPosts')
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

customHashtagTwitterPosts.methods.getTwitterByCustomHashtag = function (keyword, skip, limit) {
  const query = {
    customhashtag: keyword,
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .then((result) => result)
    .catch((error) => {
    });

  // return this.model('customHashtagTwitterPosts')
  // .find(query)
  // .skip(skip)
  // .limit(limit)
  // .then(function (result) {
  //     if (!result) {
  //         throw new Error('no previous data found.');
  //     } else {
  //         return result;
  //     }
  // })
  // .catch(function (error) {
  //     return '';
  // });
};

customHashtagTwitterPosts.methods.returnmaxId = function (customhashtag) {
  return this.model('customHashtagTwitterPosts')
    .find({ customhashtag }).limit(1).sort({ publishedDate: 1 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result[0].tweetId ? result[0].tweetId : '';
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.returnmaxIdWithDate = function (customhashtag) {
  return this.model('customHashtagTwitterPosts')
    .find({ customhashtag }).limit(1).sort({ publishedDate: 1 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result || '';
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.returnSinceId = function (customhashtag) {
  return this.model('customHashtagTwitterPosts')
    .find({ customhashtag }).limit(1).sort({ publishedDate: -1 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        return result[0].tweetId ? result[0].tweetId : '';
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.updateCommentCount = function (tweetId, method) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = { $inc: { retweetCount: 1 } };
  } else {
    updateObject = { $inc: { retweetCount: -1 } };
  }

  return this.model('customHashtagTwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

customHashtagTwitterPosts.methods.findAllHashTags = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
  let list = [];

  if (linkedHashtag) {
    list = list.concat(hashtags);
  } else {
    for (const ids in hashtags) {
      list = list.concat(hashtags[ids].customhashtag);
    }
  }

  let query = {};

  if (linkedHashtag) {
    if (custometag.length != 0) {
      const condition = [];

      custometag.map((customTag) => {
        condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
          { 'customtags.customtags': { $all: customTag.customtags } });
      });

      query = { $and: condition };
    }
  }

  query.customhashtag = { $in: list };

  return this.model('customHashtagTwitterPosts')
    .find(query, { customhashtag: 1, hashtags: 1, _id: 0 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        let data = [];

        if (linkedHashtag) {
          for (var count in result) {
            if ([result[count].hashtags].length != 0) data = data.concat(result[count].hashtags);
          }
        } else {
          for (var count in result) {
            for (var datas in list) {
              if (result[count].customhashtag == list[datas]) {
                data = data.concat(list[datas]);
              }
            }
          }
        }

        const occurrences = {};

        for (let i = 0, j = data.length; i < j; i++) {
          occurrences[data[i]] = (occurrences[data[i]] || 0) + 1;
        }

        var datas = {
          totalPost: result.length,
          totalNumberofHashtag: result.length,
          occurrences,
        };

        return datas;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getlinkedwithhashtag = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
  let list = [];

  if (linkedHashtag) {
    list = list.concat(hashtags);
  } else {
    for (const ids in hashtags) {
      list = list.concat(hashtags[ids].customhashtag);
    }
  }

  let query = {};

  if (linkedHashtag) {
    if (custometag.length != 0) {
      const condition = [];

      custometag.map((customTag) => {
        condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
          { 'customtags.customtags': { $all: customTag.customtags } });
      });

      query = { $and: condition };
    }
  }

  query.customhashtag = { $in: list };

  query = [
    { $match: query },
    {
      $project: {
        customhashtag: 1,
        hashtags: 1,
      },
    },
    { $unwind: '$hashtags' },
    {
      $group: {
        _id: { customhashtag: '$customhashtag', hashtags: '$hashtags' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        tag: '$_id.hashtags',
        count: 1,
        _id: 0,

      },
    },
    { $sort: { count: -1 } },
  ];

  return this.model('customHashtagTwitterPosts')
    .aggregate(query).skip(0).limit(100)
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const datas = {
          occurrences: result,
        };

        return datas;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.geteEmsSuggestedHashtag = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
  let list = [];

  if (linkedHashtag) {
    list = list.concat(hashtags);
  } else {
    for (const ids in hashtags) {
      list = list.concat(hashtags[ids].customhashtag);
    }
  }

  let query = {};

  if (linkedHashtag) {
    if (custometag.length != 0) {
      const condition = [];

      custometag.map((customTag) => {
        condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
          { 'customtags.customtags': { $all: customTag.customtags } });
      });

      query = { $and: condition };
    }
  }

  query.customhashtag = { $in: list };

  query = [{ $match: { customhashtag: { $in: list } } },
    { $group: { _id: '$customhashtag', count: { $sum: 1 } } },
    {
      $project: {
        tag: '$_id',
        count: 1,
        _id: 0,

      },
    },
  ];

  return this.model('customHashtagTwitterPosts')
    .aggregate(query)
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const datas = {
          occurrences: result,
        };

        return datas;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getTweetDayWiseold = function (social_id, isforTeam) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }

  return this.model('customHashtagTwitterPosts')
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
        const daywise = [];
        let totalPost = 0; let totalLike = 0; let totalRetweet = 0; let
          totalHashtag = 0;

        if (result.length != 0) {
          for (const count in result) {
            totalPost += result[count].tweets;
            totalLike += result[count].likes;
            totalRetweet += result[count].retweets;
            totalHashtag += result[count].hashtags;
            const daywises = {
              date: result[count]._id,
              likes: result[count].likes,
              retweets: result[count].retweets,
              hashtags: result[count].hashtags,
              tweets: result[count].tweets,
            };

            daywise.push(daywises);
          }
        }
        const data = {
          totalPost,
          totalLike,
          totalRetweet,
          totalHashtag,
          data: daywise,
        };

        return data;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.updateLikeCount = function (tweetId, method) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };
  let updateObject = '';

  if (method == 'increment') {
    updateObject = { $inc: { favoriteCount: 1 } };
  } else {
    query.favoriteCount = { $gte: 1 };
    updateObject = { $inc: { favoriteCount: -1 } };
  }

  return this.model('customHashtagTwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

customHashtagTwitterPosts.methods.updateLikeedAccount = function (tweetId, accountId, accountName, followersCount, profilePic, isLiked) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
    'likedAccounts.accountId': { $ne: accountId },

  };

  this.model('customHashtagTwitterPosts')
    .updateOne(query, {
      $push: {
        likedAccounts: {
          accountId,
          accountName,
          followersCount,
          profilePic,
          isLiked,
        },
      },
    })
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });

  this.model('customHashtagTwitterPosts')
    .findOneAndUpdate({
      'likedAccounts.accountId': accountId,
      tweetId,
    }, {
      $set: {
        'likedAccounts.$.isLiked': isLiked,
      },
    })
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

customHashtagTwitterPosts.methods.updateRetweetedaccount = function (tweetId, accountId, accountName, followersCount, profilePic, isRetweeted) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
    'retweetedAccounts.accountId': { $ne: accountId },
  };

  this.model('customHashtagTwitterPosts')
    .updateOne(query, {
      $push: {
        retweetedAccounts: {
          accountId,
          accountName,
          followersCount,
          profilePic,
          isRetweeted,
        },
      },
    })
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });

  this.model('customHashtagTwitterPosts')
    .findOneAndUpdate({
      'retweetedAccounts.accountId': accountId,
      tweetId,
    }, {
      $set: {
        'retweetedAccounts.$.isRetweeted': isRetweeted,
      },
    })
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

customHashtagTwitterPosts.methods.getTweetDayWise = function (hashtags, startDate, endDate, sentiment, custometag) {
  var timestamp = Number(new Date(startDate).setHours(0, 0, 0));

  startDate = new Date(timestamp);
  var timestamp = Number(new Date(endDate).setHours(23, 59, 59));

  endDate = new Date(timestamp);

  let query;

  query = {
    $match: {
      customhashtag: hashtags,
      publishedDate: { $gte: startDate, $lte: endDate },
    },
  };

  if (sentiment) {
    query = {
      $match: {
        customhashtag: hashtags,
        sentiment,
        publishedDate: { $gte: startDate, $lte: endDate },
      },
    };
  }
  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    if (sentiment) {
      query = {
        $match: {
          $and: condition,
          sentiment,
          customhashtag: hashtags,
          publishedDate: { $gte: startDate, $lte: endDate },
        },
      };
    } else {
      query = {
        $match: {
          $and: condition,
          customhashtag: hashtags,
          publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      };
    }
  }

  return this.model('customHashtagTwitterPosts')
    .aggregate([
      query,
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
          numberMention: { $cond: { if: { $isArray: '$mentions' }, then: { $size: '$mentions' }, else: '0' } },
        },
      },
      {
        $group: {
          _id: '$date',
          likes: { $sum: '$favoriteCount' },
          retweets: { $sum: '$retweetCount' },
          tweets: { $sum: 1 },
          mentions: { $sum: '$numberMention' },
          hashtags: { $sum: '$numberHashtag' },
        },
      },
      { $sort: { _id: -1 } },
    ])
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const dates = [];

        if (startDate && endDate) {
          const day = 1000 * 60 * 60 * 24;

          date1 = new Date(startDate);
          date2 = new Date(endDate);

          const diff = (date2.getTime() - date1.getTime()) / day;

          for (let i = 0; i <= diff; i++) {
            const xx = date1.getTime() + day * i;
            const yy = new Date(xx);

            dates.push(yy);
          }
        }

        const results = result;
        let daywise = [];
        let totalPost = 0; let totalLike = 0; let totalRetweet = 0; let totalHashtag = 0; let totalMention = 0; const
          interaction = 0;

        if (result.length != 0) {
          for (var count in result) {
            totalPost += result[count].tweets;
            totalLike += result[count].likes;
            totalRetweet += result[count].retweets;
            totalHashtag += result[count].hashtags;
            totalMention += result[count].mentions;
            var daywises = {
              date: result[count]._id,
              likes: result[count].likes,
              retweets: result[count].retweets,
              hashtags: result[count].hashtags,
              tweets: result[count].tweets,
              mentions: result[count].mentions,
            };

            daywise.push(daywises);
          }

          if (startDate && endDate) {
            const daywisesData = [];

            for (var count in dates) {
              var daywises = {
                date: (`${dates[count].getFullYear()}-${(`0${dates[count].getMonth() + 1}`).slice(-2)}-${(`0${dates[count].getDate()}`).slice(-2)}`),
                likes: 0,
                retweets: 0,
                hashtags: 0,
                tweets: 0,
                mentions: 0,
              };

              daywisesData.push(daywises);
            }
            for (const d in daywisesData) {
              for (const c in daywise) {
                if (daywisesData[d].date == daywise[c].date) {
                  daywisesData[d].date = daywise[c].date;
                  daywisesData[d].likes = daywise[c].likes;
                  daywisesData[d].retweets = daywise[c].retweets;
                  daywisesData[d].hashtags = daywise[c].hashtags;
                  daywisesData[d].tweets = daywise[c].tweets;
                  daywisesData[d].mentions = daywise[c].mentions;
                }
                // daywisesData.push(daywises)
              }
            }

            daywise = daywisesData;
          }
        }
        const data = {
          totalPost,
          totalLike,
          totalRetweet,
          totalHashtag,
          totalMention,
          interaction: (totalMention / totalPost) * 100,
          data: daywise,
        };

        return data;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getSentimentAnalysis = function (hashtag, startDate, endDate, custometag) {
  var timestamp = Number(new Date(startDate).setHours(0, 0, 0));

  startDate = new Date(timestamp);
  var timestamp = Number(new Date(endDate).setHours(23, 59, 59));

  endDate = new Date(timestamp);

  let query = {};

  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    query = { $and: condition };
  }

  query.customhashtag = hashtag;

  if (startDate && endDate) {
    query.publishedDate = { $gte: startDate, $lte: endDate };
  }

  query = [
    { $match: query },
    {
      $project: {
        customhashtag: 1,
        sentiment: 1,
      },
    },
    {
      $group: {
        _id: { customhashtag: '$customhashtag', sentiment: '$sentiment' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {

        sentiment: '$_id.sentiment',
        count: 1,
        _id: 0,
        //
      },
    },
  ];

  return this.model('customHashtagTwitterPosts')
    .aggregate(query)
  // .find({ accountId:  social_id }, { sentiment: 1, _id: 0 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        let totalCount = result.length;

        if (totalCount > 0) {
          totalCount = 0;
          var pos = 0;
          var neg = 0;
          var neu = 0;

          for (const count in result) {
            if (result[count].sentiment == 0) {
              neu = result[count].count;
            } else if (result[count].sentiment == -1) {
              neg = result[count].count;
            } else {
              pos = result[count].count;
            }
          }
        }
        totalCount = neu + neg + pos;

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
    })

    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getGenderAnalysisRand = function (social_id, isforTeam, hashtag, startDate, endDate) {
  const genf = rn.generator({
    min: 3,
    max: 55,
    integer: true,
  });
  const f = genf(47);
  const m = genf(42);
  const ot = genf(0);
  const genderDataAnalysis = {

    female: f,
    male: m,
    unknown: ot,
  };

  return genderDataAnalysis;
};

customHashtagTwitterPosts.methods.getCustomTagsFeeds = function (tweetId, groupName) {
  let query = {};

  query = {
    tweetId,
  };

  return this.model('customHashtagTwitterPosts')
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

customHashtagTwitterPosts.methods.getGenderAnalysis = function (social_id, isforTeam, hashtag, startDate, endDate) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  let query = {};

  if (!hashtag) {
    query = { accountId: { $in: list } };
  } else {
    query = { accountId: { $in: list }, hashtags: hashtag };
  }

  if (startDate && endDate) {
    query.publishedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return this.model('customHashtagTwitterPosts')
    .find(query)
  // .find({ accountId:  social_id }, { sentiment: 1, _id: 0 })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const totalCount = result.length;

        if (totalCount > 0) {
          let data;
          const mentions = [];

          for (const c in result) {
            if (result[c].mentions.length != 0) {
              for (let i = 0; i < result[c].mentions.length; i++) {
                mentions.push(result[c].mentions[i]);
              }
            }
          }

          let female = 0;
          let male = 0;
          let unknown = 0;
          const total = mentions.length;

          for (const d in mentions) {
            const parsename = mentions[d].replace(/[^a-zA-Z]/g, '');

            request.get({
              url: `https://api.genderize.io/?name=${parsename}`,
            }, (error, response, body) => {
              const parsedBody = JSON.parse(body);
              const genType = parsedBody.gender;

              if (genType == 'female') female += 1;
              else if (genType == 'male') male += 1;
              else unknown += 1;
            });
          }

          const genderDataAnaylisi = {
            female: (female / total) * 100,
            male: (male / total) * 100,
            unknown: (unknown / total) * 100,
          };

          return genderDataAnaylisi;
        }

        return result;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.setSentimentStatus = function (tweetId, sentimentStatus) {
  const query = {
    tweetId,
  };
  const updateObject = {};

  updateObject.sentiment = sentimentStatus;

  return this.model('customHashtagTwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Status changed succesfully';
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.setCustomTag = function (socialAccount, tweetId, customeTagValue) {
  const query = {
    accountId: socialAccount.social_id,
    tweetId,
  };
  const updateObject = {};

  updateObject.custometag = customeTagValue;

  return this.model('customHashtagTwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Custome Tag Updated succesfully';
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.setCustomTags = function (tweetId, customeTagValue) {
  const query = {
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

  return this.model('customHashtagTwitterPosts')
    .findOneAndUpdate(query, updateObject)
    .then((result) => {
      if (!result) return 'No tweet found';

      return 'Custom Tag Updated succesfully';
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.setCustomTagsSpecificGroup = function (tweetId, customeTagValue) {
  const query = {
    tweetId,
  };

  const groupName = customeTagValue[0].groupname;

  return this.model('customHashtagTwitterPosts')
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

customHashtagTwitterPosts.methods.getCustomTag = function (accountId, teamId) {
  const query = {
    accountId: new RegExp(accountId, 'i'),
    custometag: { $ne: null },
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
  // .sort({ custometag:  })
  // .skip(skip)
    .limit(10)
    .then((result) => {
      result = result.map((t) => t.custometag);

      return result;
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.findTweet = function (tweetId) {
  return this.model('customHashtagTwitterPosts')
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

customHashtagTwitterPosts.methods.getArchivedAccountDetail = function (socialData) {
  let list = [];

  const dataToReturn = socialData.accountDetails;

  for (const count in socialData.accountDetails) list = list.concat(socialData.accountDetails[count].social_id);

  return this.model('customHashtagTwitterPosts')
    .aggregate([
      { $match: { accountId: { $in: list } } },
      { $unwind: '$accountId' },
      { $group: { _id: '$accountId', count: { $sum: 1 }, archivedStatus: { $addToSet: '$archivedStatus' } } },
    ])
  // .distinct( "archivedStatus", { accountId:  { $in : list }},
  // {$group : { _id : "$accountId" } })
  // .find()
  // .find({ accountId:  { $in : list } })
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        const data = result;

        if (data.length != 0) {
          for (const c in data) {
            for (const d in dataToReturn) {
              if (dataToReturn[d].social_id == data[c]._id) {
                for (const dd in data[c].archivedStatus) {
                  if (data[c].archivedStatus[dd] == '0') {
                    dataToReturn[d].dataValues.status = 0;
                    break;
                  } else if (data[c].archivedStatus[dd] == '2') {
                    dataToReturn[d].dataValues.status = 2;
                    break;
                  } else {
                    dataToReturn[d].dataValues.status = 1;
                  }
                }
              }
            }
          }
        }

        return dataToReturn;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getSocialAccountPostsArray = function (accountId, skip, limit) {
  const query = {
    accountId: { $in: accountId },
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.getSingleCustomHashtagFeed = function (tweetId, skip, limit) {
  const query = {
    tweetId,
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
  // .sort({ publishedDate: -1 })
  // .skip(skip)
  // .limit(limit)
    .then((result) => result)
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.getPrimitiveReport = function (statData, social_id, isforTeam, startDate, endDate) {
  let list = [];
  let totalFollowers = 0;

  if (!isforTeam) {
    list = list.concat(social_id);
    totalFollowers = statData.followers;
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
      totalFollowers += parseInt(social_id[ids].friendship_counts);
    }
  }

  let query = {};

  query = {
    $match: {
      accountId: { $in: list },
      publishedDate: { $gte: (new Date(startDate)), $lte: new Date(endDate) },
    },
  };

  return this.model('customHashtagTwitterPosts')
    .aggregate([
      query,
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
          numberMention: { $cond: { if: { $isArray: '$mentions' }, then: { $size: '$mentions' }, else: '0' } },

        },
      },
      {
        $group: {
          _id: '$date',
          likes: { $sum: '$favoriteCount' },
          retweets: { $sum: '$retweetCount' },
          tweets: { $sum: 1 },
          mentions: { $sum: '$numberMention' },
          hashtags: { $sum: '$numberHashtag' },

        },
      },
      { $sort: { _id: -1 } },
    ])
    .then((result) => {
      if (!result) {
        throw new Error('no previous data found.');
      } else {
        if (startDate && endDate) {
          const day = 1000 * 60 * 60 * 24;

          date1 = new Date(startDate);
          date2 = new Date(endDate);

          var dates = [];
          const diff = (date2.getTime() - date1.getTime()) / day;

          for (let i = 0; i <= diff; i++) {
            const xx = date1.getTime() + day * i;
            const yy = new Date(xx);

            dates.push(yy);
          }
        }

        const results = result;
        let daywise = [];
        let totalPost = 0; let totalLike = 0; let totalRetweet = 0; let totalHashtag = 0; let totalMention = 0; const interaction = 0; const
          totalmediaUrls = 0;

        if (result.length != 0) {
          for (var count in result) {
            totalPost += result[count].tweets;
            totalLike += result[count].likes;
            totalRetweet += result[count].retweets;
            totalHashtag += result[count].hashtags;
            totalMention += result[count].mentions;
            var daywises = {
              date: result[count]._id,
              likes: result[count].likes,
              retweets: result[count].retweets,
              hashtags: result[count].hashtags,
              tweets: result[count].tweets,
              mentions: result[count].mentions,
            };

            daywise.push(daywises);
          }

          if (startDate && endDate) {
            const daywisesData = [];

            for (var count in dates) {
              var daywises = {
                date: (`${dates[count].getFullYear()}-${dates[count].getMonth() + 1}-${dates[count].getDate()}`),
                likes: 0,
                retweets: 0,
                hashtags: 0,
                tweets: 0,
                mentions: 0,
              };

              daywisesData.push(daywises);
            }
            for (const d in daywisesData) {
              for (const c in daywise) {
                if (daywisesData[d].date == daywise[c].date) {
                  daywisesData[d].date = daywise[c].date;
                  daywisesData[d].likes = daywise[c].likes;
                  daywisesData[d].retweets = daywise[c].retweets;
                  daywisesData[d].hashtags = daywise[c].hashtags;
                  daywisesData[d].tweets = daywise[c].tweets;
                  daywisesData[d].mentions = daywise[c].mentions;
                }
                // daywisesData.push(daywises)
              }
            }

            daywise = daywisesData;
          }
        }
        const data = {
          totalPost,
          totalLike,
          totalRetweet,
          totalHashtag,
          totalMention,
          totalmediaUrls: statData.totalMediaUrls,
          totalPlainText: statData.totalPlainText,
          totalLinks: statData.totalLinks,
          totalFollowers,
          interaction: (totalMention / totalPost) * 100,
          data: daywise,
        };

        return data;
      }
    })
    .catch((error) => '');
};

customHashtagTwitterPosts.methods.getPrimitiveReportStats = function (social_id, isforTeam, startDate, endDate) {
  let list = [];

  if (!isforTeam) {
    list = list.concat(social_id);
  } else {
    for (const ids in social_id) {
      list = list.concat(social_id[ids].social_id);
    }
  }
  let query = {};

  query = {
    accountId: { $in: list },
    publishedDate: { $gte: (new Date(startDate)), $lte: new Date(endDate) },
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
    .sort({ publishedDate: -1 })
    .skip(0)
    .limit(0)
    .then((result) => {
      let totalMediaUrls = 0;
      let totalPlainText = 0;
      let totalLinks = 0;

      for (const count in result) {
        if (result[count].mediaUrls.length != 0) {
          totalMediaUrls += result[count].mediaUrls.length;
        } else if (new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(result[count].descritpion)) {
          totalLinks += 1;
        } else {
          totalPlainText += 1;
        }
      }

      const data = {
        totalMediaUrls,
        totalPlainText,
        totalLinks,
      };

      return data;
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.getCustomHashtagAnalytics = function (hashtags, startDate, endDate, sentiment, custometag) {
  var timestamp = Number(new Date(startDate).setHours(0, 0, 0));

  startDate = new Date(timestamp);
  var timestamp = Number(new Date(endDate).setHours(23, 59, 59));

  endDate = new Date(timestamp);

  let query = {};

  if (custometag.length != 0) {
    const condition = [];

    custometag.map((customTag) => {
      condition.push({ customtags: { $elemMatch: { groupname: customTag.groupname } } },
        { 'customtags.customtags': { $all: customTag.customtags } });
    });

    query = { $and: condition };
  }
  query.customhashtag = hashtags;
  if (startDate && endDate) {
    query.publishedDate = { $gte: startDate, $lte: endDate };
  }
  if (sentiment) query.sentiment = sentiment;

  return this.model('customHashtagTwitterPosts')
    .find(query, {})
  // .sort({ publishedDate: -1 })
  // .skip(skip)
  // .limit(limit)
    .then((result) => {
      let retweet = 0;
      let likes = 0;
      let favorite = 0;
      let INTERACTION = 0;
      let replay = 0;
      let totalMale = 0;
      let totalFemale = 0;
      let totalunknown = 0;
      let tweetsCount = 0;

      for (const c in result) {
        tweetsCount = result.length;
        retweet += result[c].retweetCount;
        likes += result[c].favoriteCount;

        INTERACTION += result[c].mentions.length;

        if (result[c].isLiked) favorite += 1;

        if (result[c].isReplayTweet) replay += 1;

        var genders;

        if (result[c].postedAccountUserName) genders = gender.detect(result[c].postedAccountUserName);
        else genders = gender.detect(result[c].postedAccountScreenName);
        if (genders == 'male') totalMale += 1;
        else if (genders == 'female') totalFemale += 1;
        else totalunknown += 1;
      }

      const percentage = {
        male: (totalMale / tweetsCount) * 100,
        female: (totalFemale / tweetsCount) * 100,
        unknown: (totalunknown / tweetsCount) * 100,

      };

      const genf = rn.generator({
        min: 3,
        max: 50,
        integer: true,
      });
      const f = genf(47);
      const m = genf(42);
      const ot = genf(0);
      const genderDataAnalysis = {

        female: f,
        male: m,
        unknown: ot,
      };

      const genderAnalysisData = {
        percentage,
      };

      const data = {
        tweets: tweetsCount,
        retweet,
        likes,
        favorite,
        interaction: INTERACTION,
        replay,
        genderAnalysis: genderAnalysisData,
      };

      return data;
    })
    .catch((error) => {
    });
};

customHashtagTwitterPosts.methods.getSocialAccountSinglePostsLikeAndRetweetCount = function (tweetId) {
  const query = {
    tweetId: new RegExp(tweetId, 'i'),
  };

  return this.model('customHashtagTwitterPosts')
    .find(query)
  // .sort({ publishedDate: -1 })
  // .skip(skip)
  // .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

const customhashtagtwitterpostsModel = mongoose.model('customHashtagTwitterPosts', customHashtagTwitterPosts);

module.exports = customhashtagtwitterpostsModel;
