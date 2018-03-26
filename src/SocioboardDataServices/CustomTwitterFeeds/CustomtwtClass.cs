using Socioboard.Twitter.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Twitter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.CustomTwitterFeeds
{
    public class CustomtwtClass
    {
        public void UpdateCustomeTwitterAccountFeeds()
        {
            while (true)
            {

                try
                {

                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                    oAuthTwitter OAuth = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerSecret, AppSettings.twitterRedirectionUrl);
                    List<Domain.Socioboard.Models.TwitterAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isActive).ToList();
                    foreach (var item in lstTwtAccounts)
                    {
                        try
                        {
                            OAuth.AccessToken = item.oAuthToken;
                            OAuth.AccessTokenSecret = item.oAuthSecret;
                            OAuth.TwitterScreenName = item.twitterScreenName;
                            Console.WriteLine(item.twitterScreenName + "Updating Started");
                            UpdateCustomTwtFeeds.updateCustomTwitterFeeds(item, OAuth);
                            Console.WriteLine(item.twitterScreenName + "Updated");
                        }
                        catch (Exception ex)
                        {
                            Thread.Sleep(TimeSpan.FromMinutes(1));
                        }
                    }
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
            }
        }
    }
}
