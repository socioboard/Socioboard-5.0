using Domain.Socioboard.Enum;
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

    public class FacebookPageFeedShare
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public long userId { get; set; }
        public string pageId { get; set; }
        public string socialProfiles { get; set; }
        public string socialmedia { get; set; }
        public RealTimeShareFeedStatus status { get; set; }
        public virtual DateTime lastsharestamp { get; set; }
        public virtual DateTime scheduleTime { get; set; }



    }
}
