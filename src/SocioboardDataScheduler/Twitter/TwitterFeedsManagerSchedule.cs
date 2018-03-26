using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Twitter
{
    public class TwitterFeedsManagerSchedule
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        //public void ScheduleTwitterMessage()
        //{
        //    while (true)
        //    {
        //        try
        //        {
        //            MongoRepository _facebookSharefeeds = new MongoRepository("FacebookPageFeedShare");
        //            DatabaseRepository dbr = new DatabaseRepository();
        //            var result = _facebookSharefeeds.Find<Domain.Socioboard.Models.Mongo.SavedFeedsManagement>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage && t.status == Domain.Socioboard.Enum.ScheduledStatus.Default);
        //            var task = Task.Run(async () =>
        //            {
        //                return await result;
        //            });
        //            IList<Domain.Socioboard.Models.Mongo.SavedFeedsManagement> lstfbpagefeeds = task.Result.ToList();

        //            foreach (var items in lstfbpagefeeds)
        //            {
        //                objSemaphore.WaitOne();
        //                noOfthreadRunning++;
        //                Thread thread_pageshreathon = new Thread(() => TwitterSchedulemessage(new object[] { _facebookSharefeeds, items }));
        //                thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
        //                thread_pageshreathon.Start();
        //                Thread.Sleep(10 * 1000);
        //                //while (noOfthreadRunning > 5)
        //                //{
        //                //    Thread.Sleep(5 * 1000);
        //                //}
        //                //new Thread(delegate ()
        //                //{
        //                //    TwitterSchedulemessage(dbr, items);
        //                //}).Start();
        //            }
        //            Thread.Sleep(TimeSpan.FromMinutes(1));
        //        }
        //        catch (Exception ex)
        //        {
        //            Console.WriteLine("issue in web api calling" + ex.StackTrace);
        //            Thread.Sleep(60000);
        //        }
        //    }
        //}

        //private static void TwitterSchedulemessage(object o)
        //{
        //    try
        //    {

        //        DatabaseRepository dbr = new DatabaseRepository();
        //        MongoRepository mongorepo = new Helper.MongoRepository("ContentFeedsShareathon");
        //        int pageapiHitsCount;
        //        object[] arr = o as object[];
        //        SavedFeedsManagement shareathon = (SavedFeedsManagement)arr[0];
        //        MongoRepository _ShareathonRepository = (MongoRepository)arr[1];

        //       // Console.WriteLine(Thread.CurrentThread.Name + " Is Entered in Method");
        //      //  object[] arr = o as object[];
        //     //   Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[0];
        //        IGrouping<string, Domain.Socioboard.Models.Mongo.SavedFeedsManagement> items = (IGrouping<string, Domain.Socioboard.Models.Mongo.SavedFeedsManagement>)arr[1];

        //        Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Single<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == items.Key && t.isActive);

        //        Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _TwitterAccount.userId);

        //        if (_TwitterAccount != null)
        //        {
        //            foreach (var item in items)
        //            {
        //                try
        //                {
        //                    Console.WriteLine(item.SocialProfileName + "Scheduling Started");
        //                    PostTwitterMessage(item, _TwitterAccount, _user);
        //                    Console.WriteLine(item.SocialProfileName + "Scheduling");
        //                }
        //                catch (Exception)
        //                {

        //                    Thread.Sleep(60000);
        //                }
        //            }
        //            _TwitterAccount.SchedulerUpdate = DateTime.UtcNow;
        //            dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);

        //        }
        //    }
        //    catch (Exception)
        //    {
        //        Thread.Sleep(60000);
        //    }
        //    finally
        //    {
        //        noOfthreadRunning--;
        //        objSemaphore.Release();
        //        Console.WriteLine(Thread.CurrentThread.Name + " Is Released");
        //    }
        //}
        //public static void PostTwitterMessage(Domain.Socioboard.Models.Mongo.SavedFeedsManagement schmessage, Domain.Socioboard.Models.TwitterAccount _TwitterAccount, Domain.Socioboard.Models.User _user)
        //{
        //    try
        //    {
        //        DatabaseRepository dbr = new DatabaseRepository();
        //        //if (_TwitterAccount.SchedulerUpdate.AddMinutes(15) <= DateTime.UtcNow)
        //        //{
        //        if (_TwitterAccount != null)
        //        {
        //            if (_TwitterAccount.isActive)
        //            {
        //                //if (apiHitsCount < MaxapiHitsCount)
        //                //{
        //                if (schmessage.scheduleTime <= DateTime.UtcNow)
        //                {
        //                    string twitterdata = ComposeTwitterMessage(schmessage.shareMessage, schmessage.postId, schmessage.userId, schmessage.url, false, dbr, _TwitterAccount, schmessage, _user);
        //                    if (!string.IsNullOrEmpty(twitterdata) && twitterdata != "Message not posted")
        //                    {
        //                        apiHitsCount++;
        //                    }
        //                    else if (twitterdata == "Message not posted")
        //                    {
        //                        _TwitterAccount.isActive = false;
        //                        dbr.Update<TwitterAccount>(_TwitterAccount);
        //                    }
        //                }
        //                //}
        //                //_TwitterAccount.lastUpdate = DateTime.UtcNow;
        //                //dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);
        //            }
        //            else
        //            {
        //                // apiHitsCount = MaxapiHitsCount;
        //            }
        //        }
        //        //}
        //        //else
        //        //{
        //        //    apiHitsCount = 0;
        //        //}
        //    }
        //    catch (Exception ex)
        //    {
        //        apiHitsCount = MaxapiHitsCount;
        //    }
        //}


        //public static string ComposeTwitterMessage(string message, string profileid, long userid, string picurl, bool isScheduled, DatabaseRepository dbr, Domain.Socioboard.Models.TwitterAccount TwitterAccount, Domain.Socioboard.Models.ScheduledMessage schmessage, Domain.Socioboard.Models.User _user)
        //{
        //    bool rt = false;
        //    string ret = "";
        //    string str = "Message posted";
        //    if (message.Length > 140)
        //    {
        //        message = message.Substring(0, 135);
        //    }
        //    Domain.Socioboard.Models.TwitterAccount objTwitterAccount = TwitterAccount;
        //    oAuthTwitter OAuthTwt = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerScreatKey, AppSettings.twitterRedirectionUrl);
        //    OAuthTwt.AccessToken = objTwitterAccount.oAuthToken;
        //    OAuthTwt.AccessTokenSecret = objTwitterAccount.oAuthSecret;
        //    OAuthTwt.TwitterScreenName = objTwitterAccount.twitterScreenName;
        //    OAuthTwt.TwitterUserId = objTwitterAccount.twitterUserId;

        //    Tweet twt = new Tweet();
        //    if (!string.IsNullOrEmpty(picurl))
        //    {
        //        try
        //        {
        //            PhotoUpload ph = new PhotoUpload();
        //            string res = string.Empty;
        //            rt = ph.NewTweet(picurl, message, OAuthTwt, ref res);
        //        }
        //        catch (Exception ex)
        //        {
        //            apiHitsCount = MaxapiHitsCount;
        //        }
        //    }
        //    else
        //    {
        //        try
        //        {
        //            JArray post = twt.Post_Statuses_Update(OAuthTwt, message);
        //            ret = post[0]["id_str"].ToString();
        //        }
        //        catch (Exception ex)
        //        {
        //            apiHitsCount = MaxapiHitsCount;
        //        }
        //    }

        //    //if (!string.IsNullOrEmpty(ret) || rt == true)
        //    //{

        //    //    schmessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
        //    //    //schmessage.url = ret;
        //    //    dbr.Update<ScheduledMessage>(schmessage);
        //    //    Domain.Socioboard.Models.Notifications notify = new Notifications();
        //    //    Notifications lstnotifications = dbr.Single<Notifications>(t => t.MsgId == schmessage.id);
        //    //    if (lstnotifications == null)
        //    //    {
        //    //        notify.MsgId = schmessage.id;
        //    //        notify.MsgStatus = "Scheduled";
        //    //        notify.notificationtime = schmessage.localscheduletime;
        //    //        notify.NotificationType = "Schedule Successfully";
        //    //        notify.ReadOrUnread = "Unread";
        //    //        notify.UserId = userid;
        //    //        dbr.Add<Notifications>(notify);
        //    //        if (_user.scheduleSuccessUpdates)
        //    //        {
        //    //            string sucResponse = SendMailbySendGrid(AppSettings.from_mail, "", _user.EmailId, "", "", "", "", _user.FirstName, schmessage.localscheduletime, true, AppSettings.sendGridUserName, AppSettings.sendGridPassword);
        //    //        }
        //    //    }
        //    //    else
        //    //    {
        //    //        //if (_user.scheduleSuccessUpdates)
        //    //        //{
        //    //        //    string sucResponse = SendMailbySendGrid(AppSettings.from_mail, "", _user.EmailId, "", "", "", "", _user.FirstName, schmessage.localscheduletime, true, AppSettings.sendGridUserName, AppSettings.sendGridPassword);
        //    //        //}
        //    //    }


        //    //}
        //    //else
        //    //{
        //    //    str = "Message not posted";
        //    //    Domain.Socioboard.Models.Notifications notify = new Notifications();
        //    //    Notifications lstnotifications = dbr.Single<Notifications>(t => t.MsgId == schmessage.id);
        //    //    if (lstnotifications == null)
        //    //    {
        //    //        notify.MsgId = schmessage.id;
        //    //        notify.MsgStatus = "Failed";
        //    //        notify.notificationtime = schmessage.localscheduletime;
        //    //        notify.NotificationType = "Schedule Failed";
        //    //        notify.ReadOrUnread = "Unread";
        //    //        notify.UserId = userid;
        //    //        dbr.Add<Notifications>(notify);
        //    //        if (_user.scheduleFailureUpdates)
        //    //        {
        //    //            string falResponse = SendMailbySendGrid(AppSettings.from_mail, "", _user.EmailId, "", "", "", "", _user.FirstName, schmessage.localscheduletime, false, AppSettings.sendGridUserName, AppSettings.sendGridPassword);
        //    //        }
        //    //    }
        //    //    else
        //    //    {
        //    //        //if (_user.scheduleFailureUpdates)
        //    //        //{
        //    //        //    string falResponse = SendMailbySendGrid(AppSettings.from_mail, "", _user.EmailId, "", "", "", "", _user.FirstName, schmessage.localscheduletime, false, AppSettings.sendGridUserName, AppSettings.sendGridPassword);
        //    //        //}
        //    //    }

        //    //}

        //    return str;
        //}

    }
}
