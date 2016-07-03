using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Youtube.Core
{
    public class Subscriptions
    {
        public Subscriptions(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        



        /// <Get_Subscriptions_List>
        /// 
        /// </summary>
        /// <param name="accesstoken">true</param>
        /// <param name="part">snippet</param>
        /// <returns></returns>
        public string Get_Subscriptions_List(string accesstoken, string part)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/subscriptions?part=" + part + "&mine=true&maxResults=50&key=" + accesstoken;
            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val, Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET.ToString());
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return response;
        }

    }
}
