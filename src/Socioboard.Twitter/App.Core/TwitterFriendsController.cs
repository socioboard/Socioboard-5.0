using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Twitter.Core.FriendshipMethods;

namespace Socioboard.Twitter.App.Core
{
 public class TwitterFriendsController
    {
        private XmlDocument xmlResult;
       // TwitterUser twitterUser;

        public TwitterFriendsController()
        {
            xmlResult = new XmlDocument();
           // twitterUser = new TwitterUser();
        }

        #region Basic Authentication
        #region FollowUser
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm True Follow Is Success</returns>
        public bool FollowUser(TwitterUser twitterUser, string UserToFollow)
        {
            try
            {
                Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
                xmlResult = friendship.Friendships_Create(twitterUser, UserToFollow);
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region FollowUserbyId
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm True Follow Is Success</returns>
        public bool FollowUser(TwitterUser twitterUser, int UserToFollow)
        {
            try
            {
                Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
                xmlResult = friendship.Friendships_Create(twitterUser, UserToFollow);
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region UnFollowUser
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public bool UnFollowUser(TwitterUser twitterUser, string UserToUnFollow)
        {
            try
            {
                Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
                xmlResult = friendship.Friendships_Destroy(twitterUser, UserToUnFollow);
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region UnFollowUserById
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public bool UnFollowUser(TwitterUser twitterUser, int UserToUnFollow)
        {
            try
            {
                Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
                xmlResult = friendship.Friendships_Destroy(twitterUser, UserToUnFollow);
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region FriendsId
        /// <summary>
        /// Get FriendsId Of ScreenName
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Get FriendsId</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public List<string> FriendsId(TwitterUser twitterUser, string ScreenName)
        {
            List<string> lstFriendsId = new List<string>();

            Twitter.Core.SocialGraphMethods.SocialGraph socialGraph = new Twitter.Core.SocialGraphMethods.SocialGraph();
            xmlResult = socialGraph.FriendsId(twitterUser, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
            foreach (XmlNode xmlNode in xmlNodeList)
            {
                lstFriendsId.Add(xmlNode.InnerText.ToString());
            }
            return lstFriendsId;

        }
        #endregion

        #region FollowersId
        /// <summary>
        /// Get FollowersId Of ScreenName
        /// </summary>
        /// <param name="twitterUser">Twitter UserName And Password</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Get FollowersId</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public List<string> FollowersId(TwitterUser twitterUser, string ScreenName)
        {
            List<string> lstFollowersId = new List<string>();

            Twitter.Core.SocialGraphMethods.SocialGraph socialGraph = new Twitter.Core.SocialGraphMethods.SocialGraph();
            xmlResult = socialGraph.FollowersId(twitterUser, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
            foreach (XmlNode xmlNode in xmlNodeList)
            {
                lstFollowersId.Add(xmlNode.InnerText.ToString());
            }
            return lstFollowersId;
        }
        #endregion 
        #endregion

        #region OAuth
        #region FollowUser
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm True Follow Is Success</returns>
        public bool FollowUser(oAuthTwitter oAuth, string UserToFollow, SortedDictionary<string, string> strdic)
        {
            Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
            xmlResult = friendship.Friendships_Create(oAuth, UserToFollow,strdic);
            return true;   
        }
        #endregion

        #region FollowUserbyId
        /// <summary>
        /// Follow Twitter User
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Follow</param>
        /// <returns>Returm True Follow Is Success</returns>
        public bool FollowUser(oAuthTwitter oAuth, int UserToFollow)
        {
            Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
            xmlResult = friendship.Friendships_Create(oAuth, UserToFollow);
            return true;
        }
        #endregion

        #region UnFollowUser
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public bool UnFollowUser(oAuthTwitter oAuth, string UserToUnFollow)
        {
            Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
            xmlResult = friendship.Friendships_Destroy(oAuth, UserToUnFollow);
            return true;
        }
        #endregion

        #region UnFollowUserById
        /// <summary>
        /// UnFollow Twitter User
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To UnFollow</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public bool UnFollowUser(oAuthTwitter oAuth, int UserToUnFollow)
        {
            Twitter.Core.FriendshipMethods.Friendship friendship = new Socioboard.Twitter.Twitter.Core.FriendshipMethods.Friendship();
            xmlResult = friendship.Friendships_Destroy(oAuth, UserToUnFollow);
            return true;
        }
        #endregion

        #region FriendsId
        /// <summary>
        /// Get FriendsId Of ScreenName
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Get FriendsId</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public List<string> FriendsId(oAuthTwitter oAuth, string ScreenName, SortedDictionary<string, string> strdic)
        {
            List<string> lstFriendsId = new List<string>();

            Twitter.Core.SocialGraphMethods.SocialGraph socialGraph = new Twitter.Core.SocialGraphMethods.SocialGraph();
            xmlResult = socialGraph.FriendsId(oAuth, ScreenName,strdic);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
            foreach (XmlNode xmlNode in xmlNodeList)
            {
                lstFriendsId.Add(xmlNode.InnerText.ToString());
            }
            return lstFriendsId;

        }
        #endregion

        #region FollowersId
        /// <summary>
        /// Get FollowersId Of ScreenName
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserToFollow">ScreenName Of Whom You Want To Get FollowersId</param>
        /// <returns>Returm True UnFollow Is Success</returns>
        public List<string> FollowersId(oAuthTwitter oAuth, string ScreenName)
        {
            List<string> lstFollowersId = new List<string>();

            Twitter.Core.SocialGraphMethods.SocialGraph socialGraph = new Twitter.Core.SocialGraphMethods.SocialGraph();
            xmlResult = socialGraph.FollowersId(oAuth, ScreenName);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
            foreach (XmlNode xmlNode in xmlNodeList)
            {
                lstFollowersId.Add(xmlNode.InnerText.ToString());
            }
            return lstFollowersId;
        }
        #endregion  
     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     /// <summary>
        /// Returns a collection of user_ids that the currently authenticated user does not want to receive retweets from.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="count"></param>
     /// <returns></returns>
        public JArray GetFriendships_No_Retweets_Id(oAuthTwitter oAuth, int count)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friendships_No_Retweets_Id(oAuth);
            return jobj;
        }

        /// <summary>
        /// Returns a cursored collection of user IDs for every user the specified user is following
     /// </summary>
     /// <param name="oAuth"></param>
     /// <returns></returns>
        public JArray GetFriends_Id_Url(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friends_Id_Url(oAuth);
            return jobj;
        }
        /// <summary>
        /// Returns a cursored collection of user IDs for every user following the specified user.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <returns></returns>
        public JArray GetFollowers_Id_Url(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Followers_Id_Url(oAuth);
            return jobj;
        }
        
        /// <summary>
        /// Returns the relationships of the authenticating user to the comma-separated list of up to 100 screen_names or user_ids provided.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetFriendships_Lookup(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friendships_Lookup(oAuth);
            return jobj;
        }
        
        /// <summary>
        /// Returns a collection of numeric IDs for every user who has a pending request to follow the authenticating user. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetFriendships_Incoming(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friendships_Incoming(oAuth);
            return jobj;
        }
        
        /// <summary>
        /// Returns a collection of numeric IDs for every protected user for whom the authenticating user has a pending follow request.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray GetFriendships_Outgoing(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friendships_Outgoing(oAuth);
            return jobj;
        }
        
        /// <summary>
        ///  Allows the authenticating users to follow the user specified in the ID parameter.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public JArray PostFriendships_Create(oAuthTwitter oAuth,string UserId)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Post_Friendships_Create(oAuth, UserId);
            return jobj;
        }

        /// <summary>
        /// Allows the authenticating user to unfollow the user specified in the ID parameter.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public JArray PostFriendship_Destroy(oAuthTwitter oAuth, string UserId)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Post_Friendship_Destroy(oAuth, UserId);
            return jobj;
        }

     /// <summary>
        /// Allows one to enable or disable retweets and device notifications from the specified user.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="UserId"></param>
     /// <param name="device"></param>
     /// <returns></returns>
        public JArray PostFriendships_Update(oAuthTwitter oAuth, string UserId,bool device)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Post_Friendships_Update(oAuth, UserId,device);
            return jobj;
        }

     /// <summary>
        /// Returns detailed information about the relationship between two arbitrary users.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="sourceName"></param>
     /// <param name="getName"></param>
     /// <returns></returns>
        public JArray GetFriendships_Show(oAuthTwitter oAuth,string sourceName,string getName)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friendships_Show(oAuth, sourceName, getName);
            return jobj;
        }

     /// <summary>
        /// Returns a cursored collection of user objects for every user the specified user is following 
     /// </summary>
     /// <param name="oAuth"></param>
     /// <returns></returns>
        public JArray GetFriends_List(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Friends_List(oAuth);
            return jobj;
        }
     /// <summary>
        /// Returns a cursored collection of user objects for users following the specified user.
     /// </summary>
     /// <param name="oAuth"></param>
     /// <returns></returns>
        public JArray Get_Followers_List(oAuthTwitter oAuth)
        {
            Friendship objFriend = new Friendship();
            JArray jobj = new JArray();
            jobj = objFriend.Get_Followers_List(oAuth);
            return jobj;
        }
        #endregion
    }
}
