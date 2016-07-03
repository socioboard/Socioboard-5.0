using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Facebook;
using Microsoft.Extensions.Logging;
using Socioboard.Facebook.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public static class FacebookHelper
    {
        public static string ComposeMessage(Domain.Socioboard.Enum.FbProfileType profiletype, string accessToken, string fbUserId, string message, string profileId, long userId, string imagePath, string link, DatabaseRepository dbr, ILogger _logger)
        {
            string ret = "";

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
                    //byte[] img = System.IO.File.ReadAllBytes(imagepath);
                    var webClient = new WebClient();
                    byte[] img = webClient.DownloadData(imagePath);
                    media.SetValue(img);
                    args["source"] = media;
                    ret = fb.Post("v2.0/" + fbUserId + "/photos", args).ToString();
                }
                else
                {
                    if (!string.IsNullOrEmpty(link))
                    {
                        args["link"] = link;
                    }
                    ret = fb.Post("v2.0/" + fbUserId + "/feed", args).ToString();

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
                _logger.LogError(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return ret;
        }
    }
}
