using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using SocioboardDataScheduler.Facebook;
using SocioboardDataScheduler.Helper;
using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.ContentStudio
{
    public class ContentTrendDataScheduler
    {
        public int noOfthread_pageshreathon = 0;
        public static int pageapiHitsCount = 0;
        public static int pageMaxapiHitsCount = 20;
        public void SchdeuledContentFeeds()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    MongoRepository _lstcontent = new MongoRepository("ContentFeedsShareathon");
                    MongoRepository _lstcontentid = new MongoRepository("ContentStudioShareathonIdData");

                    var result = _lstcontentid.Find<Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData>(t => t.Status == false);                   
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData> lstPageShareathon = task.Result.ToList();
                    lstPageShareathon = lstPageShareathon.Where(t => t.FbPageId.Equals("1452799044811364")).ToList();
                    lstPageShareathon.GroupBy(t => t.FbPageId).ToList();
                    noOfthread_pageshreathon = 0;
                    foreach (ContentStudioShareathonIdData shareathon in lstPageShareathon)
                    {
                  
                       


                        noOfthread_pageshreathon++;
                        Thread thread_pageshreathon = new Thread(() => ShceduleConetentStudioFeeds(new object[] { shareathon, dbr, _lstcontent }));
                      
                        thread_pageshreathon.Start();
                        Thread.Sleep(10 * 1000);

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


        public void ShceduleConetentStudioFeeds(object o)
        {
            MongoRepository mongorepo = new Helper.MongoRepository("ContentFeedsShareathon");
            int pageapiHitsCount;
            object[] arr = o as object[];
            ContentStudioShareathonIdData shareathon = (ContentStudioShareathonIdData)arr[0];
            Model.DatabaseRepository dbr = (Model.DatabaseRepository)arr[1];
            MongoRepository _ShareathonRepository = (MongoRepository)arr[2];
            string[] ids = shareathon.FbPageId.Split(',');
            foreach (string id in ids)
            {
                try
                {
                    pageapiHitsCount = 0;
                    //  List<ContentFeedsShareathon> lstcontent = new List<ContentFeedsShareathon>();
                    Domain.Socioboard.Models.Facebookaccounts lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == id);
                    Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == lstFbAcc.UserId);
                    Domain.Socioboard.Models.Facebookaccounts facebookPage = null;

                    MongoRepository mongoshare = new Helper.MongoRepository("ContentFeedsShareathon");



                    if (lstFbAcc != null)
                    {
                        facebookPage = lstFbAcc;
                    }
                    if (facebookPage != null)
                    {
                        if (pageapiHitsCount < pageMaxapiHitsCount)
                        {
                            //  var lstcontent = mongorepo.Find<ContentFeedsShareathon>(t => t.FbPageId == id && t.UserId == fbAcc.UserId && t.status == 0);
                            var resultshare = mongorepo.Find<ContentFeedsShareathon>(t => t.FbPageId == shareathon.FbPageId && t.Status == false);
                            var task = Task.Run(async () =>
                            {
                                return await resultshare;
                            });
                            int count = task.Result.Count;
                            var feedsData = task.Result.ToList();

                            //if (facebookPage.contenetShareathonUpdate.AddHours(1) <= DateTime.UtcNow)
                            //{

                            if (count != 0)
                            {
                                pageapiHitsCount++;
                                //!shareathon.FbPageId.Equals(obj.FbPageId) && !shareathon.postId.Equals(obj.postId)
                                foreach (var obj in feedsData)
                                {
                                    try
                                    {
                                        DateTime dt = SBHelper.ConvertFromUnixTimestamp(obj.lastsharestamp);
                                        dt = dt.AddMinutes(obj.Timeintervalminutes);
                                        if ((obj.Status == false && SBHelper.ConvertToUnixTimestamp(dt) <= SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow)))
                                        {

                                            string ret = Helper.FBPostContentFeeds.FacebookComposeMessageRss(obj.title, facebookPage.AccessToken, facebookPage.FbUserId, "", obj.postUrl, obj.postId);
                                            if (ret == "Messages Posted Successfully")
                                            {
                                                obj.Status = true;
                                                shareathon.Status = true;


                                                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", obj.strId);
                                                var update = Builders<BsonDocument>.Update.Set("Status", true);
                                                mongorepo.Update<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(update, filter);

                                                FilterDefinition<BsonDocument> filterId = new BsonDocument("strId", shareathon.strId);
                                                var updateId = Builders<BsonDocument>.Update.Set("Status", true);
                                                mongorepo.Update<Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData>(updateId, filterId);

                                            }

                                            

                                        }
                                    }
                                    catch
                                    {
                                        pageapiHitsCount = pageMaxapiHitsCount;
                                    }
                                }
                                fbAcc.contenetShareathonUpdate = DateTime.UtcNow;
                                facebookPage.contenetShareathonUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                                dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(facebookPage);
                            }
                            else
                            {

                                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", shareathon.strId);
                                var update = Builders<BsonDocument>.Update.Set("Status", false);
                                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(update, filter);
                            }
                           
                            pageapiHitsCount = 0;
                        

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
}


