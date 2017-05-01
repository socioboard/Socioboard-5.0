using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib;
using System.Net;
using System.IO;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Youtube.Core
{
    public class Activities
    {

        public Activities(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

        //Get All Activities
        //

        public string GetYtVideos(string ChannelId, string ApiKey)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=" + ChannelId + "&maxResults=50&key=" + ApiKey;

            Uri path = new Uri(RequestUrl);
            string[] header = { "token_type", "expires_in" };
            string[] val = { "Bearer", "3600" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }


            return response;


        }



        public string Get_All_Activities(string accesstoken, oAuthTokenYoutube.Parts part, bool mine, int maxResults)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=" + part.ToString() + "&mine=" + mine.ToString() + "&maxResults=50&key=" + accesstoken;
            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val, Authentication.oAuthToken.Method.GET.ToString());
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return response;
        }





        public string Get_Activities(string accesstoken, string part, string channelId, int maxResults)
        {
            //https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=UCBR8-60-B28hp2BmDPdntcQ&maxResults=50&key={YOUR_API_KEY}

            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);


            string RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=" + part + "&channelId=" + channelId + "&maxResults=" + maxResults + "&key=" + accesstoken;
            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;
            try
            {
                response = objoAuthTokenYoutube.WebRequestHeader(path, header, val, Authentication.oAuthToken.Method.GET.ToString());
                //if (!response.StartsWith("["))
                //    response = "[" + response + "]";
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return response;
        }

        /// <POST API Methods >
        /// API Methods 
        /// </summary>
        /// 

        public string Post_Activities(string accesstoken, string part, string title, string description)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string _RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=" + part + "&key=" + accesstoken;
            Uri path = new Uri(_RequestUrl);
            string[] _header = {"Authorization", "X-JavaScript-User-Agent" };
            string[] _val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;

            String _PostData = "{\"snippet\": {\"description\": \"" + description + "\",\"" + title + "\": \"hello\"}}";

            try
            {
                response = objoAuthTokenYoutube.Post_WebRequest(oAuthToken.Method.POST,_RequestUrl,_PostData,_header,_val);

            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }

            return response;
        }


    }
}
