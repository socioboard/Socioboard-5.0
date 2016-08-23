using Domain.Socioboard.Models;
using Socioboard.LinkedIn.Authentication;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.LinkedIn
{
    public class LinkedInScheduler
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 25;


        public static void PostLinkedInMessage(Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId == schmessage.profileId && t.IsActive).First();
            if (_LinkedInAccount.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (_LinkedInAccount != null)
                {
                    if (_LinkedInAccount.IsActive)
                    {
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            if (schmessage.scheduleTime <= DateTime.UtcNow)
                            {
                                string linkedindata = ComposeLinkedInMessage(schmessage.picUrl, schmessage.userId, schmessage.shareMessage, _LinkedInAccount.LinkedinUserId, schmessage.picUrl, _LinkedInAccount, dbr);
                                if (!string.IsNullOrEmpty(linkedindata))
                                {
                                    apiHitsCount++;
                                }
                            }
                        }
                        _LinkedInAccount.LastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(_LinkedInAccount);
                    }
                    else
                    {
                        apiHitsCount = MaxapiHitsCount;
                    }
                }
            }
        }

        public static string ComposeLinkedInMessage(string ImageUrl, long userid, string comment, string ProfileId, string imagepath,Domain.Socioboard.Models.LinkedInAccount _objLinkedInAccount, Model.DatabaseRepository dbr)
        {
            string json = "";
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = _objLinkedInAccount;
            oAuthLinkedIn _oauth = new oAuthLinkedIn();
            _oauth.ConsumerKey = "81k55eukagnqfa";
            _oauth.ConsumerSecret = "d9rqHEf7ewdSbsF1";
            _oauth.Token = _LinkedInAccount.OAuthToken;
            string PostUrl = "https://api.linkedin.com/v1/people/~/shares?format=json";
            if (string.IsNullOrEmpty(ImageUrl))
            {
                json = _oauth.LinkedProfilePostWebRequest("POST", PostUrl, comment);
            }
            else
            {
                json = _oauth.LinkedProfilePostWebRequestWithImage("POST", PostUrl, comment, imagepath);
            }

            if (!string.IsNullOrEmpty(json))
            {
                apiHitsCount++;
                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = ImageUrl;
                scheduledMessage.profileId = ProfileId;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedIn;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = comment;
                scheduledMessage.userId = userid;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = json;
                dbr.Add<ScheduledMessage>(scheduledMessage);
                return "posted";
               
            }
            else
            {
                apiHitsCount = MaxapiHitsCount;
                json = "Message not posted";
                return json;
            }
        }
    }
}
