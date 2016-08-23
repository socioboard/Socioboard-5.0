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
    public class SharethonPagePost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public virtual string Facebookpageid { get; set; }
        public virtual string Facebookaccountid { get; set; }
        public virtual double PostedTime { get; set; }
        public virtual string PostId { get; set; }

        public virtual string Facebookpagename { get; set; }
    }
}
