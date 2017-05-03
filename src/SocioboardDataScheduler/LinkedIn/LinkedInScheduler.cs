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
                if (_LinkedInAccount != null && _LinkedInAccount.IsActive)
                {
                    string linkedindata = ComposeLinkedInMessage(schmessage.url, schmessage.userId, schmessage.shareMessage, _LinkedInAccount.LinkedinUserId, schmessage.picUrl, _LinkedInAccount, dbr, schmessage);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
        }

        public static string ComposeLinkedInMessage(string ImageUrl, long userid, string comment, string ProfileId, string imagepath, Domain.Socioboard.Models.LinkedInAccount _objLinkedInAccount, Model.DatabaseRepository dbr, Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            string json = "";
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = _objLinkedInAccount;
            oAuthLinkedIn _oauth = new oAuthLinkedIn();
            _oauth.ConsumerKey = Helper.AppSettings.LinkedinApiKey;
            _oauth.ConsumerSecret = Helper.AppSettings.LinkedinSecretKey;
            _oauth.Token = _LinkedInAccount.OAuthToken;
            string PostUrl = "https://api.linkedin.com/v1/people/~/shares?format=json";
            if (string.IsNullOrEmpty(ImageUrl))
            {
                json = _oauth.LinkedProfilePostWebRequest("POST", PostUrl, comment);
            }
            else
            {
                json = _oauth.LinkedProfilePostWebRequestWithImage("POST", PostUrl, comment, ImageUrl);
            }

            if (!string.IsNullOrEmpty(json))
            {
                apiHitsCount++;
                schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                schmessage.url = json;
                dbr.Update<ScheduledMessage>(schmessage);
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
