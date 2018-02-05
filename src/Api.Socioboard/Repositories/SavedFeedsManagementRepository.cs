using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public class SavedFeedsManagementRepository
    {
        public static bool SavePost(SavedFeedsManagement objDta, Helper.AppSettings _settings)
        {
            try
            {
                objDta.Id = ObjectId.GenerateNewId();
                objDta.savedTime = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
                var result = mongorepo.Add<Domain.Socioboard.Models.Mongo.SavedFeedsManagement>(objDta);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool SaveComment(SavedFeedsComments objDta, Helper.AppSettings _settings)
        {
            try
            {
                objDta.commentId = ObjectId.GenerateNewId();
                objDta.savedTime = Helper.DateExtension.ConvertToUnixTimestamp(DateTime.UtcNow);
                objDta.updateCommentStatus = false;
                MongoRepository mongorepo = new MongoRepository("SavedFeedsComments", _settings);
                var result = mongorepo.Add<Domain.Socioboard.Models.Mongo.SavedFeedsComments>(objDta);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool UpdateComment(string commentId, string UpdateCommentText, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsComments", _settings);
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", commentId);
                var update = Builders<BsonDocument>.Update.Set("sbGrpMemberName", UpdateCommentText).Set("updateCommentStatus", true);
                mongorepo.Update<MongoYoutubeComments>(update, filter);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool DeleteComment(string commentId, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsComments", _settings);
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", commentId);
                mongorepo.Delete(filter);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static IList<Domain.Socioboard.Models.Mongo.SavedFeedsManagement> GetSavedFeeds(string profileId, long groupId, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
            try
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.SavedFeedsManagement>.Sort;
                var sort = builder.Descending(t => t.savedTime);
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.SavedFeedsManagement>(t => t.socialProfileId.Equals(profileId) && t.groupId.Equals(groupId));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.SavedFeedsManagement> lstYtFeeds = task.Result;
                return lstYtFeeds;
            }
            catch
            {
                return null;
            }
        }
    }
}
