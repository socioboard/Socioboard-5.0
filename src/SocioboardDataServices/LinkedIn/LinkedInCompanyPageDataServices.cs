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
                try
                {
                    Model.DatabaseRepository dbr = new Model.DatabaseRepository();
                    AppSettings _appsetting = new AppSettings();
                    List<Domain.Socioboard.Models.LinkedinCompanyPage> lstLinkedinCompanyPage = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.IsActive).ToList();
                    foreach (var item in lstLinkedinCompanyPage)
                    {
                        oAuthLinkedIn _oauth = new oAuthLinkedIn();
                        _oauth.ConsumerKey = Helper.AppSettings.LinkedinApiKey;
                        _oauth.ConsumerSecret = Helper.AppSettings.LinkedinSecretKey;
                        _oauth.Token = item.OAuthToken;
                        Console.WriteLine(item.LinkedinPageName + "Updating Started");
                        LinkedPageFeed.UpdateLinkedInComanyPageFeed(item, _oauth);
                        Console.WriteLine(item.LinkedinPageName + "Updated");
                    }
                    Thread.Sleep(60000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }


        public void UpdateLinkedIn()
        {
            while(true)
            {
                try
                {
                    Model.DatabaseRepository dbr = new Model.DatabaseRepository();
                    AppSettings _appsetting = new AppSettings();
                    List<Domain.Socioboard.Models.LinkedInAccount> lstLinkedinCompanyPage = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.IsActive).ToList();
                    foreach (var item in lstLinkedinCompanyPage)
                    {
                        oAuthLinkedIn _oauth = new oAuthLinkedIn();
                        _oauth.ConsumerKey = Helper.AppSettings.LinkedinApiKey;
                        _oauth.ConsumerSecret = Helper.AppSettings.LinkedinSecretKey;
                        _oauth.Token = item.OAuthToken;
                        Console.WriteLine(item.LinkedinUserName + "Updating Started");
                        LinkedPageFeed.UpdateLinkedIn(item, _oauth);
                        Console.WriteLine(item.LinkedinUserName + "Updated");
                    }
                    Thread.Sleep(60000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }
    }
}
