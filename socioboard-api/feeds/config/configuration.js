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
            "Boards": "Boards"
        },
        "trend_event_label": {
            "giphy_feeds": "Socio3001: User({{user}}) fetched giphy feeds of keyword({{keyword}}).",
            "giphy_feeds_failed": "Socio7001: User({{user}}) cant able to fetch giphy feeds of keyword({{keyword}}).",
            "giphy_feeds_failed_byApi": "Socio7001: User({{user}}) cant able to fetch giphy feeds of keyword({{keyword}}) because of API key Error.",

            "newsapi_feeds": "Socio3002: User({{user}}) fetched newsapi feeds of keyword({{keyword}}).",
            "newsapi_feeds_failed": "Socio7002: User({{user}}) cant able to fetch newsapi feeds of keyword({{keyword}}).",
            "newsapi_feeds_failed_byApi": "Socio7002: User({{user}}) cant able to fetch newsapi feeds of keyword({{keyword}}) because of API key Error.",

            "flickr_feeds": "Socio3003: User({{user}}) fetched filcker feeds of keyword({{keyword}}).",
            "flickr_feeds_failed": "Socio7003: User({{user}}) cant able to fetch filcker feeds of keyword({{keyword}}).",
            "flickr_feeds_failed_byApi": "Socio7003: User({{user}}) cant able to fetch filcker feeds of keyword({{keyword}}) because of API key Error.",

            "daily_motion_feeds": "Socio3004: User({{user}}) fetched dailyMotion feeds.",
            "daily_motion_feeds_failed": "Socio7004: User({{user}}) cant able to fetch dailyMotion feeds.",
            "daily_motion_feeds_failed_byApi": "Socio7004: User({{user}}) cant able to fetch dailyMotion feeds because of API key Error...",

            "imgur_feeds": "Socio3005: User({{user}}) fetched imgur posts of keyword({{keyword}}).",
            "imgur_feeds_failed": "Socio7005: User({{user}}) cant able to fetch imgur posts of keyword({{keyword}}).",
            "imgur_feeds_failed_byApi": "Socio7005: User({{user}}) cant able to fetch imgur posts of keyword({{keyword}}) because of API key Error.",

            "rss_feeds": "Socio3006: User({{user}}) fetched rss feeds of url({{url}}).",
            "rss_feeds_failed": "Socio7006: User({{user}}) cant able to fetch rss feeds of url({{url}}).",

            "youtube_feeds": "Socio3007: User({{user}}) fetched youtube feeds of keyword({{keyword}}).",
            "youtube_feeds_failed": "Socio7007: User({{user}}) cant able to fetch youtube feeds of keyword({{keyword}}).",
            "youtube_feeds_failed_byApi": "Socio7007: User({{user}}) cant able to fetch youtube feeds of keyword({{keyword}}) because of API key Error.",

            "twitter_current_trends": "Socio3008: User({{user}}) fetched current twitter trends of Country({{country}})",
            "twitter_current_trends_failed": "Socio7008: User({{user}}) cant able to fetch current trends of Country({{country}})",

            "twitter_keyword_trends": "Socio3009: User({{user}}) fetched twitter trendings of keyword({{keyword}}).",
            "twitter_keyword_trends_failed": "Socio7009: User({{user}}) cant able to fetch twitter trendings of keyword({{keyword}}).",

            "pixabay_feeds": "Socio3031: User({{user}}) fetched pixabay feeds of keyword({{keyword}}).",
            "pixabay_feeds_failed": "Socio7031: User({{user}}) cant able to fetch pixabay feeds of keyword({{keyword}}).",
            "pixabay_feeds_failed_byApi": "Socio7031: User({{user}}) cant able to fetch pixabay feeds of keyword({{keyword}}) because of API key Error.",
        },

        "feed_event_label": {

            "facebook_feed": "Socio3010: User({{user}}) of team({{teamId}}) fetched facebook feeds of account({{accountId}}).",
            "facebook_feed_failed": "Socio7010: User({{user}}) of team({{teamId}}) cant able to fetch facebook feeds of account({{accountId}}).",

            "twitter_tweet_list": "Socio3011: User({{user}}) of team({{teamId}}) fetched twitter tweets of account({{accountId}}).",
            "twitter_tweet_list_failed": "Socio7011: User({{user}}) of team({{teamId}}) cant able to fetch twitter tweets of account({{accountId}}).",

            "twitter_timeline_tweets": "Socio3012: User({{user}}) of team({{teamId}}) fetched twitter home timeline tweets of account({{accountId}}).",
            "twitter_timeline_tweets_failed": "Socio7012: User({{user}}) of team({{teamId}}) cant able to fetch twitter timeline tweets of account({{accountId}}).",

            "twitter_mention_tweets": "Socio3013: User({{user}}) of team({{teamId}}) fetched twitter mentioned timeline tweets of account({{accountId}}).",
            "twitter_mention_tweets_failed": "Socio7013: User({{user}}) of team({{teamId}}) of team({{teamId}}) cant able to fetch twitter mentioned timeline tweets of account({{accountId}}).",

            "keyword_tweets": "Socio3014: User({{user}}) of team({{teamId}}) fetched keyword matching tweets of account({{accountId}}).",
            "keyword_tweets_failed": "Socio7014: User({{user}}) of team({{teamId}}) cant able to fetch keyword matching tweets of account({{accountId}}).",

            "linkedin_company_pages": "Socio3015: User({{user}}) of team({{teamId}}) fetched linkedin company pages of account({{accountId}}).",
            "linkedin_company_pages_failed": "Socio7015: User({{user}}) of team({{teamId}}) cant able to fetch linkedin company pages of account({{accountId}}).",

            "pinterst_pins": "Socio3016: User({{user}}) of team({{teamId}}) fetched pinterest pins of account({{accountId}}).",
            "pinterst_pins_failed": "Socio7016: User({{user}}) of team({{teamId}}) cant able to fetch pinterst pins of account({{accountId}}).",

            "youtube_feeds": "Socio3017: User({{user}}) of team({{teamId}}) fetched youtube feeds of account({{accountId}}).",
            "youtube_feeds_failed": "Socio7017: User({{user}}) of team({{teamId}}) cant able to fetch youtube feeds  of account({{accountId}}).",

            "instagram_feeds": "Socio3018: User({{user}}) of team({{teamId}}) fetched instagram feeds of account({{accountId}}).",
            "instagram_feeds_failed": "Socio7018: User({{user}}) of team({{teamId}}) cant able to fetch instagram feeds of account({{accountId}}).",

            "instagram_business_feeds": "Socio3019: User({{user}}) of team({{teamId}}) fetched instagram business feeds of account({{accountId}}).",
            "instagram_business_feeds_failed": "Socio7019: User({{user}}) of team({{teamId}}) cant able to fetch instagram business feeds of account({{accountId}}).",

            "instagram_recent_feeds": "Socio3020: User({{user}}) of team({{teamId}}) fetched instagram recent feeds of account({{accountId}}).",
            "instagram_recent_feeds_failed": "Socio7020: User({{user}}) of team({{teamId}}) cant able to fetch instagram recent feeds of account({{accountId}}).",

            "facebook_recent_feed": "Socio3010: User({{user}}) of team({{teamId}}) fetched facebook recent feeds of account({{accountId}}).",
            "facebook_recent_feed_failed": "Socio7010: User({{user}}) of team({{teamId}}) cant able to fetch facebook recent feeds of account({{accountId}}).",

            "twitter_recent_tweet_list": "Socio3011: User({{user}}) of team({{teamId}}) fetched twitter recent tweets of account({{accountId}}).",
            "twitter_recent_tweet_list_failed": "Socio7011: User({{user}}) of team({{teamId}}) cant able to fetch twitter recent tweets of account({{accountId}}).",

        },

        "like_comment_event_label": {
            "facebook_like": "Socio3019: User({{user}}) of team({{teamId}}) successfully liked facebook post({{post}}).",
            "facebook_like_failed": "Socio7019: User({{user}}) of team({{teamId}}) cant able to like facebook post({{post}}).",

            "facebook_comment": "Socio3020: User({{user}}) of team({{teamId}}) successfully commented facebook post({{post}}).",
            "facebook_comment_failed": "Socio7020: User({{user}}) of team({{teamId}}) cant able to comment facebook post({{post}}).",

            "twitter_like": "Socio3021: User({{user}}) of team({{teamId}}) successfully liked twitter post({{post}}).",
            "twitter_like_failed": "Socio7021: User({{user}}) of team({{teamId}}) cant able to like twitter post({{post}}).",

            "twitter_dislike": "Socio3022: User({{user}}) of team({{teamId}}) successfully disliked twitter post({{post}}).",
            "twitter_dislike_failed": "Socio7022: User({{user}}) of team({{teamId}}) cant able to dislike twitter post({{post}}).",

            "twitter_comment": "Socio3023: User({{user}}) of team({{teamId}}) successfully commented twitter post({{post}})",
            "twitter_comment_failed": "Socio7023: User({{user}}) of team({{teamId}}) cant ablet to comment twitter post({{post}}).",

            "twitter_comment_delete": "Socio3024: User({{user}}) of team({{teamId}}) successfully deleted twitter comment({{post}}).",
            "twitter_comment_delete_failed": "Socio7024: User({{user}}) of team({{teamId}}) cant able to delete twitter commnet({{post}}).",

            "youtube_like": "Socio3025: User({{user}}) of team({{teamId}}) successfully liked Youtube post({{post}}).",
            "youtube_like_failed": "Socio7025: User({{user}}) of team({{teamId}}) cant able to like youtube post({{post}}).",

            "youtube_comment": "Socio3026: User({{user}}) of team({{teamId}}) successfully commented youtube post({{post}}).",
            "youtube_comment_failed": "Socio7026: User({{user}}) of team({{teamId}}) cant able to comment youtube post({{post}}).",

            "youtube_comment_reply": "Socio3027: User({{user}}) of team({{teamId}}) successfully replied to Youtube comment({{post}}).",
            "youtube_comment_reply_failed": "Socio7027: User({{user}}) of team({{teamId}}) cant able to reply to youtube comment({{post}}).",
        },

        "friends_event_label": {
            "twitter_followers": "Socio3028: User({{user}}) of team({{teamId}}) fetched followers for twitter account({{accountId}}).",
            "twitter_followers_failed": "Socio7028: User({{user}}) of team({{teamId}}) cant able to fetch followers for twitter account({{accountId}}).",

            "twitter_following": "Socio3029: User({{user}}) of team({{teamId}}) fetched followings of twitter account({{accountId}}).",
            "twitter_following_failed": "Socio7029: User({{user}}) of team({{teamId}}) cant able to fetch followings of twitter account({{accountId}}).",

            "twitter_user_search": "Socio3030: User({{user}}) of team({{teamId}}) fetched users matched with keyword({{keyword}}).",
            "twitter_user_search_failed": "Socio7030: User({{user}}) of team({{teamId}}) cant able to fetch users matched with keyword({{keyword}}).",
        },

        "friends_stats_update": {
            "twitter_stats_update": "Socio3032: User({{user}}) fetched the stats details of twitter account({{accountId}}) from team({{teamId}}).",
            "twitter_stats_update_failed": "Socio7032: User({{user}}) cant able to fetch the stats details of twitter account({{accountId}}) from team({{teamId}}).",
        },

        "networkInsights_event_label": {
            "fb_page_insights": "User({{user}}) of team({{teamId}}) fetched facebook page insights of account({{accountId}}).",
            "fb_page_insights_failed": "User({{user}}) of team({{teamId}}) cant able to fetch facebook page insights of account({{accountId}}).",

            "youtube_insights": "User({{user}}) of team({{teamId}}) fetched youtube insights of account({{accountId}}).",
            "youtube_insights_failed": "User({{user}}) of team({{teamId}}) cant able to fetch youtube insights of account({{accountId}}).",

            "linkedIn_company_insights": "User({{user}}) of team({{teamId}}) fetched linkedIn company insights of account({{accountId}}).",
            "linkedIn_company_insights_failed": "User({{user}}) of team({{teamId}}) cant able to fetch linkedIn company insights of account({{accountId}}).",

            "instagram_business_insights": "User({{user}}) of team({teamId}) fetched instagram business insights of account({{accountId}}).",
            "instagram_business_insights_failed": "User({{user}}) of team({{teamId}}) cant able to fetch instagram business insights of account({{accountId}}).",

            "twitter_insights": "User({{user}}) of team({{teamId}}) fetched twitter insights of account({{accountId}}).",
            "twitter_insights_failed": "User({{user}}) of team({{teamId}}) cant able to fetch twitter insights of account({{accountId}}).",
        },

        "admin_webhooks_event_label": {
            "twitter_webhooks_start": "Admin({{admin}}) started twitter webhooks.",
            "twitter_webhooks_start_failed": "Admin({{admin}}) cant able to start twitter webhooks.",

            "twitter_webhooks_stop": "Admin({{admin}}) stopped twitter webhooks.",
            "twitter_webhooks_stop_failed": "Admin({{admin}}) cant able to stop twitter webhooks.",

            "twitter_subscription_list": "Admin({{admin}}) fetched all subscription List.",
            "twitter_subscription_list_failed": "Admin({{admin}}) cant able to fetch all subscription List.",

        },

        "friendship_stats_event_lable": {
            "fb_profile_stats": "User({{user}}) of team({{teamId}}) fetched facebook profile updated details of account({{accountId}}).",
            "fb_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch facebook profile updated details  of account({{accountId}}).",

            "fb_page_stats": "User({{user}}) of team({{teamId}}) fetched facebook page  updated details of account({{accountId}}).",
            "fb_page_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch facebook page updated details of account({{accountId}}).",

            "twitter_profile_stats": "User({{user}}) of team({{teamId}}) fetched twitter profile updated details of account({{accountId}}).",
            "twitter_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch twitter profile updated details of account({{accountId}}).",

            "instagram_profile_stats": "User({{user}}) of team({{teamId}}) fetched instagram profile updated details of account({{accountId}}).",
            "instagram_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch instagram profile updated details of account({{accountId}}).",

            "linkedIn_profile_stats": "User({{user}}) of team({{teamId}}) fetched linkedIn profile updated details of account({{accountId}}).",
            "linkedIn_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch linkedIn profile updated details of account({{accountId}}).",

            "youtube_profile_stats": "User({{user}}) of team({{teamId}}) fetched youtube channel updated details of account({{accountId}}).",
            "youtube_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch youtube channel updated details of account({{accountId}}).",

            "pinterest_profile_stats": "User({{user}}) of team({{teamId}}) fetched pinterest profile updated details of account({{accountId}}).",
            "pinterest_profile_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch pinterest profile updated details` of account({{accountId}}).",

            "instagram_business_stats": "User({{user}}) of team({{teamId}}) fetched instagram business updated details of account({{accountId}}).",
            "instagram_business_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch instagram business updated details of account({{accountId}}).",

            "linkedin_company_stats": "User({{user}}) of team({{teamId}}) fetched linkedin company updated details of account({{accountId}}).",
            "linkedin_company_stats_failed": "User({{user}}) of team({{teamId}}) cant able to fetch linkedin company updated details of account({{accountId}}).",
        },

        "board_event_lable": {
            "create_board": "User({{user}}) of team({{teamId}}) successfully created board of keyword({{keyword}}).",
            "create_board_failed": "User({{user}}) of team({{teamId}}) cant able to create board of keyword({{keyword}}).",

            "fetch_board": "User({{user}}) of team({{teamId}}) successfully fetched all boards.",
            "fetch_board_failed": "User({{user}}) of team({{teamId}}) cant able to fetch boards.",

            "edit_board": "User({{user}}) of team({{teamId}}) successfully edited board of boardId({{boardId}}).",
            "edit_board_failed": "User({{user}}) of team({{teamId}}) cant able to edit board of boardId({{boardId}}).",

            "delete_board": "User({{user}}) of team({{teamId}}) successfully deleted board of boardId({{boardId}}).",
            "delete_board_failed": "User({{user}}) of team({{teamId}}) cant able to delete board of boardId({{boardId}}).",
        }
    }
};