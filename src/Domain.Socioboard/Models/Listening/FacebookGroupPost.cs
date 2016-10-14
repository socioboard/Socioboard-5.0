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
    public class FaceBookGroupPost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string GroupId { get; set; }
        public string GroupName { get; set; }
        public long PostId { get; set; }
        public string UserProfileId { get; set; }
        public string ProfileName { get; set; }
        public string ProfileImage { get; set; }
        public string Message { get; set; }
        public string postImgUrl { get; set; }
        public string videoTitle { get; set; }
        public string VideoSiteRedirectionUrl { get; set; }
        public string VideoDescription { get; set; }
        public string PostRedirectionImg { get; set; }
        public string websiteUrl { get; set; }
        public int NoOfLike { get; set; }
        public int NoOfComment { get; set; }
        public int NoOfShare { get; set; } //
        public double DateTimeOfPost { get; set; }
        public List<FacebookGroupPostComments> CommentDetails { get; set; }
        public List<FacebookGroupHashtagDetails> HashTag { get; set; }
    }
}
