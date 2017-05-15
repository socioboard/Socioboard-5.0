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
    public class YoutubeReports
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string date { get; set; }
        public string channelId { get; set; }
        public int SubscribersGained { get; set; }
        public int views { get; set; }
        public int likes { get; set; }
        public int comments { get; set; }
        public int shares { get; set; }
        public int dislikes { get; set; }
        public int subscribersLost { get; set; }
        public double averageViewDuration { get; set; }
        public double estimatedMinutesWatched { get; set; }
        public double annotationClickThroughRate { get; set; }
        public double annotationCloseRate { get; set; }
        public string uniqueIdentifier { get; set; }
        public double datetime_unix { get; set; }
    }
}
