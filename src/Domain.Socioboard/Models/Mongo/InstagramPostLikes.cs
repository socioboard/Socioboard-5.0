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
    public class InstagramPostLikes
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string Profile_Id { get; set; }
        public string Feed_Id { get; set; }
        public string Liked_By_Id { get; set; }
        public string Liked_By_Name { get; set; }
        public string Feed_Type { get; set; }
        public double Created_Date { get; set; }
        public int Status { get; set; }
    }
}
