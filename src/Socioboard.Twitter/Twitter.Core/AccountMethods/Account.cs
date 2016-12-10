using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;

namespace Socioboard.Twitter.Twitter.Core.AccountMethods
{
    public class Account
    {
        private XmlDocument xmlResult;
        

        public Account()
        {
            xmlResult = new XmlDocument();
          
        }

        #region Basic Authentication
        /// <summary>
        /// This Method Will Check That User is Authenticated Or Not
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <returns>Return Xml Text With User Details</returns>
        public XmlDocument Verify_Credentials(TwitterUser User)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string response = twtWebReq.PerformWebRequest(User, Globals.VerifyCredentialsUrl, "GET", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// this Method Will 
        /// </summary>
        /// <param name="User">Twitter User Name And Password</param>
        /// <returns>Return Xml Text With User Details</returns>
        public XmlDocument Rate_Limit_Status(TwitterUser User)
        {
            TwitterWebRequest twtWebReq = new TwitterWebRequest();
            string response = twtWebReq.PerformWebRequest(User, Globals.RateLimitStatusUrl, "GET", true, "");
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        } 
        #endregion


        //#region OAuth
        ///// <summary>
        ///// This Method Will Check That User is Authenticated Or Not Using OAUTH
        ///// </summary>
        ///// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        ///// <returns>Return Xml Text With User Details</returns>
        //public XmlDocument Verify_Credentials(oAuthTwitter OAuth)
        //{
        //    string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, Globals.VerifyCredentialsUrl, String.Empty);
        //    xmlResult.Load(new StringReader(response));
        //    return xmlResult;
        //}

        /// <summary>
        /// This method Will Check Rate Limit Of Account Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <returns>Return Xml Text With User Details</returns>
        public XmlDocument Rate_Limit_Status(oAuthTwitter OAuth, SortedDictionary<string, string> strdic)
        {
            
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, Globals.RateLimitStatusUrl, strdic);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }


        #region OAuth
        /// <summary>
        /// This Method Will Check That User is Authenticated Or Not Using OAUTH
        /// </summary>
        /// <param name="OAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <returns>Return Xml Text With User Details</returns>
        public JArray Verify_Credentials(oAuthTwitter OAuth)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.GET, Globals.VerifyCredentialsUrl, strdic);
            //xmlResult.Load(new StringReader(response));
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion






    }
}
