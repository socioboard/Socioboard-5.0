using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Youtube.Core
{
    public class Channels
    {
        public Channels(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        public string Get_Channel_List(string accesstoken, string part, int maxResults, bool mine)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/channels?part=" + part + "&mine=" + mine + "&key=" + accesstoken;
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


        /// <Get_Channel_List>
        ///  The id parameter specifies a comma-separated list of the YouTube channel ID(s) for the resource(s) that are being retrieved. 
        ///  In a channel resource, the id property specifies the channel's YouTube channel ID. (string)
        /// </Get_Channel_List>
        /// <param name="accesstoken"></param>
        /// <param name="part"></param>
        /// <param name="Id"></param>
        /// <returns></returns>
        public string Get_Channel_List(string accesstoken, string part, string Id)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/channels?part=" + part + "&id=" + Id + "&key=" + accesstoken;
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



        public string Get_Channel_List_serarch(string accesstoken, string search)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            // string RequestUrl = "https://www.googleapis.com/youtube/v3/channels?part=" + part + "&id=" + Id + "&key=" + accesstoken;
            string RequestUrl = "https://www.googleapis.com/plus/v1/activities?query=salman&key=" + accesstoken;
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
