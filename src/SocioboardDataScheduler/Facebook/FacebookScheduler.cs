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
                            string data = ComposeMessage(_facebook.FbProfileType, _facebook.AccessToken, _facebook.FbUserId, schmessage.shareMessage, schmessage.profileId, schmessage.userId, schmessage.url, schmessage.link, schmessage);
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

           
            if (profiletype == Domain.Socioboard.Enum.FbProfileType.FacebookProfile)
            {
                args["privacy"] = FbUser.SetPrivacy("Public", fb, profileId);
            }
            try
            {
                if (string.IsNullOrEmpty(link))
                {

                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        if (!string.IsNullOrEmpty(message))
                        {
                            args["message"] = message;
                        }

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
                        ret = fb.Post("v2.7/" + fbUserId + "/photos", args).ToString();
                    } 
                    else
                    {
                        args["message"] = message;
                        ret = fb.Post("v2.7/" + fbUserId + "/feed", args).ToString();
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(link))
                    {
                        if (message.Contains("https://") || message.Contains("http://"))
                        {
                            link = message;
                            if (link.Contains("https://"))
                            {
                                string links = getBetween(link + "###", "https", "###");
                                links = "https" + links;
                                link = links;
                            }
                            if (link.Contains("http://"))
                            {
                                string links = getBetween(link + "###", "http", "###");
                                links = "http" + links;
                                link = links;
                            }
                            message = message.Replace(link, "");
                            args["message"] = message;
                        }
                        else
                        {
                            args["message"] = message;
                        }
                    }
                    else
                    {
                        args["message"] = message;
                    }
                    if (!string.IsNullOrEmpty(link))
                    {
                        args["link"] = link;
                    }
                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        args["picture"] = imagePath.Replace("&", "&amp;");
                    }
                    ret = fb.Post("v2.7/" + fbUserId + "/feed", args).ToString();

                }

                schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                //schmessage.url = ret;
                dbr.Update<ScheduledMessage>(schmessage);

            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
            return ret;
        }

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }

    }
}
