import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  url: { type: String },
  expanded_url: { type: String },
  display_url: { type: String },
  indices: { type: [Number] },
});

const userMentionsSchema = new mongoose.Schema({
  screen_name: { type: String },
  name: { type: String },
  id: { type: Number },
  id_str: { type: String },
  indices: { type: [Number] },
});

const entitiesHashtag = new mongoose.Schema({
  text: { type: String },
  indices: { type: [Number] },
});

const twitterPost = new mongoose.Schema({
  accountId: {
    type: String,
    index: true,
    unique: false,
  },
  type: {
    type: String,
    enum: ['follower', 'friend'],
  },
  user: {
    id: { type: Number },
    id_str: { type: String },
    name: { type: String },
    screen_name: { type: String },
    location: { type: String },
    description: { type: String },
    url: { type: String },
    entities: {
      url: {
        urls: { type: [urlSchema] },
      },
      description: {
        urls: { type: [urlSchema] },
      },
    },
    protected: { type: Boolean },
    followers_count: { type: Number },
    friends_count: { type: Number },
    listed_count: { type: Number },
    created_at: { type: String },
    favourites_count: { type: Number },
    utc_offset: { type: String, default: null },
    time_zone: { type: String, default: null },
    geo_enabled: { type: Boolean },
    verified: { type: Boolean },
    statuses_count: { type: Number },
    lang: { type: String, default: null },
    status: {
      created_at: { type: String },
      id: { type: Number },
      id_str: { type: String },
      text: { type: String },
      truncated: { type: Boolean },
      entities: {
        hashtags: { type: [entitiesHashtag] },
        symbols: { type: [String] },
        user_mentions: { type: [userMentionsSchema] },
        urls: { type: [urlSchema] },
      },
      source: { type: String },
      in_reply_to_status_id: { type: Number, default: null },
      in_reply_to_status_id_str: { type: String, default: null },
      in_reply_to_user_id: { type: Number, default: null },
      in_reply_to_user_id_str: { type: String, default: null },
      in_reply_to_screen_name: { type: String, default: null },
      geo: { type: String, default: null },
      coordinates: { type: String, default: null },
      place: { type: String, default: null },
      contributors: { type: String, default: null },
      is_quote_status: { type: Boolean },
      retweet_count: { type: Number },
      favorite_count: { type: Number },
      favorited: { type: Boolean },
      retweeted: { type: Boolean },
      possibly_sensitive: { type: Boolean },
      lang: { type: String },
    },
    contributors_enabled: { type: Boolean },
    is_translator: { type: Boolean },
    is_translation_enabled: { type: Boolean },
    profile_background_color: { type: String },
    profile_background_image_url: { type: String },
    profile_background_image_url_https: { type: String },
    profile_background_tile: { type: Boolean },
    profile_image_url: { type: String },
    profile_image_url_https: { type: String },
    profile_banner_url: { type: String },
    profile_link_color: { type: String },
    profile_sidebar_border_color: { type: String },
    profile_sidebar_fill_color: { type: String },
    profile_text_color: { type: String },
    profile_use_background_image: { type: Boolean },
    has_extended_profile: { type: Boolean },
    default_profile: { type: Boolean },
    default_profile_image: { type: Boolean },
    following: { type: Boolean },
    follow_request_sent: { type: Boolean },
    notifications: { type: Boolean },
    translator_type: { type: String },
    withheld_in_countries: { type: [String] },
  },
});

export default mongoose.model('twitterusers', twitterPost);
