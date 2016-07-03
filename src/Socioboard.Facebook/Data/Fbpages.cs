using Facebook;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Facebook.Data
{
    public class Fbpages
    {
        public static List<Domain.Socioboard.Models.Facebookpage> Getfacebookpages(string accesstoken)
        {
            List<Domain.Socioboard.Models.Facebookpage> lstpages = new List<Domain.Socioboard.Models.Facebookpage>();
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accesstoken;
            dynamic profile = fb.Get("v2.6/me");
            dynamic output = fb.Get("v2.6/me/accounts");
            foreach (var item in output["data"])
            {
                try
                {
                    Domain.Socioboard.Models.Facebookpage objAddFacebookPage = new Domain.Socioboard.Models.Facebookpage();
                    objAddFacebookPage.ProfilePageId = item["id"].ToString();
                    try
                    {
                        dynamic postlike = fb.Get("v2.0/" + item["id"] + "?fields=likes,name,username");
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
                return  fb.Get("v2.0/me?fields=id,name,username,likes");
            }
            catch (Exception ex)
            {
                return "Invalid Access Token";
            }
        }

       
    }
}
