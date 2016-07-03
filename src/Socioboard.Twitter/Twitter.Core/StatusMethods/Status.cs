using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Xml;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using System.Net;

namespace Socioboard.Twitter.Twitter.Core.StatusMethods
{
    public class Status
    {
        private XmlDocument xmlResult;

        public Status()
        {
            xmlResult = new XmlDocument();
        }

        #region Basic Authentication
        #region ShowStatusByID
        /// <summary>
        /// This Method Will Show User Statues By Id
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <param name="UserId">Twitter UserId Of User</param>
        /// <returns></returns>
        public XmlDocument ShowStatus(TwitterUser User, string UserId)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.ShowStatusUrl + UserId + ".xml";
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region UpdateStatus
        /// <summary>
        /// This Method Will Update Tweets On Twitter
        /// </summary>
        /// <param name="User">Twitter UserName And Password</param>
        /// <param name="StatusText">Status Messages</param>
        /// <returns>Return Xml Text Of Details</returns>
        public XmlDocument UpdateStatus(TwitterUser User, string StatusText)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.UpdateStatusUrl + "?status=" + StatusText;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region ShowStatusByScreenName
        /// <summary>
        /// This Method Will Show User Statues By ScreenName
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <param name="UserId">Twitter UserId Of User</param>
        /// <returns></returns>
        public XmlDocument ShowStatusByScreenName(TwitterUser User, string ScreenName)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.ShowStatusUrlByScreenName + ScreenName;
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Get", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region RetweetStatus
        /// <summary>
        /// This Method Will Retweet 
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <param name="UserId">Tweet Id</param>
        /// <returns></returns>
        public XmlDocument ReTweetStatus(TwitterUser User, string Id)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.ReTweetStatus + Id + ".xml";
            string response = twtWebReq.PerformWebRequest(User, RequestUrl, "Post", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion 
        #endregion


        #region OAuth

        #region UpdateStatus
        /// <summary>
        /// This Method Will Update Tweets On Twitter Using OAUTH
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="StatusText">Status Messages</param>
        /// <returns>Return Xml Text Of Details</returns>
        public XmlDocument UpdateStatus(oAuthTwitter oAuth, string StatusText, SortedDictionary<string, string> strdic)
        {
            try
            {
                string RequestUrl = Socioboard.Twitter.App.Core.Globals.UpdateStatusUrl + "?status=";
                string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
                xmlResult.Load(new StringReader(response));

            }
            catch
            { 
            
            }
            return xmlResult;
        }



        public XmlDocument UpdateStatus(oAuthTwitter oAuth, string StatusText,string reply)
        {
            try
            {
                string RequestUrl = Socioboard.Twitter.App.Core.Globals.UpdateStatusUrl + "?status=" + StatusText + "&in_reply_to_status_id="+reply;
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(RequestUrl);
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream resStream = response.GetResponseStream();
                StreamReader sr = new StreamReader(resStream);
                xmlResult.Load(sr);

            }
            catch
            {

            }
            return xmlResult;
        }
        #endregion

        #region ShowStatusByID
        /// <summary>
        /// This Method Will Show User Statues By Id Using OAUTH
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserId">Twitter UserId Of User</param>
        /// <returns>It will Show User Status Details</returns>
        public XmlDocument ShowStatus(oAuthTwitter oAuth, string UserId)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.ShowStatusUrl + UserId + ".xml";
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion

        #region ShowStatusbyOAuth

        /// <summary>
        /// This Method Will Show User Statues Using OAUTH
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="ScreenName">Twitter UserName</param>
        /// <returns>Return User Status Details</returns>
        public XmlDocument ShowStatusByScreenName(oAuthTwitter oAuth, string ScreenName)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.ShowStatusUrlByScreenName+ScreenName;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, string.Empty);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
        #endregion 

        #region RetweetStatus

        /// <summary>
        /// This Method Will Retweet Using OAUTH
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="UserId">Tweet Id</param>
        /// <returns></returns>
        //public XmlDocument ReTweetStatus(TwitterUser oAuth, string Id)
        //{
        //    string RequestUrl = Socioboard.Twitter.App.Core.Globals.ReTweetStatus + Id + ".xml";
        //    string response = oAuth.PerformWebRequest(User, RequestUrl, "Post", true, "");
        //    xmlResult.Load(new StringReader(response));
        //    return xmlResult;
        //}
        #endregion 

        #endregion
    }

}
