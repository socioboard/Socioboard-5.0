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
    public class LinkedGroupPost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string GroupName { get; set; }
        public string profileName { get; set; }
        public string PosterUrl { get; set; }
        public string PosterImageUrl { get; set; }
        public string PostTitle { get; set; }
        public string Message { get; set; }
        public string postImgUrl { get; set; }
        public string PostedImagedescription { get; set; }
        public double DateTimeOfPost { get; set; }
    }
}
