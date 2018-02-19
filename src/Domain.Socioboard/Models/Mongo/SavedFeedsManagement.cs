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
    public class SavedFeedsManagement
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string shareMessage { get; set; }
        public string postLink { get; set; }
        public double savedTime { get; set; }
        public ScheduledStatus status { get; set; }
        public bool review { get; set; }
        public long userId { get; set; }
        public string sbuserName { get; set; }
        public string sbuserPic { get; set; }
        public long groupId { get; set; }
        public SocialProfileType profileType { get; set; }
        public string socialProfileId { get; set; }
        public string picUrl { get; set; }
        public string SocialProfileName { get; set; }
        public string url { get; set; }//media url
        public string link { get; set; }
        public double calenderTime { get; set; }
        public MediaType mediaType { get; set; }
        
    }
}
