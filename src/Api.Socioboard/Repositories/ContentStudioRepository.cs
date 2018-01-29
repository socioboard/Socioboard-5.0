using Api.Socioboard.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class ContentStudioRepository
    {
        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> AdvanceSerachData(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);
            //List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstyoutube = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();
            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.postedTime);
            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.networkType == networkType && t.totalShareCount != 0, sort, 0, 200);
            // var result = _RssRepository.FindAdvance<AdvanceSerachData>(t => t.networkType == networkType && t.totalShareCount != 0);//UserId
            var task = Task.Run(async () =>
            {
                return await result;
            });


            // IList<AdvanceSerachData> lstyoutube = task.Result.ToList();
            IList<AdvanceSerachData> lstyoutube = task.Result.ToList();//.Take(30).Skip(0).ToList();
            lstyoutube = lstyoutube.OrderByDescending(kt => kt.postedTime).ToList();
            lstyoutube = lstyoutube.OrderByDescending(gb => gb.totalShareCount).ToList();//Take(30).Skip(0).ToList();
            if (lstyoutube != null)
            {
                //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                return lstyoutube.ToList();
            }
            return null;
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSearchYoutubeContentStdData> YtAdvanceSerachData(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSearchYoutubeContentStdData", settings);
            //List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstyoutube = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();
            var builder = Builders<AdvanceSearchYoutubeContentStdData>.Sort;
            var sort = builder.Descending(t => t.postedTime);
            var result = _RssRepository.FindWithRange<AdvanceSearchYoutubeContentStdData>(t => t.networkType == networkType && t.ytview != 0, sort, 0, 200);
            // var result = _RssRepository.FindAdvance<AdvanceSerachData>(t => t.networkType == networkType && t.totalShareCount != 0);//UserId
            var task = Task.Run(async () =>
            {
                return await result;
            });
         
            IList<AdvanceSearchYoutubeContentStdData> lstyoutube = task.Result.ToList();//.Take(30).Skip(0).ToList();
            lstyoutube = lstyoutube.OrderByDescending(kt => kt.postedTime).ToList();
            lstyoutube = lstyoutube.OrderByDescending(gb => gb.ytview).ToList().Take(30).Skip(0).ToList();
            if (lstyoutube != null)
            {
                //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                return lstyoutube.ToList();
            }
            return null;
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> InstagramAdvanceSerachData(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);
            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.postedTime);
            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.networkType == networkType, sort, 0, 200);
            var task = Task.Run(async () =>
            {
                return await result;
            });

            IList<AdvanceSerachData> lstflicker = task.Result.ToList();
            lstflicker = lstflicker.OrderByDescending(kt => kt.postedTime).ToList();

            if (lstflicker != null)
            {
                //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                return lstflicker.ToList();
            }
            return null;
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> FlickerAdvanceSerachData(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);           
            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.postedTime);
            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.networkType == networkType , sort, 0, 200);           
            var task = Task.Run(async () =>
            {
                return await result;
            });
          
            IList<AdvanceSerachData> lstflicker = task.Result.ToList();
            lstflicker = lstflicker.OrderByDescending(kt => kt.postedTime).ToList();
        
            if (lstflicker != null)
            {
                //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                return lstflicker.ToList();
            }
            return null;
        }


        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> DailyMotionAdvanceRepository(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);
            List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstDailymotion = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();

            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.networkType == networkType);//UserId
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            lstDailymotion = task.Result.ToList();
            var lstyu = lstDailymotion.OrderByDescending(gp => gp.totalShareCount);
            return lstyu.ToList();
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> TwitterAdvanceRepository(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);
            List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstTwitter = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();

            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.networkType == networkType);//UserId
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            lstTwitter = task.Result.ToList();
            var lstyu = lstTwitter.OrderByDescending(gp => gp.totalShareCount);
            return lstyu.ToList();
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> GetSortBy(string sortBy, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);

            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.postedTime);

            //var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.totalShareCount != 0, sort, 0, 150);
            var result = _RssRepository.FindAdvance<AdvanceSerachData>(t => t.totalShareCount != 0);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<AdvanceSerachData> lsttwt = task.Result.ToList();

            lsttwt = lsttwt.OrderByDescending(kt => kt.postedTime).ToList();
            // lsttwt = lsttwt.OrderByDescending(gb => gb.totalShareCount).ToList().Take(30).Skip(0).ToList();
            //if (lsttwt != null)
            //{
            //    //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

            //    return lsttwt.ToList();
            //}



            if (sortBy == "trending")
            {
                //return lsttwt.ToList();
                //  lsttwt.OrderByDescending(t => t.totalShareCount);
                return lsttwt.OrderByDescending(t => t.totalShareCount).ToList();
            }
            if (sortBy == "mostshare")
            {
                return lsttwt.OrderByDescending(t => t.totalShareCount).ToList();
            }
            else if (sortBy == "twtshare")
            {
                lsttwt.OrderByDescending(t => t.twtShareCount);
                return lsttwt.OrderByDescending(t => t.twtShareCount).ToList();
            }
            else if (sortBy == "fbshare")
            {
                return lsttwt.OrderByDescending(t => t.fbengagementCount).ToList();
            }
            else if (sortBy == "gplus")
            {
                return lsttwt.OrderByDescending(t => t.gplusShareCount).ToList();
            }
            else if (sortBy == "Pininterest")
            {
                return lsttwt.OrderByDescending(t => t.pinShareCount).ToList();
            }
            else if (sortBy == "LinkedIn")
            {
                return lsttwt.OrderByDescending(t => t.linShareCount).ToList();
            }
            else if (sortBy == "redit")
            {
                return lsttwt.OrderByDescending(t => t.redditShareCount).ToList();
            }
            else
            {
                return null;
            }

            //return null;
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> GetAdvanceSearchdata(string keywords, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository mongorepo = new MongoRepository("AdvanceSerachData", settings);
            if (keywords == "none")
            {
                var builder = Builders<AdvanceSerachData>.Sort;
                var sort = builder.Descending(t => t.totalShareCount);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.title != null, sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstSearchData = task.Result;
                return lstSearchData.ToList();
            }
            else
            {
                var builder = Builders<AdvanceSerachData>.Sort;
                var sort = builder.Ascending(t => t.title.Contains(keywords));
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.title.Contains(keywords));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstSearchData = task.Result;
                List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstSearchDataSorted = lstSearchData.OrderByDescending(t => t.totalShareCount).Take(100).ToList();
                return lstSearchDataSorted.ToList();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> QuickTopicRepository(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);

            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.totalShareCount);
            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.networkType == networkType, sort, 0, 30);//UserId
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<AdvanceSerachData> lstQuickTopic = task.Result.ToList();
            if (lstQuickTopic != null)
            {
                return lstQuickTopic.ToList();
            }
            return null;
        }

        public static string saveContentDataIdReposi(List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> shareathon, long userId, string fbPageId, int timeInterval, Helper.Cache _redisCache, Helper.AppSettings settings, Model.DatabaseRepository dbr)
        {

            string[] lstProfileIds = null;
            if (fbPageId != null)
            {
                lstProfileIds = fbPageId.Split(',');
                fbPageId = lstProfileIds[0];
            }

            MongoRepository mongorepo = new MongoRepository("ContentFeedsShareathon", settings);
            MongoRepository mongoreposhareId = new MongoRepository("ContentStudioShareathonIdData", settings);



            int totalval = 0;
            foreach (var fbid in lstProfileIds)
            {

                Domain.Socioboard.Models.Facebookaccounts listfb = dbr.FindSingle<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == fbid);
                int countval = 0;
                int countitem = 0;
                foreach (var item in shareathon)
                {
                    
                    var retval = mongoreposhareId.Find<Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData>(t => t.FbPageId.Contains(fbid) && t.postId == item.postId);
                    var taskval = Task.Run(async () =>
                    {
                        return await retval;
                    });
                    int countvalue = taskval.Result.Count;
                    if (countvalue < 1)
                    {
                        Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData lstIdforPost = new Domain.Socioboard.Models.Mongo.ContentStudioShareathonIdData();
                        lstIdforPost.Id = ObjectId.GenerateNewId();
                        lstIdforPost.strId = ObjectId.GenerateNewId().ToString();
                        lstIdforPost.FbPageId = fbid;
                        lstIdforPost.Status = false;
                        lstIdforPost.UserId = listfb.UserId;
                        lstIdforPost.Timeintervalminutes = timeInterval;
                        lstIdforPost.postId = item.postId;
                        if (countitem==0)
                        {
                            lstIdforPost.lastsharestamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        }
                        else
                        {
                            var result = TimeSpan.FromMinutes(timeInterval);
                          //  lstIdforPost.lastsharestamp = lstIdforPost.lastsharestamp + datetotimestamp;
                            countitem++;
                        }
                       

                        try
                        {
                            mongoreposhareId.Add(lstIdforPost);
                            //countval++;
                        }
                        catch (Exception ex)
                        {
                            //return "not added";
                        }

                    }
                    int count = 0;
                    try
                    {
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(t => t.postId.Contains(item.postId) && t.FbPageId.Contains(fbid));
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        count = task.Result.Count;
                    }
                    catch
                    {
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(t => t.strId.Contains(item.strId) && t.FbPageId.Contains(fbid));
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        count = task.Result.Count;

                    }


                    if (count < 1)
                    {
                        Domain.Socioboard.Models.Mongo.ContentFeedsShareathon lstforShareathon = new Domain.Socioboard.Models.Mongo.ContentFeedsShareathon();

                        lstforShareathon.Id = ObjectId.GenerateNewId();
                        lstforShareathon.strId = ObjectId.GenerateNewId().ToString();
                        lstforShareathon.FbPageId = fbid;
                        lstforShareathon.postId = item.postId;
                        lstforShareathon.networkType = item.networkType;
                        lstforShareathon.title = item.title;
                        lstforShareathon.facebookAccount = listfb.FbUserName;
                        lstforShareathon.ImageUrl = item.ImageUrl;
                        lstforShareathon.postUrl = item.postUrl;
                        lstforShareathon.videourl = item.videourl;
                        lstforShareathon.UserId = userId;
                        lstforShareathon.Timeintervalminutes = timeInterval;
                        lstforShareathon.lastsharestamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        lstforShareathon.Status = false;
                        try
                        {
                            mongorepo.Add(lstforShareathon);
                            countval++;
                        }
                        catch (Exception ex)
                        {
                            //return "not added";
                        }
                    }
                    else
                    {
                        // return "some problem while adding";
                    }

                    totalval = countval;
                }
            }


            if (totalval > 0)
            {
                return "added successfully";
            }
            else
            {
                return "feed has already added";
            }
        }

        public static string Deleteshareathon(string ShareathodId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("ContentFeedsShareathon", _appSettings);
                var builders = Builders<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> filter = builders.Eq("strId", ShareathodId);
                _ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(filter);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> ShareathonQueueReposi(long userId, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("ContentFeedsShareathon", settings);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(t => t.UserId.Equals(userId)&& t.Status == false);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> lsitdatashare = task.Result.ToList();
            return lsitdatashare.ToList();

        }

        public static List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> updateShareathonByUserId(long userId, Helper.AppSettings _appSettings, Helper.Cache _redisCache)
        {
            List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> iMmemPageShareathon = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>>(Domain.Socioboard.Consatants.SocioboardConsts.CachePageShareathonByUserId + userId);
            if (iMmemPageShareathon != null)
            {
                return iMmemPageShareathon;
            }
            else
            {
                MongoRepository _ShareathonRepository = new MongoRepository("ContentFeedsShareathon", _appSettings);
                var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(t => t.UserId == userId && t.Status==false);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CachePageShareathonByUserId + userId, task.Result.ToList());
                return task.Result.ToList();
            }
        }


        public static string updateDb(long userId, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("ContentFeedsShareathon", settings);
            try
            {
                mongorepo.DeleteMany<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon>(t => t.UserId == userId && t.Status == true);
                return "success";
                //return lsitdatashare.ToList();
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }


    }
}
