using Api.Socioboard.Model;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories.ListeningRepository
{
    public class LinkedInGroupPostRepository
    {
        public static List<Domain.Socioboard.Models.Listening.LinkedGroupPost> GetFacebookGroupFeeds(string keyword, int skip, int count, Helper.Cache _redisCache, Helper.AppSettings _appSettings, ILogger _logger)
        {

            try
            {
                MongoRepository mongorepo = new MongoRepository("LinkedGroupPost", _appSettings);
                MongoRepository mongoreppo = new MongoRepository("GroupPostKeyWords", _appSettings);
                Domain.Socioboard.Models.Mongo.GroupPostKeyWords _GroupPostKeyWords = new Domain.Socioboard.Models.Mongo.GroupPostKeyWords();
                _GroupPostKeyWords.id = ObjectId.GenerateNewId();
                _GroupPostKeyWords.strId = ObjectId.GenerateNewId().ToString();
                _GroupPostKeyWords.keyword = keyword;
                _GroupPostKeyWords.createdTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                mongoreppo.Add<Domain.Socioboard.Models.Mongo.GroupPostKeyWords>(_GroupPostKeyWords);

                var builder = Builders<Domain.Socioboard.Models.Listening.LinkedGroupPost>.Sort;
                var sort = builder.Descending(t => t.DateTimeOfPost);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Listening.LinkedGroupPost>(t => t.Message.Contains(keyword), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Listening.LinkedGroupPost> lstFbFeeds = task.Result;
                return lstFbFeeds.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
                return null;
            }

        }
    }
}
