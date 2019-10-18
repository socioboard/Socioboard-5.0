module.exports = {
    "feeds_service_events": {
        "event_category": "{{user_id}}",
        "event_action": {
            "NewsApi": "NewsApi",
            "PixaBay": "PixaBay",
            "Flickr": "Flickr",
            "DailyMotion": "DailyMotion",
            "Imgur": "Imgur",
            "RssFeeds": "RssFeeds",
            "Youtube": "Youtube",
            "Giphy": "Giphy",
            "Facebook": "Facebook",
            "Twitter": "Twitter",
            "Instagram": "Instagram",
            "LinkedIn": "LinkedIn",
            "Pinterest": "Pinterest",
            "AdminWebhooks": "AdminWebhooks",
            "Boards": "Boards",
            "Team": "Team"
        },
        "trend_event_label": {
            "giphy_feeds": "Socio3001: User({{user}})(ID: {{id}}) fetched giphy feeds of keyword({{keyword}}) with filter({{filter}}).",
            "giphy_feeds_failed": "Socio7001: User({{user}})(ID: {{id}}) cant able to fetch giphy feeds of keyword({{keyword}}) with filter({{filter}}).",
            "giphy_feeds_failed_byApi": "Socio7001: User({{user}})(ID: {{id}}) cant able to fetch giphy feeds of keyword({{keyword}}) with filter({{filter}}) because of API key Error.",

            "newsapi_feeds": "Socio3002: User({{user}})(ID: {{id}}) fetched newsapi feeds of keyword({{keyword}}) with  with sort of({{sort}}).",
            "newsapi_feeds_failed": "Socio7002: User({{user}})(ID: {{id}}) cant able to fetch newsapi feeds of keyword({{keyword}}) with sort of({{sort}}).",
            "newsapi_feeds_failed_byApi": "Socio7002: User({{user}})(ID: {{id}}) cant able to fetch newsapi feeds of keyword({{keyword}}) with sort of({{sort}}) because of API key Error.",

            "flickr_feeds": "Socio3003: User({{user}})(ID: {{id}}) fetched filcker feeds of keyword({{keyword}}) with sort of({{sort}}).",
            "flickr_feeds_failed": "Socio7003: User({{user}})(ID: {{id}}) cant able to fetch filcker feeds of keyword({{keyword}}) with sort of({{sort}}).",
            "flickr_feeds_failed_byApi": "Socio7003: User({{user}})(ID: {{id}}) cant able to fetch filcker feeds of keyword({{keyword}}) with sort of({{sort}}) because of API key Error.",

            "daily_motion_feeds": "Socio3004: User({{user}})(ID: {{id}}) fetched dailyMotion feeds with filter({{filter}}) and  with sort of({{sort}}).",
            "daily_motion_feeds_failed": "Socio7004: User({{user}})(ID: {{id}}) cant able to fetch dailyMotion feeds with filter({{filter}}) and  with sort of({{sort}}).",
            "daily_motion_feeds_failed_byApi": "Socio7004: User({{user}})(ID: {{id}}) cant able to fetch dailyMotion feeds with filter({{filter}}) and  with sort of({{sort}}) because of API key Error...",

            "imgur_feeds": "Socio3005: User({{user}})(ID: {{id}}) fetched imgur posts of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}).",
            "imgur_feeds_failed": "Socio7005: User({{user}})(ID: {{id}}) cant able to fetch imgur posts of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}).",
            "imgur_feeds_failed_byApi": "Socio7005: User({{user}})(ID: {{id}}) cant able to fetch imgur posts of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}) because of API key Error.",

            "rss_feeds": "Socio3006: User({{user}})(ID: {{id}}) fetched rss feeds of url({{url}}).",
            "rss_feeds_failed": "Socio7006: User({{user}})(ID: {{id}}) cant able to fetch rss feeds of url({{url}}).",

            "youtube_feeds": "Socio3007: User({{user}})(ID: {{id}}) fetched youtube feeds of keyword({{keyword}}) with sort of({{sort}}).",
            "youtube_feeds_failed": "Socio7007: User({{user}})(ID: {{id}}) cant able to fetch youtube feeds of keyword({{keyword}}) with sort of({{sort}}).",
            "youtube_feeds_failed_byApi": "Socio7007: User({{user}})(ID: {{id}}) cant able to fetch youtube feeds of keyword({{keyword}}) with sort of({{sort}}) because of API key Error.",

            "twitter_current_trends": "Socio3008: User({{user}})(ID: {{id}}) fetched current twitter trends of Country({{country}})",
            "twitter_current_trends_failed": "Socio7008: User({{user}})(ID: {{id}}) cant able to fetch current trends of Country({{country}})",

            "twitter_keyword_trends": "Socio3009: User({{user}})(ID: {{id}}) fetched twitter trendings of keyword({{keyword}}).",
            "twitter_keyword_trends_failed": "Socio7009: User({{user}})(ID: {{id}}) cant able to fetch twitter trendings of keyword({{keyword}}).",

            "pixabay_feeds": "Socio3010: User({{user}})(ID: {{id}}) fetched pixabay feeds of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}).",
            "pixabay_feeds_failed": "Socio7010: User({{user}})(ID: {{id}}) cant able to fetch pixabay feeds of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}).",
            "pixabay_feeds_failed_byApi": "Socio7011: User({{user}})(ID: {{id}}) cant able to fetch pixabay feeds of keyword({{keyword}}) with filter({{filter}}) and  with sort of({{sort}}) because of API key Error.",
        },

        "feed_event_label": {
            "facebook_feed": "Socio3100: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched facebook feeds of account({{accountId}}).",
            "facebook_feed_failed": "Socio7100: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch facebook feeds of account({{accountId}}).",

            "twitter_tweet_list": "Socio3101: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter tweets of account({{accountId}}).",
            "twitter_tweet_list_failed": "Socio7101: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch twitter tweets of account({{accountId}}).",

            "twitter_timeline_tweets": "Socio3102: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter home timeline tweets of account({{accountId}}).",
            "twitter_timeline_tweets_failed": "Socio7102: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch twitter timeline tweets of account({{accountId}}).",

            "twitter_mention_tweets": "Socio3103: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter mentioned timeline tweets of account({{accountId}}).",
            "twitter_mention_tweets_failed": "Socio7103: User({{user}})(ID: {{id}}) of team({{teamId}}) of team({{teamId}}) cant able to fetch twitter mentioned timeline tweets of account({{accountId}}).",

            "keyword_tweets": "Socio3104: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched keyword matching tweets of account({{accountId}}).",
            "keyword_tweets_failed": "Socio7104: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch keyword matching tweets of account({{accountId}}).",

            "linkedin_company_pages": "Socio3105: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched linkedin company pages of account({{accountId}}).",
            "linkedin_company_pages_failed": "Socio7105: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch linkedin company pages of account({{accountId}}).",

            "pinterst_pins": "Socio3106: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched pinterest pins of account({{accountId}}) of board({{board}}).",
            "pinterst_pins_failed": "Socio7106: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch pinterest pins of account({{accountId}}) of board({{board}}).",

            "youtube_feeds": "Socio3017: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched youtube feeds of account({{accountId}}).",
            "youtube_feeds_failed": "Socio7107: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch youtube feeds  of account({{accountId}}).",

            "instagram_feeds": "Socio3018: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched instagram feeds of account({{accountId}}).",
            "instagram_feeds_failed": "Socio7108: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram feeds of account({{accountId}}).",

            "instagram_business_feeds": "Socio3109: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched instagram business feeds of account({{accountId}}).",
            "instagram_business_feeds_failed": "Socio7109: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram business feeds of account({{accountId}}).",

            "instagram_recent_feeds": "Socio3110: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched instagram recent feeds of account({{accountId}}).",
            "instagram_recent_feeds_failed": "Socio7110: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram recent feeds of account({{accountId}}).",

            "facebook_recent_feed": "Socio3111: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched facebook recent feeds of account({{accountId}}).",
            "facebook_recent_feed_failed": "Socio7111: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch facebook recent feeds of account({{accountId}}).",

            "twitter_recent_tweet_list": "Socio3112: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter recent tweets of account({{accountId}}).",
            "twitter_recent_tweet_list_failed": "Socio7112: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch twitter recent tweets of account({{accountId}}).",
        },

        "like_comment_event_label": {
            "facebook_like": "Socio3200: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully liked facebook post({{post}}).",
            "facebook_like_failed": "Socio7200: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to like facebook post({{post}}).",

            "facebook_comment": "Socio3201: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully commented facebook post({{post}}).",
            "facebook_comment_failed": "Socio7201: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to comment facebook post({{post}}).",

            "twitter_like": "Socio3202: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully liked twitter post({{post}}).",
            "twitter_like_failed": "Socio7202: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to like twitter post({{post}}).",

            "twitter_dislike": "Socio3203: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully disliked twitter post({{post}}).",
            "twitter_dislike_failed": "Socio7203: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to dislike twitter post({{post}}).",

            "twitter_comment": "Socio3204: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully commented twitter post({{post}})",
            "twitter_comment_failed": "Socio7204: User({{user}})(ID: {{id}}) of team({{teamId}}) cant ablet to comment twitter post({{post}}).",

            "twitter_comment_delete": "Socio3205: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully deleted twitter comment({{post}}).",
            "twitter_comment_delete_failed": "Socio7205: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to delete twitter commnet({{post}}).",

            "youtube_like": "Socio3206: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully liked Youtube post({{post}}).",
            "youtube_like_failed": "Socio7206: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to like youtube post({{post}}).",

            "youtube_comment": "Socio3207: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully commented youtube post({{post}}).",
            "youtube_comment_failed": "Socio7207: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to comment youtube post({{post}}).",

            "youtube_comment_reply": "Socio3208: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully replied to Youtube comment({{post}}).",
            "youtube_comment_reply_failed": "Socio7208: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to reply to youtube comment({{post}}).",

            "insta_business_comment": "Socio3209: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully fetched insta business({{accountId}}) comments.",
            "insta_business_comment_failed": "Socio3209: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch insta business({{accountId}}) comments.",

            "insta_business_reply_comment": "Socio3210: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully replied to insta business({{accountId}}) comment({{commentId}}).",
            "insta_business_reply_comment_failed": "Socio3210: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to reply to insta business({{accountId}}) comment({{commentId}}).",
        },

        "friends_event_label": {
            "twitter_followers": "Socio3350: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched followers for twitter account({{accountId}}).",
            "twitter_followers_failed": "Socio7350: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch followers for twitter account({{accountId}}).",

            "twitter_following": "Socio3351: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched followings of twitter account({{accountId}}).",
            "twitter_following_failed": "Socio7351: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch followings of twitter account({{accountId}}).",

            "twitter_user_search": "Socio3352: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched users matched with keyword({{keyword}}).",
            "twitter_user_search_failed": "Socio7352: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch users matched with keyword({{keyword}}).",
        },

        "friends_stats_update": {
            "twitter_stats_update": "Socio3391: User({{user}})(ID: {{id}}) fetched the stats details of twitter account({{accountId}}) from team({{teamId}}).",
            "twitter_stats_update_failed": "Socio7391: User({{user}})(ID: {{id}}) cant able to fetch the stats details of twitter account({{accountId}}) from team({{teamId}}).",
        },

        "networkInsights_event_label": {
            "fb_page_insights": "Socio3400: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched facebook page insights of account({{accountId}}).",
            "fb_page_insights_failed": "Socio7400: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch facebook page insights of account({{accountId}}).",

            "youtube_insights": "Socio3401: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched youtube insights of account({{accountId}}).",
            "youtube_insights_failed": "Socio7401: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch youtube insights of account({{accountId}}).",

            "linkedIn_company_insights": "Socio3402: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched linkedIn company insights of account({{accountId}}).",
            "linkedIn_company_insights_failed": "Socio7402: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch linkedIn company insights of account({{accountId}}).",

            "instagram_business_insights": "Socio3403: User({{user}})(ID: {{id}}) of team({teamId}) fetched instagram business insights of account({{accountId}}).",
            "instagram_business_insights_failed": "Socio7403: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram business insights of account({{accountId}}).",

            "twitter_insights": "Socio3404: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter insights of account({{accountId}}).",
            "twitter_insights_failed": "Socio7404: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch twitter insights of account({{accountId}}).",

            "team_insights": "Socio3405: User({{user}})(ID: {{id}}) fetched team insights of team({{teamId}}).",
            "team_insights_failed": "Socio7405: User({{user}})(ID: {{id}}) cant able to fetch team insights of team({{teamId}}).",
        },

        "admin_webhooks_event_label": {
            "twitter_webhooks_start": "Socio3500: Admin({{admin}})(ID: {{id}}) started twitter webhooks.",
            "twitter_webhooks_start_failed": "Socio7500: Admin({{admin}})(ID: {{id}}) cant able to start twitter webhooks.",

            "twitter_webhooks_stop": "Socio3501: Admin({{admin}})(ID: {{id}}) stopped twitter webhooks.",
            "twitter_webhooks_stop_failed": "Socio7501: Admin({{admin}})(ID: {{id}}) cant able to stop twitter webhooks.",

            "twitter_subscription_list": "Socio3502: Admin({{admin}})(ID: {{id}}) fetched all subscription List.",
            "twitter_subscription_list_failed": "Socio7502: Admin({{admin}})(ID: {{id}}) cant able to fetch all subscription List.",

        },

        "friendship_stats_event_lable": {
            "fb_profile_stats": "Socio3600: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched facebook profile updated details of account({{accountId}}).",
            "fb_profile_stats_failed": "Socio7600: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch facebook profile updated details  of account({{accountId}}).",

            "fb_page_stats": "Socio3601: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched facebook page  updated details of account({{accountId}}).",
            "fb_page_stats_failed": "Socio7601: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch facebook page updated details of account({{accountId}}).",

            "twitter_profile_stats": "Socio3602: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched twitter profile updated details of account({{accountId}}).",
            "twitter_profile_stats_failed": "Socio7602: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch twitter profile updated details of account({{accountId}}).",

            "instagram_profile_stats": "Socio3603: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched instagram profile updated details of account({{accountId}}).",
            "instagram_profile_stats_failed": "Socio7603: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram profile updated details of account({{accountId}}).",

            "linkedIn_profile_stats": "Socio3604: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched linkedIn profile updated details of account({{accountId}}).",
            "linkedIn_profile_stats_failed": "Socio7604: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch linkedIn profile updated details of account({{accountId}}).",

            "youtube_profile_stats": "Socio3605: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched youtube channel updated details of account({{accountId}}).",
            "youtube_profile_stats_failed": "Socio7605: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch youtube channel updated details of account({{accountId}}).",

            "pinterest_profile_stats": "Socio3606: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched pinterest profile updated details of account({{accountId}}).",
            "pinterest_profile_stats_failed": "Socio7606: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch pinterest profile updated details` of account({{accountId}}).",

            "instagram_business_stats": "Socio3607: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched instagram business updated details of account({{accountId}}).",
            "instagram_business_stats_failed": "Socio7607: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch instagram business updated details of account({{accountId}}).",

            "linkedin_company_stats": "Socio3608: User({{user}})(ID: {{id}}) of team({{teamId}}) fetched linkedin company updated details of account({{accountId}}).",
            "linkedin_company_stats_failed": "Socio7608: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch linkedin company updated details of account({{accountId}}).",
        },

        "board_event_lable": {
            "create_board": "Socio3700: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully created board of keyword({{keyword}}).",
            "create_board_failed": "Socio7700: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to create board of keyword({{keyword}}).",

            "fetch_board": "Socio3701: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully fetched all boards.",
            "fetch_board_failed": "Socio7701: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to fetch boards.",

            "edit_board": "Socio3702: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully edited board of boardId({{boardId}}).",
            "edit_board_failed": "Socio7702: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to edit board of boardId({{boardId}}).",

            "delete_board": "Socio3703: User({{user}})(ID: {{id}}) of team({{teamId}}) successfully deleted board of boardId({{boardId}}).",
            "delete_board_failed": "Socio7703: User({{user}})(ID: {{id}}) of team({{teamId}}) cant able to delete board of boardId({{boardId}}).",
        }
    }
};