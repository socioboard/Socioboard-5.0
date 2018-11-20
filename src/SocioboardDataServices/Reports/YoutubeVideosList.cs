using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Youtube.Core;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports
{
    public class YoutubeVideosList
    {
        public void UpdateVideoDetailsList()
        {
            while (true)
            {
                try
                {
                    var databaseRepository = new DatabaseRepository();
                    Video objVideo = new Video(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    
                    var lstYtChannels = databaseRepository.Find<YoutubeChannel>(t => t.IsActive).ToList();
                    var count = 0;
                    Console.WriteLine("---------------- Youtube Videos List Dataservices Started ----------------");
                    foreach (var item in lstYtChannels)
                    {                        

                        try
                        {
                            if (item.LastVideoListDetails_Update.AddMinutes(60) < DateTime.UtcNow)
                            {
                                var mongoreposs = new MongoRepository("YoutubeVideos");
                                var result = mongoreposs.Find<Domain.Socioboard.Models.Mongo.MongoYoutubeFeeds>(t => t.YtChannelId.Equals(item.YtubeChannelId));
                                var task = Task.Run(async () =>
                                {
                                    return await result;
                                });
                                var lstChannelVideos = task.Result;
                                var videoIds = new List<string>();

                                foreach (var items in lstChannelVideos)
                                {
                                    videoIds.Add(items.YtVideoId);
                                }

                                foreach (string videoId in videoIds)
                                {
                                    try
                                    {
                                        var VideoList = objVideo.GetYTVideoDetailList(AppSettings.googleApiKey, videoId);
                                        var JVideoList = JObject.Parse(VideoList);

                                        foreach (var itemVideo in JVideoList["items"])
                                        {
                                            var _YVideoDetails = new YoutubeVideoDetailsList();


                                            _YVideoDetails.Id = ObjectId.GenerateNewId();
                                            try
                                            {
                                                _YVideoDetails.YtvideoId = itemVideo["id"].ToString();
                                                _YVideoDetails.watchUrl = "https://www.youtube.com/watch?v=" + _YVideoDetails.YtvideoId;
                                                _YVideoDetails.embedVideo = "https://www.youtube.com/embed/" + _YVideoDetails.YtvideoId;
                                            }
                                            catch
                                            {
                                                _YVideoDetails.YtvideoId = "";
                                                _YVideoDetails.watchUrl = "N/A";
                                                _YVideoDetails.embedVideo = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.publishedAt = itemVideo["snippet"]["publishedAt"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.publishedAt = "0001-01-01";
                                            }
                                            try
                                            {
                                                _YVideoDetails.publishDateUnix = UnixTimeNows(Convert.ToDateTime(_YVideoDetails.publishedAt));
                                            }
                                            catch
                                            {
                                                _YVideoDetails.publishDateUnix = UnixTimeNows(Convert.ToDateTime("0001-01-01"));
                                            }
                                            try
                                            {
                                                _YVideoDetails.channelId = itemVideo["snippet"]["channelId"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.channelId = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.title = itemVideo["snippet"]["title"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.title = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.description = itemVideo["snippet"]["description"].ToString();
                                                if (_YVideoDetails.description == "")
                                                {
                                                    _YVideoDetails.description = "No Description";
                                                }
                                            }
                                            catch
                                            {
                                                _YVideoDetails.description = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.vdoImageUrl = itemVideo["snippet"]["thumbnails"]["default"]["url"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.vdoImageUrl = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.channelTitle = itemVideo["snippet"]["channelTitle"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.channelTitle = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.categoryId = itemVideo["snippet"]["categoryId"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.categoryId = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.liveBroadcastContent = itemVideo["snippet"]["liveBroadcastContent"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.liveBroadcastContent = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.duration = itemVideo["contentDetails"]["duration"].ToString();
                                                _YVideoDetails.videoLength = _YVideoDetails.duration.Replace("PT", "").Replace("H", "h:").Replace("M", "m:").Replace("S", "s");
                                            }
                                            catch
                                            {
                                                _YVideoDetails.duration = "N/A";
                                                _YVideoDetails.videoLength = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.dimension = itemVideo["contentDetails"]["dimension"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.dimension = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.definition = itemVideo["contentDetails"]["definition"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.definition = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.caption = itemVideo["contentDetails"]["caption"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.caption = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.licensedContent = itemVideo["contentDetails"]["licensedContent"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.licensedContent = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.projection = itemVideo["contentDetails"]["projection"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.projection = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.uploadStatus = itemVideo["status"]["uploadStatus"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.uploadStatus = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.privacyStatus = itemVideo["status"]["privacyStatus"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.privacyStatus = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.license = itemVideo["status"]["license"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.license = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.embeddable = itemVideo["status"]["embeddable"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.embeddable = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.publicStatsViewable = itemVideo["status"]["publicStatsViewable"].ToString();
                                            }
                                            catch
                                            {
                                                _YVideoDetails.publicStatsViewable = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.viewCount = Convert.ToInt32(itemVideo["statistics"]["viewCount"]);
                                            }
                                            catch
                                            {
                                                _YVideoDetails.viewCount = 0;
                                            }
                                            try
                                            {
                                                _YVideoDetails.likeCount = Convert.ToInt32(itemVideo["statistics"]["likeCount"].ToString());
                                            }
                                            catch
                                            {
                                                _YVideoDetails.likeCount = 0;
                                            }
                                            try
                                            {
                                                _YVideoDetails.dislikeCount = Convert.ToInt32(itemVideo["statistics"]["dislikeCount"].ToString());
                                            }
                                            catch
                                            {
                                                _YVideoDetails.dislikeCount = 0;
                                            }
                                            try
                                            {
                                                _YVideoDetails.favoriteCount = Convert.ToInt32(itemVideo["statistics"]["favoriteCount"].ToString());
                                            }
                                            catch
                                            {
                                                _YVideoDetails.favoriteCount = 0;
                                            }
                                            try
                                            {
                                                _YVideoDetails.commentCount = Convert.ToInt32(itemVideo["statistics"]["commentCount"].ToString());
                                            }
                                            catch
                                            {
                                                _YVideoDetails.commentCount = 0;
                                            }
                                            try
                                            {
                                                _YVideoDetails.channelProfilePic = item.ChannelpicUrl;
                                            }
                                            catch
                                            {
                                                _YVideoDetails.channelProfilePic = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.channelEmailId = item.Channel_EmailId;
                                            }
                                            catch
                                            {
                                                _YVideoDetails.channelEmailId = "N/A";
                                            }
                                            try
                                            {
                                                _YVideoDetails.channelUrl = item.WebsiteUrl;
                                            }
                                            catch
                                            {
                                                _YVideoDetails.channelUrl = "N/A";
                                            }

                                            try
                                            {
                                                MongoRepository mongoRepotsRepo = new MongoRepository("YoutubeVideosDetailedList");
                                                var ret = mongoRepotsRepo.Find<YoutubeVideoDetailsList>(t => t.YtvideoId.Equals(_YVideoDetails.YtvideoId));
                                                var task_Reports = Task.Run(async () =>
                                                {
                                                    return await ret;
                                                });
                                                int count_Reports = task_Reports.Result.Count;
                                                if (count_Reports < 1)
                                                {
                                                    try
                                                    {
                                                        mongoRepotsRepo.Add(_YVideoDetails);
                                                    }
                                                    catch { }
                                                }
                                                else
                                                {
                                                    try
                                                    {
                                                        FilterDefinition<BsonDocument> filter = new BsonDocument("YtvideoId", _YVideoDetails.YtvideoId);
                                                        var update = Builders<BsonDocument>.Update.Set("title", _YVideoDetails.title).Set("description", _YVideoDetails.description).Set("vdoImageUrl", _YVideoDetails.vdoImageUrl).Set("channelTitle", _YVideoDetails.channelTitle).Set("uploadStatus", _YVideoDetails.uploadStatus).Set("categoryId", _YVideoDetails.categoryId).Set("privacyStatus", _YVideoDetails.privacyStatus).Set("viewCount", _YVideoDetails.viewCount).Set("likeCount", _YVideoDetails.likeCount).Set("dislikeCount", _YVideoDetails.dislikeCount).Set("favoriteCount", _YVideoDetails.favoriteCount).Set("commentCount", _YVideoDetails.commentCount).Set("publishDateUnix", _YVideoDetails.publishDateUnix).Set("videoLength", _YVideoDetails.videoLength).Set("channelProfilePic", _YVideoDetails.channelProfilePic).Set("channelEmailId", _YVideoDetails.channelEmailId).Set("channelUrl", _YVideoDetails.channelUrl);
                                                        mongoRepotsRepo.Update<YoutubeReports>(update, filter);
                                                    }
                                                    catch { }
                                                }

                                            }
                                            catch { }

                                            Console.Write(".");
                                        }
                                    }
                                    catch
                                    {
                                       
                                    }                                    
                                }

                                item.LastVideoListDetails_Update = DateTime.UtcNow;
                                databaseRepository.Update(item);

                            }
                        }
                        catch
                        {

                        }
                                              

                        long oldcount = count;
                        count++;
                        long newcount = count;
                        long totalcount = lstYtChannels.Count();
                        long percentagenew = (newcount * 100) / totalcount;
                        long percentageold = (oldcount * 100) / totalcount;
                        if (percentagenew != percentageold)
                        {
                            Console.WriteLine("---------------- {0}% Completed ----------------", percentagenew);
                        }
                    }
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }

        public long UnixTimeNows(DateTime x)
        {
            var timeSpan = (x - new DateTime(1970, 1, 1, 0, 0, 0));
            return (long)timeSpan.TotalSeconds;
        }


    }
}
