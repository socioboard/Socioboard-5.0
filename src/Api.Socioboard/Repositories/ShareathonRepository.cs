using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class ShareathonRepository
    {
        public static string AddPageShareathon(long userId, string FacebookUrl, string FacebookPageId, string Facebookaccountid, int Timeintervalminutes, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            Domain.Socioboard.Models.Facebookaccounts objfacebook = Repositories.FacebookRepository.getFacebookAccount(Facebookaccountid, _redisCache, dbr);
            string pageid = Helper.FacebookHelper.GetFbPageDetails(FacebookUrl, objfacebook.AccessToken);
            string[] profileids = null;
            profileids = FacebookPageId.Split(',');
            string facebookpagename = "";
            Domain.Socioboard.Models.Mongo.PageShareathon _Shareathon = new Domain.Socioboard.Models.Mongo.PageShareathon();
            _Shareathon.Id = ObjectId.GenerateNewId();
            _Shareathon.strId = ObjectId.GenerateNewId().ToString();
            _Shareathon.Facebookaccountid = objfacebook.FbUserId;
            _Shareathon.Facebookusername = objfacebook.FbUserName;
            _Shareathon.Facebookpageid = FacebookPageId;
            _Shareathon.FacebookPageUrl = FacebookUrl;
            _Shareathon.FacebookPageUrlId = pageid.TrimEnd(','); 
            foreach (var item in profileids)
            {
                Domain.Socioboard.Models.Facebookaccounts objfacebookpage = Repositories.FacebookRepository.getFacebookAccount(item, _redisCache, dbr);
                if (objfacebookpage!=null)
                {
                    facebookpagename = objfacebookpage.FbUserName + ',' + facebookpagename; 
                }
            }
            _Shareathon.Facebookpagename = facebookpagename.TrimEnd(',');
            _Shareathon.FacebookStatus = 1;
            _Shareathon.Timeintervalminutes = Timeintervalminutes;
            _Shareathon.Userid = userId;
            _Shareathon.Lastsharetimestamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
            MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", _appSettings);
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => t.Facebookpageid == FacebookPageId && t.Facebookaccountid == Facebookaccountid && t.FacebookPageUrl == FacebookUrl && t.Userid == userId && t.FacebookStatus == 1);
            var task = Task.Run(async () =>
                  {
                      return await ret;
                  });
            int count = task.Result.Count;
            if (count > 0)
            {
                return "already added";
            }
            else
            {
                _ShareathonRepository.Add(_Shareathon);
                return "added successfully";
            }
        }

        public static string DeletePageShareathon(string PageShareathodId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", _appSettings);
                var builders = Builders<Domain.Socioboard.Models.Mongo.PageShareathon>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.PageShareathon> filter = builders.Eq("strId", PageShareathodId);
                _ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.PageShareathon>(filter);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static string EditPageShareathon(string PageShareathodId, long userId,string FacebookUrl, string FacebookPageId, string Facebookaccountid, int Timeintervalminutes, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            try
            {
                string[] profileids = null;
                string facebookpagename = "";
                profileids = FacebookPageId.Split(',');
                foreach (var item in profileids)
                {
                    Domain.Socioboard.Models.Facebookaccounts objfacebookpage = Repositories.FacebookRepository.getFacebookAccount(item, _redisCache, dbr);
                    if (objfacebookpage!=null)
                    {
                        facebookpagename = objfacebookpage.FbUserName + ',' + facebookpagename; 
                    }
                }

                Domain.Socioboard.Models.Facebookaccounts objfacebook = Repositories.FacebookRepository.getFacebookAccount(Facebookaccountid, _redisCache, dbr);
                string pageid = Helper.FacebookHelper.GetFbPageDetails(FacebookUrl, objfacebook.AccessToken);
                MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", _appSettings);
                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", PageShareathodId);
                var update = Builders<BsonDocument>.Update.Set("Facebookaccountid", objfacebook.FbUserId).Set("FacebookPageId", FacebookPageId)
                   .Set("FacebookPageUrlId", pageid.TrimEnd(',')).Set("FacebookPageUrl", FacebookUrl).Set("Timeintervalminutes", Timeintervalminutes).Set("Facebookusername", objfacebook.FbUserName).Set("Facebookpagename", facebookpagename.TrimEnd(','));
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.PageShareathon>(update, filter);
                return "Success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.PageShareathon> PageShareathonByUserId(long userId, Helper.AppSettings _appSettings, Helper.Cache _redisCache)
        {
            List<Domain.Socioboard.Models.Mongo.PageShareathon> iMmemPageShareathon = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.PageShareathon>>(Domain.Socioboard.Consatants.SocioboardConsts.CachePageShareathonByUserId + userId);
            if (iMmemPageShareathon != null)
            {
                return iMmemPageShareathon;
            }
            else
            {
                MongoRepository _ShareathonRepository = new MongoRepository("Shareathon", _appSettings);
                var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.PageShareathon>(t => t.Userid == userId && t.FacebookStatus == 1);
                var task = Task.Run(async () =>
                      {
                          return await ret;
                      });
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CachePageShareathonByUserId + userId, task.Result.ToList());
                return task.Result.ToList();
            }
        }

        public static string AddGroupShareathon(long userId, string FacebookUrl, string FacebookGroupId, string Facebookaccountid, int Timeintervalminutes, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            string[] groupids = null;
            string groupId = "";
            string groupName = "";
            Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = Repositories.FacebookRepository.getFacebookAccount(Facebookaccountid, _redisCache, dbr);
            string pageid = Helper.FacebookHelper.GetFbPageDetails(FacebookUrl, _Facebookaccounts.AccessToken);
            Domain.Socioboard.Models.Mongo.GroupShareathon _GroupShareathon = new Domain.Socioboard.Models.Mongo.GroupShareathon();
            _GroupShareathon.Id = ObjectId.GenerateNewId();
            _GroupShareathon.strId = ObjectId.GenerateNewId().ToString();
            _GroupShareathon.Userid = userId;
            _GroupShareathon.Timeintervalminutes = Timeintervalminutes;
            _GroupShareathon.FacebookStatus = 1;
            _GroupShareathon.FacebookPageUrl = FacebookUrl;
            _GroupShareathon.Facebookpageid = pageid.TrimEnd(',');
            _GroupShareathon.Facebooknameid = FacebookGroupId;
            groupids = FacebookGroupId.Split(',');
            foreach (var item in groupids)
            {
                string[] grpId = Regex.Split(item, "<:>");
                groupId = grpId[1] + ',' + groupId;
                groupName = grpId[0] + ',' + groupName;
            }
            _GroupShareathon.Facebookgroupid = groupId.TrimEnd(',');
            _GroupShareathon.Facebookgroupname = groupName.TrimEnd(',');
            _GroupShareathon.Facebookaccountid = _Facebookaccounts.FbUserId;
            _GroupShareathon.Facebookusername = _Facebookaccounts.FbUserName;
            _GroupShareathon.AccessToken = _Facebookaccounts.AccessToken;
            _GroupShareathon.Lastsharetimestamp = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
            MongoRepository _ShareathonRepository = new MongoRepository("GroupShareathon", _appSettings);
            profileids = pageid.TrimEnd(',').Split(',');
            groupids = FacebookGroupId.TrimEnd(',').Split(',');
            string[] arrgroupids = groupId.Split(',');
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => profileids.Contains(t.Facebookpageid) && t.Facebookaccountid == Facebookaccountid && t.Userid == userId && arrgroupids.Contains(t.Facebookgroupid));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            int count = task.Result.Count;
            if (count > 0)
            {
                return "already added";
            }
            else
            {
                _ShareathonRepository.Add(_GroupShareathon);
                return "added successfully";
            }
        }


        public static string DeleteGroupShareathon(string GroupShareathodId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("GroupShareathon", _appSettings);
                var builders = Builders<Domain.Socioboard.Models.Mongo.GroupShareathon>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.GroupShareathon> filter = builders.Eq("strId", GroupShareathodId);
                _ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.GroupShareathon>(filter);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static string DeleteLinkShareathon(string GroupShareathodId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("LinkShareathon", _appSettings);
                var builders = Builders<Domain.Socioboard.Models.Mongo.LinkShareathon>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.LinkShareathon> filter = builders.Eq("strId", GroupShareathodId);
                _ShareathonRepository.Delete<Domain.Socioboard.Models.Mongo.LinkShareathon>(filter);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.GroupShareathon> GroupShareathonByUserId(long userId, Helper.AppSettings _appSettings, Helper.Cache _redisCache)
        {
            List<Domain.Socioboard.Models.Mongo.GroupShareathon> iMmemGroupShareathon = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.GroupShareathon>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupShareathonByUserId + userId);
            if (iMmemGroupShareathon != null)
            {
                return iMmemGroupShareathon;
            }
            else
            {
                MongoRepository _ShareathonRepository = new MongoRepository("GroupShareathon", _appSettings);
                var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.GroupShareathon>(t => t.Userid == userId && t.FacebookStatus == 1);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupShareathonByUserId + userId, task.Result.ToList());
                return task.Result.ToList();
            }
        }
        public static List<Domain.Socioboard.Models.Mongo.LinkShareathon> LinkShareathonByUserId(long userId, Helper.AppSettings _appSettings, Helper.Cache _redisCache)
        {

            MongoRepository _ShareathonRepository = new MongoRepository("LinkShareathon", _appSettings);
            var ret = _ShareathonRepository.Find<Domain.Socioboard.Models.Mongo.LinkShareathon>(t => t.Userid == userId && t.IsActive);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return task.Result.ToList();

        }

        public static string EditgroupShareathon(string GroupShareathodId, long userId, string FacebookUrl, string FacebookGroupId, string Facebookaccountid, int Timeintervalminutes, Helper.Cache _redisCache, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {

            string[] groupids = null;
            string groupId = "";
            string groupName = "";
            Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = Repositories.FacebookRepository.getFacebookAccount(Facebookaccountid, _redisCache, dbr);
            string pageid = Helper.FacebookHelper.GetFbPageDetails(FacebookUrl, _Facebookaccounts.AccessToken);
            groupids = FacebookGroupId.Split(',');
            foreach (var item in groupids)
            {
                string[] grpId = Regex.Split(item, "<:>");
                groupId = grpId[1] + ',' + groupId;
                groupName = grpId[0] + ',' + groupName;
            }
            try
            {
                MongoRepository _ShareathonRepository = new MongoRepository("GroupShareathon", _appSettings);
                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", GroupShareathodId);
                var update = Builders<BsonDocument>.Update.Set("Facebookaccountid", _Facebookaccounts.FbUserId).Set("Facebookusername", _Facebookaccounts.FbUserName).Set("FacebookPageId", pageid.TrimEnd(','))
                    .Set("Facebookgroupid", groupId.TrimEnd(',')).Set("FacebookPageUrl", FacebookUrl).Set("Facebookgroupname", groupName.TrimEnd(',')).Set("Facebooknameid", FacebookGroupId)
                    .Set("Timeintervalminutes", Timeintervalminutes);
                _ShareathonRepository.Update<Domain.Socioboard.Models.Mongo.GroupShareathon>(update, filter);
                return "Success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }
    }
}
