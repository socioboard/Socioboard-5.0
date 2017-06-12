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
    public class FacebookPagePost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string PageId { get; set; }
        public string PageName { get; set; }
        public string PostId { get; set; }
        public string Message { get; set; }
        public string Picture { get; set; }
        public string Link { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Likes { get; set; }
        public string Comments { get; set; }
        public string Shares { get; set; }
        public string Reach { get; set; }
        public string Talking { get; set; }
        public string EngagedUsers { get; set; }
        public long CreatedTime { get; set; }
        public double Engagement { get; set; }
    }

    public class totalfbPagePostDetails
    {
        public string profileId { get; set; }
        public string name { get; set; }
        public string likes { get; set; }      
        public string commnets { get; set; }
        public string post { get; set; }
        public string talking { get; set; }
        public string shares { get; set; }
        public string message { get; set; }
        public string color { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
