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
    public class InstagramSelfFeed
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string ProfileId { get; set; }
        public string FeedId { get; set; }
        public string Accesstoken { get; set; }
        public string User_name { get; set; }
        public string Post_url { get; set; }
        public string Link { get; set; }
        public string Type { get; set; }
        public string Created_Time { get; set; }
    }
}
