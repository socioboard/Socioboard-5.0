using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Xml;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;

namespace Socioboard.Twitter.Twitter.Core.TimeLineMethods
{
    public class TimeLine
    {
        private XmlDocument xmlResult;

        public TimeLine()
        {
            xmlResult = new XmlDocument();
        }

        #region Basic Authentication 
        /// <summary>
        /// Get All Mentions Of User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Mentionc Of User</returns>
        public XmlDocument Status_Mention(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.MentionUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All Tweets Sent By User And Friend
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Tweets Sent By User And Friend</returns>
        public XmlDocument Status_HomeTimeLine(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.HomeTimeLineUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All Tweets Sent By User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Tweets Sent By User</returns>
        public XmlDocument Status_UserTimeLine(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UserTimeLineUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All ReTweets Sent By User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return XmlText Of ReTweets</returns>
        public XmlDocument Status_RetweetedByMe(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.RetweetedByMeUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        } 
        #endregion

        #region OAuth
        /// <summary>
        /// Get All Mentions Of User Using OAUTH,Twitter Api Version 1.0, Socioboard.Twitter Version 1.0.0.0,
        /// This method is depricated now.
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Mentionc Of User</returns>
        /// 
        public XmlDocument Status_Mention(oAuthTwitter OAuth, string Count, SortedDictionary<string, string> strdic)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.MentionUrl + Count;
            string response = OAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All Tweets Sent By User And Friend Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Tweets Sent By User And Friend</returns>
        public XmlDocument Status_HomeTimeLine(oAuthTwitter OAuth, string Count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.HomeTimeLineUrl + Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All Tweets Sent By User Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return XmlText Of Tweets Sent By User</returns>
        public XmlDocument Status_UserTimeLine(oAuthTwitter OAuth, string Count,string ScreenName)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UserTimeLineUrl + ScreenName+"&count="+Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All ReTweets Sent By User Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return XmlText Of ReTweets</returns>
        public XmlDocument Status_RetweetedByMe(oAuthTwitter OAuth, string Count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.RetweetedByMeUrl + Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// Get All ReTweets Sent By User Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return XmlText Of ReTweets</returns>
        public XmlDocument Status_Mentions(oAuthTwitter OAuth, string Count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.MentionUrl + Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }  



        #endregion

        #region Get_Statuses_Mentions_Timeline
        /// <summary>
        ///  	Returns the 20 most recent mentions (tweets containing a users's @screen_name) for the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Statuses_Mentions_Timeline(oAuthTwitter oAuth)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.statusesMentionTimelineUrl;
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Statuses_User_Timeline
        /// <summary>
        ///  	Returns a collection of the most recent Tweets posted by the user indicated by the screen_name or user_id parameters.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Statuses_User_Timeline(oAuthTwitter oAuth)
        {

            string RequestUrl = Socioboard.Twitter.App.Core.Globals.statusesUserTimelineUrl;


            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

           

            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }

        public JArray Get_Statuses_User_Timeline(oAuthTwitter oAuth,string ProfileId)
        {

            string RequestUrl = Socioboard.Twitter.App.Core.Globals.statusesUserTimelineUrl;

            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("user_id", ProfileId);


            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }


        #endregion

        #region Get_Statuses_Home_Timeline
        /// <summary>
        ///  	Returns a collection of the most recent Tweets and retweets posted by the authenticating user and the users they follow. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Statuses_Home_Timeline(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.statusesHomeTimelineUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("count", "100");
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Statuses_Retweet_Of_Me
        /// <summary>
        ///  	Returns the most recent tweets authored by the authenticating user that have been retweeted by others.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Statuses_Retweet_Of_Me(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.statusesRetweetsOfMeUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }
        #endregion

        #region Get_List_Of_Followers

        public JArray Get_User_Followers(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersListUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        public JArray Get_User_FollowersWithCurser(oAuthTwitter oAuth, string curser)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersListUrl;
            //string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersListUrl + "?cursor="+curser;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("cursor", curser);
            string response = oAuth.OAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        #endregion
    }
}
