using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.Youtube.Core;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Youtube
{
    public class YtCommentsReply
    {
        List<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> _lstGlobalCom;
        public void TakeComments()
        {
            while (true)
            {
                Console.WriteLine("Process start");
                Console.WriteLine("Dataservices YoutubecommentsReply........");
                _lstGlobalCom = new List<MongoYoutubeComments>();
                int c = 0;
                MongoRepository mongoreposs = new MongoRepository("YoutubeVideosComments");
                var result = mongoreposs.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.commentId != "");
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstParentComment = task.Result;
                foreach (var item in lstParentComment)
                {
                    CommentsReplies(item);
                    Console.WriteLine(c++);
                }
                CmntUpdate();
                Console.WriteLine("Process done");
                Console.WriteLine("Process paused for an hour");
                Thread.Sleep(3600000);
            }
        }

        public void CommentsReplies(Domain.Socioboard.Models.Mongo.MongoYoutubeComments itemMainComments)
        {
            string apiKey = AppSettings.googleApiKey_TestApp;
            oAuthTokenYoutube ObjoAuthTokenYtubes = new oAuthTokenYoutube(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
            oAuthToken objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
            Video objVideo = new Video(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
            try
            {
                string commentsReply = objVideo.Get_CommentsRepliesBy_CmParentId(itemMainComments.commentId, apiKey);
                JObject jCommentsReply = JObject.Parse(commentsReply);
                MongoYoutubeComments _ObjMongoYtCommentsReply;
                foreach (var itemReply in jCommentsReply["items"])
                {
                    _ObjMongoYtCommentsReply = new MongoYoutubeComments();
                    _ObjMongoYtCommentsReply.Id = ObjectId.GenerateNewId();
                    try
                    {
                        _ObjMongoYtCommentsReply.ChannelId = itemMainComments.ChannelId;
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.videoId = itemMainComments.videoId;
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.commentId = itemReply["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.authorDisplayName = itemReply["snippet"]["authorDisplayName"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.authorProfileImageUrl = itemReply["snippet"]["authorProfileImageUrl"].ToString().Replace(".jpg", "");
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.authorChannelUrl = itemReply["snippet"]["authorChannelUrl"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.authorChannelId = itemReply["snippet"]["authorChannelId"]["value"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.commentDisplay = itemReply["snippet"]["textDisplay"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.commentOriginal = itemReply["snippet"]["textOriginal"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.viewerRating = itemReply["snippet"]["viewerRating"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.likesCount = itemReply["snippet"]["likeCount"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.publishTime = itemReply["snippet"]["publishedAt"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.publishTimeUnix = UnixTimeFromDatetime(Convert.ToDateTime(_ObjMongoYtCommentsReply.publishTime));
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.updatedTime = itemReply["snippet"]["updatedAt"].ToString();
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.totalReplyCount = "ReplyType";
                    }
                    catch { }
                    try
                    {
                        _ObjMongoYtCommentsReply.parentIdforReply = itemReply["snippet"]["parentId"].ToString();
                    }
                    catch { }
                    _ObjMongoYtCommentsReply.active = true;
                    _ObjMongoYtCommentsReply.review = false;
                    _ObjMongoYtCommentsReply.sbGrpTaskAssign = false;
                    try
                    {

                        _lstGlobalCom.Add(_ObjMongoYtCommentsReply);//Global Type

                        MongoRepository _mongoRepo = new MongoRepository("YoutubeVideosCommentsReply");
                        var ret = _mongoRepo.Find<MongoYoutubeComments>(t => t.commentId.Equals(_ObjMongoYtCommentsReply.commentId));
                        var task_Reports = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count_Reports = task_Reports.Result.Count;
                        if (count_Reports < 1)
                        {
                            try
                            {
                                _mongoRepo.Add(_ObjMongoYtCommentsReply);
                            }
                            catch { }
                        }
                        else
                        {
                            try
                            {
                                FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", _ObjMongoYtCommentsReply.commentId);
                                var update = Builders<BsonDocument>.Update.Set("commentDisplay", _ObjMongoYtCommentsReply.commentDisplay).Set("commentOriginal", _ObjMongoYtCommentsReply.commentOriginal).Set("publishTimeUnix", _ObjMongoYtCommentsReply.publishTimeUnix);
                                _mongoRepo.Update<MongoYoutubeComments>(update, filter);
                            }
                            catch { }
                        }
                    }
                    catch (Exception ex) { }
                }
            }
            catch
            {

            }
        }

        public void CmntUpdate()
        {
            int c = 0;
            MongoRepository mongoreposs = new MongoRepository("YoutubeVideosCommentsReply");
            var result = mongoreposs.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeComments>(t => t.commentId != "");
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoYoutubeComments> lstAllComment = task.Result;

            List<string> idMongo = lstAllComment.Select(t => t.commentId).ToList();
            List<string> idLatest = _lstGlobalCom.Select(t => t.commentId).ToList();
            Console.WriteLine("Filter the deleted Elements");
            foreach (string item in idMongo)
            {
                if (!(idLatest.Contains(item)))
                {
                    Console.WriteLine("===============");
                    MongoRepository _mongoRepo = new MongoRepository("YoutubeVideosCommentsReply");
                    var temp = lstAllComment.Single(t => t.commentId == item);
                    temp.active = false;
                    FilterDefinition<BsonDocument> filter = new BsonDocument("commentId", temp.commentId);
                    var update = Builders<BsonDocument>.Update.Set("active", temp.active);
                    _mongoRepo.Update<MongoYoutubeComments>(update, filter);
                    Console.WriteLine(c++);
                }
                Console.Write(".");
            }
        }

        public long UnixTimeFromDatetime(DateTime input)
        {
            var timeSpan = (input - new DateTime(1970, 1, 1, 0, 0, 0));
            return (long)timeSpan.TotalSeconds;
        }

    }
}