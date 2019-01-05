using Facebook;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using Socioboard.Facebook.Utils;

namespace Socioboard.Facebook.Data
{
    public static class FbUser
    {
        public static object GetFbUser(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me?fields=id,about,birthday,cover,education,email,gender,hometown,name,first_name,last_name,work,picture");//v2.6
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static long GetFbFriends(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            dynamic friends = fb.Get($"{FbConstants.FacebookApiVersion}/me/friends");
            try
            {
                return Convert.ToInt64(friends["summary"]["total_count"].ToString());
            }
            catch (Exception)
            {
                return 0;
            }            
        }

        public static dynamic GetFeeds(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                var details = fb.Get($"{FbConstants.FacebookApiVersion}/me/feed?limit=99&fields=picture,created_time,message,description,story,from,likes.summary(true),comments.summary(true),type,application");//v2.1
                return details;
            }
            catch (Exception)
            {
                return "Invalid Access Token";            
            }
        }


        public static dynamic GetFeeds(string accessToken, string facebookId)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + facebookId + "/posts?limit=99&fields=picture,created_time,message,description,story,from,likes.summary(true),comments.summary(true),type,application");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic GetFeedDetail(string accessToken, string postId)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + postId + "?fields=likes.summary(true),comments.summary(true),shares");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic PostDetails(string accessToken, string postId)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + postId + "/insights");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic Conversations(string accessToken)
        {

            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/conversations");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic Notifications(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/notifications");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic GetPostComments(string accessToken, string postId)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/" + postId + "/comments?limit=99");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }


        public static string PostComments(string accessToken, string postId, string message)
        {
            var args = new Dictionary<string, object> {["message"] = message};
            var fb = new FacebookClient {AccessToken = accessToken};
           
            try
            {
                return fb.Post($"{FbConstants.FacebookApiVersion}/" + postId + "/comments", args).ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }

        public static dynamic FbGet(string accessToken, string url)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get(url);
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic GetPageTaggedPostDetails(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/tagged?fields=picture,created_time,message,description,from&limit=99");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static dynamic GetPromotablePostsDetails(string accessToken)
        {
            var fb = new FacebookClient {AccessToken = accessToken};
            try
            {
                return fb.Get($"{FbConstants.FacebookApiVersion}/me/promotable_posts?fields=picture,created_time,message,description,from&limit=99");
            }
            catch (Exception)
            {
                return "Invalid Access Token";
            }
        }

        public static string SetPrivacy(string privacy, FacebookClient fb, string fbUserId)
        {
            try
            {
                JObject Jdata;
                var jValue = string.Empty;

                if (!string.IsNullOrEmpty(privacy))
                {
                    if (privacy == "Close Friends")
                    {
                        Jdata = JObject.Parse(fb.Get("/" + fbUserId + "/friendlists/close_friends").ToString());
                        string closefrndid = Jdata["data"][0]["id"].ToString();
                        jValue = "{ \"description\": \"Close Friends\",\"value\": \"CUSTOM\",\"friends\": \"SOME_FRIENDS\",\"networks\": \"\",\"allow\":\"" + closefrndid + "\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Only Me")
                    {
                        jValue = "{\"description\": \"Only Me\",\"value\": \"SELF\",\"friends\": \"\",\"networks\": \"\",\"allow\": \"\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Friends")
                    {
                        jValue = "{\"description\": \"Your friends\",\"value\": \"ALL_FRIENDS\",\"friends\": \"\",\"networks\": \"\",\"allow\": \"\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Friends of Friends")
                    {
                        jValue = "{\"description\": \"Your friends of friends\",\"value\": \"FRIENDS_OF_FRIENDS\",\"friends\": \"\",\"networks\": \"\",\"allow\": \"\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Family")
                    {
                        Jdata = JObject.Parse(fb.Get("/" + fbUserId + "/friendlists/family").ToString());
                        string familyid = Jdata["data"][0]["id"].ToString();
                        jValue = "{\"description\": \"Family\",\"value\": \"CUSTOM\",\"friends\": \"SOME_FRIENDS\",\"networks\": \"\",\"allow\": \"" + familyid + "\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Public")
                    {
                        jValue = "{\"description\": \"Public\",\"value\": \"EVERYONE\",\"friends\": \"\",\"networks\": \"\",\"allow\": \"\",\"deny\": \"\"}";
                    }
                    else if (privacy == "Acquaintances")
                    {
                        Jdata = JObject.Parse(fb.Get("/" + fbUserId + "/friendlists/acquaintances").ToString());
                        var acquaintancesId = Jdata["data"][0]["id"].ToString();
                        jValue = "{\"description\": \"Acquaintances\",\"value\": \"CUSTOM\",\"friends\": \"SOME_FRIENDS\",\"networks\": \"\",\"allow\": \"" + acquaintancesId + "\",\"deny\": \"\"}";
                    }
                    return jValue;
                }
                return "";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return "";
            }
        }


    }
}
