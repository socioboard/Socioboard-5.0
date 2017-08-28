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
    public class TwitterFeedsEmailMessage
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]

        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string dateUtc { get; set; }
        public string dateLocal { get; set; }
        public double dateUnix { get; set; }
        public string socioTwitterId { get; set; }
        public long socioboardUserId { get; set; }
        public string twitterUserIdFrom { get; set; }
        public string twitterScreenNameFrom { get; set; }
        public string mailTo { get; set; }
        public string messageText { get; set; }
        public string subjectText { get; set; }
    }
}
