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
    public class MongoBoards
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public string boardName { get; set; }
        public string objId { get; set; }
        public string userId { get; set; }
        public string createDate { get; set; }
        public bool isActive { get; set; }
        public string facebookHashTag { get; set; }
        public string twitterHashTag { get; set; }
        public string instagramHashTag { get; set; }
        public string gplusHashTag { get; set; }
    }
}
