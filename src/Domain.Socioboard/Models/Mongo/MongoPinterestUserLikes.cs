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
    public class MongoPinterestUserLikes
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string pinterestUserId { get; set; }
        public long userId { get; set; }
        public string creatorname { get; set; }
        public string creatorurl { get; set; }
        public string creatorid { get; set; }
        public string url { get; set; }
        public double created_at { get; set; }
        public string mediatype { get; set; }
        public string note { get; set; }
        public string link { get; set; }
        public string boardurl { get; set; }
        public string boardid { get; set; }
        public string boardname { get; set; }
        public string imageurl { get; set; }
        public long likesount { get; set; }
        public long commentscount { get; set; }
        public long repinscount { get; set; }
        public string likesid { get; set; }
        public string metatitle { get; set; }
        public string metasite_name { get; set; }
        public string metadescription { get; set; }
        public string metafavicon { get; set; }
    }
    public class UserlikesData
    {
        public Domain.Socioboard.Models.PinterestAccount _PinterestAccount { get; set; }
        public List<Domain.Socioboard.Models.Mongo.MongoPinterestUserLikes> lstMongoPinterestUserLikes { get; set; }
    }
}
