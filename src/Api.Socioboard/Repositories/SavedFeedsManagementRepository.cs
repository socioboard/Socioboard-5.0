using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Globalization;
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
                objDta.strId = ObjectId.GenerateNewId().ToString();
                objDta.postId = ObjectId.GenerateNewId().ToString();
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

        public static bool DeletePost(string postId, Helper.AppSettings _settings)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", postId);
                mongorepo.Delete(filter);
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
                objDta.strCommentId = ObjectId.GenerateNewId().ToString();
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
                FilterDefinition<BsonDocument> filter = new BsonDocument("strCommentId", commentId);
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
                FilterDefinition<BsonDocument> filter = new BsonDocument("strCommentId", commentId);
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

        public static IList<Domain.Socioboard.Models.Mongo.SavedFeedsComments> GetComments(string postId, long groupId, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsComments", _settings);
            try
            {
                var builder = Builders<Domain.Socioboard.Models.Mongo.SavedFeedsComments>.Sort;
                var sort = builder.Descending(t => t.savedTime);
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.SavedFeedsComments>(t => t.postId.Equals(postId) && t.groupId.Equals(groupId));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.SavedFeedsComments> lstYtFeeds = task.Result;
                return lstYtFeeds;
            }
            catch
            {
                return null;
            }
        }

        public static bool changeaprove(string strid, bool update, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", strid);
                var Update = Builders<BsonDocument>.Update.Set("review", update);
                mongorepo.Update<MongoYoutubeComments>(Update, filter);
                return true;
            }
            catch
            {
                return false;
            }
        }


        public static string publish(string profileId, string strid, Helper.AppSettings _settings)
        {
            MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
            try
            {
                FilterDefinition<BsonDocument> filter = new BsonDocument("strId", strid);
                var Update = Builders<BsonDocument>.Update.Set("status", "2");
                mongorepo.Update<MongoYoutubeComments>(Update, filter);
                return "sucess";
            }
            catch
            {
                return "failed"; 
            }
        }


        public static bool  scheduleMsgRepo(string postId, long groupId,DateTime schtime,string timeval, Helper.AppSettings _settings)
        {
                     
            MongoRepository mongorepo = new MongoRepository("SavedFeedsManagement", _settings);
            try
            {
                string dateval = schtime.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
                DateTime schdatetime = Convert.ToDateTime(dateval + " " + timeval);
                

                FilterDefinition<BsonDocument> filter = new BsonDocument("postId", postId);
                var update = Builders<BsonDocument>.Update.Set("scheduleTime", schdatetime).Set("schedOrNotstatus", 1).Set("scheduleTimestr", schdatetime.ToString());
                try
                {
                    mongorepo.Update<SavedFeedsManagement>(update, filter);
                }
                catch (Exception ex)
                {

                }
                return true;
            }
            catch
            {
                return false;
            }
        }

    }
}

