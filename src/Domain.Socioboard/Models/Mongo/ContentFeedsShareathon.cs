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
    public class ContentFeedsShareathon
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string FbPageId { get; set; }
        public long UserId { get; set; }
        public string postdescription { get; set; }
        public NetworkType networkType { get; set; }
        public string postId { get; set; }
        public string title { get; set; }
        public string facebookAccount { get; set; }
        public string videourl { get; set; }
        public string ImageUrl { get; set; }
        public string postUrl { get; set; }
        public double postedTime { get; set; }
        public bool Status { get; set; }
        public DateTime latsSharetime { get; set; }
        public int Timeintervalminutes { get; set; }
        public double lastsharestamp { get; set; }

    }

    public class postdata
    {
        public string fbuserIds { get; set; }
        public int timeIntervals { get; set; }
        public List<Domain.Socioboard.Models.Mongo.ContentFeedsShareathon> shareData { get; set; }
    }
}
