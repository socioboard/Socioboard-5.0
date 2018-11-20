using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using SocioboardDataServices.Helper;

namespace SocioboardDataServices.Facebook
{
    public class FbDataServices
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public void UpdateFacebookAccounts()
        {
            while (true)
            {
                try
                {
                    int count = 1;
                    var dbr = new DatabaseRepository();
                    var lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.IsAccessTokenActive && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookProfile).ToList();
                    //lstFbAcc = lstFbAcc.Where(t => t.FbUserId.Contains("127471161024815")).ToList();

                    var fbfeeds = new FbFeeds();
                    Parallel.ForEach(lstFbAcc, new ParallelOptions{ MaxDegreeOfParallelism = 100 }, item =>
                         {
                             try
                             {
                                 Console.WriteLine(item.FbUserName + "Updating Started");
                                 fbfeeds.updateFacebookFeeds(item);
                                 Console.WriteLine(item.FbUserName + "Updated");
                                 Console.WriteLine(count++);
                             }
                             catch (Exception ex)
                             {
                                 Console.WriteLine(ex.Message);
                                 Thread.Sleep(600000);
                             }
                         });
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }

        }

        public void UpdatefacebookPages()
        {
            while (true)
            {
                try
                {
                    int count = 1;
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.IsAccessTokenActive && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).ToList();
                    //  lstFbAcc = lstFbAcc.Where(t => t.FbUserId.Contains("1576509852421292")).ToList();

                    //foreach (var item in lstFbAcc)
                    //{
                    //    try
                    //    {
                    //        Console.WriteLine(item.FbUserName + "Updating Started");
                    //        Thread thread_pageshreathon = new Thread(() => FacebookPageFeed.updateFacebookPageFeeds( item ));
                    //        //FacebookPageFeed.updateFacebookPageFeeds(item);

                    //        thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                    //        thread_pageshreathon.Start();
                    //        Console.WriteLine(item.FbUserName + "Updated");
                    //        Thread.Sleep(1000);
                    //        Console.WriteLine(count++);
                    //    }
                    //    catch
                    //    {
                    //        Thread.Sleep(600000);
                    //    }
                    //}
                    //Thread.Sleep(600000);
                    //lstFbAcc = lstFbAcc.OrderByDescending(t => t.UserId).ToList();
                    Parallel.ForEach(lstFbAcc, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, item =>
                         {
                             try
                             {

                                 Console.WriteLine(item.FbUserName + "Updating Started");
                                 FacebookPageFeed.updateFacebookPageFeeds(item);
                                 Console.WriteLine("ITEM UPDATED" + count++);
                                 Console.WriteLine(item.FbUserName + "Updated");
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
                    Thread.Sleep(600000);
                }
            }
        }
    }
}
