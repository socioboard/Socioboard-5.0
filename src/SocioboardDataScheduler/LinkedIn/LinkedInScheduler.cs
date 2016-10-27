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


        public static void PostLinkedInMessage(Domain.Socioboard.Models.ScheduledMessage schmessage, Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
               
                if (_LinkedInAccount.SchedulerUpdate.AddHours(1) <= DateTime.UtcNow)
                {
                    if (_LinkedInAccount != null)
                    {
                        if (_LinkedInAccount.IsActive)
                        {
                            if (apiHitsCount < MaxapiHitsCount)
                            {
                                if (schmessage.scheduleTime <= DateTime.UtcNow)
                                {
                                    string linkedindata = ComposeLinkedInMessage(schmessage.url, schmessage.userId, schmessage.shareMessage, _LinkedInAccount.LinkedinUserId, schmessage.picUrl, _LinkedInAccount, dbr, schmessage);
                                    if (!string.IsNullOrEmpty(linkedindata))
                                    {
                                        apiHitsCount++;
                                    }
                                }
                            }
                            else
                            {
                                apiHitsCount = 0;
                            }
                           
                        }
                        else
                        {
                            apiHitsCount = 0;
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

        public static string ComposeLinkedInMessage(string ImageUrl, long userid, string comment, string ProfileId, string imagepath,Domain.Socioboard.Models.LinkedInAccount _objLinkedInAccount, Model.DatabaseRepository dbr, Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            string json = "";
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = _objLinkedInAccount;
            oAuthLinkedIn _oauth = new oAuthLinkedIn();
            //_oauth.ConsumerKey = "81k55eukagnqfa";
            //_oauth.ConsumerSecret = "d9rqHEf7ewdSbsF1";
            _oauth.ConsumerKey = "754ysxdp72ulk5";
            _oauth.ConsumerSecret = "vbU52SjK7xS6cT8H";
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
                schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                schmessage.url = json;
                dbr.Add<ScheduledMessage>(schmessage);
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
