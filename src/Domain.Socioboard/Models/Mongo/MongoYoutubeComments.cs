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
    public class MongoYoutubeComments
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string ChannelId { get; set; }
        public string commentId { get; set; }
        public string videoId { get; set; }
        public string authorDisplayName { get; set; }
        public string authorProfileImageUrl { get; set; }
        public string authorChannelUrl { get; set; }
        public string authorChannelId { get; set; }
        public string commentDisplay { get; set; }
        public string commentOriginal { get; set; }
        public string viewerRating { get; set; }
        public string likesCount { get; set; }
        public string publishTime { get; set; }
        public string updatedTime { get; set; }
        public string totalReplyCount { get; set; }
        public string parentIdforReply { get; set; }
        public bool active { get; set; }
        public double publishTimeUnix { get; set; }
        public string sbGrpMemberEmail { get; set; }
        public string sbGrpMemberName { get; set; }
        public double sbGrpMemberUserid { get; set; }
        public double sbGrpAccessOwnerUserid { get; set; }
        public bool sbGrpTaskAssign { get; set; }
        public bool review { get; set; }
        public string reviewedBy { get; set; }


    }

    public class MongoYoutubeCommentsWtRepl
    {
        public MongoYoutubeComments _ParentComments { get; set; }
        public List<MongoYoutubeComments> _ChildComments { get; set; }
    }
}
