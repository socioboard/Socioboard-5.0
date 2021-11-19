import twitterTrendsSchema from '../schemas/twitter-trends.schema.js';

class TwitterTrends {
  getTrendsByWoeid(woeid) {
    const returnOptions = {
      _id: 0,
      __v: 0,
      'data._id': 0,
      'data.trends._id': 0,
      'data.locations._id': 0,
    };

    return twitterTrendsSchema.findOne({ woeid }, returnOptions);
  }

  updateOrInsertTrends(woeid, data) {
    const expire_at = new Date().getTime();

    return twitterTrendsSchema.replaceOne(
      { woeid },
      { woeid, data, expire_at },
      { upsert: true },
    );
  }
}

export default new TwitterTrends();
