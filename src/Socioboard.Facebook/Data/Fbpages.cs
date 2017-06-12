using Domain.Socioboard.ViewModels;
using Facebook;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;

namespace Socioboard.Facebook.Data
{
    public class Fbpages
    {
        public static List<Domain.Socioboard.Models.Facebookpage> Getfacebookpages(string accesstoken)
        {
            List<Domain.Socioboard.Models.Facebookpage> lstpages = new List<Domain.Socioboard.Models.Facebookpage>();
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accesstoken;
            dynamic profile = fb.Get("v2.7/me");//v2.1
            dynamic output = fb.Get("v2.7/me/accounts");//v2.1
            foreach (var item in output["data"])
            {
                try
                {
                    Domain.Socioboard.Models.Facebookpage objAddFacebookPage = new Domain.Socioboard.Models.Facebookpage();
                    objAddFacebookPage.ProfilePageId = item["id"].ToString();
                    try
                    {
                        dynamic postlike = fb.Get("v2.7/" + item["id"] + "?fields=likes,name,username,fan_count");
                        objAddFacebookPage.LikeCount = postlike["fan_count"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objAddFacebookPage.LikeCount = "0";
                        
                    }
                    objAddFacebookPage.Name = item["name"].ToString();
                    objAddFacebookPage.AccessToken = item["access_token"].ToString();
                    try
                    {
                        objAddFacebookPage.Email = profile["email"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objAddFacebookPage.Email = "";
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


        public static object getFbPageData(string accessToken)
        {
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accessToken;
           
            try
            {
                return  fb.Get("v2.7/me?fields=id,name,username,likes,fan_count,cover,emails");
            }
            catch (Exception ex)
            {
                return "Invalid Access Token";
            }
        }
        public static string getFbPageData(string accessToken,string PageId)
        {
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accessToken;
            try
            {
               dynamic profile= fb.Get("v2.7/"+ PageId + "?fields=id,name");
               return profile["name"].ToString();
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        public static List<FacebookFanAddsViewModel> GetFacebookFanAdds(string profileId, double Since, double Until)
        {
            List<FacebookFanAddsViewModel> FbFansList = new List<FacebookFanAddsViewModel>();

            return FbFansList;
        }
        //public static dynamic subscribed_apps(string accessToken)
        //{
        //    FacebookClient fb = new FacebookClient();
        //    fb.AccessToken = accessToken;
        //    try
        //    {
        //        return fb.Post("v2.7/me/subscribed_apps");//v2.6
        //    }
        //    catch (Exception ex)
        //    {
        //        return "Invalid Access Token";
        //    }
        //}
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

        public static string getFacebookPageRecentPost(string fbAccesstoken, string pageId,string curser_next)
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

            }
            return output;
        }

        public static string  schedulePage_Post(string accessToken,string link,string scheduled_publish_time)
        {
            FacebookClient fb = new FacebookClient();
            var args = new Dictionary<string, object>();
            args["link"] = link;
            args["scheduled_publish_time"] = scheduled_publish_time;
            args["published"] = "false";
            fb.AccessToken = accessToken;
            try
            {
                return fb.Post("v2.8/me/feed",args).ToString();//v2.6
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}
