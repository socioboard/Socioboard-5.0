using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;

namespace Socioboard.Twitter.Twitter.Core.SocialGraphMethods
{
    public class SocialGraph
    {
         private XmlDocument xmlResult;

         public SocialGraph()
         {
             xmlResult = new XmlDocument();
         }

         #region Basic Authentication

         #region FriendsId
        
        /// <summary>
        /// This Method Will Get All Friends Id of User  
        /// </summary>
        /// <param name="User">Twitter User Name and Password</param>
         /// <param name="ScreenName">ScreenName Of Whom You Want To Get FriendsId</param>
        /// <returns>All Friends Id</returns>
         public XmlDocument FriendsId(TwitterUser User, string ScreenName)
         {
             TwitterWebRequest twtWebReq = new TwitterWebRequest();
             string RequestUrl = Socioboard.Twitter.App.Core.Globals.FriendsIdUrl + ScreenName;
             string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
         #endregion

         #region FollowersId

         /// <summary>
         /// This Method Will Get All Followers Id of User  
         /// </summary>
         /// <param name="User">Twitter User Name and Password</param>
         /// <param name="ScreenName">ScreenName Of Whom You Want To Get Followers Id</param>
         /// <returns>All Followers Id</returns>
         public XmlDocument FollowersId(TwitterUser User, string ScreenName)
         {
             TwitterWebRequest twtWebReq = new TwitterWebRequest();
             string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowersIdUrl + ScreenName;
             string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
         #endregion 

         #endregion

         #region OAuth
         #region FriendsId
         /// <summary>
         /// This Method Will Get All Friends Id of User  
         /// </summary>
         /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
         /// <param name="ScreenName">ScreenName Of Whom You Want To Get FriendsId</param>
         /// <returns>All Friends Id</returns>
         public XmlDocument FriendsId(oAuthTwitter OAuth, string ScreenName, SortedDictionary<string, string> strdic)
         {
             string RequestUrl = Socioboard.Twitter.App.Core.Globals.FriendsIdUrl + ScreenName;
             string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET,RequestUrl,strdic);
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
         #endregion

         #region FollowersId
         /// <summary>
         /// This Method Will Get All Followers Id of User  
         /// </summary>
         /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
         /// <param name="ScreenName">ScreenName Of Whom You Want To Get Followers Id</param>
         /// <returns>All Followers Id</returns>
         public XmlDocument FollowersId(oAuthTwitter OAuth, string ScreenName)
         {
             string RequestUrl = Socioboard.Twitter.App.Core.Globals.FollowersIdUrl + ScreenName;
             string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET,RequestUrl,string.Empty);
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
         #endregion  
         #endregion

    }
}
