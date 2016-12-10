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
    public class FbPublicPagePost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string PageId { get; set; }
        public string FromId { get; set; }
        public string FromName { get; set; }
        public string Type { get; set; }
        public string StatusType { get; set; }
        public string PictureUrl { get; set; }
        public string LinkUrl { get; set; }
        public string IconUrl { get; set; }
        public string PostId { get; set; }
        public string Post { get; set; }
        public double PostDate { get; set; }
        public double EntryDate { get; set; }
        public int Likes { get; set; }
        public int Comments { get; set; }
        public int Shares { get; set; }
        public int UserLikes { get; set; }
    }
}
