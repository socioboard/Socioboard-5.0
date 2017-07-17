using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class YoutubeVideoDetailsList
    {

        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string YtvideoId { get; set; }
        public string publishedAt { get; set; }
        public string channelId { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string vdoImageUrl { get; set; }
        public string channelTitle { get; set; }
        public string channelProfilePic { get; set; }
        public string channelEmailId { get; set; }
        public string channelUrl { get; set; }
        public string categoryId { get; set; }
        public string duration { get; set; }
        public string dimension { get; set; }
        public string definition { get; set; }
        public string caption { get; set; }
        public string licensedContent { get; set; }
        public string projection { get; set; }
        public string uploadStatus { get; set; }
        public string privacyStatus { get; set; }
        public string license { get; set; }
        public string embeddable { get; set; }
        public string publicStatsViewable { get; set; }
        public string liveBroadcastContent { get; set; }
        public string watchUrl { get; set; }
        public string embedVideo { get; set; }
        public string videoLength { get; set; }
        public double publishDateUnix { get; set; }
        public int viewCount { get; set; }
        public int likeCount { get; set; }
        public int dislikeCount { get; set; }
        public int favoriteCount { get; set; }
        public int commentCount { get; set; }
    }

    public class YoutubeFeed
    {
        public YoutubeVideoDetailsList _youtubefeed { get; set; }
        public List<MongoYoutubeComments> _youtubecomment { get; set; }
    }
}
