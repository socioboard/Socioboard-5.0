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
        public static int MaxapiHitsCount = 150;

        public static void PostFacebookMessage(Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.Facebookaccounts _facebook = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == schmessage.profileId && t.IsAccessTokenActive).First();
            apiHitsCount = 0;
            if(_facebook.LastUpdate.AddHours(1)>=DateTime.UtcNow)
            {
                if (_facebook!=null)
                {
                    if (_facebook.IsActive)
                    {
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            if (schmessage.scheduleTime <= DateTime.UtcNow)
                            {
                                string data = ComposeMessage(_facebook.FbProfileType, _facebook.AccessToken, _facebook.FbUserId, schmessage.shareMessage, schmessage.profileId, schmessage.userId, schmessage.picUrl, "");
                                if (!string.IsNullOrEmpty(data))
                                {
                                    apiHitsCount++;
                                }
                                else
                                {
                                    apiHitsCount = MaxapiHitsCount;
                                }
                            }
                        }
                        _facebook.LastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_facebook);
                    }
                    else
                    {
                        apiHitsCount = MaxapiHitsCount;
                    } 
                }
            }
        }


        public static string ComposeMessage(Domain.Socioboard.Enum.FbProfileType profiletype, string accessToken, string fbUserId, string message, string profileId, long userId, string imagePath, string link)
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
                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = imagePath;
                scheduledMessage.profileId = profileId;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.Facebook;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = message;
                scheduledMessage.userId = userId;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = ret;
                dbr.Add<ScheduledMessage>(scheduledMessage);

            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
            return ret;
        }
    }
}
