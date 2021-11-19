import TWITTER_CONSTANTS from "../../Constants/twitter.constants.js";

const demoUser = {
  id: 1,
  id_str: "1",
  name: "demo name",
  screen_name: "test",
  location: "",
  description: "demo description",
  url: "demo-url",
  entities: {
    url: {
      urls: [],
    },
    description: {
      urls: [],
    },
  },
  protected: false,
  followers_count: 1,
  friends_count: 1,
  listed_count: 1,
  created_at: "Tue Apr 29 14:12:10",
  favourites_count: 1,
  utc_offset: null,
  time_zone: null,
  geo_enabled: true,
  verified: true,
  statuses_count: 1,
  lang: null,
  status: {
    created_at: "Tue Sep 21 11:37:16",
    id: 1,
    id_str: "1",
    text: "demo text",
    truncated: true,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [],
      urls: [],
    },
    source: "demo",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 1,
    favorited: false,
    retweeted: false,
    possibly_sensitive: false,
    lang: "en",
  },
  contributors_enabled: false,
  is_translator: false,
  is_translation_enabled: false,
  profile_background_color: "000000",
  profile_background_image_url: "demo",
  profile_background_image_url_https: "demo",
  profile_background_tile: false,
  profile_image_url: "demo",
  profile_image_url_https: "demo",
  profile_banner_url: "demo",
  profile_link_color: "FFFFFF",
  profile_sidebar_border_color: "FFFFFF",
  profile_sidebar_fill_color: "FFFFFF",
  profile_text_color: "000000",
  profile_use_background_image: true,
  has_extended_profile: false,
  default_profile: false,
  default_profile_image: false,
  following: false,
  follow_request_sent: false,
  notifications: false,
  translator_type: "none",
  withheld_in_countries: [],
};

const demoTweets = {
  created_at: "Mon Sep 20 13:43:03",
  id: 1,
  id_str: "1",
  text: "demo text",
  truncated: false,
  entities: {
    hashtags: [],
    symbols: [],
    user_mentions: [],
    urls: [],
    media: [],
  },
  extended_entities: {
    media: [],
  },
  source: "demo",
  in_reply_to_status_id: null,
  in_reply_to_status_id_str: null,
  in_reply_to_user_id: null,
  in_reply_to_user_id_str: null,
  in_reply_to_screen_name: null,
  user: demoUser,
  geo: null,
  coordinates: null,
  place: null,
  contributors: null,
  is_quote_status: false,
  retweet_count: 1,
  favorite_count: 1,
  favorited: false,
  retweeted: false,
  possibly_sensitive: false,
  lang: "en",
};

class DemoController {
  async getTrendsAvailable(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo available places' */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      return res.status(200).json([
        {
          name: TWITTER_CONSTANTS.DEMO_COUNTRY,
          placeType: { code: TWITTER_CONSTANTS.COUNTRY_CODE, name: "Country" },
          url: "http://demo.url",
          parentid: 1,
          country: TWITTER_CONSTANTS.DEMO_COUNTRY,
          woeid: TWITTER_CONSTANTS.DEMO_WOEID,
          countryCode: "DEMO",
        },
      ]);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async getTrendsPlaces(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo trends by place woeid' */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      if (
        !req.query.id ||
        req.query.id !== String(TWITTER_CONSTANTS.DEMO_WOEID)
      ) {
        return res.status(404).json({
          errors: [
            {
              code: 34,
              message: "Sorry, that page does not exist.",
            },
          ],
        });
      }

      return res.status(200).json([
        {
          trends: [
            {
              name: "Demo",
              url: "http://demo.url",
              promoted_content: null,
              query: "query",
              tweet_volume: null,
            },
          ],
          as_of: new Date().toISOString(),
          created_at: new Date().toISOString(),
          locations: [
            {
              name: TWITTER_CONSTANTS.DEMO_COUNTRY,
              woeid: TWITTER_CONSTANTS.DEMO_WOEID,
            },
          ],
        },
      ]);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  searchUsers(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo found users */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      return res.status(200).json([demoUser]);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getUserTweets(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo user tweets */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { screen_name } = req.query;

      if (screen_name !== demoUser.screen_name) {
        return res.status(404).json({
          errors: [
            {
              code: 34,
              message: "Sorry, that page does not exist.",
            },
          ],
        });
      }

      return res.status(200).json([demoTweets]);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  createFriendShips(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo new friend */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { screen_name, user_id } = req.body;

      if (user_id && user_id !== TWITTER_CONSTANTS.DEMO_TWITTER_ACCOUNT_ID) {
        return res.status(403).json({
          errors: [
            {
              code: 108,
              message: "Cannot find specified user.",
            },
          ],
        });
      }

      if (screen_name && screen_name !== demoUser.screen_name) {
        return res.status(403).json({
          errors: [
            {
              code: 108,
              message: "Cannot find specified user.",
            },
          ],
        });
      }

      return res.status(200).json(demoUser);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  destroyFriendShips(req, res) {
    /* #swagger.tags = ['Demo Twitter API']
        #swagger.description = 'Returns demo destroyed friend */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { screen_name, user_id } = req.body;

      if (user_id && user_id !== TWITTER_CONSTANTS.DEMO_TWITTER_ACCOUNT_ID) {
        return res.status(403).json({
          errors: [
            {
              code: 108,
              message: "Cannot find specified user.",
            },
          ],
        });
      }

      if (screen_name && screen_name !== demoUser.screen_name) {
        return res.status(403).json({
          errors: [
            {
              code: 108,
              message: "Cannot find specified user.",
            },
          ],
        });
      }

      return res.status(200).json(demoUser);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  friendsList(req, res) {
    try {
      /* #swagger.tags = ['Demo Twitter API']
         #swagger.description = 'Returns demo friends list */
      /* #swagger.security = [{
          "AccessToken": []
         }] */

      return res.status(200).json({
        users: [demoUser],
        next_cursor: -1,
        next_cursor_str: "-1",
        previous_cursor: 0,
        previous_cursor_str: "0",
        total_count: null,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  followersList(req, res) {
    try {
      /* #swagger.tags = ['Demo Twitter API']
         #swagger.description = 'Returns demo followers list */
      /* #swagger.security = [{
          "AccessToken": []
         }] */

      return res.status(200).json({
        users: [demoUser],
        next_cursor: -1,
        next_cursor_str: "-1",
        previous_cursor: 0,
        previous_cursor_str: "0",
        total_count: null,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getReqAccessToken(req) {
    return req.headers.authorization.split("Bearer ")[1];
  }
}

export default new DemoController();
