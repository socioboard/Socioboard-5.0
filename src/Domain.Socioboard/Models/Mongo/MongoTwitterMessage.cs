using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoTwitterMessage
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public string twitterMsg { get; set; }
        public string messageDate { get; set; }
        public double messageTimeStamp { get; set; } // unix time stamp of messageDate
        public string profileId { get; set; }
        public string fromId { get; set; }
        public string fromName { get; set; }
        public string fromProfileUrl { get; set; }
        public string screenName { get; set; }
        public string messageId { get; set; }
        public TwitterMessageType type { get; set; }
        public string inReplyToStatusUserId { get; set; }
        public string sourceUrl { get; set; }
        public string fromScreenName { get; set; }
        public int  FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        public int readStatus { get; set; }
        public int isArchived { get; set; }
        public double positive { get; set; }
        public double negative { get; set; }
        public string RecipientId { get; set; }
        public string RecipientName { get; set; }
        public string mediaUrl { get; set; }
    }
}
