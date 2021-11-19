import mongoose from 'mongoose';

const trendSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  promoted_content: { type: String, default: null },
  query: { type: String },
  tweet_volume: { type: String, default: null },
});

const locationSchema = new mongoose.Schema({
  name: { type: String },
  woeid: { type: Number },
});

const dataSchema = new mongoose.Schema({
  trends: {
    type: [trendSchema],
  },
  as_of: { type: String },
  created_at: { type: String },
  locations: { type: [locationSchema] },
});

const twitterTrends = new mongoose.Schema({
  woeid: {
    type: Number,
  },
  data: {
    type: dataSchema,
  },
  expire_at: { type: Number },
});

export default mongoose.model('twittertrends', twitterTrends);
