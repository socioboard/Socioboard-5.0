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
    public class InstagramFeed
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string FeedImageUrl { get; set; }
        public double FeedDate { get; set; }

        public string InstagramId { get; set; }

        public int LikeCount { get; set; }
        public string FeedId { get; set; }
        public int CommentCount { get; set; }
        public int IsLike { get; set; }
        public string AdminUser { get; set; }
        public string Feed { get; set; }
        public string ImageUrl { get; set; }
        public string FeedUrl { get; set; }
        public string FromId { get; set; }
        public string Type { get; set; }
        public string VideoUrl { get; set; }
        
    }
    public class intafeed {
        public InstagramFeed _InstagramFeed { get; set; }
        public List<InstagramComment> _InstagramComment { get; set; }
    }
}
