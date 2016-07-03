/*
 Desc:Added Methods for TimeLine & Direct Message with oAuth Using v1.1 of Twitter API.
 * 
 * Date : 14/05/2013
 * 
 * Last Modified : Added Methods for Direct Message with oAuth Using v1.1 of Twitter API.
 */

using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.Twitter.Core;
using Socioboard.Twitter.Twitter.Core.TimeLineMethods;
using Socioboard.Twitter;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Twitter.Core.DirectMessageMethods;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using Socioboard.Twitter.Twitter.Core.TweetMethods;

namespace Socioboard.Twitter.App.Core
{

    public class TwitterUser
    {
        private XmlDocument xmlResult;
        
        public List<direct_messages> DirectMessages = new List<direct_messages>();
        public List<status> StatusTimeLine = new List<status>();
        public List<search> SearchMethod = new List<search>();
        public List<userstatus> UserMethod = new List<userstatus>();

        public TwitterUser()
        {
            xmlResult = new XmlDocument();
        }

        #region TwitterUserProperties
       
        private string _twitterusername;
        private string _twitteruserpassword;
        private string _userid;
        public int ID { get; set; }
        public string ScreenName { get; set; }
        public string Location { get; set; }
        public string TimeZone { get; set; }
        public string Description { get; set; }
        public Uri ProfileImageUri { get; set; }
        public Uri ProfileUri { get; set; }
        public bool IsProtected { get; set; }
        public int NumberOfFollowers { get; set; }
        public int Friends_count { get; set; }
        public string NoofStatusUpdates { get; set; }
        public string StatusCount { get; set; }

        public TwitterUser(string username, string password)
        {
            this._twitterusername = username;
            this._twitteruserpassword = password;
        }

        public string TwitterUserName
        {
            get { return _twitterusername; }
            set { _twitterusername = value; }
        }

        public string TwitterPassword
        {
            get { return _twitteruserpassword; }
            set { _twitteruserpassword = value; }
        }

        public string UserID
        {
            get { return _userid; }
            set { _userid = value; }
        }

        public string FollowsFilePath { get; set; }
        public string UnfollowsFilePath { get; set; }
        public string NewFollowersFilePath { get; set; } 
        #endregion
      

        #region Direct Message Structure
        /// <summary>
        /// Direct Message Structure Of All Elements
        /// </summary>
        public struct direct_messages
        {
            public string Id { get; set; }
            public string sender_id { get; set; }
            public string Description { get; set; }
            public string created_at { get; set; }
            public string sender_screen_name { get; set; }
            public string recipient_screen_name { get; set; }

            public sender senderObject;
            public recipient recipientObject;   

        
            public struct sender
            {
                public string ScreenName { get; set; }
                public Uri ProfileImageUrl { get; set; }
                public int FollowersCount { get; set; }
                public int FriendsCount { get; set; }
                public int StatusesCount { get; set; }
            }
          

            public struct recipient
            {

            }
        }

        #endregion


        #region Status Structure
        /// <summary>
        /// Status Structure Of All Elements
        /// </summary>
        public struct status
        {
            public string created_at { get; set; }
            public string Description { get; set; }
            public string Id { get; set; }
            public user userObject;

            public struct user
            {
                public string ScreenName { get; set; }
                public Uri ProfileImageUrl { get; set; }
                public int FollowersCount { get; set; }
                public int FriendsCount { get; set; }
                public int StatusesCount { get; set; }
            }
        } 
        #endregion

        #region Search Structure

        /// <summary>
        /// Search Structure Of All Elements
        /// </summary>
        public struct search
        {
            public string content { get; set; }
            public string PostedTime { get; set; }
            public string link { get; set; }
            public string id { get; set; }
            public author authorObject;

            public struct author
            {
                public string name { get; set; }
            }
        } 
        #endregion

        #region User Satus
        /// <summary>
        /// Get User's Friend Status
        /// </summary>
        public struct userstatus
        {
            public string Id { get; set; }
            public string ScreenName { get; set; }
            public Uri ProfileImageUrl { get; set; }
            public string Next { get; set; }
            public string Previous { get; set; }
            public string Status { get; set; }
            public string FrinedsCount { get; set; }
            public string FollowersCount { get; set; }
            public string StatusCount { get; set; }
            public string RetweetCount { get; set; }
            public string LatesStatusTime { get; set; }
            public string LatestRetweetTime { get; set; }
        }

        public JArray Post_Status_Update(oAuthTwitter oauth, string status)
        {
            Tweet twt = new Tweet();
            SortedDictionary<string ,string> strdic = new SortedDictionary<string,string>();
         JArray update =    twt.Post_Statuses_Update(oauth, status);
         return update;
        }


        #endregion

        #region Basic Authentication
        #region DirectMessages
        /// <summary>
        /// Get All Direct Messages Of User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Direct Messages</param>
        /// <returns>Return List Of DirectMessage</returns>
        public List<direct_messages> GetDirectMessages(TwitterUser User, string Count)
        {
            direct_messages direct_Messages = new direct_messages();

            Twitter.Core.DirectMessageMethods.DirectMessage directMessage = new Twitter.Core.DirectMessageMethods.DirectMessage();
            xmlResult = directMessage.DirectMessages(User, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("direct_message");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement idElement = (XmlElement)xn;
                direct_Messages.Id = idElement.GetElementsByTagName("id")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                direct_Messages.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                direct_Messages.senderObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                direct_Messages.senderObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                direct_Messages.senderObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                direct_Messages.senderObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                direct_Messages.senderObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                DirectMessages.Add(direct_Messages);
            }
            return DirectMessages;

        }

        //public bool NewDirectMessage(TwitterUser User,string DirectMessage,int UserId)
        //{
        //    Twitter.Core.DirectMessageMethods.DirectMessage directMessage = new Twitter.Core.DirectMessageMethods.DirectMessage();
        //    xmlResult = directMessage.NewDirectMessage(User, DirectMessage,UserId);
        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("recipient");
        //    foreach (XmlNode xn in xmlNodeList)
        //    {
        //        return true;
        //    }
        //    return false;


        //}

        #endregion

        #region TimeLine
        /// <summary>
        /// Get All Tweets Sent By User And Friend
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return List Of Tweets Sent By User And Friend</returns>
        public List<status> GetStatuses_HomeTimeLine(TwitterUser User, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_HomeTimeLine(User, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }

        /// <summary>
        /// Get All Tweets Sent By User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return List Of Tweets Sent By User </returns>
        public List<status> GetStatuses_UserTimeLine(TwitterUser User, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_UserTimeLine(User, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }

        /// <summary>
        /// Get All ReTweets Sent By User
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return List Of ReTweets</returns>
        public List<status> GetStatuses_ReTweetTimeLine(TwitterUser User, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_RetweetedByMe(User, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }

        #endregion

        #region Status
        /// <summary>
        /// Get User Status
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">ScreenName Of User</param>
        /// <returns>Return List Of User Detail</returns>
        public List<status> GetStatusOfUser(TwitterUser User, string ScreenName)
        {
            status objStatus = new status();

            Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
            xmlResult = status.ShowStatusByScreenName(User, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");

            foreach (XmlNode xn in xmlNodeList)
            {

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }
        /// <summary>
        /// ReTweet
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">TweetId</param>
        /// <returns>Returm True If ReTweet Success</returns>
        public bool ReTweetStatus(TwitterUser twitterUser, string TweetId)
        {
            try
            {
                Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
                xmlResult = status.ReTweetStatus(twitterUser, TweetId);
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Search
        /// <summary>
        /// Search
        /// </summary>
        /// <param name="User">Twitter User And Password</param>
        /// <param name="Count">SearchKey For Search</param>
        /// <returns>Return Search Result</returns>
        public List<search> GetSearchMethod(TwitterUser User, string SearchKey)
        {
            search objSearch = new search();

            Twitter.Core.SearchMethods.Search search = new Twitter.Core.SearchMethods.Search();
            xmlResult = search.SearchMethod(User, SearchKey);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("entry");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement idElement = (XmlElement)xn;
                objSearch.id = idElement.GetElementsByTagName("id")[0].InnerText; 

                XmlElement imageUrlElement = (XmlElement)xn;
                objSearch.content = imageUrlElement.GetElementsByTagName("content")[0].InnerText;

                XmlElement followersCountElement = (XmlElement)xn;
                objSearch.link = followersCountElement.GetElementsByTagName("updated")[0].NextSibling.Attributes["href"].InnerText;

                XmlElement friendCountElement = (XmlElement)xn;
                objSearch.authorObject.name = friendCountElement.GetElementsByTagName("name")[0].InnerText;

                SearchMethod.Add(objSearch);
            }
            return SearchMethod;

        }

        #endregion 
        #endregion

        #region OAuth

        #region DirectMessages

        /// <summary>
        /// Get All Direct Messages Of User.
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Direct Messages</param>
        /// <returns>Return List Of DirectMessage</returns>
        public List<direct_messages> GetDirectMessages(oAuthTwitter OAuth, string Count, SortedDictionary<string, string> strdic)
        {
            direct_messages direct_Messages = new direct_messages();

            Twitter.Core.DirectMessageMethods.DirectMessage directMessage = new Twitter.Core.DirectMessageMethods.DirectMessage();
            xmlResult = directMessage.DirectMessages(OAuth, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("direct_message");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement idElement = (XmlElement)xn;
                direct_Messages.Id = idElement.GetElementsByTagName("id")[0].InnerText;

                XmlElement sender_idElement = (XmlElement)xn;
                direct_Messages.sender_id = sender_idElement.GetElementsByTagName("sender_id")[0].InnerText;

                XmlElement created_atElement = (XmlElement)xn;
                direct_Messages.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement sender_screen_nameElement = (XmlElement)xn;
                direct_Messages.sender_screen_name = sender_screen_nameElement.GetElementsByTagName("sender_screen_name")[0].InnerText;

                XmlElement recipient_screen_nameElement = (XmlElement)xn;
                direct_Messages.recipient_screen_name = recipient_screen_nameElement.GetElementsByTagName("recipient_screen_name")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                direct_Messages.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                direct_Messages.senderObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                direct_Messages.senderObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                direct_Messages.senderObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                direct_Messages.senderObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                direct_Messages.senderObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                DirectMessages.Add(direct_Messages);
            }
            return DirectMessages;

        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// <summary>
        /// Returns most recent direct messages sent to the authenticating user. Includes detailed information about the sender and recipient user.
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns></returns>
        public JArray GetDirect_Messages(oAuthTwitter oAuth, int count)
        {
            DirectMessage objDM = new DirectMessage();
            JArray jobjDM = new JArray();
            jobjDM = objDM.Get_Direct_Messages(oAuth, count);
            return jobjDM;
        }

        /// <summary>
        /// Returns the most recent direct messages sent by the authenticating user. Includes detailed information about the sender and recipient user. 
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns></returns>
        public JArray GetDirect_Messages_Sent(oAuthTwitter oAuth, int count)
        {
            DirectMessage objDM = new DirectMessage();
            JArray jobjDMS = new JArray();
            jobjDMS = objDM.Get_Direct_Messages_Sent(oAuth, count);
            return jobjDMS;
        }

        /// <summary>
        ///  Returns a single direct message, specified by an id parameter. 
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="directMessageId">ID Of DirectMessage</param>
        /// <returns></returns>
        public JArray GetDirect_Messages_Show_ById(oAuthTwitter oAuth, string directMessageId)
        {
            DirectMessage objDM = new DirectMessage();
            JArray jobjDMS = new JArray();
            jobjDMS = objDM.Get_Direct_Messages_Show_ById(oAuth, directMessageId);
            return jobjDMS;
        }

        /// <summary>
        /// Destroys the direct message specified in the required ID parameter. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="directMessageId"></param>
        /// <returns></returns>
        public JArray PostDirect_Messages_Destroy_ById(oAuthTwitter oAuth, string directMessageId)
        {
            DirectMessage objDM = new DirectMessage();
            JArray jobjDMS = new JArray();
            jobjDMS = objDM.Post_Direct_Messages_Destroy_ById(oAuth, directMessageId);
            return jobjDMS;
        }

        /// <summary>
        /// Sends a new direct message to the specified user from the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="textMessage"></param>
        /// <returns></returns>
        public JArray PostDirect_Messages_New(oAuthTwitter oAuth, string textMessage, string userId)
        {
            DirectMessage objDM = new DirectMessage();
            JArray jobjDMN = new JArray();
            jobjDMN = objDM.Post_Direct_Messages_New(oAuth, textMessage, userId);
            return jobjDMN;
        }
        #endregion

        #region TimeLine
        /// <summary>
        /// This Method is Depricated. Please use the "GetStatuses_Home_Timeline(oAuth) method instead.
        /// Get All Tweets Sent By User And Friend
        /// </summary>
        /// <param name="User">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return List Of Tweets Sent By User And Friend</returns>
        public List<status> GetStatuses_HomeTimeLine(oAuthTwitter OAuth, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_HomeTimeLine(OAuth, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement created_atElement = (XmlElement)xn;
                objStatus.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement id_atelement = (XmlElement)xn;
                objStatus.Id = id_atelement.GetElementsByTagName("id")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }

        /// <summary>
        /// This Method is Depricated. Please use the "GetStatuses_User_Timeline(oAuth) method instead.
        /// Get All Tweets Sent By User
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of Tweets</param>
        /// <returns>Return List Of Tweets Sent By User </returns>
        public List<status> GetStatuses_UserTimeLine(oAuthTwitter OAuth, string Count,string ScreenName)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_UserTimeLine(OAuth, Count,ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement created_atElement = (XmlElement)xn;
                objStatus.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }

        /// <summary>
        /// This Method is Depricated. Please use the "GetStatuses_Retweet_Of_Me(oAuth) method instead.
        /// Get All ReTweets Sent By User
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return List Of ReTweets</returns>
        public List<status> GetStatuses_ReTweetTimeLine(oAuthTwitter OAuth, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_RetweetedByMe(OAuth, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement created_atElement = (XmlElement)xn;
                objStatus.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }


        /// <summary>
        /// This Method is Depricated. Please use the "GetStatuses_Mentions_Timeline(oAuth)" method instead.
        /// Get All ReTweets Sent By User
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of ReTweets</param>
        /// <returns>Return List Of ReTweets</returns>
        public List<status> GetStatuses_MentionsTimeLine(oAuthTwitter OAuth, string Count)
        {
            status objStatus = new status();

            Twitter.Core.TimeLineMethods.TimeLine timeline = new Twitter.Core.TimeLineMethods.TimeLine();
            xmlResult = timeline.Status_Mentions(OAuth, Count);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement created_atElement = (XmlElement)xn;
                objStatus.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement textElement = (XmlElement)xn;
                objStatus.Description = textElement.GetElementsByTagName("text")[0].InnerText;

                XmlElement screenNameElement = (XmlElement)xn;
                objStatus.userObject.ScreenName = screenNameElement.GetElementsByTagName("screen_name")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// <summary>
        /// 	Returns the 20 most recent mentions (tweets containing a users's @screen_name) for the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetStatuses_Mentions_Timeline(oAuthTwitter oAuth)
        {
            TimeLine objTimeLine = new TimeLine();
            JArray jobjMentions = new JArray();
            jobjMentions = objTimeLine.Get_Statuses_Mentions_Timeline(oAuth);
            return jobjMentions;
        }

        /// <summary>
        /// Returns a collection of the most recent Tweets posted by the user indicated by the screen_name or user_id parameters.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetStatuses_User_Timeline(oAuthTwitter oAuth)
        {
            TimeLine objTimeLine = new TimeLine();
            JArray jobjUserTimeline = new JArray();
            jobjUserTimeline = objTimeLine.Get_Statuses_User_Timeline(oAuth);
            return jobjUserTimeline;
        }

        /// <summary>
        /// Returns a collection of the most recent Tweets and retweets posted by the authenticating user and the users they follow.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetStatuses_Home_Timeline(oAuthTwitter oAuth)
        {
            TimeLine objTimeLine = new TimeLine();
            JArray jobjHomeTimeline = new JArray();
            jobjHomeTimeline = objTimeLine.Get_Statuses_Home_Timeline(oAuth);
            return jobjHomeTimeline;
        }

        /// <summary>
        /// Returns the most recent tweets authored by the authenticating user that have been retweeted by others.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetStatuses_Retweet_Of_Me(oAuthTwitter oAuth)
        {
            TimeLine objTimeLine = new TimeLine();
            JArray jobjRetweet = new JArray();
            jobjRetweet = objTimeLine.Get_Statuses_Retweet_Of_Me(oAuth);
            return jobjRetweet;
        }
        #endregion
          

        #region Status
        /// <summary>
        /// Get User Status
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">ScreenName Of User</param>
        /// <returns>Return List Of User Detail</returns>
        public List<status> GetStatusOfUser(oAuthTwitter OAuth, string ScreenName)
        {
            status objStatus = new status();

            Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
            xmlResult = status.ShowStatusByScreenName(OAuth, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement created_atElement = (XmlElement)xn;
                objStatus.created_at = created_atElement.GetElementsByTagName("created_at")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objStatus.userObject.ProfileImageUrl = new Uri(imageUrlElement.GetElementsByTagName("profile_image_url")[0].InnerText);

                XmlElement followersCountElement = (XmlElement)xn;
                objStatus.userObject.FollowersCount = int.Parse(followersCountElement.GetElementsByTagName("followers_count")[0].InnerText);

                XmlElement friendCountElement = (XmlElement)xn;
                objStatus.userObject.FriendsCount = int.Parse(friendCountElement.GetElementsByTagName("friends_count")[0].InnerText);

                XmlElement statusElement = (XmlElement)xn;
                objStatus.userObject.StatusesCount = int.Parse(statusElement.GetElementsByTagName("statuses_count")[0].InnerText);

                StatusTimeLine.Add(objStatus);
            }
            return StatusTimeLine;

        }
        /// <summary>
        /// ReTweet
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">TweetId</param>
        /// <returns>Returm True If ReTweet Success</returns>
        //public bool ReTweetStatus(oAuthTwitter OAuth, string TweetId)
        //{
        //    try
        //    {
        //        Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
        //        xmlResult = status.ReTweetStatus(OAuth, TweetId);
        //        return true;
        //    }
        //    catch
        //    {
        //        return false;
        //    }
        //}

        #endregion

        #region Search
        /// <summary>
        /// Search
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">SearchKey For Search</param>
        /// <returns>Return Search Result</returns>
        public List<search> GetSearchMethod(oAuthTwitter OAuth, string SearchKey,string pageindex)
        {
            search objSearch = new search();

            Twitter.Core.SearchMethods.Search search = new Twitter.Core.SearchMethods.Search();
            xmlResult = search.SearchMethod(OAuth, SearchKey, pageindex);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("entry");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement idElement = (XmlElement)xn;
                objSearch.id = idElement.GetElementsByTagName("id")[0].InnerText.Replace("tag:search.twitter.com,2005:", "");

                XmlElement idPostedTime = (XmlElement)xn;
                objSearch.PostedTime = idElement.GetElementsByTagName("published")[0].InnerText;

                XmlElement imageUrlElement = (XmlElement)xn;
                objSearch.content = imageUrlElement.GetElementsByTagName("content")[0].InnerText;

                XmlElement followersCountElement = (XmlElement)xn;
                objSearch.link = followersCountElement.GetElementsByTagName("updated")[0].NextSibling.Attributes["href"].InnerText;

                XmlElement friendCountElement = (XmlElement)xn;
                string name = friendCountElement.GetElementsByTagName("name")[0].InnerText;
                int FirstPoint = name.IndexOf("(");
                objSearch.authorObject.name = name.Substring(0, FirstPoint).Replace("(", "").Replace(" ", "");

                SearchMethod.Add(objSearch);
            }
            return SearchMethod;

        }

        public List<search> GetSearchMethodForTwtUser(oAuthTwitter OAuth, string SearchKey, string pageindex)
        {
            search objSearch = new search();

            Twitter.Core.SearchMethods.Search search = new Twitter.Core.SearchMethods.Search();
            JObject jsonResult = search.SearchMethodForTwtUser(OAuth, SearchKey, pageindex);
             JArray data = (JArray)jsonResult["results"];

            if (data!=null)
            {
                foreach (var userdetails in data)
                {
                    objSearch.id = (string)userdetails["from_user_id_str"];
                    objSearch.link = (string)userdetails["profile_image_url"];
                    objSearch.authorObject.name = (string)userdetails["from_user"];
                    SearchMethod.Add(objSearch);
                } 
            }
            return SearchMethod;

        }
        #endregion  

        #region User Status
        /// <summary>
        /// FriendsStatusOfUser
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="ScreenName">User Screen Name</param>
        /// <returns></returns>
 

        /// <summary>
        /// FollowersStatusOfUser
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="ScreenName">User Screen Name</param>
        /// <returns></returns>
   
        #endregion

        /// <summary>
        /// Sends Direct Messages to a twitter User whose ScreenName is passed
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="DirectMessage"></param>
        /// <param name="ScreenName">Twitter ScreenName</param>
        /// <returns>boolean</returns>
        public bool SendDirectMessagebyScreenName(oAuthTwitter OAuth, string DirectMessage, string ScreenName)
        {
            Twitter.Core.DirectMessageMethods.DirectMessage directMessage = new Twitter.Core.DirectMessageMethods.DirectMessage();
            xmlResult = directMessage.SendDirectMessage(OAuth, DirectMessage, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("direct_message");
            if (xmlNodeList.Count > 0)
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="DirectMessage"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public bool SendDirectMessagebyID(oAuthTwitter OAuth, string DirectMessage, int UserId)
        {
            Twitter.Core.DirectMessageMethods.DirectMessage directMessage = new Twitter.Core.DirectMessageMethods.DirectMessage();
            xmlResult = directMessage.SendDirectMessage(OAuth, DirectMessage, UserId);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("direct_message");
            if (xmlNodeList.Count > 0)
            {
                return true;
            }
            return false;
        }


        #region User
        /// <summary>
        /// Returns settings (including current trend, geo and sleep time information) for the authenticating user. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetAccount_Settings(oAuthTwitter oAuth)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Account_Settings(oAuth);
            return jarrUser;
        }


        /// <summary>
        /// Returns an HTTP 200 OK response code and a representation of the requesting user if authentication was successful; 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetAccount_Verify_Credentials(oAuthTwitter oAuth)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Account_Verify_Credentials(oAuth);
            return jarrUser;
        }

        /// <summary>
        /// Updates the authenticating user's settings.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="trend_location_woeid">The Yahoo! Where On Earth ID to use as the user's default trend location. Global information is available by using 1 as the WOEID.</param>
        /// <param name="sleep_time_enabled">When set to true, t or 1, will enable sleep time for the user.</param>
        /// <param name="start_sleep_time">The hour that sleep time should begin if it is enabled.</param>
        /// <param name="end_sleep_time">The hour that sleep time should end if it is enabled.</param>
        /// <param name="time_zone">The timezone dates and times should be displayed in for the user.</param>
        /// <param name="lang">The language which Twitter should render in for this user. </param>
        /// <returns></returns>
        public JArray PostAccount_Settings(oAuthTwitter oAuth, string trend_location_woeid, string sleep_time_enabled, string start_sleep_time, string end_sleep_time, string time_zone, string lang)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Settings(oAuth,trend_location_woeid,sleep_time_enabled,start_sleep_time,end_sleep_time,time_zone,lang);
            return jarrUser;
        }  

        /// <summary>
        /// Sets which device Twitter delivers updates to for the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="device">Must be one of: sms, none.</param>
        /// <returns></returns>
        public JArray PostAccount_Update_Delivery_Device(oAuthTwitter oAuth, string device)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Update_Delivery_Device(oAuth,device);
            return jarrUser;
        }

        /// <summary>
        /// Sets values that users are able to set under the "Account" tab of their settings page. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="name">Full name associated with the profile. Maximum of 20 characters.</param>
        /// <param name="url">URL associated with the profile. Will be prepended with "http://" if not present. </param>
        /// <param name="location">The city or country describing where the user of the account is located.</param>
        /// <param name="description">A description of the user owning the account. Maximum of 160 characters.</param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
        /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
        /// <returns></returns>
        public JArray PostAccount_Update_Profile(oAuthTwitter oAuth, string name, string url, string location, string description, bool include_entities, bool skip_status)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Update_Profile(oAuth,name,url,location,description,include_entities,skip_status);
            return jarrUser;
        }

         /// <summary>
        /// Updates the authenticating user's profile background image. T
      /// </summary>
      /// <param name="oAuth"></param>
      /// <param name="image">The background image for the profile, base64-encoded. Must be a valid GIF, JPG, or PNG image of less than 800 kilobytes in size.</param>
        /// <param name="tile">Whether or not to tile the background image. </param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
        /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
      /// <param name="use">Determines whether to display the profile background image or not</param>
      /// <returns></returns>
        public JArray PostAccount_Update_Profile_Background_Image(oAuthTwitter oAuth, string image, string tile, bool include_entities, bool skip_status, bool use)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Update_Profile_Background_Image(oAuth,image,tile,include_entities,skip_status,use);
            return jarrUser;
        }

          /// <summary>
        /// Sets one or more hex values that control the color scheme of the authenticating user's profile page on twitter.com.
       /// </summary>
       /// <param name="oAuth"></param>
        /// <param name="profile_background_color">Profile background color.</param>
        /// <param name="profile_link_color">Profile link color.</param>
        /// <param name="profile_sidebar_border_color">Profile sidebar's border color.</param>
        /// <param name="profile_sidebar_fill_color">Profile sidebar's background color.</param>
        /// <param name="profile_text_color">Profile text color.</param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
       /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
       /// <returns></returns>
        public JArray PostAccount_Update_Profile_Colors(oAuthTwitter oAuth, string profile_background_color, string profile_link_color, string profile_sidebar_border_color, string profile_sidebar_fill_color, string profile_text_color, bool include_entities, bool skip_status, bool use)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Update_Profile_Colors(oAuth,profile_background_color,profile_link_color,profile_sidebar_border_color,profile_sidebar_fill_color,profile_text_color,include_entities,skip_status,use);
            return jarrUser;
        }

         /// <summary>
       /// The avatar image for the profile, base64-encoded. Must be a valid GIF, JPG, or PNG image of less than 700 kilobytes in size.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="image"></param>
       /// <param name="include_entities"></param>
       /// <param name="skip_status"></param>
       /// <returns></returns>
        public JArray PostAccount_Update_Profile_Image(oAuthTwitter oAuth, string image, bool include_entities, bool skip_status)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Account_Update_Profile_Image(oAuth, image,include_entities, skip_status);
            return jarrUser;
        }

        
        /// <summary>
        ///Returns a collection of user objects that the authenticating user is blocking.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetBlocks_List(oAuthTwitter oAuth)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Blocks_List(oAuth);
            return jarrUser;
        }

         /// <summary>
        ///Returns an array of numeric user ids the authenticating user is blocking.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetBlocks_Ids(oAuthTwitter oAuth)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Blocks_Ids(oAuth);
            return jarrUser;
        }

        /// <summary>
        /// Blocks the specified user from following the authenticating user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="user_id"></param>
       /// <returns></returns>
        public JArray PostBlocks_Create(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Blocks_Create(oAuth, user_id);
            return jarrUser;
        }

           /// <summary>
        /// Blocks the specified user from following the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="user_id"></param>
        /// <returns></returns>
        public JArray PostBlocks_Destroy(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Post_Blocks_Destroy(oAuth, user_id);
            return jarrUser;
        }

           /// <summary>
        ///Returns fully-hydrated user objects for up to 100 users per request, as specified by comma-separated values passed to the user_id
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_LookUp(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_LookUp(oAuth, user_id);
            return jarrUser;
        }

        /// <summary>
        ///Returns fully-hydrated user objects for up to 100 users per request, as specified by comma-separated values passed to the screen_name
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_LookUp_ScreenName(oAuthTwitter oAuth, string screen_name)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_LookUp_ByScreenName(oAuth, screen_name);
            return jarrUser;
        }

           /// <summary>
        ///Returns a variety of information about the user specified by the required user_id
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_Show(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_Show(oAuth, user_id);
            return jarrUser;
        }

            /// <summary>
        ///Provides a simple, relevance-based search interface to public user accounts on Twitter. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_Search(oAuthTwitter oAuth, string keyword,string count)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_Search(oAuth, keyword,count);
            return jarrUser;
        }

            /// <summary>
        ///Returns a collection of users that the specified user can "contribute" to.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_Contributees(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_Contributees(oAuth, user_id);
            return jarrUser;
        }

          /// <summary>
        ///Returns a collection of users who can contribute to the specified account.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_Contributors(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_Contributors(oAuth, user_id);
            return jarrUser;
        }

           /// <summary>
        /// Removes the uploaded profile banner for the authenticating user. Returns HTTP 200 upon success
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="image"></param>
        /// <param name="include_entities"></param>
        /// <param name="skip_status"></param>
        /// <returns></returns>
        public string PostAccount_Remove_Profile_Banner(oAuthTwitter oAuth)
        {
            Users objUser = new Users();
            string jarrUser = objUser.Post_Account_Remove_Profile_Banner(oAuth);
            return jarrUser;
        }

          /// <summary>
        /// Uploads a profile banner on behalf of the authenticating user.
        /// If providing any one of the height, width, offset_left, or offset_top parameters, you must provide all of the sizing parameters
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="banner"></param>
     /// <param name="height"></param>
     /// <param name="width"></param>
     /// <param name="offset_left"></param>
     /// <param name="offset_top"></param>
     /// <returns></returns>
        public string PostAccount_Update_Profile_Banner(oAuthTwitter oAuth, string banner, int height, int width, string offset_left, string offset_top)
        {
            Users objUser = new Users();
            string jarrUser = objUser.Post_Account_Update_Profile_Banner(oAuth,banner,height,width,offset_left,offset_top);
            return jarrUser;
        }

          /// <summary>
        ///Returns a map of the available size variations of the specified user's profile banner.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetUsers_Profile_Banner(oAuthTwitter oAuth, string user_id)
        {
            Users objUser = new Users();
            JArray jarrUser = new JArray();
            jarrUser = objUser.Get_Users_Profile_Banner(oAuth, user_id);
            return jarrUser;
        }
        #endregion
        #endregion


    }
}
