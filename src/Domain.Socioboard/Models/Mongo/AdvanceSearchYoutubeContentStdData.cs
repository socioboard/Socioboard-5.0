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
    public class AdvanceSearchYoutubeContentStdData
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string postDescription { get; set; }
        public AdvanceSearchpostType postType { get; set; }
        public NetworkType networkType { get; set; }
        public string postId { get; set; }
        public string domainType { get; set; }
        public string title { get; set; }
        public string userName { get; set; }
        public string videourl { get; set; }
        public string postedTime { get; set; }
        public string ImageUrl { get; set; }
        public string postUrl { get; set; }
        public long fbengagementCount { get; set; }
        public long twtShareCount { get; set; }
        public long linShareCount { get; set; }
        public long gplusShareCount { get; set; }
        public long pinShareCount { get; set; }
        public long redditShareCount { get; set; }
        public long totalShareCount { get; set; }
        public long retweetCount { get; set; }
        public long likeCount { get; set; }
        public long ytview { get; set; }
        public long ytlikeCount { get; set; }
        public long ytcommentCnt { get; set; }
        public string boardNameKeyword { get; set; }
        public long repliesCount { get; set; }
        public string linkedindescription { get; set; }
        public string linkedinprofileurl { get; set; }



    }
}
