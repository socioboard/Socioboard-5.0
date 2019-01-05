using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using FluentScheduler;
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
    public class YoutubeServiceHelper
    {
        #region Get all youtube channels
        /// <summary>
        /// Get all youtube channels
        /// </summary>
        /// <returns></returns>
        private static IEnumerable<YoutubeChannel> GetYoutubrAccounts()
        {
            var databaseRepository = new DatabaseRepository();
            var lstYoutubeaccount = databaseRepository.Find<YoutubeChannel>(t => t.IsActive).ToList();
            return lstYoutubeaccount;
        }
        #endregion

        #region YoutubeServicesStart
        public void UpdateYoutubeAccounts()
        {
            try
            {
                JobManager.AddJob(() =>
                {
                    //Thread.CurrentThread.IsBackground = false;
                    var status = DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.YoutubeUpdateDetails, objStatus => false);

                    if (!status)
                        StartUpdateAccountDetails();

                }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(50).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion

        #region StartUpdatingYoutubeFeeds
        private void StartUpdateAccountDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.YoutubeUpdateDetails, true, (enumType, runningStatus) => true);
                var youtubeAccounts = GetYoutubrAccounts();


                Parallel.ForEach(youtubeAccounts, new ParallelOptions { MaxDegreeOfParallelism = 5 }, UpdateYoutubeFeeds);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.YoutubeUpdateDetails, true, (enumType, runningStatus) => false);
        }


        private void UpdateYoutubeFeeds(YoutubeChannel youtubeChannel)
        {
            if (youtubeChannel.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (youtubeChannel.IsActive)
                {
                    var objoAuthTokenYtubes = new oAuthTokenYoutube(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    var objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    var objVideo = new Video(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    var databaseRepository = new DatabaseRepository();

                    ParseAndUpdateAccountDetails(youtubeChannel, databaseRepository, objVideo);
                    YoutubeFeedsfetch.ParseAndUpdateFeeds(youtubeChannel.YtubeChannelId);
                }
            }
        }
        #endregion

        #region UpdateAccount
        private void ParseAndUpdateAccountDetails(YoutubeChannel youtubeChannel, DatabaseRepository databaseRepository, Video objVideo)
        {
            try
            {
                var _grpProfile = databaseRepository.Find<Groupprofiles>(t => t.profileId.Contains(youtubeChannel.YtubeChannelId)).ToList();

                var ChannelInfo = objVideo.GetChannelInfo(AppSettings.googleApiKey, youtubeChannel.YtubeChannelId);
                var JChannelInfo = JObject.Parse(ChannelInfo);

                var cmntsCount = objVideo.GetChannelCmntCount(AppSettings.googleApiKey, youtubeChannel.YtubeChannelId);
                var JcmntsCount = JObject.Parse(cmntsCount);

                youtubeChannel.CommentsCount = Convert.ToDouble(JcmntsCount.SelectToken("pageInfo.totalResults")?.ToString() ?? "0");

                youtubeChannel.YtubeChannelName = JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("snippet.title")?.ToString();
                _grpProfile.Select(s => { s.profileName = JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("snippet.title")?.ToString(); return s; }).ToList();
                youtubeChannel.ChannelpicUrl = JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("snippet.thumbnails.default.url")?.ToString()?.Replace(".jpg", "");
                _grpProfile.Select(s => { s.profilePic = JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("snippet.thumbnails.default.url")?.ToString()?.Replace(".jpg", ""); return s; }).ToList();
                youtubeChannel.YtubeChannelDescription = JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("snippet.description")?.ToString() ?? "No Description";
                youtubeChannel.SubscribersCount = Convert.ToDouble(JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("statistics.subscriberCount")?.ToString() ?? "0");
                youtubeChannel.VideosCount = Convert.ToDouble(JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("statistics.videoCount")?.ToString() ?? "0");
                youtubeChannel.ViewsCount = Convert.ToDouble(JChannelInfo.SelectTokens("items")?.FirstOrDefault()?.FirstOrDefault()?.SelectToken("statistics.viewCount")?.ToString() ?? "0");

                foreach (var youtubeChannel_grpProfile in _grpProfile)
                {
                    databaseRepository.Update(youtubeChannel_grpProfile);
                }

                youtubeChannel.LastUpdate = DateTime.UtcNow;
                databaseRepository.Update(youtubeChannel);
            }
            catch (Exception ex)
            {

            }
        }
        #endregion
    }

    #region UpdateFeeds
    public class YoutubeFeedsfetch
    {
        #region Feeds
        static List<MongoYoutubeComments> _lstGlobalComVideos = new List<MongoYoutubeComments>();

        public static void ParseAndUpdateFeeds(string ChannelId)
        {
            try
            {
                var _ObjYtActivities = new Activities(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                var apiKey = AppSettings.googleApiKey_TestApp;



                MongoYoutubeFeeds _ObjMongoYtFeeds;
                var _ChannelVideos = _ObjYtActivities.GetYtVideos(ChannelId, apiKey);
                var J_ChannelVideos = JObject.Parse(_ChannelVideos);

                if (J_ChannelVideos["items"] == null)
                    return;

                foreach (var itemVideo in J_ChannelVideos["items"])
                {
                    _lstGlobalComVideos.Clear();
                    _ObjMongoYtFeeds = new MongoYoutubeFeeds();
                    _ObjMongoYtFeeds.Id = ObjectId.GenerateNewId();
                    _ObjMongoYtFeeds.YtChannelId = ChannelId;
                    _ObjMongoYtFeeds.YtVideoId = itemVideo.SelectToken("contentDetails.upload.videoId")?.ToString();
                    if (_ObjMongoYtFeeds.YtVideoId == null)//sometimes coming null
                        continue;
                    _ObjMongoYtFeeds.VdoTitle = itemVideo.SelectToken("snippet.title")?.ToString();
                    _ObjMongoYtFeeds.VdoDescription = itemVideo.SelectToken("snippet.description")?.ToString();
                    _ObjMongoYtFeeds.VdoPublishDate = itemVideo.SelectToken("snippet.publishedAt")?.ToString();
                    _ObjMongoYtFeeds.VdoImage = itemVideo.SelectToken("snippet.thumbnails.high.url")?.ToString();
                    _ObjMongoYtFeeds.VdoImage = itemVideo.SelectToken("snippet.thumbnails.medium.url")?.ToString();
                    _ObjMongoYtFeeds.VdoUrl = "https://www.youtube.com/watch?v=" + _ObjMongoYtFeeds.YtVideoId;
                    _ObjMongoYtFeeds.VdoEmbed = "https://www.youtube.com/embed/" + _ObjMongoYtFeeds.YtVideoId;

                    var YtFeedsRepo = new MongoRepository("YoutubeVideos");
                    var ret = YtFeedsRepo.Find<MongoYoutubeFeeds>(t => t.YtVideoId.Equals(_ObjMongoYtFeeds.YtVideoId));
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    var count = task.Result.Count;
                    if (count < 1)
                    {
                        try
                        {
                            YtFeedsRepo.Add(_ObjMongoYtFeeds);
                        }
                        catch { }
                    }
                    else
                    {
                        try
                        {
                            var filter = new BsonDocument("YtVideoId", _ObjMongoYtFeeds.YtVideoId);
                            var update = Builders<BsonDocument>.Update.Set("VdoTitle", _ObjMongoYtFeeds.VdoTitle).Set("VdoDescription", _ObjMongoYtFeeds.VdoDescription).Set("VdoImage", _ObjMongoYtFeeds.VdoImage);
                            YtFeedsRepo.Update<MongoYoutubeFeeds>(update, filter);
                        }
                        catch { }
                    }

                    //new Thread(delegate () {
                    GetYtComments(_ObjMongoYtFeeds.YtVideoId, apiKey, ChannelId);
                    UpdateYtComments(_ObjMongoYtFeeds.YtVideoId, apiKey, ChannelId);
                    //}).Start();
                }
            }
            catch (Exception ex)
            {
            }
        }
        #endregion

        #region Comments
        private static void GetYtComments(string VideoId, string apiKey, string ChannelId)
        {
            var _Videos = new Video(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);

            try
            {
                MongoYoutubeComments _ObjMongoYtComments;
                var _CommentsData = _Videos.Get_CommentsBy_VideoId(VideoId, "", "", apiKey);
                var J_CommentsData = JObject.Parse(_CommentsData);

                foreach (var itemComment in J_CommentsData.SelectTokens("items[*]"))
                {
                    _ObjMongoYtComments = new MongoYoutubeComments();
                    _ObjMongoYtComments.Id = ObjectId.GenerateNewId();

                    _ObjMongoYtComments.ChannelId = ChannelId;
                    _ObjMongoYtComments.videoId = itemComment.SelectToken("snippet.videoId")?.ToString();
                    _ObjMongoYtComments.commentId = itemComment.SelectToken("id")?.ToString();
                    _ObjMongoYtComments.authorDisplayName = itemComment.SelectToken("snippet.topLevelComment.snippet.authorDisplayName")?.ToString();
                    _ObjMongoYtComments.authorProfileImageUrl = itemComment.SelectToken("snippet.topLevelComment.snippet.authorProfileImageUrl")?.ToString()?.Replace(".jpg", "");
                    _ObjMongoYtComments.authorChannelUrl = itemComment.SelectToken("snippet.topLevelComment.snippet.authorChannelUrl")?.ToString();
                    _ObjMongoYtComments.authorChannelId = itemComment.SelectToken("snippet.topLevelComment.snippet.authorChannelId.value")?.ToString();
                    _ObjMongoYtComments.commentDisplay = itemComment.SelectToken("snippet.topLevelComment.snippet.textDisplay")?.ToString();
                    _ObjMongoYtComments.commentOriginal = itemComment.SelectToken("snippet.topLevelComment.snippet.textOriginal")?.ToString();
                    _ObjMongoYtComments.viewerRating = itemComment.SelectToken("snippet.topLevelComment.snippet.viewerRating")?.ToString();
                    _ObjMongoYtComments.likesCount = itemComment.SelectToken("snippet.topLevelComment.snippet.likeCount")?.ToString();
                    _ObjMongoYtComments.publishTime = itemComment.SelectToken("snippet.topLevelComment.snippet.publishedAt")?.ToString();
                    _ObjMongoYtComments.publishTimeUnix = UnixTimeFromDatetime(Convert.ToDateTime(_ObjMongoYtComments.publishTime));
                    _ObjMongoYtComments.updatedTime = itemComment.SelectToken("snippet.topLevelComment.snippet.updatedAt")?.ToString();
                    _ObjMongoYtComments.totalReplyCount = itemComment.SelectToken("snippet.totalReplyCount")?.ToString();
                    _ObjMongoYtComments.active = true;
                    _ObjMongoYtComments.review = false;
                    _ObjMongoYtComments.sbGrpTaskAssign = false;

                    try
                    {
                        _lstGlobalComVideos.Add(_ObjMongoYtComments);//Global var for update the comments
                        var youtubecommentsrepo = new MongoRepository("YoutubeVideosComments");
                        var ret = youtubecommentsrepo.Find<MongoYoutubeComments>(t => t.commentId.Equals(_ObjMongoYtComments.commentId));
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        var count = task.Result.Count;
                        if (count < 1)
                        {
                            try
                            {
                                youtubecommentsrepo.Add(_ObjMongoYtComments);
                            }
                            catch { }
                        }
                        else
                        {
                            try
                            {
                                var filter = new BsonDocument("commentId", _ObjMongoYtComments.commentId);
                                var update = Builders<BsonDocument>.Update.Set("authorDisplayName", _ObjMongoYtComments.authorDisplayName).Set("authorProfileImageUrl", _ObjMongoYtComments.authorProfileImageUrl).Set("commentDisplay", _ObjMongoYtComments.commentDisplay).Set("commentOriginal", _ObjMongoYtComments.commentOriginal).Set("viewerRating", _ObjMongoYtComments.viewerRating).Set("likesCount", _ObjMongoYtComments.likesCount).Set("totalReplyCount", _ObjMongoYtComments.totalReplyCount).Set("updatedTime", _ObjMongoYtComments.updatedTime).Set("publishTimeUnix", _ObjMongoYtComments.publishTimeUnix).Set("active", _ObjMongoYtComments.active);
                                youtubecommentsrepo.Update<MongoYoutubeComments>(update, filter);
                            }
                            catch { }
                        }

                    }
                    catch { }

                }
            }
            catch (Exception ex)
            {
            }
        }

        private static long UnixTimeFromDatetime(DateTime input)
        {
            try
            {
                var timeSpan = (input - new DateTime(1970, 1, 1, 0, 0, 0));
                return (long)timeSpan.TotalSeconds;

            }
            catch (Exception)
            {
                return 0;
            }
        }

        private static void UpdateYtComments(string VideoId, string apiKey, string ChannelId)
        {
            int c = 0;
            var mongoreposs = new MongoRepository("YoutubeVideosComments");
            var result = mongoreposs.Find<MongoYoutubeComments>(t => t.videoId == VideoId);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            var lstAllComment = task.Result;

            var idMongo = lstAllComment.Select(t => t.commentId).ToList();
            var idLatest = _lstGlobalComVideos.Select(t => t.commentId).ToList();
            Console.WriteLine("Filter the deleted Elements");
            foreach (string item in idMongo)
            {
                if (!(idLatest.Contains(item)))
                {
                    Console.WriteLine("===============");
                    var _mongoRepo = new MongoRepository("YoutubeVideosComments");
                    var temp = lstAllComment.Single(t => t.commentId == item);
                    temp.active = false;
                    var filter = new BsonDocument("commentId", temp.commentId);
                    var update = Builders<BsonDocument>.Update.Set("active", temp.active);
                    _mongoRepo.Update<MongoYoutubeComments>(update, filter);
                    Console.WriteLine(c++);
                }
                Console.Write(".");
            }
        }
        #endregion
    }
    #endregion
}





