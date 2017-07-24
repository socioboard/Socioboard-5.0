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
    public class AdvanceSerachData
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string postType { get; set; }
        public string postId { get; set; }
        public string domainType { get; set; }
        public string title { get; set; }
        public string userName { get; set; }
        public string videourl { get; set; }
        public double postedTime { get; set; }
        public string ImageUrl { get; set; }
        public string postUrl { get; set; }
        public long fbShareCount { get; set; }
        public long twtShareCount { get; set; }
        public long linShareCount { get; set; }
        public long gplusShareCount { get; set; }
        public long redditShareCount { get; set; }
        public long totalShareCount { get; set; }
        public long retweetCount { get; set; }
        public long likeCount { get; set; }
        public long repliesCount { get; set; }
    }
}
