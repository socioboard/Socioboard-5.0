using Api.Socioboard.Model;
using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class ContentStudioRepository
    {
        public static List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> YuTubeAdvanceSerachData(Domain.Socioboard.Enum.NetworkType networkType, Helper.Cache _redisCache, Helper.AppSettings settings)
        {

            MongoRepository _RssRepository = new MongoRepository("AdvanceSerachData", settings);
            //List<Domain.Socioboard.Models.Mongo.AdvanceSerachData> lstyoutube = new List<Domain.Socioboard.Models.Mongo.AdvanceSerachData>();
            var builder = Builders<AdvanceSerachData>.Sort;
            var sort = builder.Descending(t => t.totalShareCount);
            //mongorepo.FindWithRange<MongoTwitterFeed>(t => t.profileId.Equals(profileId), sort, 0, 100);
            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t => t.networkType == networkType, sort, 0, 30);//UserId
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<AdvanceSerachData> lstyoutube = task.Result.ToList();
            if (lstyoutube != null)
            {
                //_redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                return lstyoutube.ToList();
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

            var result = _RssRepository.FindWithRange<AdvanceSerachData>(t=>t.totalShareCount!=0, sort, 0, 150);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<AdvanceSerachData> lsttwt = task.Result.ToList();

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
                return lstSearchDataSorted;
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

    }
}
