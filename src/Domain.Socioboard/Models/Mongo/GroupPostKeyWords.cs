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
    public class GroupPostKeyWords
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public string strId { get; set; }
        public string keyword { get; set; }
        public double createdTime { get; set; }
    }
}
