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
    public class MongoPinterestUserFollowers
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string pinterestUserId { get; set; }
        public long userId { get; set; }
        public string username { get; set; }
        public string bio { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string account_type { get; set; }
        public string url { get; set; }
        public double created_at { get; set; }
        public string profileimageurl { get; set; }
        public long pinscount { get; set; }
        public long followingcount { get; set; }
        public long followerscount { get; set; }
        public long boardscount { get; set; }
        public long likescount { get; set; }
        public string followerid { get; set; }
    }
}
