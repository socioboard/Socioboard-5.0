using Newtonsoft.Json.Linq;
using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models.Mongo;
using Domain.Socioboard.Helpers;
using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;

using System.Text.RegularExpressions;
using System.Threading;

namespace SocioboardDataScheduler.Shareathon
{
    public class ShareathonDataSchedulars
    {   /// <summary>
        /// 
        /// </summary>
        /// 

        public static int groupapiHitsCount = 0;
        public static int groupMaxapiHitsCount = 20;
        public static int pageapiHitsCount = 0;
        public static int pageMaxapiHitsCount = 20;
        public int noOfthread_pageshreathonRunning = 0;
        public int noOfthread_groupshreathonRunning = 0;
        public void ShareShateathons()
        {

            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository _ShareathonRepository = new MongoRepository("Shareathon");
            var result = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => t.FacebookStatus == 1);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.PageShareathon> lstPageShareathon = task.Result.ToList();
            ThreadPool.SetMaxThreads(10, 5);
            noOfthread_pageshreathonRunning = 0;
            foreach (PageShareathon shareathon in lstPageShareathon.ToList())
            {
                try
                {
                    //ThreadPool.QueueUserWorkItem(new WaitCallback(pageshreathon), new object[] { shareathon, dbr, _ShareathonRepository });
                    //Thread.Sleep(20 * 1000);
                    //pageshreathon(new object[] { shareathon, dbr, _ShareathonRepository });
                    noOfthread_pageshreathonRunning++;
                    Thread thread_pageshreathon = new Thread(() => pageshreathon(new object[] { shareathon, dbr, _ShareathonRepository }));
                    thread_pageshreathon.Start();
                    while (noOfthread_pageshreathonRunning > 5)
                    {
                        Thread.Sleep(1 * 1000);
                    }
                    //  pageshreathon(new object[] { shareathon, dbr, _ShareathonRepository });
                }
                catch (Exception)
                {

                }
            }

        }
        public string ShareFeed(string fbAccesstoken, string FeedId, string pageId, string message, string fbUserId, string FbPageName)
        {
            string ret = "";

            try
            {
                MongoRepository mongorepo = new Helper.MongoRepository("SharethonPagePost");
                Domain.Socioboard.Models.Mongo.SharethonPagePost objshrpost = new Domain.Socioboard.Models.Mongo.SharethonPagePost();
                string link = "https://www.facebook.com/" + pageId + "/posts/" + FeedId;

                FacebookClient fb = new FacebookClient();
                fb.AccessToken = fbAccesstoken;
                var args = new Dictionary<string, object>();

                args["link"] = link;

                var ret1 = mongorepo.Find<Domain.Socioboard.Models.Mongo.SharethonPagePost>(t => t.Facebookaccountid == fbUserId && t.Facebookpageid == pageId && t.PostId == FeedId);
                var task = Task.Run(async () =>
                {
                    return await ret1;
                });
                int count = task.Result.Count;

                try
                {
                    //if (pageapiHitsCount < pageMaxapiHitsCount)
                    //{
                   
                    if (count < 1)
                    {
                        dynamic output = fb.Post("v2.1/" + fbUserId + "/feed", args);
                        string feed_id = output["id"].ToString();
                        if (!string.IsNullOrEmpty(feed_id))
                        {
                            pageapiHitsCount++;
                        }
                        objshrpost.Id = ObjectId.GenerateNewId();
                        objshrpost.Facebookaccountid = fbUserId;
                        objshrpost.Facebookpageid = pageId;
                        objshrpost.PostId = FeedId;
                        objshrpost.PostedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        objshrpost.Facebookpagename = FbPageName;
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.SharethonPagePost>(objshrpost);
                        ret = "success";
                    }
                    // }
                }
                catch (Exception ex)
                {
                    Console.Write(ex.StackTrace);
                    pageapiHitsCount = pageMaxapiHitsCount;
                    return "";
                }

                // }

            }
            catch (Exception ex)
            {

            }
            return ret;
        }
        public void ShareGroupShareathon()
        {

            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository _ShareathonRepository = new MongoRepository("GroupShareathon");
            var result = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => t.FacebookStatus == 1);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.GroupShareathon> lstGroupShareathon = task.Result.ToList();
            ThreadPool.SetMaxThreads(10, 5);
            noOfthread_groupshreathonRunning = 0;
            foreach (GroupShareathon shareathon in lstGroupShareathon)
            {
                try
                {
                    //ThreadPool.QueueUserWorkItem(new WaitCallback(groupshreathon), new object[] { shareathon, dbr, _ShareathonRepository });
                    //Thread.Sleep(20 * 1000);
                    //groupshreathon(new object[] { shareathon, dbr, _ShareathonRepository });
                    noOfthread_groupshreathonRunning++;
                    Thread thread_groupshreathon = new Thread(() => groupshreathon(new object[] { shareathon, dbr, _ShareathonRepository }));
                    thread_groupshreathon.Start();
                    while (noOfthread_groupshreathonRunning > 5)
                    {
                        Thread.Sleep(1 * 1000);
                    }

                }
                catch (Exception)
                {

                }

            }

        }
        public void ShareFeedonGroup(string fbAccesstoken, string FeedId, string pageId, string message, string fbgroupId, int time, string faceaccountId, double lastupdatetime, string Facebooknameid)
        {

            List<string> lstPost = new List<string>();
            int lstCout = 0;
            string[] feedid = FeedId.TrimEnd(',').Split(',');
            string[] grpid = Facebooknameid.TrimEnd(',').Split(',');
            Random r = new Random();
            int length = feedid.Length;
            Domain.Socioboard.Models.Mongo.SharethonGroupPost objshrgrp = new Domain.Socioboard.Models.Mongo.SharethonGroupPost();
            MongoRepository mongorepo = new Helper.MongoRepository("SharethonGroupPost");
            while (length >= lstCout)
            {
                int i = r.Next(0, length - 1);
                if (!lstPost.Contains(feedid[i]))
                {
                    lstPost.Add(feedid[i]);
                    lstCout++;
                    foreach (var item in grpid)
                    {
                        string[] grpdata = Regex.Split(item, "<:>");
                        var ret1 = mongorepo.Find<Domain.Socioboard.Models.Mongo.SharethonGroupPost>(t => t.Facebookgroupid == grpdata[1] && t.PostId == FeedId[i].ToString());
                        var task = Task.Run(async () =>
                        {
                            return await ret1;
                        });
                        int count = task.Result.Count;


                        string link = "https://www.facebook.com/" + pageId + "/posts/" + feedid[i];
                        FacebookClient fb = new FacebookClient();
                        fb.AccessToken = fbAccesstoken;
                        var args = new Dictionary<string, object>();
                        args["link"] = link;
                        try
                        {
                            //if (groupapiHitsCount < groupMaxapiHitsCount)
                            //{

                           
                            if (count < 1)
                            {
                                dynamic output = fb.Post("v2.7/" + grpdata[1] + "/feed", args);
                                try
                                {
                                    string feed_id = output["id"].ToString();
                                    if (!string.IsNullOrEmpty(feed_id))
                                    {
                                        groupapiHitsCount++;
                                    }

                                }
                                catch (Exception)
                                {
                                    groupapiHitsCount = groupMaxapiHitsCount;
                                }
                                objshrgrp.Id = ObjectId.GenerateNewId();
                                objshrgrp.Facebookaccountid = faceaccountId;
                                objshrgrp.Facebookgroupid = grpdata[1];
                                objshrgrp.Facebookgroupname = grpdata[0];
                                objshrgrp.PostId = feedid[i];
                                objshrgrp.PostedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.SharethonGroupPost>(objshrgrp);
                            }
                            // }
                        }
                        catch (Exception ex)
                        {
                            groupapiHitsCount = groupMaxapiHitsCount;
                        }
                        //}
                    }
                    Thread.Sleep(1000 * 50);
                }
                Thread.Sleep(1000 * 60 * time);
            }
        }
        public void pageshreathon(object o)
        {
            try
            {
                object[] arr = o as object[];
                PageShareathon shareathon = (PageShareathon)arr[0];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[1];
                MongoRepository _ShareathonRepository = (MongoRepository)arr[2];
                string[] ids = shareathon.Facebookpageid.Split(',');
                foreach (string id in ids)
                {
                    try
                    {
                        pageapiHitsCount = 0;
                        Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == shareathon.Facebookaccountid);
                        Domain.Socioboard.Models.Facebookaccounts facebookPage = null;
                        Domain.Socioboard.Models.Facebookaccounts lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == id);
                        if (lstFbAcc != null)
                        {
                            facebookPage = lstFbAcc;
                        }
                        if (facebookPage != null)
                        {
                            if (pageapiHitsCount < pageMaxapiHitsCount)
                            {
                                string feeds = string.Empty;
                                if (facebookPage.PageShareathonUpdate.AddHours(1) <= DateTime.UtcNow)
                                {
                                    feeds = Socioboard.Facebook.Data.Fbpages.getFacebookRecentPost(fbAcc.AccessToken, facebookPage.FbUserId);
                                    string feedId = string.Empty;
                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        pageapiHitsCount++;
                                        JObject fbpageNotes = JObject.Parse(feeds);
                                        foreach (JObject obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                        {
                                            try
                                            {
                                                feedId = obj["id"].ToString();
                                                feedId = feedId.Split('_')[1];
                                                DateTime dt = SBHelper.ConvertFromUnixTimestamp(shareathon.Lastsharetimestamp);
                                                dt = dt.AddMinutes(shareathon.Timeintervalminutes);
                                                if ((!shareathon.Lastpostid.Equals(feedId) && SBHelper.ConvertToUnixTimestamp(dt) <= SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)))
                                                {
                                                    //if (pageapiHitsCount < pageMaxapiHitsCount)
                                                    //{
                                                    string ret = ShareFeed(fbAcc.AccessToken, feedId, facebookPage.FbUserId, "", fbAcc.FbUserId, facebookPage.FbUserName);
                                                    if (!string.IsNullOrEmpty(ret))
                                                    {
                                                        Thread.Sleep(1000 * 60 * shareathon.Timeintervalminutes);
                                                    }
                                                    // }
                                                }
                                            }
                                            catch
                                            {
                                                pageapiHitsCount = pageMaxapiHitsCount;
                                            }
                                        }
                                        fbAcc.PageShareathonUpdate = DateTime.UtcNow;
                                        facebookPage.PageShareathonUpdate = DateTime.UtcNow;
                                        dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                                        dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(facebookPage);
                                    }
                                    else
                                    {

                                        FilterDefinition<BsonDocument> filter = new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                                        _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, filter);
                                    }
                                }
                                else
                                {

                                    pageapiHitsCount = 0;
                                }

                            }
                        }
                    }

                    catch
                    {
                        pageapiHitsCount = pageMaxapiHitsCount;
                    }
                }
                try
                {
                    if (!string.IsNullOrEmpty(shareathon.FacebookPageUrlId))
                    {
                        string[] urlsIds = shareathon.FacebookPageUrlId.Split(',');
                        foreach (string id_url in urlsIds)
                        {

                            try
                            {
                                pageapiHitsCount = 0;
                                Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == shareathon.Facebookaccountid);
                                string pagename = Socioboard.Facebook.Data.Fbpages.getFbPageData(fbAcc.AccessToken, id_url);
                                if (pageapiHitsCount < pageMaxapiHitsCount)
                                {
                                    string feeds = string.Empty;
                                    feeds = Socioboard.Facebook.Data.Fbpages.getFacebookRecentPost(fbAcc.AccessToken, id_url);
                                    string feedId = string.Empty;
                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        pageapiHitsCount++;
                                        JObject fbpageNotes = JObject.Parse(feeds);
                                        foreach (JObject obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                        {
                                            try
                                            {
                                                feedId = obj["id"].ToString();
                                                feedId = feedId.Split('_')[1];
                                                DateTime dt = SBHelper.ConvertFromUnixTimestamp(shareathon.Lastsharetimestamp);
                                                dt = dt.AddMinutes(shareathon.Timeintervalminutes);
                                                if ((!shareathon.Lastpostid.Equals(feedId) && SBHelper.ConvertToUnixTimestamp(dt) <= SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)))
                                                {
                                                    string ret = ShareFeed(fbAcc.AccessToken, feedId, id_url, "", fbAcc.FbUserId, pagename);
                                                    if (!string.IsNullOrEmpty(ret))
                                                    {
                                                        Thread.Sleep(1000 * 60 * shareathon.Timeintervalminutes);
                                                    }
                                                }
                                            }
                                            catch
                                            {
                                                pageapiHitsCount = pageMaxapiHitsCount;
                                            }
                                        }
                                        fbAcc.PageShareathonUpdate = DateTime.UtcNow;
                                        dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                                    }
                                    else
                                    {

                                        FilterDefinition<BsonDocument> filter = new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                                        _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, filter);
                                    }


                                }
                            }
                            catch
                            {
                                pageapiHitsCount = pageMaxapiHitsCount;
                            }
                        } 
                    }
                }
                catch (Exception)
                {
                }
            }
            catch (Exception e)
            {
                pageapiHitsCount = pageMaxapiHitsCount;
            }
            finally
            {
                noOfthread_pageshreathonRunning--;
            }
        }
        public void groupshreathon(object o)
        {
            try
            {
                object[] arr = o as object[];
                GroupShareathon shareathon = (GroupShareathon)arr[0];
                Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[1];
                MongoRepository _ShareathonRepository = (MongoRepository)arr[2];
                string[] ids = shareathon.Facebookpageid.Split(',');
                foreach (string id in ids)
                {
                    try
                    {
                        int groupapiHitsCountNew = 0;
                        Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == shareathon.Facebookaccountid);
                        Domain.Socioboard.Models.Facebookaccounts facebookPage = null;
                        Domain.Socioboard.Models.Facebookaccounts lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == id);

                        if (fbAcc != null)
                        {
                            if (groupapiHitsCountNew < groupMaxapiHitsCount)
                            {
                                string feeds = string.Empty;
                                if (fbAcc.GroupShareathonUpdate.AddHours(1) <= DateTime.UtcNow)
                                {
                                    feeds = Socioboard.Facebook.Data.Fbpages.getFacebookRecentPost(fbAcc.AccessToken, id);
                                    string feedId = string.Empty;
                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        groupapiHitsCountNew++;
                                        JObject fbpageNotes = JObject.Parse(feeds);
                                        foreach (JObject obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                        {
                                            try
                                            {
                                                string feedid = obj["id"].ToString();
                                                feedid = feedid.Split('_')[1];
                                                feedId = feedid + "," + feedId;
                                            }
                                            catch { }

                                        }
                                        try
                                        {
                                            DateTime dt = SBHelper.ConvertFromUnixTimestamp(shareathon.Lastsharetimestamp);
                                            dt = dt.AddMinutes(shareathon.Timeintervalminutes);
                                            if (shareathon.Lastpostid == null || (!shareathon.Lastpostid.Equals(feedId) && SBHelper.ConvertToUnixTimestamp(dt) <= SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)))
                                            {
                                                //if (groupapiHitsCountNew < groupMaxapiHitsCount)
                                                //{
                                                ShareFeedonGroup(fbAcc.AccessToken, feedId, id, "", shareathon.Facebookgroupid, shareathon.Timeintervalminutes, shareathon.Facebookaccountid, shareathon.Lastsharetimestamp, shareathon.Facebooknameid);
                                                //}
                                            }
                                            fbAcc.GroupShareathonUpdate = DateTime.UtcNow;
                                            dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                                        }
                                        catch (Exception ex)
                                        {

                                        }


                                    }
                                    else
                                    {
                                        FilterDefinition<BsonDocument> filter = new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                                        _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.GroupShareathon>(update, filter);
                                        groupapiHitsCount = groupMaxapiHitsCount;
                                    }
                                }
                                else
                                {
                                    groupapiHitsCount = 0;
                                }
                            }
                        }

                        //fbAcc.SchedulerUpdate = DateTime.UtcNow;
                        //dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                    }

                    catch
                    {
                        groupapiHitsCount = groupMaxapiHitsCount;
                    }
                }
            }
            catch (Exception e)
            {
                groupapiHitsCount = groupMaxapiHitsCount;
            }
            finally
            {
                noOfthread_groupshreathonRunning--;
            }
        }
    }
}
