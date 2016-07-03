using System;
using System.Collections.Generic;
using System.Text;

namespace Socioboard.Twitter.App.Core
{

  public  static class Globals
    {

       #region Search API Methods
       /// <summary>
       /// Search Trends
       /// </summary>
       public static string TrendsUrl = "http://search.twitter.com/trends.json";
       public static string SearchUrl = "http://search.twitter.com/search.atom?q=";
       public static string SearchTwtUserUrl = "http://search.twitter.com/search.json?q=";
       #endregion

       #region Timeline Methods Urls
       /// <summary>
       /// TimeLine 
       /// </summary>
       public static string MentionUrl = "http://api.twitter.com/1/statuses/mentions.xml?count=";
       public static string HomeTimeLineUrl = "http://api.twitter.com/1/statuses/home_timeline.xml?count=";
       public static string UserTimeLineUrl = "http://api.twitter.com/1/statuses/user_timeline.xml?screen_name=";
       public static string RetweetedByMeUrl = "http://api.twitter.com/1.1/statuses/retweeted_by_me.xml?count=";
      // public static string MentionUrl = "http://api.twitter.com/1/statuses/mentions.xml?count=";

       #endregion

       #region Status Methods Urls
       /// <summary>
       /// User Status Demo
       /// </summary>
       public static string ShowStatusUrl = "http://api.twitter.com/1/statuses/show/";
       public static string UpdateStatusUrl = " http://api.twitter.com/1/statuses/update.xml";
       public static string ShowStatusUrlByScreenName = "http://twitter.com/users/show.xml?screen_name=";
       public static string ReTweetStatus = "http://api.twitter.com/1/statuses/retweet/";
       #endregion

       #region User Methods Urls
       /// <summary>
       /// User Status Demo
       /// </summary>
       public static string FriendStatusUrl = "http://api.twitter.com/1/statuses/friends/";
       public static string FollowerStatusUrl = "http://api.twitter.com/1/statuses/followers/";
       public static string GetAccountSettingsUrl = "https://api.twitter.com/1.1/account/settings.json ";
       public static string GetAccountVerifyCredentialsUrl = "https://api.twitter.com/1.1/account/verify_credentials.json";
       public static string PostAccountSettingsUrl = "https://api.twitter.com/1.1/account/settings.json";
       public static string PostAccountUpdateDeliveryDeviceUrl = "https://api.twitter.com/1.1/account/update_delivery_device.json";
       public static string PostAccountUpdateProfileUrl = "https://api.twitter.com/1.1/account/update_profile.json";
       public static string PostAccountUpdateProfileBackgroungImageUrl = "https://api.twitter.com/1.1/account/update_profile.json";
       public static string PostAccountUpdateProfileColorUrl = "https://api.twitter.com/1.1/account/update_profile_colors.json";
       public static string PostAccountUpdateProfileImageUrl = "https://api.twitter.com/1.1/account/update_profile_image.json";
       public static string GetBlocksListUrl = "https://api.twitter.com/1.1/blocks/list.json";
       public static string GetBlocksIdUrl = "https://api.twitter.com/1.1/blocks/ids.json";
       public static string PostBlockCreateUrl = "https://api.twitter.com/1.1/blocks/create.json";
       public static string PostBlocksDestroyUrl = "https://api.twitter.com/1.1/blocks/destroy.json";
       public static string GetUsersLookUpUrl = "https://api.twitter.com/1.1/users/lookup.json";
       public static string GetUsersShowUrl = "https://api.twitter.com/1.1/users/show.json";
       public static string GetUsersSearchUrl = "https://api.twitter.com/1.1/users/search.json";
       public static string GetUsersContributeesUrl = "https://api.twitter.com/1.1/users/contributees.json";
       public static string GetUsersContributorsUrl = "https://api.twitter.com/1.1/users/contributors.json";
       public static string PostAccountRemoveProfileBannerUrl = "https://api.twitter.com/1.1/account/remove_profile_banner.json";
       public static string PostAccountUpdateProfileBannerUrl = "https://api.twitter.com/1.1/account/update_profile_banner.json";
       public static string GetUsersProfileBannerUrl = "https://api.twitter.com/1.1/users/profile_banner.json";

       public static string PostStatusFavoritesById = "https://api.twitter.com/1.1/favorites/create.json";
       public static string PostUserReportAsSpammerById = "https://api.twitter.com/1.1/users/report_spam.json";
       public static string PostFriedshipDestroyById = "https://api.twitter.com/1.1/friendships/destroy.json";


       #endregion

       #region Direct Message Methods 
       /// <summary>
       /// Direct Message
       /// </summary>
       public static string DirectMessageGetByUserUrl = "http://api.twitter.com/1/direct_messages.xml?count=";
       public static string DirectMessageSentByUserUrl = "http://api.twitter.com/1/direct_messages/sent.xml?count=";
       public static string NewDirectMessage = "http://api.twitter.com/1/direct_messages/new.xml";
       public static string DeleteDirectMessage = "http://api.twitter.com/1/direct_messages/destroy/";
       public static string GetDirectMesagesUrl = "https://api.twitter.com/1.1/direct_messages.json";
       public static string GetDirectMessagesSentUrl = "https://api.twitter.com/1.1/direct_messages/sent.json";
       public static string GetDirectMessagesShowUrl = "https://api.twitter.com/1.1/direct_messages/show.json";
       public static string PostDirectMessagesDestroyUrl = "https://api.twitter.com/1.1/direct_messages/destroy.json";
       public static string PostDirectMesagesNewUrl = "https://api.twitter.com/1.1/direct_messages/new.json";
       #endregion

       #region Account Methods
       /// <summary>
       /// Account 
       /// </summary>
      // public static string VerifyCredentialsUrl = "http://api.twitter.com/1/account/verify_credentials.xml";
       public static string VerifyCredentialsUrl = "https://api.twitter.com/1.1/account/verify_credentials.json";      
      public static string RateLimitStatusUrl = "http://api.twitter.com/1/account/rate_limit_status.xml";
       #endregion

       #region Friendship Methods
       /// <summary>
       /// Followers
       /// </summary>
       public static string FollowerUrl = "http://api.twitter.com/1/friendships/create.xml?screen_name=";
       public static string UnFollowUrl = "http://api.twitter.com/1/friendships/destroy.xml?screen_name=";
       public static string FollowerUrlById = "http://api.twitter.com/1/friendships/create.xml?user_id=";
       public static string UnFollowUrlById = "http://api.twitter.com/1/friendships/destroy.xml?user_id=";
       public static string GetFriendshipsNoRetweetsIdUrl = "https://api.twitter.com/1.1/friendships/no_retweets/ids.json";
       public static string GetFriendsIdUrl = "https://api.twitter.com/1.1/friends/ids.json";
       public static string GetFollowersIdUrl = "https://api.twitter.com/1.1/followers/ids.json";
       public static string GetFriendshipsLookUpUrl = "https://api.twitter.com/1.1/friendships/lookup.json";
       public static string GetFriendshipsIncomingUrl = "https://api.twitter.com/1.1/friendships/incoming.json";
       public static string GetFrienshipsOutgoingUrl = "https://api.twitter.com/1.1/friendships/outgoing.format";
       public static string PostFriendshipsCreateUrl = "https://api.twitter.com/1.1/friendships/create.json";
       public static string PostFriendshipsDestroyUrl = "https://api.twitter.com/1.1/friendships/destroy.json";
       public static string PostFrienshipsUpdateUrl = "https://api.twitter.com/1.1/friendships/update.json";
       public static string GetFriendshipsShowUrl = "https://api.twitter.com/1.1/friendships/show.json";
       public static string GetFriendsListUrl = "https://api.twitter.com/1.1/friends/list.json";
       public static string GetFollowersListUrl = "https://api.twitter.com/1.1/followers/list.json";
       #endregion

       #region Social Graph Methods
       /// <summary>
       /// Social Graph Methods
       /// </summary>
       public static string FriendsIdUrl = "http://api.twitter.com/1/friends/ids.xml?screen_name=";
       public static string FollowersIdUrl = "http://api.twitter.com/1/followers/ids.xml?screen_name="; 
       #endregion

       #region Tweets Method
       public static string StatusesRetweetByIdUrl = "https://api.twitter.com/1.1/statuses/retweets/";
       public static string StatusShowByIdUrl = "https://api.twitter.com/1.1/statuses/show.json?id=";
       public static string StatusDestroyByIdUrl = "https://api.twitter.com/1.1/statuses/destroy/";
       public static string StatusUpdateUrl = "https://api.twitter.com/1.1/statuses/update.json";
       public static string PostStatusesRetweetByIdUrl = "https://api.twitter.com/1.1/statuses/retweet/";
       public static string PostStatusUpdateWithMediaUrl = "https://api.twitter.com/1.1/statuses/update_with_media.json";
       // public static string PostStatusUpdateWithMediaUrl = "https://upload.twitter.com/1/statuses/update_with_media.xml";
       public static string GetStatusesRetweetersByIdUrl = "https://api.twitter.com/1.1/statuses/retweeters/ids.json"; 
       #endregion

       #region Timeline Methods of version 1.1
       public static string statusesMentionTimelineUrl = "https://api.twitter.com/1.1/statuses/mentions_timeline.json";
       public static string statusesUserTimelineUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json";
       public static string statusesHomeTimelineUrl = "https://api.twitter.com/1.1/statuses/home_timeline.json";
       public static string statusesRetweetsOfMeUrl = "https://api.twitter.com/1.1/statuses/retweets_of_me.json";
       
       #endregion



     

       #region Search Method of version 1.1
       public static string GetSearchTweetsUrl = "https://api.twitter.com/1.1/search/tweets.json";
       public static string GetUserSuggestions = "https://api.twitter.com/1.1/users/suggestions.json";
       public static string GetUsersSuggestionsSlug = "";
       #endregion
       //private static int _RequestCount;
       //public static int RequestCount
       //{
       //    set
       //    {
       //        _RequestCount = value;
       //    }
       //    get
       //    {
       //        return _RequestCount;
       //    }
       //}

       public static string UploadMedia = "http://upload.twitter.com/1/statuses/update_with_media.xml";


    }
}
