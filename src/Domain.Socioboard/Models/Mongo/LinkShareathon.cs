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
    public class LinkShareathon
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public virtual long Userid { get; set; }
        public virtual int TimeInterVal { get; set; }
        public virtual bool IsActive { get; set; }
        public virtual string FacebookPageUrl { get; set; }
        public virtual string Facebookusername { get; set; }
        public virtual string Facebookpageid { get; set; }
       
    }
    public class PageDetails
    {
        public string PageId { get; set; }
        public string PageUrl { get; set; }
    }
}
