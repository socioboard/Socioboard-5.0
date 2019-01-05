using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Facebook.Data;
using SocioboardDataScheduler.Global;
using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;

namespace SocioboardDataScheduler.Shareathon
{
    public class ShareathonDataSchedulars
    {
        /// <summary>
        /// </summary>
        public static int GroupapiHitsCount;

        public static int GroupMaxapiHitsCount = 20;
        public static int PageapiHitsCount;
        public static int PageMaxapiHitsCount = 20;
        public int NoOfthreadGroupshreathonRunning;
        public int NoOfthreadPageshreathonRunning;

        public void ShareShateathons()
        {
            var dbr = new DatabaseRepository();
            var shareathonRepository = new MongoRepository("Shareathon");

            //var result = shareathonRepository.Find<PageShareathon>(t => t.FacebookStatus == 1 && t.Userid == 502164);
            var result = shareathonRepository.Find<PageShareathon>(t => t.FacebookStatus == 1);

            var task = Task.Run(async () => { return await result; });

            IList<PageShareathon> lstPageShareathon = task.Result.ToList();

            NoOfthreadPageshreathonRunning = 0;

            foreach (var shareathon in lstPageShareathon.ToList())
                try
                {
                    Task.Factory.StartNew(
                        () => { PageShreathon(new object[] { shareathon, dbr, shareathonRepository }); });
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
        }

        public string ShareFeed(string fbAccesstoken, string feedId, string pageId, string message, string fbUserId,
            string fbPageName)
        {
            try
            {
                var mongoRepository = new MongoRepository("SharethonPagePost");

                var link = "https://www.facebook.com/" + pageId + "/posts/" + feedId;

                var sharethonPagePostCollections = mongoRepository.Find<SharethonPagePost>(t =>
                    t.Facebookaccountid.Equals(fbUserId) && t.Facebookpageid.Equals(pageId) && t.PostId.Equals(feedId));

                var task = Task.Run(async () => await sharethonPagePostCollections);

                var count = task.Result.Count;

                try
                {
                    if (count < 1)
                    {
                        var pageAccessToken = FacebookApiHelper.GetPageAccessToken(pageId, fbAccesstoken, string.Empty);
                        var response = FacebookApiHelper.PublishPostOnPage(pageAccessToken, pageId, string.Empty,
                            string.Empty, link);

                        var isPublished = response.Contains("id");

                        if (isPublished)

                            PageapiHitsCount++;

                        var objSharethonPagePost = new SharethonPagePost
                        {
                            Id = ObjectId.GenerateNewId(),
                            Facebookaccountid = fbUserId,
                            Facebookpageid = pageId,
                            PostId = feedId,
                            PostedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow),
                            Facebookpagename = fbPageName
                        };

                        mongoRepository.Add(objSharethonPagePost);
                        return "success";
                    }
                }
                catch (Exception ex)
                {
                    Console.Write(ex.StackTrace);
                    PageapiHitsCount = PageMaxapiHitsCount;
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return string.Empty;
        }


        public void ShareGroupShareathon()
        {
            var dbr = new DatabaseRepository();
            var shareathonRepository = new MongoRepository("GroupShareathon");
            var result = shareathonRepository.Find<GroupShareathon>(t => t.FacebookStatus == 1);
           
            var task = Task.Run(async () => await result);

            IList<GroupShareathon> lstGroupShareathon = task.Result.ToList();

            NoOfthreadGroupshreathonRunning = 0;

            foreach (var shareathon in lstGroupShareathon)
                try
                {
                    NoOfthreadGroupshreathonRunning++;

                    Task.Factory.StartNew(() =>
                    {
                        Groupshreathon(new object[] { shareathon, dbr, shareathonRepository });
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
        }

        public void ShareFeedonGroup(string fbAccesstoken, string FeedId, string pageId, string message,
            string fbgroupId, int time, string faceaccountId, double lastupdatetime, string Facebooknameid)
        {
            var lstPost = new List<string>();
            var lstCout = 0;
            var feedid = FeedId.TrimEnd(',').Split(',');
            var grpid = Facebooknameid.TrimEnd(',').Split(',');
            var r = new Random();
            var length = feedid.Length;
            var objSharethonGroupPost = new SharethonGroupPost();
            var mongoRepository = new MongoRepository("SharethonGroupPost");

            while (length >= lstCout)
            {
                var i = r.Next(0, length - 1);
                if (!lstPost.Contains(feedid[i]))
                {
                    var postId = feedid[i];
                    lstPost.Add(feedid[i]);
                    lstCout++;
                    foreach (var item in grpid)
                    {
                        var groupData = Regex.Split(item, "<:>");

                        var postData = mongoRepository.Find<SharethonGroupPost>(t =>
                            t.Facebookgroupid.Equals(groupData[1]) && t.PostId.Equals(postId));

                        var task = Task.Run(async () => await postData);

                        var count = task.Result.Count;

                        var link = "https://www.facebook.com/" + pageId + "/posts/" + feedid[i];
                       
                        try
                        {
                            if (count < 1)
                            {
                                //  dynamic output = fb.Post("v2.7/" + grpdata[1] + "/feed", args);
                                try
                                {
                                    var response = FacebookApiHelper.PublishPostOnPage(fbAccesstoken, groupData[1], string.Empty,
                                        string.Empty, link);
                                    if (response.Contains("id")) GroupapiHitsCount++;
                                }
                                catch (Exception)
                                {
                                    GroupapiHitsCount = GroupMaxapiHitsCount;
                                }

                                objSharethonGroupPost.Id = ObjectId.GenerateNewId();
                                objSharethonGroupPost.Facebookaccountid = faceaccountId;
                                objSharethonGroupPost.Facebookgroupid = groupData[1];
                                objSharethonGroupPost.Facebookgroupname = groupData[0];
                                objSharethonGroupPost.PostId = feedid[i];
                                objSharethonGroupPost.PostedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                mongoRepository.Add(objSharethonGroupPost);
                            }
                        }
                        catch (Exception ex)
                        {
                            GroupapiHitsCount = GroupMaxapiHitsCount;
                            Console.WriteLine(ex.Message);
                        }
                    }
                    Thread.Sleep(1000 * 50);
                }

                Thread.Sleep(1000 * 60 * time);
            }
        }

        public void PageShreathon(object o)
        {
            try
            {
                var arr = o as object[];
                var shareathon = (PageShareathon)arr[0];
                var dbr = (DatabaseRepository)arr[1];

                var shareathonRepository = (MongoRepository)arr[2];

                var ids = shareathon.Facebookpageid.Split(',');
                GlobalVariable.pageShareathonIdsRunning.Add(shareathon.strId);

                foreach (var id in ids)
                    try
                    {
                        PageapiHitsCount = 0;
                        var fbAcc = dbr.Single<Facebookaccounts>(t => t.FbUserId == shareathon.Facebookaccountid);
                        Facebookaccounts facebookPage = null;

                        var lstFbAcc = dbr.Single<Facebookaccounts>(t => t.FbUserId == id);

                        if (lstFbAcc != null) facebookPage = lstFbAcc;
                        if (facebookPage != null)
                            if (PageapiHitsCount < PageMaxapiHitsCount)
                            {
                                var feeds = string.Empty;

                                if (facebookPage.PageShareathonUpdate.AddHours(1) <= DateTime.UtcNow)
                                {
                                    feeds = Fbpages.getFacebookRecentPost(fbAcc.AccessToken, facebookPage.FbUserId);
                                    var feedId = string.Empty;

                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        PageapiHitsCount++;
                                        var fbpageNotes = JObject.Parse(feeds);

                                        foreach (var obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                            try
                                            {
                                                feedId = obj["id"].ToString();
                                                feedId = feedId.Split('_')[1];
                                                var dt = SBHelper.ConvertFromUnixTimestamp(
                                                    shareathon.Lastsharetimestamp);
                                                dt = dt.AddMinutes(shareathon.Timeintervalminutes);

                                                if (!shareathon.Lastpostid.Equals(feedId) &&
                                                    SBHelper.ConvertToUnixTimestamp(dt) <=
                                                    SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow))
                                                {
                                                    var ret = ShareFeed(fbAcc.AccessToken, feedId,
                                                        facebookPage.FbUserId, "", fbAcc.FbUserId,
                                                        facebookPage.FbUserName);
                                                    if (!string.IsNullOrEmpty(ret))
                                                        Thread.Sleep(1000 * 60 * shareathon.Timeintervalminutes);
                                                }
                                            }
                                            catch
                                            {
                                                PageapiHitsCount = PageMaxapiHitsCount;
                                            }

                                        fbAcc.PageShareathonUpdate = DateTime.UtcNow;
                                        facebookPage.PageShareathonUpdate = DateTime.UtcNow;
                                        dbr.Update(fbAcc);
                                        dbr.Update(facebookPage);
                                    }
                                    else
                                    {
                                        FilterDefinition<BsonDocument> filter =
                                            new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 0);
                                        shareathonRepository.Update<PageShareathon>(update, filter);
                                    }
                                }
                                else
                                {
                                    PageapiHitsCount = 0;
                                }
                            }
                    }
                    catch
                    {
                        PageapiHitsCount = PageMaxapiHitsCount;
                    }

                try
                {
                    if (!string.IsNullOrEmpty(shareathon.FacebookPageUrlId))
                    {
                        var urlsIds = shareathon.FacebookPageUrlId.Split(',');
                        foreach (var idUrl in urlsIds)
                            try
                            {
                                PageapiHitsCount = 0;
                                var fbAcc = dbr.Single<Facebookaccounts>(
                                    t => t.FbUserId == shareathon.Facebookaccountid);
                                var pagename = Fbpages.GetFbPageName(fbAcc.AccessToken, idUrl);
                                if (PageapiHitsCount < PageMaxapiHitsCount)
                                {
                                    var feeds = string.Empty;
                                    feeds = Fbpages.getFacebookRecentPost(fbAcc.AccessToken, idUrl);
                                    var feedId = string.Empty;
                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        PageapiHitsCount++;
                                        var fbpageNotes = JObject.Parse(feeds);
                                        foreach (var obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                            try
                                            {
                                                feedId = obj["id"].ToString();
                                                feedId = feedId.Split('_')[1];
                                                var dt = SBHelper.ConvertFromUnixTimestamp(
                                                    shareathon.Lastsharetimestamp);
                                                dt = dt.AddMinutes(shareathon.Timeintervalminutes);
                                                if (!shareathon.Lastpostid.Equals(feedId) &&
                                                    SBHelper.ConvertToUnixTimestamp(dt) <=
                                                    SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow))
                                                {
                                                    var ret = ShareFeed(fbAcc.AccessToken, feedId, idUrl, "",
                                                        fbAcc.FbUserId, pagename);
                                                    if (!string.IsNullOrEmpty(ret))
                                                        Thread.Sleep(1000 * 60 * shareathon.Timeintervalminutes);
                                                }
                                            }
                                            catch
                                            {
                                                PageapiHitsCount = PageMaxapiHitsCount;
                                            }

                                        fbAcc.PageShareathonUpdate = DateTime.UtcNow;
                                        dbr.Update(fbAcc);
                                    }
                                    else
                                    {
                                        FilterDefinition<BsonDocument> filter =
                                            new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 1);
                                        shareathonRepository.Update<PageShareathon>(update, filter);
                                    }
                                }
                            }
                            catch
                            {
                                PageapiHitsCount = PageMaxapiHitsCount;
                            }
                    }
                }
                catch (Exception)
                {
                }

                GlobalVariable.pageShareathonIdsRunning.Remove(shareathon.strId);
            }
            catch (Exception e)
            {
                PageapiHitsCount = PageMaxapiHitsCount;
                Console.WriteLine(e.Message);
            }
            finally
            {
                NoOfthreadPageshreathonRunning--;
            }
        }

        public void Groupshreathon(object o)
        {
            try
            {
                var arr = o as object[];
                var shareathon = (GroupShareathon)arr[0];
                var dbr = (DatabaseRepository)arr[1];
                var shareathonRepository = (MongoRepository)arr[2];
                var ids = shareathon.Facebookpageid.Split(',');

                foreach (var id in ids)
                    try
                    {
                        var groupApiHitsCountNew = 0;
                        var fbAcc = dbr.Single<Facebookaccounts>(t => t.FbUserId == shareathon.Facebookaccountid);
                        //var lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == id);

                        if (fbAcc != null)
                            if (groupApiHitsCountNew < GroupMaxapiHitsCount)
                            {
                                var feeds = string.Empty;
                                if (fbAcc.GroupShareathonUpdate.AddHours(1) <= DateTime.UtcNow)
                                {
                                    feeds = Fbpages.getFacebookRecentPost(fbAcc.AccessToken, id);

                                    var feedId = string.Empty;
                                    if (!string.IsNullOrEmpty(feeds) && !feeds.Equals("[]"))
                                    {
                                        var fbpageNotes = JObject.Parse(feeds);
                                        foreach (var obj in JArray.Parse(fbpageNotes["data"].ToString()))
                                            try
                                            {
                                                var feedid = obj["id"].ToString();
                                                feedid = feedid.Split('_')[1];
                                                feedId = feedid + "," + feedId;
                                            }
                                            catch (Exception ex)
                                            {
                                                Console.WriteLine(ex.Message);
                                            }

                                        try
                                        {
                                            var dt = SBHelper.ConvertFromUnixTimestamp(shareathon.Lastsharetimestamp);
                                            dt = dt.AddMinutes(shareathon.Timeintervalminutes);
                                            if (shareathon.Lastpostid == null ||
                                                !shareathon.Lastpostid.Equals(feedId) &&
                                                SBHelper.ConvertToUnixTimestamp(dt) <=
                                                SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow))
                                                ShareFeedonGroup(fbAcc.AccessToken, feedId, id, "",
                                                    shareathon.Facebookgroupid, shareathon.Timeintervalminutes,
                                                    shareathon.Facebookaccountid, shareathon.Lastsharetimestamp,
                                                    shareathon.Facebooknameid);
                                            fbAcc.GroupShareathonUpdate = DateTime.UtcNow;
                                            dbr.Update(fbAcc);
                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine(ex.Message);
                                        }
                                    }
                                    else
                                    {
                                        FilterDefinition<BsonDocument> filter =
                                            new BsonDocument("strId", shareathon.strId);
                                        var update = Builders<BsonDocument>.Update.Set("FacebookStatus", 0);
                                        shareathonRepository.Update<GroupShareathon>(update, filter);
                                        GroupapiHitsCount = GroupMaxapiHitsCount;
                                    }
                                }
                                else
                                {
                                    GroupapiHitsCount = 0;
                                }
                            }
                    }
                    catch
                    {
                        GroupapiHitsCount = GroupMaxapiHitsCount;
                    }
            }
            catch (Exception e)
            {
                GroupapiHitsCount = GroupMaxapiHitsCount;
                Console.WriteLine(e.Message);
            }
            finally
            {
                NoOfthreadGroupshreathonRunning--;
            }
        }
    }
}