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
    public class ContentStudioShareathonIdData
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string FbPageId { get; set; }
        public long UserId { get; set; }      
        public string postId { get; set; }
      
        public bool Status { get; set; }
        public virtual int Timeintervalminutes { get; set; }
        public virtual double lastsharestamp { get; set; }
    }
}
