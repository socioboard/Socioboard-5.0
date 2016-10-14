using Domain.Socioboard.Models;
using Facebook;
using Socioboard.Facebook.Data;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Facebook
{
    public class FacebookScheduler
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 40;

        public static void PostFacebookMessage(Domain.Socioboard.Models.ScheduledMessage schmessage, Domain.Socioboard.Models.Facebookaccounts _facebook)
        {
            try
            {
                if (_facebook != null)
                {
                    if (_facebook.IsActive)
                    {
                        if (schmessage.scheduleTime <= DateTime.UtcNow)
                        {
                            string data = ComposeMessage(_facebook.FbProfileType, _facebook.AccessToken, _facebook.FbUserId, schmessage.shareMessage, schmessage.profileId, schmessage.userId, schmessage.url, "", schmessage);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }


        public static string ComposeMessage(Domain.Socioboard.Enum.FbProfileType profiletype, string accessToken, string fbUserId, string message, string profileId, long userId, string imagePath, string link, Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            string ret = "";
            DatabaseRepository dbr = new DatabaseRepository();
            FacebookClient fb = new FacebookClient();
            fb.AccessToken = accessToken;
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            var args = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(message))
            {
                args["message"] = message;
            }
            if (profiletype == Domain.Socioboard.Enum.FbProfileType.FacebookProfile)
            {
                args["privacy"] = FbUser.SetPrivacy("Public", fb, profileId);
            }
            try
            {
                if (!string.IsNullOrEmpty(imagePath))
                {
                    Uri u = new Uri(imagePath);
                    string filename = string.Empty;
                    string extension = string.Empty;
                    extension = System.IO.Path.GetExtension(u.AbsolutePath).Replace(".", "");
                    var media = new FacebookMediaObject
                    {
                        FileName = "filename",
                        ContentType = "image/" + extension
                    };
                    var webClient = new WebClient();
                    byte[] img = webClient.DownloadData(imagePath);
                    media.SetValue(img);
                    args["source"] = media;
                    ret = fb.Post("v2.1/" + fbUserId + "/photos", args).ToString();
                }
                else
                {
                    if (!string.IsNullOrEmpty(link))
                    {
                        args["link"] = link;
                    }
                    ret = fb.Post("v2.1/" + fbUserId + "/feed", args).ToString();

                }

                schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                schmessage.url = ret;
                dbr.Update<ScheduledMessage>(schmessage);

            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
            return ret;
        }
    }
}
