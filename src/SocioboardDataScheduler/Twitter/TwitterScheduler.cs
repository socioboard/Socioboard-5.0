using Domain.Socioboard.Models;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Twitter
{
    public class TwitterScheduler
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 100;

        public static void PostTwitterMessage(Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == schmessage.profileId && t.isActive).First();
            if (_TwitterAccount.lastUpdate.AddMinutes(15) <= DateTime.UtcNow)
            {
                if (_TwitterAccount != null)
                {
                    if (_TwitterAccount.isActive)
                    {
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            if (schmessage.scheduleTime <= DateTime.UtcNow)
                            {
                                string twitterdata = ComposeTwitterMessage(schmessage.shareMessage, schmessage.profileId, schmessage.userId, schmessage.picUrl, false, dbr, _TwitterAccount);
                                if(!string.IsNullOrEmpty(twitterdata))
                                {
                                    apiHitsCount++;
                                }
                            }
                        }
                        _TwitterAccount.lastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);
                    }
                    else
                    {
                        apiHitsCount = MaxapiHitsCount;
                    }
                }
            }
        }


        public static string ComposeTwitterMessage(string message, string profileid, long userid, string picurl, bool isScheduled, DatabaseRepository dbr, Domain.Socioboard.Models.TwitterAccount TwitterAccount)
        {
            bool rt = false;
            string ret = "";
            string str = "Message posted";
            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = TwitterAccount;
            oAuthTwitter OAuthTwt = new oAuthTwitter("MbOQl85ZcvRGvp3kkOOJBlbFS", "GF0UIXnTAX28hFhN1ISNf3tURHARZdKWlZrsY4PlHm9A4llYjZ", "http://serv1.socioboard.com/TwitterManager/Twitter");
            OAuthTwt.AccessToken = objTwitterAccount.oAuthToken;
            OAuthTwt.AccessTokenSecret = objTwitterAccount.oAuthSecret;
            OAuthTwt.TwitterScreenName = objTwitterAccount.twitterScreenName;
            OAuthTwt.TwitterUserId = objTwitterAccount.twitterUserId;

            Tweet twt = new Tweet();
            if (!string.IsNullOrEmpty(picurl))
            {
                try
                {
                    PhotoUpload ph = new PhotoUpload();
                    string res = string.Empty;
                    rt = ph.NewTweet(picurl, message, OAuthTwt, ref res);
                }
                catch (Exception ex)
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            else
            {
                try
                {
                    JArray post = twt.Post_Statuses_Update(OAuthTwt, message);
                    ret = post[0]["id_str"].ToString();
                }
                catch (Exception ex)
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }

            if (!string.IsNullOrEmpty(ret) || rt == true)
            {

                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = picurl;
                scheduledMessage.profileId = profileid;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.Twitter;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = message;
                scheduledMessage.userId = userid;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = ret;
                dbr.Add<ScheduledMessage>(scheduledMessage);


            }
            else
            {
                str = "Message not posted";
            }

            return str;
        }
    }
}
