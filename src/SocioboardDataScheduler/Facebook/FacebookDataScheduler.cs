using SocioboardDataScheduler.Model;
using SocioboardDataScheduler.Facebook;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace SocioboardDataScheduler.Facebook
{
    public class FacebookDataScheduler
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);

        public void ScheduleFacebookMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage) && t.scheduleTime <= DateTime.UtcNow).ToList();
                    //lstScheduledMessage = lstScheduledMessage.Where(t => t.profileId.Equals("1155481037833115")).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        objSemaphore.WaitOne();
                        noOfthreadRunning++;
                        Thread thread_pageshreathon = new Thread(() => schedulemessages(new object[] { dbr, items }));
                        thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                        thread_pageshreathon.Start();
                        Thread.Sleep(10 * 1000);
                        //while (noOfthreadRunning > 5)
                        //{
                        //    Thread.Sleep(1 * 1000);
                        //}
                        //new Thread(delegate ()
                        //{
                        //    schedulemessages();
                        //}).Start();

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

        private static void schedulemessages(object o)
        {
            try
            {
                Console.WriteLine(Thread.CurrentThread.Name + " Is Entered in Method");
                object[] arr = o as object[];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[0];
                IGrouping<string, Domain.Socioboard.Models.ScheduledMessage> items = (IGrouping<string, Domain.Socioboard.Models.ScheduledMessage>)arr[1];
                Domain.Socioboard.Models.Facebookaccounts _facebook = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == items.Key && t.IsActive).FirstOrDefault();
                Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _facebook.UserId);
                if (_facebook != null)
                {
                    foreach (var item in items)
                    {
                        try
                        {
                            Console.WriteLine(item.socialprofileName + "Scheduling Started");
                            FacebookScheduler.PostFacebookMessage(item, _facebook, _user);
                            Console.WriteLine(item.socialprofileName + "Scheduling");
                        }
                        catch (Exception)
                        {

                        }
                    }
                    _facebook.SchedulerUpdate = DateTime.UtcNow;
                    dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_facebook);
                }
            }
            catch (Exception ex)
            {
                //  Thread.Sleep(60000);
            }
            finally
            {
                noOfthreadRunning--;
                objSemaphore.Release();
                Console.WriteLine(Thread.CurrentThread.Name + " Is Released");
            }
        }

        public void dayscheduleFBMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.DaywiseSchedule> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.DaywiseSchedule>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && t.scheduleTime <= DateTime.Now).ToList();
                   // lstScheduledMessage = lstScheduledMessage.Where(t => t.profileId.Equals("1452799044811364")).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {

                        //if (items.First().scheduleTime.AddHours(24) <=DateTime.Now)
                        //{
                        objSemaphore.WaitOne();
                        noOfthreadRunning++;
                        daywiseSchedulemessages(new object[] { dbr, items });
                        //Thread thread_pageshreathon = new Thread(() => daywiseSchedulemessages(new object[] { dbr, items }));
                        //thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                        //thread_pageshreathon.Start();
                        //Thread.Sleep(10 * 1000);
                        // }


                    }
                    //Thread.Sleep(TimeSpan.FromMinutes(1));

                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
            }
        }

        private static void daywiseSchedulemessages(object o)
        {
            try
            {
                Console.WriteLine(Thread.CurrentThread.Name + " Is Entered in Method");
                object[] arr = o as object[];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[0];
                IGrouping<string, Domain.Socioboard.Models.DaywiseSchedule> items = (IGrouping<string, Domain.Socioboard.Models.DaywiseSchedule>)arr[1];
                Domain.Socioboard.Models.Facebookaccounts _facebook = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == items.Key && t.IsActive).FirstOrDefault();
                Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _facebook.UserId);
                if (_facebook != null)
                {
                    foreach (var item in items)
                    {
                        try
                        {
                            Console.WriteLine(item.socialprofileName + "Scheduling Started");
                            FacebookScheduler.PostDaywiseFacebookMessage(item, _facebook, _user);
                            Console.WriteLine(item.socialprofileName + "Scheduling");
                        }
                        catch (Exception)
                        {

                        }

                        item.scheduleTime = DateTime.UtcNow;
                        dbr.Update<Domain.Socioboard.Models.DaywiseSchedule>(item);
                    }
                    //_facebook.SchedulerUpdate = DateTime.UtcNow;

                    //dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_facebook);

                }
            }
            catch (Exception ex)
            {
                //  Thread.Sleep(60000);
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
