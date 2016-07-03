using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.Youtube.Core
{
    public class PlaylistItems
    {
        public PlaylistItems(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        public string Get_PlaylistItems_List(string accesstoken, string part, string UploadId)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            //string RequestUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=" + part + "&maxResults=50&playlistId=" + UploadId + "&key=" + accesstoken;
            string RequestUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=" + part + "&maxResults=50&playlistId=" + UploadId + "&key=" + accesstoken;
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


        /// <Insert Play lists Items>
        /// 
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="part">Include in the parameter value are snippet, contentDetails, and status. (string)</param>
        /// <param name="playlistId"></param>
        /// <param name="videoId"></param>
        /// <param name="kind">Resource type Eg:- youtube#video</param>
        /// <param name="title"></param>
        /// <param name="description"></param>
        public void Insert_PlaylistsItems(string accesstoken, string part, string playlistId, string videoId, string kind, string title, string description)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string _RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=" + part + "&key=" + accesstoken;
            Uri path = new Uri(_RequestUrl);
            string[] _header = { "Authorization", "X-JavaScript-User-Agent" };
            string[] _val = { "Bearer " + accesstoken, "Google APIs Explorer" };
            string response = string.Empty;

            String _PostData = "{\"snippet\": {\"playlistId\": \"" + playlistId + "\",\"resourceId\": {\"videoId\": \"" + videoId + "\",\"kind\": \"" + kind + "\"},\"title: \"" + title + "\"}}";

            try
            {
                response = objoAuthTokenYoutube.Post_WebRequest(oAuthToken.Method.POST, _RequestUrl, _PostData, _header, _val);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
        }

    }
}
