using Socioboard.LinkedIn.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.LinkedIn
{
    public class LinkedInCompanyPageDataServices
    {
        public void UpdateLinkedInCompanyPage()
        {
            while (true)
            {
                Model.DatabaseRepository dbr = new Model.DatabaseRepository();
                AppSettings _appsetting = new AppSettings();
                List<Domain.Socioboard.Models.LinkedinCompanyPage> lstLinkedinCompanyPage = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.IsActive).ToList();
                foreach (var item in lstLinkedinCompanyPage)
                {
                    oAuthLinkedIn _oauth = new oAuthLinkedIn();
                    _oauth.ConsumerKey = "81k55eukagnqfa";
                    _oauth.ConsumerSecret = "d9rqHEf7ewdSbsF1";
                    _oauth.Token = item.OAuthToken;
                    Console.WriteLine(item.LinkedinPageName + "Updating Started");
                    LinkedPageFeed.UpdateLinkedInComanyPageFeed(item,_oauth);
                    Console.WriteLine(item.LinkedinPageName + "Updated");
                }
                Thread.Sleep(60000);
            }
        }
    }
}
