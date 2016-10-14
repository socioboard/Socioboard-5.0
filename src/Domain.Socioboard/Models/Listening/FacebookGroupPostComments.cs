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
    public class FacebookGroupPostComments
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string GroupPostId { get; set; }
        public string Comment { get; set; }
        public string UserProfileName { get; set; }
        public string UserProfileImage { get; set; }
        public string LikesCount { get; set; }
    }
}
