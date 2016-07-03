using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;

namespace Socioboard.Twitter.Twitter.Core.DirectMessageMethods
{
    public class DirectMessage
    {
        private XmlDocument xmlResult;

        public DirectMessage()
        {
            xmlResult = new XmlDocument();
        }

        #region Basic Authentication
        /// <summary>
        /// This Method Will Get All Direct Message Of User
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns>Xml Text Of DirectMessage</returns>
        public XmlDocument DirectMessages(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.DirectMessageGetByUserUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This Method Will Get All Direct Message Sent By User
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <param name="Count">Number Of DirectMessage Sent By User</param>
        /// <returns>Xml Text Of DirectMessage Sent By User</returns>
        public XmlDocument DirectMessage_Sent(TwitterUser User, string Count)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.DirectMessageSentByUserUrl + Count;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This will Send DirectMessage to the User
        /// </summary>
        /// <param name="User">Twitter UserName Password</param>
        /// <param name="DirectMessage">DirectMessage</param>
        /// <param name="UserId">USerId Whom You Want to Send Direct Message</param>
        /// <returns></returns>
        public XmlDocument NewDirectMessage(TwitterUser User, string DirectMessage, string ScreenName)
        {

            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.NewDirectMessage + "?screen_name=" + ScreenName + "&text=" + DirectMessage;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This will Method will delete Direct Message by Direct Message Id
        /// </summary>
        /// <param name="User">Twitter UserName and Password</param>
        /// <param name="DirectMessageId">Direct Message Id</param>
        /// <returns></returns>
        public XmlDocument DeleteDirectMessage(TwitterUser User, int DirectMessageId)
        {

            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.NewDirectMessage + DirectMessageId + ".xml";
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        } 
        #endregion

        #region OAuth
        /// <summary>
        /// This Method is Depricated. Please Use "Get_Direct_Message(oAuth,count)" instead.
        /// This Method Will Get All Direct Message Of User Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns>Xml Text Of DirectMessage</returns>
        public XmlDocument DirectMessages(oAuthTwitter OAuth, string Count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.DirectMessageGetByUserUrl + Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET,RequestUrl,string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This Method is Depricated. Please Use "Get_Direct_Messages_Sent(oAuth,count)" instead.
        /// This Method Will Get All Sent Direct Message By User Using OAuth
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage Sent By User</param>
        /// <returns>Xml Text Of DirectMessage Sent By User</returns>
        public XmlDocument DirectMessage_Sent(oAuthTwitter OAuth, string Count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.DirectMessageSentByUserUrl + Count;
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This Method is Depricated. Please Use "Post_Direct_Messages_New(oAuth,text)" instead.
        /// This will Send DirectMessage to the User
        /// </summary>
        /// <param name="User">Twitter UserName Password</param>
        /// <param name="DirectMessage">DirectMessage</param>
        /// <param name="UserId">USerId Whom You Want to Send Direct Message</param>
        /// <returns></returns>
        public XmlDocument SendDirectMessage(oAuthTwitter OAuth, string DirectMessage, string ScreenName)
        {

           
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.NewDirectMessage + "?screen_name=" + ScreenName + "&text=";
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, OAuth.UrlEncode(DirectMessage));//twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// This Method is Depricated. Please Use "Post_Direct_Messages_New(oAuth,text)" instead.
        /// This will Send DirectMessage to the User
        /// </summary>
        /// <param name="User">Twitter UserName Password</param>
        /// <param name="DirectMessage">DirectMessage</param>
        /// <param name="UserId">USerId Whom You Want to Send Direct Message</param>
        /// <returns></returns>
        public XmlDocument SendDirectMessage(oAuthTwitter OAuth, string DirectMessage, int  UserId)
        {


            string RequestUrl = Socioboard.Twitter.App.Core.Globals.NewDirectMessage + "?user_id=" + UserId + "&text=";
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, OAuth.UrlEncode(DirectMessage));//twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// <summary>
        /// Returns most recent direct messages sent to the authenticating user. Includes detailed information about the sender and recipient user.
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns></returns>
        public JArray Get_Direct_Messages(oAuthTwitter oAuth,int count)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("count",count.ToString());
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetDirectMesagesUrl;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            return JArray.Parse(response);
        }

        /// <summary>
        /// Returns the most recent direct messages sent by the authenticating user. Includes detailed information about the sender and recipient user. 
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="Count">Number Of DirectMessage</param>
        /// <returns></returns>
        public JArray Get_Direct_Messages_Sent(oAuthTwitter oAuth, int count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetDirectMessagesSentUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("count", count.ToString());
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        
        /// <summary>
        /// Returns a single direct message, specified by an id parameter. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="directMessageId"></param>
        /// <returns></returns>
        public JArray Get_Direct_Messages_Show_ById(oAuthTwitter oAuth, string directMessageId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetDirectMessagesShowUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("id", directMessageId);

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

        /// <summary>
        /// Destroys the direct message specified in the required ID parameter. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="directMessageId"></param>
        /// <returns></returns>
        public JArray Post_Direct_Messages_Destroy_ById(oAuthTwitter oAuth, string directMessageId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostDirectMessagesDestroyUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("id", directMessageId);
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, string.Empty);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }

       /// <summary>
        /// Sends a new direct message to the specified user from the authenticating user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="textMessage"></param>
       /// <returns></returns>
        public JArray Post_Direct_Messages_New(oAuthTwitter oAuth,string textMessage, string userId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostDirectMesagesNewUrl; 
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("text", textMessage);
            strdic.Add("user_id", userId);
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        
    }
}
