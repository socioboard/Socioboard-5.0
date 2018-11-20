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
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public  void UpdateTwitterAccount()
        {
            while (true)
            {
                
                try
                {
                    int count = 1;
                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                    oAuthTwitter OAuth = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerSecret, AppSettings.twitterRedirectionUrl);
                    List<Domain.Socioboard.Models.TwitterAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isActive).ToList();
                  //lstTwtAccounts = lstTwtAccounts.Where(t => t.twitterUserId.Equals("758233674978426880")).ToList();
                    foreach (var item in lstTwtAccounts)
                    {
                        try
                        {
                            OAuth.AccessToken = item.oAuthToken;
                            OAuth.AccessTokenSecret = item.oAuthSecret;
                            OAuth.TwitterScreenName = item.twitterScreenName;
                            Thread thread_twitter = new Thread(() => TwtFeeds.updateTwitterFeeds(item, OAuth));
                            thread_twitter.Name = "twitter service thread :" + noOfthreadRunning;
                            thread_twitter.Start();
                            Console.WriteLine(item.twitterScreenName + "Updating Started");
                            //TwtFeeds.updateTwitterFeeds(item, OAuth);
                            Console.WriteLine(item.twitterScreenName + "Updated");
                            Console.WriteLine(count++);
                            Thread.Sleep(1000);
                        }
                        catch (Exception ex)
                        {
                            //Thread.Sleep(600000);
                            Thread.Sleep(TimeSpan.FromMinutes(1));
                        }
                    }
                    //Thread.Sleep(600000);
                    Thread.Sleep(TimeSpan.FromMinutes(60));
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
