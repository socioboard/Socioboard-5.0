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

        public static void PostTwitterMessage(Domain.Socioboard.Models.ScheduledMessage schmessage, Domain.Socioboard.Models.TwitterAccount _TwitterAccount)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
                if (_TwitterAccount.SchedulerUpdate.AddMinutes(15) <= DateTime.UtcNow)
                {
                    if (_TwitterAccount != null)
                    {
                        if (_TwitterAccount.isActive)
                        {
                            if (apiHitsCount < MaxapiHitsCount)
                            {
                                if (schmessage.scheduleTime <= DateTime.UtcNow)
                                {
                                    string twitterdata = ComposeTwitterMessage(schmessage.shareMessage, schmessage.profileId, schmessage.userId, schmessage.url, false, dbr, _TwitterAccount, schmessage);
                                    if (!string.IsNullOrEmpty(twitterdata))
                                    {
                                        apiHitsCount++;
                                    }
                                }
                            }
                           
                        }
                        else
                        {
                            apiHitsCount = MaxapiHitsCount;
                        }
                    }
                }
                else
                {
                    apiHitsCount = 0;
                }
            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }


        public static string ComposeTwitterMessage(string message, string profileid, long userid, string picurl, bool isScheduled, DatabaseRepository dbr, Domain.Socioboard.Models.TwitterAccount TwitterAccount, Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            bool rt = false;
            string ret = "";
            string str = "Message posted";
            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = TwitterAccount;
            oAuthTwitter OAuthTwt = new oAuthTwitter(Helper.AppSettings.twitterConsumerKey, Helper.AppSettings.twitterConsumerScreatKey, Helper.AppSettings.twitterRedirectionUrl);
            
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

                schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                schmessage.url = ret;
                dbr.Update<ScheduledMessage>(schmessage);


            }
            else
            {
                str = "Message not posted";
            }

            return str;
        }
    }
}
