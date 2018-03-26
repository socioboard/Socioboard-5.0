using Socioboard.Twitter.Authentication;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Twitter
{
    public class TwtDataService
    {
        public  void UpdateTwitterAccount()
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
                            TwtFeeds.updateTwitterFeeds(item, OAuth);
                            Console.WriteLine(item.twitterScreenName + "Updated");
                        }
                        catch (Exception ex)
                        {
                            //Thread.Sleep(600000);
                            Thread.Sleep(TimeSpan.FromMinutes(1));
                        }
                    }
                    //Thread.Sleep(600000);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    // Thread.Sleep(600000);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
            }
        }
    }
}
