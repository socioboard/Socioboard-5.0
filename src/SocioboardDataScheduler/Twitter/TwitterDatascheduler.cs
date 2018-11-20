using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Twitter
{
    public class TwitterDatascheduler
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public void ScheduleTwitterMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => (t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter) && t.scheduleTime <= DateTime.UtcNow).ToList();
                    //lstScheduledMessage = lstScheduledMessage.Where(t => t.profileId.Contains("758233674978426880")).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        objSemaphore.WaitOne();
                        noOfthreadRunning++;
                        Thread thread_pageshreathon = new Thread(() => TwitterSchedulemessage(new object[] { dbr, items }));
                        thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                        thread_pageshreathon.Start();
                        Thread.Sleep(10 * 1000);
                        //while (noOfthreadRunning > 5)
                        //{
                        //    Thread.Sleep(5 * 1000);
                        //}
                        //new Thread(delegate ()
                        //{
                        //    TwitterSchedulemessage(dbr, items);
                        //}).Start();
                    }
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(60000);
                }
            }
        }

        private static void TwitterSchedulemessage(object o)
        {
            try
            {
                Console.WriteLine(Thread.CurrentThread.Name + " Is Entered in Method");
                object[] arr = o as object[];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[0];
                IGrouping<string, Domain.Socioboard.Models.ScheduledMessage> items = (IGrouping<string, Domain.Socioboard.Models.ScheduledMessage>)arr[1];

                Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Single<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == items.Key && t.isActive);

                Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _TwitterAccount.userId);

                if (_TwitterAccount != null)
                {
                    foreach (var item in items)
                    {
                        try
                        {
                            Console.WriteLine(item.socialprofileName + "Scheduling Started");
                            TwitterScheduler.PostTwitterMessage(item, _TwitterAccount, _user);
                            Console.WriteLine(item.socialprofileName + "Scheduling");
                        }
                        catch (Exception)
                        {

                            Thread.Sleep(60000);
                        }
                    }
                    _TwitterAccount.SchedulerUpdate = DateTime.UtcNow;
                    dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);

                }
            }
            catch (Exception)
            {
                Thread.Sleep(60000);
            }
            finally
            {
                noOfthreadRunning--;
                objSemaphore.Release();
                Console.WriteLine(Thread.CurrentThread.Name + " Is Released");
            }
        }
    }
}
