using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Domain.Socioboard.Models.Mongo;
using Domain.Socioboard.Helpers;
using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using Socioboard.Twitter.App.Core;
using Newtonsoft.Json.Linq;
using Socioboard.LinkedIn.Authentication;

namespace SocioboardDataScheduler.Shareathon
{
    public class FacebookShareFeeds
    {
        public static int noOfthreadRunning = 0;
        public static Semaphore objSemaphore = new Semaphore(5, 10);
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 100;

        public void ScheduleTwitterMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    MongoRepository _facebookSharefeeds = new MongoRepository("FacebookPageFeedShare");
                    var result = _facebookSharefeeds.Find<Domain.Socioboard.Models.Mongo.FacebookPageFeedShare>(t => t.socialmedia == "tw" || t.socialmedia == "lin");
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.FacebookPageFeedShare> lstfbpagefeeds = task.Result.ToList();

                    //lstScheduledMessage = lstScheduledMessage.Where(t => t.profileId.Contains("758233674978426880")).ToList();
                    lstfbpagefeeds.GroupBy(t => t.pageId).ToList();

                    foreach (var items in lstfbpagefeeds)
                    {
                        objSemaphore.WaitOne();
                        noOfthreadRunning++;
                        Thread thread_pageshreathon = new Thread(() => TwitterSchedulemessage(new object[] { items, dbr, _facebookSharefeeds }));
                        thread_pageshreathon.Name = "schedulemessages thread :" + noOfthreadRunning;
                        thread_pageshreathon.Start();
                        Thread.Sleep(60 * 1000);
                        //while (noOfthreadRunning > 5)
                        //{
                        //    Thread.Sleep(5 * 1000);
                        //}
                        //new Thread(delegate ()
                        //{
                        //    TwitterSchedulemessage(dbr, items);
                        //}).Start();
                    }
                    // Thread.Sleep(TimeSpan.FromMinutes(1));
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
                MongoRepository mongorepo = new Helper.MongoRepository("ContentFeedsShareathon");
                int pageapiHitsCount;
                object[] arr = o as object[];
                FacebookPageFeedShare shareathon = (FacebookPageFeedShare)arr[0];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[1];
                MongoRepository _ShareathonRepository = (MongoRepository)arr[2];
                string[] ids = shareathon.socialProfiles.Split(',');
                foreach (string id in ids)
                {

                    Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Single<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == id && t.isActive);
                    Domain.Socioboard.Models.LinkedInAccount _LinkedinAcc = dbr.Single<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId == id && t.IsActive);

                    Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _TwitterAccount.userId);

                    MongoRepository mongoshare = new Helper.MongoRepository("FacebookPageFeedShare");



                    if (_TwitterAccount != null || _LinkedinAcc != null)
                    {
                        var resultshare = _ShareathonRepository.Find<FacebookPageFeedShare>(t => t.pageId == shareathon.pageId && t.status != Domain.Socioboard.Enum.RealTimeShareFeedStatus.deleted);
                        var task = Task.Run(async () =>
                        {
                            return await resultshare;
                        });
                        int count = task.Result.Count;
                        var feedsData = task.Result.ToList();
                        if (count != 0)
                        {
                            foreach (var item in feedsData)
                            {
                                if (item.socialmedia.StartsWith("tw"))
                                {
                                    try
                                    {
                                        Console.WriteLine(item.socialProfiles + "Scheduling Started");
                                        PostTwitterMessage(item, _TwitterAccount, null, _user);
                                        Console.WriteLine(item.socialProfiles + "Scheduling");
                                    }
                                    catch (Exception)
                                    {

                                        Thread.Sleep(60000);
                                    }
                                }
                                if (item.socialmedia.StartsWith("lin"))
                                {
                                    try
                                    {
                                        Console.WriteLine(item.socialProfiles + "Scheduling Started");
                                        PostTwitterMessage(item, null, _LinkedinAcc, _user);
                                        Console.WriteLine(item.socialProfiles + "Scheduling");
                                    }
                                    catch (Exception)
                                    {

                                        Thread.Sleep(60000);
                                    }
                                }
                            }
                            //fbAcc.contenetShareathonUpdate = DateTime.UtcNow;
                            //facebookPage.contenetShareathonUpdate = DateTime.UtcNow;
                            //dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                            //dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(facebookPage);
                        }
                        //_TwitterAccount.SchedulerUpdate = DateTime.UtcNow;

                        //  dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);

                    }
                }
            }
            catch (Exception ex)
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

        public static void PostTwitterMessage(Domain.Socioboard.Models.Mongo.FacebookPageFeedShare fbPagefeedshare, Domain.Socioboard.Models.TwitterAccount _TwitterAccount, Domain.Socioboard.Models.LinkedInAccount _LinkedinAcc, Domain.Socioboard.Models.User _user)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
                MongoRepository _mongofbpostdata = new Helper.MongoRepository("MongoFacebookFeed");
                MongoRepository mongofacebooksharedata = new Helper.MongoRepository("FacebookPageFeedShare");
                DateTime dt = DateTime.Today;
                dt = dt.AddHours(-1);
                var result = _mongofbpostdata.Find<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId == fbPagefeedshare.pageId && t.shareStatus == false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstfbpagefeeds = task.Result.ToList();

                foreach (var item in lstfbpagefeeds)
                {
                    DateTime exatDate = Convert.ToDateTime(item.EntryDate);
                    try
                    {
                        if (exatDate > dt)
                        {
                            string twitterdata = null;
                            string linkedindata = null;
                            try
                            {
                                if (fbPagefeedshare.scheduleTime <= DateTime.UtcNow)
                                {

                                    if (_TwitterAccount != null)
                                    {
                                        twitterdata = ComposeTwitterMessage(item.FeedDescription, item.ProfileId, fbPagefeedshare.userId, item.Picture, false, dbr, _TwitterAccount, _user);

                                    }
                                    else
                                    {
                                        linkedindata = ComposeLinkedInMessage(item.Picture, fbPagefeedshare.userId, item.FeedDescription, item.ProfileId, "", _LinkedinAcc, dbr, _user);
                                    }
                                    if (!string.IsNullOrEmpty(twitterdata) && twitterdata != "feed has not posted" || !string.IsNullOrEmpty(linkedindata) && linkedindata != "feed has not posted")
                                    {
                                        apiHitsCount++;
                                        item.shareStatus = true;

                                        fbPagefeedshare.lastsharestamp = DateTime.UtcNow;
                                        FilterDefinition<BsonDocument> filter = new BsonDocument("FeedId", item.FeedId);
                                        var updatemongo = Builders<BsonDocument>.Update.Set("shareStatus", true);
                                        _mongofbpostdata.Update<MongoFacebookFeed>(updatemongo, filter);
                                    }
                                    else if (twitterdata == "Message not posted")
                                    {

                                    }
                                }
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                    Thread.Sleep(1000);
                }

                FilterDefinition<BsonDocument> filters = new BsonDocument("strId", fbPagefeedshare.strId); //new BsonDocument("FeedId", item.FeedId);               
                var updatefbshare = Builders<BsonDocument>.Update.Set("status", Domain.Socioboard.Enum.RealTimeShareFeedStatus.running).Set("scheduleTime", DateTime.UtcNow);
                mongofacebooksharedata.Update<FacebookPageFeedShare>(updatefbshare, filters);
            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }


        public static string ComposeTwitterMessage(string message, string profileid, long userid, string picurl, bool isScheduled, DatabaseRepository dbr, Domain.Socioboard.Models.TwitterAccount TwitterAccount, Domain.Socioboard.Models.User _user)
        {
            bool rt = false;
            string ret = "";
            string str = "Message posted";
            try
            {
                if (message.Length > 140)
                {
                    message = message.Substring(0, 135);
                }
            }
            catch (Exception ex)
            {

            }


            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = TwitterAccount;
            oAuthTwitter OAuthTwt = new oAuthTwitter(AppSettings.twitterConsumerKey, AppSettings.twitterConsumerScreatKey, AppSettings.twitterRedirectionUrl);
            OAuthTwt.AccessToken = objTwitterAccount.oAuthToken;
            OAuthTwt.AccessTokenSecret = objTwitterAccount.oAuthSecret;
            OAuthTwt.TwitterScreenName = objTwitterAccount.twitterScreenName;
            OAuthTwt.TwitterUserId = objTwitterAccount.twitterUserId;

            Tweet twt = new Tweet();
            if (!string.IsNullOrEmpty(picurl))
            {
                try
                {
                    PhotoUpload ph = new PhotoUpload();
                    string res = string.Empty;
                    rt = ph.NewTweet(picurl, message, OAuthTwt, ref res);
                }
                catch (Exception ex)
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            else
            {
                try
                {
                    JArray post = twt.Post_Statuses_Update(OAuthTwt, message);
                    ret = post[0]["id_str"].ToString();
                }
                catch (Exception ex)
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            if (!string.IsNullOrEmpty(ret) || rt == true)
            {
                string msg = "feed shared successfully";
            }
            else
            {
                string msg = "feed has not posted";
            }

            return str;
        }
        public static string ComposeLinkedInMessage(string ImageUrl, long userid, string comment, string ProfileId, string imagepath, Domain.Socioboard.Models.LinkedInAccount _objLinkedInAccount, Model.DatabaseRepository dbr, Domain.Socioboard.Models.User _user)
        {
            string json = "";
            var img = "";
            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = _objLinkedInAccount;
            oAuthLinkedIn _oauth = new oAuthLinkedIn();
            _oauth.ConsumerKey = AppSettings.LinkedinConsumerKey;
            _oauth.ConsumerSecret = AppSettings.LinkedinConsumerSecret;
            _oauth.Token = _LinkedInAccount.OAuthToken;
            string PostUrl = "https://api.linkedin.com/v1/people/~/shares?format=json";



            if (string.IsNullOrEmpty(ImageUrl))
            {
                json = _oauth.LinkedProfilePostWebRequest("POST", PostUrl, comment);
            }
            else
            {

                json = _oauth.LinkedProfilePostWebRequestWithImage("POST", PostUrl, comment, ImageUrl);
            }
            if (!string.IsNullOrEmpty(json))
            {
                string msg = "feed shared successfully";
                return msg;
            }
            else
            {
                string msg = "feed has not posted";
                return msg;
            }
        }
    }
}
