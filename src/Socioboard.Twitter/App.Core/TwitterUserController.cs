using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.Twitter.Twitter.Core;
using Socioboard.Twitter;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;

namespace Socioboard.Twitter.App.Core
{
    public class TwitterUserController
    {
        private XmlDocument xmlResult;
        List<TwitterUser> lstTwitterUser = new List<TwitterUser>();


        public TwitterUserController()
        {
            xmlResult = new XmlDocument();
        }

        #region Basic Authentication
        /// <summary>
        /// This Method Will Check That User Is Authenticatde Or Not
        /// </summary>
        /// <param name="User">Twitter UserName And Password</param>
        /// <returns>Return True If User Is Authenticated</returns>
        public bool Verify_Credentials(TwitterUser User)
        {
            Twitter.Core.AccountMethods.Account account = new Twitter.Core.AccountMethods.Account();
            xmlResult = account.Verify_Credentials(User);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");
            foreach (XmlNode xmlNode in xmlNodeList)
            {
                //XmlElement idElement = (XmlElement)xmlNode;
                //twitterUser.UserID = idElement.GetElementsByTagName("id")[0].InnerText;
                return true;
            }
            return false;
        }

        /// <summary>
        /// This Method Will Update Tweets On Twitter
        /// </summary>
        /// <param name="User">Twitter UserName And Password</param>
        /// <param name="StatusText">Status Messages</param>
        /// <returns>Return True If Stuatus Sent SuccessFully</returns>
        public bool UpdateStatus(TwitterUser User, string StatusText)
        {
            Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
            xmlResult = status.UpdateStatus(User, StatusText);
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
            if (xmlNodeList.Count > 0)
            {
                return true;
            }
            return false;
        } 
        #endregion

        #region OAuth
        /// <summary>
        /// This Method Will Check That User Is Authenticatde Or Not
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <returns>Return True If User Is Authenticated</returns>
        public bool Verify_Credentials(oAuthTwitter oAuth)
        {
            Twitter.Core.AccountMethods.Account account = new Twitter.Core.AccountMethods.Account();
            JArray obj = account.Verify_Credentials(oAuth);
           // XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");
            foreach (var item in obj)
            {
                //XmlElement idElement = (XmlElement)xmlNode;
                //twitterUser.UserID = idElement.GetElementsByTagName("id")[0].InnerText;
                return true;
            }
            return false;
        }

        /// <summary>
        /// This Method Will Check That User Is Authenticatde Or Not
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <returns>Return True If User Is Authenticated</returns>
        public string GetOAuthScreenName(oAuthTwitter oAuth)
        {
             SortedDictionary<string, string> strdic = new SortedDictionary<string,string>();
            string ScreenName = string.Empty;
            Twitter.Core.AccountMethods.Account account = new Twitter.Core.AccountMethods.Account();
            JArray obj = account.Verify_Credentials(oAuth);
           // xmlResult = account.Verify_Credentials(oAuth);
           // XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");
            foreach (var item in obj)
            {
                ScreenName = item["screen_name"].ToString();
            }
            return ScreenName;
        }

        /// <summary>
        /// This Method Will Update Tweets On Twitter
        /// </summary>
        /// <param name="oAuth">OAuth Keys Token, TokenSecret, ConsumerKey, ConsumerSecret</param>
        /// <param name="StatusText">Status Messages</param>
        /// <returns>Return True If Stuatus Sent SuccessFully</returns>
        public bool UpdateStatus(oAuthTwitter oAuth, string StatusText, SortedDictionary<string, string> strdic)
        {
            try
            {
                Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
                xmlResult = status.UpdateStatus(oAuth, StatusText,strdic);
                XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
                if (xmlNodeList.Count > 0)
                {
                    return true;
                }
            }
            catch (Exception ex)
            { 
            
            }
            return false;
        }



        public bool UpdateStatus(oAuthTwitter oAuth, string StatusText,string reply)
        {
            try
            {
                Twitter.Core.StatusMethods.Status status = new Twitter.Core.StatusMethods.Status();
                xmlResult = status.UpdateStatus(oAuth, StatusText,reply);
                XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("id");
                if (xmlNodeList.Count > 0)
                {
                    return true;
                }
            }
            catch (Exception ex)
            {

            }
            return false;
        }  
        #endregion


    

    }
}
