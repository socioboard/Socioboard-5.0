using Domain.Socioboard.Models;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.CompanyMethods;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.LinkedIn
{
    public class LinkedInCompanyPageScheduler
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 25;


        public static void PostLinkedInCompanyPageMessage(Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.LinkedinCompanyPage _LinkedinCompanyPage = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId == schmessage.profileId && t.IsActive).First();
            if (_LinkedinCompanyPage.lastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (_LinkedinCompanyPage != null)
                {
                    if (_LinkedinCompanyPage.IsActive)
                    {
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            if (schmessage.scheduleTime <= DateTime.UtcNow)
                            {
                                string linkedindata = ComposeLinkedInCompanyPagePost(schmessage.picUrl, schmessage.userId, schmessage.shareMessage, _LinkedinCompanyPage.LinkedinPageId, dbr, _LinkedinCompanyPage);
                                if (!string.IsNullOrEmpty(linkedindata))
                                {
                                    apiHitsCount++;
                                }
                            }
                        }
                        _LinkedinCompanyPage.lastUpdate = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(_LinkedinCompanyPage);
                    }
                    else
                    {
                        apiHitsCount = MaxapiHitsCount;
                    }
                }
            }
        }

        public static string ComposeLinkedInCompanyPagePost(string ImageUrl, long userid, string comment, string LinkedinPageId, Model.DatabaseRepository dbr,Domain.Socioboard.Models.LinkedinCompanyPage objLinkedinCompanyPage)
        {
            string json = "";
            Domain.Socioboard.Models.LinkedinCompanyPage objlicompanypage = objLinkedinCompanyPage;
            oAuthLinkedIn Linkedin_oauth = new oAuthLinkedIn();
            Linkedin_oauth.ConsumerKey = "754ysxdp72ulk5";
            Linkedin_oauth.ConsumerSecret = "vbU52SjK7xS6cT8H";
            Linkedin_oauth.Verifier = objlicompanypage.OAuthVerifier;
            Linkedin_oauth.TokenSecret = objlicompanypage.OAuthSecret;
            Linkedin_oauth.Token = objlicompanypage.OAuthToken;
            Linkedin_oauth.Id = objlicompanypage.LinkedinPageId;
            Linkedin_oauth.FirstName = objlicompanypage.LinkedinPageName;
            Company company = new Company();
            if (string.IsNullOrEmpty(ImageUrl))
            {
                json = company.SetPostOnPage(Linkedin_oauth, objlicompanypage.LinkedinPageId, comment);
            }
            else
            {
                json = company.SetPostOnPageWithImage(Linkedin_oauth, objlicompanypage.LinkedinPageId, ImageUrl, comment);
            }
            if (!string.IsNullOrEmpty(json))
            {
                apiHitsCount++;
                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = ImageUrl;
                scheduledMessage.profileId = objlicompanypage.LinkedinPageId;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage;
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
