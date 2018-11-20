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
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public void UpdateCustomeTwitterAccountFeeds()
        {
            while (true)
            {

                try
                {
                    int count = 1;
                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                    oAuthTwitter OAuth = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerSecret, AppSettings.twitterRedirectionUrl);
                    List<Domain.Socioboard.Models.TwitterAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isActive).ToList();
                    //lstTwtAccounts = lstTwtAccounts.Where(t => t.twitterUserId.Equals("758233674978426880")).ToList();758233674978426880
                    //foreach (var item in lstTwtAccounts)
                    //{
                    //    try
                    //    { 
                    //        OAuth.AccessToken = item.oAuthToken;
                    //        OAuth.AccessTokenSecret = item.oAuthSecret;
                    //        OAuth.TwitterScreenName = item.twitterScreenName;
                    //        Console.WriteLine(item.twitterScreenName + "Updating Started");
                    //        Thread thread_twitter = new Thread(() => UpdateCustomTwtFeeds.updateCustomTwitterFeeds(item, OAuth));
                    //        thread_twitter.Name = "twitter service thread :" + noOfthreadRunning;
                    //        thread_twitter.Start();
                    //        Console.WriteLine(item.twitterScreenName + "Updated");
                    //        Console.WriteLine(count++);
                    //        Thread.Sleep(1000);
                    //    }
                    //    catch (Exception ex)
                    //    {
                    //        Thread.Sleep(TimeSpan.FromMinutes(1));
                    //    }
                    //}
                    //Thread.Sleep(TimeSpan.FromMinutes(60));
                    // Thread.Sleep(TimeSpan.FromMinutes(1));


                    Parallel.ForEach(lstTwtAccounts, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, item =>
                    {
                        try
                        {
                            OAuth.AccessToken = item.oAuthToken;
                            OAuth.AccessTokenSecret = item.oAuthSecret;
                            OAuth.TwitterScreenName = item.twitterScreenName;

                            Console.WriteLine(item.twitterName + "Updating Started");
                            UpdateCustomTwtFeeds.updateCustomTwitterFeeds(item, OAuth);
                            Console.WriteLine("ITEM UPDATED" + count++);
                            Console.WriteLine(item.twitterName + "Updated");
                        }
                        catch (Exception ex)
                        {
                            Thread.Sleep(1000);
                        }
                    });
                    Thread.Sleep(600000);

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
