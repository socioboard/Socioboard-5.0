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
    public class MongoYoutubeFeeds
    {

        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string YtChannelId { get; set; }
        public string YtVideoId { get; set; }
        public string VdoPublishDate { get; set; }
        public string VdoTitle { get; set; }
        public string VdoDescription { get; set; }
        public string VdoImage { get; set; }
        public string VdoUrl { get; set; }
        public string VdoEmbed { get; set; }

    }

    public class YoutubeFeed
    {
        public MongoYoutubeFeeds _youtubefeed { get; set; }
        public List<MongoYoutubeComments> _youtubecomment { get; set; }
    }
}
