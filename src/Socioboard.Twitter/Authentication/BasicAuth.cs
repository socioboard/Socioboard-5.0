using System;
using System.Collections.Generic;
using System.Text;
using Socioboard.Twitter.Twitter.Core;
using System.Xml;
using System.IO;
using Socioboard.Twitter.App.Core;

namespace Socioboard.Twitter.Authentication
{
    public class BasicAuth:IAuthentication 
    {
        
       
        private TwitterWebRequest twitterWebRequest;
        
        XmlDocument xmlDoc;
        
        public  BasicAuth()
        {
            twitterWebRequest = new TwitterWebRequest();
            xmlDoc = new XmlDocument();
        }

        #region IAuthentication Members

        public bool Authenticated(TwitterUser twitterUser,string goodProxy)
        {
            string Response = twitterWebRequest.PerformWebRequest(twitterUser, Globals.VerifyCredentialsUrl, "GET", true,goodProxy );
            if (Response.Contains("401"))
            {
                //Logger.LogText ("Login failed "+Response  );
                return false;
            }
            //Logger.LogText(twitterUser.TwitterUserName +" logged in",null);
            return true;
        }

        #endregion
    }

}
