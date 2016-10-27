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


        public static void PostLinkedInCompanyPageMessage(Domain.Socioboard.Models.ScheduledMessage schmessage, Domain.Socioboard.Models.LinkedinCompanyPage _LinkedinCompanyPage)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
               
                if (_LinkedinCompanyPage.SchedulerUpdate.AddHours(1) <= DateTime.UtcNow)
                {
                    if (_LinkedinCompanyPage != null)
                    {
                        if (_LinkedinCompanyPage.IsActive)
                        {
                            if (apiHitsCount < MaxapiHitsCount)
                            {
                                if (schmessage.scheduleTime <= DateTime.UtcNow)
                                {
                                    string linkedindata = ComposeLinkedInCompanyPagePost(schmessage.url, schmessage.userId, schmessage.shareMessage, _LinkedinCompanyPage.LinkedinPageId, dbr, _LinkedinCompanyPage, schmessage);
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
            catch (Exception exs)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }

        public static string ComposeLinkedInCompanyPagePost(string ImageUrl, long userid, string comment, string LinkedinPageId, Model.DatabaseRepository dbr,Domain.Socioboard.Models.LinkedinCompanyPage objLinkedinCompanyPage, Domain.Socioboard.Models.ScheduledMessage schmessage)
        {
            string json = "";
            Domain.Socioboard.Models.LinkedinCompanyPage objlicompanypage = objLinkedinCompanyPage;
            oAuthLinkedIn Linkedin_oauth = new oAuthLinkedIn();
            //Linkedin_oauth.ConsumerKey = "81k55eukagnqfa";
            //Linkedin_oauth.ConsumerSecret = "d9rqHEf7ewdSbsF1";
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
