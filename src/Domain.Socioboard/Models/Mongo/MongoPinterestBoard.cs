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
    public class MongoPinterestBoard
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public long userId { get; set; }
        public string pinterestUserId { get; set; }
        public string boardname { get; set; }
        public string boardurl { get; set; }
        public double createddate { get; set; }
        public string imageurl { get; set; }
        public long pinscount { get; set; }
        public long collaboratorscount { get; set; }
        public long followerscount { get; set; }
        public string boardid { get; set; }
        public string description { get; set; }
    }
}
