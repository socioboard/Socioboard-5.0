using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;

namespace Socioboard.Twitter.Twitter.Core.FriendshipMethods
{
   public class Friendship
    {
        private XmlDocument xmlResult;

        public Friendship()
        {
            xmlResult = new XmlDocument();
        }

        #region Basic Authentication
        #region Friendships_Create
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Create(TwitterUser User, string ScreenName)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowerUrl + ScreenName;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region FriendshipsById_Create
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Create(TwitterUser User, int UserId)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowerUrlById + UserId;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region Friendships_Destroy
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Destroy(TwitterUser User, string ScreenName)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UnFollowUrl + ScreenName;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region FriendshipsById_Destroy
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Destroy(TwitterUser User, int UserId)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UnFollowUrlById + UserId;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion 
        #endregion

        #region OAuth
        #region Friendships_Create
        /// <summary>
        /// Follow Twitter User Using OAUTH
        /// </summary>
        /// <param name="twitterUser">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Create(oAuthTwitter oAuth, string ScreenName, SortedDictionary<string, string> strdic)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowerUrl + ScreenName;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region FriendshipsById_Create
        /// <summary>
        /// Follow Twitter User Using OAUTH
        /// </summary>
        /// <param name="twitterUser">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Create(oAuthTwitter oAuth, int UserId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowerUrlById + UserId;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region Friendships_Destroy
        /// <summary>
        /// UnFollow Twitter User Using OAUTH
        /// </summary>
        /// <param name="twitterUser">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Destroy(oAuthTwitter oAuth, string ScreenName)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UnFollowUrl + ScreenName;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region FriendshipsById_Destroy
        /// <summary>
        /// UnFollow Twitter User Using OAUTH
        /// </summary>
        /// <param name="twitterUser">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm Xml</returns>
        public XmlDocument Friendships_Destroy(oAuthTwitter oAuth, int UserId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UnFollowUrlById + UserId;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion 
       ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
       /// <summary>
        /// Returns a collection of user_ids that the currently authenticated user does not want to receive retweets from.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friendships_No_Retweets_Id(oAuthTwitter oAuth)
       {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsNoRetweetsIdUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
       }

       /// <summary>
       /// Returns a cursored collection of user IDs for every user the specified user is following
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friends_Id_Url(oAuthTwitter oAuth)
       {
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendsIdUrl;
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl,strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns a cursored collection of user IDs for every user following the specified user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Followers_Id_Url(oAuthTwitter oAuth)
       {
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersIdUrl;
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns the relationships of the authenticating user to the comma-separated list of up to 100 screen_names or user_ids provided.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friendships_Lookup(oAuthTwitter oAuth)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsLookUpUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns a collection of numeric IDs for every user who has a pending request to follow the authenticating user. 
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friendships_Incoming(oAuthTwitter oAuth)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsIncomingUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       ///  Returns a collection of numeric IDs for every protected user for whom the authenticating user has a pending follow request.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friendships_Outgoing(oAuthTwitter oAuth)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFrienshipsOutgoingUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

     /// <summary>
       /// Allows the authenticating users to follow the user specified in the ID parameter.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="UserId"></param>
     /// <returns></returns>
       public JArray Post_Friendships_Create(oAuthTwitter oAuth,string UserId)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("user_id", UserId);
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsCreateUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       public JArray Post_Friendships_Create_New(oAuthTwitter oAuth, string UserId, string screen_name)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("user_id", UserId);
           strdic.Add("screen_name", screen_name);
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsCreateUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Allows the authenticating user to unfollow the user specified in the ID parameter.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="UserId"></param>
       /// <returns></returns>
       /// 
       public JArray Post_Friendship_Destroy(oAuthTwitter oAuth,string UserId)
       {
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsDestroyUrl;
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("user_id", UserId);
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl,strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       public JArray Post_Friendship_Destroy_New(oAuthTwitter oAuth, string UserId, string screen_name)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("user_id", UserId);
           strdic.Add("screen_name", screen_name);
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsDestroyUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Allows one to enable or disable retweets and device notifications from the specified user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Post_Friendships_Update(oAuthTwitter oAuth,string UserId,bool device)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("user_id", UserId);
           strdic.Add("device", device.ToString());
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostFriendshipsDestroyUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns detailed information about the relationship between two arbitrary users.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
       public JArray Get_Friendships_Show(oAuthTwitter oAuth,string source_screenname,string getScreenname)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           strdic.Add("source_screen_name",source_screenname);
           strdic.Add("target_screen_name", getScreenname);
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendshipsShowUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl,strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns a cursored collection of user objects for every user the specified user is following 
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="UserId"></param>
       /// <returns></returns>
       public JArray Get_Friends_List(oAuthTwitter oAuth)
       {
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendsListUrl;
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }

       /// <summary>
       /// Returns a cursored collection of user objects for users following the specified user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="UserId"></param>
       /// <returns></returns>
       public JArray Get_Followers_List(oAuthTwitter oAuth)
       {
           SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
           string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersListUrl;
           string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
           if (!response.StartsWith("["))
               response = "[" + response + "]";
           return JArray.Parse(response);
       }
        #endregion
    }
}
