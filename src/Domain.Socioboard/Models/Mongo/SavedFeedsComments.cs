using Domain.Socioboard.Enum;
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
    public class SavedFeedsComments
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId commentId { get; set; }
        public string strCommentId { get; set; }
        public string postId { get; set; }
        public string profileId { get; set; }
        public string commentText { get; set; }
        public double savedTime { get; set; }
        public long userId { get; set; }
        public long groupId { get; set; }
        public string userProfilePic { get; set; }
        public string userName { get; set; }
        public bool updateCommentStatus { get; set; }

    }
}