import mongoose from 'mongoose';
import moment from 'moment';

const {Schema} = mongoose;

mongoose.set('useCreateIndex', true);

const publishedPost = new Schema({
  publishedDate: {type: Date, default: Date.now},
  accountId: {type: Number, index: true},
  fullPublishContentId: {type: String},
  postCategory: {type: String},
  publishedContentDetails: {type: String},
  publishedMediaUrls: {type: [String]},
  postShareUrl: {type: String},
  PublishedId: {type: String, index: true, unique: true},
  PublishedUrl: {type: String},
  PublishedStatus: {type: String},
  TeamId: {type: Number},
});

publishedPost.methods.insertManyPosts = function (posts) {
  return this.model('PublishedPosts')
    .insertMany(posts)
    .then(postdetails => postdetails.length)
    .catch(error => 0);
};

publishedPost.methods.getTodayPostsCount = function (accountId) {
  const query = {
    publishedDate: {
      $gte: moment().startOf('day'),
      $lt: moment().endOf('day'),
    },
    accountId,
  };

  return this.model('PublishedPosts')
    .find(query)
    .then(result => result.length)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getXdaysPostsCount = function (accountId, dayCount) {
  const startDate = moment()
    .add(-1 * dayCount, 'days')
    .startOf('day');
  const query = {
    publishedDate: {
      $gte: startDate,
      $lt: moment().endOf('day'),
    },
    accountId: Number(accountId),
  };

  return this.model('PublishedPosts')
    .find(query)
    .then(result => result.length)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getAccountPublishCount = function (accountId) {
  const query = {
    accountId: Number(accountId),
  };

  return this.model('PublishedPosts')
    .find(query)
    .then(result => result.length)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getSchedulePublishedReport = function (
  mongoId,
  skip,
  limit
) {
  const query = {
    fullPublishContentId: mongoId,
  };

  return this.model('PublishedPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getAccountPublishedReport = function (
  accountId,
  teamId,
  skip,
  limit
) {
  let query;

  if (accountId != 0) {
    query = {
      accountId,
    };
  }
  if (teamId) {
    if (query) {
      query.TeamId = teamId;
    } else {
      query = {
        TeamId: teamId,
      };
    }
  }

  return this.model('PublishedPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getTeamSchedulerStats = function (
  socialAccounts,
  TeamId,
  since,
  until
) {
  let query = {};
  const accountId = [];

  socialAccounts.map(x => {
    accountId.push(x.account_id);
  });
  query = {
    accountId: {$in: accountId},
    TeamId,
    publishedDate: {$gte: new Date(since), $lte: new Date(until)},
  };
  query = [
    {$match: query},
    {
      $project: {
        date: {$dateToString: {format: '%Y-%m-%d', date: '$publishedDate'}},
        postCount: {$cond: [{$eq: ['$PublishedStatus', 'Success']}, 1, 0]},
        postFailed: {$cond: [{$ne: ['$PublishedStatus', 'Success']}, 1, 0]},
      },
    },
    {
      $group: {
        // _id: "$date",
        _id: '$date',
        postCount: {$sum: '$postCount'},
        postFailed: {$sum: '$postFailed'},
      },
    },
    {$sort: {_id: 1}},
    {
      $project: {
        _id: 0,
        date: '$_id',
        postCount: '$postCount',
        postFailed: '$postFailed',
      },
    },
  ];

  return this.model('PublishedPosts')
    .aggregate(query)
    .then(result => {
      if (!result) {
        throw new Error('no previous data found.');
      }

      return result;
    })
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.removeTeamsPublishedReport = function (teamId) {
  const query = {
    TeamId: teamId,
  };

  return this.model('PublishedPosts')
    .deleteMany(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.removeAccountsPublishedReport = function (accountId) {
  const query = {
    accountId,
  };

  return this.model('PublishedPosts')
    .deleteMany(query)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getTeamPublishedCount = function (teamId) {
  // Fetching total posts counts published in an account
  const query = {
    TeamId: Number(teamId),
  };

  return this.model('PublishedPosts')
    .find(query)
    .then(result => result.length)
    .catch(error => {
      throw error;
    });
};

publishedPost.methods.getPublishedPosts = function (
  ownerId,
  TeamId,
  skip,
  limit
) {
  const query = {
    //  ownerId: ownerId,
    TeamId,
  };

  return this.model('PublishedPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      console.log(error);
    });
};

/**
 * TODO To get total scheduled post count for array of team
 * @description To get total scheduled post count for array of team
 * @param  {number} TeamId -Team id report
 * @return {string} Return total scheduled post count for array of team
 */
publishedPost.methods.getTotalTeamSchedulerStats = function (TeamId) {
  const query = [
    {
      $match: {
        TeamId: {$in: TeamId},
      },
    },
    {
      $project: {
        postCount: {$cond: [{$eq: ['$PublishedStatus', 'Success']}, 1, 0]},
        postFailed: {$cond: [{$ne: ['$PublishedStatus', 'Success']}, 1, 0]},
      },
    },
    {
      $group: {
        _id: '$TeamId',
        postCount: {$sum: '$postCount'},
        postFailed: {$sum: '$postFailed'},
      },
    },
    {$sort: {_id: 1}},
    {$project: {_id: 0, postCount: '$postCount', postFailed: '$postFailed'}},
  ];

  return this.model('PublishedPosts')
    .aggregate(query)
    .then(result => {
      if (!result) {
        throw new Error('no previous data found.');
      }

      return result;
    })
    .catch(error => {
      throw error;
    });
};

/**
 * TODO To get all published post for a schedule
 * @description To get all published post for a schedule
 * @param  {number} fullPublishContentId -Schedule id
 * @return {object} Return all published content for a schedule post
 */
publishedPost.methods.getPublishedSchedulePostById = function (
  fullPublishContentId,
  skip,
  limit
) {
  return this.model('PublishedPosts')
    .find({fullPublishContentId})
    .skip(Number(skip))
    .limit(Number(limit))
    .sort({publishedDate: -1})
    .then(result => result)
    .catch(error => {});
};

/**
 * TODO To get all published post for a schedule
 * @description To get all published post for a schedule
 * @param  {number} fullPublishContentId -Schedule id
 * @return {object} Return all published content for a schedule post
 */
publishedPost.methods.filterPublishedPosts = function (
  ownerId,
  TeamId,
  skip,
  limit,
  searchPublishedPostInfo,
  publishedStatus,
  date
) {
  const query = {
    TeamId,
  };
  if (searchPublishedPostInfo?.accountId?.length > 0)
    query.accountId = {$in: searchPublishedPostInfo?.accountId};
  if (searchPublishedPostInfo?.fullPublishContentId?.length > 0)
    query.fullPublishContentId = {
      $in: searchPublishedPostInfo?.fullPublishContentId,
    };
  if (searchPublishedPostInfo?.postCategory)
    query.postCategory = new RegExp(
      `.*${searchPublishedPostInfo?.postCategory}.*`,
      'i'
    );
  if (searchPublishedPostInfo?.publishedContentDetails)
    query.publishedContentDetails = new RegExp(
      `.*${searchPublishedPostInfo?.publishedContentDetails}.*`,
      'i'
    );
  if (searchPublishedPostInfo?.postShareUrl)
    query.postShareUrl = new RegExp(
      `.*${searchPublishedPostInfo?.postShareUrl}.*`,
      'i'
    );
  if (searchPublishedPostInfo?.PublishedUrl)
    query.PublishedUrl = new RegExp(
      `.*${searchPublishedPostInfo?.PublishedUrl}.*`,
      'i'
    );
  if (publishedStatus)
    publishedStatus === 'Success'
      ? (query.PublishedStatus = 'Success')
      : (query.PublishedStatus = {$ne: 'Success'});

  if (date) {
    let timestamp = Number(new Date(date.since).setHours(0, 0, 0));
    let startDate = new Date(timestamp);
    timestamp = Number(new Date(date.untill).setHours(23, 59, 59));
    let endDate = new Date(timestamp);
    query.publishedDate = {$gte: startDate, $lte: endDate};
  }
  return this.model('PublishedPosts')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      console.log(error);
    });
};

const publishedPostModel = mongoose.model('PublishedPosts', publishedPost);

export default publishedPostModel;
