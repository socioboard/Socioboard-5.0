using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Socioboard.Twitter.App.Core
{
    public class TwitterHashTag
    {
        public static string TwitterBoardHashTagSearch(string Hashtag, string LastTweetId)
        {
            Hashtag = Uri.EscapeUriString(Hashtag);
            Hashtag = Hashtag.Replace("%20%E2%80%8E", string.Empty);
            JArray output = new JArray();
            try
            {
                SortedDictionary<string, string> requestParameters = new SortedDictionary<string, string>();
                //requestParameters.Add("user_id", UserId);
                //requestParameters.Add("screen_name", Hashtag);
                //requestParameters.Add("count", "198");
                //Token URL
                var oauth_url = " https://api.twitter.com/1.1/search/tweets.json?q=%23" + Hashtag.TrimStart() + "&result_type=mixed&count=95";
                if (!string.IsNullOrEmpty(LastTweetId))
                {
                    oauth_url = oauth_url + "&since_id=" + LastTweetId;
                }
                var headerFormat = "Bearer {0}";
                var authHeader = string.Format(headerFormat, "AAAAAAAAAAAAAAAAAAAAAKFPggAAAAAArwWHS2FBX%2FkwQQa40yoy3yLxP0Y%3DQW1M1gGoVK1b4WLdQ8gg0lMB7m4gPnAzDTNijQENJrKVocyBfX");

                var postBody = requestParameters.ToWebString();
                ServicePointManager.Expect100Continue = false;

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(oauth_url + "?"
                       + requestParameters.ToWebString());

                request.Headers.Add("Authorization", authHeader);
                request.Method = "GET";
                request.Headers.Add("Accept-Encoding", "gzip");
                HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                Stream responseStream = new GZipStream(response.GetResponseStream(), CompressionMode.Decompress);
                using (var reader = new StreamReader(responseStream))
                {

                    JavaScriptSerializer js = new JavaScriptSerializer();
                    var objText = reader.ReadToEnd();
                    output = JArray.Parse(JObject.Parse(objText)["statuses"].ToString());

                }
            }
            catch (Exception ee) { }

            return output.ToString();
        }

        public static string TwitterHashTagSearchWithMaxTweetId(string Hashtag, string MaxTweetId)
        {
            Hashtag = Uri.EscapeUriString(Hashtag);
            Hashtag = Hashtag.Replace("%20%E2%80%8E", string.Empty);
            JArray output = new JArray();
            try
            {
                SortedDictionary<string, string> requestParameters = new SortedDictionary<string, string>();
                //requestParameters.Add("user_id", UserId);
                //requestParameters.Add("screen_name", Hashtag);
                //requestParameters.Add("count", "198");
                //Token URL
                var oauth_url = string.Empty;
                if (!string.IsNullOrEmpty(MaxTweetId))
                {
                    oauth_url = " https://api.twitter.com/1.1/search/tweets.json?q=%23" + Hashtag.TrimStart() + "&result_type=mixed&count=95&max_id=" + MaxTweetId.ToString();
                }
                else
                {
                    oauth_url = " https://api.twitter.com/1.1/search/tweets.json?q=%23" + Hashtag.TrimStart() + "&result_type=mixed";
                }

                var headerFormat = "Bearer {0}";
                var authHeader = string.Format(headerFormat, "AAAAAAAAAAAAAAAAAAAAAEB7gwAAAAAA2Jk7qBC%2BWVA5tHGEoNn2Z9bayGU%3DNn0MsaxfRaMIsZ0b5UeHymBwl61Sc9TjBR0FokROqonw5a1t3F");

                var postBody = requestParameters.ToWebString();
                ServicePointManager.Expect100Continue = false;

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(oauth_url + "?"
                       + requestParameters.ToWebString());

                request.Headers.Add("Authorization", authHeader);
                request.Method = "GET";
                request.Headers.Add("Accept-Encoding", "gzip");
                HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                Stream responseStream = new GZipStream(response.GetResponseStream(), CompressionMode.Decompress);
                using (var reader = new StreamReader(responseStream))
                {

                    JavaScriptSerializer js = new JavaScriptSerializer();
                    var objText = reader.ReadToEnd();
                    output = JArray.Parse(JObject.Parse(objText)["statuses"].ToString());

                }
            }
            catch (Exception ee) { }

            return output.ToString();
        }

        public static string TwitterHashTagSearch(string Hashtag, string LastTweetId)
        {
            Hashtag = Uri.EscapeUriString(Hashtag);
            Hashtag = Hashtag.Replace("%20%E2%80%8E", string.Empty);
            JArray output = new JArray();
            try
            {
                SortedDictionary<string, string> requestParameters = new SortedDictionary<string, string>();
                //Token URL
                var oauth_url = " https://api.twitter.com/1.1/search/tweets.json?q=%23" + Hashtag.TrimStart() + "&result_type=recent&count=90";
                if (!string.IsNullOrEmpty(LastTweetId))
                {
                    oauth_url = oauth_url + "&since_id=" + LastTweetId;
                }
                var headerFormat = "Bearer {0}";
                var authHeader = string.Format(headerFormat, "AAAAAAAAAAAAAAAAAAAAAOZyVwAAAAAAgI0VcykgJ600le2YdR4uhKgjaMs%3D0MYOt4LpwCTAIi46HYWa85ZcJ81qi0D9sh8avr1Zwf7BDzgdHT");

                var postBody = requestParameters.ToWebString();
                ServicePointManager.Expect100Continue = false;

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(oauth_url + "?"
                       + requestParameters.ToWebString());

                request.Headers.Add("Authorization", authHeader);
                request.Method = "GET";
                request.Headers.Add("Accept-Encoding", "gzip");
                HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                Stream responseStream = new GZipStream(response.GetResponseStream(), CompressionMode.Decompress);
                using (var reader = new StreamReader(responseStream))
                {

                    JavaScriptSerializer js = new JavaScriptSerializer();
                    var objText = reader.ReadToEnd();
                    output = JArray.Parse(JObject.Parse(objText)["statuses"].ToString());

                }
            }
            catch (Exception ee) { }

            return output.ToString();
        }
    }
}
