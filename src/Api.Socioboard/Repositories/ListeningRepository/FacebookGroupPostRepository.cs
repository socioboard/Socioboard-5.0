using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories.ListeningRepository
{
    public class FacebookGroupPostRepository
    {
        public static List<Domain.Socioboard.Models.Listening.FaceBookGroupPost> GetFacebookGroupFeeds(string keyword, int skip, int count, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            //List<Domain.Socioboard.Models.Listening.FacebookGroupPost> iMmemFacebookGroupPost = _redisCache.Get<List<Domain.Socioboard.Models.Listening.FacebookGroupPost>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryFacebookGroupPost + keyword);
            //if (iMmemFacebookGroupPost != null && iMmemFacebookGroupPost.Count > 0)
            //{
            //    return iMmemFacebookGroupPost;
            //}
            //else
            //{
            MongoRepository mongorepo = new MongoRepository("FaceBookGroupPost", _appSettings);
            MongoRepository mongoreppo = new MongoRepository("GroupPostKeyWords", _appSettings);
            var builder = Builders<Domain.Socioboard.Models.Listening.FaceBookGroupPost>.Sort;
            var sort = builder.Descending(t => t.DateTimeOfPost);
            var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Listening.FaceBookGroupPost>(t => t.Message.Contains(keyword), sort, skip, count);
            //var result = mongorepo.FindAll<Domain.Socioboard.Models.Listening.FaceBookGroupPost>();
            var task = Task.Run(async () =>
                {
                    return await result;
                });
            IList<Domain.Socioboard.Models.Listening.FaceBookGroupPost> lstFbFeeds = task.Result;
            if (lstFbFeeds.Count > 0)
            {
                // _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheDiscoveryFacebookGroupPost + keyword, lstFbFeeds.ToList());

            }
            Domain.Socioboard.Models.Mongo.GroupPostKeyWords _GroupPostKeyWords = new Domain.Socioboard.Models.Mongo.GroupPostKeyWords();
            _GroupPostKeyWords.id = ObjectId.GenerateNewId();
            _GroupPostKeyWords.strId = ObjectId.GenerateNewId().ToString();
            _GroupPostKeyWords.keyword = keyword;
            _GroupPostKeyWords.createdTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
            var retkeyword = mongoreppo.Find<Domain.Socioboard.Models.Mongo.GroupPostKeyWords>(t => t.keyword.Contains(keyword));
            var taskkeyword = Task.Run(async () =>
            {
                return await retkeyword;
            });
            int countkeyword = taskkeyword.Result.Count;
            if (count < 1)
            {
                mongoreppo.Add<Domain.Socioboard.Models.Mongo.GroupPostKeyWords>(_GroupPostKeyWords);
            }
            lstFbFeeds.Select(s => { s.Message = WebUtility.HtmlDecode(s.Message); return s; }).ToList();
            return lstFbFeeds.ToList();
            //}
        }
    }
}
