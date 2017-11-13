using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.GoogleLib.Authentication;
using Newtonsoft.Json.Linq;
using System.Net;

namespace Socioboard.GoogleLib.Youtube.Core
{
    public class Video
    {
        public Video(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;


        public string GetYTVideoDetailList(string apiKey, string VideoId)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics%2CcontentDetails%2Cstatus&id=" + VideoId + "&key=" + apiKey;

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

        public string Get_Video_List(string query, string accesstoken, string part, int maxResults)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/videos?part=" + part + "&chart=mostpopular&maxResults=" + maxResults + "&key=" + accesstoken;
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

        public string Get_VideoCategories(string accesstoken, string part)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            //https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&hl=en_US&regionCode=IN&key={YOUR_API_KEY}
            string RequestUrl = "https://www.googleapis.com/youtube/v3/videoCategories?part=" + part + "&hl=en_US&regionCode=IN&key=" + accesstoken;
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

        public string Get_VideoRating(string accesstoken, string videoId)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + videoId + "&key=" + accesstoken + "&part=snippet,statistics&fields=items(id,snippet,statistics)";
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

        public string Get_VideoDetails_byId(string Videoid, string accesstoken, string part)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/videos?part=" + part + "&id=" + Videoid + "&key=" + accesstoken;
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



        public string Get_Videosby_Channel(string channelId, string accesstoken, string part)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=" + channelId + "&maxResults=50&key=" + accesstoken;

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



        public string Get_CommentsBy_VideoId(string videoId, string accesstoken, string part, string key)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=" + videoId + "&key=" + key;

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


        public string Get_Channel_info(string accesstoken)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accesstoken;

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


        public string Post_Comments_toVideo(string refreshtoken, string VideoId, string commentText)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);


            oAuthToken objoauth = new oAuthToken(_clientId, _clientSecret, _redirectUrl);

            string accesstoken_jdata = objoauth.GetAccessToken(refreshtoken);
            JObject JData = JObject.Parse(accesstoken_jdata);
            string accesstoken = JData["access_token"].ToString();

            commentText = commentText.Replace("\\", "\\\\").Replace("\"", "\\\""); ;

            string RequestUrl = "https://content.googleapis.com/youtube/v3/commentThreads?part=snippet&key=" + accesstoken + "&alt=json";

            string postdata = "{\"snippet\": {\"videoId\": \""+ VideoId + "\",\"topLevelComment\": {\"snippet\": {\"textOriginal\": \""+ commentText +"\"}}}}";

            Uri path = new Uri(RequestUrl);
            string[] header = { "Authorization", "X-JavaScript-User-Agent", "Origin", "X-Origin" };
            string[] val = { "Bearer " + accesstoken, "Google APIs Explorer", "https://content.googleapis.com", "https://developers.google.com" };
            string response = string.Empty;


            try
            {
                response = objoAuthTokenYoutube.Post_WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.POST, RequestUrl, postdata, header, val);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }



            return response;


        }


        //codes for data services and without authenticate
        public string GetChannelInfo(string accesstoken, string ChannelId)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=" + ChannelId + "&key=" + accesstoken;

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

        public string GetChannelCmntCount(string accesstoken, string ChannelId)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&channelId=" + ChannelId + "&maxResults=100&key=" + accesstoken;

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


        public string Get_Search_List(string apiKey, string query)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/search?part=" + "snippet" + "&maxResults=" + "50" + "&q=" + query + "&key=" + apiKey;

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

        public string Get_Search_List_Page(string apiKey, string query, string page)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&pageToken=" + page + "&q=" + query + "&key=" + apiKey;

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


        public string Get_CommentsRepliesBy_CmParentId(string cmParentId, string key)
        {
            oAuthTokenYoutube objoAuthTokenYoutube = new oAuthTokenYoutube(_clientId, _clientSecret, _redirectUrl);

            string RequestUrl = "https://www.googleapis.com/youtube/v3/comments?part=snippet&maxResults=100&parentId=" + cmParentId + "&key=" + key;

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

    }
}
