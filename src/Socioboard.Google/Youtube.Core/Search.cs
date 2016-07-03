using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Youtube.Core
{
    class Search
    {
        public Search(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        //This methods for searching Video list by Searching keyword
        public string Get_Search_List(string query, string accesstoken, string part, int maxResults)
        {      
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/search?part=" + part + "&maxResults=" + maxResults + "&q=" + query + "&key=" + accesstoken;
            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val, Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET.ToString());
                //if (!response.StartsWith("["))
                //    response = "[" + response + "]";
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return response;
        }

        



    }
}
