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
    public class InstagramComment
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }

        public string InstagramId { get; set; }

        public string FeedId { get; set; }
        public string CommentId { get; set; }
        public string Comment { get; set; }
        public double CommentDate { get; set; }
        public string FromName { get; set; }
        public string FromProfilePic { get; set; }
    }
}
