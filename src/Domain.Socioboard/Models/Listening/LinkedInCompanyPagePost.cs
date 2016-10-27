using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Listening
{
    [BsonIgnoreExtraElements]
    public class LinkedInCompanyPagePost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string companyPagepost { get; set; }
        public string postImageurl { get; set; }
        public string comanyImageurl { get; set; }
        public string industry { get; set; }
        public string likeCount { get; set; }
        public string PostId { get; set; }
        public string commentCount { get; set; }
    }
}
