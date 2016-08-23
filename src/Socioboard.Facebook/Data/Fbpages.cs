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
            dynamic profile = fb.Get("v2.1/me");
            dynamic output = fb.Get("v2.1/me/accounts");
            foreach (var item in output["data"])
            {
                try
                {
                    Domain.Socioboard.Models.Facebookpage objAddFacebookPage = new Domain.Socioboard.Models.Facebookpage();
                    objAddFacebookPage.ProfilePageId = item["id"].ToString();
                    try
                    {
                        dynamic postlike = fb.Get("v2.1/" + item["id"] + "?fields=likes,name,username");
                        objAddFacebookPage.LikeCount = postlike["likes"].ToString();
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
                return  fb.Get("v2.1/me?fields=id,name,username,likes");
            }
            catch (Exception ex)
            {
                return "Invalid Access Token";
            }
        }

       public static List<FacebookFanAddsViewModel> GetFacebookFanAdds(string profileId, double Since, double Until)
        {
            List<FacebookFanAddsViewModel> FbFansList = new List<FacebookFanAddsViewModel>();

            return FbFansList;
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
    }
}
