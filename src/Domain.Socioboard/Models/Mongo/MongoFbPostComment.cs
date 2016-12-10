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
    public class MongoFbPostComment
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string PostId { get; set; }
        public string FromId { get; set; }
        public string FromName { get; set; }
        public string CommentId { get; set; }
        public string Comment { get; set; }
        public string PictureUrl { get; set; }
        public int Likes { get; set; }
        public int UserLikes { get; set; }
        public string Commentdate { get; set; }
        public string EntryDate { get; set; }

    }
}
