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
    public class MongoFacebookFeed
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string FeedDescription { get; set; }
        public string FeedDate { get; set; }
        public string EntryDate { get; set; }
        public string ProfileId { get; set; }
        public string FromId { get; set; }
        public string FromName { get; set; }
        public string FromProfileUrl { get; set; }
        public string Type { get; set; }
        public string FbComment { get; set; }
        public string FbLike { get; set; }
        public string FeedId { get; set; }
        public int ReadStatus { get; set; }
        public string Picture { get; set; }
        public double Positive { get; set; }
        public double Negative { get; set; }
       
    }

    public class facebookfeed
    {
        public MongoFacebookFeed _facebookFeed { get; set; }
        public List<MongoFbPostComment> _facebookComment { get; set; }
    }
}
