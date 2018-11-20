using Domain.Socioboard.ViewModels;
using Facebook;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using Socioboard.Facebook.Utils;

namespace Socioboard.Facebook.Data
{
    public class Fbpages
    {
        public static List<Domain.Socioboard.Models.Facebookpage> Getfacebookpages(string accesstoken)
        {
            var lstpages = new List<Domain.Socioboard.Models.Facebookpage>();
            var fb = new FacebookClient { AccessToken = accesstoken };
            dynamic profile = fb.Get($"{FbConstants.FacebookApiVersion}/me");
            dynamic output = fb.Get($"{FbConstants.FacebookApiVersion}/me/accounts");
            foreach (var item in output["data"])
            {
                try
                {
                    var objAddFacebookPage = new Domain.Socioboard.Models.Facebookpage
                    {
                        ProfilePageId = item["id"].ToString()
                    };
                    try
                    {
                        dynamic postlike = fb.Get($"{FbConstants.FacebookApiVersion}/" + item["id"] + "?fields=likes,name,username,fan_count");
                        objAddFacebookPage.LikeCount = postlike["fan_count"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objAddFacebookPage.LikeCount = "0";
                        Console.WriteLine(ex.Message);
                    }
                    objAddFacebookPage.Name = item["name"].ToString();
                    objAddFacebookPage.AccessToken = item["access_token"].ToString();
                    try
                    {
                        objAddFacebookPage.Email = profile["email"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objAddFacebookPage.Email = string.Empty;
                        Console.WriteLine(ex.Message);
                    }
                    lstpages.Add(objAddFacebookPage);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                }
            }
            return lstpages;
        }

        public static object GetFbPageData(string accessToken)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                // username, emails, fan_count are deprecated,so removed in following request
                // before fb.Get($"{FbConstants.FacebookApiVersion}/me?fields=id,name,username,likes,fan_count,cover,emails");

                return fb.Get($"{FbConstants.FacebookApiVersion}/me?fields=id,name,likes,cover");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "Invalid Access Token";
            }
        }

        public static string GetFbPageName(string accessToken, string pageId)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                dynamic profile = fb.Get($"{FbConstants.FacebookApiVersion}/" + pageId + "?fields=id,name");
                return profile["name"].ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "";
            }
        }

        public static string GetPosts(string accessToken, string id, string paginationUrl)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            try
            {
                return string.IsNullOrEmpty(paginationUrl)
                    ? fb.Get($"{FbConstants.FacebookApiVersion}/" + id + "/posts?limit=30").ToString()
                    : fb.Get(paginationUrl).ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "";
            }
        }

        public static string getFacebookRecentPost(string fbAccesstoken, string pageId)
        {
            string output = string.Empty;
            string facebookSearchUrl = "https://graph.facebook.com/v1.0/" + pageId + "/posts?limit=30&access_token=" + fbAccesstoken;
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }

        public static string getFacebookPageRecentPost(string fbAccesstoken, string pageId, string curser_next)
        {
            string output = string.Empty;
            string facebookSearchUrl = string.Empty;
            if (string.IsNullOrEmpty(curser_next))
            {
                facebookSearchUrl = "https://graph.facebook.com/v1.0/" + pageId + "/posts?limit=30&access_token=" + fbAccesstoken;
            }
            else
            {
                facebookSearchUrl = curser_next;
            }
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }

        public static string subscribed_apps(string fbAccesstoken, string pageId)
        {
            string output = string.Empty;
            string facebookSearchUrl = "https://graph.facebook.com/v2.7/" + pageId + "/subscribed_apps?access_token=" + fbAccesstoken;
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "POST";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            return output;
        }

        public static string schedulePage_Post(string accessToken, string link, string scheduled_publish_time)
        {
            var fb = new FacebookClient { AccessToken = accessToken };
            var args = new Dictionary<string, object>
            {
                ["link"] = link,
                ["scheduled_publish_time"] = scheduled_publish_time,
                ["published"] = "false"
            };

            try
            {
                return fb.Post("v2.8/me/feed", args).ToString();//v2.6
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "";
            }
        }

    }
}
